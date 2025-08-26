import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "../styles.css";

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");
  const submit = async (e)=> {
    e.preventDefault();
    setError("");
    try { await login(username, password); } catch (e) { setError(e.response?.data?.message || "Login failed"); }
  };
  return (
    <div className="container">
      <div className="card">
        <h2>Sign in</h2>
        <form onSubmit={submit}>
          <input className="input" placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
          <button className="btn primary" type="submit">Login</button>
        </form>
        {error && <p style={{color:"#f87171"}}>{error}</p>}
        <p>New here? <a href="#" onClick={(e)=>{e.preventDefault(); onSwitch();}}>Create an account</a></p>
      </div>
    </div>
  );
}
