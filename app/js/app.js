(function () {
  'use strict';

  const PROVINCIAS = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];
  const RATE_PER_LB = 4.25;
  const PAGE_SIZE = 8;
  const WAITING_PAGE_SIZE = 8;

  const state = {
    tab: 'inicio',
    clients: [],
    messengers: [],
    packages: [],
    clientsPage: 1,
    clientEditingId: null,
    messengerEditingId: null,
    messengerZonesDraft: [],
    pkgEditingId: null,
    pkgSelectedClientId: null,
    pkgDraft: { tracking: '', weight: '', cost: '' },
    waitingPage: 1,
    session: null,
    loading: true,
    busy: false,
  };

  // ── helpers ──────────────────────────────────────────────────────────────
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function todayLabel() {
    const raw = new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function messengerForZone(zone) {
    if (!zone) return null;
    return state.messengers.find((m) => Array.isArray(m.zones) && m.zones.includes(zone)) || null;
  }

  function waPhone(phone) { return '506' + String(phone).replace(/\D/g, ''); }

  function clientById(id) { return state.clients.find((c) => c.id === id) || null; }

  function fmtMoney(n) { return Number(n || 0).toFixed(2); }

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
  async function reloadAll() {
    const [clients, messengers, packages] = await Promise.all([
      LF.db.listClients(), LF.db.listMessengers(), LF.db.listPackages(),
    ]);
    state.clients = clients; state.messengers = messengers; state.packages = packages;
  }

  // ── icons ────────────────────────────────────────────────────────────────
  const ICONS = {
    person: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>',
    box: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>',
    checklist: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><rect x="8" y="2" width="8" height="4" rx="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
    whatsapp: '<svg width="18" height="18" viewBox="0 0 32 32" fill="#ffffff" style="flex:none;display:block"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.446.713 4.716 1.938 6.63L4 29l7.57-1.912A11.9 11.9 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.7c-1.98 0-3.83-.55-5.41-1.5l-.386-.23-4.24 1.07 1.12-4.13-.25-.4A9.66 9.66 0 0 1 5.3 15c0-5.9 4.8-10.7 10.7-10.7S26.7 9.1 26.7 15 21.9 24.7 16 24.7zm5.94-7.98c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.72.16-.21.32-.82 1.05-1 1.26-.19.21-.37.24-.69.08-1.86-.93-3.08-1.66-4.31-3.76-.33-.56.33-.52.94-1.73.1-.21.05-.4-.05-.56-.1-.16-.72-1.73-.98-2.37-.26-.62-.53-.53-.72-.54-.19-.01-.4-.01-.61-.01-.21 0-.55.08-.85.4-.29.32-1.13 1.11-1.13 2.7 0 1.6 1.16 3.14 1.32 3.36.16.21 2.24 3.42 5.44 4.66 2.7 1.05 3.24.85 3.83.8.58-.06 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.29-.21-.61-.37z"></path></svg>',
  };

  // ── DOM roots ────────────────────────────────────────────────────────────
  const loginRoot = document.getElementById('login-root');
  const shellRoot = document.getElementById('shell-root');
  const navRoot = document.getElementById('nav-root');
  const mainRoot = document.getElementById('main-root');

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
    ['lista', 'Lista del día'], ['mensajeros', 'Mensajeros'],
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
      default: return renderInicio();
    }
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
    const f = editing || { name: '', phone: '', address: '', zone: '' };

    const sorted = [...state.clients].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, state.clientsPage), totalPages);
    const pageClients = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const rows = pageClients.map((c) => {
      const incomplete = !c.address || !c.zone;
      return `
        <tr>
          <td>${esc(c.name)}${incomplete ? '<span class="tag tag-warn" style="margin-left:6px">Falta info</span>' : ''}</td>
          <td><span class="tag tag-neutral">${esc(c.zone || 'Sin zona')}</span></td>
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

    return `
      <div>
        <h1 style="margin-bottom:2px">${editing ? 'Editar cliente' : 'Agregar cliente'}</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Se guarda una sola vez por cliente. Así los mensajeros ya no dependen de mensajes sueltos por WhatsApp.</p>

        <div class="card elev-sm" style="max-width:560px;margin-bottom:var(--space-8)">
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
            <label>Zona — opcional</label>
            <select class="input" id="client-zone">
              <option value="">Selecciona provincia...</option>
              ${PROVINCIAS.map((p) => `<option value="${esc(p)}" ${f.zone === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2)">
            <button class="btn btn-primary" type="button" data-action="save-client">${editing ? 'Guardar cambios' : 'Guardar cliente'}</button>
            ${editing ? `<button class="btn btn-secondary" type="button" data-action="cancel-edit-client">Cancelar</button>` : ''}
          </div>
        </div>

        <hr class="hr">

        <h4 style="margin:var(--space-4) 0 var(--space-3)">Clientes guardados (${state.clients.length})</h4>
        <div class="table-scroll">
          <table class="table">
            <thead><tr><th>Nombre</th><th>Zona</th><th>Teléfono</th><th>Dirección</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${state.clients.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-3)">Aún no hay clientes guardados.</p>` : ''}
        ${totalPages > 1 ? `
          <div class="pagination-row">
            <button class="btn btn-secondary" type="button" data-action="clients-page" data-dir="prev" ${page <= 1 ? 'disabled' : ''}>← Anterior</button>
            <span class="text-muted">Página ${page} de ${totalPages}</span>
            <button class="btn btn-secondary" type="button" data-action="clients-page" data-dir="next" ${page >= totalPages ? 'disabled' : ''}>Siguiente →</button>
          </div>` : ''}
      </div>`;
  }

  // ── REGISTRAR PAQUETE ────────────────────────────────────────────────────
  function pkgMatchesHtml(query) {
    const q = query.trim().toLowerCase();
    if (!q) return '';
    const matches = state.clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
    if (matches.length === 0) return `<p class="text-muted">Sin coincidencias. Revisa el nombre o agrégalo en "Clientes".</p>`;
    const items = matches.map((c) => {
      const mm = messengerForZone(c.zone);
      return `
        <button type="button" data-action="select-pkg-client" data-id="${c.id}" class="btn btn-secondary" style="justify-content:space-between;text-align:left;height:auto;padding:var(--space-2)">
          <span>${esc(c.name)}</span>
          <span style="display:flex;gap:6px">
            <span class="tag tag-neutral">${esc(c.zone || 'Sin zona')}</span>
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

  function renderPaquete() {
    const editing = state.pkgEditingId ? state.packages.find((p) => p.id === state.pkgEditingId) : null;
    const draft = state.pkgDraft;

    const selectedClient = state.pkgSelectedClientId ? clientById(state.pkgSelectedClientId) : null;
    const selectedMessenger = selectedClient ? messengerForZone(selectedClient.zone) : null;

    const waitingAll = state.packages.filter((p) => p.clientId && !p.arrived)
      .map((p) => ({ p, c: clientById(p.clientId) }))
      .sort((a, b) => (a.c ? a.c.name : '').localeCompare(b.c ? b.c.name : '', 'es'));

    return `
      <div>
        <h1 style="margin-bottom:2px">Registrar paquete</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Crea el paquete e identifícalo con su cliente de una vez. Cuando esté físicamente aquí, márcalo como llegado — solo entonces entra a la ruta del mensajero.</p>

        <div class="card elev-sm" style="max-width:520px;margin-bottom:var(--space-8)">
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
            <label>Costo estimado ($${RATE_PER_LB}/lb) — editable</label>
            <input class="input" id="pkg-cost" type="number" step="0.01" min="0" value="${esc(draft.cost)}" placeholder="0.00">
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
                <span class="tag tag-neutral">${esc(selectedClient.zone || 'Sin zona')}</span>
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
    const wq = (searchEl ? searchEl.value : '').trim().toLowerCase();

    const waitingAll = state.packages.filter((p) => p.clientId && !p.arrived)
      .map((p) => ({ p, c: clientById(p.clientId) }))
      .sort((a, b) => (a.c ? a.c.name : '').localeCompare(b.c ? b.c.name : '', 'es'));

    const filtered = wq
      ? waitingAll.filter(({ p, c }) => (c && c.name.toLowerCase().includes(wq)) || p.tracking.toLowerCase().includes(wq))
      : waitingAll;

    const totalPages = Math.max(1, Math.ceil(filtered.length / WAITING_PAGE_SIZE));
    const page = Math.min(Math.max(1, state.waitingPage), totalPages);
    const pageItems = filtered.slice((page - 1) * WAITING_PAGE_SIZE, page * WAITING_PAGE_SIZE);

    const rows = pageItems.map(({ p, c }) => {
      const mm = c ? messengerForZone(c.zone) : null;
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--color-divider);flex-wrap:wrap;gap:8px">
          <div>
            <strong style="font-family:var(--font-heading)">${esc(c ? c.name : 'Cliente eliminado')}</strong>
            <span class="text-muted" style="margin-left:8px">${esc(p.tracking)} · ${p.weight} lb · $${fmtMoney(p.cost)}</span>
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
        .filter(({ c }) => c && c.zone && m.zones.includes(c.zone));

      const totalCost = entries.reduce((sum, { p }) => sum + (Number(p.cost) || 0), 0);
      const zoneLabel = m.zones.join(', ') || 'Sin zona asignada';

      const lines = entries.map(({ p, c }, i) => `${i + 1}. ${c.name}\nDireccion: ${c.address}\nTelefono: ${c.phone}\nTracking: ${p.tracking}`);
      const message = `Ruta de hoy - ${zoneLabel} (${entries.length} paquetes)\n\n` + lines.join('\n\n');
      const waHref = `https://wa.me/${waPhone(m.phone)}?text=${encodeURIComponent(message)}`;

      const rows = entries.map(({ p, c }) => `
        <tr>
          <td>${esc(c.name)}</td>
          <td><a href="${esc(c.address)}" target="_blank" rel="noopener">Ver ubicación</a></td>
          <td>${esc(c.phone)}</td>
          <td>${esc(p.tracking)}</td>
          <td>$${fmtMoney(p.cost)}</td>
          <td style="text-align:right">
            <button class="btn btn-icon btn-ghost" type="button" data-action="unassign-pkg" data-id="${p.id}" aria-label="Quitar de la ruta de hoy" title="Quitar de la ruta de hoy">${ICONS.trash}</button>
          </td>
        </tr>`).join('\n');

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
              <thead><tr><th>Cliente</th><th>Dirección</th><th>Teléfono</th><th>Tracking</th><th>Costo</th><th></th></tr></thead>
              <tbody>${rows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align:right;font-family:var(--font-heading);font-weight:800">Total a cobrar en esta ruta</td>
                  <td style="text-align:right;font-family:var(--font-heading);font-weight:800">$${fmtMoney(totalCost)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          ${entries.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-2)">Sin paquetes asignados hoy.</p>` : ''}
          <a href="${esc(waHref)}" target="_blank" rel="noopener" class="wa-btn" style="margin-top:var(--space-3);width:fit-content;display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#ffffff;font-family:var(--font-heading);font-weight:800;font-size:14px;padding:var(--space-2) calc(var(--space-3) * 1.2);border-radius:var(--radius-md);text-decoration:none">
            ${ICONS.whatsapp}<span>Enviar lista por WhatsApp</span>
          </a>
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
    const f = editing || { name: '', phone: '' };
    const zonesDraft = state.messengerZonesDraft;

    const chips = PROVINCIAS.map((p) => {
      const checked = zonesDraft.includes(p);
      return `<button type="button" class="province-chip${checked ? ' is-selected' : ''}" data-action="toggle-zone" data-zone="${esc(p)}">${esc(p)}</button>`;
    }).join('\n');

    const rows = state.messengers.map((m) => {
      const incomplete = m.zones.length === 0;
      return `
        <tr>
          <td>${esc(m.name)}${incomplete ? '<span class="tag tag-warn" style="margin-left:6px">Sin zona</span>' : ''}</td>
          <td>${esc(m.phone)}</td>
          <td><span class="tag tag-neutral">${esc(m.zones.join(', ') || 'Sin zona')}</span></td>
          <td style="text-align:right;white-space:nowrap">
            <button class="btn btn-ghost" type="button" data-action="edit-messenger" data-id="${m.id}">Editar</button>
            <button class="btn btn-ghost" type="button" data-action="delete-messenger" data-id="${m.id}">Eliminar</button>
          </td>
        </tr>`;
    }).join('\n');

    return `
      <div>
        <h1 style="margin-bottom:2px">${editing ? 'Editar mensajero' : 'Agregar mensajero'}</h1>
        <p class="text-muted" style="margin-bottom:var(--space-6)">Nombre, teléfono para WhatsApp y las provincias que cubre cada mensajero.</p>

        <div class="card elev-sm" style="max-width:560px;margin-bottom:var(--space-8)">
          <div class="field">
            <label>Nombre *</label>
            <input class="input" id="messenger-name" type="text" value="${esc(f.name)}" placeholder="Ej: Mensajero 1">
          </div>
          <div class="field">
            <label>Teléfono (WhatsApp) *</label>
            <input class="input" id="messenger-phone" type="tel" value="${esc(f.phone)}" placeholder="Ej: 8888-1234">
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
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Provincias</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${state.messengers.length === 0 ? `<p class="text-muted" style="margin-top:var(--space-3)">Aún no hay mensajeros registrados.</p>` : ''}
      </div>`;
  }

  // ── actions ──────────────────────────────────────────────────────────────
  function setTab(tab) {
    state.tab = tab;
    if (tab === 'clientes') state.clientEditingId = null;
    if (tab === 'paquete') { state.pkgEditingId = null; state.pkgSelectedClientId = null; state.pkgDraft = { tracking: '', weight: '', cost: '' }; }
    if (tab === 'mensajeros') { state.messengerEditingId = null; state.messengerZonesDraft = []; }
    render();
    if (tab === 'paquete') renderWaitingList();
  }

  async function saveClient() {
    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const address = document.getElementById('client-address').value;
    const zone = document.getElementById('client-zone').value;
    if (!name.trim() || !phone.trim()) return;
    await withBusy(async () => {
      if (state.clientEditingId) {
        await LF.db.updateClient(state.clientEditingId, { name: name.trim(), phone: phone.trim(), address: address.trim(), zone });
      } else {
        await LF.db.createClient({ name: name.trim(), phone: phone.trim(), address: address.trim(), zone });
      }
      await reloadClients();
      state.clientEditingId = null;
      render();
    });
  }

  async function deleteClient(id) {
    if (!window.confirm('¿Eliminar este cliente? Sus paquetes asignados quedarán pendientes.')) return;
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
    const finalCost = cost ? parseFloat(cost) : parseFloat(weight) * RATE_PER_LB;
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
      renderWaitingList();
    });
  }

  async function markArrived(id) {
    if (!window.confirm('¿Confirmas que este paquete ya está aquí y listo para el mensajero?')) return;
    await withBusy(async () => {
      await LF.db.markArrived(id, todayISO());
      await reloadPackages();
      renderWaitingList();
      render();
    });
  }

  async function unassignPkg(id) {
    if (!window.confirm('¿Quitar este paquete de la ruta de hoy? Volverá a pendientes por asignar.')) return;
    await withBusy(async () => {
      await LF.db.unassignPackage(id);
      await reloadPackages();
      render();
    });
  }

  async function saveMessenger() {
    const name = document.getElementById('messenger-name').value;
    const phone = document.getElementById('messenger-phone').value;
    const zones = state.messengerZonesDraft;
    if (!name.trim() || !phone.trim()) return;
    await withBusy(async () => {
      if (state.messengerEditingId) {
        await LF.db.updateMessenger(state.messengerEditingId, { name: name.trim(), phone: phone.trim(), zones });
      } else {
        await LF.db.createMessenger({ name: name.trim(), phone: phone.trim(), zones });
      }
      await reloadMessengers();
      state.messengerEditingId = null;
      state.messengerZonesDraft = [];
      render();
    });
  }

  async function deleteMessenger(id) {
    if (!window.confirm('¿Eliminar este mensajero? Las zonas que cubre quedarán sin mensajero asignado.')) return;
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

      case 'edit-client':
        state.clientEditingId = el.dataset.id; render(); return;
      case 'cancel-edit-client':
        state.clientEditingId = null; render(); return;
      case 'save-client': return void saveClient();
      case 'delete-client': return void deleteClient(el.dataset.id);
      case 'clients-page': {
        const sorted = state.clients;
        const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
        const cur = Math.min(Math.max(1, state.clientsPage), totalPages);
        state.clientsPage = el.dataset.dir === 'next' ? Math.min(totalPages, cur + 1) : Math.max(1, cur - 1);
        render(); return;
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
        render(); return;
      }
      case 'arrive-pkg': return void markArrived(el.dataset.id);
      case 'waiting-page': {
        state.waitingPage = el.dataset.dir === 'next' ? state.waitingPage + 1 : Math.max(1, state.waitingPage - 1);
        renderWaitingList(); return;
      }

      case 'unassign-pkg': return void unassignPkg(el.dataset.id);

      case 'edit-messenger': {
        const m = state.messengers.find((x) => x.id === el.dataset.id);
        if (!m) return;
        state.messengerEditingId = m.id; state.messengerZonesDraft = [...m.zones];
        render(); return;
      }
      case 'cancel-edit-messenger':
        state.messengerEditingId = null; state.messengerZonesDraft = []; render(); return;
      case 'save-messenger': return void saveMessenger();
      case 'delete-messenger': return void deleteMessenger(el.dataset.id);
      case 'toggle-zone': {
        const zone = el.dataset.zone;
        const i = state.messengerZonesDraft.indexOf(zone);
        if (i === -1) state.messengerZonesDraft.push(zone); else state.messengerZonesDraft.splice(i, 1);
        render(); return;
      }
    }
  });

  document.body.addEventListener('input', (e) => {
    const id = e.target.id;
    if (id === 'pkg-tracking') { state.pkgDraft.tracking = e.target.value; return updatePkgSubmitState(); }
    if (id === 'pkg-weight') {
      const w = e.target.value;
      state.pkgDraft.weight = w;
      const costEl = document.getElementById('pkg-cost');
      const newCost = w ? (parseFloat(w) * RATE_PER_LB).toFixed(2) : '';
      if (costEl) costEl.value = newCost;
      state.pkgDraft.cost = newCost;
      updatePkgSubmitState();
      return;
    }
    if (id === 'pkg-cost') { state.pkgDraft.cost = e.target.value; return; }
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
    if (state.tab === 'paquete') renderWaitingList();

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
