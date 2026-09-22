"use client";

import { useEffect, useState } from "react";
import { getMe, getToken, type Contact } from "@/lib/portal";

/**
 * The signed-in client contact, if this tab has a client session; otherwise null.
 *
 * Public forms use it to do more for a client: prefill and lock the email to the account, and send
 * the session so the request is attached to their organisation and appears in their portal. An
 * expired session simply reads as signed out — the form still works for anybody.
 */
export function useClientSession(): Contact | null {
  const [contact, setContact] = useState<Contact | null>(null);
  useEffect(() => {
    if (!getToken()) return;
    (async () => {
      try {
        setContact(await getMe());
      } catch {
        /* expired or revoked — treat as signed out */
      }
    })();
  }, []);
  return contact;
}
