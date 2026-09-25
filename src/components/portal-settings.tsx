"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { changePassword, passwordProblem, updateProfile, type Contact, PASSWORD_RULE } from "@/lib/portal";

/**
 * Your details, your organisation's, and your password.
 *
 * Business hours are here rather than only on the sign-up form because they decide the overlap
 * every engagement is staffed against: picked wrongly once, they used to be permanent, which made
 * the four-hour guarantee quietly wrong for that client.
 *
 * The password section says "set" rather than "change" for an account opened through Slack. Its
 * stored password is random and nobody knows it, so asking for the current one would be asking
 * for something that does not exist.
 */

const REGIONS = ["Americas", "EMEA", "APAC"] as const;

const input =
  "focus-ring mt-1 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint";

export function PortalSettings({ contact, onSaved }: { contact: Contact; onSaved: (c: Contact) => void }) {
  const [name, setName] = useState(contact.name);
  const [jobTitle, setJobTitle] = useState(contact.job_title ?? "");
  const [company, setCompany] = useState(contact.org?.name ?? "");
  const [region, setRegion] = useState(contact.org?.business_region ?? "APAC");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaid, setProfileSaid] = useState<string | null>(null);

  const hasPassword = contact.has_password !== false;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaid, setPasswordSaid] = useState<string | null>(null);
  const [passwordProblemText, setPasswordProblem] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaid(null);
    try {
      onSaved(await updateProfile({ name, job_title: jobTitle, company, business_region: region }));
      setProfileSaid("Saved.");
    } catch {
      setProfileSaid("Could not save your changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaid(null);
    const weak = passwordProblem(next);
    if (weak) return setPasswordProblem(weak);
    setSavingPassword(true);
    setPasswordProblem(null);
    try {
      await changePassword(next, hasPassword ? current : undefined);
      setPasswordSaid(hasPassword ? "Your password has been changed." : "Your password has been set.");
      setCurrent("");
      setNext("");
      // The flag only flips on the server; reflect it without a reload.
      onSaved({ ...contact, has_password: true });
    } catch (err) {
      setPasswordProblem(err instanceof ApiError ? err.message : "Could not change your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2 *:min-w-0">
      <form onSubmit={saveProfile} className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">You and your organisation</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="se-name" className="text-sm font-medium text-ink">
              Your name
            </label>
            <input id="se-name" value={name} onChange={(e) => setName(e.target.value)} className={input} required />
          </div>
          <div>
            <label htmlFor="se-title" className="text-sm font-medium text-ink">
              Job title
            </label>
            <input id="se-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="se-company" className="text-sm font-medium text-ink">
              Organisation
            </label>
            <input id="se-company" value={company} onChange={(e) => setCompany(e.target.value)} className={input} required />
            <p className="mt-1 text-xs text-ink-5">
              What we call you on proposals and invoices. Accounts opened through Slack are named after the
              workspace, which is rarely what you would choose.
            </p>
          </div>
          <div>
            <label htmlFor="se-region" className="text-sm font-medium text-ink">
              Business hours
            </label>
            <select id="se-region" value={region} onChange={(e) => setRegion(e.target.value)} className={input}>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-5">
              Every engagement is staffed to overlap these by at least four hours a day.
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={savingProfile}
          className="focus-ring mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {savingProfile ? "Saving…" : "Save changes"}
        </button>
        {profileSaid && <p className="mt-3 text-sm text-positive">{profileSaid}</p>}
      </form>

      <form onSubmit={savePassword} className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">{hasPassword ? "Change your password" : "Set a password"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-4">
          {hasPassword
            ? "You will stay signed in on this device."
            : "You opened this account with Slack, so it has no password yet. Setting one lets you sign in without Slack as well."}
        </p>
        <div className="mt-4 space-y-4">
          {hasPassword && (
            <div>
              <label htmlFor="se-current" className="text-sm font-medium text-ink">
                Current password
              </label>
              <input
                id="se-current"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className={input}
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="se-new" className="text-sm font-medium text-ink">
              New password
            </label>
            <p className="mt-0.5 text-xs text-ink-5">{PASSWORD_RULE}</p>
            <input
              id="se-new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={input}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={savingPassword}
          className="focus-ring mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {savingPassword ? "Saving…" : hasPassword ? "Change password" : "Set password"}
        </button>
        {passwordSaid && <p className="mt-3 text-sm text-positive">{passwordSaid}</p>}
        {passwordProblemText && <p className="mt-3 text-sm text-ink-3">{passwordProblemText}</p>}
      </form>
    </div>
  );
}
