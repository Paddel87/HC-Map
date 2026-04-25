import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getServerMe } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerMe();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  return <>{children}</>;
}
