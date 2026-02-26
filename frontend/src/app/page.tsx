"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: "ok" | "degraded";
  service: "backend";
  timestamp: string;
  database?: {
    status: "ok" | "error" | "not_configured";
    latencyMs?: number;
    error?: string;
  };
};

type LoadState = "idle" | "loading" | "success" | "error";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function HomePage(): JSX.Element {
  const [state, setState] = useState<LoadState>("idle");
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadHealth(): Promise<void> {
    setState("loading");
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/health?checkDb=true`, {
        method: "GET",
      });

      const payload = (await response.json()) as HealthResponse;

      if (!response.ok) {
        throw new Error(payload.database?.error ?? "Backend health check failed");
      }

      setData(payload);
      setState("success");
    } catch (caughtError) {
      setData(null);
      setState("error");
      setError(caughtError instanceof Error ? caughtError.message : "Unknown error");
    }
  }

  useEffect(() => {
    void loadHealth();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">CodeByte MVP</p>
        <h1 className="text-3xl font-semibold">Frontend Foundation Ready</h1>
        <p className="text-slate-300">
          This placeholder verifies API connectivity by calling
          <code className="mx-1 rounded bg-slate-900 px-2 py-1 text-slate-200">
            {`${apiUrl}/health?checkDb=true`}
          </code>
          .
        </p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Backend Health</h2>
          <button
            onClick={() => {
              void loadHealth();
            }}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            type="button"
          >
            Re-check
          </button>
        </div>

        {state === "loading" && <p className="text-slate-300">Checking backend...</p>}

        {state === "error" && (
          <p className="text-red-300">Health check failed: {error ?? "Unknown error"}</p>
        )}

        {state === "success" && data && (
          <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-emerald-200">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
