import React, { useEffect, useState } from 'react'
import { me, myOrders, addAddress, addPayment } from '../api'

export default function Dashboard(){
  const [token,setToken]=useState(localStorage.getItem('token')||'')
  const [user,setUser]=useState(null)
  const [orders,setOrders]=useState([])
  const [addr,setAddr]=useState({full_name:'',line1:'',line2:'',city:'',state:'',postal_code:'',country:'',phone:''})
  const [pm,setPm]=useState({provider:'card',token:'tok_xxx',last4:'4242'})
  async function load(){
    if(!token)return
    const u=await me(token);setUser(u)
    const o=await myOrders(token);setOrders(o)
  }
  useEffect(()=>{load()},[token])
  async function saveAddr(){await addAddress(token,addr);await load()}
  async function savePay(){await addPayment(token,pm);await load()}
  if(!token)return <div>Login to view your dashboard.</div>
  return (
    <div className="col">
      <h2>My Account</h2>
      <div className="panel">
        <div>Email: {user?.email}</div>
        <div className="grid-2" style={{marginTop:12}}>
          <div className="col">
            <h3>Addresses</h3>
            <div className="form">
              <input className="input" placeholder="Full Name" value={addr.full_name} onChange={e=>setAddr({...addr,full_name:e.target.value})}/>
              <input className="input" placeholder="Line 1" value={addr.line1} onChange={e=>setAddr({...addr,line1:e.target.value})}/>
              <input className="input" placeholder="Line 2" value={addr.line2} onChange={e=>setAddr({...addr,line2:e.target.value})}/>
              <input className="input" placeholder="City" value={addr.city} onChange={e=>setAddr({...addr,city:e.target.value})}/>
              <input className="input" placeholder="State" value={addr.state} onChange={e=>setAddr({...addr,state:e.target.value})}/>
              <input className="input" placeholder="Postal Code" value={addr.postal_code} onChange={e=>setAddr({...addr,postal_code:e.target.value})}/>
              <input className="input" placeholder="Country" value={addr.country} onChange={e=>setAddr({...addr,country:e.target.value})}/>
              <input className="input" placeholder="Phone" value={addr.phone} onChange={e=>setAddr({...addr,phone:e.target.value})}/>
              <button className="btn" onClick={saveAddr}>Add Address</button>
            </div>
          </div>
          <div className="col">
            <h3>Payment Profiles</h3>
            <div className="form">
              <input className="input" placeholder="Provider" value={pm.provider} onChange={e=>setPm({...pm,provider:e.target.value})}/>
              <input className="input" placeholder="Token" value={pm.token} onChange={e=>setPm({...pm,token:e.target.value})}/>
              <input className="input" placeholder="Last 4" value={pm.last4} onChange={e=>setPm({...pm,last4:e.target.value})}/>
              <button className="btn" onClick={savePay}>Add Payment</button>
            </div>
          </div>
        </div>
      </div>
      <h3>Orders</h3>
      <div className="panel">
        <table className="table">
          <thead><tr><th>ID</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
          <tbody>
            {orders.map(o=><tr key={o._id}><td>{o._id}</td><td>{o.status}</td><td>${o.total.toFixed(2)}</td><td>{new Date(o.created_at*1000).toLocaleString()}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
