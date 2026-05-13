import { NextResponse } from "next/server";
import { ApplicationError } from "@/shared/errors/application-error";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};

export function apiErrorResponse(error: unknown, requestId = createCorrelationId()) {
  if (error instanceof ApplicationError) {
    return NextResponse.json<ApiErrorEnvelope>(
      { error: { code: error.code, message: error.message, requestId } },
      { status: error.statusCode }
    );
  }

  return NextResponse.json<ApiErrorEnvelope>(
    { error: { code: "INTERNAL_ERROR", message: "Unexpected server error.", requestId } },
    { status: 500 }
  );
}
