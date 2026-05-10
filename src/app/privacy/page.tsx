import type { Metadata } from "next";
import { LegalPage, supportEmail } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | LeadLoop",
  description: "Privacy basics for LeadLoop customers and lead intake form submitters."
};

export default function PrivacyPage() {
  const email = supportEmail();

  return (
    <LegalPage title="Privacy Policy" kicker="Launch policy">
      <p>
        LeadLoop helps small sales teams manage leads, follow-ups, notes, and public lead intake forms. This policy
        explains the basic data practices for the MVP. Replace this page with reviewed legal copy before a large public
        launch.
      </p>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Data We Store</h2>
        <p>
          Workspace users may store names, phone numbers, email addresses, companies, sources, requirements, notes,
          follow-up dates, staff assignments, stages, and public intake submissions.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">How Data Is Used</h2>
        <p>
          Data is used to provide the CRM workspace, dashboard metrics, follow-up lists, stale lead detection, imports,
          reports, and copy-ready message drafts. LeadLoop does not send WhatsApp or email messages automatically.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Access And Separation</h2>
        <p>
          Production data is stored in Supabase with row-level security so authenticated users can only access data for
          their own workspace. Demo workspace data is sample/local data and is isolated from production workspaces.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-black text-[#08090A]">Deletion Requests</h2>
        <p>
          To request data deletion or export, contact <a className="font-black text-[#2563EB]" href={`mailto:${email}`}>{email}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
