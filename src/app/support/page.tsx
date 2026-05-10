import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, supportEmail } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Support | LeadLoop",
  description: "Support and launch help for LeadLoop workspaces."
};

export default function SupportPage() {
  const email = supportEmail();

  return (
    <LegalPage title="Support" kicker="Help center">
      <p>
        Need help with setup, data import, public intake forms, or workspace access? Contact{" "}
        <a className="font-black text-[#2563EB]" href={`mailto:${email}`}>{email}</a>.
      </p>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Before Contacting Support</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Check that your Supabase environment variables are set in Vercel.</li>
          <li>Confirm your Supabase Auth redirect URLs include your production domain.</li>
          <li>Use the sample CSV from the Import page if your spreadsheet columns are not mapping cleanly.</li>
          <li>Try the demo workspace to confirm the browser can run the app.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Important Links</h2>
        <div className="flex flex-wrap gap-2">
          <Link className="btn-secondary" href="/privacy">Privacy Policy</Link>
          <Link className="btn-secondary" href="/terms">Terms</Link>
          <Link className="btn-secondary" href="/contact">Contact</Link>
          <Link className="btn-primary" href="/">Open LeadLoop</Link>
        </div>
      </section>
    </LegalPage>
  );
}
