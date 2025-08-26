import React, { useEffect, useState } from 'react'
import { checkout, getCart } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Checkout({onCartChange}){
  const [addr,setAddr]=useState({full_name:'',line1:'',line2:'',city:'',state:'',postal_code:'',country:'',phone:''})
  const [sub,setSub]=useState(0)
  const nav=useNavigate()
  useEffect(()=>{getCart().then(x=>setSub(x.subtotal||0))},[])
  function valid(){return addr.full_name&&addr.line1&&addr.city&&addr.state&&addr.postal_code&&addr.country}
  async function submit(){
    if(!valid())return
    const r=await checkout(addr)
    onCartChange&&onCartChange()
    nav('/dashboard?placed='+r.order_id)
  }
  return (
    <div className="col">
      <h2>Checkout</h2>
      <div className="panel">
        <div className="form">
          <input className="input" placeholder="Full Name" value={addr.full_name} onChange={e=>setAddr({...addr,full_name:e.target.value})}/>
          <input className="input" placeholder="Address Line 1" value={addr.line1} onChange={e=>setAddr({...addr,line1:e.target.value})}/>
          <input className="input" placeholder="Address Line 2" value={addr.line2} onChange={e=>setAddr({...addr,line2:e.target.value})}/>
          <div className="grid-2">
            <input className="input" placeholder="City" value={addr.city} onChange={e=>setAddr({...addr,city:e.target.value})}/>
            <input className="input" placeholder="State/Province" value={addr.state} onChange={e=>setAddr({...addr,state:e.target.value})}/>
          </div>
          <div className="grid-2">
            <input className="input" placeholder="Postal Code" value={addr.postal_code} onChange={e=>setAddr({...addr,postal_code:e.target.value})}/>
            <input className="input" placeholder="Country" value={addr.country} onChange={e=>setAddr({...addr,country:e.target.value})}/>
          </div>
          <input className="input" placeholder="Phone" value={addr.phone} onChange={e=>setAddr({...addr,phone:e.target.value})}/>
          <div className="row" style={{justifyContent:'space-between',marginTop:8}}>
            <div className="price">Total: ${sub.toFixed(2)}</div>
            <button className="btn" onClick={submit} disabled={!valid()}>Place Order</button>
          </div>
        </div>
      </div>
    </div>
  )
}
