import React, { useState, useCallback } from "react";

//Memoized ListItem component
const ListItem = React.memo(function ListItem({ item, onDelete }) {
  console.log("Rendering:", item); // observe re-renders

  return (
    <li style={{ margin: "8px 0" }}>
      {item}
      <button
        onClick={() => onDelete(item)}
        style={{ marginLeft: "12px", color: "red" }}
      >
        Delete
      </button>
    </li>
  );
});

function OptimizedList() {
  const [items, setItems] = useState(["Apple", "Banana", "Orange"]);
  const [counter, setCounter] = useState(0); // triggers parent re-render
  const [input, setInput] = useState("");

  //useCallback prevents new function creation every render
  const handleDeleteItem = useCallback(
    (itemToDelete) => {
      setItems((prev) => prev.filter((item) => item !== itemToDelete));
    },
    []
  );

  const handleAddItem = useCallback(() => {
    if (input.trim() === "") return;
    setItems((prev) => [...prev, input.trim()]);
    setInput("");
  }, [input]);

  return (
    <div>
      <h1>Optimized List with React.memo + useCallback</h1>

      {/* Counter to trigger parent re-renders */}
      <button onClick={() => setCounter((c) => c + 1)}>
        Increment Counter ({counter})
      </button>

      {/* Add new item */}
      <div style={{ margin: "16px 0" }}>
        <input
          type="text"
          placeholder="Enter item..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleAddItem} style={{ marginLeft: "8px" }}>
          Add Item
        </button>
      </div>

      {/* Render list */}
      <ul>
        {items.map((item) => (
          <ListItem key={item} item={item} onDelete={handleDeleteItem} />
        ))}
      </ul>
    </div>
  );
}

export default OptimizedList;
