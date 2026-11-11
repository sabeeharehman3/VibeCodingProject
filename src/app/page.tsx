import { Suspense } from "react";
import { connection } from "next/server";

type Row = { label: string; ok: boolean; detail: string };

async function checkSupabase(): Promise<Omit<Row, "label">> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return { ok: false, detail: "Environment variables are missing" };
  }
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    return res.ok
      ? { ok: true, detail: "Connected" }
      : { ok: false, detail: `Responded with HTTP ${res.status}` };
  } catch {
    return { ok: false, detail: "Could not reach Supabase" };
  }
}

function StatusRow({ label, ok, detail }: Row) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-2 text-sm">
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${
            ok ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        {detail}
      </span>
    </li>
  );
}

// Runs on every request (after connection()), so the checks are always live.
async function LiveStatus() {
  await connection();
  const supabase = await checkSupabase();
  const onVercel = Boolean(process.env.VERCEL);

  return (
    <>
      <StatusRow label="Supabase" {...supabase} />
      <StatusRow
        label="Vercel"
        ok={onVercel}
        detail={
          onVercel ? `Deployed (${process.env.VERCEL_ENV})` : "Running locally"
        }
      />
    </>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">
          VibeCodingProject
        </h1>
        <p className="mt-2 text-sm opacity-70">
          Next.js + Supabase, deployed on Vercel.
        </p>

        <ul className="mt-8 divide-y divide-black/10 rounded-xl border border-black/10 dark:divide-white/10 dark:border-white/10">
          <StatusRow label="Next.js" ok detail="Running" />
          <Suspense
            fallback={<li className="px-4 py-3 text-sm opacity-60">Checking…</li>}
          >
            <LiveStatus />
          </Suspense>
        </ul>

        <p className="mt-6 text-xs opacity-60">
          Edit <code className="font-mono">src/app/page.tsx</code> to start
          building.
        </p>
      </div>
    </main>
  );
}
