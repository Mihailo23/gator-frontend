import { useState, type FormEvent } from "react";
import { Button, TextField } from "@gator/elements";
import entry from "./PublicAgencyEntry.module.css";
import slip from "./slip.module.css";

type Step = "welcome" | "verify" | "find" | "stop";

export type Agency = { name: string; city: string; state: string };

const FIXTURE_AGENCIES: Agency[] = [
  { name: "Northline Insurance", city: "Denver", state: "CO" },
  { name: "Harbor Mutual", city: "Austin", state: "TX" },
  { name: "Cedar Street Agency", city: "Columbus", state: "OH" },
];

function isWorkEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+$/.test(value.trim());
}

function isVerificationCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

export function PublicAgencyEntry() {
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
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
    if (!isWorkEmail(email)) return;
    if (!isVerificationCode(code)) {
      setCodeError("Enter 6 digits.");
      return;
    }
    setCodeError(null);
    setStep("find");
  }

  const matches =
    query.trim() === ""
      ? []
      : FIXTURE_AGENCIES.filter((item) =>
          item.name.toLowerCase().includes(query.trim().toLowerCase()),
        );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step === "welcome") {
      setStep("verify");
      return;
    }
    if (step === "verify") {
      if (!codeSent) sendCode();
      else continueFromCode();
      return;
    }
    if (step === "find" && matches.length === 0) addAgency();
  }

  return (
    <form className={slip.slip} onSubmit={onSubmit}>
      <div className={slip.spine}>
        <div>
          <div className={slip.kicker}>Agency onboarding</div>
          <p className={slip.id}>New agency</p>
        </div>
      </div>
      <div className={slip.body}>{body()}</div>
    </form>
  );

  function body() {
    if (step === "welcome") {
      return (
        <>
          <h1 className={slip.title}>Get started</h1>
          <p className={slip.lede}>
            You are appointing an agency. We need a work email before anything else.
          </p>
          <Button type="submit">Get started</Button>
        </>
      );
    }

    if (step === "verify") {
      return (
        <>
          <h1 className={slip.title}>Let’s verify your identity</h1>
          <p className={slip.lede}>A work email confirms who started, before any agency details.</p>
          <TextField id="work-email" label="Work email" value={email} onChange={setEmail} />
          <Button type={codeSent ? "button" : "submit"} onClick={sendCode}>
            Send code
          </Button>
          {codeSent ? (
            <>
              <TextField id="code" label="Code" value={code} onChange={setCode} />
              <p className={slip.note}>Any 6 digits.</p>
              {codeError ? <p className={slip.note}>{codeError}</p> : null}
              <Button type="submit" onClick={continueFromCode}>
                Continue
              </Button>
            </>
          ) : null}
        </>
      );
    }

    if (step === "stop" && agency) {
      return (
        <>
          <h1 className={slip.title}>Admin still needed</h1>
          <p className={slip.id}>{agency.name}</p>
          <p className={entry.place}>
            {agency.city}, {agency.state}
          </p>
          <p className={entry.place}>{email}</p>
          <p className={slip.lede}>An owner still has to confirm who the admin is.</p>
        </>
      );
    }

    return (
      <>
        <h1 className={slip.title}>Find your agency</h1>
        <p className={slip.lede}>Search by name. A match shows the city and state.</p>
        <TextField id="agency-search" label="Agency name" value={query} onChange={setQuery} />
        {matches.map((item) => (
          <div key={item.name} className={entry.match}>
            <p className={slip.id}>{item.name}</p>
            <p className={entry.place}>
              {item.city}, {item.state}
            </p>
            <Button
              variant="secondary"
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
            <h2 className={entry.section}>Add your agency</h2>
            <p className={slip.lede}>Don’t see it in the list? Add the public name and location.</p>
            <TextField
              id="agency-name"
              label="Agency name"
              value={draftName}
              onChange={setDraftName}
            />
            <div className={slip.pair}>
              <TextField id="city" label="City" value={draftCity} onChange={setDraftCity} />
              <TextField id="state" label="State" value={draftState} onChange={setDraftState} />
            </div>
            <Button type="submit" onClick={addAgency}>
              Continue
            </Button>
          </>
        ) : null}
      </>
    );
  }
}
