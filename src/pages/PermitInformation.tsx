import { Link } from 'react-router-dom';

export default function PermitInformation({ title }: { title: string }) {
  return <main style={{maxWidth: 1000, margin: '0 auto', padding: '80px 24px', lineHeight: 1.7}}>
    <h1>{title}</h1>
    <p>PreClear is a Homeowner Permit Compliance Checker. Describe your project, select a jurisdiction, and ask Aura to explain requirements retrieved from reviewed municipal rules.</p>
    <Link to="/permit-agent" className="site-header__link site-header__link--primary">Open Permit Assistant</Link>
    <h2>How a lookup works</h2>
    <ol>
      <li>Python ingestion collects municipal sources with Apify or reuses raw documents and chunks already in Supabase.</li>
      <li>Rules are normalized into PostgreSQL with source evidence, human review and an expiry date.</li>
      <li>FastAPI compares project attributes against rules for the selected jurisdiction.</li>
      <li>An OpenAI model interprets your question, calls the lookup tool and explains the retrieved requirements with source links.</li>
    </ol>
    <h2>What to expect</h2>
    <p>Missing measurements, conflicting requirements or absent rules lead to a request for more information or verification with your municipality. PreClear does not issue permits, submit applications, guarantee inspections or certify compliance.</p>
    <p>The jurisdiction selector lists only locations with current reviewed rules. We do not claim a verified coverage count. If the data or model service is unavailable, the assistant says so.</p>
    <h2>Availability</h2>
    <p>The assistant requires sign-in and a configured data service. Workspace plans and reports elsewhere in the product are interface previews, not completed permit evaluations. Paid plans and automatic filing are not offered through this integration.</p>
  </main>;
}
