import { useState, useEffect } from 'react';
import {
  MapPin,
  QrCode,
  Image as ImageIcon,
  Trash2,
  Clock,
  Edit2,
  Eye,
  AlertCircle,
  Plus,
  Route as RouteIcon,
  Users,
  UserCheck,
  Building2,
  Navigation,
  ClipboardCheck,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

// ========== INTERFACES ==========
interface PontoRonda {
  idPonto?: number;
  nome: string;
  tipo: 'qrcode' | 'photo';
  latitude?: number;
  longitude?: number;
  qrCode?: string;
  ordem: number;
}

interface Ronda {
  idRonda?: number;
  nome: string;
  idCliente: number;
  tipo: 'interna' | 'externa' | 'supervisao';
  horarioInicio?: string;
  horarioFim?: string;
  diasSemana?: string[];
  vigias?: number[]; // IDs dos vigias
  pontos?: PontoRonda[];
  createdAt?: string;
}

interface Cliente {
  idCliente: number;
  nomeEmpresa: string;
  cnpj: string;
  totalRondas?: number;
}

interface Vigia {
  idUsuario: number;
  nome: string;
  email: string;
  ativo: boolean;
}

// ========== CONFIGURAÇÃO DO BACKEND ==========
const API_BASE_URL = 'http://localhost:3001';
const API_RONDAS = `${API_BASE_URL}/rondas`;
const API_PONTOS_RONDA = `${API_BASE_URL}/pontos-ronda`;
const API_PERCURSOS = `${API_BASE_URL}/percursos`;
const API_EMPRESAS = `${API_BASE_URL}/empresas`; // Corrigido de /clientes para /empresas
const API_VIGIAS = `${API_BASE_URL}/vigias`;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('vigiasystem_token')}`,
});

export function RoutesManager() {
  const { user } = useAuth(); // Pegar usuário logado
  const [rondas, setRondas] = useState<Ronda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vigias, setVigias] = useState<Vigia[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRonda, setSelectedRonda] = useState<Ronda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');

  const [formData, setFormData] = useState<Ronda>({
    nome: '',
    idCliente: 0,
    tipo: 'interna',
    horarioInicio: '',
    horarioFim: '',
    diasSemana: ['0', '1', '2', '3', '4', '5', '6'],
    vigias: [],
    pontos: [],
  });

  const [pontoForm, setPontoForm] = useState<Partial<PontoRonda>>({
    nome: '',
    tipo: 'qrcode',
  });

  useEffect(() => {
    loadData();
  }, []);

  // ========== MOCK DATA ==========
  const MOCK_CLIENTES: Cliente[] = [
    { idCliente: 1, nomeEmpresa: 'Shopping Center Norte', cnpj: '12.345.678/0001-90', totalRondas: 3 },
    { idCliente: 2, nomeEmpresa: 'Condomínio Residencial Jardins', cnpj: '98.765.432/0001-10', totalRondas: 2 },
    { idCliente: 3, nomeEmpresa: 'Fábrica Industrial ABC', cnpj: '11.222.333/0001-44', totalRondas: 4 },
  ];

  const MOCK_VIGIAS: Vigia[] = [
    { idUsuario: 1, nome: 'Carlos Silva', email: 'carlos@vigia.com', ativo: true },
    { idUsuario: 2, nome: 'Maria Santos', email: 'maria@vigia.com', ativo: true },
    { idUsuario: 3, nome: 'João Oliveira', email: 'joao@vigia.com', ativo: true },
  ];

  const MOCK_RONDAS: Ronda[] = [
    {
      idRonda: 1,
      nome: 'Perímetro Externo',
      idCliente: 1,
      tipo: 'externa',
      horarioInicio: '22:00',
      horarioFim: '06:00',
      diasSemana: ['1','2','3','4','5'],
      vigias: [1, 2],
      pontos: [
        { nome: 'Portaria Principal', tipo: 'qrcode', ordem: 1, qrCode: 'QR-001' },
        { nome: 'Estacionamento B3',  tipo: 'photo',  ordem: 2 },
        { nome: 'Câmera Setor Norte', tipo: 'qrcode', ordem: 3, qrCode: 'QR-003' },
        { nome: 'Entrada de Serviço', tipo: 'qrcode', ordem: 4, qrCode: 'QR-004' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      idRonda: 2,
      nome: 'Ronda Interna',
      idCliente: 2,
      tipo: 'interna',
      horarioInicio: '08:00',
      horarioFim: '18:00',
      diasSemana: ['1','2','3','4','5','6'],
      vigias: [3],
      pontos: [
        { nome: 'Recepção',     tipo: 'qrcode', ordem: 1, qrCode: 'QR-101' },
        { nome: 'Corredor L1',  tipo: 'photo',  ordem: 2 },
        { nome: 'Sala Técnica', tipo: 'qrcode', ordem: 3, qrCode: 'QR-103' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      idRonda: 3,
      nome: 'Noturna Completa',
      idCliente: 3,
      tipo: 'externa',
      horarioInicio: '20:00',
      horarioFim: '04:00',
      diasSemana: ['0','1','2','3','4','5','6'],
      vigias: [1, 2, 3],
      pontos: [
        { nome: 'Portão Principal', tipo: 'qrcode', ordem: 1, qrCode: 'QR-201' },
        { nome: 'Galpão A',        tipo: 'photo',  ordem: 2 },
        { nome: 'Galpão B',        tipo: 'qrcode', ordem: 3, qrCode: 'QR-203' },
        { nome: 'Setor Elétrico',  tipo: 'qrcode', ordem: 4, qrCode: 'QR-204' },
        { nome: 'Fundos',          tipo: 'photo',  ordem: 5 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      idRonda: 4,
      nome: 'Supervisão Diurna',
      idCliente: 1,
      tipo: 'supervisao',
      horarioInicio: '10:00',
      horarioFim: '14:00',
      diasSemana: ['1','3','5'],
      vigias: [2],
      pontos: [
        { nome: 'Piso 1 — Loja âncora', tipo: 'qrcode', ordem: 1, qrCode: 'QR-301' },
        { nome: 'Piso 2 — Praça de Alimentação', tipo: 'photo', ordem: 2 },
        { nome: 'Saída de Emergência', tipo: 'qrcode', ordem: 3, qrCode: 'QR-303' },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  // ========== CARREGAR DADOS DO BACKEND ==========
  const loadData = async () => {
    try {
      const [rondasRes, clientesRes, vigiasRes] = await Promise.allSettled([
        fetch(API_RONDAS, { headers: getAuthHeaders() }),
        fetch(API_EMPRESAS, { headers: getAuthHeaders() }),
        fetch(API_VIGIAS, { headers: getAuthHeaders() }),
      ]);

      let backendAvailable = false;

      if (rondasRes.status === 'fulfilled' && rondasRes.value.ok) {
        backendAvailable = true;
        const rondasData = await rondasRes.value.json();
        setRondas(rondasData.data?.length ? rondasData.data : MOCK_RONDAS);
      } else {
        setRondas(MOCK_RONDAS);
      }

      if (clientesRes.status === 'fulfilled' && clientesRes.value.ok) {
        const clientesData = await clientesRes.value.json();
        const clientesComRondas = (clientesData.data || []).map((empresa: any) => ({
          idCliente: empresa.idEmpresa,
          nomeEmpresa: empresa.nomeEmpresa || empresa.nome || empresa.nomeFantasia,
          cnpj: empresa.cnpj,
          totalRondas: rondas.filter((r) => r.idCliente === empresa.idEmpresa).length,
        }));
        setClientes(clientesComRondas);
      } else {
        setClientes(MOCK_CLIENTES);
      }

      if (vigiasRes.status === 'fulfilled' && vigiasRes.value.ok) {
        const vigiasData = await vigiasRes.value.json();
        const mappedVigias = (vigiasData.data || []).map((vigia: any) => ({
          idUsuario: vigia.idUsuario,
          nome: vigia.Usuario?.nome || vigia.nome,
          email: vigia.Usuario?.email || vigia.email,
          ativo: vigia.Usuario?.ativo !== undefined ? vigia.Usuario.ativo : true,
        }));
        setVigias(mappedVigias);
      } else {
        setVigias(MOCK_VIGIAS);
      }

      if (!backendAvailable) {
        toast.info('Backend indisponível. Exibindo dados de demonstração.');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setRondas(MOCK_RONDAS);
      setClientes(MOCK_CLIENTES);
      setVigias(MOCK_VIGIAS);
      toast.info('Backend indisponível. Exibindo dados de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  // ========== ADICIONAR PONTO À RONDA ==========
  const addPonto = () => {
    if (!pontoForm.nome) return;

    const novoPonto: PontoRonda = {
      nome: pontoForm.nome!,
      tipo: pontoForm.tipo!,
      ordem: (formData.pontos?.length || 0) + 1,
      ...(pontoForm.tipo === 'qrcode' && { qrCode: crypto.randomUUID() }),
      latitude: pontoForm.latitude,
      longitude: pontoForm.longitude,
    };

    setFormData({
      ...formData,
      pontos: [...(formData.pontos || []), novoPonto],
    });

    setPontoForm({ nome: '', tipo: 'qrcode' });
  };

  // ========== REMOVER PONTO ==========
  const removePonto = (index: number) => {
    setFormData({
      ...formData,
      pontos: formData.pontos?.filter((_, i) => i !== index),
    });
  };

  // ========== CRIAR RONDA ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || formData.idCliente === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.pontos || formData.pontos.length === 0) {
      toast.error('Adicione pelo menos um ponto de verificação');
      return;
    }

    if (!user || !user.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Mapear o payload para o formato que o backend espera
      const payload = {
        nome: formData.nome,
        idEmpresa: formData.idCliente, // Backend espera idEmpresa
        fk_Empresa_idEmpresa: formData.idCliente, // Campo obrigatório
        idAdministrador: user.id, // ID do admin logado
        fk_Administrador_idUsuario: user.id, // Campo obrigatório
        tipo: formData.tipo,
        horarioInicio: formData.horarioInicio || null,
        horarioFim: formData.horarioFim || null,
        diasSemana: formData.diasSemana || [],
        vigias: formData.vigias || [],
        pontos: formData.pontos || [],
      };

      console.log('📤 Enviando payload:', payload);

      const response = await fetch(API_RONDAS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar ronda');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setRondas([result.data, ...rondas]);
        toast.success('Ronda criada com sucesso!');
        setDialogOpen(false);
        setFormData({
          nome: '',
          idCliente: 0,
          tipo: 'interna',
          horarioInicio: '',
          horarioFim: '',
          diasSemana: ['0', '1', '2', '3', '4', '5', '6'],
          vigias: [],
          pontos: [],
        });
        loadData(); // Recarregar dados
      }
    } catch (error: any) {
      console.error('Error creating ronda:', error);
      toast.error(error.message || 'Erro ao criar ronda');
    }
  };

  // ========== DELETAR RONDA ==========
  const deleteRonda = async (idRonda: number) => {
    if (!confirm('⚠️ ATENÇÃO: Deseja realmente DELETAR permanentemente esta ronda?\n\nEsta ação NÃO PODE ser desfeita!')) {
      return;
    }

    try {
      const response = await fetch(`${API_RONDAS}/${idRonda}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar ronda');
      }

      setRondas(rondas.filter((r) => r.idRonda !== idRonda));
      toast.success('Ronda deletada com sucesso!');
    } catch (error: any) {
      console.error('Error deleting ronda:', error);
      toast.error(error.message || 'Erro ao deletar ronda');
    }
  };

  // ========== HELPERS ==========
  const getTipoLabel = (tipo: string) => {
    const labels = {
      interna: 'Interna',
      externa: 'Externa',
      supervisao: 'Supervisão',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      interna: 'bg-blue-100 text-primary border-blue-500/20',
      externa: 'bg-green-100 text-green-700 border-emerald-500/20',
      supervisao: 'bg-purple-100 text-purple-700 border-violet-500/20',
    };
    return colors[tipo as keyof typeof colors] || '';
  };

  const getPontoTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'qrcode':
        return <QrCode className="size-4" />;
      case 'photo':
        return <ImageIcon className="size-4" />;
      default:
        return <QrCode className="size-4" />;
    }
  };

  const getClienteNome = (idCliente: number) => {
    const cliente = clientes.find((c) => c.idCliente === idCliente);
    return cliente?.nomeEmpresa || 'Cliente não encontrado';
  };

  const daysOfWeekOptions = [
    { value: '0', label: 'Dom' },
    { value: '1', label: 'Seg' },
    { value: '2', label: 'Ter' },
    { value: '3', label: 'Qua' },
    { value: '4', label: 'Qui' },
    { value: '5', label: 'Sex' },
    { value: '6', label: 'Sáb' },
  ];

  const toggleDayOfWeek = (day: string) => {
    const current = formData.diasSemana || [];
    if (current.includes(day)) {
      setFormData({ ...formData, diasSemana: current.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, diasSemana: [...current, day] });
    }
  };

  // ========== FILTROS ==========
  const filteredRondas = rondas.filter((ronda) => {
    const matchesSearch =
      ronda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClienteNome(ronda.idCliente).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || ronda.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  // ========== ESTATÍSTICAS ==========
  const stats = {
    total: rondas.length,
    internas: rondas.filter((r) => r.tipo === 'interna').length,
    externas: rondas.filter((r) => r.tipo === 'externa').length,
    supervisao: rondas.filter((r) => r.tipo === 'supervisao').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando rondas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Rotas</h2>
          <p className="text-muted-foreground">
            Configure rotas de ronda, associe clientes e vigilantes
          </p>
        </div>

        <Button
          className="bg-primary hover:opacity-90"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      {/* Aviso de Acesso Restrito */}
      <div className="bg-blue-500/100/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="size-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-foreground">Acesso Restrito</p>
          <p className="text-sm text-muted-foreground">
            Apenas <strong>Administradores</strong> podem criar e gerenciar rotas de ronda.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total de Rotas', value: stats.total, color: 'text-foreground', iconColor: 'text-muted-foreground', bg: 'bg-card' },
          { label: 'Internas',       value: stats.internas,  color: 'text-blue-500',   iconColor: 'text-blue-500',   bg: 'bg-blue-500/100/10 border-blue-500/20' },
          { label: 'Externas',       value: stats.externas,  color: 'text-emerald-500', iconColor: 'text-emerald-500', bg: 'bg-emerald-500/100/10 border-emerald-500/20' },
          { label: 'Supervisão',     value: stats.supervisao, color: 'text-violet-500', iconColor: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-lg border border-border p-4 ${s.bg}`}>
            <p className={`text-sm mb-1 ${s.iconColor}`}>{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '3rem' }}
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-48">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="interna">Internas</SelectItem>
            <SelectItem value="externa">Externas</SelectItem>
            <SelectItem value="supervisao">Supervisão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rondas List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRondas.map((ronda) => (
          <div
            key={ronda.idRonda}
            className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">{ronda.nome}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getTipoColor(ronda.tipo)}`}
                >
                  {getTipoLabel(ronda.tipo)}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  className="p-1.5 hover:bg-accent rounded transition-colors"
                  onClick={() => {
                    setSelectedRonda(ronda);
                    setViewDialogOpen(true);
                  }}
                >
                  <Eye className="size-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => deleteRonda(ronda.idRonda!)}
                  className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 className="size-3.5 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-4" />
                <span className="truncate">{getClienteNome(ronda.idCliente)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span>{ronda.pontos?.length || 0} pontos</span>
              </div>
              {ronda.vigias && ronda.vigias.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="size-4" />
                  <span>{ronda.vigias.length} vigilante(s)</span>
                </div>
              )}
              {ronda.horarioInicio && ronda.horarioFim && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4" />
                  <span>
                    {ronda.horarioInicio} - {ronda.horarioFim}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRondas.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <RouteIcon className="size-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-foreground font-medium mb-1">
            {searchTerm || filterTipo !== 'all'
              ? 'Nenhuma rota encontrada'
              : 'Nenhuma rota cadastrada'}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchTerm || filterTipo !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Clique em "Nova Rota" para começar'}
          </p>
        </div>
      )}

      {/* Create Ronda Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Rota de Ronda</DialogTitle>
            <DialogDescription>
              Configure os pontos de verificação, associe um cliente e selecione os vigilantes responsáveis.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Rota *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Ronda Noturna - Bloco A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente/Empresa *</Label>
                <Select
                  value={formData.idCliente.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, idCliente: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.idCliente} value={cliente.idCliente.toString()}>
                        {cliente.nomeEmpresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Ronda */}
              <div className="border-t pt-4">
                <div className="mb-3">
                  <Label className="text-base">Tipo de Ronda *</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecione o tipo de verificação que será realizada
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'interna' })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.tipo === 'interna'
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-border bg-card hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`p-2 rounded-lg ${
                          formData.tipo === 'interna' ? 'bg-blue-500/10' : 'bg-gray-100'
                        }`}
                      >
                        <Building2
                          className={`size-6 ${
                            formData.tipo === 'interna' ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            formData.tipo === 'interna' ? 'text-primary-700' : 'text-foreground'
                          }`}
                        >
                          Interna
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Dentro do estabelecimento</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'externa' })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.tipo === 'externa'
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-border bg-card hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`p-2 rounded-lg ${
                          formData.tipo === 'externa' ? 'bg-blue-500/10' : 'bg-gray-100'
                        }`}
                      >
                        <Navigation
                          className={`size-6 ${
                            formData.tipo === 'externa' ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            formData.tipo === 'externa' ? 'text-primary-700' : 'text-foreground'
                          }`}
                        >
                          Externa
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Perímetro externo</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'supervisao' })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.tipo === 'supervisao'
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-border bg-card hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`p-2 rounded-lg ${
                          formData.tipo === 'supervisao' ? 'bg-blue-500/10' : 'bg-gray-100'
                        }`}
                      >
                        <ClipboardCheck
                          className={`size-6 ${
                            formData.tipo === 'supervisao' ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            formData.tipo === 'supervisao' ? 'text-primary-700' : 'text-foreground'
                          }`}
                        >
                          Supervisão
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Verificação geral</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Horário */}
              <div className="border-t pt-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-1">Horário de Funcionamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Defina quando os vigilantes podem executar esta ronda
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="horarioInicio">Horário de Início</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="horarioInicio"
                        type="time"
                        value={formData.horarioInicio}
                        onChange={(e) =>
                          setFormData({ ...formData, horarioInicio: e.target.value })
                        }
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horarioFim">Horário de Término</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="horarioFim"
                        type="time"
                        value={formData.horarioFim}
                        onChange={(e) => setFormData({ ...formData, horarioFim: e.target.value })}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dias da Semana</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeekOptions.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDayOfWeek(day.value)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          formData.diasSemana?.includes(day.value)
                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                            : 'border-border bg-card text-muted-foreground hover:border-gray-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vigilantes */}
              <div className="border-t pt-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    <Users className="size-5 text-green-600" />
                    Vigilantes Responsáveis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecione os vigilantes que poderão executar esta rota
                  </p>
                </div>

                <div className="space-y-3">
                  {vigias.filter((v) => v.ativo).length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-muted rounded-lg border border-border">
                      {vigias
                        .filter((v) => v.ativo)
                        .map((vigia) => (
                          <label
                            key={vigia.idUsuario}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              formData.vigias?.includes(vigia.idUsuario)
                                ? 'border-green-500 bg-emerald-500/100/10'
                                : 'border-border bg-card hover:border-gray-300'
                            }`}
                          >
                            <Checkbox
                              checked={formData.vigias?.includes(vigia.idUsuario)}
                              onCheckedChange={(checked) => {
                                const current = formData.vigias || [];
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    vigias: [...current, vigia.idUsuario],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    vigias: current.filter((id) => id !== vigia.idUsuario),
                                  });
                                }
                              }}
                            />
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-medium">
                              {vigia.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{vigia.nome}</p>
                              <p className="text-xs text-muted-foreground">{vigia.email}</p>
                            </div>
                          </label>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg border-2 border-dashed border-gray-300">
                      <UserCheck className="size-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">Nenhum vigilante ativo disponível</p>
                      <p className="text-xs">Cadastre vigilantes primeiro</p>
                    </div>
                  )}

                  {formData.vigias && formData.vigias.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-emerald-500/100/10 border border-emerald-500/20 p-3 rounded-lg">
                      <UserCheck className="size-4" />
                      <span className="font-medium">
                        {formData.vigias.length} vigilante(s) selecionado(s)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pontos de Verificação */}
            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground mb-1">Pontos de Verificação *</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione os pontos que devem ser verificados durante a ronda
                </p>
              </div>

              {/* Add Point Form */}
              <div className="bg-muted p-4 rounded-lg space-y-3 mb-4">
                <div className="grid grid-cols-[1fr,200px,auto] gap-2">
                  <Input
                    placeholder="Nome do ponto (Ex: Portaria Principal)"
                    value={pontoForm.nome}
                    onChange={(e) => setPontoForm({ ...pontoForm, nome: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPonto())}
                  />
                  <Select
                    value={pontoForm.tipo}
                    onValueChange={(value: any) => setPontoForm({ ...pontoForm, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qrcode">
                        <div className="flex items-center gap-2">
                          <QrCode className="size-4" />
                          QR Code
                        </div>
                      </SelectItem>
                      <SelectItem value="photo">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="size-4" />
                          Foto
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addPonto}
                    className="bg-primary hover:opacity-90"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                {/* Coordenadas GPS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Latitude (opcional)</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Ex: -23.550520"
                      value={pontoForm.latitude || ''}
                      onChange={(e) =>
                        setPontoForm({
                          ...pontoForm,
                          latitude: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Longitude (opcional)</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Ex: -46.633308"
                      value={pontoForm.longitude || ''}
                      onChange={(e) =>
                        setPontoForm({
                          ...pontoForm,
                          longitude: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary-50 border border-primary-200 p-2 rounded">
                  <MapPin className="size-3 text-primary" />
                  <span>As coordenadas GPS permitem mostrar o mapa e navegação para o vigilante</span>
                </div>
              </div>

              {/* Points List */}
              <div className="space-y-2">
                {formData.pontos && formData.pontos.length > 0 ? (
                  formData.pontos.map((ponto, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-primary-700 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        {getPontoTypeIcon(ponto.tipo)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{ponto.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {ponto.tipo === 'qrcode' && 'Verificação por QR Code'}
                          {ponto.tipo === 'photo' && 'Verificação por Foto'}
                        </p>
                        {ponto.latitude && ponto.longitude && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            📍 {ponto.latitude.toFixed(6)}, {ponto.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePonto(index)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg border-2 border-dashed border-gray-300">
                    <MapPin className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">Nenhum ponto adicionado</p>
                    <p className="text-xs">Use o formulário acima para adicionar pontos</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:opacity-90">
                Criar Rota
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Ronda Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Rota</DialogTitle>
            <DialogDescription>Visualize todas as informações desta rota de ronda</DialogDescription>
          </DialogHeader>

          {selectedRonda && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Nome da Rota</Label>
                <p className="font-medium">{selectedRonda.nome}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Cliente</Label>
                <p className="font-medium">{getClienteNome(selectedRonda.idCliente)}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Tipo</Label>
                <Badge className={getTipoColor(selectedRonda.tipo)}>
                  {getTipoLabel(selectedRonda.tipo)}
                </Badge>
              </div>

              {selectedRonda.horarioInicio && selectedRonda.horarioFim && (
                <div>
                  <Label className="text-muted-foreground">Horário</Label>
                  <p className="font-medium">
                    {selectedRonda.horarioInicio} - {selectedRonda.horarioFim}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Pontos de Verificação ({selectedRonda.pontos?.length || 0})
                </Label>
                <div className="space-y-2">
                  {selectedRonda.pontos?.map((ponto, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-primary-700 text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        {getPontoTypeIcon(ponto.tipo)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{ponto.nome}</p>
                        {ponto.latitude && ponto.longitude && (
                          <p className="text-xs text-muted-foreground font-mono">
                            📍 {ponto.latitude.toFixed(6)}, {ponto.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
