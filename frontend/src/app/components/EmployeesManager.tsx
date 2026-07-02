import { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Edit2, Trash2,
  Mail, Phone, CreditCard, Lock, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  role: 'admin' | 'guard';
  active: boolean;
  createdAt?: string;
}

const API_BASE_URL = 'http://localhost:3001';
const getAuthHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('vigiasystem_token')}` });
const getApiUrl = (role: 'admin' | 'guard', id?: string) => {
  const base = role === 'admin' ? `${API_BASE_URL}/administradores` : `${API_BASE_URL}/vigias`;
  return id ? `${base}/${id}` : base;
};

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Admin Sistema', email: 'admin@admin.com', cpf: '000.000.000-00', phone: '(11) 99999-0000', role: 'admin', active: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'Carlos Silva', email: 'carlos@vigia.com', cpf: '111.222.333-44', phone: '(11) 98888-1111', role: 'guard', active: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Maria Santos', email: 'maria@vigia.com', cpf: '222.333.444-55', phone: '(11) 97777-2222', role: 'guard', active: true, createdAt: new Date().toISOString() },
  { id: '4', name: 'João Oliveira', email: 'joao@vigia.com', cpf: '333.444.555-66', phone: '(11) 96666-3333', role: 'guard', active: false, createdAt: new Date().toISOString() },
  { id: '5', name: 'Ana Lima', email: 'ana@vigia.com', cpf: '444.555.666-77', phone: '(11) 95555-4444', role: 'guard', active: true, createdAt: new Date().toISOString() },
];

const PAGE_SIZE = 8;

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

export function EmployeesManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: '', email: '', cpf: '', phone: '', role: 'guard' as 'admin' | 'guard', password: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [vigRes, admRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/vigias`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/administradores`, { headers: getAuthHeaders() }),
      ]);
      const all: Employee[] = [];
      if (vigRes.status === 'fulfilled' && vigRes.value.ok) {
        const d = await vigRes.value.json();
        if (d.success && d.data) all.push(...d.data.map((u: any) => ({
          id: u.idUsuario?.toString() ?? u.id, name: u.Usuario?.nome ?? u.nome,
          email: u.Usuario?.email ?? u.email, cpf: u.Usuario?.cpf ?? u.cpf,
          phone: u.Usuario?.telefone ?? u.telefone, role: 'guard' as const,
          active: u.Usuario?.ativo ?? u.ativo ?? true, createdAt: u.createdAt,
        })));
      }
      if (admRes.status === 'fulfilled' && admRes.value.ok) {
        const d = await admRes.value.json();
        if (d.success && d.data) all.push(...d.data.map((u: any) => ({
          id: u.idUsuario?.toString() ?? u.id, name: u.Usuario?.nome ?? u.nome,
          email: u.Usuario?.email ?? u.email, cpf: u.Usuario?.cpf ?? u.cpf,
          phone: u.Usuario?.telefone ?? u.telefone, role: 'admin' as const,
          active: u.Usuario?.ativo ?? u.ativo ?? true, createdAt: u.createdAt,
        })));
      }
      setEmployees(all.length ? all : MOCK_EMPLOYEES);
      if (!all.length) toast.info('Modo demonstração — backend indisponível');
    } catch {
      setEmployees(MOCK_EMPLOYEES);
      toast.info('Modo demonstração — backend indisponível');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Senha deve ter mínimo 6 caracteres'); return; }
    try {
      const res = await fetch(getApiUrl(form.role), {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ login: form.email, nome: form.name, email: form.email, cpf: form.cpf, telefone: form.phone, senha: form.password, tipo: form.role === 'admin' ? 'administrador' : 'vigia' }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setEmployees(prev => [{ id: Date.now().toString(), ...form, active: true, createdAt: new Date().toISOString() }, ...prev]);
    }
    setCreateOpen(false);
    setForm({ name: '', email: '', cpf: '', phone: '', role: 'guard', password: '' });
    toast.success('Funcionário cadastrado!');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      await fetch(getApiUrl(editTarget.role, editTarget.id), {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({ nome: editTarget.name, email: editTarget.email, cpf: editTarget.cpf, telefone: editTarget.phone }),
      });
    } catch {}
    setEmployees(prev => prev.map(e => e.id === editTarget.id ? editTarget : e));
    setEditOpen(false);
    setEditTarget(null);
    toast.success('Funcionário atualizado!');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(getApiUrl(deleteTarget.role, deleteTarget.id), { method: 'DELETE', headers: getAuthHeaders() });
    } catch {}
    setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
    toast.success('Funcionário removido!');
  };

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.cpf?.includes(q);
    const matchRole = roleFilter === 'all' || e.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? e.active : !e.active);
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const roleLabel = (r: string) => r === 'admin' ? 'Administrador' : 'Vigilante';
  const roleBadge = (r: string) => r === 'admin'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );

  const inputCls = 'w-full h-9 px-3 rounded-lg text-[13px] text-foreground bg-background border border-border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-muted-foreground';

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Funcionários</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie a equipe de vigilância e segurança</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: employees.length, color: 'text-foreground' },
          { label: 'Administradores', value: employees.filter(e => e.role === 'admin').length, color: 'text-blue-600' },
          { label: 'Vigilantes', value: employees.filter(e => e.role === 'guard').length, color: 'text-slate-600' },
          { label: 'Ativos', value: employees.filter(e => e.active).length, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-3">
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome, email ou CPF..."
            className="flex-1 bg-transparent text-[13px] outline-none text-foreground placeholder:text-muted-foreground"
          />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-40 text-[13px]">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="guard">Vigilante</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-36 text-[13px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Nome', 'CPF', 'Cargo', 'Telefone', 'E-mail', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5 first:pl-5 last:pr-5">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              )) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Nenhum funcionário encontrado</p>
                    <p className="text-xs text-muted-foreground mt-1">Tente ajustar os filtros de busca</p>
                  </td>
                </tr>
              ) : paged.map(emp => (
                <tr key={emp.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                        {emp.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-medium text-foreground">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] text-muted-foreground font-mono">{emp.cpf}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleBadge(emp.role)}`}>
                      {roleLabel(emp.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] text-muted-foreground">{emp.phone ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] text-muted-foreground">{emp.email}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      emp.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${emp.active ? 'bg-emerald-500/100' : 'bg-slate-400'}`} />
                      {emp.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 pr-5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditTarget({ ...emp }); setEditOpen(true); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-950/30 text-muted-foreground hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(emp); setDeleteOpen(true); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-[12px] text-muted-foreground">
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium transition-colors ${
                    p === page ? 'bg-blue-600 text-white' : 'hover:bg-accent text-foreground border border-border'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Funcionário</DialogTitle>
            <DialogDescription>Preencha os dados do novo membro da equipe</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Nome completo *">
                <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do funcionário" required />
              </FieldRow>
              <FieldRow label="Função *">
                <select className={inputCls} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })}>
                  <option value="guard">Vigilante</option>
                  <option value="admin">Administrador</option>
                </select>
              </FieldRow>
            </div>
            <FieldRow label="E-mail *">
              <input className={inputCls} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com" required />
            </FieldRow>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="CPF *">
                <input className={inputCls} value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" required />
              </FieldRow>
              <FieldRow label="Telefone">
                <input className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
              </FieldRow>
            </div>
            <FieldRow label="Senha temporária *">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input className={`${inputCls} pl-9`} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" required />
              </div>
            </FieldRow>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="flex-1 h-9 rounded-lg border border-border text-[13px] font-medium hover:bg-accent transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors">Cadastrar</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
            <DialogDescription>Altere os dados do funcionário</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Nome completo *">
                  <input className={inputCls} value={editTarget.name} onChange={e => setEditTarget({ ...editTarget, name: e.target.value })} required />
                </FieldRow>
                <FieldRow label="Função">
                  <input className={`${inputCls} opacity-60`} value={roleLabel(editTarget.role)} readOnly />
                </FieldRow>
              </div>
              <FieldRow label="E-mail *">
                <input className={inputCls} type="email" value={editTarget.email} onChange={e => setEditTarget({ ...editTarget, email: e.target.value })} required />
              </FieldRow>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="CPF *">
                  <input className={inputCls} value={editTarget.cpf} onChange={e => setEditTarget({ ...editTarget, cpf: e.target.value })} required />
                </FieldRow>
                <FieldRow label="Telefone">
                  <input className={inputCls} value={editTarget.phone ?? ''} onChange={e => setEditTarget({ ...editTarget, phone: e.target.value })} />
                </FieldRow>
              </div>
              <div className="px-4 py-3 bg-blue-500/10 dark:bg-blue-950/30 border border-blue-500/20 dark:border-blue-800 rounded-lg">
                <p className="text-[12px] text-blue-700 dark:text-blue-400">A senha não pode ser alterada por aqui. O funcionário deve usar "Esqueci minha senha" no login.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditOpen(false)} className="flex-1 h-9 rounded-lg border border-border text-[13px] font-medium hover:bg-accent transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors">Salvar</button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-center text-foreground">
              Deseja remover permanentemente <strong>{deleteTarget?.name}</strong>?
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteOpen(false)} className="flex-1 h-9 rounded-lg border border-border text-[13px] font-medium hover:bg-accent transition-colors">Cancelar</button>
            <button onClick={handleDelete} className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors">Excluir</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
