import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

describe("Counter component", () => {
  it("renders with initial count 0", () => {
    render(<Counter />);
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
  });

  it("increments count when Increment is clicked", () => {
    render(<Counter />);
    fireEvent.click(screen.getByText(/increment/i));
    expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
  });

  it("decrements count when Decrement is clicked", () => {
    render(<Counter />);
    fireEvent.click(screen.getByText(/decrement/i));
    expect(screen.getByText(/count: -1/i)).toBeInTheDocument();
  });

  it("resets count to 0 when Reset is clicked", () => {
    render(<Counter />);
    fireEvent.click(screen.getByText(/increment/i));
    fireEvent.click(screen.getByText(/reset/i));
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
  });
});
