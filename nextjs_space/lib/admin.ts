
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "superadmin") {
    redirect("/dashboard");
  }
  
  return session;
}

export function isSuperAdmin(role?: string) {
  return role === "superadmin";
}
