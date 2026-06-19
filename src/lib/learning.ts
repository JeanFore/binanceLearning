import { prisma } from "@/lib/prisma";

export const PROGRESS_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED",
] as const;

export const LESSON_TYPES = ["THEORY", "PRACTICE"] as const;

export const LESSON_DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const DRAFT_STATUSES = ["DRAFT", "READY", "ARCHIVED"] as const;

export async function getLearnerOrDefault(learnerId?: string | null) {
  if (learnerId) {
    const learner = await prisma.learner.findUnique({ where: { id: learnerId } });
    if (learner) {
      return learner;
    }
  }

  const learner = await prisma.learner.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!learner) {
    throw new Error("No learner exists. Run npm run db:seed or create one with POST /api/learners.");
  }

  return learner;
}

export async function getAgentContext(learnerId?: string | null) {
  const learner = await getLearnerOrDefault(learnerId);

  const [courses, notes, drafts] = await Promise.all([
    prisma.course.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: {
              orderBy: { sortOrder: "asc" },
              include: {
                progress: {
                  where: { learnerId: learner.id },
                },
              },
            },
          },
        },
      },
    }),
    prisma.agentNote.findMany({
      where: {
        OR: [{ learnerId: learner.id }, { learnerId: null }],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.contentDraft.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  const lessons = courses.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => {
        const progress = lesson.progress[0] ?? null;
        return {
          ...lesson,
          courseId: course.id,
          courseTitle: course.title,
          moduleId: module.id,
          moduleTitle: module.title,
          progress,
        };
      }),
    ),
  );

  const completed = lessons.filter((lesson) => lesson.progress?.status === "COMPLETED").length;
  const inProgress = lessons.filter((lesson) => lesson.progress?.status === "IN_PROGRESS").length;
  const blocked = lessons.filter((lesson) => lesson.progress?.status === "BLOCKED").length;
  const total = lessons.length;

  return {
    learner,
    stats: {
      totalLessons: total,
      completedLessons: completed,
      inProgressLessons: inProgress,
      blockedLessons: blocked,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    },
    nextLessons: lessons
      .filter((lesson) => lesson.progress?.status !== "COMPLETED")
      .slice(0, 3),
    courses,
    notes,
    recentDrafts: drafts,
  };
}

export function parseResources(resources?: string | null) {
  if (!resources) {
    return [];
  }

  try {
    const parsed = JSON.parse(resources);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
