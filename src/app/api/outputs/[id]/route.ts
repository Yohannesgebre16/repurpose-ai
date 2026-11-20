import { NextResponse } from "next/server";
import { syncUserAndWorkspace } from "@/lib/auth-sync";
import { UpdateOutputSchema } from "@/lib/schemas/workspace";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await syncUserAndWorkspace();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateOutputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid content", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Ensure the output belongs to a project inside the user's workspace
    const existing = await db.repurposedContent.findFirst({
      where: {
        id,
        project: { workspaceId: session.activeWorkspace.id },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Output not found" }, { status: 404 });
    }

    const updated = await db.repurposedContent.update({
      where: { id },
      data: { content: parsed.data.content },
    });

    return NextResponse.json({ output: updated });
  } catch (error) {
    console.error("[OUTPUT_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update output" },
      { status: 500 }
    );
  }
}