export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.server.config");
  }
}

export const onRequestError = async (
  error: Error & { digest?: string },
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string };
  }
) => {
  // Log errors to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Request error:", {
      error: error.message,
      digest: error.digest,
      path: request.path,
      method: request.method,
    });
  }

  // Sentry will automatically capture this via instrumentation
};
