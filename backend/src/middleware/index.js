/**
 * MIDDLEWARES GERAIS DO SISTEMA
 * Contém: CORS, Error Handler, Logger
 */

/**
 * CORS MIDDLEWARE
 * Permite que o frontend React acesse o backend
 */
const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
};

/**
 * ERROR HANDLER
 * Captura e formata todos os erros da aplicação
 */
const errorHandler = (error, req, res, next) => {
  console.error(" Erro:", error.message);

  const isDevelopment = process.env.NODE_ENV === "development";
  const statusCode = error.statusCode || 500;

  const errorResponse = {
    success: false,
    message: error.message || "Erro interno do servidor",
    error: {
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  };

  if (isDevelopment) {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * NOT FOUND HANDLER (404)
 * Captura requisições para rotas inexistentes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.method} ${req.path}`);
  error.statusCode = 404;
  next(error);
};

/**
 * LOGGER MIDDLEWARE
 * Registra todas as requisições no console
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;

    let statusColor = "\x1b[32m"; // Verde
    if (status >= 400 && status < 500) statusColor = "\x1b[33m"; // Amarelo
    if (status >= 500) statusColor = "\x1b[31m"; // Vermelho

    console.log(
      `${statusColor}[${new Date().toISOString()}] ${req.method} ${req.url} - ${status} - ${duration}ms\x1b[0m`
    );
  });

  next();
};

/**
 * ASYNC HANDLER
 * Wrapper para capturar erros de funções assíncronas
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  corsMiddleware,
  errorHandler,
  notFoundHandler,
  requestLogger,
  asyncHandler,
};
