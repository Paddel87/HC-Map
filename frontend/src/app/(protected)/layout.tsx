import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PinLockProvider } from "@/components/pin/pin-lock-provider";
import { getServerMe } from "@/lib/auth-server";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getServerMe();
  if (!user) {
    redirect("/login");
  }
  return (
    <PinLockProvider>
      <AppShell user={user}>{children}</AppShell>
    </PinLockProvider>
  );
}
