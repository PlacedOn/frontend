/**
 * Client-side PDF text extraction. The file NEVER leaves the browser — this
 * keeps Placedon's "we don't upload your resume" promise while still letting
 * candidates use a PDF. Uses a local, same-origin worker (copied to
 * /public/pdf.worker.min.mjs) so the production CSP doesn't block it.
 *
 * Returns the extracted text, or "" if the PDF has no selectable text (e.g. a
 * scanned/image-only resume) — the caller then asks the candidate to paste it.
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  try {
    const pages: string[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const line = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pages.push(line);
    }
    return pages.join("\n").replace(/[ \t]+\n/g, "\n").trim();
  } finally {
    await loadingTask.destroy();
  }
}
