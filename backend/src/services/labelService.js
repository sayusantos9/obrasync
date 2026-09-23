import { randomUUID } from 'node:crypto';
import QRCode from 'qrcode';
import { labelRepository } from '../repositories/labelRepository.js';

const requiredFields = ['materialCode', 'name', 'lot', 'unit', 'location', 'project', 'receivedAt'];

const validateInput = (input) => {
  const missing = requiredFields.filter((field) => !String(input[field] || '').trim());
  if (missing.length) {
    const error = new Error(`Campos obrigatórios: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
};

const createQrImage = (payload) => QRCode.toDataURL(payload, {
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 512,
  color: { dark: '#260D35', light: '#FFFFFFFF' },
});

export const labelService = {
  async create(input) {
    validateInput(input);
    const id = `LBL-${randomUUID().slice(0, 8).toUpperCase()}`;
    const qrPayload = `obrasync://label/${id}`;
    const label = {
      id,
      materialCode: input.materialCode.trim(),
      name: input.name.trim(),
      lot: input.lot.trim(),
      unit: input.unit.trim(),
      location: input.location.trim(),
      project: input.project.trim(),
      receivedAt: input.receivedAt.trim(),
      qrPayload,
      createdAt: new Date().toISOString(),
    };
    await labelRepository.create(label);
    return { label, qr: { payload: qrPayload, dataUrl: await createQrImage(qrPayload) } };
  },

  async getById(id) {
    const label = await labelRepository.findById(id);
    if (!label) {
      const error = new Error('Etiqueta não encontrada.');
      error.statusCode = 404;
      throw error;
    }
    return label;
  },

  async list() {
    return labelRepository.list();
  },

  async getPng(id) {
    const label = await this.getById(id);
    return QRCode.toBuffer(label.qrPayload, { type: 'png', width: 768, margin: 2, errorCorrectionLevel: 'M' });
  },
};
