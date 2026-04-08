import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/server/services/auth-service";
import { LoginForm } from "@/features/auth/login-form";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
      <div className="w-full">
        <p className="mb-2 text-center text-xs uppercase tracking-widest text-zinc-500">SmartLink / OneQR</p>
        <h1 className="mb-6 text-center text-3xl font-bold text-zinc-900">Admin Login</h1>
        <div className="flex justify-center"><LoginForm /></div>
      </div>
    </main>
  );
}
