const API = import.meta.env.VITE_API || "http://localhost:8000";

function sid() {
  let x = localStorage.getItem("sid");
  if (!x) {
    x = crypto.randomUUID();
    localStorage.setItem("sid", x);
  }
  return x;
}

function h(t) {
  const z = { "X-Session-Id": sid() };
  if (t) z.Authorization = "Bearer " + t;
  return z;
}

export async function login(email, password) {
  const r = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("login");
  return r.json();
}

export async function register(email, password) {
  const r = await fetch(API + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("register");
  return r.json();
}

export async function me(token) {
  const r = await fetch(API + "/me", { headers: h(token) });
  if (!r.ok) throw new Error("me");
  return r.json();
}

export async function addAddress(token, addr) {
  const r = await fetch(API + "/me/address", {
    method: "POST",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(addr),
  });
  if (!r.ok) throw new Error("addr");
  return r.json();
}

export async function addPayment(token, p) {
  const r = await fetch(API + "/me/payment", {
    method: "POST",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error("pay");
  return r.json();
}

export async function listCategories() {
  const r = await fetch(API + "/categories");
  return r.json();
}

export async function createCategory(token, cat) {
  const r = await fetch(API + "/categories", {
    method: "POST",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(cat),
  });
  if (!r.ok) throw new Error("cat");
  return r.json();
}

export async function listProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = API + "/products" + (query.toString() ? "?" + query.toString() : "");
  const r = await fetch(url);
  if (!r.ok) throw new Error("list products");
  return r.json();
}

export async function getProduct(id) {
  const r = await fetch(API + "/products/" + id);
  if (!r.ok) throw new Error("product");
  return r.json();
}

export async function createProduct(token, p) {
  const r = await fetch(API + "/products", {
    method: "POST",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error("prod");
  return r.json();
}

export async function updateProduct(token, id, p) {
  const r = await fetch(API + "/products/" + id, {
    method: "PUT",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error("upd");
  return r.json();
}

export async function getCart() {
  const r = await fetch(API + "/cart", { headers: h() });
  return r.json();
}

export async function addToCart(item) {
  const r = await fetch(API + "/cart/items", {
    method: "POST",
    headers: { ...h(), "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!r.ok) throw new Error("add");
  return r.json();
}

export async function setQty(sku, quantity) {
  const r = await fetch(API + "/cart/items/" + sku, {
    method: "PUT",
    headers: { ...h(), "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  return r.json();
}

export async function removeItem(sku) {
  const r = await fetch(API + "/cart/items/" + sku, { method: "DELETE", headers: h() });
  return r.json();
}

export async function checkout(addr) {
  const r = await fetch(API + "/orders/checkout", {
    method: "POST",
    headers: { ...h(), "Content-Type": "application/json" },
    body: JSON.stringify(addr),
  });
  if (!r.ok) throw new Error("checkout");
  return r.json();
}

export async function myOrders(token) {
  const r = await fetch(API + "/orders", { headers: h(token) });
  return r.json();
}

export async function adminOrders(token, status = "") {
  const q = status ? "?status=" + encodeURIComponent(status) : "";
  const r = await fetch(API + "/admin/orders" + q, { headers: h(token) });
  if (!r.ok) throw new Error("aorders");
  return r.json();
}

export async function setOrderStatus(token, id, status) {
  const r = await fetch(API + "/admin/orders/" + id + "/status", {
    method: "PUT",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error("ostatus");
  return r.json();
}

export async function setAdmin(token, uid, is_admin) {
  const r = await fetch(API + "/admin/users/" + uid + "/admin", {
    method: "PUT",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify({ is_admin }),
  });
  if (!r.ok) throw new Error("admin");
  return r.json();
}
