import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { LESSON_DIFFICULTIES, LESSON_TYPES } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const lessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(3).max(180),
  type: z.enum(LESSON_TYPES).default("THEORY"),
  difficulty: z.enum(LESSON_DIFFICULTIES).default("BEGINNER"),
  durationMinutes: z.number().int().min(5).max(240).default(20),
  objective: z.string().min(20).max(2000),
  content: z.string().min(50),
  practicePrompt: z.string().max(3000).optional().nullable(),
  successCriteria: z.string().max(3000).optional().nullable(),
  resources: z.array(z.string().min(3).max(500)).max(20).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export async function POST(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const input = lessonSchema.parse(await request.json());
    const learningModule = await prisma.module.findUnique({
      where: { id: input.moduleId },
    });

    if (!learningModule) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Module does not exist." },
        { status: 404 },
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: input.moduleId,
        title: input.title,
        type: input.type,
        difficulty: input.difficulty,
        durationMinutes: input.durationMinutes,
        objective: input.objective,
        content: input.content,
        practicePrompt: input.practicePrompt,
        successCriteria: input.successCriteria,
        resources: input.resources ? JSON.stringify(input.resources) : undefined,
        sortOrder: input.sortOrder,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
