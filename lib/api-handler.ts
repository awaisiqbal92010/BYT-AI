import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    correlationId: string;
    timestamp: string;
  };
}

export type ApiRouteHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse | Response>;

/**
 * Enterprise Resilience API Route Wrapper
 * Wraps route handlers in try/catch, assigns correlation IDs,
 * prevents server crashes, and formats errors into a unified contract.
 */
export function withApiHandler(handler: ApiRouteHandler): ApiRouteHandler {
  return async (request: NextRequest, context?: any) => {
    const correlationId = request.headers.get("x-correlation-id") || randomUUID();

    try {
      const response = await handler(request, context);
      response.headers.set("x-correlation-id", correlationId);
      return response;
    } catch (error: any) {
      console.error(`[API Error][${correlationId}]`, {
        url: request.url,
        method: request.method,
        error: error?.message || error,
        stack: error?.stack,
      });

      const statusCode = typeof error?.status === "number" ? error.status : 500;
      const errorCode = error?.code || (statusCode === 404 ? "NOT_FOUND" : statusCode === 401 ? "UNAUTHORIZED" : "INTERNAL_SERVER_ERROR");

      const errorPayload: ApiErrorResponse = {
        error: {
          code: errorCode,
          message: error?.message || "An unexpected error occurred while processing the request.",
          correlationId,
          timestamp: new Date().toISOString(),
        },
      };

      const res = NextResponse.json(errorPayload, { status: statusCode });
      res.headers.set("x-correlation-id", correlationId);
      return res;
    }
  };
}
