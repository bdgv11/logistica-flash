(function () {
  'use strict';

  const PROVINCIAS = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];
  const CANTONES_BY_PROVINCIA = {
    'San José': ['San José', 'Escazú', 'Desamparados', 'Puriscal', 'Tarrazú', 'Aserrí', 'Mora', 'Goicoechea', 'Santa Ana', 'Alajuelita', 'Vázquez de Coronado', 'Acosta', 'Tibás', 'Moravia', 'Montes de Oca', 'Turrubares', 'Dota', 'Curridabat', 'Pérez Zeledón', 'León Cortés'],
    'Alajuela': ['Alajuela', 'San Ramón', 'Grecia', 'San Mateo', 'Atenas', 'Naranjo', 'Palmares', 'Poás', 'Orotina', 'San Carlos', 'Zarcero', 'Sarchí', 'Upala', 'Los Chiles', 'Guatuso', 'Río Cuarto'],
    'Cartago': ['Cartago', 'Paraíso', 'La Unión', 'Jiménez', 'Turrialba', 'Alvarado', 'Oreamuno', 'El Guarco'],
    'Heredia': ['Heredia', 'Barva', 'Santo Domingo', 'Santa Bárbara', 'San Rafael', 'San Isidro', 'Belén', 'Flores', 'San Pablo', 'Sarapiquí'],
    'Guanacaste': ['Liberia', 'Nicoya', 'Santa Cruz', 'Bagaces', 'Carrillo', 'Cañas', 'Abangares', 'Tilarán', 'Nandayure', 'La Cruz', 'Hojancha'],
    'Puntarenas': ['Puntarenas', 'Esparza', 'Buenos Aires', 'Montes de Oro', 'Osa', 'Quepos', 'Golfito', 'Coto Brus', 'Parrita', 'Corredores', 'Garabito'],
    'Limón': ['Limón', 'Pococí', 'Siquirres', 'Talamanca', 'Matina', 'Guácimo'],
  };

  // Approximate reference points (canton/province seat towns), used only to
  // put a rough order on the WhatsApp route when a client's address link
  // doesn't carry real coordinates. Not surveyed, not shown to the user as
  // "the address" — just a coarse stand-in for straight-line distance sort.
  const CANTON_CENTROIDS = {
    'San José': { lat: 9.9281, lng: -84.0907 }, 'Escazú': { lat: 9.9189, lng: -84.1449 },
    'Desamparados': { lat: 9.8975, lng: -84.0669 }, 'Puriscal': { lat: 9.8386, lng: -84.2994 },
    'Tarrazú': { lat: 9.6431, lng: -84.0122 }, 'Aserrí': { lat: 9.8783, lng: -84.0667 },
    'Mora': { lat: 9.9089, lng: -84.2214 }, 'Goicoechea': { lat: 9.9436, lng: -84.0578 },
    'Santa Ana': { lat: 9.9280, lng: -84.1831 }, 'Alajuelita': { lat: 9.8961, lng: -84.1094 },
    'Vázquez de Coronado': { lat: 9.9814, lng: -84.0392 }, 'Acosta': { lat: 9.7594, lng: -84.2214 },
    'Tibás': { lat: 9.9636, lng: -84.0839 }, 'Moravia': { lat: 9.9639, lng: -84.0500 },
    'Montes de Oca': { lat: 9.9364, lng: -84.0517 }, 'Turrubares': { lat: 9.8608, lng: -84.3925 },
    'Dota': { lat: 9.6667, lng: -83.9333 }, 'Curridabat': { lat: 9.9167, lng: -84.0333 },
    'Pérez Zeledón': { lat: 9.3717, lng: -83.7042 }, 'León Cortés': { lat: 9.6667, lng: -84.0333 },
    'Alajuela': { lat: 10.0163, lng: -84.2115 }, 'San Ramón': { lat: 10.0930, lng: -84.4761 },
    'Grecia': { lat: 10.0725, lng: -84.3128 }, 'San Mateo': { lat: 9.9500, lng: -84.4333 },
    'Atenas': { lat: 9.9781, lng: -84.3800 }, 'Naranjo': { lat: 10.0975, lng: -84.3831 },
    'Palmares': { lat: 10.0575, lng: -84.4344 }, 'Poás': { lat: 10.0925, lng: -84.2331 },
    'Orotina': { lat: 9.9128, lng: -84.5814 }, 'San Carlos': { lat: 10.3236, lng: -84.4267 },
    'Zarcero': { lat: 10.1858, lng: -84.3956 }, 'Sarchí': { lat: 10.0764, lng: -84.3506 },
    'Upala': { lat: 10.8958, lng: -85.0111 }, 'Los Chiles': { lat: 11.0333, lng: -84.7167 },
    'Guatuso': { lat: 10.7500, lng: -84.8333 }, 'Río Cuarto': { lat: 10.4667, lng: -84.2667 },
    'Cartago': { lat: 9.8644, lng: -83.9194 }, 'Paraíso': { lat: 9.8419, lng: -83.8636 },
    'La Unión': { lat: 9.9167, lng: -83.9833 }, 'Jiménez': { lat: 9.8667, lng: -83.7333 },
    'Turrialba': { lat: 9.9078, lng: -83.6864 }, 'Alvarado': { lat: 9.9333, lng: -83.8000 },
    'Oreamuno': { lat: 9.8833, lng: -83.8667 }, 'El Guarco': { lat: 9.8167, lng: -83.9333 },
    'Heredia': { lat: 10.0028, lng: -84.1165 }, 'Barva': { lat: 10.0333, lng: -84.1167 },
    'Santo Domingo': { lat: 9.9833, lng: -84.0917 }, 'Santa Bárbara': { lat: 10.0333, lng: -84.1500 },
    'San Rafael': { lat: 10.0333, lng: -84.0833 }, 'San Isidro': { lat: 10.0333, lng: -84.0667 },
    'Belén': { lat: 9.9833, lng: -84.1667 }, 'Flores': { lat: 10.0000, lng: -84.1167 },
    'San Pablo': { lat: 9.9833, lng: -84.1167 }, 'Sarapiquí': { lat: 10.4667, lng: -84.0000 },
    'Liberia': { lat: 10.6346, lng: -85.4407 }, 'Nicoya': { lat: 10.1483, lng: -85.4522 },
    'Santa Cruz': { lat: 10.2667, lng: -85.5833 }, 'Bagaces': { lat: 10.5167, lng: -85.2500 },
    'Carrillo': { lat: 10.4667, lng: -85.5667 }, 'Cañas': { lat: 10.4333, lng: -85.0833 },
    'Abangares': { lat: 10.2167, lng: -84.9667 }, 'Tilarán': { lat: 10.4667, lng: -84.9667 },
    'Nandayure': { lat: 9.9833, lng: -85.2333 }, 'La Cruz': { lat: 11.0833, lng: -85.6167 },
    'Hojancha': { lat: 10.0167, lng: -85.3833 },
    'Puntarenas': { lat: 9.9763, lng: -84.8384 }, 'Esparza': { lat: 9.9986, lng: -84.6608 },
    'Buenos Aires': { lat: 9.1667, lng: -83.3333 }, 'Montes de Oro': { lat: 9.9333, lng: -84.7167 },
    'Osa': { lat: 8.9667, lng: -83.5333 }, 'Quepos': { lat: 9.4319, lng: -84.1622 },
    'Golfito': { lat: 8.6333, lng: -83.1667 }, 'Coto Brus': { lat: 8.8167, lng: -82.9667 },
    'Parrita': { lat: 9.5167, lng: -84.3167 }, 'Corredores': { lat: 8.6333, lng: -82.9333 },
    'Garabito': { lat: 9.6167, lng: -84.6167 },
    'Limón': { lat: 9.9908, lng: -83.0347 }, 'Pococí': { lat: 10.2167, lng: -83.7833 },
    'Siquirres': { lat: 10.1000, lng: -83.5000 }, 'Talamanca': { lat: 9.6167, lng: -82.8500 },
    'Matina': { lat: 10.0000, lng: -83.2667 }, 'Guácimo': { lat: 10.2000, lng: -83.6833 },
  };
  const PROVINCE_CENTROIDS = {
    'San José': { lat: 9.9281, lng: -84.0907 }, 'Alajuela': { lat: 10.0163, lng: -84.2115 },
    'Cartago': { lat: 9.8644, lng: -83.9194 }, 'Heredia': { lat: 10.0028, lng: -84.1165 },
    'Guanacaste': { lat: 10.6346, lng: -85.4407 }, 'Puntarenas': { lat: 9.9763, lng: -84.8384 },
    'Limón': { lat: 9.9908, lng: -83.0347 },
  };

  const DEFAULT_RATE_PER_LB = 4.25;
  const DEFAULT_CRC_RATE = 525;
  const DEFAULT_PRICE_PER_CUBIC_FT = 0; // no real rate to default to — Configuración must set this before maritime cost calc means anything
  const PAGE_SIZE = 10;

  const state = {
    tab: 'inicio',
    clients: [],
    messengers: [],
    packages: [],
    settings: { ratePerLb: DEFAULT_RATE_PER_LB, crcRate: DEFAULT_CRC_RATE, pricePerCubicFt: DEFAULT_PRICE_PER_CUBIC_FT },
    clientsPage: 1,
    clientEditingId: null,
    clientDraft: { name: '', phone: '', phone2: '', address: '', addressDetails: '', province: '', canton: '' },
    messengerEditingId: null,
    messengerZonesDraft: [],
    messengerDraft: { name: '', phone: '', origin: '' },
    pkgEditingId: null,
    pkgSelectedClientId: null,
    pkgDraft: { tracking: '', weight: '', cubicFeet: '', cost: '', arrived: false, shippingType: 'aereo' },
    pkgListFilters: { query: '', estado: '', invoiceNumber: '' },
    pkgListPage: 1,
    session: null,
    loading: true,
    busy: false,
    confirmOpen: false,
    confirmTitle: '',
    confirmMessage: '',
    confirmActionLabel: 'Eliminar',
    confirmAction: null,
    invoiceQueue: null,
    invoiceReviewOpen: false,
    invoiceReviewRows: [],   // [{tracking, shippingType, weightLb, cubicFeet, status, packageId, selected}]
    invoiceReviewUnparsedLines: [],
    invoiceParsing: false,
    invoiceParsingProgress: 0, // 0-1, page/totalPages while reading
    routeOptimization: {}, // messengerId -> {status: 'loading'|'done'|'error', orderedStops}
    mobileNavOpen: false,
    toast: null, // {type: 'success'|'error', message}
    historyFilters: { client: '', tracking: '', messengerId: '', dateFrom: '', dateTo: '', minAmount: '' },
    historyPage: 1,
    fatalError: null,
    loggingIn: false,
    messengerError: '',
  };

  // ── helpers ──────────────────────────────────────────────────────────────
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');
  function normalize(v) {
    return String(v == null ? '' : v).toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  // FedEx/UPS and some other carriers hand a client a short reference
  // number that's actually just the tail end of the real, longer tracking
  // that ends up on the casillero's invoice (e.g. a client-provided
  // "533740261028" turning out to be the last 12 digits of the invoice's
  // "9621091390001093331700533740261028"). Whichever one is shorter must be
  // an exact suffix of the other — not just "share some digits somewhere"
  // — and both need a minimum length, or short/generic codes (like the
  // "657969"-style internal casillero references also seen in real
  // invoices) would spuriously match unrelated trackings by coincidence.
  const PARTIAL_TRACKING_MIN_LEN = 10;
  function isPartialTrackingMatch(a, b) {
    const na = normalize(a).replace(/\s+/g, '');
    const nb = normalize(b).replace(/\s+/g, '');
    if (!na || !nb || na === nb) return false;
    if (na.length < PARTIAL_TRACKING_MIN_LEN || nb.length < PARTIAL_TRACKING_MIN_LEN) return false;
    return na.endsWith(nb) || nb.endsWith(na);
  }

  // toISOString() converts to UTC first — for anyone west of UTC (like
  // Costa Rica, UTC-6) that silently rolls "today" over to tomorrow for
  // several hours every evening. Build the date from local getters instead
  // so it always matches the calendar day showing on the user's own clock.
  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Same fix as todayISO(), for a stored UTC timestamp instead of "now":
  // createdAt comes back from Postgres as a UTC instant (e.g.
  // "2026-08-01T23:30:00Z"). Slicing its first 10 characters grabs the UTC
  // calendar date directly — for Costa Rica (UTC-6), anywhere from 6pm to
  // midnight local time that UTC date has already rolled over to tomorrow,
  // so a package registered tonight shows as "created" the next day. Date's
  // local getters do the timezone conversion correctly instead.
  function localDateFromISO(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function todayLabel() {
    const raw = new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  // Costa Rica reads dates as día/mes/año, not the ISO yyyy-mm-dd the DB
  // stores them as — this is purely for display, never for <input
  // type="date"> values (those must stay ISO or the browser rejects them).
  function fmtDateCR(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
  }

  function messengerForZone(province) {
    if (!province) return null;
    return state.messengers.find((m) => Array.isArray(m.zones) && m.zones.includes(province)) || null;
  }

  function messengerById(id) {
    if (!id) return null;
    return state.messengers.find((m) => m.id === id) || null;
  }

  // A package always goes to the zone's mensajero by default — messengerId
  // only exists to hand a specific package to someone else when there's a
  // reason to (client not reachable by their usual mensajero that day, one
  // mensajero out sick, etc). Every screen that decides "whose route is this
  // package on" goes through here instead of calling messengerForZone
  // directly, so the override actually takes effect everywhere.
  function effectiveMessenger(p, c) {
    if (p.messengerId) return messengerById(p.messengerId);
    return c ? messengerForZone(c.province) : null;
  }

  function clientZoneLabel(c) {
    return [c.province, c.canton].filter(Boolean).join(' — ') || 'Sin zona';
  }

  // Nana already tags every client by hand with her own code ("JG-238 Jorge
  // Rivera") — this just keeps that same identification everywhere an admin
  // looks a client up (search results, tables, historial), so switching to
  // the app doesn't mean giving up the shorthand she already knows by memory.
  // Messages that go out to clients/mensajeros keep using the plain name —
  // this is purely for the admin-facing screens.
  function formatClientCode(seq) {
    return seq ? `JG-${String(seq).padStart(2, '0')}` : '';
  }

  // The next code a brand-new client will get, shown as a preview before
  // they're saved (the real value only exists once the DB assigns it).
  function nextClientCodeSeq() {
    return state.clients.reduce((max, c) => Math.max(max, c.codeSeq || 0), 0) + 1;
  }

  function clientLabel(c) {
    if (!c) return '';
    const code = formatClientCode(c.codeSeq);
    return code ? `${code} — ${c.name}` : c.name;
  }

  // Costa Rica bounding box, used to reject false-positive number pairs
  // (zoom levels, place IDs, etc.) picked up while scanning a URL for coords.
  function extractLatLng(url) {
    if (!url) return null;
    // A Google Maps "place" URL (e.g. .../place/San+José/@9.93,-84.15,13z/
    // data=...!3d9.928!4d-84.09...) carries two different coordinate pairs:
    // @lat,lng is just the map viewport's center — wherever the map happened
    // to be panned/zoomed to — while !3d<lat>!4d<lng> is the actual pinned
    // place's precise location. They can be several km apart. The viewport
    // center comes first in the URL, so the generic scan below would always
    // grab the wrong (less precise) one whenever both are present — check
    // for the real pin explicitly first.
    const pin = /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/.exec(url);
    if (pin) {
      const lat = parseFloat(pin[1]);
      const lng = parseFloat(pin[2]);
      if (lat >= 5 && lat <= 12 && lng <= -81 && lng >= -87) return { lat, lng };
    }
    const re = /(-?\d{1,2}\.\d{3,})(?:,|%2C|\s)+(-?\d{1,3}\.\d{3,})/gi;
    let m;
    while ((m = re.exec(url))) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (lat >= 5 && lat <= 12 && lng <= -81 && lng >= -87) return { lat, lng };
    }
    return null;
  }

  function haversineKm(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  // Real coordinates from the link when present, else a coarse canton/province
  // stand-in, else null (can't place this stop on the map at all).
  function clientCoord(c) {
    const fromLink = extractLatLng(c.address);
    if (fromLink) return fromLink;
    if (c.canton && CANTON_CENTROIDS[c.canton]) return CANTON_CENTROIDS[c.canton];
    if (c.province && PROVINCE_CENTROIDS[c.province]) return PROVINCE_CENTROIDS[c.province];
    return null;
  }

  // Greedy nearest-neighbor from the messenger's starting point — a coarse
  // straight-line approximation of an optimized route, not real street
  // routing. Stops we can't place anywhere (no coordinate at all) go last,
  // in their original order, rather than being dropped.
  function orderStopsByRoute(stops, originCoord) {
    if (!originCoord) return stops;
    const withCoord = [];
    const withoutCoord = [];
    stops.forEach((stop) => {
      const coord = clientCoord(stop.c);
      if (coord) withCoord.push({ stop, coord }); else withoutCoord.push(stop);
    });
    const ordered = [];
    let current = originCoord;
    const pool = withCoord.slice();
    while (pool.length) {
      let bestIdx = 0, bestDist = Infinity;
      pool.forEach((item, i) => {
        const d = haversineKm(current, item.coord);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      const [chosen] = pool.splice(bestIdx, 1);
      ordered.push(chosen.stop);
      current = chosen.coord;
    }
    return ordered.concat(withoutCoord);
  }

  // Shortened Google Maps / Waze share links (maps.app.goo.gl/xxx,
  // waze.com/ul/xxx — the default a phone's "Share location" button
  // produces) carry no coordinates in their own text, only an opaque code;
  // extractLatLng() can't read those no matter what, since it only ever
  // looks at the text of the link, never fetches anything. This asks the
  // optional resolve-map-link Edge Function to follow the redirect once, so
  // what actually gets saved is the long link with real coordinates — after
  // that, extractLatLng() reads it directly, same as any pasted long link.
  // Never blocks saving: if this isn't deployed yet, times out, or fails
  // for any reason, whatever was typed is kept as-is (today's behavior) —
  // this is a nice-to-have, not a requirement to use the app.
  async function resolveMapLinkIfNeeded(value) {
    const trimmed = (value || '').trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed) || extractLatLng(trimmed)) return trimmed;
    try {
      const { data, error } = await LF.supabase.functions.invoke('resolve-map-link', { body: { url: trimmed } });
      if (error || !data || !data.resolvedUrl) return trimmed;
      return data.resolvedUrl;
    } catch {
      return trimmed;
    }
  }

  function scrollToForm(id) {
    setTimeout(() => {
      const node = document.getElementById(id);
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  }

  // Clicking "Editar"/"Completar información" scrolls to the form, but
  // which field was actually missing wasn't visible until you read every
  // label — border-highlight the specific inputs that are actually empty
  // for this package instead. Runs after scrollToForm's own timeout so the
  // fields exist in the DOM (the client-search vs. client-card and
  // weight vs. cubic-feet inputs are conditionally rendered).
  function highlightMissingPkgFields(p) {
    setTimeout(() => {
      const ids = [];
      if (!p.clientId) ids.push('pkg-client-search');
      if (p.arrived) {
        const measure = p.shippingType === 'maritimo' ? p.cubicFeet : p.weight;
        if (measure == null) ids.push(p.shippingType === 'maritimo' ? 'pkg-cubic-feet' : 'pkg-weight');
      }
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add('field-missing');
      });
    }, 60);
  }

  // Strips a leading "506" before re-adding it — some admins type the
  // country code themselves (e.g. "506-8801-0001"), which without this
  // becomes "50650688010001" and silently breaks the wa.me link.
  function waPhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    return '506' + (digits.startsWith('506') ? digits.slice(3) : digits);
  }

  function clientById(id) { return state.clients.find((c) => c.id === id) || null; }

  // Ubicación/origin fields are meant to hold a pasted Maps/Waze link, but
  // nothing stops someone from pasting (or a stray paste leaving)
  // "javascript:..." there instead — esc() only escapes HTML characters, it
  // doesn't stop that from becoming a live href that runs script on click.
  // Only ever render it as a link if it's actually http(s).
  function safeHref(url) {
    return /^https?:\/\//i.test(String(url || '').trim()) ? url : '';
  }

  function fmtMoney(n) { return Number(n || 0).toFixed(2); }

  function fmtCRC(n) { return Math.round(Number(n) || 0).toLocaleString('es-CR'); }

  // Its own modal-style root, like renderConfirm/renderInvoiceParsingModal —
  // driven directly off state.toast instead of the main render() cascade, so
  // showing/hiding it never has to re-render (and potentially disturb) the
  // whole screen underneath.
  let toastTimer = null;
  function renderToast() {
    if (!toastRoot) return;
    if (!state.toast) { toastRoot.innerHTML = ''; return; }
    const { type, message } = state.toast;
    toastRoot.innerHTML = `
      <div class="toast toast-${type}" role="status">
        <span>${esc(message)}</span>
        <button type="button" class="toast-close" data-action="dismiss-toast" aria-label="Cerrar">${ICONS.close}</button>
      </div>`;
  }
  // Errors stay up longer and need a deliberate dismiss more than a quick
  // "guardado" confirmation does — a save failing is worth a second look,
  // not just a flash someone might miss mid-task.
  function showToast(type, message) {
    state.toast = { type, message };
    renderToast();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { state.toast = null; renderToast(); }, type === 'error' ? 7000 : 2800);
  }

  // Turns whatever a failed request threw into something an administrator can
  // act on. Network failures are by far the most common and used to surface as
  // raw English browser text (or, worse, as "contraseña incorrecta").
  function describeError(err) {
    const msg = (err && err.message) || '';
    if (/failed to fetch|networkerror|load failed|network request failed/i.test(msg)) {
      return 'No hay conexión con el servidor. Revisa tu internet y vuelve a intentar.';
    }
    if (/duplicate key value violates unique constraint.*tracking/i.test(msg)) {
      return 'Ya existe un paquete con ese tracking. Buscalo en "Registrar paquete" en vez de crear uno nuevo.';
    }
    return msg || 'Ocurrió un error inesperado.';
  }

  function describeAuthError(err) {
    const msg = (err && err.message) || '';
    if (/invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
    if (/email not confirmed/i.test(msg)) return 'Esa cuenta todavía no está confirmada. Confírmala en Supabase (Authentication → Users) y vuelve a entrar.';
    if (/too many requests|rate limit/i.test(msg)) return 'Demasiados intentos seguidos. Espera un minuto y vuelve a probar.';
    return describeError(err);
  }

  // successMessage is a plain string (not a callback) because every caller
  // already knows what it did before it did it — "guardar" vs "actualizar",
  // how many rows, who it reassigned to, etc. are all known from the form/
  // args at the point withBusy() gets called, so there's no need for a
  // function evaluated after the fact.
  async function withBusy(fn, successMessage) {
    if (state.busy) return;
    state.busy = true;
    try {
      await fn();
      if (successMessage) showToast('success', successMessage);
    } catch (err) {
      console.error(err);
      showToast('error', describeError(err));
    } finally {
      state.busy = false;
    }
  }

  async function reloadClients() { state.clients = await LF.db.listClients(); }
  async function reloadMessengers() { state.messengers = await LF.db.listMessengers(); }
  async function reloadPackages() {
    state.packages = await LF.db.listPackages();
    // Any change to the package list invalidates a previously-optimized
    // order — its indices were computed against a stop list that no longer
    // matches (assigned/unassigned/delivered since).
    state.routeOptimization = {};
  }
  async function reloadSettings() { state.settings = await LF.db.getSettings(); }
  async function reloadAll() {
    const [clients, messengers, packages, settings] = await Promise.all([
      LF.db.listClients(), LF.db.listMessengers(), LF.db.listPackages(), LF.db.getSettings(),
    ]);
    state.clients = clients; state.messengers = messengers; state.packages = packages; state.settings = settings;
  }

  // ── icons ────────────────────────────────────────────────────────────────
  const ICONS = {
    person: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>',
    home: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    history: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v5h5"></path><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"></path><path d="M12 7v5l4 2"></path></svg>',
    truck: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
    settings: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    box: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>',
    checklist: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><rect x="8" y="2" width="8" height="4" rx="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
    whatsapp: '<svg width="18" height="18" viewBox="0 0 32 32" fill="#ffffff" style="flex:none;display:block"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.446.713 4.716 1.938 6.63L4 29l7.57-1.912A11.9 11.9 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.7c-1.98 0-3.83-.55-5.41-1.5l-.386-.23-4.24 1.07 1.12-4.13-.25-.4A9.66 9.66 0 0 1 5.3 15c0-5.9 4.8-10.7 10.7-10.7S26.7 9.1 26.7 15 21.9 24.7 16 24.7zm5.94-7.98c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.72.16-.21.32-.82 1.05-1 1.26-.19.21-.37.24-.69.08-1.86-.93-3.08-1.66-4.31-3.76-.33-.56.33-.52.94-1.73.1-.21.05-.4-.05-.56-.1-.16-.72-1.73-.98-2.37-.26-.62-.53-.53-.72-.54-.19-.01-.4-.01-.61-.01-.21 0-.55.08-.85.4-.29.32-1.13 1.11-1.13 2.7 0 1.6 1.16 3.14 1.32 3.36.16.21 2.24 3.42 5.44 4.66 2.7 1.05 3.24.85 3.83.8.58-.06 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.29-.21-.61-.37z"></path></svg>',
    whatsappMono: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" style="flex:none;display:block"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.446.713 4.716 1.938 6.63L4 29l7.57-1.912A11.9 11.9 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.7c-1.98 0-3.83-.55-5.41-1.5l-.386-.23-4.24 1.07 1.12-4.13-.25-.4A9.66 9.66 0 0 1 5.3 15c0-5.9 4.8-10.7 10.7-10.7S26.7 9.1 26.7 15 21.9 24.7 16 24.7zm5.94-7.98c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.72.16-.21.32-.82 1.05-1 1.26-.19.21-.37.24-.69.08-1.86-.93-3.08-1.66-4.31-3.76-.33-.56.33-.52.94-1.73.1-.21.05-.4-.05-.56-.1-.16-.72-1.73-.98-2.37-.26-.62-.53-.53-.72-.54-.19-.01-.4-.01-.61-.01-.21 0-.55.08-.85.4-.29.32-1.13 1.11-1.13 2.7 0 1.6 1.16 3.14 1.32 3.36.16.21 2.24 3.42 5.44 4.66 2.7 1.05 3.24.85 3.83.8.58-.06 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.29-.21-.61-.37z"></path></svg>',
    invoice: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>',
    download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
    close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  };

  // ── DOM roots ────────────────────────────────────────────────────────────
  const loginRoot = document.getElementById('login-root');
  const shellRoot = document.getElementById('shell-root');
  const navRoot = document.getElementById('nav-root');
  const mainRoot = document.getElementById('main-root');
  const confirmRoot = document.getElementById('confirm-root');
  const invoiceReviewRoot = document.getElementById('invoice-review-root');
  const invoiceParsingRoot = document.getElementById('invoice-parsing-root');
  const toastRoot = document.getElementById('toast-root');

  function render() {
    if (state.fatalError) {
      loginRoot.innerHTML = renderFatal();
      loginRoot.style.display = '';
      shellRoot.style.display = 'none';
      return;
    }
    if (state.loading) {
      loginRoot.innerHTML = '<div class="app-shell" style="display:flex;align-items:center;justify-content:center"><p class="text-muted">Cargando…</p></div>';
      loginRoot.style.display = '';
      shellRoot.style.display = 'none';
      return;
    }
    if (!state.session) {
      loginRoot.innerHTML = renderLogin();
      loginRoot.style.display = '';
      shellRoot.style.display = 'none';
      return;
    }
    loginRoot.style.display = 'none';
    shellRoot.style.display = '';
    navRoot.innerHTML = renderNav();
    mainRoot.innerHTML = renderMain();
    // renderMain() leaves #pkg-table as an empty container on the
    // "paquete" tab — its rows are filled in separately so search/pagination
    // there can update without re-rendering the form above it. Any other
    // action that calls render() while on this tab must refill it too, or
    // the list silently disappears until something else refills it.
    if (state.tab === 'paquete') renderPkgList();
    if (state.tab === 'clientes') renderClientList();
    if (state.tab === 'historial') renderHistoryList();
  }

  // ── confirm modal ────────────────────────────────────────────────────────
  function renderConfirm() {
    if (!confirmRoot) return;
    if (!state.confirmOpen) { confirmRoot.innerHTML = ''; return; }
    confirmRoot.innerHTML = `
      <div class="dialog-backdrop" style="position:fixed;inset:0;z-index:1000">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
          <div class="dialog-title" id="confirm-dialog-title">${esc(state.confirmTitle)}</div>
          <div class="dialog-body">${esc(state.confirmMessage)}</div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" data-action="cancel-confirm">Cancelar</button>
            <button type="button" class="btn btn-primary" data-action="accept-confirm">${esc(state.confirmActionLabel)}</button>
          </div>
        </div>
      </div>`;
  }

  function askConfirm(title, message, action, actionLabel) {
    state.confirmOpen = true;
    state.confirmTitle = title;
    state.confirmMessage = message;
    state.confirmAction = action;
    state.confirmActionLabel = actionLabel || 'Eliminar';
    renderConfirm();
  }

  function closeConfirm() {
    state.confirmOpen = false;
    state.confirmAction = null;
    renderConfirm();
  }

  async function acceptConfirm() {
    const action = state.confirmAction;
    closeConfirm();
    if (action) await action();
  }

  // ── fatal / setup error ──────────────────────────────────────────────────
  // Anything that stops the app from starting lands here. Before this screen
  // existed the same failures just left "Cargando…" on screen forever, with
  // the real reason only visible in the browser console.
  function renderFatal() {
    return `
      <div style="min-height:100vh;background:var(--color-bg);color:var(--color-text);display:flex;align-items:center;justify-content:center;padding:16px">
        <div class="card elev-md" style="max-width:420px;width:100%">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:var(--space-2)">
            <img src="assets/logo-logistica-flash.png" alt="Logística Flash" style="height:32px;width:32px;object-fit:contain">
            <div class="card-title">Logística Flash</div>
          </div>
          <p style="margin:0 0 var(--space-2);font-size:15px;font-family:var(--font-heading);font-weight:800">No se pudo iniciar la app</p>
          <p class="text-muted" style="margin-bottom:var(--space-3);font-size:14px">${esc(state.fatalError)}</p>
          <button class="btn btn-primary btn-block" type="button" data-action="retry-boot" style="justify-content:center">Reintentar</button>
        </div>
      </div>`;
  }

  // ── login ────────────────────────────────────────────────────────────────
  function renderLogin() {
    return `
      <div style="min-height:100vh;background:var(--color-bg);color:var(--color-text);display:flex;align-items:center;justify-content:center;padding:16px">
        <div class="card elev-md" style="max-width:340px;width:100%">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:var(--space-2)">
            <img src="assets/logo-logistica-flash.png" alt="Logística Flash" style="height:32px;width:32px;object-fit:contain">
            <div class="card-title">Logística Flash</div>
          </div>
          <p class="text-muted" style="margin-bottom:var(--space-3)">Acceso administrativo</p>
          <div class="field">
            <label>Correo electrónico</label>
            <input class="input" id="login-email" type="email" placeholder="admin@logisticaflash.com" autocomplete="username">
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input class="input" id="login-password" type="password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <div id="login-error"></div>
          <button class="btn btn-primary btn-block" type="button" data-action="login" style="justify-content:center">Ingresar</button>
        </div>
      </div>`;
  }

  function showLoginError(msg) {
    document.getElementById('login-error').innerHTML = msg
      ? `<p style="color:#b3261e;font-size:13px;margin:0 0 var(--space-2)">${esc(msg)}</p>` : '';
  }

  // ── nav ──────────────────────────────────────────────────────────────────
  const TABS = [
    ['inicio', 'Inicio', 'home'], ['historial', 'Historial', 'history'], ['paquete', 'Registrar paquete', 'box'],
    ['lista', 'Lista del día', 'checklist'], ['clientes', 'Clientes', 'person'],
    ['mensajeros', 'Mensajeros', 'truck'], ['config', 'Configuración', 'settings'],
  ];
  function renderNav() {
    const links = TABS.map(([id, label, icon]) =>
      `<a href="#" class="sidebar-link" data-action="set-tab" data-tab="${id}" ${state.tab === id ? "aria-current='page'" : ''}>${ICONS[icon]}<span>${esc(label)}</span></a>`
    ).join('\n');
    // Below tablet width, .sidebar becomes an off-canvas drawer (see CSS) —
    // this top bar (hamburger + brand) is the only thing always visible on
    // mobile, and toggles it open/closed. Hidden entirely on desktop, where
    // the sidebar is just always there as a fixed column, same as before.
    return `
      <div class="mobile-topbar">
        <button type="button" class="hamburger-btn" data-action="toggle-mobile-nav" aria-label="${state.mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}">
          ${state.mobileNavOpen ? ICONS.close : ICONS.menu}
        </button>
        <img src="assets/logo-logistica-flash.png" alt="" style="height:26px;width:26px;object-fit:contain;border-radius:6px">
        <span>Logística Flash</span>
      </div>
      <div class="mobile-nav-backdrop${state.mobileNavOpen ? ' is-open' : ''}" data-action="close-mobile-nav"></div>
      <aside class="sidebar${state.mobileNavOpen ? ' is-open' : ''}">
        <div class="sidebar-brand">
          <img src="assets/logo-logistica-flash.png" alt="Logística Flash" style="height:34px;width:34px;object-fit:contain;border-radius:6px">
          <span>Logística Flash</span>
        </div>
        ${links}
        <div class="sidebar-spacer"></div>
        <hr class="hr" style="margin:8px 0">
        <div class="sidebar-user">
          <div class="sidebar-avatar">${ICONS.person}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">Administrador</div>
            <a href="#" class="sidebar-logout" data-action="logout">Cerrar sesión</a>
          </div>
        </div>
      </aside>`;
  }

  function renderMain() {
    switch (state.tab) {
      case 'clientes': return renderClientes();
      case 'paquete': return renderPaquete();
      case 'lista': return renderLista();
      case 'mensajeros': return renderMensajeros();
      case 'config': return renderConfig();
      case 'historial': return renderHistorial();
      default: return renderInicio();
    }
  }

  // ── CONFIGURACIÓN ────────────────────────────────────────────────────────
  function renderConfig() {
    const s = state.settings;
    return `
      <div>
        <h1 style="margin-bottom:2px">Configuración</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Estos valores se usan para calcular el costo de todos los paquetes en la app.</p>

        <div class="card elev-sm" style="max-width:480px">
          <div class="field">
            <label>Tipo de cambio (₡ por $)</label>
            <input class="input" id="settings-crc-rate" type="number" step="1" min="0" value="${esc(s.crcRate)}">
            <p class="text-muted" style="margin:4px 0 0;font-size:13px">Se usa para mostrar los costos en colones en las listas y facturas.</p>
          </div>
          <div class="field">
            <label>Peso por libra ($/lb)</label>
            <input class="input" id="settings-rate-per-lb" type="number" step="0.01" min="0" value="${esc(s.ratePerLb)}">
            <p class="text-muted" style="margin:4px 0 0;font-size:13px">Se usa para calcular el costo estimado al registrar un paquete.</p>
          </div>
          <div class="field">
            <label>Precio por pie cúbico ($/ft³)</label>
            <input class="input" id="settings-price-per-cubic-ft" type="number" step="0.01" min="0" value="${esc(s.pricePerCubicFt)}">
            <p class="text-muted" style="margin:4px 0 0;font-size:13px">Se usa para calcular el costo de los paquetes marítimos (por volumen, no por peso).${!s.pricePerCubicFt ? ' <strong style="color:#8a5a00">Todavía está en 0 — configúralo antes de procesar facturas con envíos marítimos.</strong>' : ''}</p>
          </div>
        </div>
      </div>`;
  }

  // ── INICIO ───────────────────────────────────────────────────────────────
  function renderInicio() {
    const currentMonth = todayISO().slice(0, 7);
    const monthDeliveredPackages = state.packages.filter((p) => p.sent && p.sentDate && p.sentDate.slice(0, 7) === currentMonth);
    const totalMonth = monthDeliveredPackages.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);
    const incompleteClients = state.clients.filter((c) => !c.address || !c.province).length;
    const pending = state.packages.filter((p) => !p.clientId).length;
    const esperandoLlegada = state.packages.filter((p) => p.clientId && !p.arrived).length;
    const bodegaIncompleto = state.packages.filter((p) => p.clientId && p.arrived && !p.sent && !p.routed && !pkgInfoComplete(p)).length;
    const porAsignar = readyToRoutePackages().length;
    const debePackages = state.packages.filter((p) => p.delivered && !p.sent);
    const debeTotal = debePackages.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);

    const parts = [];
    if (pending > 0) parts.push(`${pending} sin identificar`);
    if (esperandoLlegada > 0) parts.push(`${esperandoLlegada} esperando llegada`);
    if (bodegaIncompleto > 0) parts.push(`${bodegaIncompleto} en bodega sin completar`);
    if (porAsignar > 0) parts.push(`${porAsignar} listos para asignar`);
    const hasPending = parts.length > 0;
    const cardStyle = hasPending ? 'border:1px solid var(--color-accent-300);background:var(--color-accent-100);gap:var(--space-3)' : '';
    const message = hasPending
      ? `Tienes paquetes por revisar: ${parts.join(', ')}.`
      : 'Todos los paquetes están identificados y asignados. Buen trabajo.';

    return `
      <div>
        <div style="position:relative;overflow:hidden;border-radius:var(--radius-lg);background:linear-gradient(135deg, var(--color-accent-800) 0%, var(--color-accent-600) 45%, var(--color-accent-500) 100%);padding:var(--space-6) var(--space-6);margin-bottom:var(--space-6);isolation:isolate">
          <div style="position:relative;z-index:1">
            <h6 style="margin-bottom:2px;color:var(--color-accent-100);font-weight:700;letter-spacing:0.02em;text-transform:uppercase;font-size:12px">${esc(todayLabel())}</h6>
            <h1 style="margin-bottom:0;color:#ffffff">${esc(greeting())}</h1>
          </div>
        </div>

        <div class="stat-grid">
          <div class="card elev-sm">
            <div class="card-kicker">Total entregado este mes</div>
            <div class="card-title" style="font-size:34px">$${fmtMoney(totalMonth)}</div>
            <p class="card-body">≈ ₡${fmtCRC(totalMonth * state.settings.crcRate)} · ${monthDeliveredPackages.length} paquetes entregados</p>
          </div>
          <div class="card elev-sm"${debePackages.length > 0 ? ' style="border:1px solid #e0a800;background:#fdecc8"' : ''}>
            <div class="card-kicker">Por cobrar</div>
            <div class="card-title" style="font-size:34px">${debePackages.length}</div>
            <p class="card-body">$${fmtMoney(debeTotal)} entregados sin pagar</p>
          </div>
          <div class="card elev-sm">
            <div class="card-kicker">Falta info</div>
            <div class="card-title" style="font-size:34px">${incompleteClients}</div>
            <p class="card-body">clientes incompletos</p>
          </div>
          <div class="card elev-sm">
            <div class="card-kicker">En tránsito</div>
            <div class="card-title" style="font-size:34px">${esperandoLlegada}</div>
            <p class="card-body">esperando confirmar llegada</p>
          </div>
          <div class="card elev-sm">
            <div class="card-kicker">Clientes</div>
            <div class="card-title" style="font-size:34px">${state.clients.length}</div>
            <p class="card-body">clientes guardados</p>
          </div>
        </div>

        <hr class="hr">

        <h4 style="margin:var(--space-4) 0 var(--space-3)">Accesos rápidos</h4>
        <div class="quick-actions">
          <button class="btn btn-secondary btn-block" data-action="set-tab" data-tab="clientes" type="button" style="gap:10px">
            <span style="color:var(--color-accent-600);display:flex">${ICONS.person}</span><span>Agregar cliente</span><span style="margin-left:auto">→</span>
          </button>
          <button class="btn btn-secondary btn-block" data-action="set-tab" data-tab="paquete" type="button" style="gap:10px">
            <span style="color:var(--color-accent-600);display:flex">${ICONS.box}</span><span>Registrar paquete</span><span style="margin-left:auto">→</span>
          </button>
          <button class="btn btn-secondary btn-block" data-action="set-tab" data-tab="lista" type="button" style="gap:10px">
            <span style="color:var(--color-accent-600);display:flex">${ICONS.checklist}</span><span>Lista del día por mensajero</span><span style="margin-left:auto">→</span>
          </button>
        </div>

        <hr class="hr">

        <h4 style="margin:var(--space-4) 0 var(--space-3)">Acción pendiente</h4>
        <div class="card elev-sm" style="${cardStyle}">
          <p style="margin:0;font-size:15px">${esc(message)}</p>
          ${hasPending ? `<button class="btn btn-primary" type="button" data-action="set-tab" data-tab="paquete" style="width:fit-content">Asignar pendientes →</button>` : ''}
        </div>
      </div>`;
  }

  // ── CLIENTES ─────────────────────────────────────────────────────────────
  function renderClientes() {
    const editing = state.clientEditingId ? clientById(state.clientEditingId) : null;
    const f = state.clientDraft;

    return `
      <div>
        <h1 style="margin-bottom:2px">${editing ? 'Editar cliente' : 'Agregar cliente'}</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Se guarda una sola vez por cliente. Así los mensajeros ya no dependen de mensajes sueltos por WhatsApp.</p>

        <div class="card elev-sm" id="client-form-card" style="max-width:560px;margin-bottom:var(--space-8)">
          <div class="field">
            <label>Nombre y apellido *</label>
            <input class="input" id="client-name" type="text" value="${esc(f.name)}" placeholder="Ej: María Fernández">
          </div>
          <div class="field">
            <label>Código de cliente</label>
            <input class="input" id="client-code" type="text" value="${esc(editing ? formatClientCode(editing.codeSeq) : formatClientCode(nextClientCodeSeq()))}" disabled>
            <p class="text-muted" style="margin:4px 0 0;font-size:13px">Se asigna solo, en orden — el mismo tipo de código que ya usan para identificar clientes.</p>
          </div>
          <div class="field">
            <label>Teléfono *</label>
            <input class="input" id="client-phone" type="tel" value="${esc(f.phone)}" placeholder="Ej: 8888-1234">
          </div>
          <div class="field">
            <label>Teléfono 2 — opcional</label>
            <input class="input" id="client-phone2" type="tel" value="${esc(f.phone2)}" placeholder="Ej: 8888-5678">
          </div>
          <div class="field">
            <label>Dirección (link de Waze o Google Maps) — opcional</label>
            <input class="input" id="client-address" type="text" value="${esc(f.address)}" placeholder="Pega aquí el link de ubicación">
          </div>
          <div class="field">
            <label>Detalles de dirección — opcional</label>
            <input class="input" id="client-address-details" type="text" value="${esc(f.addressDetails)}" placeholder="Ej: Portón negro, casa esquinera, apto 3B">
          </div>
          <div class="field">
            <label>Provincia — opcional</label>
            <select class="input" id="client-province">
              <option value="">Selecciona provincia...</option>
              ${PROVINCIAS.map((p) => `<option value="${esc(p)}" ${f.province === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Cantón — opcional</label>
            <select class="input" id="client-canton" ${!f.province ? 'disabled' : ''}>
              <option value="">Selecciona cantón...</option>
              ${(CANTONES_BY_PROVINCIA[f.province] || []).map((ct) => `<option value="${esc(ct)}" ${f.canton === ct ? 'selected' : ''}>${esc(ct)}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2)">
            <button class="btn btn-primary" type="button" data-action="save-client">${editing ? 'Guardar cambios' : 'Guardar cliente'}</button>
            ${editing ? `<button class="btn btn-secondary" type="button" data-action="cancel-edit-client">Cancelar</button>` : ''}
          </div>
        </div>

        <hr class="hr">

        <h4 style="margin:var(--space-4) 0 var(--space-3)">Clientes guardados (${state.clients.length})</h4>
        <div class="field" style="max-width:320px">
          <label>Buscar por código, nombre, zona o teléfono</label>
          <input class="input" id="client-search" type="text" placeholder="Ej: JG-238, María, Heredia, 8888...">
        </div>
        <div id="client-list"></div>
      </div>`;
  }

  function renderClientList() {
    const container = document.getElementById('client-list');
    if (!container) return;
    const searchEl = document.getElementById('client-search');
    const q = normalize(searchEl ? searchEl.value : '').trim();

    const filtered = q
      ? state.clients.filter((c) =>
          normalize(c.name).includes(q) ||
          normalize(formatClientCode(c.codeSeq)).includes(q) ||
          normalize(c.phone).includes(q) ||
          normalize(c.phone2).includes(q) ||
          normalize(c.province).includes(q) ||
          normalize(c.canton).includes(q))
      : state.clients;
    const sorted = [...filtered].sort((a, b) => (a.codeSeq || 0) - (b.codeSeq || 0));

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, state.clientsPage), totalPages);
    const pageClients = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const rows = pageClients.map((c) => {
      const incomplete = !c.address || !c.province;
      return `
        <tr>
          <td>${esc(formatClientCode(c.codeSeq) || '—')}</td>
          <td>${esc(c.name)}${incomplete ? '<span class="tag tag-warn" style="margin-left:6px">Falta info</span>' : ''}</td>
          <td><span class="tag tag-neutral">${esc(c.province || 'Sin provincia')}</span></td>
          <td>${esc(c.canton || '—')}</td>
          <td>${esc(c.phone)}${c.phone2 ? `<br><span class="text-muted" style="font-size:12px">${esc(c.phone2)}</span>` : ''}</td>
          <td>${safeHref(c.address)
            ? `<a href="${esc(c.address)}" target="_blank" rel="noopener">Ver ubicación</a>`
            : `<span class="text-muted">Sin dirección</span>`}</td>
          <td style="text-align:right;white-space:nowrap">
            <button class="btn btn-icon btn-ghost" type="button" data-action="edit-client" data-id="${c.id}" aria-label="Editar" title="Editar">${ICONS.edit}</button>
            <button class="btn btn-icon btn-ghost" type="button" data-action="delete-client" data-id="${c.id}" aria-label="Eliminar" title="Eliminar">${ICONS.trash}</button>
          </td>
        </tr>`;
    }).join('\n');

    container.innerHTML = `
      <div class="table-scroll">
        <table class="table">
          <thead><tr><th>Código</th><th>Nombre</th><th>Provincia</th><th>Cantón</th><th>Teléfono</th><th>Dirección</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${sorted.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-3)">${q ? 'Sin coincidencias.' : 'Aún no hay clientes guardados.'}</p>` : ''}
      ${totalPages > 1 ? `
        <div class="pagination-row">
          <button class="btn btn-secondary" type="button" data-action="clients-page" data-dir="prev" ${page <= 1 ? 'disabled' : ''}>← Anterior</button>
          <span class="text-muted">Página ${page} de ${totalPages}</span>
          <button class="btn btn-secondary" type="button" data-action="clients-page" data-dir="next" ${page >= totalPages ? 'disabled' : ''}>Siguiente →</button>
        </div>` : ''}`;
  }

  // ── REGISTRAR PAQUETE ────────────────────────────────────────────────────
  function pkgMatchesHtml(query) {
    const q = normalize(query).trim();
    if (!q) return '';
    const matches = state.clients
      .filter((c) => normalize(c.name).includes(q) || normalize(formatClientCode(c.codeSeq)).includes(q))
      .slice(0, 6);
    if (matches.length === 0) return `<p class="text-muted">Sin coincidencias. Revisa el nombre/código o agrégalo en "Clientes".</p>`;
    const items = matches.map((c) => {
      const mm = messengerForZone(c.province);
      return `
        <button type="button" data-action="select-pkg-client" data-id="${c.id}" class="btn btn-secondary" style="justify-content:space-between;text-align:left;height:auto;padding:var(--space-2)">
          <span>${esc(clientLabel(c))}</span>
          <span style="display:flex;gap:6px">
            <span class="tag tag-neutral">${esc(clientZoneLabel(c))}</span>
            <span class="tag tag-accent">${esc(mm ? mm.name : 'Sin mensajero')}</span>
          </span>
        </button>`;
    }).join('\n');
    return `<div style="display:flex;flex-direction:column;gap:6px;border:1px solid var(--color-divider);padding:var(--space-2);margin-bottom:var(--space-2)">${items}</div>`;
  }

  function updatePkgSubmitState() {
    const btn = document.getElementById('pkg-submit');
    if (!btn) return;
    const tracking = (document.getElementById('pkg-tracking') || {}).value || '';
    // Cliente and peso are no longer required here — a tracking someone just
    // forwarded, with nothing else known yet, still needs to exist so it
    // isn't lost before the invoice/weight catches up to it.
    btn.disabled = !tracking.trim();
  }

  function updatePkgCostCRC() {
    const el = document.getElementById('pkg-cost-crc');
    if (!el) return;
    const cost = state.pkgDraft.cost;
    el.textContent = cost ? '≈ ₡' + fmtCRC(parseFloat(cost) * state.settings.crcRate) : '';
  }

  // A package can be marked "En Bodega" the moment it physically shows up,
  // even before anyone's filled in who it belongs to or what it weighs —
  // but it can't be assigned to a mensajero missing that. What counts as
  // "the measure" depends on shipping type: aéreo bills by weight (lb),
  // marítimo by volume (ft³) — a maritime package never has a weight, so
  // checking p.weight here would leave it permanently "incomplete".
  function pkgInfoComplete(p) {
    const hasMeasure = p.shippingType === 'maritimo' ? p.cubicFeet != null : p.weight != null;
    return !!p.clientId && hasMeasure && p.cost != null;
  }

  function pkgHasMessenger(p) {
    const c = clientById(p.clientId);
    return !!(c && effectiveMessenger(p, c));
  }

  // Ready doesn't mean gone: even a complete, arrived package waits here
  // until an admin explicitly assigns it (routed) — it might be physically
  // ready but the client can't receive it that day, etc.
  function isReadyToRoute(p) {
    return p.arrived && !p.sent && !p.routed && pkgInfoComplete(p) && pkgHasMessenger(p);
  }

  function readyToRoutePackages() {
    return state.packages.filter(isReadyToRoute);
  }

  // Everything still in Registrar paquete's queue: waiting to physically
  // arrive, arrived but missing info, or arrived and complete but not yet
  // assigned to a mensajero. Once routed, it moves into Lista del día;
  // once sent (paid), it belongs in Historial instead.
  function pendingPackages() {
    return state.packages.filter((p) => !p.sent && !p.routed);
  }

  function getPkgListRows() {
    const f = state.pkgListFilters;
    const q = normalize(f.query).trim();
    const invoiceQ = normalize(f.invoiceNumber).trim();
    return pendingPackages()
      .map((p) => {
        const c = p.clientId ? clientById(p.clientId) : null;
        const estado = !p.arrived
          ? (c ? 'esperando-llegada' : 'sin-cliente')
          : (pkgInfoComplete(p) ? 'bodega-por-entregar' : 'bodega-falta-info');
        return { p, c, estado };
      })
      .filter(({ p, c }) => !q || normalize(p.tracking).includes(q) || (p.invoiceNumber && normalize(p.invoiceNumber).includes(q)) || (c && (normalize(c.name).includes(q) || normalize(formatClientCode(c.codeSeq)).includes(q))))
      .filter(({ p }) => !invoiceQ || (p.invoiceNumber && normalize(p.invoiceNumber).includes(invoiceQ)))
      .filter(({ estado }) => !f.estado || f.estado === estado)
      // Oldest first — this is a work queue, not a feed; the one waiting
      // longest should be first in line, not buried once newer ones pile up.
      .sort((a, b) => (a.p.createdAt || '').localeCompare(b.p.createdAt || ''));
  }

  function renderPaquete() {
    const editing = state.pkgEditingId ? state.packages.find((p) => p.id === state.pkgEditingId) : null;
    const draft = state.pkgDraft;

    const selectedClient = state.pkgSelectedClientId ? clientById(state.pkgSelectedClientId) : null;
    const selectedMessenger = selectedClient ? messengerForZone(selectedClient.province) : null;
    const f = state.pkgListFilters;

    return `
      <div>
        <h1 style="margin-bottom:2px">Registrar paquete</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Crea el paquete e identifícalo con su cliente, o dejalo sin identificar si no sabés de quién es. Marcalo como llegado solo cuando esté físicamente aquí — así entra a la ruta del mensajero.</p>

        <div class="card elev-sm" style="max-width:900px;margin-bottom:var(--space-4)">
          <div class="card-kicker">Factura del casillero</div>
          <div class="card-title" style="margin-bottom:var(--space-2)">Subir factura PDF</div>
          <p class="card-body" style="margin-bottom:var(--space-3)">Sube la factura del casillero y la app compara cada tracking contra tus paquetes — marca como llegados los que ya tenías registrados (con su peso) y deja los que no reconozca como Desconocidos, todo de una vez.</p>
          <input type="file" id="invoice-file-input" accept="application/pdf" style="display:none">
          <button class="btn btn-primary" type="button" data-action="upload-invoice" ${state.invoiceParsing ? 'disabled' : ''}>${state.invoiceParsing ? 'Analizando…' : 'Subir factura PDF'}</button>
        </div>

        <div class="card elev-sm" id="pkg-form-card" style="max-width:900px;margin-bottom:var(--space-8)">
          <div class="card-kicker">${editing ? 'Editar paquete' : 'Nuevo paquete'}</div>
          <div class="card-title" style="margin-bottom:var(--space-2)">Datos del paquete y cliente</div>

          <div style="display:grid;min-width:0;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-3)">
            <div class="field">
              <label>ID de tracking</label>
              <input class="input" id="pkg-tracking" type="text" value="${esc(draft.tracking)}" placeholder="Ej: TBA912345678">
            </div>
            <div class="field">
              <label>Estado</label>
              <div style="display:flex;gap:var(--space-4);min-height:36px;align-items:center">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px">
                  <input type="radio" name="pkg-estado" id="pkg-estado-transito" value="transito" ${!draft.arrived ? 'checked' : ''} style="width:16px;height:16px;flex:none">
                  <span>En Tránsito / Pre-alerta</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px">
                  <input type="radio" name="pkg-estado" id="pkg-estado-bodega" value="bodega" ${draft.arrived ? 'checked' : ''} style="width:16px;height:16px;flex:none">
                  <span>En Bodega</span>
                </label>
              </div>
            </div>
            <div class="field">
              <label>Tipo de envío</label>
              <div style="display:flex;gap:var(--space-4);min-height:36px;align-items:center">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px">
                  <input type="radio" name="pkg-tipo-envio" id="pkg-tipo-aereo" value="aereo" ${draft.shippingType !== 'maritimo' ? 'checked' : ''} style="width:16px;height:16px;flex:none">
                  <span>Aéreo (lb)</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px">
                  <input type="radio" name="pkg-tipo-envio" id="pkg-tipo-maritimo" value="maritimo" ${draft.shippingType === 'maritimo' ? 'checked' : ''} style="width:16px;height:16px;flex:none">
                  <span>Marítimo (ft³)</span>
                </label>
              </div>
            </div>
          </div>

          <div style="display:grid;min-width:0;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-3)">
            ${draft.shippingType === 'maritimo' ? `
              <div class="field">
                <label>Pies cúbicos — opcional</label>
                <input class="input" id="pkg-cubic-feet" type="number" step="0.1" min="0" value="${esc(draft.cubicFeet)}" placeholder="Ej: 4">
              </div>
              <div class="field">
                <label>Costo estimado ($${state.settings.pricePerCubicFt}/ft³) — editable</label>
                <div class="input-currency-wrap">
                  <span class="input-currency-sign">$</span>
                  <input class="input" id="pkg-cost" type="number" step="0.01" min="0" value="${esc(draft.cost)}" placeholder="0.00">
                </div>
                <p class="text-muted" id="pkg-cost-crc" style="margin:4px 0 0;font-size:13px">${draft.cost ? '≈ ₡' + fmtCRC(parseFloat(draft.cost) * state.settings.crcRate) : ''}</p>
              </div>
            ` : `
              <div class="field">
                <label>Peso (libras) — opcional</label>
                <input class="input" id="pkg-weight" type="number" step="0.1" min="0" value="${esc(draft.weight)}" placeholder="Ej: 3.5">
              </div>
              <div class="field">
                <label>Costo estimado ($${state.settings.ratePerLb}/lb) — editable</label>
                <div class="input-currency-wrap">
                  <span class="input-currency-sign">$</span>
                  <input class="input" id="pkg-cost" type="number" step="0.01" min="0" value="${esc(draft.cost)}" placeholder="0.00">
                </div>
                <p class="text-muted" id="pkg-cost-crc" style="margin:4px 0 0;font-size:13px">${draft.cost ? '≈ ₡' + fmtCRC(parseFloat(draft.cost) * state.settings.crcRate) : ''}</p>
              </div>
            `}
          </div>

          ${!selectedClient ? `
            <div class="field">
              <label>Cliente — buscar por nombre o código</label>
              <input class="input" id="pkg-client-search" type="text" placeholder="Ej: Jorge o JG-238...">
            </div>
            <div id="pkg-matches"></div>
            <p class="text-muted" style="margin:-4px 0 var(--space-2);font-size:13px">¿No sabés todavía de quién es? Dejalo así y creá el paquete igual — queda como <strong>Desconocido</strong> y podés identificarlo después.</p>
          ` : `
            <div style="border:1px solid var(--color-divider);padding:var(--space-3);margin-bottom:var(--space-3)">
              <div style="font-family:var(--font-heading);font-weight:800;font-size:17px;margin-bottom:6px">${esc(clientLabel(selectedClient))}</div>
              <p class="card-body" style="margin-bottom:4px">Teléfono: ${esc(selectedClient.phone)}${selectedClient.phone2 ? ` / ${esc(selectedClient.phone2)}` : ''}</p>
              <p class="card-body" style="margin-bottom:6px">Dirección: ${safeHref(selectedClient.address) ? `<a href="${esc(selectedClient.address)}" target="_blank" rel="noopener">Ver ubicación</a>` : '<span class="text-muted">Sin dirección</span>'}</p>
              <div style="display:flex;gap:6px">
                <span class="tag tag-neutral">${esc(clientZoneLabel(selectedClient))}</span>
                <span class="tag tag-accent">Mensajero: ${esc(selectedMessenger ? selectedMessenger.name : 'Sin mensajero')}</span>
              </div>
            </div>
            <button class="btn btn-ghost" type="button" data-action="change-pkg-client" style="margin-bottom:var(--space-2)">Cambiar cliente</button>
          `}

          <div style="display:flex;gap:var(--space-2)">
            <button class="btn btn-primary" type="button" id="pkg-submit" data-action="save-pkg" ${!draft.tracking.trim() ? 'disabled' : ''}>${editing ? 'Guardar cambios' : 'Crear paquete'}</button>
            ${editing ? `<button class="btn btn-secondary" type="button" data-action="cancel-pkg-edit">Cancelar</button>` : ''}
          </div>
        </div>

        <hr class="hr">
        <h4 style="margin:var(--space-4) 0 var(--space-3)">Paquetes pendientes</h4>
        <p class="text-muted" style="margin-bottom:var(--space-3)">Esperando llegar, o esperando identificar el cliente (Desconocidos).</p>
        <div class="card elev-sm" style="margin-bottom:var(--space-4)">
          <div style="display:grid;min-width:0;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-3)">
            <div class="field">
              <label>Buscar por código, nombre, tracking o # de factura</label>
              <input class="input" id="pkg-list-search" type="text" value="${esc(f.query)}" placeholder="Ej: JG-238, María, TBA912..., 10865">
            </div>
            <div class="field">
              <label>Filtrar únicamente por # de factura</label>
              <input class="input" id="pkg-list-invoice" type="text" value="${esc(f.invoiceNumber)}" placeholder="Ej: 10865">
            </div>
            <div class="field">
              <label>Estado</label>
              <select class="input" id="pkg-list-estado">
                <option value="">Todos</option>
                <option value="esperando-llegada" ${f.estado === 'esperando-llegada' ? 'selected' : ''}>Esperando llegada</option>
                <option value="bodega-falta-info" ${f.estado === 'bodega-falta-info' ? 'selected' : ''}>En Bodega — falta info</option>
                <option value="bodega-por-entregar" ${f.estado === 'bodega-por-entregar' ? 'selected' : ''}>En Bodega — por entregar</option>
                <option value="sin-cliente" ${f.estado === 'sin-cliente' ? 'selected' : ''}>Desconocidos — sin identificar</option>
              </select>
            </div>
          </div>
          <button class="btn btn-ghost" type="button" data-action="pkg-list-clear" style="margin-top:var(--space-2)">Limpiar filtros</button>
        </div>
        <div id="pkg-table"></div>
      </div>`;
  }

  function renderPkgList() {
    const container = document.getElementById('pkg-table');
    if (!container) return;
    const rows = getPkgListRows();
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, state.pkgListPage), totalPages);
    const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const tableRows = pageRows.map(({ p, c }) => {
      const clienteCell = c ? esc(clientLabel(c)) : `<span class="tag tag-warn">Desconocido</span>`;
      let estadoLabel, accion;
      if (!p.arrived) {
        estadoLabel = c ? 'Esperando llegada' : 'Desconocido — en tránsito';
        accion = c
          ? `<button class="btn btn-primary" type="button" data-action="arrive-pkg" data-id="${p.id}">Marcar como llegado →</button>`
          : `<button class="btn btn-primary" type="button" data-action="edit-pkg" data-id="${p.id}">Identificar cliente →</button>`;
      } else if (!pkgInfoComplete(p)) {
        estadoLabel = 'En Bodega — Falta info';
        accion = `<button class="btn btn-primary" type="button" data-action="edit-pkg" data-id="${p.id}">Completar información →</button>`;
      } else if (!pkgHasMessenger(p)) {
        estadoLabel = 'En Bodega — Por entregar';
        accion = `
          <select class="input" data-action="change-pkg-messenger" data-id="${p.id}" title="Ningún mensajero cubre la provincia de este cliente — elegí uno manualmente" style="font-size:13px">
            <option value="">Elegir mensajero manualmente…</option>
            ${state.messengers.map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('')}
          </select>`;
      } else {
        estadoLabel = 'En Bodega — Por entregar';
        accion = `<button class="btn btn-primary" type="button" data-action="assign-route" data-id="${p.id}">Asignar al mensajero →</button>`;
      }
      return `
        <tr>
          <td>${esc(fmtDateCR(localDateFromISO(p.createdAt)) || '—')}</td>
          <td>${esc(p.tracking)}</td>
          <td>${p.invoiceNumber ? esc(p.invoiceNumber) : '<span class="text-muted">—</span>'}</td>
          <td>${clienteCell}</td>
          <td>${p.shippingType === 'maritimo'
            ? (p.cubicFeet != null ? p.cubicFeet + ' ft³' : '<span class="text-muted">—</span>')
            : (p.weight != null ? p.weight + ' lb' : '<span class="text-muted">—</span>')}</td>
          <td>${p.cost != null ? '$' + fmtMoney(p.cost) : '<span class="text-muted">—</span>'}</td>
          <td>${p.cost != null ? '₡' + fmtCRC(p.cost * state.settings.crcRate) : '<span class="text-muted">—</span>'}</td>
          <td>${p.providerUnitCost != null ? '₡' + fmtCRC(p.providerUnitCost) : '<span class="text-muted">—</span>'}</td>
          <td><span class="tag tag-neutral">${esc(estadoLabel)}</span></td>
          <td style="text-align:right;white-space:nowrap">
            <div style="display:inline-flex;gap:6px;align-items:center">
              ${accion}
              <button class="btn btn-icon btn-ghost" type="button" data-action="edit-pkg" data-id="${p.id}" aria-label="Editar" title="Editar">${ICONS.edit}</button>
            </div>
          </td>
        </tr>`;
    }).join('\n');

    const readyIds = rows.filter(({ p }) => isReadyToRoute(p)).map(({ p }) => p.id);
    const aereoCount = rows.filter(({ p }) => p.shippingType === 'aereo').length;
    const maritimoCount = rows.filter(({ p }) => p.shippingType === 'maritimo').length;
    // All three totals reflect whatever's currently filtered — filtering by
    // a factura's consecutivo turns this into "what this invoice's batch
    // actually cost us vs. what we're charging for it", but nothing here is
    // special-cased to that filter; with no filter at all it's just every
    // pending package. Only rows a factura upload has actually matched
    // contribute to "proveedor" (manually registered packages have none of
    // that yet) — "a facturar" comes from `cost` instead, which every
    // package with a weight/volume and rate already has regardless of any
    // invoice match.
    const providerTotal = rows.reduce((sum, { p }) => sum + (Number(p.providerLineTotal) || 0), 0);
    const facturarTotal = rows.reduce((sum, { p }) => sum + (Number(p.cost) || 0) * state.settings.crcRate, 0);
    const gananciaReal = facturarTotal - providerTotal;
    container.innerHTML = `
      <div style="margin-bottom:var(--space-2);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span class="tag tag-accent" style="display:inline-flex;gap:5px"><span>${rows.length}</span><span>pendientes</span></span>
        <span class="tag tag-neutral" style="display:inline-flex;gap:5px"><span>${aereoCount}</span><span>aéreo</span></span>
        <span class="tag tag-neutral" style="display:inline-flex;gap:5px"><span>${maritimoCount}</span><span>marítimo</span></span>
        ${providerTotal > 0 || facturarTotal > 0 ? `
          <span class="tag tag-warn" style="display:inline-flex;gap:5px"><span>Total proveedor:</span><span>₡${fmtCRC(providerTotal)}</span></span>
          <span class="tag tag-neutral" style="display:inline-flex;gap:5px"><span>Total a facturar:</span><span>₡${fmtCRC(facturarTotal)}</span></span>
          <span class="tag ${gananciaReal >= 0 ? 'tag-accent' : 'tag-warn'}" style="display:inline-flex;gap:5px"><span>Ganancia real:</span><span>₡${fmtCRC(gananciaReal)}</span></span>
        ` : ''}
        ${state.pkgListFilters.estado === 'bodega-por-entregar' && readyIds.length > 0 ? `
          <button class="btn btn-primary" type="button" data-action="assign-all-ready" data-ids="${esc(JSON.stringify(readyIds))}">Asignar todos al mensajero (${readyIds.length}) →</button>
        ` : ''}
      </div>
      <div class="table-scroll">
        <table class="table" style="min-width:1560px">
          <thead><tr>
            <th style="width:100px">Fecha</th>
            <th style="width:190px">Tracking</th>
            <th style="width:110px">Factura #</th>
            <th style="width:240px">Cliente</th>
            <th style="width:120px">Peso/Volumen</th>
            <th style="width:100px">Costo ($)</th>
            <th style="width:120px">Costo (₡)</th>
            <th style="width:150px">Costo proveedor (₡)</th>
            <th style="width:190px">Estado</th>
            <th style="width:260px;text-align:right">Acciones</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${rows.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-2)">No hay paquetes pendientes que coincidan con estos filtros.</p>` : ''}
      ${totalPages > 1 ? `
        <div class="pagination-row">
          <button class="btn btn-secondary" type="button" data-action="pkg-list-page" data-dir="prev" ${page <= 1 ? 'disabled' : ''}>← Anterior</button>
          <span class="text-muted">Página ${page} de ${totalPages}</span>
          <button class="btn btn-secondary" type="button" data-action="pkg-list-page" data-dir="next" ${page >= totalPages ? 'disabled' : ''}>Siguiente →</button>
        </div>` : ''}`;
  }

  // ── FACTURA DEL CASILLERO (PDF) ──────────────────────────────────────────
  // Reads the invoice PDF client-side (js/invoiceParser.js, pdf.js — no
  // server, no AI, no cost) and, after a review step the admin can adjust,
  // bulk-applies "marcar como llegado + peso" instead of doing it one
  // tracking at a time.
  function classifyInvoiceRow({ tracking, shippingType, weightLb, cubicFeet, unitCostCRC, lineTotalCRC, invoiceNumber }) {
    const base = { tracking, shippingType, weightLb, cubicFeet, unitCostCRC, lineTotalCRC, invoiceNumber };
    const exact = state.packages.find((p) => normalize(p.tracking) === normalize(tracking));
    if (exact) {
      if (exact.arrived) return { ...base, status: 'already-arrived', packageId: exact.id, selected: false };
      return { ...base, status: 'will-arrive', packageId: exact.id, selected: true };
    }
    // No exact match — check for the FedEx/UPS short-reference case before
    // giving up and treating this as a brand new package.
    const partial = state.packages.find((p) => isPartialTrackingMatch(p.tracking, tracking));
    if (partial) {
      if (partial.arrived) return { ...base, status: 'already-arrived', packageId: partial.id, selected: false };
      return { ...base, status: 'partial-match', packageId: partial.id, matchedTracking: partial.tracking, selected: true };
    }
    return { ...base, status: 'new', packageId: null, selected: true };
  }

  // Its own modal, mounted/unmounted directly off state.invoiceParsing
  // (same pattern as the confirm dialog) rather than a progress bar drawn
  // inside the "Registrar paquete" card. That distinction matters: the
  // in-card version used to keep showing its last frozen state (stuck at
  // "leyendo página X de Y") after parsing finished, because nothing forced
  // that part of the page to redraw once the review dialog opened over it —
  // it was still there, just hidden behind the dialog, and reappeared the
  // moment "Cancelar" closed it. A dedicated modal that's fully torn down
  // the instant invoiceParsing flips false can't get stuck like that.
  function renderInvoiceParsingModal() {
    if (!invoiceParsingRoot) return;
    if (!state.invoiceParsing) { invoiceParsingRoot.innerHTML = ''; return; }
    invoiceParsingRoot.innerHTML = `
      <div class="dialog-backdrop" style="position:fixed;inset:0;z-index:1000">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="invoice-parsing-title" style="width:min(360px,100%)">
          <div class="dialog-title" id="invoice-parsing-title">Analizando factura…</div>
          <div style="height:6px;background:var(--color-divider);border-radius:3px;overflow:hidden;margin-top:var(--space-2)">
            <div id="invoice-parsing-bar" style="height:100%;background:var(--color-accent-600);width:0%;transition:width .2s"></div>
          </div>
        </div>
      </div>`;
  }

  // Direct DOM update on every page read (not renderInvoiceParsingModal(),
  // which would tear down and recreate the bar element each time and so
  // never actually animate the width transition).
  function updateInvoiceParsingProgress() {
    const bar = document.getElementById('invoice-parsing-bar');
    if (bar) bar.style.width = Math.round(state.invoiceParsingProgress * 100) + '%';
  }

  // The invoice's own consecutivo isn't printed anywhere in the PDF's text —
  // checked against a real sample, it's just not there — only in how the
  // casillero's own system names the file it hands out: the LAST 6 digits
  // before ".pdf" ("FacturaCasillero_11039_260729_082821.pdf" → "082821",
  // confirmed against a real example). Returns null (no consecutivo
  // attached, same as today) for a name that doesn't end that way, rather
  // than guessing wrong.
  function extractInvoiceNumber(filename) {
    const m = /(\d{6})(?:\.\w+)?$/.exec((filename || '').trim());
    return m ? m[1] : null;
  }

  async function handleInvoiceFile(file) {
    state.invoiceParsing = true;
    state.invoiceParsingProgress = 0;
    render();
    renderInvoiceParsingModal();
    try {
      const { rows, unparsedLines } = await LF.invoiceParser.parsePdf(file, (p) => {
        state.invoiceParsingProgress = p.phase === 'reading' ? p.page / p.totalPages : 0;
        updateInvoiceParsingProgress();
      });
      // Always reset back to normal the instant parsing ends, before
      // branching into "show review" / "show alert" / whatever comes next
      // — otherwise a stale disabled button or a stuck modal can linger
      // behind that next screen (see comment on renderInvoiceParsingModal).
      state.invoiceParsing = false;
      render();
      renderInvoiceParsingModal();
      if (rows.length === 0) {
        window.alert('No se encontraron líneas reconocibles en este PDF. ¿Es una factura del casillero, y trae texto (no una imagen escaneada)?');
        return;
      }
      const invoiceNumber = extractInvoiceNumber(file.name);
      state.invoiceReviewRows = rows.map((r) => classifyInvoiceRow({ ...r, invoiceNumber }));
      state.invoiceReviewUnparsedLines = unparsedLines;
      openInvoiceReview();
    } catch (err) {
      state.invoiceParsing = false;
      render();
      renderInvoiceParsingModal();
      console.error(err);
      window.alert('No se pudo leer este PDF. Puede que esté dañado, protegido, o que sea una imagen escaneada sin texto. (' + (err && err.message ? err.message : 'error desconocido') + ')');
    }
  }

  function openInvoiceReview() {
    state.invoiceReviewOpen = true;
    renderInvoiceReview();
  }

  function closeInvoiceReview() {
    state.invoiceReviewOpen = false;
    state.invoiceReviewRows = [];
    state.invoiceReviewUnparsedLines = [];
    renderInvoiceReview();
  }

  async function commitInvoiceReview() {
    const selected = state.invoiceReviewRows.filter((r) => r.selected && r.status !== 'already-arrived');
    if (selected.length === 0) { closeInvoiceReview(); return; }
    await withBusy(async () => {
      for (const row of selected) {
        const isMaritime = row.shippingType === 'maritimo';
        const measure = isMaritime ? row.cubicFeet : row.weightLb;
        const rate = isMaritime ? state.settings.pricePerCubicFt : state.settings.ratePerLb;
        const cost = Math.round(measure * rate * 100) / 100;
        const payload = {
          weight: isMaritime ? null : row.weightLb,
          cubicFeet: isMaritime ? row.cubicFeet : null,
          shippingType: row.shippingType,
          cost, arrived: true, assignedDate: todayISO(),
          invoiceNumber: row.invoiceNumber, providerUnitCost: row.unitCostCRC, providerLineTotal: row.lineTotalCRC,
        };
        if (row.status === 'will-arrive') {
          const existing = state.packages.find((p) => p.id === row.packageId);
          if (!existing) continue;
          await LF.db.updatePackage(row.packageId, { ...payload, tracking: existing.tracking, clientId: existing.clientId });
        } else if (row.status === 'partial-match') {
          const existing = state.packages.find((p) => p.id === row.packageId);
          if (!existing) continue;
          // Replace the short reference Nana originally typed with the full
          // tracking from the invoice — the next invoice that mentions this
          // package will then match it exactly instead of needing this
          // fallback again.
          await LF.db.updatePackage(row.packageId, { ...payload, tracking: row.tracking, clientId: existing.clientId });
        } else {
          await LF.db.createPackage({ ...payload, tracking: row.tracking, clientId: null });
        }
      }
      await reloadPackages();
      closeInvoiceReview();
      render();
    }, `Factura aplicada — ${selected.length} paquete${selected.length === 1 ? '' : 's'}.`);
  }

  // 'partial-match' has no dedicated .tag-* class — .tag-accent-2 exists in
  // CSS but is literally the same navy as .tag-accent (unused/undifferentiated
  // color slot), so it wouldn't actually stand out. Styled inline instead,
  // same as the existing "Entregado — Debe" tag elsewhere in this file.
  const INVOICE_STATUS_LABEL = {
    'will-arrive': { text: 'Se marcará como llegado', cls: 'tag-accent' },
    'already-arrived': { text: 'Ya estaba en bodega — se omite', cls: 'tag-neutral' },
    'new': { text: 'Nuevo — se creará como Desconocido', cls: 'tag-warn' },
    'partial-match': { text: 'Match parcial — verificar', style: 'background:#eee5fb;color:#5b2a9e;border:1px solid #8b5cf6' },
  };

  function renderInvoiceReview() {
    if (!invoiceReviewRoot) return;
    if (!state.invoiceReviewOpen) { invoiceReviewRoot.innerHTML = ''; return; }
    const rowsHtml = state.invoiceReviewRows.map((r, i) => {
      const s = INVOICE_STATUS_LABEL[r.status];
      const measure = r.shippingType === 'maritimo' ? `${r.cubicFeet} ft³` : `${r.weightLb} lb`;
      const trackingCell = r.status === 'partial-match'
        ? `${esc(r.tracking)}<br><span class="text-muted" style="font-size:11px">↳ coincide con el tracking registrado: ${esc(r.matchedTracking)}</span>`
        : esc(r.tracking);
      return `
        <tr${r.status === 'partial-match' ? ' style="background:#f7f2fd"' : ''}>
          <td><input type="checkbox" data-action="toggle-invoice-row" data-idx="${i}" ${r.selected ? 'checked' : ''} ${r.status === 'already-arrived' ? 'disabled' : ''}></td>
          <td>${trackingCell}</td>
          <td>${esc(measure)}</td>
          <td><span class="tag ${s.cls || ''}" ${s.style ? `style="${s.style}"` : ''}>${s.text}</span></td>
        </tr>`;
    }).join('\n');
    const selectedCount = state.invoiceReviewRows.filter((r) => r.selected && r.status !== 'already-arrived').length;
    const hasMaritimeRows = state.invoiceReviewRows.some((r) => r.shippingType === 'maritimo');
    const unparsedLines = state.invoiceReviewUnparsedLines;

    invoiceReviewRoot.innerHTML = `
      <div class="dialog-backdrop" style="position:fixed;inset:0;z-index:1000">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="invoice-review-title" style="width:min(720px,100%)">
          <div class="dialog-title" id="invoice-review-title">Revisar factura — ${state.invoiceReviewRows.length} línea(s) encontradas</div>
          ${hasMaritimeRows && !state.settings.pricePerCubicFt ? `<p style="color:#8a5a00;font-size:13px;margin:0 0 var(--space-2)">⚠ El precio por pie cúbico todavía está en 0 (Configuración) — los paquetes marítimos de esta factura se guardarían con costo ₡0.</p>` : ''}
          ${unparsedLines.length > 0 ? `
            <details style="margin:0 0 var(--space-2)">
              <summary style="color:#8a5a00;font-size:13px;cursor:pointer">⚠ ${unparsedLines.length} línea(s) no reconocidas — ver detalle</summary>
              <ul style="margin:6px 0 0;padding-left:18px;font-size:13px;color:#8a5a00">
                ${unparsedLines.map((l) => `<li>${esc(l)}</li>`).join('')}
              </ul>
            </details>` : ''}
          <div class="table-scroll" style="max-height:50vh;overflow-y:auto">
            <table class="table">
              <thead><tr><th></th><th>Tracking</th><th>Peso/Volumen</th><th>Estado</th></tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" data-action="cancel-invoice-review">Cancelar</button>
            <button type="button" class="btn btn-primary" data-action="confirm-invoice-review" ${selectedCount === 0 ? 'disabled' : ''}>Confirmar y procesar (${selectedCount})</button>
          </div>
        </div>
      </div>`;
  }

  // ── LISTA DEL DIA ────────────────────────────────────────────────────────
  // Only what's been explicitly assigned (routed) shows up here — a package
  // can be complete and ready and still not belong on today's route (the
  // client might not be able to receive it yet). That queue lives in
  // Registrar paquete instead; this screen is exclusively the active route.
  // Once delivered — paid or not — it's done as far as the mensajero's route
  // is concerned; it moves on to Historial (which already shows "Debe" rows
  // with their own "Marcar pagado" button) instead of lingering here.
  function activeRoutePackages() {
    return state.packages.filter((p) => p.routed && !p.sent && !p.delivered);
  }

  // saveMessenger() now blocks new overlaps, but data saved before that check
  // existed can still have one province on two messengers — which duplicates
  // the package across both cards and both route totals. Detect it so it's
  // visible instead of quietly inflating the numbers.
  function duplicatedZones() {
    const byZone = new Map();
    state.messengers.forEach((m) => {
      (Array.isArray(m.zones) ? m.zones : []).forEach((z) => {
        if (!byZone.has(z)) byZone.set(z, []);
        byZone.get(z).push(m.name);
      });
    });
    return [...byZone.entries()].filter(([, names]) => names.length > 1);
  }

  // Today's active-route packages for this mensajero, grouped by client so
  // one client with several packages gets a single stop listing every
  // tracking, instead of repeating their name/address/phone per package.
  // Shared by renderLista() (default straight-line order) and
  // optimizeRoute() (needs the same unordered stop list to send to Google).
  function stopsForMessenger(m) {
    const entries = activeRoutePackages()
      .map((p) => ({ p, c: clientById(p.clientId) }))
      .filter(({ p, c }) => c && effectiveMessenger(p, c)?.id === m.id);
    const stopsByClient = new Map();
    const stops = [];
    entries.forEach(({ p, c }) => {
      let stop = stopsByClient.get(c.id);
      if (!stop) { stop = { c, packages: [] }; stopsByClient.set(c.id, stop); stops.push(stop); }
      stop.packages.push(p);
    });
    return stops;
  }

  // Calls the optional Supabase Edge Function (supabase/functions/optimize-route)
  // to reorder this mensajero's stops using real streets (Google Routes API)
  // instead of the straight-line default. That default keeps working as the
  // fallback if this isn't deployed yet, or the call fails for any reason —
  // this never blocks or breaks Lista del día.
  async function optimizeRoute(messengerId) {
    const m = state.messengers.find((x) => x.id === messengerId);
    if (!m) return;
    const stops = stopsForMessenger(m);
    if (stops.length === 0) return;
    const originCoord = extractLatLng(m.origin);
    if (!originCoord) {
      window.alert('No se pudo leer la ubicación de salida de este mensajero — revisa el link en "Mensajeros".');
      return;
    }
    const withCoords = stops.map((stop) => ({ stop, coord: clientCoord(stop.c) }));
    const missing = withCoords.filter((x) => !x.coord);
    if (missing.length > 0) {
      window.alert('No se pudo optimizar: estos clientes no tienen una ubicación reconocible — ' + missing.map((x) => x.stop.c.name).join(', '));
      return;
    }
    // Same cap the Edge Function enforces — catching it here first skips a
    // pointless round trip.
    if (withCoords.length > 100) {
      window.alert(`Esta ruta tiene ${withCoords.length} paradas — esta función solo maneja hasta 100 a la vez. Dividí la ruta en grupos más pequeños.`);
      return;
    }
    state.routeOptimization[messengerId] = { status: 'loading' };
    render();
    try {
      const { data, error } = await LF.supabase.functions.invoke('optimize-route', {
        body: { origin: originCoord, stops: withCoords.map((x) => x.coord) },
      });
      if (error) throw error;
      const order = data && data.order;
      if (!Array.isArray(order) || order.length !== withCoords.length) throw new Error('Respuesta inválida del servicio de rutas.');
      state.routeOptimization[messengerId] = { status: 'done', orderedStops: order.map((i) => withCoords[i].stop) };
    } catch (err) {
      console.error(err);
      state.routeOptimization[messengerId] = { status: 'error' };
      window.alert('No se pudo optimizar la ruta: ' + (err && err.message ? err.message : 'error desconocido'));
    }
    render();
  }

  function renderLista() {
    const dupZones = duplicatedZones();
    const cards = state.messengers.map((m) => {
      const entries = activeRoutePackages()
        .map((p) => ({ p, c: clientById(p.clientId) }))
        .filter(({ p, c }) => c && effectiveMessenger(p, c)?.id === m.id);

      const totalCost = entries.reduce((sum, { p }) => sum + (Number(p.cost) || 0), 0);
      const totalCostCRC = totalCost * state.settings.crcRate;
      const zoneLabel = m.zones.join(', ') || 'Sin zona asignada';

      const stops = stopsForMessenger(m);

      // Order stops by straight-line distance from the messenger's starting
      // point (extracted from their "punto de salida" link) — a coarse
      // route approximation, not real street routing. If the origin link
      // has no readable coordinates, stops stay in their original order.
      const originCoord = extractLatLng(m.origin);
      const routeOpt = state.routeOptimization[m.id];
      const orderedStops = routeOpt && routeOpt.status === 'done' ? routeOpt.orderedStops : orderStopsByRoute(stops, originCoord);

      // orderedStops only ever holds still-in-transit packages now
      // (activeRoutePackages() already excludes delivered ones), so this is
      // just "everything currently in the route."
      const pendingStops = orderedStops;
      const pendingCount = pendingStops.reduce((n, s) => n + s.packages.length, 0);

      const lines = pendingStops.map((stop, i) => {
        const trackings = stop.packages.map((p) => p.tracking);
        const detailLine = stop.c.addressDetails ? `\nDetalle: ${stop.c.addressDetails}` : '';
        // No amount to collect here on purpose — this message is the
        // mensajero's route sheet, not a bill. The client-facing factura
        // (invoiceMessageForStop, below) is where the amount belongs.
        return `${i + 1}. ${stop.c.name}\nDireccion: ${stop.c.address}${detailLine}\nTelefono: ${stop.c.phone}\nPaquetes: ${trackings.length}\nTracking: ${trackings.join(', ')}`;
      });
      const message = `Ruta de hoy - ${zoneLabel} (${pendingCount} paquetes)\n\n` + lines.join('\n\n━━━━━━━━━━━━━━━━━━━━\n\n');
      const waHref = `https://wa.me/${waPhone(m.phone)}?text=${encodeURIComponent(message)}`;

      // One invoice per client (stop), covering every package they have en
      // esta ruta — no una por paquete, así un cliente con 3 paquetes recibe
      // una sola factura combinada en vez de 3 mensajes separados.
      const invoiceMessageForStop = (stop) => {
        const totalCost = stop.packages.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);
        const costCRC = fmtCRC(totalCost * state.settings.crcRate);
        const pkgWord = stop.packages.length === 1 ? 'tu paquete' : 'tus paquetes';
        // One line per package (tracking + su propio peso/volumen) en vez de
        // un tracking combinado y un total — con más de un paquete, el
        // cliente necesita saber cuál pesa cuánto, no solo la suma.
        const pkgLines = stop.packages.map((p, i) => {
          const measure = p.shippingType === 'maritimo'
            ? (p.cubicFeet != null ? `${p.cubicFeet} ft³` : '—')
            : (p.weight != null ? `${p.weight} lb` : '—');
          return `${i + 1}. Tracking: ${p.tracking} — Peso/Volumen: ${measure}`;
        });
        return `Hola ${stop.c.name}, aquí el detalle de ${pkgWord}:\n\n${pkgLines.join('\n')}\n\nTotal a pagar: ₡${costCRC} ($${fmtMoney(totalCost)} USD)\n\nGracias por confiar en Logística Flash.`;
      };
      const invoiceHrefForStop = (stop) => `https://wa.me/${waPhone(stop.c.phone)}?text=${encodeURIComponent(invoiceMessageForStop(stop))}`;
      const invoiceHrefsJson = esc(JSON.stringify(orderedStops.filter((stop) => stop.c.phone && stop.c.phone.trim()).map((stop) => invoiceHrefForStop(stop))));

      const rows = orderedStops.flatMap((stop) => {
        const hasPhone = !!(stop.c.phone && stop.c.phone.trim());
        const stopInvoiceHref = hasPhone ? invoiceHrefForStop(stop) : '';
        return stop.packages.map((p) => {
          // Delivered packages (paid or "debe") leave activeRoutePackages()
          // entirely, so every row reaching this table is still in transit —
          // Historial is where "Debe" gets tracked and marked paid now.
          const estadoTag = `<span class="tag tag-accent">En ruta</span>`;
          const actions = `<button class="btn btn-secondary" type="button" data-action="deliver-pkg" data-id="${p.id}" data-paid="1" style="white-space:nowrap">Entregado — Pagado</button>
               <button class="btn btn-secondary" type="button" data-action="deliver-pkg" data-id="${p.id}" data-paid="0" style="white-space:nowrap">Entregado — Debe</button>`;
          return `
          <tr>
            <td>${esc(stop.c.name)}</td>
            <td>${safeHref(stop.c.address) ? `<a href="${esc(stop.c.address)}" target="_blank" rel="noopener">Ver ubicación</a>` : `<span class="text-muted">Sin dirección</span>`}</td>
            <td>${esc(stop.c.phone)}</td>
            <td>${esc(p.tracking)}</td>
            <td>$${fmtMoney(p.cost)}</td>
            <td>₡${fmtCRC(p.cost * state.settings.crcRate)}</td>
            <td>${estadoTag}</td>
            <td>
              <select class="input" data-action="change-pkg-messenger" data-id="${p.id}" title="Cambiar el mensajero de este paquete" style="font-size:13px">
                <option value="">Automático (zona)</option>
                ${state.messengers.map((mm) => `<option value="${esc(mm.id)}" ${p.messengerId === mm.id ? 'selected' : ''}>${esc(mm.name)}</option>`).join('')}
              </select>
            </td>
            <td style="text-align:right">
              <div style="display:inline-flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
                ${actions}
                <button class="btn btn-icon btn-ghost" type="button" data-action="send-invoice" data-href="${esc(stopInvoiceHref)}" aria-label="Enviar factura por WhatsApp" title="Enviar factura por WhatsApp" ${hasPhone ? '' : 'disabled'} style="color:#25D366">${ICONS.whatsappMono}</button>
                <button class="btn btn-icon btn-ghost" type="button" data-action="unassign-route" data-id="${p.id}" aria-label="Quitar de la ruta" title="Quitar de la ruta">${ICONS.trash}</button>
              </div>
            </td>
          </tr>`;
        });
      }).join('\n');

      return `
        <div class="card elev-sm">
          <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <div>
              <div class="card-kicker">${esc(zoneLabel)}</div>
              <div class="card-title">${esc(m.name)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              ${routeOpt && routeOpt.status === 'done' ? `<span class="tag tag-accent">Ruta optimizada ✓</span>` : ''}
              <button class="btn btn-secondary" type="button" data-action="optimize-route" data-id="${m.id}" ${entries.length === 0 || (routeOpt && routeOpt.status === 'loading') ? 'disabled' : ''}>
                ${routeOpt && routeOpt.status === 'loading' ? 'Optimizando…' : 'Optimizar ruta con Google Maps'}
              </button>
              <span class="tag tag-accent" style="display:inline-flex;gap:5px"><span>${entries.length}</span><span>en esta ruta</span></span>
            </div>
          </div>
          <div class="table-scroll">
            <table class="table" style="margin-top:var(--space-2);min-width:920px">
              <thead><tr><th>Cliente</th><th>Dirección</th><th>Teléfono</th><th>Tracking</th><th>Costo ($)</th><th>Costo (₡)</th><th>Estado</th><th>Mensajero</th><th style="text-align:right">Acciones</th></tr></thead>
              <tbody>${rows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align:right;font-family:var(--font-heading);font-weight:800">Total a cobrar en esta ruta</td>
                  <td style="text-align:right;font-family:var(--font-heading);font-weight:800">$${fmtMoney(totalCost)}</td>
                  <td style="text-align:right;font-family:var(--font-heading);font-weight:800">₡${fmtCRC(totalCostCRC)}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          ${entries.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-2)">Sin paquetes asignados a este mensajero. Asígnalos desde "Registrar paquete".</p>` : ''}
          <div style="margin-top:var(--space-3);display:flex;flex-wrap:wrap;align-items:center;gap:10px">
            ${pendingCount > 0 ? `
              <a href="${esc(waHref)}" target="_blank" rel="noopener" class="wa-btn" style="width:fit-content;display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#ffffff;font-family:var(--font-heading);font-weight:800;font-size:14px;padding:var(--space-2) calc(var(--space-3) * 1.2);border-radius:var(--radius-md);text-decoration:none">
                ${ICONS.whatsapp}<span>Enviar lista por WhatsApp</span>
              </a>
            ` : ''}
            ${state.invoiceQueue && state.invoiceQueue.messengerId === m.id ? `
              ${state.invoiceQueue.index < state.invoiceQueue.hrefs.length ? `
                <span class="text-muted">Factura ${state.invoiceQueue.index} de ${state.invoiceQueue.hrefs.length} enviada</span>
                <button type="button" data-action="send-invoice-next" class="wa-btn" style="width:fit-content;display:inline-flex;align-items:center;gap:8px;background:transparent;color:#1f9e56;border:1.5px solid #25D366;font-family:var(--font-heading);font-weight:800;font-size:14px;padding:var(--space-2) calc(var(--space-3) * 1.2);border-radius:var(--radius-md)">
                  ${ICONS.invoice}<span>Enviar siguiente (${state.invoiceQueue.index + 1} de ${state.invoiceQueue.hrefs.length}) →</span>
                </button>
                <button type="button" data-action="cancel-invoice-queue" class="btn btn-ghost">Cancelar</button>
              ` : `
                <span class="tag tag-accent">Facturas enviadas: ${state.invoiceQueue.hrefs.length} de ${state.invoiceQueue.hrefs.length} ✓</span>
                <button type="button" data-action="send-all-invoices" data-messenger-id="${m.id}" data-hrefs="${invoiceHrefsJson}" class="btn btn-ghost">Reenviar todas</button>
              `}
            ` : `
              <button type="button" data-action="send-all-invoices" data-messenger-id="${m.id}" data-hrefs="${invoiceHrefsJson}" ${entries.length === 0 ? 'disabled' : ''} class="wa-btn" style="width:fit-content;display:inline-flex;align-items:center;gap:8px;background:transparent;color:#1f9e56;border:1.5px solid #25D366;font-family:var(--font-heading);font-weight:800;font-size:14px;padding:var(--space-2) calc(var(--space-3) * 1.2);border-radius:var(--radius-md)">
                ${ICONS.invoice}<span>Enviar facturas a clientes</span>
              </button>
            `}
          </div>
        </div>`;
    }).join('\n');

    return `
      <div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:var(--space-6)">
          <div>
            <h1 style="margin-bottom:2px">Lista del día por mensajero</h1>
            <p class="text-muted" style="margin:0">${esc(todayLabel())} — la ruta activa de cada mensajero. Los paquetes se asignan desde "Registrar paquete".</p>
          </div>
        </div>
        ${dupZones.length > 0 ? `
          <div class="card elev-sm" style="border:1px solid #e0a800;background:#fdecc8;margin-bottom:var(--space-4)">
            <p style="margin:0;font-size:15px;color:#8a5a00">
              <strong>Hay provincias con más de un mensajero.</strong>
              Los paquetes de esas zonas salen duplicados: se cuentan dos veces en el total a cobrar y el cliente recibiría dos facturas.
            </p>
            <p style="margin:6px 0 0;font-size:13px;color:#8a5a00">${esc(dupZones.map(([z, names]) => `${z}: ${names.join(' y ')}`).join(' · '))}. Corrígelo en "Mensajeros" dejando la provincia en uno solo.</p>
          </div>` : ''}
        <div style="display:flex;flex-direction:column;gap:var(--space-4)">${cards}</div>
      </div>`;
  }

  // ── MENSAJEROS ───────────────────────────────────────────────────────────
  function renderMensajeros() {
    const editing = state.messengerEditingId ? state.messengers.find((m) => m.id === state.messengerEditingId) : null;
    const f = state.messengerDraft;
    const zonesDraft = state.messengerZonesDraft;

    const chips = PROVINCIAS.map((p) => {
      const checked = zonesDraft.includes(p);
      return `<button type="button" class="province-chip${checked ? ' is-selected' : ''}" data-action="toggle-zone" data-zone="${esc(p)}">${esc(p)}</button>`;
    }).join('\n');

    const rows = state.messengers.map((m) => {
      const incomplete = m.zones.length === 0;
      const hasOrigin = !!safeHref(m.origin);
      return `
        <tr>
          <td>${esc(m.name)}${incomplete ? '<span class="tag tag-warn" style="margin-left:6px">Sin zona</span>' : ''}</td>
          <td>${esc(m.phone)}</td>
          <td>${hasOrigin ? `<a href="${esc(m.origin)}" target="_blank" rel="noopener">Ver mapa</a>` : `<span class="text-muted">Sin ubicación</span>`}</td>
          <td><span class="tag tag-neutral">${esc(m.zones.join(', ') || 'Sin zona')}</span></td>
          <td style="text-align:right;white-space:nowrap">
            <button class="btn btn-icon btn-ghost" type="button" data-action="edit-messenger" data-id="${m.id}" aria-label="Editar" title="Editar">${ICONS.edit}</button>
            <button class="btn btn-icon btn-ghost" type="button" data-action="delete-messenger" data-id="${m.id}" aria-label="Eliminar" title="Eliminar">${ICONS.trash}</button>
          </td>
        </tr>`;
    }).join('\n');

    return `
      <div>
        <h1 style="margin-bottom:2px">${editing ? 'Editar mensajero' : 'Agregar mensajero'}</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Nombre, teléfono para WhatsApp y las provincias que cubre cada mensajero.</p>

        <div class="card elev-sm" id="messenger-form-card" style="max-width:560px;margin-bottom:var(--space-8)">
          <div class="field">
            <label>Nombre *</label>
            <input class="input" id="messenger-name" type="text" value="${esc(f.name)}" placeholder="Ej: Mensajero 1">
          </div>
          <div class="field">
            <label>Teléfono (WhatsApp) *</label>
            <input class="input" id="messenger-phone" type="tel" value="${esc(f.phone)}" placeholder="Ej: 8888-1234">
          </div>
          <div class="field">
            <label>Punto de salida — enlace de Waze o Google Maps *</label>
            <input class="input" id="messenger-origin" type="url" value="${esc(f.origin)}" placeholder="Ej: https://waze.com/ul/hd6... o https://maps.app.goo.gl/...">
            <p class="text-muted" style="margin:4px 0 0;font-size:13px">Pega el link para compartir ubicación desde Waze o Google Maps.</p>
          </div>
          <div class="field">
            <label>Provincias que cubre</label>
            <div style="display:flex;flex-wrap:wrap;gap:10px">${chips}</div>
          </div>
          ${state.messengerError ? `<p style="color:#b3261e;font-size:13px;margin:0 0 var(--space-2)">${esc(state.messengerError)}</p>` : ''}
          <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2)">
            <button class="btn btn-primary" type="button" data-action="save-messenger">${editing ? 'Guardar cambios' : 'Guardar mensajero'}</button>
            ${editing ? `<button class="btn btn-secondary" type="button" data-action="cancel-edit-messenger">Cancelar</button>` : ''}
          </div>
        </div>

        <hr class="hr">

        <h4 style="margin:var(--space-4) 0 var(--space-3)">Mensajeros (${state.messengers.length})</h4>
        <div class="table-scroll">
          <table class="table">
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Punto de salida</th><th>Provincias</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${state.messengers.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-3)">Aún no hay mensajeros registrados.</p>` : ''}
      </div>`;
  }

  // ── HISTORIAL ────────────────────────────────────────────────────────────
  // Paquetes ya marcados "enviado", como registro para filtrar y exportar —
  // no como flujo activo (esos ya salieron de Lista del día).
  // Delivered-but-unpaid ("Entregado — Debe") packages used to be invisible
  // here until someone got around to marking them paid — they only showed
  // in Lista del día. They belong in Historial too (it's a completed
  // delivery, just not a closed-out one yet), flagged so it's obvious at a
  // glance which rows still need collecting. No sentDate yet for those, so
  // `date` falls back to deliveredDate — used for sorting and the date
  // filters instead of sentDate directly, or every "debe" row would vanish
  // the moment any date range filter is applied.
  function getHistoryRows() {
    const f = state.historyFilters;
    const q = normalize(f.client).trim();
    const qTracking = normalize(f.tracking).trim();
    return state.packages
      .filter((p) => p.sent || p.delivered)
      .map((p) => {
        const c = clientById(p.clientId);
        const mm = c ? effectiveMessenger(p, c) : null;
        return {
          id: p.id,
          tracking: p.tracking,
          cost: Number(p.cost) || 0,
          clientName: c ? clientLabel(c) : 'Cliente eliminado',
          messengerId: mm ? mm.id : null,
          messengerName: mm ? mm.name : 'Sin mensajero',
          status: p.sent ? 'paid' : 'debe',
          date: p.sentDate || p.deliveredDate || '',
        };
      })
      .filter((r) => !q || normalize(r.clientName).includes(q))
      .filter((r) => !qTracking || normalize(r.tracking).includes(qTracking))
      .filter((r) => !f.messengerId || r.messengerId === f.messengerId)
      .filter((r) => !f.dateFrom || (r.date && r.date >= f.dateFrom))
      .filter((r) => !f.dateTo || (r.date && r.date <= f.dateTo))
      .filter((r) => !f.minAmount || r.cost >= parseFloat(f.minAmount))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  function renderHistorial() {
    const f = state.historyFilters;
    return `
      <div>
        <h1 style="margin-bottom:2px">Historial de entregas</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Paquetes ya entregados, pagados o pendientes de cobro. Filtra y descarga el detalle en Excel.</p>

        <div class="card elev-sm" style="margin-bottom:var(--space-4)">
          <div style="display:grid;min-width:0;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-3)">
            <div class="field">
              <label>Cliente</label>
              <input class="input" id="history-client" type="text" value="${esc(f.client)}" placeholder="Buscar por nombre">
            </div>
            <div class="field">
              <label>Tracking</label>
              <input class="input" id="history-tracking" type="text" value="${esc(f.tracking)}" placeholder="Buscar por tracking">
            </div>
            <div class="field">
              <label>Mensajero</label>
              <select class="input" id="history-messenger">
                <option value="">Todos</option>
                ${state.messengers.map((m) => `<option value="${esc(m.id)}" ${f.messengerId === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>Desde</label>
              <input class="input" id="history-date-from" type="date" value="${esc(f.dateFrom)}">
            </div>
            <div class="field">
              <label>Hasta</label>
              <input class="input" id="history-date-to" type="date" value="${esc(f.dateTo)}">
            </div>
            <div class="field">
              <label>Monto mínimo ($)</label>
              <input class="input" id="history-min-amount" type="number" step="0.01" min="0" value="${esc(f.minAmount)}" placeholder="0.00">
            </div>
          </div>
          <button class="btn btn-ghost" type="button" data-action="clear-history-filters" style="margin-top:var(--space-2)">Limpiar filtros</button>
        </div>

        <div id="history-list"></div>
      </div>`;
  }

  function renderHistoryList() {
    const container = document.getElementById('history-list');
    if (!container) return;
    const rows = getHistoryRows();
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, state.historyPage), totalPages);
    const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const tableRows = pageRows.map((h) => {
      const isDebe = h.status === 'debe';
      const estadoTag = isDebe
        ? `<span class="tag" style="background:#fdecc8;color:#8a5a00;border:1px solid #e0a800">Debe</span>`
        : `<span class="tag tag-accent">Pagado</span>`;
      return `
      <tr${isDebe ? ' style="background:#fdecc8"' : ''}>
        <td>${esc(h.clientName)}</td>
        <td>${esc(h.tracking)}</td>
        <td>${esc(h.messengerName)}</td>
        <td>$${fmtMoney(h.cost)}</td>
        <td>₡${fmtCRC(h.cost * state.settings.crcRate)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${estadoTag}
            ${isDebe ? `<button class="btn btn-secondary" type="button" data-action="mark-paid" data-id="${h.id}" style="white-space:nowrap">Marcar pagado</button>` : ''}
          </div>
        </td>
        <td>${esc(fmtDateCR(h.date) || '—')}</td>
      </tr>`;
    }).join('\n');

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:var(--space-3)">
        <span class="tag tag-accent" style="display:inline-flex;gap:5px"><span>${rows.length}</span><span>entregas</span></span>
        <button class="btn btn-secondary" type="button" data-action="export-history-csv" style="gap:8px" ${rows.length === 0 ? 'disabled' : ''}>
          ${ICONS.download}<span>Exportar a Excel</span>
        </button>
      </div>
      <div class="table-scroll">
        <table class="table" style="min-width:700px">
          <thead><tr><th>Cliente</th><th>Tracking</th><th>Mensajero</th><th>Costo ($)</th><th>Costo (₡)</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${rows.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-3)">No hay entregas que coincidan con estos filtros.</p>` : ''}
      ${totalPages > 1 ? `
        <div class="pagination-row">
          <button class="btn btn-secondary" type="button" data-action="history-page" data-dir="prev" ${page <= 1 ? 'disabled' : ''}>← Anterior</button>
          <span class="text-muted">Página ${page} de ${totalPages}</span>
          <button class="btn btn-secondary" type="button" data-action="history-page" data-dir="next" ${page >= totalPages ? 'disabled' : ''}>Siguiente →</button>
        </div>` : ''}`;
  }

  function exportHistoryCSV() {
    const rows = getHistoryRows();
    const header = ['Cliente', 'Tracking', 'Mensajero', 'Costo ($)', 'Costo (₡)', 'Estado', 'Fecha'];
    const lines = [header.join(',')].concat(rows.map((h) => [
      h.clientName, h.tracking, h.messengerName, fmtMoney(h.cost), Math.round(h.cost * state.settings.crcRate),
      h.status === 'debe' ? 'Debe' : 'Pagado', fmtDateCR(h.date),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')));
    const csv = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-entregas-${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── actions ──────────────────────────────────────────────────────────────
  function setTab(tab) {
    state.tab = tab;
    state.mobileNavOpen = false; // navigating closes the mobile drawer — no effect on desktop
    if (tab === 'clientes') { state.clientEditingId = null; state.clientDraft = { name: '', phone: '', phone2: '', address: '', addressDetails: '', province: '', canton: '' }; }
    if (tab === 'paquete') { state.pkgEditingId = null; state.pkgSelectedClientId = null; state.pkgDraft = { tracking: '', weight: '', cubicFeet: '', cost: '', arrived: false, shippingType: 'aereo' }; }
    if (tab === 'mensajeros') { state.messengerEditingId = null; state.messengerZonesDraft = []; state.messengerDraft = { name: '', phone: '', origin: '' }; state.messengerError = ''; }
    render();
  }

  async function saveClient() {
    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const phone2 = document.getElementById('client-phone2').value;
    const address = document.getElementById('client-address').value;
    const addressDetails = document.getElementById('client-address-details').value;
    const province = document.getElementById('client-province').value;
    const canton = document.getElementById('client-canton').value;
    if (!name.trim() || !phone.trim()) return;
    const isEdit = !!state.clientEditingId;
    await withBusy(async () => {
      const resolvedAddress = await resolveMapLinkIfNeeded(address);
      if (state.clientEditingId) {
        await LF.db.updateClient(state.clientEditingId, { name: name.trim(), phone: phone.trim(), phone2: phone2.trim(), address: resolvedAddress, addressDetails: addressDetails.trim(), province, canton });
      } else {
        await LF.db.createClient({ name: name.trim(), phone: phone.trim(), phone2: phone2.trim(), address: resolvedAddress, addressDetails: addressDetails.trim(), province, canton });
      }
      await reloadClients();
      state.clientEditingId = null;
      state.clientDraft = { name: '', phone: '', phone2: '', address: '', addressDetails: '', province: '', canton: '' };
      render();
    }, isEdit ? 'Cliente actualizado.' : 'Cliente guardado.');
  }

  function deleteClient(id) {
    askConfirm('Eliminar cliente', '¿Eliminar este cliente? Sus paquetes asignados quedarán pendientes.', () => doDeleteClient(id));
  }

  async function doDeleteClient(id) {
    await withBusy(async () => {
      await LF.db.deleteClient(id);
      await Promise.all([reloadClients(), reloadPackages()]);
      render();
    }, 'Cliente eliminado.');
  }

  async function savePkg() {
    const tracking = document.getElementById('pkg-tracking').value;
    const shippingType = state.pkgDraft.shippingType === 'maritimo' ? 'maritimo' : 'aereo';
    const measureEl = document.getElementById(shippingType === 'maritimo' ? 'pkg-cubic-feet' : 'pkg-weight');
    const measure = measureEl ? measureEl.value : '';
    const cost = document.getElementById('pkg-cost').value;
    const arrived = document.getElementById('pkg-estado-bodega').checked;
    if (!tracking.trim()) return;
    const finalMeasure = measure ? parseFloat(measure) : null;
    const rate = shippingType === 'maritimo' ? state.settings.pricePerCubicFt : state.settings.ratePerLb;
    const finalCost = cost ? parseFloat(cost) : (finalMeasure != null ? finalMeasure * rate : null);
    const finalWeight = shippingType === 'maritimo' ? null : finalMeasure;
    const finalCubicFeet = shippingType === 'maritimo' ? finalMeasure : null;
    const editing = state.pkgEditingId ? state.packages.find((p) => p.id === state.pkgEditingId) : null;
    // Only stamp a fresh "llegó hoy" date the moment it actually flips to
    // arrived — leaving an already-arrived package's original date alone
    // when it's just being edited for something else (weight, cliente...).
    const assignedDate = arrived ? (editing && editing.arrived ? editing.assignedDate : todayISO()) : null;
    const isEdit = !!state.pkgEditingId;
    await withBusy(async () => {
      const payload = { tracking: tracking.trim(), weight: finalWeight, cubicFeet: finalCubicFeet, shippingType, cost: finalCost, clientId: state.pkgSelectedClientId, arrived, assignedDate };
      if (state.pkgEditingId) {
        await LF.db.updatePackage(state.pkgEditingId, payload);
      } else {
        await LF.db.createPackage(payload);
      }
      await reloadPackages();
      state.pkgEditingId = null;
      state.pkgSelectedClientId = null;
      state.pkgDraft = { tracking: '', weight: '', cubicFeet: '', cost: '', arrived: false, shippingType: 'aereo' };
      render();
    }, isEdit ? 'Paquete actualizado.' : 'Paquete registrado.');
  }

  function markArrived(id) {
    askConfirm('Confirmar llegada', '¿Confirmas que este paquete ya está aquí y listo para el mensajero?', () => doMarkArrived(id), 'Confirmar');
  }

  async function doMarkArrived(id) {
    await withBusy(async () => {
      await LF.db.markArrived(id, todayISO());
      await reloadPackages();
      render();
    }, 'Paquete marcado como llegado.');
  }

  // No confirmation dialog on purpose — this is meant to be a quick, no-
  // friction correction (wrong zone, mensajero out sick, etc), and it's
  // trivially reversible by just picking "Automático (zona)" again.
  async function changePkgMessenger(id, messengerId) {
    const label = messengerId ? messengerById(messengerId)?.name : null;
    await withBusy(async () => {
      await LF.db.setPackageMessenger(id, messengerId);
      await reloadPackages();
      render();
    }, label ? `Paquete reasignado a ${label}.` : 'Vuelto a asignación automática por zona.');
  }

  function assignRoute(id) {
    askConfirm('Asignar al mensajero', '¿Asignar este paquete a la ruta de hoy? Pasará a "Lista del día" para el mensajero de su zona.', () => doAssignRoute(id), 'Asignar');
  }

  async function doAssignRoute(id) {
    await withBusy(async () => {
      await LF.db.assignToRoute(id, todayISO());
      await reloadPackages();
      render();
    }, 'Paquete asignado a la ruta de hoy.');
  }

  function assignAllReady(ids) {
    if (!ids.length) return;
    askConfirm('Asignar todos al mensajero', `¿Asignar los ${ids.length} paquetes listos a la ruta de hoy? Cada uno pasará al mensajero de su zona.`, () => doAssignAllReady(ids), 'Asignar todos');
  }

  async function doAssignAllReady(ids) {
    await withBusy(async () => {
      const today = todayISO();
      for (const id of ids) {
        await LF.db.assignToRoute(id, today);
      }
      await reloadPackages();
      render();
    }, `${ids.length} paquete${ids.length === 1 ? '' : 's'} asignado${ids.length === 1 ? '' : 's'} a la ruta de hoy.`);
  }

  function unassignRoute(id) {
    askConfirm('Quitar de la ruta', '¿Quitar este paquete de la ruta? Volverá a "En Bodega — Por entregar" en Registrar paquete.', () => doUnassignRoute(id), 'Quitar');
  }

  async function doUnassignRoute(id) {
    await withBusy(async () => {
      await LF.db.unassignRoute(id);
      await reloadPackages();
      render();
    }, 'Paquete quitado de la ruta.');
  }

  function deliverPkg(id, paid) {
    const title = paid ? 'Entregado — Pagado' : 'Entregado — Debe';
    const msg = paid
      ? '¿Confirmas que el mensajero ya entregó este paquete y el cliente ya pagó? Pasará al historial.'
      : '¿Confirmas que el mensajero ya entregó este paquete, pero el cliente todavía no ha pagado? Se queda visible en Lista del día marcado como "Debe" hasta que se cobre.';
    askConfirm(title, msg, () => doDeliverPkg(id, paid), 'Confirmar');
  }

  async function doDeliverPkg(id, paid) {
    await withBusy(async () => {
      const today = todayISO();
      await LF.db.markDelivered(id, { deliveredDate: today, paid, paidDate: paid ? today : null });
      await reloadPackages();
      render();
    }, paid ? 'Entrega registrada — pagado.' : 'Entrega registrada — queda debiendo.');
  }

  function markPaid(id) {
    askConfirm('Marcar como pagado', '¿Confirmas que el cliente ya pagó este paquete? Pasará al historial.', () => doMarkPaid(id), 'Confirmar');
  }

  async function doMarkPaid(id) {
    await withBusy(async () => {
      await LF.db.markPackageSent(id, todayISO());
      await reloadPackages();
      render();
    }, 'Pago registrado.');
  }

  async function saveSettings(ratePerLb, crcRate, pricePerCubicFt) {
    await withBusy(async () => {
      state.settings = await LF.db.updateSettings({ ratePerLb, crcRate, pricePerCubicFt });
      // cost is a stored estimate, not something recalculated live from the
      // rate everywhere it's shown — so without this, a rate change here
      // would silently stop matching what a not-yet-paid package actually
      // displays until someone happens to re-save that package by hand.
      // Once a package is paid (sent), its cost is a locked-in historical
      // record instead and is left alone.
      const affected = state.packages.filter((p) => {
        if (p.sent) return false;
        const measure = p.shippingType === 'maritimo' ? p.cubicFeet : p.weight;
        return measure != null;
      });
      for (const p of affected) {
        const rate = p.shippingType === 'maritimo' ? state.settings.pricePerCubicFt : state.settings.ratePerLb;
        const measure = p.shippingType === 'maritimo' ? p.cubicFeet : p.weight;
        const newCost = Math.round(measure * rate * 100) / 100;
        if (newCost === p.cost) continue;
        await LF.db.updatePackage(p.id, {
          tracking: p.tracking, weight: p.weight, cubicFeet: p.cubicFeet, shippingType: p.shippingType,
          cost: newCost, clientId: p.clientId, arrived: p.arrived, assignedDate: p.assignedDate,
        });
      }
      if (affected.length > 0) await reloadPackages();
      render();
    }, 'Configuración guardada.');
  }

  async function saveMessenger() {
    const name = document.getElementById('messenger-name').value;
    const phone = document.getElementById('messenger-phone').value;
    const origin = document.getElementById('messenger-origin').value;
    const zones = state.messengerZonesDraft;

    // These used to fail silently — the button just did nothing with no clue
    // why, since (unlike the package form) it is never disabled.
    if (!name.trim() || !phone.trim() || !origin.trim()) {
      state.messengerError = 'Nombre, teléfono y punto de salida son obligatorios.';
      render(); return;
    }

    // One province, one messenger. Nothing enforced this before, and an
    // overlap made the same package show up in both messengers' cards: counted
    // twice in the route total, listed in both WhatsApp routes, and invoiced
    // to the client twice. Meanwhile messengerForZone() only ever picks the
    // first match, so Registrar paquete and Historial disagreed with Lista
    // del día about who was carrying it.
    const conflicts = zones
      .map((z) => {
        const other = state.messengers.find((m) => m.id !== state.messengerEditingId && Array.isArray(m.zones) && m.zones.includes(z));
        return other ? `${z} (ya la cubre ${other.name})` : null;
      })
      .filter(Boolean);
    if (conflicts.length) {
      state.messengerError = `Cada provincia solo puede tener un mensajero. Quita ${conflicts.length === 1 ? 'esta provincia' : 'estas provincias'} o edita al otro mensajero primero: ${conflicts.join(', ')}.`;
      render(); return;
    }
    state.messengerError = '';
    const isEdit = !!state.messengerEditingId;

    await withBusy(async () => {
      const resolvedOrigin = await resolveMapLinkIfNeeded(origin);
      if (state.messengerEditingId) {
        await LF.db.updateMessenger(state.messengerEditingId, { name: name.trim(), phone: phone.trim(), origin: resolvedOrigin, zones });
      } else {
        await LF.db.createMessenger({ name: name.trim(), phone: phone.trim(), origin: resolvedOrigin, zones });
      }
      await reloadMessengers();
      state.messengerEditingId = null;
      state.messengerZonesDraft = [];
      state.messengerDraft = { name: '', phone: '', origin: '' };
      render();
    }, isEdit ? 'Mensajero actualizado.' : 'Mensajero guardado.');
  }

  function deleteMessenger(id) {
    const m = state.messengers.find((x) => x.id === id);
    // A package's mensajero is computed live from the client's province, not
    // stored on the package — so deleting a messenger with an active route
    // today doesn't fail or cascade anything, it just makes those packages
    // silently stop matching any mensajero card in Lista del día (they stay
    // routed, just invisible until someone thinks to look for them). Worth
    // a specific number here instead of the generic zone warning alone.
    const activeCount = m
      ? activeRoutePackages().filter((p) => { const c = clientById(p.clientId); return c && effectiveMessenger(p, c)?.id === m.id; }).length
      : 0;
    const activeWarning = activeCount > 0
      ? ` Tiene ${activeCount} paquete${activeCount === 1 ? '' : 's'} en ruta activa hoy — seguirán marcados "en ruta", pero dejarán de aparecer en ninguna tarjeta de Lista del día hasta que les asignes otro mensajero a esa zona.`
      : '';
    askConfirm('Eliminar mensajero', `¿Eliminar este mensajero? Las zonas que cubre quedarán sin mensajero asignado.${activeWarning}`, () => doDeleteMessenger(id));
  }

  async function doDeleteMessenger(id) {
    await withBusy(async () => {
      await LF.db.deleteMessenger(id);
      await reloadMessengers();
      render();
    }, 'Mensajero eliminado.');
  }

  // ── event delegation ─────────────────────────────────────────────────────
  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    e.preventDefault();

    switch (action) {
      case 'login': return void doLogin();
      case 'retry-boot': {
        state.fatalError = null;
        // A CDN/config failure is detected at page-load time, so retrying
        // in-place can't fix it — only a real reload can re-fetch the script.
        if (LF.setupError) { window.location.reload(); return; }
        void boot();
        return;
      }
      case 'logout': return void doLogout();
      case 'set-tab': return setTab(el.dataset.tab);
      case 'toggle-mobile-nav':
        state.mobileNavOpen = !state.mobileNavOpen;
        render();
        return;
      case 'close-mobile-nav':
        state.mobileNavOpen = false;
        render();
        return;
      case 'dismiss-toast':
        clearTimeout(toastTimer);
        state.toast = null;
        renderToast();
        return;

      case 'edit-client': {
        const c = clientById(el.dataset.id);
        if (!c) return;
        state.clientEditingId = c.id;
        state.clientDraft = { name: c.name, phone: c.phone, phone2: c.phone2 || '', address: c.address, addressDetails: c.addressDetails || '', province: c.province || '', canton: c.canton || '' };
        render();
        scrollToForm('client-form-card');
        return;
      }
      case 'cancel-edit-client':
        state.clientEditingId = null;
        state.clientDraft = { name: '', phone: '', phone2: '', address: '', addressDetails: '', province: '', canton: '' };
        render(); return;
      case 'save-client': return void saveClient();
      case 'delete-client': return void deleteClient(el.dataset.id);
      case 'clients-page': {
        state.clientsPage = el.dataset.dir === 'next' ? state.clientsPage + 1 : Math.max(1, state.clientsPage - 1);
        renderClientList(); return;
      }

      case 'select-pkg-client':
        state.pkgSelectedClientId = el.dataset.id; render(); return;
      case 'change-pkg-client':
        state.pkgSelectedClientId = null; render(); return;
      case 'save-pkg': return void savePkg();
      case 'cancel-pkg-edit':
        state.pkgEditingId = null; state.pkgSelectedClientId = null;
        state.pkgDraft = { tracking: '', weight: '', cubicFeet: '', cost: '', arrived: false, shippingType: 'aereo' };
        render(); return;
      case 'edit-pkg': {
        const p = state.packages.find((x) => x.id === el.dataset.id);
        if (!p) return;
        state.pkgEditingId = p.id; state.pkgSelectedClientId = p.clientId;
        state.pkgDraft = {
          tracking: p.tracking,
          weight: p.weight == null ? '' : String(p.weight),
          cubicFeet: p.cubicFeet == null ? '' : String(p.cubicFeet),
          cost: p.cost == null ? '' : String(p.cost),
          arrived: p.arrived,
          shippingType: p.shippingType || 'aereo',
        };
        render();
        scrollToForm('pkg-form-card');
        highlightMissingPkgFields(p);
        return;
      }
      case 'arrive-pkg': return void markArrived(el.dataset.id);

      case 'upload-invoice': {
        const input = document.getElementById('invoice-file-input');
        if (input) input.click();
        return;
      }
      case 'toggle-invoice-row': {
        const row = state.invoiceReviewRows[Number(el.dataset.idx)];
        if (row) row.selected = !row.selected;
        renderInvoiceReview();
        return;
      }
      case 'cancel-invoice-review': return closeInvoiceReview();
      case 'confirm-invoice-review': return void commitInvoiceReview();

      case 'pkg-list-page': {
        state.pkgListPage = el.dataset.dir === 'next' ? state.pkgListPage + 1 : Math.max(1, state.pkgListPage - 1);
        renderPkgList(); return;
      }
      case 'pkg-list-clear':
        state.pkgListFilters = { query: '', estado: '', invoiceNumber: '' };
        state.pkgListPage = 1;
        render();
        return;

      case 'assign-route': return void assignRoute(el.dataset.id);
      case 'assign-all-ready': {
        let ids = [];
        try { ids = JSON.parse(el.dataset.ids || '[]'); } catch (err) { ids = []; }
        assignAllReady(ids);
        return;
      }
      case 'unassign-route': return void unassignRoute(el.dataset.id);
      case 'optimize-route': return void optimizeRoute(el.dataset.id);
      case 'deliver-pkg': return void deliverPkg(el.dataset.id, el.dataset.paid === '1');
      case 'mark-paid': return void markPaid(el.dataset.id);

      case 'clear-history-filters':
        state.historyFilters = { client: '', tracking: '', messengerId: '', dateFrom: '', dateTo: '', minAmount: '' };
        state.historyPage = 1;
        render();
        return;
      case 'history-page': {
        state.historyPage = el.dataset.dir === 'next' ? state.historyPage + 1 : Math.max(1, state.historyPage - 1);
        renderHistoryList(); return;
      }
      case 'export-history-csv': return void exportHistoryCSV();

      case 'send-invoice': {
        const href = el.dataset.href;
        if (href) window.open(href, '_blank');
        return;
      }
      case 'send-all-invoices': {
        // A browser only trusts a pop-up as "real" when window.open() fires
        // synchronously inside the click that triggered it — it has no way
        // to open several new tabs from one click without asking first, and
        // there's no real API-based send available without a whole separate
        // WhatsApp Business API setup (Meta business account, dedicated
        // number, approved templates). So: open the first invoice right now
        // (that one's a trusted gesture), then queue the rest behind an
        // explicit "Enviar siguiente" button — every click on that is its
        // own trusted gesture too, so none of them get blocked.
        let hrefs = [];
        try { hrefs = JSON.parse(el.dataset.hrefs || '[]'); } catch (err) { hrefs = []; }
        if (!hrefs.length) return;
        window.open(hrefs[0], '_blank');
        if (hrefs.length > 1) {
          state.invoiceQueue = { messengerId: el.dataset.messengerId, hrefs, index: 1 };
        }
        render();
        return;
      }
      case 'send-invoice-next': {
        const q = state.invoiceQueue;
        if (!q || q.index >= q.hrefs.length) return;
        window.open(q.hrefs[q.index], '_blank');
        q.index += 1;
        render();
        return;
      }
      case 'cancel-invoice-queue':
        state.invoiceQueue = null;
        render();
        return;

      case 'edit-messenger': {
        const m = state.messengers.find((x) => x.id === el.dataset.id);
        if (!m) return;
        state.messengerError = '';
        state.messengerEditingId = m.id; state.messengerZonesDraft = [...m.zones];
        state.messengerDraft = { name: m.name, phone: m.phone, origin: m.origin || '' };
        render();
        scrollToForm('messenger-form-card');
        return;
      }
      case 'cancel-edit-messenger':
        state.messengerEditingId = null; state.messengerZonesDraft = [];
        state.messengerDraft = { name: '', phone: '', origin: '' };
        state.messengerError = '';
        render(); return;
      case 'save-messenger': return void saveMessenger();
      case 'delete-messenger': return void deleteMessenger(el.dataset.id);
      case 'toggle-zone': {
        state.messengerError = '';
        const zone = el.dataset.zone;
        const i = state.messengerZonesDraft.indexOf(zone);
        if (i === -1) state.messengerZonesDraft.push(zone); else state.messengerZonesDraft.splice(i, 1);
        render(); return;
      }

      case 'cancel-confirm': return closeConfirm();
      case 'accept-confirm': return void acceptConfirm();
    }
  });

  document.body.addEventListener('input', (e) => {
    if (e.target.classList && e.target.classList.contains('field-missing') && e.target.value.trim()) {
      e.target.classList.remove('field-missing');
    }
    const id = e.target.id;
    if (id === 'pkg-tracking') { state.pkgDraft.tracking = e.target.value; return updatePkgSubmitState(); }
    if (id === 'pkg-weight') {
      const w = e.target.value;
      state.pkgDraft.weight = w;
      const costEl = document.getElementById('pkg-cost');
      const newCost = w ? (parseFloat(w) * state.settings.ratePerLb).toFixed(2) : '';
      if (costEl) costEl.value = newCost;
      state.pkgDraft.cost = newCost;
      updatePkgCostCRC();
      updatePkgSubmitState();
      return;
    }
    if (id === 'pkg-cubic-feet') {
      const cf = e.target.value;
      state.pkgDraft.cubicFeet = cf;
      const costEl = document.getElementById('pkg-cost');
      const newCost = cf ? (parseFloat(cf) * state.settings.pricePerCubicFt).toFixed(2) : '';
      if (costEl) costEl.value = newCost;
      state.pkgDraft.cost = newCost;
      updatePkgCostCRC();
      updatePkgSubmitState();
      return;
    }
    if (id === 'pkg-cost') { state.pkgDraft.cost = e.target.value; updatePkgCostCRC(); return; }
    if (id === 'pkg-client-search') {
      const box = document.getElementById('pkg-matches');
      if (box) box.innerHTML = pkgMatchesHtml(e.target.value);
      return;
    }
    if (id === 'pkg-list-search') {
      state.pkgListFilters.query = e.target.value;
      state.pkgListPage = 1;
      renderPkgList();
      return;
    }
    if (id === 'pkg-list-invoice') {
      state.pkgListFilters.invoiceNumber = e.target.value;
      state.pkgListPage = 1;
      renderPkgList();
      return;
    }
    if (id === 'client-search') {
      state.clientsPage = 1;
      renderClientList();
      return;
    }
    if (id === 'client-name') { state.clientDraft.name = e.target.value; return; }
    if (id === 'client-phone') { state.clientDraft.phone = e.target.value; return; }
    if (id === 'client-phone2') { state.clientDraft.phone2 = e.target.value; return; }
    if (id === 'client-address') { state.clientDraft.address = e.target.value; return; }
    if (id === 'client-address-details') { state.clientDraft.addressDetails = e.target.value; return; }
    if (id === 'client-canton') { state.clientDraft.canton = e.target.value; return; }
    if (id === 'messenger-name') { state.messengerDraft.name = e.target.value; return; }
    if (id === 'messenger-phone') { state.messengerDraft.phone = e.target.value; return; }
    if (id === 'messenger-origin') { state.messengerDraft.origin = e.target.value; return; }
    if (id === 'history-client') {
      state.historyFilters.client = e.target.value;
      state.historyPage = 1;
      renderHistoryList();
      return;
    }
    if (id === 'history-tracking') {
      state.historyFilters.tracking = e.target.value;
      state.historyPage = 1;
      renderHistoryList();
      return;
    }
    if (id === 'history-min-amount') {
      state.historyFilters.minAmount = e.target.value;
      state.historyPage = 1;
      renderHistoryList();
      return;
    }
  });

  document.body.addEventListener('change', (e) => {
    if (e.target.dataset.action === 'change-pkg-messenger') {
      void changePkgMessenger(e.target.dataset.id, e.target.value || null);
      return;
    }
    if (e.target.name === 'pkg-estado') {
      state.pkgDraft.arrived = e.target.value === 'bodega';
      render();
      return;
    }
    if (e.target.name === 'pkg-tipo-envio') {
      // Recompute cost from whichever measure now applies (weight vs cubic
      // feet) instead of leaving a stale value calculated under the other
      // type's rate — the field itself also swaps on render().
      state.pkgDraft.shippingType = e.target.value;
      const measure = e.target.value === 'maritimo' ? state.pkgDraft.cubicFeet : state.pkgDraft.weight;
      const rate = e.target.value === 'maritimo' ? state.settings.pricePerCubicFt : state.settings.ratePerLb;
      state.pkgDraft.cost = measure ? (parseFloat(measure) * rate).toFixed(2) : '';
      render();
      return;
    }
    if (e.target.id === 'client-province') {
      // Changing province invalidates whatever canton was picked for the old
      // one, so clear it — a full render() also refreshes the canton
      // <select>'s options to match the newly chosen province.
      state.clientDraft.province = e.target.value;
      state.clientDraft.canton = '';
      render();
      return;
    }
    if (e.target.id === 'settings-rate-per-lb' || e.target.id === 'settings-crc-rate' || e.target.id === 'settings-price-per-cubic-ft') {
      const ratePerLb = parseFloat(document.getElementById('settings-rate-per-lb').value) || 0;
      const crcRate = parseFloat(document.getElementById('settings-crc-rate').value) || 0;
      const pricePerCubicFt = parseFloat(document.getElementById('settings-price-per-cubic-ft').value) || 0;
      void saveSettings(ratePerLb, crcRate, pricePerCubicFt);
      return;
    }
    if (e.target.id === 'history-messenger') {
      state.historyFilters.messengerId = e.target.value;
      state.historyPage = 1;
      renderHistoryList();
      return;
    }
    if (e.target.id === 'history-date-from') {
      state.historyFilters.dateFrom = e.target.value;
      state.historyPage = 1;
      renderHistoryList();
      return;
    }
    if (e.target.id === 'history-date-to') {
      state.historyFilters.dateTo = e.target.value;
      state.historyPage = 1;
      renderHistoryList();
      return;
    }
    if (e.target.id === 'pkg-list-estado') {
      state.pkgListFilters.estado = e.target.value;
      state.pkgListPage = 1;
      renderPkgList();
      return;
    }
    if (e.target.id === 'invoice-file-input') {
      const file = e.target.files[0];
      e.target.value = ''; // allow re-selecting the same file after cancelling
      if (file) void handleInvoiceFile(file);
      return;
    }
  });

  function setLoginBusy(busy) {
    const btn = document.querySelector('[data-action="login"]');
    if (!btn) return;
    btn.disabled = busy;
    btn.textContent = busy ? 'Ingresando…' : 'Ingresar';
  }

  async function doLogin() {
    if (state.loggingIn) return;
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    showLoginError('');
    if (!email || !password) { showLoginError('Escribe tu correo y tu contraseña.'); return; }

    state.loggingIn = true;
    setLoginBusy(true);
    let session;
    try {
      // signIn() returns {error} for rejected credentials, but still *throws*
      // on network failures — unhandled, that left the button doing nothing
      // at all. And every failure used to read "Usuario o contraseña
      // incorrectos", pointing at the wrong problem when the real one was
      // no internet or an unconfirmed account.
      const res = await LF.auth.signIn(email, password);
      if (res.error) { showLoginError(describeAuthError(res.error)); return; }
      session = res.session;
    } catch (err) {
      console.error(err);
      showLoginError(describeError(err));
      return;
    } finally {
      state.loggingIn = false;
      setLoginBusy(false);
    }

    state.session = session;
    state.loading = true;
    render();
    try {
      await reloadAll();
      state.loading = false;
      render();
    } catch (err) {
      console.error(err);
      state.loading = false;
      state.fatalError = describeError(err);
      render();
    }
  }

  async function doLogout() {
    await LF.auth.signOut();
    state.session = null;
    render();
  }

  // ── boot ─────────────────────────────────────────────────────────────────
  let authSubscribed = false;

  function subscribeAuth() {
    // Guarded because boot() can run again via "Reintentar", and a second
    // subscription would double every auth callback.
    if (authSubscribed) return;
    authSubscribed = true;
    LF.auth.onAuthStateChange(async (session) => {
      const hadSession = !!state.session;
      state.session = session;
      if (session && !hadSession) {
        state.loading = true; render();
        try {
          await reloadAll();
        } catch (err) {
          console.error(err);
          state.fatalError = describeError(err);
        }
        state.loading = false;
      }
      render();
    });
  }

  async function boot() {
    // Config/CDN problems are detected before app.js runs; surface them as-is.
    if (LF.setupError) {
      state.loading = false;
      state.fatalError = LF.setupError;
      render();
      return;
    }
    state.fatalError = null;
    state.loading = true;
    render();
    try {
      const session = await LF.auth.getSession();
      state.session = session;
      if (session) await reloadAll();
      state.loading = false;
      render();
    } catch (err) {
      // Without this the app used to sit on "Cargando…" forever on any
      // startup failure — bad credentials in config.js, Supabase down, no
      // internet — with nothing on screen to explain it or retry.
      console.error(err);
      state.loading = false;
      state.fatalError = describeError(err);
      render();
      return;
    }
    subscribeAuth();
  }

  boot();
})();
