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
              "Write concise, professional recruitment follow-up messages for WhatsApp or email. Keep it short, friendly, and copy-ready. Never claim a message was sent. Return only the message text."
          },
          {
            role: "user",
            content: JSON.stringify({
              messageType: body.kind,
              candidate: {
                name: body.candidate.fullName,
                stage: body.candidate.stage,
                jobInterest: body.candidate.jobInterest,
                documentStatus: body.candidate.documentStatus,
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
  const role = candidate.jobInterest || "the role";
  const lastContact = formatDate(candidate.lastContactedDate);
  const nextFollowUp = formatDate(candidate.nextFollowUpDate);
  const docStatus = candidate.documentStatus || "Not requested";
  const notes = candidate.notes ? `\n\nContext: ${candidate.notes}` : "";

  const templates: Record<FollowUpKind, string> = {
    "First follow-up": `Hi ${name}, thanks for your interest in ${role}. Are you still open to a quick chat about the next steps? Let me know a good time today or tomorrow.${notes}`,
    "Document reminder": `Hi ${name}, quick reminder to send the pending documents for ${role}. Current document status: ${docStatus}. Once received, we can keep your application moving.${notes}`,
    "Interview reminder": `Hi ${name}, this is a quick reminder about the interview stage for ${role}. Please confirm your availability, and let me know if anything has changed.${notes}`,
    "No-response follow-up": `Hi ${name}, I tried reaching you after our last contact on ${lastContact}. Are you still interested in ${role}? A quick yes or no is completely fine.${notes}`,
    "Stale candidate reactivation": `Hi ${name}, checking back in about ${role}. We last connected on ${lastContact}. If you are still exploring opportunities, I would be happy to restart the conversation.${notes}`,
    "Client feedback pending follow-up": `Hi ${name}, quick update: your profile for ${role} is still at the client feedback stage. I will share news as soon as I have it. Please let me know if your availability has changed.${notes}`,
    "Final soft follow-up": `Hi ${name}, I wanted to do one final check-in about ${role}. Your next follow-up was marked for ${nextFollowUp}. If you are still interested, reply when convenient and I will help with next steps.${notes}`
  };

  return templates[kind];
}
