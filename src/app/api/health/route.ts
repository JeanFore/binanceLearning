import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [courses, modules, lessons, learners] = await Promise.all([
      prisma.course.count(),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.learner.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      counts: { courses, modules, lessons, learners },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      { status: "error", database: "unavailable", message },
      { status: 500 },
    );
  }
}
