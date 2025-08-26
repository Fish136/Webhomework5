import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "../styles.css";

export default function Register({ onSwitch }) {
  const { register } = useAuth();
  const [username, setU] = useState("");
  const [email, setE] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");
  const submit = async (e)=> {
    e.preventDefault();
    setError("");
    try { await register(username, email, password); } catch (e) { setError(e.response?.data?.message || "Register failed"); }
  };
  return (
    <div className="container">
      <div className="card">
        <h2>Create account</h2>
        <form onSubmit={submit}>
          <input className="input" placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={e=>setE(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
          <button className="btn primary" type="submit">Register</button>
        </form>
        {error && <p style={{color:"#f87171"}}>{error}</p>}
        <p>Have an account? <a href="#" onClick={(e)=>{e.preventDefault(); onSwitch();}}>Sign in</a></p>
      </div>
    </div>
  );
}
