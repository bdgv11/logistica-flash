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
    return { ratePerLb: Number(row.rate_per_lb), crcRate: Number(row.crc_rate) };
  }

  function mapPackage(row) {
    return {
      id: row.id,
      tracking: row.tracking,
      weight: row.weight == null ? null : Number(row.weight),
      cost: row.cost == null ? null : Number(row.cost),
      clientId: row.client_id,
      arrived: !!row.arrived,
      assignedDate: row.assigned_date,
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

    async createPackage({ tracking, weight, cost, clientId, arrived, assignedDate }) {
      const { data, error } = await sb().from('packages')
        .insert({
          tracking, weight, cost,
          client_id: clientId, arrived: !!arrived, assigned_date: arrived ? assignedDate : null,
        })
        .select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    async updatePackage(id, { tracking, weight, cost, clientId, arrived, assignedDate }) {
      const { data, error } = await sb().from('packages')
        .update({
          tracking, weight, cost,
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

    async unassignPackage(id) {
      const { data, error } = await sb().from('packages')
        .update({ arrived: false, assigned_date: null })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    // Closes out the packages listed in "Lista del día". Takes the explicit
    // ids the screen is showing rather than "every arrived-and-unsent row":
    // a package whose client has no province (or a province no messenger
    // covers) never appears on that screen, and used to get silently marked
    // as delivered here — landing in the Historial as money collected for a
    // delivery nobody made.
    async markRouteSent(ids, sentDate) {
      if (!Array.isArray(ids) || ids.length === 0) return;
      const { error } = await sb().from('packages')
        .update({ sent: true, sent_date: sentDate })
        .in('id', ids).eq('sent', false);
      throwIfError(error);
    },

    // Same as markRouteSent but for a single package — lets an admin close
    // out deliveries one at a time as messengers confirm them, instead of
    // only all-at-once.
    async markPackageSent(id, sentDate) {
      const { data, error } = await sb().from('packages')
        .update({ sent: true, sent_date: sentDate })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    // Mirrors how Nana actually reconciles the customs invoice by hand:
    // trackings already logged (waiting to arrive) get marked arrived with
    // the invoice's weight/cost; trackings nobody logged ahead of time get
    // created fresh with no client, marked arrived, ready to be identified
    // later. Updates go one at a time because each row gets a different
    // weight/cost; creates go in a single insert since they're brand new rows.
    async reconcileInvoice(updates, creates, assignedDate) {
      for (const u of updates) {
        const { error } = await sb().from('packages')
          .update({ arrived: true, assigned_date: assignedDate, weight: u.weight, cost: u.cost })
          .eq('id', u.id);
        throwIfError(error);
      }
      if (creates.length) {
        const { error } = await sb().from('packages')
          .insert(creates.map((c) => ({
            tracking: c.tracking, weight: c.weight, cost: c.cost,
            client_id: null, arrived: true, assigned_date: assignedDate,
          })));
        throwIfError(error);
      }
    },

    // ── settings ─────────────────────────────────────────────────────────
    // maybeSingle(), not single(): if the settings row is ever missing, a
    // hard error here happens during boot and locks the whole app out. Falling
    // back to the documented defaults keeps it usable — the rate is editable
    // from Configuración anyway.
    async getSettings() {
      const { data, error } = await sb().from('app_settings').select('*').eq('id', 1).maybeSingle();
      throwIfError(error);
      if (!data) return { ratePerLb: 4.25, crcRate: 525 };
      return mapSettings(data);
    },

    async updateSettings({ ratePerLb, crcRate }) {
      const { data, error } = await sb().from('app_settings')
        .update({ rate_per_lb: ratePerLb, crc_rate: crcRate, updated_at: new Date().toISOString() })
        .eq('id', 1).select().single();
      throwIfError(error);
      return mapSettings(data);
    },
  };
})();
