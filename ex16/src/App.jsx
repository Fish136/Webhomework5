import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import BuggyComponent from "./BuggyComponent";

function App() {
  return (
    <div className="App">
      <h1>Error Boundary Example</h1>

      {/*Wrap BuggyComponent inside ErrorBoundary */}
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    </div>
  );
}

export default App;
