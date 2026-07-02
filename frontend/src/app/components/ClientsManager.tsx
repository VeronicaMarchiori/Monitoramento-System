import { useState, useEffect } from 'react';
import { Building2, Plus, Search, MapPin, Phone, Mail, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:3001';
const API_EMPRESAS = `${API_BASE}/empresas`;
const API_RONDAS = `${API_BASE}/rondas`;
const getAuth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('vigiasystem_token')}` });

interface Client {
  id: string; name: string; cnpj: string; address: string;
  phone: string; email: string; contactPerson: string; activeRoutes: number; createdAt: string;
}

const mapBE = (e: any): Client => ({
  id: e.idEmpresa?.toString() ?? e.id,
  name: e.nome ?? e.nomeFantasia ?? e.razaoSocial ?? '',
  cnpj: e.cnpj ?? '', address: e.endereco ?? '',
  phone: e.telefone ?? '', email: e.email ?? '',
  contactPerson: e.responsavel ?? e.pessoaContato ?? '',
  activeRoutes: e.rotasAtivas ?? 0,
  createdAt: e.createdAt ?? e.dataCriacao ?? new Date().toISOString(),
});

const MOCK: Client[] = [
  { id: '1', name: 'Shopping Center Norte', cnpj: '12.345.678/0001-90', address: 'Av. Principal, 1000 — Centro', phone: '(11) 3333-4444', email: 'contato@shopping.com.br', contactPerson: 'Roberto Alves', activeRoutes: 3, createdAt: new Date().toISOString() },
  { id: '2', name: 'Condomínio Residencial Jardins', cnpj: '98.765.432/0001-10', address: 'Rua das Flores, 200 — Jardim Sul', phone: '(11) 4444-5555', email: 'adm@condominioxyz.com.br', contactPerson: 'Fernanda Lima', activeRoutes: 2, createdAt: new Date().toISOString() },
  { id: '3', name: 'Fábrica Industrial ABC', cnpj: '11.222.333/0001-44', address: 'Rodovia Anhanguera Km 30', phone: '(11) 5555-6666', email: 'seguranca@fabrica.com.br', contactPerson: 'Eduardo Costa', activeRoutes: 4, createdAt: new Date().toISOString() },
  { id: '4', name: 'Hospital São Lucas', cnpj: '55.444.333/0001-22', address: 'Av. Saúde, 500 — Vila Médica', phone: '(11) 6666-7777', email: 'seguranca@saolucas.com.br', contactPerson: 'Patricia Souza', activeRoutes: 5, createdAt: new Date().toISOString() },
];

const PAGE_SIZE = 8;
const blank = { name: '', cnpj: '', address: '', phone: '', email: '', contactPerson: '' };

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [form, setForm] = useState(blank);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [cR, rR] = await Promise.allSettled([
        fetch(API_EMPRESAS, { headers: getAuth() }),
        fetch(API_RONDAS, { headers: getAuth() }),
      ]);
      if (cR.status === 'fulfilled' && cR.value.ok) {
        const d = await cR.value.json();
        if (d.success && d.data) { setClients(d.data.map(mapBE)); return; }
      }
      setClients(MOCK);
      toast.info('Modo demonstração — backend indisponível');
    } catch { setClients(MOCK); toast.info('Modo demonstração — backend indisponível'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_EMPRESAS, { method: 'POST', headers: getAuth(), body: JSON.stringify({ nome: form.name, nomeFantasia: form.name, razaoSocial: form.name, cnpj: form.cnpj, endereco: form.address, telefone: form.phone, email: form.email, responsavel: form.contactPerson }) });
      if (res.ok) { const d = await res.json(); if (d.success && d.data) { setClients(prev => [mapBE(d.data), ...prev]); } }
      else throw new Error();
    } catch {
      setClients(prev => [{ id: Date.now().toString(), ...form, activeRoutes: 0, createdAt: new Date().toISOString() }, ...prev]);
    }
    setCreateOpen(false); setForm(blank); toast.success('Cliente cadastrado!');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try { await fetch(`${API_EMPRESAS}/${editTarget.id}`, { method: 'PUT', headers: getAuth(), body: JSON.stringify({ nome: editTarget.name, cnpj: editTarget.cnpj, endereco: editTarget.address, telefone: editTarget.phone, email: editTarget.email, responsavel: editTarget.contactPerson }) }); } catch {}
    setClients(prev => prev.map(c => c.id === editTarget.id ? editTarget : c));
    setEditOpen(false); setEditTarget(null); toast.success('Cliente atualizado!');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await fetch(`${API_EMPRESAS}/${deleteTarget.id}`, { method: 'DELETE', headers: getAuth() }); } catch {}
    setClients(prev => prev.filter(c => c.id !== deleteTarget.id));
    setDeleteOpen(false); setDeleteTarget(null); toast.success('Cliente removido!');
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.cnpj?.includes(q) || c.contactPerson?.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const inputCls = 'w-full h-9 px-3 rounded-lg text-[13px] text-foreground bg-background border border-border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-muted-foreground';

  const FormFields = ({ data, setData }: { data: any; setData: any }) => (
    <div className="space-y-3 mt-2">
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-foreground">Nome da empresa *</label>
        <input className={inputCls} value={data.name ?? ''} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Ex: Shopping Center Norte" required />
      </div>
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-foreground">CNPJ *</label>
        <input className={inputCls} value={data.cnpj ?? ''} onChange={e => setData({ ...data, cnpj: e.target.value })} placeholder="00.000.000/0000-00" required />
      </div>
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-foreground">Endereço *</label>
        <input className={inputCls} value={data.address ?? ''} onChange={e => setData({ ...data, address: e.target.value })} placeholder="Rua, número, bairro, cidade" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-foreground">Telefone *</label>
          <input className={inputCls} value={data.phone ?? ''} onChange={e => setData({ ...data, phone: e.target.value })} placeholder="(00) 0000-0000" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-foreground">E-mail *</label>
          <input className={inputCls} type="email" value={data.email ?? ''} onChange={e => setData({ ...data, email: e.target.value })} placeholder="contato@empresa.com" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-foreground">Pessoa de contato *</label>
        <input className={inputCls} value={data.contactPerson ?? ''} onChange={e => setData({ ...data, contactPerson: e.target.value })} placeholder="Nome do responsável" required />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Empresas e estabelecimentos atendidos pelo serviço de rondas</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nova Empresa
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de Empresas', value: clients.length, color: 'text-foreground' },
          { label: 'Rotas Ativas', value: clients.reduce((s, c) => s + c.activeRoutes, 0), color: 'text-blue-600' },
          { label: 'Com Ronda Hoje', value: Math.floor(clients.length * 0.7), color: 'text-emerald-600' },
          { label: 'Sem Ronda Hoje', value: Math.ceil(clients.length * 0.3), color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-3">
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 max-w-md">
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome, CNPJ ou responsável..." className="flex-1 bg-transparent text-[13px] outline-none text-foreground placeholder:text-muted-foreground" />
        {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Empresa', 'CNPJ', 'Endereço', 'Telefone', 'E-mail', 'Rotas', 'Ações'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-4 first:pl-5 last:pr-5"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              )) : paged.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhuma empresa encontrada</p>
                </td></tr>
              ) : paged.map(c => (
                <tr key={c.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.contactPerson}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className="text-[12px] text-muted-foreground font-mono">{c.cnpj}</span></td>
                  <td className="px-4 py-3.5 max-w-[200px]"><p className="text-[12px] text-muted-foreground truncate">{c.address}</p></td>
                  <td className="px-4 py-3.5"><span className="text-[12px] text-muted-foreground whitespace-nowrap">{c.phone}</span></td>
                  <td className="px-4 py-3.5"><span className="text-[12px] text-muted-foreground">{c.email}</span></td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[11px] font-semibold rounded-full">
                      {c.activeRoutes} {c.activeRoutes === 1 ? 'rota' : 'rotas'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 pr-5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditTarget({ ...c }); setEditOpen(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-950/30 text-muted-foreground hover:text-blue-600 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setDeleteTarget(c); setDeleteOpen(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-[12px] text-muted-foreground">{Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–{Math.min(page*PAGE_SIZE,filtered.length)} de {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium transition-colors ${p===page?'bg-blue-600 text-white':'hover:bg-accent text-foreground border border-border'}`}>{p}</button>)}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova Empresa</DialogTitle><DialogDescription>Preencha os dados do cliente</DialogDescription></DialogHeader>
          <form onSubmit={handleCreate}><FormFields data={form} setData={setForm} /><div className="flex gap-3 mt-5"><button type="button" onClick={() => setCreateOpen(false)} className="flex-1 h-9 rounded-lg border border-border text-[13px] font-medium hover:bg-accent transition-colors">Cancelar</button><button type="submit" className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors">Cadastrar</button></div></form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Empresa</DialogTitle><DialogDescription>Altere os dados do cliente</DialogDescription></DialogHeader>
          {editTarget && <form onSubmit={handleEdit}><FormFields data={editTarget} setData={setEditTarget} /><div className="flex gap-3 mt-5"><button type="button" onClick={() => setEditOpen(false)} className="flex-1 h-9 rounded-lg border border-border text-[13px] font-medium hover:bg-accent transition-colors">Cancelar</button><button type="submit" className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors">Salvar</button></div></form>}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle><DialogDescription>Esta ação não pode ser desfeita.</DialogDescription></DialogHeader>
          <div className="py-3 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-red-600" /></div>
            <p className="text-sm text-foreground">Deseja remover <strong>{deleteTarget?.name}</strong>?</p>
          </div>
          <div className="flex gap-3"><button onClick={() => setDeleteOpen(false)} className="flex-1 h-9 rounded-lg border border-border text-[13px] font-medium hover:bg-accent transition-colors">Cancelar</button><button onClick={handleDelete} className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors">Excluir</button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
