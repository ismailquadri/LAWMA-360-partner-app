import type { Settlement } from "./store";

const naira = (n: number) => `NGN ${n.toLocaleString("en-NG")}`;

async function logoPng(): Promise<string | null> {
  try {
    const img = new Image();
    img.src = "/favicon.png";
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d")!.drawImage(img, 0, 0);
    return c.toDataURL("image/png");
  } catch { return null; }
}

/** Builds a branded LAWMA 360 proof-of-remittance PDF. */
export async function buildRemittancePdf(s: Settlement, partner: { name: string; contact: string; areas: string }): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 18;
  const heat: [number, number, number] = [232, 93, 32];
  const ink: [number, number, number] = [23, 23, 23];
  const grey: [number, number, number] = [115, 115, 115];
  const line: [number, number, number] = [229, 229, 229];

  doc.setFillColor(...heat); doc.rect(0, 0, W, 4, "F");
  const logo = await logoPng();
  if (logo) doc.addImage(logo, "PNG", M, 14, 14, 14);
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...ink);
  doc.text("LAWMA 360", M + 18, 20);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...grey);
  doc.text("Lagos Waste Management Authority · Partner Console", M + 18, 25.5);
  doc.setFont("courier", "normal"); doc.setFontSize(8);
  doc.text("PROOF OF REMITTANCE", W - M, 20, { align: "right" });
  doc.text(s.ref, W - M, 25.5, { align: "right" });

  doc.setDrawColor(...line); doc.line(M, 36, W - M, 36);

  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...grey);
  doc.text("AMOUNT REMITTED", M, 48);
  doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.setTextColor(...ink);
  doc.text(naira(s.amount), M, 60);
  doc.setFillColor(232, 245, 236); doc.roundedRect(W - M - 34, 52, 34, 9, 2, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(34, 120, 70);
  doc.text("SETTLED", W - M - 17, 57.8, { align: "center" });

  const rows: [string, string][] = [
    ["Reference", s.ref],
    ["Date", s.date],
    ["Partner (PSP)", partner.name],
    ["Service areas", partner.areas],
    ["Partner contact", partner.contact],
    ["Gross collections", naira(s.amount)],
    ["Partner share retained (80%)", naira(s.partnerShare)],
    ["Authority share remitted (20%)", naira(s.authorityShare)],
  ];
  let y = 78;
  doc.setFontSize(10);
  for (const [k, v] of rows) {
    doc.setDrawColor(...line); doc.line(M, y + 3.5, W - M, y + 3.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...grey); doc.text(k, M, y);
    doc.setFont("courier", "normal"); doc.setTextColor(...ink); doc.text(v, W - M, y, { align: "right" });
    y += 11;
  }

  y += 8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...grey);
  doc.text(doc.splitTextToSize("This document confirms that the partner above has remitted the authority share of collected PSP service fees to LAWMA under the 80/20 revenue-sharing arrangement. Keep it for your records and quote the reference in any settlement query.", W - 2 * M), M, y);

  doc.setDrawColor(...line); doc.line(M, 280, W - M, 280);
  doc.setFont("courier", "normal"); doc.setFontSize(7.5);
  doc.text(`Generated ${new Date().toLocaleString("en-NG")}`, M, 286);
  doc.text("lawma.gov.ng", W - M, 286, { align: "right" });
  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Generates the PDF first, then downloads (or opens the share sheet on phones). */
export async function deliverFile(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (e) { if ((e as DOMException).name === "AbortError") return; }
  }
  downloadBlob(blob, filename);
}
