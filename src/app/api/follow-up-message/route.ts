import { NextResponse } from "next/server";
import { Lead, FollowUpKind } from "@/lib/types";
import { buildTemplateMessage, isFollowUpKind } from "@/lib/follow-up-message";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

type RequestBody = {
  lead: Lead;
  kind: FollowUpKind;
};

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: getRateLimitKey(request, "follow-up-message"),
    limit: 30,
    windowMs: 60_000
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many message requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": `${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)}` } }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isFollowUpKind(body.kind) || !body.lead || typeof body.lead !== "object") {
    return NextResponse.json({ error: "Lead and message type are required." }, { status: 400 });
  }

  const fallback = buildTemplateMessage(body.kind, body.lead);

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
                name: body.lead.fullName,
                stage: body.lead.stage,
                interest: body.lead.jobInterest,
                infoStatus: body.lead.documentStatus,
                lastContactedDate: body.lead.lastContactedDate,
                nextFollowUpDate: body.lead.nextFollowUpDate,
                notes: body.lead.notes
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
