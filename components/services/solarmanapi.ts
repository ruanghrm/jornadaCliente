const BASE =
  "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman";

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {

  const res = await fetch(url, { signal });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro API ${res.status}: ${text}`);
  }

  return res.json();
}

export const SolarmanAPI = {

  /* ================= STATIONS ================= */

  async getStations(signal?: AbortSignal) {
    return fetchJSON(`${BASE}/stations`, signal);
  },

  async getStationDevices(stationId: string, signal?: AbortSignal) {
    return fetchJSON(
      `${BASE}/stations/${stationId}/devices`,
      signal
    );
  },

  async getStationRealtime(stationId: string, signal?: AbortSignal) {
    return fetchJSON(
      `${BASE}/stations/${stationId}/realtime`,
      signal
    );
  },

  async getStationHistory(
    stationId: string,
    granularity: string,
    signal?: AbortSignal
  ) {

    // Backend exige start e end
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const end = today.toISOString().slice(0, 10);

    return fetchJSON(
      `${BASE}/stations/${stationId}/history?granularity=${granularity}&start=${start}&end=${end}`,
      signal
    );
  },


  /* ================= DEVICES ================= */

  async getDeviceRealtime(deviceSn: string, signal?: AbortSignal) {
    return fetchJSON(
      `${BASE}/devices/${deviceSn}/realtime`,
      signal
    );
  },

  async getDeviceHistory(
    deviceSn: string,
    granularity: string,
    signal?: AbortSignal
  ) {

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const end = today.toISOString().slice(0, 10);

    return fetchJSON(
      `${BASE}/devices/${deviceSn}/history?granularity=${granularity}&start=${start}&end=${end}`,
      signal
    );
  }
};
