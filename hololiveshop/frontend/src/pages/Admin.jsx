import React, { useEffect, useState } from 'react'
import { login, me, listProducts, createProduct, updateProduct, listCategories, createCategory, adminOrders, setOrderStatus } from '../api'
import { seedDatabase } from "../seed"

export default function Admin(){
  const [token,setToken]=useState(localStorage.getItem('token')||'')
  const [user,setUser]=useState(null)
  const [cats,setCats]=useState([])
  const [products,setProducts]=useState([])
  const [form,setForm]=useState({title:'',description:'',images:[],category_id:'',variants:[]})
  const [varForm,setVarForm]=useState({sku:'',size:'',color:'',price:'',stock:''})
  const [orders,setOrders]=useState([])
  async function load(){
    if(!token)return
    const u=await me(token);setUser(u)
    const c=await listCategories();setCats(c)
    const p=await listProducts({page:1,limit:50});setProducts(p.items)
    const os=await adminOrders(token);setOrders(os)
  }
  useEffect(()=>{load()},[token])
  if(!token)return <div>Login as admin from Login page.</div>
  if(!user?.is_admin)return <div>Access denied.</div>
  function addVariant(){if(!varForm.sku||!varForm.price||!varForm.stock)return;setForm({...form,variants:[...form.variants,{sku:varForm.sku,size:varForm.size||null,color:varForm.color||null,price:parseFloat(varForm.price),stock:parseInt(varForm.stock,10)}]});setVarForm({sku:'',size:'',color:'',price:'',stock:''})}
  async function saveProduct(){if(!form.title||!form.category_id||form.variants.length===0)return;await createProduct(token,{...form});setForm({title:'',description:'',images:[],category_id:'',variants:[]});await load()}
  async function saveCategory(n,s){await createCategory(token,{name:n,slug:s});await load()}
  async function setStatus(id,status){await setOrderStatus(token,id,status);await load()}
  return (
    <div className="col">
      <h2>Admin</h2>
      <button className="btn" onClick={() => seedDatabase(token)}>Seed Mock Data</button>
      <div className="admin-grid">
        <div className="panel col">
          <h3>Create Category</h3>
          <div className="row">
            <input className="input" placeholder="Name" id="catn"/>
            <input className="input" placeholder="Slug" id="cats"/>
            <button className="btn" onClick={()=>saveCategory(document.getElementById('catn').value,document.getElementById('cats').value)}>Save</button>
          </div>
          <h3>Create Product</h3>
          <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <textarea className="input" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          <input className="input" placeholder="Image URL 1" onChange={e=>setForm({...form,images:[e.target.value]})}/>
          <select className="select" value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
            <option value="">Select Category</option>
            {cats.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div className="row">
            <input className="input" placeholder="SKU" value={varForm.sku} onChange={e=>setVarForm({...varForm,sku:e.target.value})}/>
            <input className="input" placeholder="Size" value={varForm.size} onChange={e=>setVarForm({...varForm,size:e.target.value})}/>
            <input className="input" placeholder="Color" value={varForm.color} onChange={e=>setVarForm({...varForm,color:e.target.value})}/>
          </div>
          <div className="row">
            <input className="input" type="number" placeholder="Price" value={varForm.price} onChange={e=>setVarForm({...varForm,price:e.target.value})}/>
            <input className="input" type="number" placeholder="Stock" value={varForm.stock} onChange={e=>setVarForm({...varForm,stock:e.target.value})}/>
            <button className="btn" onClick={addVariant}>Add Variant</button>
          </div>
          <div>{form.variants.map(v=><span key={v.sku} className="badge" style={{marginRight:6}}>{v.sku} {v.size} {v.color} ${v.price} x{v.stock}</span>)}</div>
          <button className="btn" onClick={saveProduct}>Save Product</button>
          <h4>Products</h4>
          <table className="table">
            <thead><tr><th>Title</th><th>Active</th><th>Total Stock</th></tr></thead>
            <tbody>{products.map(p=><tr key={p._id}><td>{p.title}</td><td>{String(p.active)}</td><td>{p.variants.reduce((a,v)=>a+v.stock,0)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="panel col">
          <h3>Orders</h3>
          <table className="table">
            <thead><tr><th>ID</th><th>Status</th><th>Total</th><th>Updated</th></tr></thead>
            <tbody>
              {orders.map(o=><tr key={o._id}>
                <td>{o._id}</td>
                <td>
                  <select className="select" defaultValue={o.status} onChange={e=>setStatus(o._id,e.target.value)}>
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="shipped">shipped</option>
                    <option value="completed">completed</option>
                    <option value="canceled">canceled</option>
                  </select>
                </td>
                <td>${o.total.toFixed(2)}</td>
                <td>{new Date(o.created_at*1000).toLocaleString()}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
