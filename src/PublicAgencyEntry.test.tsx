import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";
import App from "./App.js";
import { PublicAgencyEntry } from "./PublicAgencyEntry.js";

describe("PublicAgencyEntry", () => {
  it("starts at Get started and reveals the work email", async () => {
    const user = userEvent.setup();
    render(<PublicAgencyEntry />);
    expect(screen.getByRole("heading", { name: "Get started" })).toBeInTheDocument();
    expect(
      screen.getByText("You are appointing an agency. We need a work email before anything else."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Get started" }));
    expect(screen.getByLabelText("Work email")).toBeInTheDocument();
    expect(screen.queryByLabelText("Code")).not.toBeInTheDocument();
  });

  it("is what App shows", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Get started" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Get quote" })).not.toBeInTheDocument();
  });
});
