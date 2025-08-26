import React, { useState } from "react";
import Modal from "./Modal";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="App">
      <h1>React Portal Modal</h1>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Hello World</h2>
        <p>This modal is rendered with React Portal.</p>
      </Modal>
    </div>
  );
}

export default App;
