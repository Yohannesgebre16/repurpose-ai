import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { syncUserAndWorkspace } from "@/lib/auth-sync";
import { db } from "@/lib/db";
import { RepurposeStudio } from "@/components/repurpose-studio";

export default async function DashboardPage() {
  const session = await syncUserAndWorkspace();

  if (!session) {
    redirect("/");
  }

  const { user, activeWorkspace } = session;

  const projects = await db.project.findMany({
    where: { workspaceId: activeWorkspace.id },
    include: { outputs: true },
    orderBy: { createdAt: "desc" },
  });

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    title: p.title,
    createdAt: p.createdAt.toISOString(),
    outputs: p.outputs.map((o) => ({
      id: o.id,
      platform: o.platform,
      content: o.content,
    })),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
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

      <RepurposeStudio initialProjects={serializedProjects} />
    </main>
  );
}
