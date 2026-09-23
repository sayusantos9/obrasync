const toPort = (value) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : 3333;
};

export const environment = Object.freeze({
  port: toPort(process.env.PORT),
  host: process.env.HOST || '0.0.0.0',
});
