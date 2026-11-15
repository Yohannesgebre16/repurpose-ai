import { NextResponse } from "next/server";
import { syncUserAndWorkspace } from "@/lib/auth-sync";
import { RepurposeRequestSchema } from "@/lib/schemas/repurpose";
import { generateRepurposedContent } from "@/lib/ai/repurpose";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // 1. Authenticate & resolve the tenant's active workspace
    const session = await syncUserAndWorkspace();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate request payload
    const body = await req.json();
    const parsed = RepurposeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, sourceType, originalText } = parsed.data;

    // 3. Generate structured outputs via Gemini
    const generated = await generateRepurposedContent(title, originalText);

    // 4. Persist Project + RepurposedContent atomically inside the active workspace
    const project = await db.project.create({
      data: {
        title,
        sourceType,
        originalText,
        workspaceId: session.activeWorkspace.id,
        userId: session.user.id,
        outputs: {
          create: [
            {
              platform: "LINKEDIN",
              content: generated.linkedinPost,
            },
            {
              platform: "TWITTER_THREAD",
              content: generated.twitterThread.join("\n\n---\n\n"),
            },
            {
              platform: "NEWSLETTER",
              content: generated.newsletterSummary,
            },
          ],
        },
      },
      include: {
        outputs: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[REPURPOSE_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to repurpose content" },
      { status: 500 }
    );
  }
}