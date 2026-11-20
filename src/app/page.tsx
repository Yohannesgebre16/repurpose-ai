import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <span className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-neutral-600">
        Powered by Gemini 2.5 Flash
      </span>

      <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
        Turn one piece of content into a full multi-channel campaign.
      </h1>

      <p className="mt-4 max-w-xl text-base text-neutral-600">
        Paste a blog post, transcript, or rough notes and instantly generate
        tailored LinkedIn posts, X threads, and newsletter sections inside
        your team workspace.
      </p>

      <div className="mt-8 flex items-center gap-4">
        {userId ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Open Workspace Dashboard
          </Link>
        ) : (
          <>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800">
                Start Repurposing Free
              </button>
            </SignUpButton>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="rounded-lg border bg-white px-6 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100">
                Sign In
              </button>
            </SignInButton>
          </>
        )}
      </div>
    </main>
  );
}