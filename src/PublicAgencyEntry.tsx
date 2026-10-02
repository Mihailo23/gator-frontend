import { useState } from "react";
import { Button, TextField } from "@gator/elements";
import styles from "./PublicAgencyEntry.module.css";

type Step = "welcome" | "verify" | "find" | "stop";

export type Agency = { name: string; city: string; state: string };

export const FIXTURE_AGENCIES: Agency[] = [
  { name: "Northline Insurance", city: "Denver", state: "CO" },
  { name: "Harbor Mutual", city: "Austin", state: "TX" },
  { name: "Cedar Street Agency", city: "Columbus", state: "OH" },
];

export function isWorkEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+$/.test(value.trim());
}

export function isVerificationCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

export function PublicAgencyEntry() {
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [query, setQuery] = useState("");
  const [agency, setAgency] = useState<Agency | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftCity, setDraftCity] = useState("");
  const [draftState, setDraftState] = useState("");

  function addAgency() {
    const name = draftName.trim();
    const city = draftCity.trim();
    const state = draftState.trim();
    if (!name || !city || !state) return;
    setAgency({ name, city, state });
    setStep("stop");
  }

  function sendCode() {
    if (!isWorkEmail(email)) return;
    setEmail(email.trim());
    setCodeSent(true);
  }

  function continueFromCode() {
    if (!isVerificationCode(code)) return;
    setStep("find");
  }

  const matches =
    query.trim() === ""
      ? []
      : FIXTURE_AGENCIES.filter((item) =>
          item.name.toLowerCase().includes(query.trim().toLowerCase()),
        );

  if (step === "welcome") {
    return (
      <main className={styles.flow}>
        <h1>Get started</h1>
        <p>You are appointing an agency. We need a work email before anything else.</p>
        <Button onClick={() => setStep("verify")}>Get started</Button>
      </main>
    );
  }

  if (step === "verify") {
    return (
      <main className={styles.flow}>
        <TextField id="work-email" label="Work email" value={email} onChange={setEmail} />
        <Button onClick={sendCode}>Send code</Button>
        {codeSent ? (
          <>
            <TextField id="code" label="Code" value={code} onChange={setCode} />
            <Button onClick={continueFromCode}>Continue</Button>
          </>
        ) : null}
      </main>
    );
  }

  if (step === "stop" && agency) {
    return (
      <main className={styles.flow}>
        <h1>Admin still needed</h1>
        <p>{agency.name}</p>
        <p>
          {agency.city}, {agency.state}
        </p>
        <p>{email}</p>
        <p>An owner still has to confirm who the admin is.</p>
      </main>
    );
  }

  return (
    <main className={styles.flow}>
      <TextField id="agency-search" label="Agency name" value={query} onChange={setQuery} />
      {matches.map((item) => (
        <div key={item.name}>
          <p>
            {item.city}, {item.state}
          </p>
          <Button
            onClick={() => {
              setAgency(item);
              setStep("stop");
            }}
          >
            {`Select ${item.name}`}
          </Button>
        </div>
      ))}
      {matches.length === 0 ? (
        <>
          <h2>Add your agency</h2>
          <TextField
            id="agency-name"
            label="Agency name"
            value={draftName}
            onChange={setDraftName}
          />
          <TextField id="city" label="City" value={draftCity} onChange={setDraftCity} />
          <TextField id="state" label="State" value={draftState} onChange={setDraftState} />
          <Button onClick={addAgency}>Continue</Button>
        </>
      ) : null}
    </main>
  );
}
