/**
 * The six messages an engagement posts into the client's own Slack or Microsoft Teams, as shown
 * on /slack-and-teams. Content is from the "Client Chat Cards" design spec, which renders each
 * message as Slack Block Kit and a Teams Adaptive Card 1.5.
 *
 * This is illustrative: one worked engagement (ENG-2041) so a prospective client can see what
 * lands in their channel before they sign anything. It is **not** live data and is never fetched
 * from the API — the page says so above the first card. Nothing here is interactive; the buttons
 * are drawn, not wired, because the Slack and Teams apps are not built yet.
 *
 * Two rules from the spec hold across every card and must survive any edit:
 *   1. Hours and dates only. A rate or a total never appears in a chat message.
 *   2. One primary action. Everything else is secondary.
 */

export type Block =
  | { type: "text"; text: string }
  | { type: "context"; text: string }
  | { type: "divider" }
  | { type: "fields"; items: { k: string; v: string }[] }
  | { type: "rows"; items: { title: string; meta?: string; status: string; tone?: Tone }[] };

/** Row emphasis. `good` = done, `warning` = in flight, `subtle` = not started yet. */
export type Tone = "default" | "good" | "warning" | "subtle";

export type ChatCard = {
  id: string;
  /** What we call the message in this catalogue, not something the client sees. */
  name: string;
  /** Why it exists, in the spec's words. */
  purpose: string;
  /** Plain-language answers to "when does this arrive" and "who sees it". */
  when: string;
  who: string;
  /** `attention` draws the card's left rule in the warning colour. Escalation only. */
  tone?: "attention";
  time: string;
  kicker: string;
  title: string;
  subtitle: string;
  blocks: Block[];
  actions: { label: string; primary?: boolean }[];
  /** What the card is replaced by once somebody acts on it. */
  resolved?: string;
};

const CLIENT = "Northwind Health";

export const CHAT_CARDS: ChatCard[] = [
  {
    id: "kickoff",
    name: "Engagement kickoff",
    purpose:
      "The first message in a new engagement channel. It introduces your lead, the hours they overlap with your day and the first milestone, so nobody has to ask.",
    when: "As soon as the engagement channel is created",
    who: "Everyone in the channel. It stays pinned.",
    time: "Tue 12 May, 09:00",
    kicker: "Engagement update",
    title: "Your engagement channel is open",
    subtitle: `ENG-2041 · SOC 2 Type II readiness · ${CLIENT}`,
    blocks: [
      {
        type: "text",
        text: "Aarav Mehta is your lead consultant. He has read the brief and starts with scoping and control mapping this week. Post questions here and he replies inside the working overlap.",
      },
      {
        type: "fields",
        items: [
          { k: "Lead consultant", v: "Aarav Mehta" },
          { k: "Working overlap", v: "4 hours, UTC−5" },
          { k: "Engagement window", v: "12 May — 14 Nov 2026" },
          { k: "Client lead", v: "Dana Okafor, Head of Risk" },
        ],
      },
      {
        type: "context",
        text: "Everyone in this channel sees engagement updates. Timesheets and evidence requests go only to the people who own them.",
      },
    ],
    actions: [{ label: "View engagement", primary: true }, { label: "Book kickoff call" }],
  },
  {
    id: "milestone",
    name: "Deliverable ready for review",
    purpose:
      "Sent the moment a milestone is delivered. It leads with the headline findings, so your reviewer knows how much time to set aside before opening anything.",
    when: "When your lead marks a milestone delivered",
    who: "The channel, plus a direct message to your engagement lead",
    time: "Fri 26 Jun, 16:30",
    kicker: "Review needed · client lead",
    title: "Gap assessment report is ready",
    subtitle: "Milestone 2 of 4 · ENG-2041",
    blocks: [
      {
        type: "text",
        text: "The assessment covers 64 in-scope controls against the Trust Services Criteria. Aarav found 11 gaps, 3 rated high, and each one has a proposed owner and remediation date.",
      },
      {
        type: "fields",
        items: [
          { k: "Controls assessed", v: "64" },
          { k: "Gaps found", v: "11 (3 high)" },
          { k: "Walkthrough", v: "Wed 1 Jul, 10:00 ET" },
          { k: "Review by", v: "Fri 3 Jul" },
        ],
      },
    ],
    actions: [{ label: "Accept milestone", primary: true }, { label: "Open report" }, { label: "Request changes" }],
    resolved: "Accepted by Dana Okafor · Thu 2 Jul, 15:10",
  },
  {
    id: "digest",
    name: "Weekly status digest",
    purpose:
      "One message a week in place of a status meeting: hours against plan, where every milestone stands, and the one thing that is stuck.",
    when: "Every Monday at 09:00, your time",
    who: "Everyone in the channel",
    time: "Mon 21 Sep, 09:00",
    kicker: "Weekly status",
    title: "Week 19: on track, one item waiting on IT",
    subtitle: "ENG-2041 · 14–18 Sep",
    blocks: [
      {
        type: "fields",
        items: [
          { k: "Hours this week", v: "18.5 of 20 planned" },
          { k: "Hours to date", v: "312 of 480" },
          { k: "Next milestone", v: "Remediation round 1 · 30 Sep" },
          { k: "Open requests", v: "3 (1 overdue)" },
        ],
      },
      { type: "divider" },
      {
        type: "rows",
        items: [
          { title: "Scoping and control mapping", meta: "29 May", status: "Complete", tone: "good" },
          { title: "Gap assessment report", meta: "26 Jun", status: "Complete", tone: "good" },
          { title: "Remediation tracking — round 1", meta: "Due 30 Sep", status: "In progress", tone: "warning" },
          { title: "Auditor fieldwork support", meta: "14 Nov", status: "Not started", tone: "subtle" },
        ],
      },
      {
        type: "text",
        text: "The Q3 access review evidence is still with IT. Everything else on last week's list is closed.",
      },
    ],
    actions: [{ label: "Open status report", primary: true }, { label: "View timesheet" }],
  },
  {
    id: "timesheet",
    name: "Timesheet approval",
    purpose:
      "Asks your approver to confirm a week of hours, broken down by activity. Hours and dates only — rates stay in the engagement agreement.",
    when: "When your lead submits a week",
    who: "A direct message to your named approvers only",
    time: "Mon 21 Sep, 09:05",
    kicker: "Action needed · approver",
    title: "Timesheet ready for approval",
    subtitle: "Aarav Mehta · week of 14 Sep · ENG-2041",
    blocks: [
      {
        type: "fields",
        items: [
          { k: "Total", v: "18.5 hours" },
          { k: "Planned", v: "20 hours" },
          { k: "Submitted", v: "Mon 21 Sep, 08:12" },
          { k: "Approve by", v: "Wed 23 Sep" },
        ],
      },
      {
        type: "rows",
        items: [
          { title: "Control testing", status: "7.5 h" },
          { title: "Evidence review", status: "5.0 h" },
          { title: "Remediation working sessions", status: "4.0 h" },
          { title: "Status reporting", status: "2.0 h" },
        ],
      },
      {
        type: "context",
        text: "Approving releases the week for invoicing under your engagement agreement. Hours not approved by Wed 23 Sep are approved automatically.",
      },
    ],
    actions: [{ label: "Approve", primary: true }, { label: "Query hours" }, { label: "View detail" }],
    resolved: "Approved by Dana Okafor · Mon 21 Sep, 11:42",
  },
  {
    id: "evidence",
    name: "Evidence request",
    purpose:
      "Goes to the person who holds the document, not the whole channel. It names the control, the format your auditor will accept, and the date.",
    when: "When your lead needs a document from your team",
    who: "A direct message to the owner, with a copy in the channel thread",
    time: "Tue 22 Sep, 14:20",
    kicker: "Action needed · evidence owner",
    title: "Evidence requested: quarterly access review",
    subtitle: "CC6.2 · REQ-0417 · ENG-2041",
    blocks: [
      {
        type: "text",
        text: "Aarav needs the Q3 access review sign-off for production AWS and Okta. The auditor will sample this control during fieldwork.",
      },
      {
        type: "fields",
        items: [
          { k: "Owner", v: "Marcus Bell, IT Operations" },
          { k: "Due", v: "Fri 25 Sep" },
          { k: "Format", v: "Review export showing approver and date" },
          { k: "Upload to", v: "Portal, not this chat" },
        ],
      },
    ],
    actions: [{ label: "Upload evidence", primary: true }, { label: "Reassign" }, { label: "Ask a question" }],
    resolved: "Marked uploaded by Marcus Bell · Tue 22 Sep, 16:05. Aarav reviews within one working day.",
  },
  {
    id: "escalation",
    name: "Overdue escalation",
    purpose:
      "The only message that goes over the owner's head. It states the audit consequence in plain terms, so your lead can decide rather than chase.",
    when: "When an evidence request is five working days overdue",
    who: "A direct message to your engagement lead and the owner",
    tone: "attention",
    time: "Wed 23 Sep, 09:00",
    kicker: "Escalation · client lead",
    title: "Overdue evidence puts CC8.1 at risk",
    subtitle: "REQ-0409 · 6 days overdue · ENG-2041",
    blocks: [
      {
        type: "text",
        text: "Change management tickets for the August sample have not been provided. If they are not in by Wed 30 Sep, the auditor is likely to record a scope limitation for CC8.1.",
      },
      {
        type: "fields",
        items: [
          { k: "Owner", v: "Priya Shah, Engineering" },
          { k: "Was due", v: "Thu 17 Sep" },
          { k: "Control", v: "CC8.1 · Change management" },
          { k: "Last reminder", v: "Mon 21 Sep" },
        ],
      },
    ],
    actions: [{ label: "View request", primary: true }, { label: "Extend due date" }, { label: "Reassign" }],
  },
];
