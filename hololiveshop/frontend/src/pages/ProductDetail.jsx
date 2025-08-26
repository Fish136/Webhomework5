import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct, addToCart } from '../api'

export default function ProductDetail({onCartChange}){
  const {id}=useParams()
  const [p,setP]=useState(null)
  const [sku,setSku]=useState('')
  const [qty,setQty]=useState(1)
  useEffect(()=>{getProduct(id).then(x=>{setP(x);setSku(x.variants[0]?.sku||'')})},[id])
  if(!p)return null
  const v=p.variants.find(v=>v.sku===sku)
  async function add(){
    await addToCart({product_id:p._id,sku,quantity:qty})
    onCartChange&&onCartChange()
  }
  return (
    <div className="grid-2">
      <div className="gallery">
        <img src={p.images[0]||'https://picsum.photos/seed/'+p._id+'/600/400'} alt=""/>
        <img src={p.images[1]||'https://picsum.photos/seed/'+p._id+'b/600/400'} alt=""/>
      </div>
      <div className="col">
        <h2>{p.title}</h2>
        <div>{p.description}</div>
        <div className="row">
          <select className="select" value={sku} onChange={e=>setSku(e.target.value)}>
            {p.variants.map(v=><option key={v.sku} value={v.sku}>{(v.size||'')+(v.color?(' '+v.color):'')} • ${v.price.toFixed(2)} • {v.stock} left</option>)}
          </select>
          <input className="input" type="number" min="1" value={qty} onChange={e=>setQty(parseInt(e.target.value||'1',10))}/>
        </div>
        <div className="row">
          <div className="price">${v? v.price.toFixed(2):'0.00'}</div>
          <button className="btn" onClick={add} disabled={!v || v.stock<qty}>Add to Cart</button>
        </div>
      </div>
    </div>
  )
}
