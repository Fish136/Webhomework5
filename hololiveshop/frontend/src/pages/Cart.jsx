import React, { useEffect, useState } from 'react'
import { getCart, setQty, removeItem } from '../api'
import { Link, useNavigate } from 'react-router-dom'

export default function Cart({onCartChange}){
  const [c,setC]=useState({items:[],subtotal:0})
  const nav=useNavigate()
  async function load(){setC(await getCart())}
  useEffect(()=>{load()},[])
  async function upd(sku,q){await setQty(sku,q);await load();onCartChange&&onCartChange()}
  async function rem(sku){await removeItem(sku);await load();onCartChange&&onCartChange()}
  return (
    <div className="col">
      <table className="table">
        <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
        <tbody>
          {c.items.map(it=><tr key={it.sku}>
            <td>{it.title}</td>
            <td>${it.price.toFixed(2)}</td>
            <td><input className="input" style={{maxWidth:80}} type="number" min="1" value={it.quantity} onChange={e=>upd(it.sku,parseInt(e.target.value||'1',10))}/></td>
            <td>${(it.price*it.quantity).toFixed(2)}</td>
            <td><button className="btn alt" onClick={()=>rem(it.sku)}>Remove</button></td>
          </tr>)}
        </tbody>
      </table>
      <div className="row" style={{justifyContent:'space-between'}}>
        <div className="price">Subtotal: ${c.subtotal.toFixed(2)}</div>
        <button className="btn" onClick={()=>nav('/checkout')} disabled={c.items.length===0}>Checkout</button>
      </div>
    </div>
  )
}
