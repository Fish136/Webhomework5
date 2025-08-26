import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ cartCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="header">
      <div className="row">
        <Link className="brand" to="/">Shop</Link>
        <div className="nav">
          <Link to="/">Products</Link>
          {user && <Link to="/dashboard">My Account</Link>}
          {user && <Link to="/admin">Admin</Link>}
        </div>
      </div>
      <div className="row">
        {user ? (
          <>
            <span style={{ marginRight: "1rem" }}>{user.email || user.username || "Signed in"}</span>
            <button className="btn alt" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="btn alt" to="/login">Login</Link>
            <Link className="btn alt" to="/register">Register</Link>
          </>
        )}
        <Link className="btn" to="/cart">Cart ({cartCount})</Link>
      </div>
    </div>
  );
}
