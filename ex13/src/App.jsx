import React from "react";
import DataLoader from "./DataLoader";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Render Props</h1>
      <DataLoader
        render={({ data, loading, error }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
          return (
            <div>
              <h2>{data.title}</h2>
              <p>{data.body}</p>
            </div>
          );
        }}
      />
    </div>
  );
}

export default App;
