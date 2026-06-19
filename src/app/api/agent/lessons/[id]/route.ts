import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { LESSON_DIFFICULTIES, LESSON_TYPES } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const updateLessonSchema = z.object({
  title: z.string().min(3).max(180).optional(),
  type: z.enum(LESSON_TYPES).optional(),
  difficulty: z.enum(LESSON_DIFFICULTIES).optional(),
  durationMinutes: z.number().int().min(5).max(240).optional(),
  objective: z.string().min(20).max(2000).optional(),
  content: z.string().min(50).optional(),
  practicePrompt: z.string().max(3000).optional().nullable(),
  successCriteria: z.string().max(3000).optional().nullable(),
  resources: z.array(z.string().min(3).max(500)).max(20).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const { id } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        },
        contentDrafts: {
          orderBy: { updatedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Lesson does not exist." },
        { status: 404 },
      );
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const { id } = await params;
    const input = updateLessonSchema.parse(await request.json());
    const { resources, ...lessonFields } = input;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...lessonFields,
        ...(resources !== undefined
          ? { resources: resources === null ? null : JSON.stringify(resources) }
          : {}),
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

    return NextResponse.json({ lesson });
  } catch (error) {
    return jsonError(error);
  }
}
