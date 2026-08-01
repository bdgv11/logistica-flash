window.LF = window.LF || {};

// Reads a customs/casillero invoice PDF (real embedded text layer, not a
// scanned image — confirmed against a real "FacturaCasillero..." sample)
// entirely client-side with pdf.js, so this costs nothing per invoice and
// never sends the file anywhere. No AI/vision involved: the invoices this
// app deals with are computer-generated, not scanned, so a plain text/regex
// read is enough.

(function () {
  // pdf.js has shipped ESM-only (no window.pdfjsLib global) since v4/v5, so
  // it's loaded lazily via dynamic import() the first time someone actually
  // uploads a PDF — keeps index.html on plain <script> tags everywhere else
  // and costs nothing for users who never touch this screen. Re-check
  // https://registry.npmjs.org/pdfjs-dist/latest occasionally; jsDelivr has
  // no local vendoring/fallback if this version ever gets pulled.
  const PDFJS_VERSION = '6.2.108';
  const PDFJS_BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build`;

  let libPromise = null;
  function loadPdfjs() {
    if (!libPromise) {
      libPromise = import(/* webpackIgnore: true */ `${PDFJS_BASE}/pdf.min.mjs`).then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;
        return lib;
      });
    }
    return libPromise;
  }

  // A real data row ends in "<peso> lb ... ₡<precio> ₡<precio>" — anchoring
  // on that tail (greedy, so it backtracks from the END of the line) is far
  // more robust than trying to bucket text by column x-position, because the
  // DESCRIPCIÓN column is always blank (columns visually collapse) and the
  // TRACKING column can itself contain spaces — some real rows are free text
  // like "sobre blanco juan rivera" (an envelope with no formal tracking,
  // hand-labeled with just the recipient's name) instead of a tracking code.
  // A lazy capture would stop at the first place it *could* match instead of
  // the real columns; greedy always lands on the actual last occurrence.
  const ROW_RE = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*lb\b.*?₡\s*[\d.,]+\s*₡\s*[\d.,]+\s*$/i;
  const SKIP_RE = /^(tracking\b|descripci[oó]n\b|cant\.?\s*\(lb\)|p\.?\s*unit\.?|total\b|total a[eé]reo|resumen consolidado|factura|casillero|sucursal|p[aá]g\.?\s*\d|equivalente en usd)/i;

  function groupLines(items) {
    const rowsByY = new Map();
    for (const it of items) {
      if (!it.str || !it.str.trim()) continue;
      const y = Math.round(it.transform[5]);
      const x = it.transform[4];
      if (!rowsByY.has(y)) rowsByY.set(y, []);
      rowsByY.get(y).push({ x, str: it.str });
    }
    // pdf.js can report a couple of units of baseline jitter for text that's
    // visually on the same table row — merge y-buckets that are close.
    const ys = [...rowsByY.keys()].sort((a, b) => b - a); // PDF y grows upward: top of page first
    const merged = [];
    for (const y of ys) {
      const last = merged[merged.length - 1];
      if (last !== undefined && Math.abs(last - y) <= 2) {
        rowsByY.get(last).push(...rowsByY.get(y));
      } else {
        merged.push(y);
      }
    }
    return merged.map((y) =>
      rowsByY.get(y).sort((a, b) => a.x - b.x).map((c) => c.str).join(' ').replace(/\s+/g, ' ').trim()
    );
  }

  function parseLine(line) {
    if (!line || SKIP_RE.test(line)) return null;
    const m = ROW_RE.exec(line);
    if (!m) return null;
    const tracking = m[1].trim();
    const weightLb = parseFloat(m[2].replace(',', '.'));
    if (!tracking || !Number.isFinite(weightLb)) return null;
    return { tracking, weightLb };
  }

  // Returns { rows: [{tracking, weightLb}], unparsedLines: string[] } —
  // unparsedLines surfaces any non-blank line that didn't match anything,
  // so a row that failed to parse shows up as a visible warning instead of
  // silently vanishing (this is replacing a manual process someone
  // currently trusts completely; losing a line without any indication would
  // be worse than the manual process it replaces).
  async function parsePdf(file) {
    const pdfjsLib = await loadPdfjs();
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    const rows = [];
    const unparsedLines = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      for (const line of groupLines(content.items)) {
        if (!line || SKIP_RE.test(line)) continue;
        const parsed = parseLine(line);
        if (parsed) rows.push(parsed); else unparsedLines.push(line);
      }
    }
    return { rows, unparsedLines };
  }

  LF.invoiceParser = { parsePdf };
})();
