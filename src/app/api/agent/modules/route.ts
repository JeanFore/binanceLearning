import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const moduleSchema = z
  .object({
    courseId: z.string().optional(),
    courseSlug: z.string().optional(),
    title: z.string().min(3).max(180),
    summary: z.string().min(20).max(2000),
    sortOrder: z.number().int().min(0).default(0),
  })
  .refine((input) => input.courseId || input.courseSlug, {
    message: "Provide courseId or courseSlug.",
    path: ["courseId"],
  });

export async function POST(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const input = moduleSchema.parse(await request.json());
    const course = await prisma.course.findFirst({
      where: input.courseId ? { id: input.courseId } : { slug: input.courseSlug },
    });

    if (!course) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Course does not exist." },
        { status: 404 },
      );
    }

    const learningModule = await prisma.module.create({
      data: {
        courseId: course.id,
        title: input.title,
        summary: input.summary,
        sortOrder: input.sortOrder,
      },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ module: learningModule }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
