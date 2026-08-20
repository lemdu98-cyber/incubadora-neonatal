import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/users/:path*", "/patients/:path*", "/guardians/:path*", "/incubators/:path*", "/admissions/:path*", "/devices/:path*", "/sensors/:path*"],
};
