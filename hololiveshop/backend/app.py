import time, jwt, os
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel, Field, EmailStr
from pydantic_settings import BaseSettings
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic_core import core_schema
import stripe
from typing import Any
class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "shopdb"
    JWT_SECRET: str = "replace"
    STRIPE_SECRET: Optional[str] = None
    class Config:
        env_file = ".env"
settings = Settings()

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.DB_NAME]

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(x: str) -> str:
    return pwd_ctx.hash(x)

def verify_password(p: str, h: str) -> bool:
    return pwd_ctx.verify(p, h)

def create_token(sub: str) -> str:
    now = int(time.time())
    return jwt.encode({"sub": sub, "iat": now, "exp": now + 60*60*24*7}, settings.JWT_SECRET, algorithm="HS256")

def decode_token(token: str):
    return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])

def oid(x):
    return ObjectId(x) if not isinstance(x, ObjectId) else x

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema: core_schema.CoreSchema, _handler: Any) -> dict[str, Any]:
        return {"type": "string", "pattern": "^[a-f\\d]{24}$"}

class Address(BaseModel):
    full_name: str
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str] = None

class PaymentProfile(BaseModel):
    provider: str
    token: str
    last4: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    email: EmailStr
    password_hash: str
    addresses: List[Address] = []
    payment_profiles: List[PaymentProfile] = []
    is_admin: bool = False

class Category(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    slug: str

class Variant(BaseModel):
    sku: str
    size: Optional[str] = None
    color: Optional[str] = None
    price: float
    stock: int

class Product(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    description: str
    images: List[str] = []
    category_id: PyObjectId
    variants: List[Variant]
    active: bool = True

class CartItem(BaseModel):
    product_id: PyObjectId
    sku: str
    quantity: int

class Cart(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    session_id: str
    user_id: Optional[PyObjectId] = None
    items: List[CartItem] = []

class OrderItem(BaseModel):
    product_id: PyObjectId
    sku: str
    quantity: int
    price: float

class Order(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: Optional[PyObjectId] = None
    session_id: str
    items: List[OrderItem]
    address: Address
    payment: Optional[PaymentProfile] = None
    total: float
    status: str = "pending"
    created_at: int

async def require_session(x_session_id: Optional[str] = Header(None)):
    if not x_session_id:
        raise HTTPException(400, "missing session")
    return x_session_id

async def get_user_from_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    try:
        payload = decode_token(parts[1])
        uid = ObjectId(payload["sub"])
        u = await db.users.find_one({"_id": uid})
        return u
    except:
        return None

if settings.STRIPE_SECRET:
    stripe.api_key = settings.STRIPE_SECRET

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.post("/auth/register")
async def register(data: UserCreate):
    e = await db.users.find_one({"email": data.email})
    if e:
        raise HTTPException(400)
    u = User(email=data.email, password_hash=hash_password(data.password))
    r = await db.users.insert_one(u.model_dump(by_alias=True, exclude_none=True))
    return {"token": create_token(str(r.inserted_id))}

@app.post("/auth/login")
async def login(data: UserCreate):
    u = await db.users.find_one({"email": data.email})
    if not u or not verify_password(data.password, u["password_hash"]):
        raise HTTPException(401)
    return {"token": create_token(str(u["_id"]))}

@app.get("/me")
async def me(user=Depends(get_user_from_token)):
    if not user:
        raise HTTPException(401)
    return {
        "email": user["email"],
        "addresses": user.get("addresses", []),
        "payment_profiles": user.get("payment_profiles", []),
        "is_admin": user.get("is_admin", False)
    }

@app.post("/me/address")
async def add_address(addr: Address, user=Depends(get_user_from_token)):
    if not user:
        raise HTTPException(401)
    await db.users.update_one({"_id": user["_id"]}, {"$push": {"addresses": addr.model_dump()}})
    return {"ok": True}

@app.post("/me/payment")
async def add_payment(p: PaymentProfile, user=Depends(get_user_from_token)):
    if not user:
        raise HTTPException(401)
    await db.users.update_one({"_id": user["_id"]}, {"$push": {"payment_profiles": p.model_dump()}})
    return {"ok": True}

@app.post("/categories")
async def create_category(cat: Category, user=Depends(get_user_from_token)):
    if not user or not user.get("is_admin"):
        raise HTTPException(403)
    r = await db.categories.insert_one(cat.model_dump(by_alias=True, exclude_none=True))
    return {"_id": str(r.inserted_id)}

@app.get("/categories")
async def list_categories():
    cur = db.categories.find({})
    return [{"_id": str(x["_id"]), "name": x["name"], "slug": x["slug"]} async for x in cur]

@app.post("/products")
async def create_product(p: Product, user=Depends(get_user_from_token)):
    if not user or not user.get("is_admin"):
        raise HTTPException(403)
    r = await db.products.insert_one(p.model_dump(by_alias=True, exclude_none=True))
    return {"_id": str(r.inserted_id)}

@app.get("/products")
async def list_products(q: str = "", category: str = "", page: int = 1, limit: int = 12, min_price: float | None = None, max_price: float | None = None, color: str = "", size: str = ""):
    f = {"active": True}
    if q:
        f["title"] = {"$regex": q, "$options": "i"}
    if category:
        f["category_id"] = oid(category)
    if color:
        f["variants.color"] = color
    if size:
        f["variants.size"] = size
    if min_price is not None or max_price is not None:
        pf = {}
        if min_price is not None:
            pf["$gte"] = min_price
        if max_price is not None:
            pf["$lte"] = max_price
        f["variants.price"] = pf
    total = await db.products.count_documents(f)
    cur = db.products.find(f).skip((page-1)*limit).limit(limit)
    items = []
    async for x in cur:
        x["_id"] = str(x["_id"])
        x["category_id"] = str(x["category_id"])
        items.append(x)
    return {"total": total, "page": page, "limit": limit, "items": items}

@app.get("/products/{pid}")
async def get_product(pid: str):
    x = await db.products.find_one({"_id": oid(pid), "active": True})
    if not x:
        raise HTTPException(404)
    x["_id"] = str(x["_id"])
    x["category_id"] = str(x["category_id"])
    return x

@app.put("/products/{pid}")
async def update_product(pid: str, p: dict, user=Depends(get_user_from_token)):
    if not user or not user.get("is_admin"):
        raise HTTPException(403)
    await db.products.update_one({"_id": oid(pid)}, {"$set": p})
    return {"ok": True}

@app.post("/cart/items")
async def add_to_cart(item: CartItem, session_id=Depends(require_session), user=Depends(get_user_from_token)):
    product = await db.products.find_one({"_id": item.product_id, "active": True, "variants": {"$elemMatch": {"sku": item.sku}}})
    if not product:
        raise HTTPException(404)
    c = await db.carts.find_one({"session_id": session_id})
    if not c:
        c = Cart(session_id=session_id, user_id=user["_id"] if user else None, items=[])
        await db.carts.insert_one(c.model_dump(by_alias=True, exclude_none=True))
    await db.carts.update_one({"session_id": session_id, "items.sku": {"$ne": item.sku}}, {"$push": {"items": item.model_dump()}}, upsert=True)
    await db.carts.update_one({"session_id": session_id, "items.sku": item.sku}, {"$inc": {"items.$.quantity": item.quantity}})
    return {"ok": True}

@app.get("/cart")
async def get_cart(session_id=Depends(require_session)):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        return {"items": [], "subtotal": 0}
    out = []
    subtotal = 0
    for it in cart.get("items", []):
        p = await db.products.find_one({"_id": it["product_id"]})
        v = next(v for v in p["variants"] if v["sku"] == it["sku"])
        price = v["price"] * it["quantity"]
        subtotal += price
        out.append({"product_id": str(it["product_id"]), "sku": it["sku"], "quantity": it["quantity"], "title": p["title"], "image": p["images"][0] if p.get("images") else "", "price": v["price"]})
    return {"items": out, "subtotal": round(subtotal, 2)}

@app.put("/cart/items/{sku}")
async def update_cart_qty(sku: str, quantity: int = Body(..., embed=True), session_id=Depends(require_session)):
    if quantity <= 0:
        await db.carts.update_one({"session_id": session_id}, {"$pull": {"items": {"sku": sku}}})
    else:
        await db.carts.update_one({"session_id": session_id, "items.sku": sku}, {"$set": {"items.$.quantity": quantity}})
    return {"ok": True}

@app.delete("/cart/items/{sku}")
async def remove_cart_item(sku: str, session_id=Depends(require_session)):
    await db.carts.update_one({"session_id": session_id}, {"$pull": {"items": {"sku": sku}}})
    return {"ok": True}

@app.post("/orders/checkout")
async def checkout(address: Address, session_id: str = Header(...)):
    cart = await db.carts.find_one({"_id": session_id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total = 0

    for it in cart["items"]:
        product = await db.products.find_one({"_id": it["product_id"]})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product["stock"] < it["quantity"]:
            raise HTTPException(status_code=400, detail="Not enough stock")

        await db.products.update_one(
            {"_id": it["product_id"]},
            {"$inc": {"stock": -it["quantity"]}}
        )

        order_items.append({
            "product_id": str(it["product_id"]),
            "name": product["name"],
            "quantity": it["quantity"],
            "price": product["price"]
        })
        total += product["price"] * it["quantity"]

    order = {
        "items": order_items,
        "total": total,
        "address": address.dict(),
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    result = await db.orders.insert_one(order)
    await db.carts.update_one({"_id": session_id}, {"$set": {"items": []}})

    return {
        "order_id": str(result.inserted_id),  # ✅ fix: return order_id
        **order
    }



@app.post("/payments/create-intent")
async def create_payment_intent(amount: float):
    if not settings.STRIPE_SECRET:
        raise HTTPException(400)
    intent = stripe.PaymentIntent.create(amount=int(amount*100), currency="usd", automatic_payment_methods={"enabled": True})
    return {"client_secret": intent.client_secret}

@app.get("/orders")
async def list_my_orders(user=Depends(get_user_from_token), session_id=Depends(require_session)):
    f = {"$or": [{"session_id": session_id}, {"user_id": user["_id"] if user else None}]}
    cur = db.orders.find(f).sort("created_at", -1)
    res = []
    async for x in cur:
        x["_id"] = str(x["_id"])
        if x.get("user_id"):
            x["user_id"] = str(x["user_id"])
        for it in x["items"]:
            it["product_id"] = str(it["product_id"])
        res.append(x)
    return res

@app.get("/admin/orders")
async def admin_orders(user=Depends(get_user_from_token), status: str = ""):
    if not user or not user.get("is_admin"):
        raise HTTPException(403)
    f = {}
    if status:
        f["status"] = status
    cur = db.orders.find(f).sort("created_at", -1)
    res = []
    async for x in cur:
        x["_id"] = str(x["_id"])
        res.append(x)
    return res

@app.put("/admin/orders/{oid}/status")
async def update_order_status(oid: str, status: str = Body(..., embed=True), user=Depends(get_user_from_token)):
    if not user or not user.get("is_admin"):
        raise HTTPException(403)
    await db.orders.update_one({"_id": oid(oid)}, {"$set": {"status": status}})
    return {"ok": True}

@app.put("/admin/users/{uid}/admin")
async def set_admin(uid: str, is_admin: bool = Body(..., embed=True), user=Depends(get_user_from_token)):
    if not user or not user.get("is_admin"):
        raise HTTPException(403)
    await db.users.update_one({"_id": oid(uid)}, {"$set": {"is_admin": is_admin}})
    return {"ok": True}
