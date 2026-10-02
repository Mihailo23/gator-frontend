import { useState } from "react";
import { Button, TextField } from "@gator/elements";
import styles from "./PublicAgencyEntry.module.css";

type Step = "welcome" | "verify" | "find";

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

  function sendCode() {
    if (!isWorkEmail(email)) return;
    setEmail(email.trim());
    setCodeSent(true);
  }

  function continueFromCode() {
    if (!isVerificationCode(code)) return;
    setStep("find");
  }

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

  return (
    <main className={styles.flow}>
      <TextField id="agency-search" label="Agency name" value="" onChange={() => {}} />
    </main>
  );
}
