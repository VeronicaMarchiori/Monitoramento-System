const BASE_URL = "http://localhost:3001";

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Erro na requisição");
    }

    return data;
  }

  login(login: string, senha: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ login, senha }),
    });
  }

  getRoutes() {
    return this.request("/rondas");
  }

  getRoutePoints(routeId: string) {
    return this.request(`/pontos-ronda?routeId=${routeId}`);
  }

  getChatMessages(routeId?: string) {
    const query = routeId ? `?routeId=${routeId}` : "";
    return this.request(`/mensagens${query}`);
  }

  sendChatMessage(data: any) {
    return this.request("/mensagens", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getEmpresas() {
    return this.request("/empresas");
  }

  getUsuarios() {
    return this.request("/usuarios");
  }

  getVigias() {
    return this.request("/vigias");
  }

  getAdministradores() {
    return this.request("/administradores");
  }

  getOccurrences() {
    return this.request("/ocorrencias");
  }

  createOccurrence() {
    return this.request("/ocorrencias");
  }

  getPercursos() {
    return this.request("/percursos");
  }

  createRound() {
    return this.request("/percursos");

  }
}

export const apiClient = new ApiClient();