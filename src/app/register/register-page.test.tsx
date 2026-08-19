/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "./page";

describe("RegisterPage", () => {
  it("submits registration form and shows success message", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: "user-1", email: "jane@example.com", fullName: "Jane Doe" },
      }),
    });
    global.fetch = fetchMock;

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Jane Doe"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("jane@example.com"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Minimum 8 characters"), {
      target: { value: "strongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/register", expect.any(Object));
    });
    expect(await screen.findByText("Registered Jane Doe. You can login now.")).toBeInTheDocument();
  });
});
