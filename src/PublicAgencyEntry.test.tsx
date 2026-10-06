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

  async function reachFind(email = "ada@northline.test") {
    const user = userEvent.setup();
    render(<PublicAgencyEntry />);
    await user.click(screen.getByRole("button", { name: "Get started" }));
    await user.type(screen.getByLabelText("Work email"), email);
    await user.click(screen.getByRole("button", { name: "Send code" }));
    await user.type(screen.getByLabelText("Code"), "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    return user;
  }

  it("keeps Send code disabled until the email has a local part and a domain", async () => {
    const user = await reachVerify();
    const send = screen.getByRole("button", { name: "Send code" });
    expect(send).toBeDisabled();

    await user.type(screen.getByLabelText("Work email"), "not-an-email");
    expect(send).toBeDisabled();
    expect(screen.queryByLabelText("Code")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Work email"));
    await user.type(screen.getByLabelText("Work email"), "  ada@northline.test  ");
    expect(send).toBeEnabled();
    await user.click(send);
    expect(screen.getByLabelText("Code")).toBeInTheDocument();
  });

  it("sends the code when Enter is pressed in the email field", async () => {
    const user = await reachVerify();
    await user.type(screen.getByLabelText("Work email"), "ada@northline.test{Enter}");
    expect(screen.getByLabelText("Code")).toBeInTheDocument();
  });

  it("continues when Enter is pressed in the code field", async () => {
    const user = await reachVerify();
    await user.type(screen.getByLabelText("Work email"), "ada@northline.test{Enter}");
    await user.type(screen.getByLabelText("Code"), "123456{Enter}");
    expect(document.getElementById("agency-search")).toBeInTheDocument();
  });

  it("stays on verify when email becomes invalid after send", async () => {
    const user = await reachVerify();
    await user.type(screen.getByLabelText("Work email"), "ada@northline.test");
    await user.click(screen.getByRole("button", { name: "Send code" }));
    await user.clear(screen.getByLabelText("Work email"));
    await user.type(screen.getByLabelText("Work email"), "not-an-email");
    await user.type(screen.getByLabelText("Code"), "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Code")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Admin still needed" })).not.toBeInTheDocument();
  });

  it("continues only for exactly six digits", async () => {
    const user = await reachVerify();
    await user.type(screen.getByLabelText("Work email"), "ada@northline.test");
    await user.click(screen.getByRole("button", { name: "Send code" }));

    await user.type(screen.getByLabelText("Code"), "12345");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Code")).toBeInTheDocument();
    expect(screen.getByText("Enter 6 digits.")).toBeInTheDocument();

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

  it("lists a case-insensitive name match without FEIN or NPN", async () => {
    const user = await reachFind();
    const search = document.getElementById("agency-search") as HTMLInputElement;
    await user.type(search, "HARBOR");
    expect(screen.getByRole("button", { name: "Select Harbor Mutual" })).toBeInTheDocument();
    expect(screen.getByText("Austin, TX")).toBeInTheDocument();
    expect(screen.queryByText(/fein/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/npn/i)).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "mutual");
    expect(screen.getByRole("button", { name: "Select Harbor Mutual" })).toBeInTheDocument();
  });

  it("stops after Select and shows the trimmed email", async () => {
    const user = await reachFind("  ada@northline.test  ");
    await user.type(document.getElementById("agency-search") as HTMLInputElement, "harbor");
    await user.click(screen.getByRole("button", { name: "Select Harbor Mutual" }));
    expect(screen.getByRole("heading", { name: "Admin still needed" })).toBeInTheDocument();
    expect(screen.getByText("Harbor Mutual")).toBeInTheDocument();
    expect(screen.getByText("Austin, TX")).toBeInTheDocument();
    expect(screen.getByText("ada@northline.test")).toBeInTheDocument();
    expect(screen.getByText("An owner still has to confirm who the admin is.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("offers add when nothing matches, including an empty search", async () => {
    const user = await reachFind();
    expect(document.getElementById("agency-name")).toBeInTheDocument();
    await user.type(document.getElementById("agency-search") as HTMLInputElement, "zzzz");
    expect(screen.queryByRole("button", { name: /Select / })).not.toBeInTheDocument();
    expect(document.getElementById("agency-name")).toBeInTheDocument();
  });

  it("stays on Find until name, city, and state are non-empty", async () => {
    const user = await reachFind();
    const name = document.getElementById("agency-name") as HTMLInputElement;
    const city = document.getElementById("city") as HTMLInputElement;
    const state = document.getElementById("state") as HTMLInputElement;
    await user.type(name, "   ");
    await user.type(city, "Boise");
    await user.type(state, "ID");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("heading", { name: "Admin still needed" })).not.toBeInTheDocument();

    await user.clear(name);
    await user.type(name, "Pike Insurance");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Admin still needed" })).toBeInTheDocument();
    expect(screen.getByText("Pike Insurance")).toBeInTheDocument();
    expect(screen.getByText("Boise, ID")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("stays on Find when city is only whitespace", async () => {
    const user = await reachFind();
    const name = document.getElementById("agency-name") as HTMLInputElement;
    const city = document.getElementById("city") as HTMLInputElement;
    const state = document.getElementById("state") as HTMLInputElement;
    await user.type(name, "Pike Insurance");
    await user.type(city, "   ");
    await user.type(state, "ID");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("heading", { name: "Admin still needed" })).not.toBeInTheDocument();
  });

  it("stays on Find when state is only whitespace", async () => {
    const user = await reachFind();
    const name = document.getElementById("agency-name") as HTMLInputElement;
    const city = document.getElementById("city") as HTMLInputElement;
    const state = document.getElementById("state") as HTMLInputElement;
    await user.type(name, "Pike Insurance");
    await user.type(city, "Boise");
    await user.type(state, "   ");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("heading", { name: "Admin still needed" })).not.toBeInTheDocument();
  });
});
