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

  async function reachVerify() {
    const user = userEvent.setup();
    render(<PublicAgencyEntry />);
    await user.click(screen.getByRole("button", { name: "Get started" }));
    return user;
  }

  it("hides Code until the email has a local part and a domain", async () => {
    const user = await reachVerify();
    await user.type(screen.getByLabelText("Work email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send code" }));
    expect(screen.queryByLabelText("Code")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Work email"));
    await user.type(screen.getByLabelText("Work email"), "  ada@northline.test  ");
    await user.click(screen.getByRole("button", { name: "Send code" }));
    expect(screen.getByLabelText("Code")).toBeInTheDocument();
  });

  it("continues only for exactly six digits", async () => {
    const user = await reachVerify();
    await user.type(screen.getByLabelText("Work email"), "ada@northline.test");
    await user.click(screen.getByRole("button", { name: "Send code" }));

    await user.type(screen.getByLabelText("Code"), "12345");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Code")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Code"));
    await user.type(screen.getByLabelText("Code"), "1234567");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Code")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Code"));
    await user.type(screen.getByLabelText("Code"), "12 3456");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Code")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Code"));
    await user.type(screen.getByLabelText("Code"), "000000");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(document.getElementById("agency-search")).toBeInTheDocument();
    expect(screen.queryByLabelText("Code")).not.toBeInTheDocument();
  });
});
