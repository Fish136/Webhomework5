import React, { useEffect, useState } from 'react'
import { listProducts, addToCart, listCategories } from '../api'
import { Link, useSearchParams } from 'react-router-dom'

export default function ProductList({onCartChange}){
  const [items,setItems]=useState([])
  const [total,setTotal]=useState(0)
  const [cats,setCats]=useState([])
  const [params,setParams]=useSearchParams()
  const [q,setQ]=useState(params.get('q')||'')
  const [category,setCategory]=useState(params.get('category')||'')
  const [color,setColor]=useState(params.get('color')||'')
  const [size,setSize]=useState(params.get('size')||'')
  const [minPrice,setMinPrice]=useState(params.get('min_price')||'')
  const [maxPrice,setMaxPrice]=useState(params.get('max_price')||'')
  const page=parseInt(params.get('page')||'1',10)
  const limit=12
  async function load(){
    const res=await listProducts({q,category,page,limit,min_price:minPrice||undefined,max_price:maxPrice||undefined,color,size})
    setItems(res.items||[]);setTotal(res.total||0)
  }
  async function loadCats(){setCats(await listCategories())}
  useEffect(()=>{load();loadCats()},[params])
  function apply(){
    const n=new URLSearchParams()
    if(q)n.set('q',q)
    if(category)n.set('category',category)
    if(color)n.set('color',color)
    if(size)n.set('size',size)
    if(minPrice)n.set('min_price',minPrice)
    if(maxPrice)n.set('max_price',maxPrice)
    n.set('page','1')
    setParams(n)
  }
  async function add(p){
    const v=p.variants[0]
    await addToCart({product_id:p._id,sku:v.sku,quantity:1})
    onCartChange&&onCartChange()
  }
  const pages=Math.ceil(total/limit)
  return (
    <div className="col">
      <div className="panel">
        <div className="grid-2">
          <input className="input" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)}/>
          <div className="row" style={{gap:8}}>
            <select className="select" value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {cats.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input className="input" placeholder="Color" value={color} onChange={e=>setColor(e.target.value)}/>
            <input className="input" placeholder="Size" value={size} onChange={e=>setSize(e.target.value)}/>
            <input className="input" placeholder="Min Price" value={minPrice} onChange={e=>setMinPrice(e.target.value)}/>
            <input className="input" placeholder="Max Price" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/>
            <button className="btn" onClick={apply}>Apply</button>
          </div>
        </div>
      </div>
      <div className="grid">
        {items.map(p=>(
          <div key={p._id} className="card">
            <img src={p.images[0]||'https://picsum.photos/seed/'+p._id+'/600/400'} alt=""/>
            <div className="p col">
              <Link className="link" to={`/product/${p._id}`}>{p.title}</Link>
              <div className="row"><div className="price">${p.variants[0]?.price?.toFixed(2)}</div><div className="badge">{p.variants.reduce((a,v)=>a+v.stock,0)} in stock</div></div>
              <div className="row">
                <button className="btn" onClick={()=>add(p)}>Add to Cart</button>
                <Link className="btn alt" to={`/product/${p._id}`}>View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        {Array.from({length:pages},(_,i)=>i+1).map(n=><button key={n} className="btn alt" onClick={()=>{const x=new URLSearchParams(params);x.set('page',String(n));setParams(x)}} disabled={n===page}>{n}</button>)}
      </div>
    </div>
  )
}
