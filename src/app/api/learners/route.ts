import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const learnerSchema = z.object({
  name: z.string().min(2),
  email: z.email().optional(),
});

export async function GET(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  const learners = await prisma.learner.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ learners });
}

export async function POST(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const input = learnerSchema.parse(await request.json());
    const learner = await prisma.learner.create({ data: input });
    return NextResponse.json({ learner }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
