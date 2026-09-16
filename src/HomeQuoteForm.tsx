import { Badge, Button, SegmentedControl, TextField } from "@gator/elements";
import { useState, type FormEvent } from "react";
import styles from "./HomeQuoteForm.module.css";

export function HomeQuoteForm() {
  const [address, setAddress] = useState("14 Linden Street, Apt 4B");
  const [kind, setKind] = useState("apartment");
  const [year, setYear] = useState("1978");
  const [area, setArea] = useState("68");
  const [floor, setFloor] = useState("4");
  const [note, setNote] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const where = address.trim() || "this property";
    setNote(`Quote requested for ${where} (${year}). Brian will send it.`);
  }

  return (
    <article className={styles.slip}>
      <div className={styles.spine}>
        <div>
          <div className={styles.kicker}>Home cover</div>
          <p className={styles.id}>QT-1842</p>
        </div>
        <Badge>Buyer form</Badge>
      </div>
      <form className={styles.body} onSubmit={onSubmit}>
        <h1 className={styles.title}>Get a quote</h1>
        <p className={styles.lede}>
          For the apartment or house you are buying. Brian uses this to send you a price.
        </p>
        <TextField
          id="address"
          label="Address"
          value={address}
          onChange={setAddress}
          autoComplete="street-address"
        />
        <SegmentedControl
          label="Property"
          value={kind}
          onChange={setKind}
          options={[
            { value: "apartment", label: "Apartment" },
            { value: "house", label: "House" },
          ]}
        />
        <div className={styles.pair}>
          <TextField
            id="year"
            label="Year built"
            type="number"
            min={1800}
            max={2026}
            value={year}
            onChange={setYear}
          />
          <TextField
            id="area"
            label="Floor area (m²)"
            type="number"
            min={10}
            max={2000}
            value={area}
            onChange={setArea}
          />
        </div>
        {kind === "apartment" ? (
          <TextField
            id="floor"
            label="Floor"
            type="number"
            min={0}
            max={80}
            value={floor}
            onChange={setFloor}
          />
        ) : null}
        <Button type="submit">Get quote</Button>
        {note ? <p className={styles.note}>{note}</p> : null}
      </form>
    </article>
  );
}
