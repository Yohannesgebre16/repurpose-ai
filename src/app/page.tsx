import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { syncUserAndWorkspace } from "@/lib/auth-sync";

export default async function DashboardPage() {
  const session = await syncUserAndWorkspace();

  if (!session) {
    redirect("/");
  }

  const { user, activeWorkspace } = session;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between border-b pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Active Workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {activeWorkspace.name}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-600">{user.email}</span>
          <UserButton />
        </div>
      </header>

      <section className="mt-10 rounded-xl border border-dashed p-10 text-center">
        <h2 className="text-lg font-medium">Database & Auth Synced</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Workspace ID:{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
            {activeWorkspace.id}
          </code>
        </p>
      </section>
    </main>
  );
}
