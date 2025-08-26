import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import "./styles.css";

function Gate() {
  const { user } = useAuth();
  const [isLogin, setIsLogin] = React.useState(true);
  if (!user) return isLogin ? <Login onSwitch={()=>setIsLogin(false)} /> : <Register onSwitch={()=>setIsLogin(true)} />;
  return <Chat />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </React.StrictMode>
);
