import Link from "next/link";
import { Activity } from "lucide-react";

export function LegalPage({
  title,
  kicker,
  children
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-3 font-black text-[#08090A]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563EB] text-white shadow-lg shadow-blue-600/20">
            <Activity size={21} />
          </span>
          <span>
            <span className="block text-lg leading-tight">LeadLoop</span>
            <span className="block text-xs font-bold text-[#687184]">Follow-up CRM</span>
          </span>
        </Link>
        <section className="app-card glass-panel p-6">
          <p className="eyebrow">{kicker}</p>
          <h1 className="mt-1 text-3xl font-black text-[#08090A]">{title}</h1>
          <div className="prose-free mt-6 space-y-5 text-sm leading-6 text-[#263244]">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function supportEmail() {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";
}
