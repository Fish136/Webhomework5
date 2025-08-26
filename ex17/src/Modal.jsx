import React from "react";
import ReactDOM from "react-dom";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose} // Close when clicking overlay
    >
      <div
        style={{
          background: "white",
          color: "black",           
          padding: "20px",
          borderRadius: "8px",
          minWidth: "300px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent overlay close
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          X
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default Modal;
