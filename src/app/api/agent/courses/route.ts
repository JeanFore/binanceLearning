import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const courseSchema = z.object({
  slug: z.string().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(3).max(180),
  description: z.string().min(20).max(2000),
  goal: z.string().min(20).max(2000),
  riskNotice: z.string().min(20).max(2000),
  sortOrder: z.number().int().min(0).default(0),
});

export async function POST(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const input = courseSchema.parse(await request.json());
    const course = await prisma.course.upsert({
      where: { slug: input.slug },
      update: {
        title: input.title,
        description: input.description,
        goal: input.goal,
        riskNotice: input.riskNotice,
        sortOrder: input.sortOrder,
      },
      create: input,
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
