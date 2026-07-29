window.LF = window.LF || {};

// Thin data-access layer over Supabase. Every function returns plain JS
// objects in the same shape the UI code expects (camelCase), so app.js never
// touches Postgres column names directly.

(function () {
  function sb() { return LF.supabase; }

  function throwIfError(error) {
    if (error) throw new Error(error.message || 'Error de conexión con la base de datos.');
  }

  function mapClient(row) {
    return {
      id: row.id, name: row.name, phone: row.phone,
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
      weight: Number(row.weight),
      cost: Number(row.cost),
      clientId: row.client_id,
      arrived: !!row.arrived,
      assignedDate: row.assigned_date,
    };
  }

  LF.db = {
    // ── clients ──────────────────────────────────────────────────────────
    async listClients() {
      const { data, error } = await sb().from('clients').select('*');
      throwIfError(error);
      return data.map(mapClient);
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
      const { data, error } = await sb().from('messengers').select('*');
      throwIfError(error);
      return data.map(mapMessenger);
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
      const { data, error } = await sb().from('packages').select('*');
      throwIfError(error);
      return data.map(mapPackage);
    },

    async createPackage({ tracking, weight, cost, clientId }) {
      const { data, error } = await sb().from('packages')
        .insert({ tracking, weight, cost, client_id: clientId, arrived: false, assigned_date: null })
        .select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    async updatePackage(id, { tracking, weight, cost, clientId }) {
      const { data, error } = await sb().from('packages')
        .update({ tracking, weight, cost, client_id: clientId })
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
        .update({ client_id: null, arrived: false, assigned_date: null })
        .eq('id', id).select().single();
      throwIfError(error);
      return mapPackage(data);
    },

    // ── settings ─────────────────────────────────────────────────────────
    async getSettings() {
      const { data, error } = await sb().from('app_settings').select('*').eq('id', 1).single();
      throwIfError(error);
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
