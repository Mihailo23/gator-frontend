import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";
import { HomeQuoteForm } from "./HomeQuoteForm.js";

describe("HomeQuoteForm", () => {
  it("shows a fake quote note with default address and year", async () => {
    const user = userEvent.setup();
    render(<HomeQuoteForm />);
    await user.click(screen.getByRole("button", { name: "Get quote" }));
    expect(
      screen.getByText("Quote requested for 14 Linden Street, Apt 4B (1978). Brian will send it."),
    ).toBeInTheDocument();
  });

  it("hides Floor when House is selected and shows it for Apartment", async () => {
    const user = userEvent.setup();
    render(<HomeQuoteForm />);
    expect(screen.getByLabelText("Floor")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "House" }));
    expect(screen.queryByLabelText("Floor")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Apartment" }));
    expect(screen.getByLabelText("Floor")).toBeInTheDocument();
  });
});
