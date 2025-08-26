import React, { useReducer, useState, useEffect } from "react";

// Reducer function
function todoReducer(state, action) {
  switch (action.type) {
    case "SET_TODOS":
      return action.payload;

    case "ADD_TODO":
      return [...state, action.payload];

    case "TOGGLE_TODO":
      return state.map((todo) =>
        todo._id === action.payload._id ? action.payload : todo
      );

    case "REMOVE_TODO":
      return state.filter((todo) => todo._id !== action.payload);

    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [input, setInput] = useState("");

  // Load tasks from backend
  useEffect(() => {
    async function loadTasks() {
      const res = await fetch("https://todo-list-z3r3.onrender.com/api/tasks");
      const data = await res.json();
      dispatch({ type: "SET_TODOS", payload: data });
    }
    loadTasks();
  }, []);

  // Add new task
  async function addTask(title) {
    const res = await fetch("https://todo-list-z3r3.onrender.com/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const newTask = await res.json();
    dispatch({ type: "ADD_TODO", payload: newTask });
  }

  // Toggle task completion
  async function toggleTask(id, completed) {
    const res = await fetch(
      `https://todo-list-z3r3.onrender.com/api/tasks/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      }
    );
    const updated = await res.json();
    dispatch({ type: "TOGGLE_TODO", payload: updated });
  }

  // Delete task
  async function deleteTask(id) {
    await fetch(`https://todo-list-z3r3.onrender.com/api/tasks/${id}`, {
      method: "DELETE",
    });
    dispatch({ type: "REMOVE_TODO", payload: id });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      addTask(input.trim());
      setInput("");
    }
  };

  return (
    <div>
      <h1>To-Do List (useReducer)</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="New task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {todos.map((task) => (
          <li key={task._id} style={{ margin: "8px 0" }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task._id, !task.completed)}
            />
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
                marginLeft: "8px",
              }}
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task._id)}
              style={{ marginLeft: "12px", color: "red" }}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
