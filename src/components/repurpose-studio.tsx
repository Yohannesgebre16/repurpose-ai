"use client";

import { useState } from "react";

type OutputItem = {
  id: string;
  platform: string;
  content: string;
};

type ProjectItem = {
  id: string;
  title: string;
  createdAt: string;
  outputs: OutputItem[];
};

export function RepurposeStudio({
  initialProjects,
}: {
  initialProjects: ProjectItem[];
}) {
  const [title, setTitle] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sourceType: "TEXT", originalText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setProjects((prev) => [data.project, ...prev]);
      setTitle("");
      setOriginalText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="mt-8 space-y-10">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold">New Repurpose Project</h2>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Project Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Q4 Product Launch Blog Post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Source Content (min 50 characters)
          </label>
          <textarea
            required
            rows={6}
            placeholder="Paste your blog post, video transcript, or rough notes here..."
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Generating with Gemini..." : "Repurpose Content"}
        </button>
      </form>

      <div className="space-y-8">
        {projects.map((project) => (
          <div key={project.id} className="space-y-4 rounded-xl border p-6">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {project.outputs.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-lg border bg-neutral-50 p-4"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider text-neutral-600">
                        {item.platform.replace("_", " ")}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.id, item.content)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        {copiedId === item.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-neutral-800">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
