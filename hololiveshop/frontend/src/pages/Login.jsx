import React, { useState } from 'react'
import { login } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')
  const nav=useNavigate()
  async function submit(){
    try{
      const r=await login(email,password)
      localStorage.setItem('token',r.token)
      setErr('')
      nav('/dashboard')
    }catch(e){setErr('Invalid credentials')}
  }
  return (
    <div className="col">
      <h2>Login</h2>
      <div className="form">
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
        {err?<div style={{color:'crimson'}}>{err}</div>:null}
        <button className="btn" onClick={submit}>Login</button>
      </div>
    </div>
  )
}
