import { useState, useEffect, type ReactNode } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Mail,
  Briefcase,
  Printer,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const NDA_REFERENCE = "NDA-2026-8234";
export const NDA_STORAGE_KEY = "sparkr_nda_accepted_v1";

export type NdaRecord = {
  ndaRef: string;
  fullName: string;
  email: string;
  organisation: string;
  role: string;
  purpose: string;
  acceptedAt: string;
  userAgent: string;
};

export function EvaluationAccessWall({ children }: { children: ReactNode }) {
  const [record, setRecord] = useState<NdaRecord | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [role, setRole] = useState("");
  const [purpose, setPurpose] = useState("Evaluation & Platform Review");
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NDA_STORAGE_KEY);
      if (stored) {
        const parsed: NdaRecord = JSON.parse(stored);
        if (parsed.fullName && parsed.email && parsed.ndaRef === NDA_REFERENCE) {
          setRecord(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to read NDA record", e);
    } finally {
      setIsReady(true);
    }
  }, []);

  // Block body scroll when wall is active
  useEffect(() => {
    if (isReady && !record) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [isReady, record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || fullName.trim().length < 3) {
      setFormError("Please enter your full legal name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setFormError("Please enter a valid official email address.");
      return;
    }

    if (!organisation.trim()) {
      setFormError("Please enter your organisation, agency, or company.");
      return;
    }

    if (!role.trim()) {
      setFormError("Please specify your current role or designation.");
      return;
    }

    if (!agreed) {
      setFormError("You must read and check the acceptance box to proceed.");
      return;
    }

    const newRecord: NdaRecord = {
      ndaRef: NDA_REFERENCE,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      organisation: organisation.trim(),
      role: role.trim(),
      purpose: purpose.trim() || "Evaluation & Platform Review",
      acceptedAt: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
    };

    try {
      localStorage.setItem(NDA_STORAGE_KEY, JSON.stringify(newRecord));
      setRecord(newRecord);
    } catch (err) {
      console.error("Failed to save NDA agreement", err);
      setFormError("Unable to save your acceptance. Please ensure local storage is enabled.");
    }
  };

  const handleDownloadCopy = () => {
    const dataToExport = record || {
      ndaRef: NDA_REFERENCE,
      fullName: fullName || "Applicant",
      email: email || "official-email",
      organisation: organisation || "Organisation",
      role: role || "Role",
      purpose: purpose || "Evaluation",
      acceptedAt: new Date().toISOString(),
    };

    const text = `================================================================================
SPARKR DIGITALS · PLATFORM ACCESS & EVALUATION TERMS (NDA)
Document Reference: ${dataToExport.ndaRef}
Execution Date: ${new Date(dataToExport.acceptedAt).toLocaleString("en-NG")}
================================================================================

APPLICANT DETAILS:
Full Name:     ${dataToExport.fullName}
Organisation:  ${dataToExport.organisation}
Role / Title:  ${dataToExport.role}
Email:         ${dataToExport.email}
Purpose:       ${dataToExport.purpose}

COMPANY DETAILS:
Company:       Sparkr Digitals (Lagos, Nigeria)
Signatory:     Quadri Ismail, Chief Executive Manager
Contact:       hello@sparkrdigitals.com | +234 912 766 6376
Issue Date:    8 November 2026
Valid Until:   22 November 2026

SUMMARY OF BINDING TERMS:
1. INTELLECTUAL PROPERTY RIGHTS: All rights, title and interest, including all 
   intellectual property rights under the Nigerian Copyright Act 2022, patents, 
   designs, trade secrets, software code, workflows, architectures and databases 
   remain the sole property of Sparkr Digitals.
2. NO LICENCE: Access is granted solely for non-commercial evaluation, review 
   and demonstration. No licence, assignment, or procurement right is conferred.
3. STRICT CONFIDENTIALITY & PROHIBITIONS: The user agrees not to copy, reverse 
   engineer, decompile, disassemble, screen-record, photograph, reproduce, or 
   create competing products.
4. JURISDICTION: Governed by the laws of the Federal Republic of Nigeria. 
   Arbitration seated in Lagos Court of Arbitration, with immediate injunctive 
   relief available through the Federal High Court of Nigeria.

ELECTRONIC SIGNATURE CONFIRMATION:
The Applicant has executed this agreement electronically. This record serves as 
prima facie evidence of acceptance.
================================================================================`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sparkr-NDA-${dataToExport.ndaRef}-${dataToExport.fullName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // SSR / initial hydration check
  if (!isReady) {
    return <div className="min-h-screen bg-background" />;
  }

  // If user has already signed the NDA, render the app + an unobtrusive floating verification badge
  if (record) {
    return (
      <>
        {children}

        {/* Floating Agreement Badge in lower corner */}
        <div className="fixed bottom-3 right-3 z-50 print:hidden">
          <button
            onClick={() => setShowViewer(true)}
            className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-3 py-1.5 text-xs font-medium text-emerald-200 shadow-lg backdrop-blur-md transition-all hover:bg-emerald-900/90 hover:scale-105"
            title="View signed platform evaluation agreement"
          >
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>NDA: {record.ndaRef}</span>
          </button>
        </div>

        {/* Viewer Modal for returning visitors who want to re-inspect their signed agreement */}
        {showViewer && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
              <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Evaluation Access Agreement Executed</h2>
                    <p className="text-xs text-zinc-400 font-mono">Reference: {record.ndaRef}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewer(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  ✕
                </button>
              </div>

              <div className="my-5 space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-400">Signatory:</span>
                    <p className="font-medium text-zinc-200">{record.fullName}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Email:</span>
                    <p className="font-medium text-zinc-200">{record.email}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Organisation:</span>
                    <p className="font-medium text-zinc-200">{record.organisation}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Role:</span>
                    <p className="font-medium text-zinc-200">{record.role}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400">Executed At:</span>
                    <p className="font-medium text-emerald-400">
                      {new Date(record.acceptedAt).toLocaleString("en-NG", { dateStyle: "full", timeStyle: "medium" })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadCopy}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  <Download className="size-3.5" />
                  Download Agreement Record (.txt)
                </button>
                <button
                  type="button"
                  onClick={() => setShowViewer(false)}
                  className="rounded-lg bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ==========================================
  // UNBYPASSABLE ACCESS WALL (NON-DISMISSIBLE)
  // ==========================================
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nda-title"
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 text-zinc-100 shadow-2xl">
        {/* Top Header Banner */}
        <div className="border-b border-zinc-800 bg-zinc-900/80 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white uppercase">
                  ¥ Sparkr Digitals
                </span>
                <span className="text-xs text-zinc-400">· Lagos, Nigeria</span>
              </div>
              <div className="mt-1 text-xs text-zinc-400">
                hello@sparkrdigitals.com · +234 912 766 6376
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-black/60 px-3 py-1 text-xs font-mono font-semibold text-zinc-200">
                <Lock className="size-3 text-amber-400" />
                {NDA_REFERENCE}
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                Protected Access
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h1 id="nda-title" className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
              Platform Access & Evaluation Terms
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-amber-400/90">
              Lawyer Review Draft — Not Final Legal Advice · Valid Until 22 November 2026
            </p>
          </div>
        </div>

        {/* Form & Terms Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            These terms form a binding agreement between <strong>Sparkr Digitals</strong> and the person or organisation
            completing this access form. Access to this platform and its underlying technology is provided strictly for
            evaluation, feedback, and demonstration purposes. All visitors must identify themselves and accept these conditions
            prior to entry.
          </p>

          {/* Form Fields: Required identity information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1.5">
                <User className="size-3.5 text-zinc-400" />
                Full Legal Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Babatunde Adeleke"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1.5">
                <Mail className="size-3.5 text-zinc-400" />
                Official / Work Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agency.gov.ng or company.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1.5">
                <Building className="size-3.5 text-zinc-400" />
                Organisation / Agency <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                placeholder="e.g. LAWMA, LASEPA, PSP Partner, Ministry"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1.5">
                <Briefcase className="size-3.5 text-zinc-400" />
                Role / Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Director of Operations, Evaluator, Engineer"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
                Purpose for Requesting Access
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Evaluation, Demonstration, Technical Audit, Pilot Review"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Scrollable Legal Terms Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Evaluation Terms & Conditions (Scroll to Review)
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                Nigerian Copyright Act 2022
              </span>
            </div>

            <div
              onScroll={() => setHasScrolledTerms(true)}
              tabIndex={0}
              aria-label="Terms of evaluation agreement"
              className="max-h-52 overflow-y-auto rounded-xl border border-zinc-800 bg-black/70 p-4 text-xs text-zinc-300 space-y-3 leading-relaxed focus:outline-none focus:border-zinc-600"
            >
              <section>
                <h4 className="font-semibold text-zinc-100 uppercase tracking-wide">1. Access, Applicant and Purpose</h4>
                <p>
                  The applicant confirms that all provided information is accurate and that they possess actual legal
                  authority to represent and bind their stated organisation. Access is granted solely for non-commercial
                  evaluation, demonstration, feedback, and consideration of prospective pilot or procurement discussions.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-zinc-100 uppercase tracking-wide">2. Ownership, No Licence and Confidentiality</h4>
                <p>
                  All rights, title and interest, including all intellectual property rights (including copyright under the
                  Nigerian Copyright Act 2022, trade secrets, software code, UI designs, wireframes, prototypes, algorithms,
                  branding, system architecture, and operating models) remain exclusively with Sparkr Digitals and its identified
                  contributors. Access does not transfer ownership or grant any licence, assignment, partnership, or procurement
                  award.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-zinc-100 uppercase tracking-wide">3. Permitted Use and Prohibited Actions</h4>
                <p>
                  The applicant may view and evaluate the platform. The applicant <strong>must not</strong> copy, download,
                  reproduce, modify, translate, reverse engineer, decompile, disassemble, screen-record, photograph, publish,
                  upload, forward, distribute, share credentials, create a competing or substantially similar system, or use the
                  materials to prepare a procurement specification for another supplier without prior written consent from Sparkr Digitals.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-zinc-100 uppercase tracking-wide">4. Institutional Status & Government Data</h4>
                <p>
                  If the applicant represents LAWMA, LASEPA, Lagos State Government, or another public institution, access does
                  not constitute official government endorsement, procurement, or appointment. No person may represent that
                  this platform is an officially commissioned government portal without a separate executed commercial contract.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-zinc-100 uppercase tracking-wide">5. Remedies, Indemnity and Right to Sue</h4>
                <p>
                  The applicant acknowledges that the Platform and Materials are valuable trade secrets of Sparkr Digitals.
                  Any actual or threatened breach will cause irreparable harm for which damages alone are not an adequate
                  remedy. Sparkr Digitals reserves the right to seek interim and final injunctive relief (including Anton Piller
                  and interlocutory search orders) before the Federal High Court of Nigeria, along with full indemnity for legal
                  and forensic costs.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-zinc-100 uppercase tracking-wide">6. Governing Law & Dispute Resolution</h4>
                <p>
                  This Agreement is governed by the laws of the Federal Republic of Nigeria. Unresolved disputes shall be finally
                  settled under the Arbitration and Mediation Act 2023 at the Lagos Court of Arbitration in Lagos, Nigeria.
                </p>
              </section>

              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                Executed under signature authority: <strong>Quadri Ismail</strong>, Chief Executive Manager, Sparkr Digitals (8 November 2026).
              </div>
            </div>
          </div>

          {/* Mandatory Checkbox */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 size-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <span className="text-xs text-zinc-200 leading-normal select-none">
                <strong>I confirm</strong> that I have read and understood these Project Access & Evaluation Terms. I confirm
                that the information I provided is accurate, that I am authorized to request access, and that I agree to comply
                with these terms on my own behalf and on behalf of my organization. I understand that a breach may result in legal
                action, including injunctions, damages and indemnity claims against me and my organization. I understand that access
                does not transfer ownership or grant permission to copy, reproduce, implement, disclose, or commercialise the
                project.
              </span>
            </label>
          </div>

          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/40 px-3.5 py-2 text-xs text-red-300">
              <AlertTriangle className="size-4 shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadCopy}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <Download className="size-3.5" />
              Download Draft Terms (.txt)
            </button>

            <button
              type="submit"
              disabled={!agreed || !fullName.trim() || !email.trim() || !organisation.trim() || !role.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <CheckCircle2 className="size-4" />
              Sign Agreement & Enter Platform
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
