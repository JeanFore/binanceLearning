import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function requireAgentAuth(request: Request) {
  const expected = process.env.AGENT_API_KEY;

  if (!expected) {
    return null;
  }

  const apiKey = request.headers.get("x-agent-api-key");
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (apiKey === expected || bearer === expected) {
    return null;
  }

  return NextResponse.json(
    {
      error: "UNAUTHORIZED",
      message: "Send x-agent-api-key or Authorization: Bearer with the agent key.",
    },
    { status: 401 },
  );
}

export function jsonError(error: unknown, status = 500) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: "SERVER_ERROR", message }, { status });
}
