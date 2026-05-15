import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/shared/auth/supabase-server";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";
import { UnauthorizedError } from "@/shared/errors/application-error";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(256)
}).strict();

export async function POST(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const body = loginSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });

    if (error) {
      throw new UnauthorizedError("Invalid credentials.");
    }

    return NextResponse.json({ data: { status: "SIGNED_IN" }, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
