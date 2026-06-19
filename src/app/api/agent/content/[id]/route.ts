import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { DRAFT_STATUSES } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const updateDraftSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  body: z.string().min(20).optional(),
  status: z.enum(DRAFT_STATUSES).optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const { id } = await params;
    const input = updateDraftSchema.parse(await request.json());
    const draft = await prisma.contentDraft.update({
      where: { id },
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

    return NextResponse.json({ draft });
  } catch (error) {
    return jsonError(error);
  }
}
