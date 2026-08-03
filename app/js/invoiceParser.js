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

  // pdf.js (since ~4.5) calls Promise.withResolvers() internally, which iOS
  // Safari only got in 17.4 (March 2024). On an older iPhone that call is
  // simply undefined, and the resulting crash surfaces nowhere near this
  // line — it shows up deep inside pdf.js's minified code as a cryptic
  // "undefined is not a function" with no mention of Promise.withResolvers
  // at all. Polyfilling it here, before pdf.js ever loads, is enough.
  if (typeof Promise.withResolvers !== 'function') {
    Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve, reject };
    };
  }

  let libPromise = null;
  function loadPdfjs() {
    if (!libPromise) {
      // pdf.js normally runs PDF parsing on a real background Worker. On
      // some iPhones that Worker fails to come up (pdf.js's own source
      // already wraps the cross-origin CDN script in a same-origin blob:
      // URL to deal with that — this isn't a cross-origin problem) and,
      // instead of a clear error, the crash surfaces later as an
      // unrelated-looking "undefined is not a function" deep in pdf.js's
      // response-handling code. Importing the worker module directly here
      // and exposing it as `window.pdfjsWorker` is pdf.js's own documented
      // hook for this: when it's present, pdf.js skips creating a Worker at
      // all and runs the exact same parsing code on the main thread instead
      // (the same path Node.js uses, which has no Worker support at all).
      // For a one/two-page invoice that's an imperceptible main-thread
      // pause, in exchange for removing an entire class of Worker-related
      // browser bugs.
      libPromise = Promise.all([
        import(/* webpackIgnore: true */ `${PDFJS_BASE}/pdf.min.mjs`),
        import(/* webpackIgnore: true */ `${PDFJS_BASE}/pdf.worker.min.mjs`),
      ]).then(([lib, workerModule]) => {
        window.pdfjsWorker = workerModule;
        return lib;
      });
    }
    return libPromise;
  }

  // A real Aéreo row ends in "<peso> lb ... ₡<precio unitario> ₡<total>" —
  // anchoring on that tail (greedy, so it backtracks from the END of the
  // line) is far more robust than trying to bucket text by column
  // x-position, because the DESCRIPCIÓN column is always blank there
  // (columns visually collapse) and the TRACKING column can itself contain
  // spaces — some real rows are free text like "sobre blanco juan rivera"
  // (an envelope with no formal tracking, hand-labeled with just the
  // recipient's name) instead of a tracking code. A lazy capture would stop
  // at the first place it *could* match instead of the real columns; greedy
  // always lands on the actual last occurrence. Both trailing ₡ figures are
  // captured now (P. UNIT. then TOTAL, in that column order) — the first is
  // what the provider charges per lb/ft³, i.e. their own cost, as opposed to
  // whatever this app charges the client.
  const ROW_RE = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*lb\b.*?₡\s*([\d.,]+)\s*₡\s*([\d.,]+)\s*$/i;
  // Marítimo rows end in "<pies> ft³ ... ₡<precio unitario> ₡<total>"
  // instead, and — unlike Aéreo — DESCRIPCIÓN is often non-empty ("33
  // LIBRAS", "hazmat"), sitting between tracking and the ft³ figure. Every
  // real tracking seen in this section so far is a single token with no
  // spaces, so it's captured as the first whitespace-delimited chunk (\S+)
  // and whatever text follows before the ft³ figure is discarded —
  // informational only, not billed on (the app's own price-per-ft³ setting
  // is what's charged to the client, not the invoice's). No trailing \b
  // after "ft³": "³" isn't a \w character in JS regex, so there's no word
  // boundary between it and the space that follows — \b there would never
  // match at all.
  const MARITIME_ROW_RE = /^(\S+)\s+.*?(\d+(?:[.,]\d+)?)\s*ft³.*?₡\s*([\d.,]+)\s*₡\s*([\d.,]+)\s*$/i;
  // Only fires *within* a recognized Aéreo/Marítimo section (see parsePdf) —
  // catches the column header repeating on every page and page-number
  // footers ("Pág. 2 / 5") that can land mid-section on a page break.
  // Everything outside a section (letterhead, "Otros servicios", the
  // Resumen Consolidado summary) is skipped structurally instead, so it
  // never needs pattern-matching here.
  const SKIP_RE = /^(tracking\b|descripci[oó]n\b|cant\.?\s*\(lb\)|pies\s*c[uú]b|p\.?\s*unit\.?|p[aá]g\.?\s*\d)/i;

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

  // Money on this invoice is printed "5,640.00" — comma as thousands
  // separator, dot as decimal — the opposite convention from the weight/
  // cubic-feet figures elsewhere in these rows, which use a comma as the
  // decimal separator. The two can't share one parsing function.
  function parseCRCAmount(str) {
    const n = parseFloat(String(str).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  function parseLine(line, section) {
    if (section === 'maritimo') {
      const m = MARITIME_ROW_RE.exec(line);
      if (!m) return null;
      const tracking = m[1].trim();
      const cubicFeet = parseFloat(m[2].replace(',', '.'));
      if (!tracking || !Number.isFinite(cubicFeet)) return null;
      return { tracking, shippingType: 'maritimo', weightLb: null, cubicFeet, unitCostCRC: parseCRCAmount(m[3]) };
    }
    const m = ROW_RE.exec(line);
    if (!m) return null;
    const tracking = m[1].trim();
    const weightLb = parseFloat(m[2].replace(',', '.'));
    if (!tracking || !Number.isFinite(weightLb)) return null;
    return { tracking, shippingType: 'aereo', weightLb, cubicFeet: null, unitCostCRC: parseCRCAmount(m[3]) };
  }

  // Returns { rows: [{tracking, shippingType, weightLb, cubicFeet, unitCostCRC}],
  // unparsedLines: string[] } — unparsedLines surfaces any line inside a
  // recognized section that didn't match its row pattern, so a row that
  // failed to parse shows up as a visible warning instead of silently
  // vanishing (this is replacing a manual process someone currently trusts
  // completely; losing a line without any indication would be worse than
  // the manual process it replaces).
  //
  // A single invoice can carry both an Aéreo and a Marítimo table (each
  // with its own unit and section header), so which pattern applies is
  // tracked per line, not assumed for the whole document. The section
  // persists across page breaks — only page 1 repeats "Aéreo"/"Marítimo" as
  // a heading, later pages just continue the same table under a repeated
  // column header. Everything outside a recognized section (letterhead,
  // "Otros servicios" freight/documentation charges, the Resumen
  // Consolidado summary) is structurally never a package row, so it's
  // skipped without needing to pattern-match its exact wording.
  //
  // onProgress(optional): called with {phase:'preparing'} once before the
  // (lazy, ~2MB) pdf.js library downloads, then {phase:'reading', page,
  // totalPages} per page — lets the UI show something other than a frozen
  // button on multi-page invoices.
  async function parsePdf(file, onProgress) {
    if (onProgress) onProgress({ phase: 'preparing' });
    const pdfjsLib = await loadPdfjs();
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    const rows = [];
    const unparsedLines = [];
    let section = null; // null | 'aereo' | 'maritimo'
    for (let n = 1; n <= doc.numPages; n++) {
      if (onProgress) onProgress({ phase: 'reading', page: n, totalPages: doc.numPages });
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      for (const line of groupLines(content.items)) {
        if (!line) continue;
        if (/^a[eé]reo$/i.test(line)) { section = 'aereo'; continue; }
        if (/^mar[ií]timo$/i.test(line)) { section = 'maritimo'; continue; }
        if (/^total\b/i.test(line)) { section = null; continue; } // "Total aéreo" / "Total marítimo"
        if (section === null) continue; // letterhead, Otros servicios, Resumen Consolidado
        if (SKIP_RE.test(line)) continue;
        const parsed = parseLine(line, section);
        if (parsed) rows.push(parsed); else unparsedLines.push(line);
      }
    }
    return { rows, unparsedLines };
  }

  LF.invoiceParser = { parsePdf };
})();
