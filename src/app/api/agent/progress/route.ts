import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { PROGRESS_STATUSES, getLearnerOrDefault } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const progressSchema = z.object({
  learnerId: z.string().optional(),
  lessonId: z.string().min(1),
  status: z.enum(PROGRESS_STATUSES),
  score: z.number().int().min(0).max(100).optional().nullable(),
  reflection: z.string().max(3000).optional().nullable(),
  lastArtifact: z.string().max(3000).optional().nullable(),
});

export async function GET(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const learner = await getLearnerOrDefault(searchParams.get("learnerId"));
    const progress = await prisma.lessonProgress.findMany({
      where: { learnerId: learner.id },
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

    return NextResponse.json({ learner, progress });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const input = progressSchema.parse(await request.json());
    const learner = await getLearnerOrDefault(input.learnerId);
    const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId } });

    if (!lesson) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Lesson does not exist." },
        { status: 404 },
      );
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        learnerId_lessonId: {
          learnerId: learner.id,
          lessonId: input.lessonId,
        },
      },
      update: {
        status: input.status,
        score: input.score,
        reflection: input.reflection,
        lastArtifact: input.lastArtifact,
        completedAt: input.status === "COMPLETED" ? new Date() : null,
      },
      create: {
        learnerId: learner.id,
        lessonId: input.lessonId,
        status: input.status,
        score: input.score,
        reflection: input.reflection,
        lastArtifact: input.lastArtifact,
        completedAt: input.status === "COMPLETED" ? new Date() : null,
      },
      include: {
        lesson: true,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    return jsonError(error);
  }
}
