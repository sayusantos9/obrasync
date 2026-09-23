const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const api = {
  async fetchDashboard() {
    await wait(650);
    return { realized: 684250, budget: 1200000, deviation: 2.8, lateDeliveries: 3 };
  },
  async submitMaterialRequest(payload) {
    await wait(900);
    return { id: `SOL-${Date.now()}`, ...payload, status: 'Pendente' };
  },
  async syncPendingRecords(records) {
    await wait(1200);
    return { synced: records.length, syncedAt: new Date().toISOString() };
  },
};
