import { labelService } from '../services/labelService.js';

export const labelController = {
  async create(request, response, next) {
    try {
      response.status(201).json(await labelService.create(request.body));
    } catch (error) {
      next(error);
    }
  },

  async getById(request, response, next) {
    try {
      response.json({ label: await labelService.getById(request.params.id) });
    } catch (error) {
      next(error);
    }
  },

  async list(_request, response, next) {
    try {
      response.json({ labels: await labelService.list() });
    } catch (error) {
      next(error);
    }
  },

  async getPng(request, response, next) {
    try {
      response.type('png').send(await labelService.getPng(request.params.id));
    } catch (error) {
      next(error);
    }
  },
};
