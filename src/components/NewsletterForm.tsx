"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/app/actions";
import { useShop } from "@/store/shop";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const subscribers = useShop((s) => s.subscribers);
  const addSubscriber = useShop((s) => s.addSubscriber);
  const toast = useShop((s) => s.toast);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const value = email.trim().toLowerCase();
    if (subscribers.includes(value)) {
      setError("You're already on the list — see you next month.");
      return;
    }
    startTransition(async () => {
      const res = await subscribe(value);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      addSubscriber(value);
      setEmail("");
      toast("Subscribed. First letter arrives next month.");
    });
  };

  return (
    <>
      <form className="cta-form reveal" onSubmit={onSubmit} noValidate>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="your@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "newsletter-error" : undefined}
        />
        <button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Subscribe →"}
        </button>
      </form>
      {error && (
        <p id="newsletter-error" className="cta-form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
