import { useState } from "react";
import { Button, TextField } from "@gator/elements";
import styles from "./PublicAgencyEntry.module.css";

type Step = "welcome" | "verify";

export function PublicAgencyEntry() {
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");

  if (step === "welcome") {
    return (
      <main className={styles.flow}>
        <h1>Get started</h1>
        <p>You are appointing an agency. We need a work email before anything else.</p>
        <Button onClick={() => setStep("verify")}>Get started</Button>
      </main>
    );
  }

  return (
    <main className={styles.flow}>
      <TextField id="work-email" label="Work email" value={email} onChange={setEmail} />
    </main>
  );
}
