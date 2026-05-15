import { NextResponse } from "next/server";
import { activeTenantCookieName } from "@/shared/auth/active-tenant";
import { createSupabaseServerClient } from "@/shared/auth/supabase-server";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function POST() {
  const requestId = createCorrelationId();

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();

    const response = NextResponse.json({ data: { status: "SIGNED_OUT" }, requestId });
    response.cookies.set(activeTenantCookieName, "", { path: "/", maxAge: 0 });

    return response;
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
