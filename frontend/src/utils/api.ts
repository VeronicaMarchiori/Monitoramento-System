const BASE_URL = "http://localhost:3001";

export class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Erro na requisição");
    }

    return data;
  }

  // AUTENTICAÇÃO
  async login(login: string, senha: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ login, senha }),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  // EMPRESAS
  async createEmpresa(data: any) {
    return this.request("/empresas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getEmpresas() {
    return this.request("/empresas");
  }

  async updateEmpresa(id: string | number, data: any) {
    return this.request(`/empresas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEmpresa(id: string | number) {
    return this.request(`/empresas/${id}`, {
      method: "DELETE",
    });
  }

  // RONDAS / ROTAS
  async createRonda(data: any) {
    return this.request("/rondas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getRondas() {
    return this.request("/rondas");
  }

  async updateRonda(id: string | number, data: any) {
    return this.request(`/rondas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRonda(id: string | number) {
    return this.request(`/rondas/${id}`, {
      method: "DELETE",
    });
  }

  // PONTOS DE RONDA
  async createPontoRonda(data: any) {
    return this.request("/pontos-ronda", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPontosRonda() {
    return this.request("/pontos-ronda");
  }

  async updatePontoRonda(id: string | number, data: any) {
    return this.request(`/pontos-ronda/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePontoRonda(id: string | number) {
    return this.request(`/pontos-ronda/${id}`, {
      method: "DELETE",
    });
  }

  // USUÁRIOS / FUNCIONÁRIOS
  async getUsuarios() {
    return this.request("/usuarios");
  }

  async createUsuario(data: any) {
    return this.request("/usuarios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUsuario(id: string | number, data: any) {
    return this.request(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUsuario(id: string | number) {
    return this.request(`/usuarios/${id}`, {
      method: "DELETE",
    });
  }

  async getVigias() {
    return this.request("/vigias");
  }

  async getAdministradores() {
    return this.request("/administradores");
  }

  // PERCURSOS
  async getPercursos() {
    return this.request("/percursos");
  }

  async createPercurso(data: any) {
    return this.request("/percursos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePercurso(id: string | number, data: any) {
    return this.request(`/percursos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // OCORRÊNCIAS
  async createOcorrencia(data: any) {
    return this.request("/ocorrencias", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getOcorrencias() {
    return this.request("/ocorrencias");
  }

  async updateOcorrencia(id: string | number, data: any) {
    return this.request(`/ocorrencias/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteOcorrencia(id: string | number) {
    return this.request(`/ocorrencias/${id}`, {
      method: "DELETE",
    });
  }

  // MENSAGENS
  async sendMensagem(data: any) {
    return this.request("/mensagens", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMensagens() {
    return this.request("/mensagens");
  }

  // LOGS
  async getLogsAcesso() {
    return this.request("/logs-acesso");
  }

  // RELATÓRIOS
  async getRelatorioRotas() {
    const [empresas, rondas, usuarios, vigias, percursos, ocorrencias] =
      await Promise.all([
        this.getEmpresas(),
        this.getRondas(),
        this.getUsuarios(),
        this.getVigias(),
        this.getPercursos(),
        this.getOcorrencias(),
      ]);

    return {
      empresas,
      rondas,
      usuarios,
      vigias,
      percursos,
      ocorrencias,
    };
  }

  // Compatibilidade com nomes antigos do frontend - Refactor
  async getEstablishments() {
    return this.getEmpresas();
  }

  async createEstablishment(data: any) {
    return this.createEmpresa(data);
  }

  async updateEstablishment(id: string | number, data: any) {
    return this.updateEmpresa(id, data);
  }

  async getRoutes() {
    return this.getRondas();
  }

  async createRoute(data: any) {
    return this.createRonda(data);
  }

  async deleteRoute(id: string | number) {
    return this.deleteRonda(id);
  }

  async getEmployees() {
    return this.getUsuarios();
  }

  async getOccurrences() {
    return this.getOcorrencias();
  }

  async createOccurrence(data: any) {
    return this.createOcorrencia(data);
  }

  async getMessages() {
    return this.getMensagens();
  }

  async sendMessage(data: any) {
    return this.sendMensagem(data);
  }
}

export const apiClient = new ApiClient();