import { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Phone,
  CreditCard,
  Edit2,
  Trash2,
  Search,
  Filter,
  Lock,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner@2.0.3";

// ========== INTERFACES ==========
interface Employee {
  id: string;
  email: string;
  name: string;
  role: "admin" | "guard";
  cpf: string;
  phone?: string;
  active: boolean;
  createdAt?: string;
}

interface EmployeesManagerProps {
  onNavigateToCreate?: () => void;
}

// ========== CONFIGURAÇÃO DO BACKEND ==========
const API_BASE_URL = "http://localhost:3001";
const API_VIGIAS = `${API_BASE_URL}/vigias`;
const API_ADMINISTRADORES = `${API_BASE_URL}/administradores`;

// Helper para pegar token de autenticação
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("vigiasystem_token")}`,
});

// Helper para determinar qual API usar baseado no role
const getApiUrl = (role: "admin" | "guard", id?: string) => {
  const baseUrl =
    role === "admin" ? API_ADMINISTRADORES : API_VIGIAS;
  return id ? `${baseUrl}/${id}` : baseUrl;
};

// Mapear tipo do backend para role do frontend
const mapTipoToRole = (tipo: string): "admin" | "guard" => {
  const tipoLower = (tipo || "").toLowerCase().trim();
  if (tipoLower === "administrador" || tipoLower === "admin")
    return "admin";
  return "guard"; // vigia, vigilante, guard, ou qualquer outro
};

// Mapear role do frontend para tipo do backend
const mapRoleToTipo = (role: string): string => {
  if (role === "admin") return "administrador";
  return "vigia";
};

// Mapear dados do backend para o formato do frontend
const mapBackendToFrontend = (usuario: any): Employee => ({
  id: usuario.idUsuario
    ? usuario.idUsuario.toString()
    : usuario.id,
  name: usuario.Usuario?.nome || usuario.nome,
  email: usuario.Usuario?.email || usuario.email,
  cpf: usuario.Usuario?.cpf || usuario.cpf,
  phone: usuario.Usuario?.telefone || usuario.telefone,
  role: mapTipoToRole(usuario.Usuario?.tipo || usuario.tipo || "vigia"),
  active: usuario.Usuario?.ativo !== undefined
    ? usuario.Usuario.ativo
    : (usuario.ativo !== undefined ? usuario.ativo : true),
  createdAt:
    usuario.createdAt ||
    usuario.dataCriacao ||
    new Date().toISOString(),
});

export function EmployeesManager({
  onNavigateToCreate,
}: EmployeesManagerProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] =
    useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    role: "guard" as "admin" | "guard",
    password: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  // ========== CARREGAR FUNCIONÁRIOS DO BACKEND ==========
  const loadEmployees = async () => {
    try {
      // Buscar vigilantes
      const vigiaResponse = await fetch(API_VIGIAS, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      // Buscar administradores
      const adminResponse = await fetch(API_ADMINISTRADORES, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const allEmployees: Employee[] = [];

      // Processar vigilantes
      if (vigiaResponse.ok) {
        const vigiaResult = await vigiaResponse.json();
        
        if (vigiaResult.success && vigiaResult.data) {
          const mappedVigias = vigiaResult.data.map(
            mapBackendToFrontend,
          );
          allEmployees.push(...mappedVigias);
        }
      }

      // Processar administradores
      if (adminResponse.ok) {
        const adminResult = await adminResponse.json();
        
        if (adminResult.success && adminResult.data) {
          const mappedAdmins = adminResult.data.map(
            (admin: any) => ({
              id: admin.idUsuario
                ? admin.idUsuario.toString()
                : admin.id,
              name: admin.Usuario?.nome || admin.nome,
              email: admin.Usuario?.email || admin.email,
              cpf: admin.Usuario?.cpf || admin.cpf,
              phone: admin.Usuario?.telefone || admin.telefone,
              role: "admin" as const,
              active:
                admin.Usuario?.ativo !== undefined 
                  ? admin.Usuario.ativo 
                  : (admin.ativo !== undefined ? admin.ativo : true),
              createdAt:
                admin.createdAt ||
                admin.dataCriacao ||
                new Date().toISOString(),
            }),
          );
          allEmployees.push(...mappedAdmins);
        }
      }
      
      setEmployees(allEmployees);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  // ========== CRIAR FUNCIONÁRIO ==========
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      const backendData = {
        login: formData.email, // Usando email como login
        nome: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.phone || "",
        senha: formData.password,
        tipo: mapRoleToTipo(formData.role),
      };

      // Usar rota correta baseado no role
      const apiUrl = `${API_BASE_URL}/usuarios`;
      console.log(JSON.stringify(backendData, null, 2))

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao cadastrar funcionário",
        );
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Mapear resposta correta baseado no tipo
        const newEmployee: Employee =
          formData.role === "admin"
            ? {
                id: result.data.idAdministrador
                  ? result.data.idAdministrador.toString()
                  : result.data.id,
                name: result.data.nome,
                email: result.data.email,
                cpf: result.data.cpf,
                phone: result.data.telefone,
                role: "admin",
                active:
                  result.data.ativo !== undefined
                    ? result.data.ativo
                    : true,
                createdAt:
                  result.data.createdAt ||
                  result.data.dataCriacao ||
                  new Date().toISOString(),
              }
            : mapBackendToFrontend(result.data);

        setEmployees([newEmployee, ...employees]);
        setShowCreateDialog(false);
        setFormData({
          name: "",
          email: "",
          cpf: "",
          phone: "",
          role: "guard",
          password: "",
        });
        toast.success("Funcionário cadastrado com sucesso!");
      }
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast.error(
        error.message || "Erro ao cadastrar funcionário",
      );
    }
  };

  // ========== EDITAR FUNCIONÁRIO ==========
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEmployee) return;

    try {
      const backendData = {
        nome: editingEmployee.name,
        email: editingEmployee.email,
        cpf: editingEmployee.cpf,
        telefone: editingEmployee.phone || "",
        tipo: mapRoleToTipo(editingEmployee.role),
      };

      // Usar rota correta baseado no role
      const apiUrl = `${API_BASE_URL}/usuarios/${editingEmployee.id}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao atualizar funcionário",
        );
      }

      const result = await response.json();

      // Atualizar com os dados retornados OU com os dados editados
      let updatedEmployee: Employee;
      if (result.success && result.data) {
        updatedEmployee =
          editingEmployee.role === "admin"
            ? {
                id: result.data.idAdministrador
                  ? result.data.idAdministrador.toString()
                  : result.data.id,
                name: result.data.nome,
                email: result.data.email,
                cpf: result.data.cpf,
                phone: result.data.telefone,
                role: "admin",
                active:
                  result.data.ativo !== undefined
                    ? result.data.ativo
                    : true,
                createdAt:
                  result.data.createdAt ||
                  result.data.dataCriacao ||
                  new Date().toISOString(),
              }
            : mapBackendToFrontend(result.data);
      } else {
        // Fallback: usar os dados que foram editados
        updatedEmployee = { ...editingEmployee };
      }

      // Forçar atualização criando um novo array
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id.toString() === editingEmployee.id.toString()
            ? updatedEmployee
            : emp,
        ),
      );

      setShowEditDialog(false);
      setEditingEmployee(null);
      toast.success("Funcionário atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(
        error.message || "Erro ao atualizar funcionário",
      );
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee({ ...employee });
    setShowEditDialog(true);
  };

  // ========== DELETAR FUNCIONÁRIO (DELETE PERMANENTE) ==========
  const deleteEmployee = async (id: string) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;

    const confirmMessage = `ATENÇÃO: Deseja realmente DELETAR permanentemente o funcionário "${employee.name}"?\n\nEsta ação NÃO PODE ser desfeita!`;

    if (!confirm(confirmMessage)) return;

    try {
      // Usar rota correta baseado no role
      const apiUrl = `${API_BASE_URL}/usuarios/${id}`;

      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao deletar funcionário",
        );
      }

      const result = await response.json();

      if (result.success) {
        // Remover da lista localmente
        setEmployees((prevEmployees) =>
          prevEmployees.filter((emp) => emp.id !== id),
        );
        toast.success("Funcionário deletado com sucesso!");
      }
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast.error(
        error.message || "Erro ao deletar funcionário",
      );
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Administrador",
      guard: "Vigilante",
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-700 border-red-200",
      guard: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[role as keyof typeof colors] || "";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "👑";
      case "guard":
        return "🛡️";
      default:
        return "👤";
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (emp.email || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (emp.cpf || '').includes(searchTerm);
    const matchesRole =
      filterRole === "all" || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: employees.length,
    admins: employees.filter((e) => e.role === "admin").length,
    guards: employees.filter((e) => e.role === "guard").length,
    active: employees.filter((e) => e.active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Funcionários da Ronda
          </h2>
          <p className="text-gray-600">
            Gerencie a equipe de vigilância e segurança
          </p>
        </div>

        <Button
          className="bg-primary-600 hover:bg-primary-700"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="size-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Create Employee Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Cadastrar Novo Funcionário
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do novo funcionário do sistema
              de rondas
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateEmployee}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="Nome do funcionrio"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpf: e.target.value,
                    })
                  }
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guard">
                    <div className="flex items-center gap-2">
                      <span>🛡️</span>
                      <span>Vigilante</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <span>👑</span>
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Senha Temporária *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Digite a senha inicial do funcionário"
                  required
                  style={{ paddingLeft: "3rem" }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Esta será a senha inicial. O funcionário poderá
                alterá-la após o primeiro login.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary-600 hover:bg-primary-700"
              >
                Cadastrar Funcionário
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
            <DialogDescription>
              Altere os dados do funcionário
            </DialogDescription>
          </DialogHeader>

          {editingEmployee && (
            <form
              onSubmit={handleEditEmployee}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Nome Completo *
                </Label>
                <Input
                  id="edit-name"
                  value={editingEmployee.name}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      name: e.target.value,
                    })
                  }
                  placeholder="Nome do funcionário"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingEmployee.email}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      email: e.target.value,
                    })
                  }
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cpf">CPF *</Label>
                  <Input
                    id="edit-cpf"
                    value={editingEmployee.cpf}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        cpf: e.target.value,
                      })
                    }
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editingEmployee.phone || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        phone: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Função *</Label>
                <Select
                  value={editingEmployee.role}
                  onValueChange={(value: any) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      role: value,
                    })
                  }
                  disabled
                >
                  <SelectTrigger className="opacity-60 cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guard">
                      <div className="flex items-center gap-2">
                        <span>🛡️</span>
                        <span>Vigilante</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <span>👑</span>
                        <span>Administrador</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  A função não pode ser alterada após o cadastro.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Por questões de
                  segurança, a senha não pode ser alterada aqui.
                  O funcionário deve usar a opção "Esqueci minha
                  senha" no login.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingEmployee(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.total}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-sm text-red-600 mb-1">
            Administradores
          </p>
          <p className="text-2xl font-bold text-red-700">
            {stats.admins}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-600 mb-1">
            Vigilantes
          </p>
          <p className="text-2xl font-bold text-green-700">
            {stats.guards}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-600 mb-1">Online</p>
          <p className="text-2xl font-bold text-blue-700">
            {stats.active}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "3rem" }}
          />
        </div>
        <Select
          value={filterRole}
          onValueChange={setFilterRole}
        >
          <SelectTrigger className="w-48">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              Todas as Funções
            </SelectItem>
            <SelectItem value="admin">
              Administradores
            </SelectItem>
            <SelectItem value="guard">Vigilantes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employees List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Carregando funcionários...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-2xl">
                    {getRoleIcon(employee.role)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {employee.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium mt-1 ${getRoleColor(employee.role)}`}
                    >
                      {getRoleLabel(employee.role)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => openEditDialog(employee)}
                  >
                    <Edit2 className="size-3.5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteEmployee(employee.id)}
                    className="p-1.5 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="size-3.5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="size-4" />
                  <span className="truncate">
                    {employee.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="size-4" />
                  <span>{employee.cpf}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="size-4" />
                    <span>{employee.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    employee.active
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${employee.active ? "bg-green-500" : "bg-gray-400"}`}
                  />
                  {employee.active ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredEmployees.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="size-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-900 font-medium mb-1">
            {searchTerm || filterRole !== "all"
              ? "Nenhum funcionário encontrado"
              : "Nenhum funcionário cadastrado"}
          </p>
          <p className="text-sm text-gray-500">
            {searchTerm || filterRole !== "all"
              ? "Tente ajustar os filtros de busca"
              : 'Clique em "Novo Funcionário" para começar'}
          </p>
        </div>
      )}
    </div>
  );
}