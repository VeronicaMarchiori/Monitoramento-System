const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

// Importar configuração do Passport
require("./src/config/passportConfig"); 

// Controllers
const authController = require("./src/controllers/authController");
const empresaController = require("./src/controllers/empresaController");
const usuarioController = require("./src/controllers/usuarioController");
const rondaController = require("./src/controllers/rondaController");
const pontoRondaController = require("./src/controllers/pontoRondaController");
const percursoController = require("./src/controllers/percursoController");
const ocorrenciaController = require("./src/controllers/ocorrenciaController");
const mensagemController = require("./src/controllers/mensagemController");
const logAcessoController = require("./src/controllers/logAcessoController");
const vigiaController = require("./src/controllers/vigiaController");
const administradorController = require("./src/controllers/administradorController");

// Models
const db = require("./src/models");
const app = express();

// Configurar middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN ||  ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configurar express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_vigilancia_2024",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // false para desenvolvimento
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    },
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de log de requisições
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    name: "Sistema de Rondas - API",
    version: "1.0.0",
    status: "online",
    endpoints: {
      auth: "/auth",
      empresas: "/empresas",
      usuarios: "/usuarios",
      rondas: "/rondas",
      pontosRonda: "/pontos-ronda",
      percursos: "/percursos",
      ocorrencias: "/ocorrencias",
      mensagens: "/mensagens",
      logsAcesso: "/logs-acesso",
      vigias: "/vigias",
      administradores: "/administradores",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rotas da API
app.use("/auth", authController);
app.use("/empresas", empresaController);
app.use("/usuarios", usuarioController);
app.use("/rondas", rondaController);
app.use("/pontos-ronda", pontoRondaController);
app.use("/percursos", percursoController);
app.use("/ocorrencias", ocorrenciaController);
app.use("/mensagens", mensagemController);
app.use("/logs-acesso", logAcessoController);
app.use("/vigias", vigiaController);
app.use("/administradores", administradorController);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Rota não encontrada",
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error("Erro:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Erro interno do servidor",
  });
});

// Função para inserir dados iniciais
const seedDatabase = async () => {
  try {
    const bcrypt = require("bcryptjs");

    // Verificar se já existem usuários
    const userCount = await db.Usuario.count();

    if (userCount === 0) {
      console.log("Inserindo dados iniciais...");

      // Criar usuário administrador
      const senhaAdminHash = await bcrypt.hash("admin", 10);
      const admin = await db.Usuario.create({
        nome: "Administrador",
        cpf: "000.000.000-00",
        telefone: "(11) 99999-9999",
        email: "admin@admin.com",
        login: "admin",
        senha: senhaAdminHash,
        ativo: true,
      });

      await db.Administrador.create({
        idUsuario: admin.idUsuario,
        nivelAcesso: "master",
      });

      // Criar usuário vigilante
      const senhaVigiaHash = await bcrypt.hash("vigilante", 10);
      const vigia = await db.Usuario.create({
        nome: "Vigilante",
        cpf: "111.111.111-11",
        telefone: "(11) 98888-8888",
        email: "vigilante@vigilante.com",
        login: "vigilante",
        senha: senhaVigiaHash,
        ativo: true,
      });

      await db.Vigia.create({
        idUsuario: vigia.idUsuario,
        foto: null,
        EstaRonda: false,
      });

      // Criar empresa exemplo
      await db.Empresa.create({
        nome: "Empresa Exemplo LTDA",
        cnpj: "00.000.000/0001-00",
        endereco: "Rua Exemplo, 123",
        telefone: "(11) 3333-3333",
        email: "contato@empresa.com",
      });
      
      console.log(" Dados iniciais inseridos com sucesso");
      console.log(" Admin - Login: admin | Senha: admin");
      console.log(" Vigia - Login: vigilante | Senha: vigilante");
    }
  } catch (error) {
    console.error(" Erro ao inserir dados iniciais:", error);
  }
};

// Porta do servidor
const PORT = process.env.PORT || 3001;

// Inicializar servidor
const startServer = async () => {
  try {
    // Sincronizar banco de dados
    await db.sequelize.sync();
    console.log(" Banco de dados sincronizado");

    // Inserir dados iniciais
    await seedDatabase();

    // Iniciar servidor na porta 
    app.listen(PORT, () => {
      console.log(` Servidor rodando na porta ${PORT}`);
      console.log(` API disponível em: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(" Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

// Iniciar o servidor
startServer();

module.exports = app;