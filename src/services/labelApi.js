import { environment } from '../config/environment';

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${environment.apiUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('Não foi possível acessar o servidor. Confirme o endereço EXPO_PUBLIC_API_URL e se o backend está iniciado.');
  }
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Erro ao acessar o servidor.');
  return body;
};

export const labelApi = {
  create(item) {
    return request('/api/labels', {
      method: 'POST',
      body: JSON.stringify({
        materialCode: item.id,
        name: item.name,
        lot: item.lot,
        unit: item.unit,
        location: item.location,
        project: 'Residencial Aurora',
        receivedAt: item.receivedAt,
      }),
    });
  },

  getById(id) {
    return request(`/api/labels/${encodeURIComponent(id)}`);
  },

  getIdFromQr(data) {
    const match = data.match(/^obrasync:\/\/label\/([^/?#]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  },
};
