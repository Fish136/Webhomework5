import React, { useState } from "react";

function BuggyComponent() {
  const [count, setCount] = useState(0);

  if (count === 5) {
    //Simulate an error at a certain state
    throw new Error("I crashed!");
  }

  return (
    <div>
      <p>Click the button. When count = 5, an error will be thrown.</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}

export default BuggyComponent;
