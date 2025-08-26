import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "./LoginForm";

describe("LoginForm component", () => {
  it("renders with empty inputs initially", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toHaveValue("");
    expect(screen.getByLabelText(/password/i)).toHaveValue("");
  });

  it("disables submit button when inputs are invalid", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalidemail" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123" },
    });

    const button = screen.getByRole("button", { name: /login/i });
    expect(button).toBeDisabled();
  });

  it("enables submit button when inputs are valid", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456" },
    });

    const button = screen.getByRole("button", { name: /login/i });
    expect(button).not.toBeDisabled();
  });

  it("submits successfully with valid inputs", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText(/login successful!/i)).toBeInTheDocument();
  });
});
