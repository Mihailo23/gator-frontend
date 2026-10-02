import { useState } from "react";
import { Button, TextField } from "@gator/elements";
import styles from "./PublicAgencyEntry.module.css";

type Step = "welcome" | "verify" | "find" | "stop";

export type Agency = { name: string; city: string; state: string };

const FIXTURE_AGENCIES: Agency[] = [
  { name: "Northline Insurance", city: "Denver", state: "CO" },
  { name: "Harbor Mutual", city: "Austin", state: "TX" },
  { name: "Cedar Street Agency", city: "Columbus", state: "OH" },
];

const STEP_LABELS = ["Verify", "Agency", "Admin"] as const;

function isWorkEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+$/.test(value.trim());
}

function isVerificationCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

function stepIndex(step: Step): number {
  if (step === "verify") return 0;
  if (step === "find") return 1;
  return 2;
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

  const current = stepIndex(step);

  return (
    <article className={styles.screen}>
      <header className={styles.brand}>
        <p className={styles.mark}>AIUS</p>
        <p className={styles.tag}>Agency onboarding</p>
      </header>
      {step === "welcome" ? null : (
        <ol className={styles.steps}>
          {STEP_LABELS.map((label, index) => (
            <li
              key={label}
              className={`${styles.step} ${index === current ? styles.current : ""} ${index < current ? styles.done : ""}`}
            >
              <span className={styles.num}>{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      )}
      <div className={styles.sheet}>{body()}</div>
    </article>
  );

  function body() {
    if (step === "welcome") {
      return (
        <>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Get started</h1>
            <p className={styles.heroLede}>
              You are appointing an agency. We need a work email before anything else.
            </p>
          </div>
          <Button onClick={() => setStep("verify")}>Get started</Button>
        </>
      );
    }

    if (step === "verify") {
      return (
        <>
          <h1 className={styles.title}>Let’s verify your identity</h1>
          <p className={styles.lede}>
            A work email confirms who started, before any agency details.
          </p>
          <TextField id="work-email" label="Work email" value={email} onChange={setEmail} />
          <Button onClick={sendCode}>Send code</Button>
          {codeSent ? (
            <>
              <TextField id="code" label="Code" value={code} onChange={setCode} />
              <p className={styles.lede}>Any 6 digits.</p>
              {codeError ? <p className={styles.lede}>{codeError}</p> : null}
              <Button onClick={continueFromCode}>Continue</Button>
            </>
          ) : null}
          <p className={styles.note}>
            We ask for this so a public visit is tied to a person, not an anonymous click.
          </p>
        </>
      );
    }

    if (step === "stop" && agency) {
      return (
        <>
          <h1 className={styles.title}>Admin still needed</h1>
          <div className={styles.card}>
            <p className={styles.name}>{agency.name}</p>
            <p className={styles.place}>
              {agency.city}, {agency.state}
            </p>
            <p className={styles.place}>{email}</p>
          </div>
          <p className={styles.lede}>An owner still has to confirm who the admin is.</p>
        </>
      );
    }

    return (
      <>
        <h1 className={styles.title}>Find your agency</h1>
        <p className={styles.lede}>Search by name. A match shows the city and state.</p>
        <TextField id="agency-search" label="Agency name" value={query} onChange={setQuery} />
        {matches.map((item) => (
          <div key={item.name} className={styles.card}>
            <p className={styles.name}>{item.name}</p>
            <p className={styles.place}>
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
            <h2 className={styles.section}>Add your agency</h2>
            <p className={styles.lede}>
              Don’t see it in the list? Add the public name and location.
            </p>
            <TextField
              id="agency-name"
              label="Agency name"
              value={draftName}
              onChange={setDraftName}
            />
            <div className={styles.pair}>
              <TextField id="city" label="City" value={draftCity} onChange={setDraftCity} />
              <TextField id="state" label="State" value={draftState} onChange={setDraftState} />
            </div>
            <Button onClick={addAgency}>Continue</Button>
          </>
        ) : null}
      </>
    );
  }
}
