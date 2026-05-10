import type { Metadata } from "next";
import { LegalPage, supportEmail } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | LeadLoop",
  description: "Basic MVP terms for LeadLoop."
};

export default function TermsPage() {
  const email = supportEmail();

  return (
    <LegalPage title="Terms of Service" kicker="Launch terms">
      <p>
        These MVP terms are provided so early customers understand the intended use of LeadLoop. Replace this page with
        reviewed legal terms before a wider commercial launch.
      </p>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Use Of LeadLoop</h2>
        <p>
          LeadLoop is a lightweight lead follow-up CRM. Users are responsible for the data they upload, import, or
          collect through public intake forms.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">No Automatic Messaging</h2>
        <p>
          LeadLoop may generate copy-ready message drafts, but it does not send WhatsApp, SMS, or email messages
          automatically.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Availability</h2>
        <p>
          The MVP is provided as an early-stage product. Keep independent backups of critical sales data until your
          production backup/export process is fully confirmed.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Contact</h2>
        <p>
          Questions about these terms can be sent to <a className="font-black text-[#2563EB]" href={`mailto:${email}`}>{email}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
