"use client";

import { useId, useState } from "react";
import type { Block, ChatCard, Tone } from "@/lib/chat-cards";
import { CHAT_CARDS } from "@/lib/chat-cards";

/**
 * Static previews of the six engagement messages, drawn as Slack renders them and as Microsoft
 * Teams does. Nothing here is wired: a client is being shown what will arrive, so the buttons are
 * spans rather than <button>s — a drawn control that focuses and does nothing is worse than one
 * that is plainly a picture. The only state is which host is on show.
 *
 * Both skins approximate their host. Final spacing and button colours are set by Slack and Teams.
 */

type Skin = "slack" | "teams";

const TONE_TEXT: Record<Tone, string> = {
  default: "text-ink-2",
  good: "text-positive",
  warning: "text-ink-2",
  subtle: "text-ink-5",
};

function Fields({ items, skin }: { items: { k: string; v: string }[]; skin: Skin }) {
  return (
    <dl className={`grid gap-x-6 gap-y-2 ${skin === "slack" ? "sm:grid-cols-2" : ""}`}>
      {items.map((f) => (
        <div key={f.k} className={skin === "teams" ? "flex gap-3 min-w-0" : "min-w-0"}>
          <dt className={`text-xs text-ink-5 ${skin === "teams" ? "w-32 shrink-0" : "font-semibold uppercase tracking-wider"}`}>
            {f.k}
          </dt>
          <dd className="min-w-0 text-sm text-ink-2">{f.v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Rows({ items, skin }: { items: { title: string; meta?: string; status: string; tone?: Tone }[]; skin: Skin }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((r) => (
        <li key={r.title} className="flex items-baseline justify-between gap-3 py-2">
          <span className="min-w-0 text-sm text-ink-2">
            {r.title}
            {r.meta ? <span className="text-ink-5"> · {r.meta}</span> : null}
          </span>
          {skin === "teams" ? (
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${
                r.tone === "good"
                  ? "border-positive-line bg-positive-tint text-positive"
                  : "border-line bg-sunken text-ink-4"
              }`}
            >
              {r.status}
            </span>
          ) : (
            <span className={`shrink-0 text-xs font-semibold ${TONE_TEXT[r.tone ?? "default"]}`}>{r.status}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function Blocks({ blocks, skin }: { blocks: Block[]; skin: Skin }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "text":
            return (
              <p key={i} className="text-sm leading-relaxed text-ink-2">
                {b.text}
              </p>
            );
          case "context":
            return (
              <p key={i} className="text-xs leading-relaxed text-ink-5">
                {b.text}
              </p>
            );
          case "divider":
            return <hr key={i} className="border-line" />;
          case "fields":
            return <Fields key={i} items={b.items} skin={skin} />;
          case "rows":
            return <Rows key={i} items={b.items} skin={skin} />;
        }
      })}
    </div>
  );
}

/** Drawn, not wired — see the note at the top of this file. */
function Actions({ actions, skin }: { actions: { label: string; primary?: boolean }[]; skin: Skin }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {actions.map((a) => (
        <span
          key={a.label}
          className={`rounded ${skin === "teams" ? "rounded-md" : ""} border px-3 py-1.5 text-xs font-semibold ${
            a.primary
              ? "border-accent bg-accent text-white"
              : "border-line-strong bg-surface text-ink-2"
          }`}
        >
          {a.label}
        </span>
      ))}
    </div>
  );
}

function AppIcon({ size = "size-9" }: { size?: string }) {
  return (
    <span className={`${size} grid shrink-0 place-items-center rounded-lg bg-accent text-sm font-extrabold text-white`}>
      gd
    </span>
  );
}

function SlackMessage({ card }: { card: ChatCard }) {
  return (
    <div className="bg-surface p-4">
      <div className="flex gap-3">
        <AppIcon />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-ink">GRC Department</span>
            <span className="rounded bg-sunken px-1 py-px text-[10px] font-semibold uppercase tracking-wider text-ink-5">
              App
            </span>
            <span className="text-xs text-ink-5">{card.time}</span>
          </p>
          {/* Slack's attachment rule: the coloured bar down the left of an app message. */}
          <div className={`mt-2 border-l-4 pl-3 ${card.tone === "attention" ? "border-l-ink-3" : "border-l-accent"}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-5">{card.kicker}</p>
            <p className="mt-1 font-semibold text-ink">{card.title}</p>
            <p className="mb-3 text-xs text-ink-5">{card.subtitle}</p>
            <Blocks blocks={card.blocks} skin="slack" />
            <Actions actions={card.actions} skin="slack" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamsMessage({ card }: { card: ChatCard }) {
  return (
    <div className="bg-sunken p-4">
      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
        <div
          className={`flex items-center gap-2 border-b border-line px-4 py-2 ${
            card.tone === "attention" ? "bg-muted" : "bg-surface"
          }`}
        >
          <AppIcon size="size-6" />
          <span className="text-sm font-semibold text-ink">GRC Department</span>
          <span className="ml-auto text-xs text-ink-5">{card.time}</span>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-5">{card.kicker}</p>
            <p className="mt-1 text-base font-semibold text-ink">{card.title}</p>
            <p className="text-xs text-ink-5">{card.subtitle}</p>
          </div>
          <Blocks blocks={card.blocks} skin="teams" />
          <Actions actions={card.actions} skin="teams" />
        </div>
      </div>
    </div>
  );
}

function SkinToggle({ skin, onChange }: { skin: Skin; onChange: (s: Skin) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface p-1" role="group" aria-label="Chat app">
      {(["slack", "teams"] as const).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          aria-pressed={skin === s}
          className={`focus-ring rounded-md px-4 py-1.5 text-sm font-semibold ${
            skin === s ? "bg-accent text-white" : "text-ink-4 hover:text-ink"
          }`}
        >
          {s === "slack" ? "Slack" : "Microsoft Teams"}
        </button>
      ))}
    </div>
  );
}

export function ChatCardGallery() {
  const [skin, setSkin] = useState<Skin>("slack");
  const headingId = useId();

  return (
    <section className="mx-auto max-w-4xl px-4 py-12" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <h2 id={headingId} className="text-2xl font-semibold tracking-tight text-ink">
            The six messages
          </h2>
          <p className="mt-1 text-sm text-ink-4">
            Shown as {skin === "slack" ? "Slack" : "Microsoft Teams"} renders them. The same message goes to either.
          </p>
        </div>
        <SkinToggle skin={skin} onChange={setSkin} />
      </div>

      <ol className="mt-10 space-y-14">
        {CHAT_CARDS.map((card, i) => (
          <li key={card.id} className="scroll-mt-28" id={card.id}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-faint">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-lg font-semibold text-ink">{card.name}</h3>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-3">{card.purpose}</p>
            <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr] *:min-w-0">
              <dt className="text-ink-5">Arrives</dt>
              <dd className="text-ink-2">{card.when}</dd>
              <dt className="text-ink-5">Goes to</dt>
              <dd className="text-ink-2">{card.who}</dd>
            </dl>
            <div className="mt-5 overflow-hidden rounded-xl border border-line">
              {skin === "slack" ? <SlackMessage card={card} /> : <TeamsMessage card={card} />}
            </div>
            {card.resolved ? (
              <p className="mt-3 text-sm text-ink-4">
                <span className="text-positive">✓</span> Once someone acts, the message updates in place:{" "}
                <span className="text-ink-2">{card.resolved}</span>
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
