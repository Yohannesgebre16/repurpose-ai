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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setProjects((prev) => [data.project, ...prev]);
      setTitle("");
      setOriginalText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(projectId: string, outputId: string) {
    setSavingId(outputId);
    try {
      const res = await fetch(`/api/outputs/${outputId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draftText }),
      });
      if (!res.ok) throw new Error("Failed to save changes");

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                outputs: p.outputs.map((o) =>
                  o.id === outputId ? { ...o, content: draftText } : o
                ),
              }
            : p
        )
      );
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteProject(projectId: string) {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <button
                type="button"
                onClick={() => handleDeleteProject(project.id)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Delete Project
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {project.outputs.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-lg border bg-neutral-50 p-4"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-neutral-600">
                          {item.platform.replace("_", " ")}
                        </span>
                        <div className="flex items-center gap-3">
                          {!isEditing && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setDraftText(item.content);
                                }}
                                className="text-xs font-medium text-neutral-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(item.id, item.content)
                                }
                                className="text-xs font-medium text-blue-600 hover:underline"
                              >
                                {copiedId === item.id ? "Copied!" : "Copy"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={7}
                            value={draftText}
                            onChange={(e) => setDraftText(e.target.value)}
                            className="w-full rounded border bg-white p-2 text-sm focus:border-black focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={savingId === item.id}
                              onClick={() =>
                                handleSaveEdit(project.id, item.id)
                              }
                              className="rounded bg-black px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-800"
                            >
                              {savingId === item.id ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm text-neutral-800">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}