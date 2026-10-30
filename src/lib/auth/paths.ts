export const PUBLIC_APP_PREFIXES = [
  "/",
  "/how-it-works",
  "/about",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
  "/forgot-password",
  "/update-password",
  "/verify-email",
  "/auth/callback",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export function isAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-email"
  );
}
