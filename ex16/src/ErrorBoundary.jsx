import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  //Update state so the next render shows fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  //Log error details
  componentDidCatch(error, info) {
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2 style={{ color: "red" }}>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
