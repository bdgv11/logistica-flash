window.LF = window.LF || {};

// Thin data-access layer over Supabase. Every function returns plain JS
// objects in the same shape the UI code expects (camelCase), so app.js never
// touches Postgres column names directly.

(function () {
  function sb() { return LF.supabase; }

  function throwIfError(error) {
    if (error) throw new Error(error.message || 'Error de conexión con la base de datos.');
  }

  // Supabase's REST API caps how many rows one request returns (1000 by
  // default) and just gives you the first page — no error, no warning. A plain
  // select('*') therefore starts silently losing data once the table grows
  // past that, which for `packages` is a matter of months. Read in explicit
  // chunks until we've seen everything, ordered deterministically so pages
  // can't overlap or skip rows.
  const CHUNK = 1000;
  async function selectAll(table) {
    const out = [];
    for (let from = 0; ; from += CHUNK) {
      const { data, error } = await sb().from(table)
        .select('*')
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + CHUNK - 1);
      throwIfError(error);
      if (!data || data.length === 0) break;
      for (const row of data) out.push(row);
      if (data.length < CHUNK) break;
    }
    return out;
  }

  function mapClient(row) {
    return {
      id: row.id, name: row.name, phone: row.phone, codeSeq: row.code_seq,
      address: row.address || '', addressDetails: row.address_details || '',
      province: row.province || '', canton: row.canton || '',
    };
  }

  function mapMessenger(row) {
    return { id: row.id, name: row.name, phone: row.phone, origin: row.origin || '', zones: Array.isArray(row.zones) ? row.zones : [] };
  }

  function mapSettings(row) {
    return { ratePerLb: Number(row.rate_per_lb), crcRate: Number(row.crc_rate), pricePerCubicFt: Number(row.price_per_cubic_ft || 0) };
  }

  function mapPackage(row) {
    return {
      id: row.id,
      tracking: row.tracking,
      weight: row.weight == null ? null : Number(row.weight),
      cubicFeet: row.cubic_feet == null ? null : Number(row.cubic_feet),
      shippingType: row.shipping_type || 'aereo',
      cost: row.cost == null ? null : Number(row.cost),
      clientId: row.client_id,
      arrived: !!row.arrived,
      assignedDate: row.assigned_date,
      routed: !!row.routed,
      routedDate: row.routed_date,
      delivered: !!row.delivered,
      deliveredDate: row.delivered_date,
      sent: !!row.sent,
      sentDate: row.sent_date,
      createdAt: row.created_at,
    };
  }

  LF.db = {
    // ── clients ──────────────────────────────────────────────────────────
    async listClients() {
      return (await selectAll('clients')).map(mapClient);
    },

    async createClient({ name, phone, address, addressDetails, province, canton }) {
      const { data, error } = await sb().from('clients')
        .insert({ name, phone, address: address || '', address_details: addressDetails || '', province: province || '', canton: canton || '' })
        .select().single();
      throwIfError(error);
      return mapClient(data);
    },

    async updateClient(id, { name, phone, address, addressDetails, province, canton }) {
      const { data, error } = await sb().from('clients')
        .update({ name, phone, address: address || '', address_details: addressDetails || '', province: province || '', canton: canton || '' })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapClient(data);
    },

    async deleteClient(id) {
      const { error } = await sb().from('clients').delete().eq('id', id);
      throwIfError(error);
    },

    // ── messengers ───────────────────────────────────────────────────────
    async listMessengers() {
      return (await selectAll('messengers')).map(mapMessenger);
    },

    async createMessenger({ name, phone, origin, zones }) {
      const { data, error } = await sb().from('messengers')
        .insert({ name, phone, origin: origin || '', zones: zones || [] })
        .select().single();
      throwIfError(error);
      return mapMessenger(data);
    },

    async updateMessenger(id, { name, phone, origin, zones }) {
      const { data, error } = await sb().from('messengers')
        .update({ name, phone, origin: origin || '', zones: zones || [] })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapMessenger(data);
    },

    async deleteMessenger(id) {
      const { error } = await sb().from('messengers').delete().eq('id', id);
      throwIfError(error);
    },

    // ── packages ─────────────────────────────────────────────────────────
    async listPackages() {
      return (await selectAll('packages')).map(mapPackage);
    },

    async createPackage({ tracking, weight, cubicFeet, shippingType, cost, clientId, arrived, assignedDate }) {
      const { data, error } = await sb().from('packages')
        .insert({
          tracking, weight, cubic_feet: cubicFeet, shipping_type: shippingType || 'aereo', cost,
          client_id: clientId, arrived: !!arrived, assigned_date: arrived ? assignedDate : null,
        })
        .select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    async updatePackage(id, { tracking, weight, cubicFeet, shippingType, cost, clientId, arrived, assignedDate }) {
      const { data, error } = await sb().from('packages')
        .update({
          tracking, weight, cubic_feet: cubicFeet, shipping_type: shippingType || 'aereo', cost,
          client_id: clientId, arrived: !!arrived, assigned_date: arrived ? assignedDate : null,
        })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    async markArrived(id, assignedDate) {
      const { data, error } = await sb().from('packages')
        .update({ arrived: true, assigned_date: assignedDate })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    // The explicit "asignar al mensajero" step — a package with complete
    // info doesn't go out on its own; an admin decides when it actually
    // leaves for the route.
    async assignToRoute(id, routedDate) {
      const { data, error } = await sb().from('packages')
        .update({ routed: true, routed_date: routedDate })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    // Pulls a package back off today's route — back to "por entregar",
    // still arrived, still identified, just not headed out anymore.
    async unassignRoute(id) {
      const { data, error } = await sb().from('packages')
        .update({ routed: false, routed_date: null, delivered: false, delivered_date: null, sent: false, sent_date: null })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    // The mensajero handed it over — paid or not yet. Only `paid` files it
    // into Historial; "entregado pero debe" stays on Lista del día, flagged,
    // until markPackageSent() below closes it out later.
    async markDelivered(id, { deliveredDate, paid, paidDate }) {
      const { data, error } = await sb().from('packages')
        .update({ delivered: true, delivered_date: deliveredDate, sent: !!paid, sent_date: paid ? paidDate : null })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    // Closes out a package once the client actually pays — the terminal
    // state that files it into Historial. Also used to flip an already-
    // delivered "debe" package to paid once the money comes in.
    async markPackageSent(id, sentDate) {
      const { data, error } = await sb().from('packages')
        .update({ sent: true, sent_date: sentDate })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    // ── settings ─────────────────────────────────────────────────────────
    // maybeSingle(), not single(): if the settings row is ever missing, a
    // hard error here happens during boot and locks the whole app out. Falling
    // back to the documented defaults keeps it usable — the rate is editable
    // from Configuración anyway.
    async getSettings() {
      const { data, error } = await sb().from('app_settings').select('*').eq('id', 1).maybeSingle();
      throwIfError(error);
      if (!data) return { ratePerLb: 4.25, crcRate: 525, pricePerCubicFt: 0 };
      return mapSettings(data);
    },

    async updateSettings({ ratePerLb, crcRate, pricePerCubicFt }) {
      const { data, error } = await sb().from('app_settings')
        .update({ rate_per_lb: ratePerLb, crc_rate: crcRate, price_per_cubic_ft: pricePerCubicFt, updated_at: new Date().toISOString() })
        .eq('id', 1).select().single();
      throwIfError(error);
      return mapSettings(data);
    },
  };
})();
