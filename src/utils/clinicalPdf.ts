import jsPDF from "jspdf";

interface PdfSection {
  label: string;
  value: string;
}

export function generateClinicalPdf({
  toolTitle,
  clientName,
  fillerName,
  entryDate,
  sections,
  notes,
}: {
  toolTitle: string;
  clientName?: string;
  fillerName?: string;
  entryDate: string;
  sections: PdfSection[];
  notes?: string;
}): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(toolTitle, margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  const meta = [
    clientName ? `Client: ${clientName}` : "",
    fillerName ? `Completed by: ${fillerName}` : "",
    `Date: ${entryDate}`,
  ].filter(Boolean).join("  •  ");
  doc.text(meta, margin, y);
  y += 4;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  doc.setTextColor(0);

  // Sections
  for (const section of sections) {
    if (!section.value) continue;
    checkPage(20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(section.label, margin, y);
    y += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(section.value, contentWidth);
    for (const line of lines) {
      checkPage(6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 4;
  }

  // Notes
  if (notes) {
    checkPage(20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    doc.text("Notes", margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(notes, contentWidth);
    for (const line of noteLines) {
      checkPage(6);
      doc.text(line, margin, y);
      y += 5;
    }
    doc.setTextColor(0);
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(`Binyan CBS — ${toolTitle} — Page ${i}/${totalPages}`, margin, 290);
  }

  return doc;
}
