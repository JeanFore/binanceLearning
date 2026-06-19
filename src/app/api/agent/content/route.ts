import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { DRAFT_STATUSES } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const contentDraftSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(3).max(160),
  body: z.string().min(20),
  status: z.enum(DRAFT_STATUSES).default("DRAFT"),
  createdBy: z.string().min(2).max(80).default("agent"),
});

export async function GET(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId") ?? undefined;

  const drafts = await prisma.contentDraft.findMany({
    where: lessonId ? { lessonId } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          type: true,
          difficulty: true,
        },
      },
    },
  });

  return NextResponse.json({ drafts });
}

export async function POST(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const input = contentDraftSchema.parse(await request.json());
    const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId } });

    if (!lesson) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Lesson does not exist." },
        { status: 404 },
      );
    }

    const draft = await prisma.contentDraft.create({
      data: input,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
