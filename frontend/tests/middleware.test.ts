import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";

import { middleware } from "@/middleware";

function buildRequest(pathname: string, cookieValue?: string): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const headers = new Headers();
  if (cookieValue) {
    headers.set("cookie", cookieValue);
  }
  return new NextRequest(url, { headers });
}

describe("middleware", () => {
  test("redirects to /login when session cookie is missing", () => {
    const response = middleware(buildRequest("/profile"));
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toBeTruthy();
    expect(new URL(location!).pathname).toBe("/login");
    expect(new URL(location!).searchParams.get("next")).toBe("/profile");
  });

  test("does not redirect when session cookie is present", () => {
    const response = middleware(buildRequest("/profile", "hcmap_session=abc"));
    expect(response.headers.get("location")).toBeNull();
  });

  test("does not redirect /login itself", () => {
    const response = middleware(buildRequest("/login"));
    expect(response.headers.get("location")).toBeNull();
  });

  test("does not redirect API routes", () => {
    const response = middleware(buildRequest("/api/health"));
    expect(response.headers.get("location")).toBeNull();
  });

  test("omits next param when redirecting from /", () => {
    const response = middleware(buildRequest("/"));
    expect(response.status).toBe(307);
    const location = response.headers.get("location")!;
    expect(new URL(location).searchParams.get("next")).toBeNull();
  });
});
