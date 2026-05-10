import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, supportEmail } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Contact | LeadLoop",
  description: "Contact LeadLoop for access, setup, and support."
};

export default function ContactPage() {
  const email = supportEmail();

  return (
    <LegalPage title="Contact LeadLoop" kicker="Request access">
      <p>
        Want to try LeadLoop with your sales team, need help setting up Supabase, or want support importing your lead
        sheet? Send a note to <a className="font-black text-[#2563EB]" href={`mailto:${email}`}>{email}</a>.
      </p>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Best First Message</h2>
        <p>
          Include your business name, team size, approximate number of leads, and whether you want to use CSV import,
          public intake forms, or both.
        </p>
      </section>
      <section className="flex flex-wrap gap-2">
        <a className="btn-primary" href={`mailto:${email}?subject=LeadLoop access request`}>
          Request access
        </a>
        <Link className="btn-secondary" href="/dashboard">Open app</Link>
        <Link className="btn-secondary" href="/support">Support</Link>
      </section>
    </LegalPage>
  );
}
