export const notFoundHandler = (request, response) => {
  response.status(404).json({ error: `Rota não encontrada: ${request.method} ${request.path}` });
};

export const errorHandler = (error, _request, response, _next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Erro interno do servidor.' : error.message;
  if (statusCode === 500) console.error(error);
  response.status(statusCode).json({ error: message });
};
