import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { getLearnerOrDefault } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const noteSchema = z.object({
  learnerId: z.string().optional().nullable(),
  scope: z.string().min(2).max(60).default("GENERAL"),
  title: z.string().min(3).max(160),
  content: z.string().min(10).max(4000),
  createdBy: z.string().min(2).max(80).default("agent"),
});

export async function GET(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const learner = await getLearnerOrDefault(searchParams.get("learnerId"));
    const notes = await prisma.agentNote.findMany({
      where: {
        OR: [{ learnerId: learner.id }, { learnerId: null }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ learner, notes });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const input = noteSchema.parse(await request.json());
    const learnerId = input.learnerId
      ? (await getLearnerOrDefault(input.learnerId)).id
      : null;

    const note = await prisma.agentNote.create({
      data: {
        learnerId,
        scope: input.scope,
        title: input.title,
        content: input.content,
        createdBy: input.createdBy,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
