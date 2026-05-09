import { NextResponse } from "next/server";
import { Candidate, FollowUpKind } from "@/lib/types";
import { formatDate } from "@/lib/candidate-utils";

type RequestBody = {
  candidate: Candidate;
  kind: FollowUpKind;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const fallback = templateMessage(body.kind, body.candidate);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ message: fallback, source: "template" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Write concise, professional sales follow-up messages for WhatsApp or email. Keep it short, friendly, and copy-ready. Never claim a message was sent. Return only the message text."
          },
          {
            role: "user",
            content: JSON.stringify({
              messageType: body.kind,
              lead: {
                name: body.candidate.fullName,
                stage: body.candidate.stage,
                interest: body.candidate.jobInterest,
                infoStatus: body.candidate.documentStatus,
                lastContactedDate: body.candidate.lastContactedDate,
                nextFollowUpDate: body.candidate.nextFollowUpDate,
                notes: body.candidate.notes
              }
            })
          }
        ]
      })
    });

    if (!response.ok) throw new Error("OpenAI request failed");
    const data = await response.json();
    const text =
      data.output_text ||
      data.output?.flatMap((item: { content?: { text?: string }[] }) => item.content || []).map((item: { text?: string }) => item.text).join("\n") ||
      fallback;

    return NextResponse.json({ message: text, source: "openai" });
  } catch {
    return NextResponse.json({ message: fallback, source: "template" });
  }
}

function templateMessage(kind: FollowUpKind, candidate: Candidate) {
  const name = candidate.fullName || "there";
  const interest = candidate.jobInterest || "your inquiry";
  const lastContact = formatDate(candidate.lastContactedDate);
  const nextFollowUp = formatDate(candidate.nextFollowUpDate);
  const infoStatus = candidate.documentStatus || "Not requested";
  const notes = candidate.notes ? `\n\nContext: ${candidate.notes}` : "";

  const templates: Record<FollowUpKind, string> = {
    "First follow-up": `Hi ${name}, thanks for your interest in ${interest}. Are you still open to a quick chat about the next steps? Let me know a good time today or tomorrow.${notes}`,
    "Appointment reminder": `Hi ${name}, quick reminder about our appointment for ${interest}. Please confirm if the time still works for you, or let me know if we should reschedule.${notes}`,
    "Info request": `Hi ${name}, quick follow-up on ${interest}. I just need a little more information to help you properly. Current info status: ${infoStatus}. Could you send the missing details when convenient?${notes}`,
    "Proposal follow-up": `Hi ${name}, checking in on the proposal/details we shared for ${interest}. Any questions or changes you would like us to adjust?${notes}`,
    "Reactivation message": `Hi ${name}, checking back in about ${interest}. We last connected on ${lastContact}. If this is still relevant, I would be happy to pick things back up.${notes}`,
    "Won lead thank-you": `Hi ${name}, thank you for choosing us for ${interest}. We appreciate it and will keep you updated on the next steps.${notes}`,
    "Lost lead polite close": `Hi ${name}, just closing the loop on ${interest}. No worries if the timing is not right now. If anything changes, feel free to message us anytime.${notes}`,
    "No-response follow-up": `Hi ${name}, I tried reaching you after our last contact on ${lastContact}. Are you still interested in ${interest}? A quick yes or no is completely fine.${notes}`,
    "Stale lead reactivation": `Hi ${name}, checking back in about ${interest}. Your follow-up was marked for ${nextFollowUp}. If you are still interested, reply when convenient and I can help with next steps.${notes}`
  };

  return templates[kind];
}
