import { NextResponse } from "next/server";
import { jsonError, requireAgentAuth } from "@/lib/api";
import { getAgentContext } from "@/lib/learning";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requireAgentAuth(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const context = await getAgentContext(searchParams.get("learnerId"));
    return NextResponse.json(context);
  } catch (error) {
    return jsonError(error);
  }
}
