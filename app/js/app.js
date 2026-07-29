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
  const PAGE_SIZE = 10;
  const WAITING_PAGE_SIZE = 8;

  const state = {
    tab: 'inicio',
    clients: [],
    messengers: [],
    packages: [],
    settings: { ratePerLb: DEFAULT_RATE_PER_LB, crcRate: DEFAULT_CRC_RATE },
    clientsPage: 1,
    clientEditingId: null,
    clientDraft: { name: '', phone: '', address: '', addressDetails: '', province: '', canton: '' },
    messengerEditingId: null,
    messengerZonesDraft: [],
    messengerDraft: { name: '', phone: '', origin: '' },
    pkgEditingId: null,
    pkgSelectedClientId: null,
    pkgDraft: { tracking: '', weight: '', cost: '' },
    waitingPage: 1,
    session: null,
    loading: true,
    busy: false,
    confirmOpen: false,
    confirmTitle: '',
    confirmMessage: '',
    confirmActionLabel: 'Eliminar',
    confirmAction: null,
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

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function todayLabel() {
    const raw = new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function messengerForZone(province) {
    if (!province) return null;
    return state.messengers.find((m) => Array.isArray(m.zones) && m.zones.includes(province)) || null;
  }

  function clientZoneLabel(c) {
    return [c.province, c.canton].filter(Boolean).join(' — ') || 'Sin zona';
  }

  // Costa Rica bounding box, used to reject false-positive number pairs
  // (zoom levels, place IDs, etc.) picked up while scanning a URL for coords.
  function extractLatLng(url) {
    if (!url) return null;
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

  function scrollToForm(id) {
    setTimeout(() => {
      const node = document.getElementById(id);
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  }

  function waPhone(phone) { return '506' + String(phone).replace(/\D/g, ''); }

  function clientById(id) { return state.clients.find((c) => c.id === id) || null; }

  function fmtMoney(n) { return Number(n || 0).toFixed(2); }

  function fmtCRC(n) { return Math.round(Number(n) || 0).toLocaleString('es-CR'); }

  async function withBusy(fn) {
    if (state.busy) return;
    state.busy = true;
    try {
      await fn();
    } catch (err) {
      console.error(err);
      window.alert(err && err.message ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      state.busy = false;
    }
  }

  async function reloadClients() { state.clients = await LF.db.listClients(); }
  async function reloadMessengers() { state.messengers = await LF.db.listMessengers(); }
  async function reloadPackages() { state.packages = await LF.db.listPackages(); }
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
    box: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>',
    checklist: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><rect x="8" y="2" width="8" height="4" rx="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
    whatsapp: '<svg width="18" height="18" viewBox="0 0 32 32" fill="#ffffff" style="flex:none;display:block"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.446.713 4.716 1.938 6.63L4 29l7.57-1.912A11.9 11.9 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.7c-1.98 0-3.83-.55-5.41-1.5l-.386-.23-4.24 1.07 1.12-4.13-.25-.4A9.66 9.66 0 0 1 5.3 15c0-5.9 4.8-10.7 10.7-10.7S26.7 9.1 26.7 15 21.9 24.7 16 24.7zm5.94-7.98c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.72.16-.21.32-.82 1.05-1 1.26-.19.21-.37.24-.69.08-1.86-.93-3.08-1.66-4.31-3.76-.33-.56.33-.52.94-1.73.1-.21.05-.4-.05-.56-.1-.16-.72-1.73-.98-2.37-.26-.62-.53-.53-.72-.54-.19-.01-.4-.01-.61-.01-.21 0-.55.08-.85.4-.29.32-1.13 1.11-1.13 2.7 0 1.6 1.16 3.14 1.32 3.36.16.21 2.24 3.42 5.44 4.66 2.7 1.05 3.24.85 3.83.8.58-.06 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.29-.21-.61-.37z"></path></svg>',
    whatsappMono: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" style="flex:none;display:block"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.446.713 4.716 1.938 6.63L4 29l7.57-1.912A11.9 11.9 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.7c-1.98 0-3.83-.55-5.41-1.5l-.386-.23-4.24 1.07 1.12-4.13-.25-.4A9.66 9.66 0 0 1 5.3 15c0-5.9 4.8-10.7 10.7-10.7S26.7 9.1 26.7 15 21.9 24.7 16 24.7zm5.94-7.98c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.72.16-.21.32-.82 1.05-1 1.26-.19.21-.37.24-.69.08-1.86-.93-3.08-1.66-4.31-3.76-.33-.56.33-.52.94-1.73.1-.21.05-.4-.05-.56-.1-.16-.72-1.73-.98-2.37-.26-.62-.53-.53-.72-.54-.19-.01-.4-.01-.61-.01-.21 0-.55.08-.85.4-.29.32-1.13 1.11-1.13 2.7 0 1.6 1.16 3.14 1.32 3.36.16.21 2.24 3.42 5.44 4.66 2.7 1.05 3.24.85 3.83.8.58-.06 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.29-.21-.61-.37z"></path></svg>',
    invoice: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>',
  };

  // ── DOM roots ────────────────────────────────────────────────────────────
  const loginRoot = document.getElementById('login-root');
  const shellRoot = document.getElementById('shell-root');
  const navRoot = document.getElementById('nav-root');
  const mainRoot = document.getElementById('main-root');
  const confirmRoot = document.getElementById('confirm-root');

  function render() {
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
    // renderMain() leaves #waiting-list as an empty container on the
    // "paquete" tab — its rows are filled in separately so search/pagination
    // there can update without re-rendering the form above it. Any other
    // action that calls render() while on this tab must refill it too, or
    // the list silently disappears until something else refills it.
    if (state.tab === 'paquete') renderWaitingList();
    if (state.tab === 'clientes') renderClientList();
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
    ['inicio', 'Inicio'], ['clientes', 'Clientes'], ['paquete', 'Registrar paquete'],
    ['lista', 'Lista del día'], ['mensajeros', 'Mensajeros'], ['config', 'Configuración'],
  ];
  function renderNav() {
    const links = TABS.map(([id, label]) =>
      `<a href="#" class="navlink" data-action="set-tab" data-tab="${id}" ${state.tab === id ? "aria-current='page'" : ''}>${esc(label)}</a>`
    ).join('\n');
    return `
      <div class="nav" style="background:var(--color-surface);padding:16px 24px;flex-wrap:wrap;row-gap:10px">
        <div class="nav-brand" style="display:flex;align-items:center;gap:10px;font-size:24px">
          <img src="assets/logo-logistica-flash.png" alt="Logística Flash" style="height:36px;width:36px;object-fit:contain">
          Logística Flash
        </div>
        ${links}
        <a href="#" class="navlink" data-action="logout">Salir</a>
      </div>`;
  }

  function renderMain() {
    switch (state.tab) {
      case 'clientes': return renderClientes();
      case 'paquete': return renderPaquete();
      case 'lista': return renderLista();
      case 'mensajeros': return renderMensajeros();
      case 'config': return renderConfig();
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
            <label>Peso por libra ($/lb)</label>
            <input class="input" id="settings-rate-per-lb" type="number" step="0.01" min="0" value="${esc(s.ratePerLb)}">
            <p class="text-muted" style="margin-top:4px;font-size:13px">Se usa para calcular el costo estimado al registrar un paquete.</p>
          </div>
          <div class="field">
            <label>Tipo de cambio (₡ por $)</label>
            <input class="input" id="settings-crc-rate" type="number" step="1" min="0" value="${esc(s.crcRate)}">
            <p class="text-muted" style="margin-top:4px;font-size:13px">Se usa para mostrar los costos en colones en las listas y facturas.</p>
          </div>
        </div>
      </div>`;
  }

  // ── INICIO ───────────────────────────────────────────────────────────────
  function renderInicio() {
    const today = todayISO();
    const assignedToday = state.packages.filter((p) => p.assignedDate === today).length;
    const pending = state.packages.filter((p) => !p.clientId).length;
    const esperandoLlegada = state.packages.filter((p) => p.clientId && !p.arrived).length;

    const parts = [];
    if (pending > 0) parts.push(`${pending} sin identificar`);
    if (esperandoLlegada > 0) parts.push(`${esperandoLlegada} esperando llegada`);
    const hasPending = parts.length > 0;
    const cardStyle = hasPending ? 'border:1px solid var(--color-accent-300);background:var(--color-accent-100);gap:var(--space-3)' : '';
    const message = hasPending
      ? `Tienes paquetes por revisar: ${parts.join(', ')}.`
      : 'Todos los paquetes están identificados y asignados. Buen trabajo.';

    return `
      <div>
        <h6 class="text-muted" style="margin-bottom:2px">${esc(todayLabel())}</h6>
        <h1 style="margin-bottom:var(--space-6)">Buenos días</h1>

        <div class="stat-grid">
          <div class="card elev-sm">
            <div class="card-kicker">Hoy</div>
            <div class="card-title" style="font-size:34px">${assignedToday}</div>
            <p class="card-body">paquetes asignados</p>
          </div>
          <div class="card elev-sm">
            <div class="card-kicker">Sin identificar</div>
            <div class="card-title" style="font-size:34px">${pending}</div>
            <p class="card-body">paquetes sin cliente</p>
          </div>
          <div class="card elev-sm">
            <div class="card-kicker">En bodega</div>
            <div class="card-title" style="font-size:34px">${esperandoLlegada}</div>
            <p class="card-body">esperando llegada</p>
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
            ${ICONS.person}<span>Agregar cliente</span><span style="margin-left:auto">→</span>
          </button>
          <button class="btn btn-secondary btn-block" data-action="set-tab" data-tab="paquete" type="button" style="gap:10px">
            ${ICONS.box}<span>Registrar paquete</span><span style="margin-left:auto">→</span>
          </button>
          <button class="btn btn-secondary btn-block" data-action="set-tab" data-tab="lista" type="button" style="gap:10px">
            ${ICONS.checklist}<span>Lista del día por mensajero</span><span style="margin-left:auto">→</span>
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
            <label>Nombre completo *</label>
            <input class="input" id="client-name" type="text" value="${esc(f.name)}" placeholder="Ej: María Fernández Solís">
          </div>
          <div class="field">
            <label>Teléfono *</label>
            <input class="input" id="client-phone" type="tel" value="${esc(f.phone)}" placeholder="Ej: 8888-1234">
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
          <label>Buscar por nombre, zona o teléfono</label>
          <input class="input" id="client-search" type="text" placeholder="Ej: María, Heredia, 8888...">
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
          normalize(c.phone).includes(q) ||
          normalize(c.province).includes(q) ||
          normalize(c.canton).includes(q))
      : state.clients;
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'es'));

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, state.clientsPage), totalPages);
    const pageClients = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const rows = pageClients.map((c) => {
      const incomplete = !c.address || !c.province;
      return `
        <tr>
          <td>${esc(c.name)}${incomplete ? '<span class="tag tag-warn" style="margin-left:6px">Falta info</span>' : ''}</td>
          <td><span class="tag tag-neutral">${esc(c.province || 'Sin provincia')}</span></td>
          <td>${esc(c.canton || '—')}</td>
          <td>${esc(c.phone)}</td>
          <td>${c.address
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
          <thead><tr><th>Nombre</th><th>Provincia</th><th>Cantón</th><th>Teléfono</th><th>Dirección</th><th></th></tr></thead>
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
    const matches = state.clients.filter((c) => normalize(c.name).includes(q)).slice(0, 6);
    if (matches.length === 0) return `<p class="text-muted">Sin coincidencias. Revisa el nombre o agrégalo en "Clientes".</p>`;
    const items = matches.map((c) => {
      const mm = messengerForZone(c.province);
      return `
        <button type="button" data-action="select-pkg-client" data-id="${c.id}" class="btn btn-secondary" style="justify-content:space-between;text-align:left;height:auto;padding:var(--space-2)">
          <span>${esc(c.name)}</span>
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
    const weight = (document.getElementById('pkg-weight') || {}).value || '';
    btn.disabled = !(tracking.trim() && weight && state.pkgSelectedClientId);
  }

  function updatePkgCostCRC() {
    const el = document.getElementById('pkg-cost-crc');
    if (!el) return;
    const cost = state.pkgDraft.cost;
    el.textContent = cost ? '≈ ₡' + fmtCRC(parseFloat(cost) * state.settings.crcRate) : '';
  }

  function renderPaquete() {
    const editing = state.pkgEditingId ? state.packages.find((p) => p.id === state.pkgEditingId) : null;
    const draft = state.pkgDraft;

    const selectedClient = state.pkgSelectedClientId ? clientById(state.pkgSelectedClientId) : null;
    const selectedMessenger = selectedClient ? messengerForZone(selectedClient.province) : null;

    const waitingAll = state.packages.filter((p) => p.clientId && !p.arrived)
      .map((p) => ({ p, c: clientById(p.clientId) }))
      .sort((a, b) => (a.c ? a.c.name : '').localeCompare(b.c ? b.c.name : '', 'es'));

    return `
      <div>
        <h1 style="margin-bottom:2px">Registrar paquete</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Crea el paquete e identifícalo con su cliente de una vez. Cuando esté físicamente aquí, márcalo como llegado — solo entonces entra a la ruta del mensajero.</p>

        <div class="card elev-sm" id="pkg-form-card" style="max-width:520px;margin-bottom:var(--space-8)">
          <div class="card-kicker">${editing ? 'Editar paquete' : 'Nuevo paquete'}</div>
          <div class="card-title" style="margin-bottom:var(--space-2)">Datos del paquete y cliente</div>
          <div class="field">
            <label>ID de tracking</label>
            <input class="input" id="pkg-tracking" type="text" value="${esc(draft.tracking)}" placeholder="Ej: TBA912345678">
          </div>
          <div class="field">
            <label>Peso (libras)</label>
            <input class="input" id="pkg-weight" type="number" step="0.1" min="0" value="${esc(draft.weight)}" placeholder="Ej: 3.5">
          </div>
          <div class="field">
            <label>Costo estimado ($${state.settings.ratePerLb}/lb) — editable</label>
            <input class="input" id="pkg-cost" type="number" step="0.01" min="0" value="${esc(draft.cost)}" placeholder="0.00">
            <p class="text-muted" id="pkg-cost-crc" style="margin-top:4px;font-size:13px">${draft.cost ? '≈ ₡' + fmtCRC(parseFloat(draft.cost) * state.settings.crcRate) : ''}</p>
          </div>

          ${!selectedClient ? `
            <div class="field">
              <label>Cliente — buscar por nombre</label>
              <input class="input" id="pkg-client-search" type="text" placeholder="Escribe el nombre del cliente...">
            </div>
            <div id="pkg-matches"></div>
          ` : `
            <div style="border:1px solid var(--color-divider);padding:var(--space-3);margin-bottom:var(--space-3)">
              <div style="font-family:var(--font-heading);font-weight:800;font-size:17px;margin-bottom:6px">${esc(selectedClient.name)}</div>
              <p class="card-body" style="margin-bottom:4px">Teléfono: ${esc(selectedClient.phone)}</p>
              <p class="card-body" style="margin-bottom:6px">Dirección: ${selectedClient.address ? `<a href="${esc(selectedClient.address)}" target="_blank" rel="noopener">Ver ubicación</a>` : '<span class="text-muted">Sin dirección</span>'}</p>
              <div style="display:flex;gap:6px">
                <span class="tag tag-neutral">${esc(clientZoneLabel(selectedClient))}</span>
                <span class="tag tag-accent">Mensajero: ${esc(selectedMessenger ? selectedMessenger.name : 'Sin mensajero')}</span>
              </div>
            </div>
            <button class="btn btn-ghost" type="button" data-action="change-pkg-client" style="margin-bottom:var(--space-2)">Cambiar cliente</button>
          `}

          <div style="display:flex;gap:var(--space-2)">
            <button class="btn btn-primary" type="button" id="pkg-submit" data-action="save-pkg" ${!(draft.tracking.trim() && draft.weight && state.pkgSelectedClientId) ? 'disabled' : ''}>${editing ? 'Guardar cambios' : 'Crear paquete'}</button>
            ${editing ? `<button class="btn btn-secondary" type="button" data-action="cancel-pkg-edit">Cancelar</button>` : ''}
          </div>
        </div>

        <hr class="hr">
        <h4 style="margin:var(--space-4) 0 var(--space-3)">Identificados — en tránsito (${waitingAll.length})</h4>
        <div class="field" style="max-width:320px">
          <label>Buscar por nombre o tracking</label>
          <input class="input" id="waiting-search" type="text" placeholder="Ej: María o TBA912...">
        </div>
        <div id="waiting-list"></div>
      </div>`;
  }

  function renderWaitingList() {
    const container = document.getElementById('waiting-list');
    if (!container) return;
    const searchEl = document.getElementById('waiting-search');
    const wq = normalize(searchEl ? searchEl.value : '').trim();

    const waitingAll = state.packages.filter((p) => p.clientId && !p.arrived)
      .map((p) => ({ p, c: clientById(p.clientId) }))
      .sort((a, b) => (a.c ? a.c.name : '').localeCompare(b.c ? b.c.name : '', 'es'));

    const filtered = wq
      ? waitingAll.filter(({ p, c }) => (c && normalize(c.name).includes(wq)) || normalize(p.tracking).includes(wq))
      : waitingAll;

    const totalPages = Math.max(1, Math.ceil(filtered.length / WAITING_PAGE_SIZE));
    const page = Math.min(Math.max(1, state.waitingPage), totalPages);
    const pageItems = filtered.slice((page - 1) * WAITING_PAGE_SIZE, page * WAITING_PAGE_SIZE);

    const rows = pageItems.map(({ p, c }) => {
      const mm = c ? messengerForZone(c.province) : null;
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--color-divider);flex-wrap:wrap;gap:8px">
          <div>
            <strong style="font-family:var(--font-heading)">${esc(c ? c.name : 'Cliente eliminado')}</strong>
            <span class="text-muted" style="margin-left:8px">${esc(p.tracking)} · ${p.weight} lb · $${fmtMoney(p.cost)} · ₡${fmtCRC(p.cost * state.settings.crcRate)}</span>
            <span class="tag tag-neutral" style="margin-left:8px">${esc(mm ? mm.name : 'Sin mensajero')}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-icon btn-ghost" type="button" data-action="edit-pkg" data-id="${p.id}" aria-label="Editar" title="Editar">${ICONS.edit}</button>
            <button class="btn btn-primary" type="button" data-action="arrive-pkg" data-id="${p.id}">Marcar como llegado → asignar a mensajero</button>
          </div>
        </div>`;
    }).join('\n');

    container.innerHTML = `
      ${rows}
      ${filtered.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-2)">No hay paquetes esperando llegada.</p>` : ''}
      ${totalPages > 1 ? `
        <div class="pagination-row">
          <button class="btn btn-secondary" type="button" data-action="waiting-page" data-dir="prev" ${page <= 1 ? 'disabled' : ''}>← Anterior</button>
          <span class="text-muted">Página ${page} de ${totalPages}</span>
          <button class="btn btn-secondary" type="button" data-action="waiting-page" data-dir="next" ${page >= totalPages ? 'disabled' : ''}>Siguiente →</button>
        </div>` : ''}`;
  }

  // ── LISTA DEL DIA ────────────────────────────────────────────────────────
  function renderLista() {
    const today = todayISO();
    const cards = state.messengers.map((m) => {
      const entries = state.packages
        .filter((p) => p.assignedDate === today)
        .map((p) => ({ p, c: clientById(p.clientId) }))
        .filter(({ c }) => c && c.province && m.zones.includes(c.province));

      const totalCost = entries.reduce((sum, { p }) => sum + (Number(p.cost) || 0), 0);
      const totalCostCRC = totalCost * state.settings.crcRate;
      const zoneLabel = m.zones.join(', ') || 'Sin zona asignada';

      // Group by client so a client with several packages today gets one
      // stop listing all their tracking IDs, instead of repeating their
      // name/address/phone once per package.
      const stopsByClient = new Map();
      const stops = [];
      entries.forEach(({ p, c }) => {
        let stop = stopsByClient.get(c.id);
        if (!stop) { stop = { c, packages: [] }; stopsByClient.set(c.id, stop); stops.push(stop); }
        stop.packages.push(p);
      });

      // Order stops by straight-line distance from the messenger's starting
      // point (extracted from their "punto de salida" link) — a coarse
      // route approximation, not real street routing. If the origin link
      // has no readable coordinates, stops stay in their original order.
      const originCoord = extractLatLng(m.origin);
      const orderedStops = orderStopsByRoute(stops, originCoord);

      const lines = orderedStops.map((stop, i) => {
        const trackings = stop.packages.map((p) => p.tracking);
        const detailLine = stop.c.addressDetails ? `\nDetalle: ${stop.c.addressDetails}` : '';
        return `${i + 1}. ${stop.c.name}\nDireccion: ${stop.c.address}${detailLine}\nTelefono: ${stop.c.phone}\nPaquetes: ${trackings.length}\nTracking: ${trackings.join(', ')}`;
      });
      const message = `Ruta de hoy - ${zoneLabel} (${entries.length} paquetes)\n\n` + lines.join('\n\n');
      const waHref = `https://wa.me/${waPhone(m.phone)}?text=${encodeURIComponent(message)}`;

      // One invoice per client (stop), covering every package they have
      // today — not one message per package, so a 3-package client gets a
      // single combined factura instead of 3 separate WhatsApp messages.
      const invoiceMessageForStop = (stop) => {
        const totalWeight = stop.packages.reduce((sum, p) => sum + (Number(p.weight) || 0), 0);
        const totalCost = stop.packages.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);
        const trackings = stop.packages.map((p) => p.tracking).join(', ');
        const costCRC = fmtCRC(totalCost * state.settings.crcRate);
        const pkgWord = stop.packages.length === 1 ? 'tu paquete' : 'tus paquetes';
        return `Hola ${stop.c.name}, aquí el detalle de ${pkgWord}:\n\nPaquetes: ${stop.packages.length}\nTracking: ${trackings}\nPeso total: ${totalWeight} lb\nTotal a pagar: ₡${costCRC} ($${fmtMoney(totalCost)} USD)\n\nGracias por confiar en Logística Flash.`;
      };
      const invoiceHrefForStop = (stop) => `https://wa.me/${waPhone(stop.c.phone)}?text=${encodeURIComponent(invoiceMessageForStop(stop))}`;

      const rows = orderedStops.flatMap((stop) => {
        const hasPhone = !!(stop.c.phone && stop.c.phone.trim());
        const stopInvoiceHref = hasPhone ? invoiceHrefForStop(stop) : '';
        return stop.packages.map((p) => `
        <tr>
          <td>${esc(stop.c.name)}</td>
          <td><a href="${esc(stop.c.address)}" target="_blank" rel="noopener">Ver ubicación</a></td>
          <td>${esc(stop.c.phone)}</td>
          <td>${esc(p.tracking)}</td>
          <td>$${fmtMoney(p.cost)}</td>
          <td>₡${fmtCRC(p.cost * state.settings.crcRate)}</td>
          <td style="text-align:right">
            <div style="display:inline-flex;gap:6px">
              <button class="btn btn-icon btn-ghost" type="button" data-action="send-invoice" data-href="${esc(stopInvoiceHref)}" aria-label="Enviar factura por WhatsApp" title="Enviar factura por WhatsApp" ${hasPhone ? '' : 'disabled'} style="color:#25D366">${ICONS.whatsappMono}</button>
              <button class="btn btn-icon btn-ghost" type="button" data-action="unassign-pkg" data-id="${p.id}" aria-label="Quitar de la ruta de hoy" title="Quitar de la ruta de hoy">${ICONS.trash}</button>
            </div>
          </td>
        </tr>`);
      }).join('\n');

      return `
        <div class="card elev-sm">
          <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <div>
              <div class="card-kicker">${esc(zoneLabel)}</div>
              <div class="card-title">${esc(m.name)}</div>
            </div>
            <span class="tag tag-accent" style="display:inline-flex;gap:5px"><span>${entries.length}</span><span>paquetes hoy</span></span>
          </div>
          <div class="table-scroll">
            <table class="table" style="margin-top:var(--space-2);min-width:640px">
              <thead><tr><th>Cliente</th><th>Dirección</th><th>Teléfono</th><th>Tracking</th><th>Costo ($)</th><th>Costo (₡)</th><th style="text-align:right">Acciones</th></tr></thead>
              <tbody>${rows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align:right;font-family:var(--font-heading);font-weight:800">Total a cobrar en esta ruta</td>
                  <td style="text-align:right;font-family:var(--font-heading);font-weight:800">$${fmtMoney(totalCost)}</td>
                  <td style="text-align:right;font-family:var(--font-heading);font-weight:800">₡${fmtCRC(totalCostCRC)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          ${entries.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-2)">Sin paquetes asignados hoy.</p>` : ''}
          <div style="margin-top:var(--space-3);display:flex;flex-wrap:wrap;gap:10px">
            <a href="${esc(waHref)}" target="_blank" rel="noopener" class="wa-btn" style="width:fit-content;display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#ffffff;font-family:var(--font-heading);font-weight:800;font-size:14px;padding:var(--space-2) calc(var(--space-3) * 1.2);border-radius:var(--radius-md);text-decoration:none">
              ${ICONS.whatsapp}<span>Enviar lista por WhatsApp</span>
            </a>
            <button type="button" data-action="send-all-invoices" data-hrefs="${esc(JSON.stringify(orderedStops.filter((stop) => stop.c.phone && stop.c.phone.trim()).map((stop) => invoiceHrefForStop(stop))))}" ${entries.length === 0 ? 'disabled' : ''} class="wa-btn" style="width:fit-content;display:inline-flex;align-items:center;gap:8px;background:transparent;color:#1f9e56;border:1.5px solid #25D366;font-family:var(--font-heading);font-weight:800;font-size:14px;padding:var(--space-2) calc(var(--space-3) * 1.2);border-radius:var(--radius-md)">
              ${ICONS.invoice}<span>Enviar facturas a clientes</span>
            </button>
          </div>
        </div>`;
    }).join('\n');

    return `
      <div>
        <h1 style="margin-bottom:2px">Lista del día por mensajero</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">${esc(todayLabel())} — envía la ruta completa a cada mensajero en un solo mensaje.</p>
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
      const hasOrigin = !!(m.origin && m.origin.trim());
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
            <p class="text-muted" style="margin-top:4px;font-size:13px">Pega el link para compartir ubicación desde Waze o Google Maps.</p>
          </div>
          <div class="field">
            <label>Provincias que cubre</label>
            <div style="display:flex;flex-wrap:wrap;gap:10px">${chips}</div>
          </div>
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

  // ── actions ──────────────────────────────────────────────────────────────
  function setTab(tab) {
    state.tab = tab;
    if (tab === 'clientes') { state.clientEditingId = null; state.clientDraft = { name: '', phone: '', address: '', addressDetails: '', province: '', canton: '' }; }
    if (tab === 'paquete') { state.pkgEditingId = null; state.pkgSelectedClientId = null; state.pkgDraft = { tracking: '', weight: '', cost: '' }; }
    if (tab === 'mensajeros') { state.messengerEditingId = null; state.messengerZonesDraft = []; state.messengerDraft = { name: '', phone: '', origin: '' }; }
    render();
  }

  async function saveClient() {
    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const address = document.getElementById('client-address').value;
    const addressDetails = document.getElementById('client-address-details').value;
    const province = document.getElementById('client-province').value;
    const canton = document.getElementById('client-canton').value;
    if (!name.trim() || !phone.trim()) return;
    await withBusy(async () => {
      if (state.clientEditingId) {
        await LF.db.updateClient(state.clientEditingId, { name: name.trim(), phone: phone.trim(), address: address.trim(), addressDetails: addressDetails.trim(), province, canton });
      } else {
        await LF.db.createClient({ name: name.trim(), phone: phone.trim(), address: address.trim(), addressDetails: addressDetails.trim(), province, canton });
      }
      await reloadClients();
      state.clientEditingId = null;
      state.clientDraft = { name: '', phone: '', address: '', addressDetails: '', province: '', canton: '' };
      render();
    });
  }

  function deleteClient(id) {
    askConfirm('Eliminar cliente', '¿Eliminar este cliente? Sus paquetes asignados quedarán pendientes.', () => doDeleteClient(id));
  }

  async function doDeleteClient(id) {
    await withBusy(async () => {
      await LF.db.deleteClient(id);
      await Promise.all([reloadClients(), reloadPackages()]);
      render();
    });
  }

  async function savePkg() {
    const tracking = document.getElementById('pkg-tracking').value;
    const weight = document.getElementById('pkg-weight').value;
    const cost = document.getElementById('pkg-cost').value;
    if (!tracking.trim() || !weight || !state.pkgSelectedClientId) return;
    const finalCost = cost ? parseFloat(cost) : parseFloat(weight) * state.settings.ratePerLb;
    await withBusy(async () => {
      if (state.pkgEditingId) {
        await LF.db.updatePackage(state.pkgEditingId, { tracking: tracking.trim(), weight: parseFloat(weight), cost: finalCost, clientId: state.pkgSelectedClientId });
      } else {
        await LF.db.createPackage({ tracking: tracking.trim(), weight: parseFloat(weight), cost: finalCost, clientId: state.pkgSelectedClientId });
      }
      await reloadPackages();
      state.pkgEditingId = null;
      state.pkgSelectedClientId = null;
      state.pkgDraft = { tracking: '', weight: '', cost: '' };
      render();
    });
  }

  function markArrived(id) {
    askConfirm('Confirmar llegada', '¿Confirmas que este paquete ya está aquí y listo para el mensajero?', () => doMarkArrived(id), 'Confirmar');
  }

  async function doMarkArrived(id) {
    await withBusy(async () => {
      await LF.db.markArrived(id, todayISO());
      await reloadPackages();
      render();
    });
  }

  function unassignPkg(id) {
    askConfirm('Quitar paquete', '¿Quitar este paquete de la ruta de hoy? Volverá a pendientes por asignar.', () => doUnassignPkg(id), 'Quitar');
  }

  async function doUnassignPkg(id) {
    await withBusy(async () => {
      await LF.db.unassignPackage(id);
      await reloadPackages();
      render();
    });
  }

  async function saveSettings(ratePerLb, crcRate) {
    await withBusy(async () => {
      state.settings = await LF.db.updateSettings({ ratePerLb, crcRate });
    });
  }

  async function saveMessenger() {
    const name = document.getElementById('messenger-name').value;
    const phone = document.getElementById('messenger-phone').value;
    const origin = document.getElementById('messenger-origin').value;
    const zones = state.messengerZonesDraft;
    if (!name.trim() || !phone.trim() || !origin.trim()) return;
    await withBusy(async () => {
      if (state.messengerEditingId) {
        await LF.db.updateMessenger(state.messengerEditingId, { name: name.trim(), phone: phone.trim(), origin: origin.trim(), zones });
      } else {
        await LF.db.createMessenger({ name: name.trim(), phone: phone.trim(), origin: origin.trim(), zones });
      }
      await reloadMessengers();
      state.messengerEditingId = null;
      state.messengerZonesDraft = [];
      state.messengerDraft = { name: '', phone: '', origin: '' };
      render();
    });
  }

  function deleteMessenger(id) {
    askConfirm('Eliminar mensajero', '¿Eliminar este mensajero? Las zonas que cubre quedarán sin mensajero asignado.', () => doDeleteMessenger(id));
  }

  async function doDeleteMessenger(id) {
    await withBusy(async () => {
      await LF.db.deleteMessenger(id);
      await reloadMessengers();
      render();
    });
  }

  // ── event delegation ─────────────────────────────────────────────────────
  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    e.preventDefault();

    switch (action) {
      case 'login': return void doLogin();
      case 'logout': return void doLogout();
      case 'set-tab': return setTab(el.dataset.tab);

      case 'edit-client': {
        const c = clientById(el.dataset.id);
        if (!c) return;
        state.clientEditingId = c.id;
        state.clientDraft = { name: c.name, phone: c.phone, address: c.address, addressDetails: c.addressDetails || '', province: c.province || '', canton: c.canton || '' };
        render();
        scrollToForm('client-form-card');
        return;
      }
      case 'cancel-edit-client':
        state.clientEditingId = null;
        state.clientDraft = { name: '', phone: '', address: '', addressDetails: '', province: '', canton: '' };
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
        state.pkgDraft = { tracking: '', weight: '', cost: '' };
        render(); return;
      case 'edit-pkg': {
        const p = state.packages.find((x) => x.id === el.dataset.id);
        if (!p) return;
        state.pkgEditingId = p.id; state.pkgSelectedClientId = p.clientId;
        state.pkgDraft = { tracking: p.tracking, weight: String(p.weight), cost: String(p.cost) };
        render();
        scrollToForm('pkg-form-card');
        return;
      }
      case 'arrive-pkg': return void markArrived(el.dataset.id);
      case 'waiting-page': {
        state.waitingPage = el.dataset.dir === 'next' ? state.waitingPage + 1 : Math.max(1, state.waitingPage - 1);
        renderWaitingList(); return;
      }

      case 'unassign-pkg': return void unassignPkg(el.dataset.id);

      case 'send-invoice': {
        const href = el.dataset.href;
        if (href) window.open(href, '_blank');
        return;
      }
      case 'send-all-invoices': {
        let hrefs = [];
        try { hrefs = JSON.parse(el.dataset.hrefs || '[]'); } catch (err) { hrefs = []; }
        hrefs.forEach((href, i) => setTimeout(() => window.open(href, '_blank'), i * 500));
        return;
      }

      case 'edit-messenger': {
        const m = state.messengers.find((x) => x.id === el.dataset.id);
        if (!m) return;
        state.messengerEditingId = m.id; state.messengerZonesDraft = [...m.zones];
        state.messengerDraft = { name: m.name, phone: m.phone, origin: m.origin || '' };
        render();
        scrollToForm('messenger-form-card');
        return;
      }
      case 'cancel-edit-messenger':
        state.messengerEditingId = null; state.messengerZonesDraft = [];
        state.messengerDraft = { name: '', phone: '', origin: '' };
        render(); return;
      case 'save-messenger': return void saveMessenger();
      case 'delete-messenger': return void deleteMessenger(el.dataset.id);
      case 'toggle-zone': {
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
    if (id === 'pkg-cost') { state.pkgDraft.cost = e.target.value; updatePkgCostCRC(); return; }
    if (id === 'pkg-client-search') {
      const box = document.getElementById('pkg-matches');
      if (box) box.innerHTML = pkgMatchesHtml(e.target.value);
      return;
    }
    if (id === 'waiting-search') {
      state.waitingPage = 1;
      renderWaitingList();
      return;
    }
    if (id === 'client-search') {
      state.clientsPage = 1;
      renderClientList();
      return;
    }
    if (id === 'client-name') { state.clientDraft.name = e.target.value; return; }
    if (id === 'client-phone') { state.clientDraft.phone = e.target.value; return; }
    if (id === 'client-address') { state.clientDraft.address = e.target.value; return; }
    if (id === 'client-address-details') { state.clientDraft.addressDetails = e.target.value; return; }
    if (id === 'client-canton') { state.clientDraft.canton = e.target.value; return; }
    if (id === 'messenger-name') { state.messengerDraft.name = e.target.value; return; }
    if (id === 'messenger-phone') { state.messengerDraft.phone = e.target.value; return; }
    if (id === 'messenger-origin') { state.messengerDraft.origin = e.target.value; return; }
  });

  document.body.addEventListener('change', (e) => {
    if (e.target.id === 'client-province') {
      // Changing province invalidates whatever canton was picked for the old
      // one, so clear it — a full render() also refreshes the canton
      // <select>'s options to match the newly chosen province.
      state.clientDraft.province = e.target.value;
      state.clientDraft.canton = '';
      render();
      return;
    }
    if (e.target.id === 'settings-rate-per-lb' || e.target.id === 'settings-crc-rate') {
      const ratePerLb = parseFloat(document.getElementById('settings-rate-per-lb').value) || 0;
      const crcRate = parseFloat(document.getElementById('settings-crc-rate').value) || 0;
      void saveSettings(ratePerLb, crcRate);
    }
  });

  async function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    showLoginError('');
    const { session, error } = await LF.auth.signIn(email, password);
    if (error) { showLoginError('Usuario o contraseña incorrectos.'); return; }
    state.session = session;
    state.loading = true;
    render();
    await reloadAll();
    state.loading = false;
    render();
  }

  async function doLogout() {
    await LF.auth.signOut();
    state.session = null;
    render();
  }

  // ── boot ─────────────────────────────────────────────────────────────────
  async function boot() {
    render();
    const session = await LF.auth.getSession();
    state.session = session;
    if (session) await reloadAll();
    state.loading = false;
    render();

    LF.auth.onAuthStateChange(async (session) => {
      const hadSession = !!state.session;
      state.session = session;
      if (session && !hadSession) {
        state.loading = true; render();
        await reloadAll();
        state.loading = false;
      }
      render();
    });
  }

  boot();
})();
