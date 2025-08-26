import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getCart } from "./api";
import Navbar from "./components/Navbar";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext.jsx";

export default function App() {
  const [cartCount, setCartCount] = useState(0);

  async function refreshCart() {
    const c = await getCart();
    setCartCount(c.items.reduce((a, b) => a + b.quantity, 0));
  }

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <AuthProvider>
      <Navbar cartCount={cartCount} />
      <div className="container page">
        <Routes>
          <Route path="/" element={<ProductList onCartChange={refreshCart} />} />
          <Route path="/product/:id" element={<ProductDetail onCartChange={refreshCart} />} />
          <Route path="/cart" element={<Cart onCartChange={refreshCart} />} />
          <Route path="/checkout" element={<Checkout onCartChange={refreshCart} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
