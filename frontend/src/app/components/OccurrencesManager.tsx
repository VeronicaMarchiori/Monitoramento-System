import { useState } from 'react';
import { AlertTriangle, Search, X, Siren, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface Occurrence {
  id: number; type: string; date: string; time: string;
  guard: string; company: string; route: string; location: string;
  status: 'open' | 'in_progress' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'emergency';
  isSOS: boolean; description: string;
}

const MOCK: Occurrence[] = [
  { id: 1, type: 'Atividade Suspeita', date: '2024-01-15', time: '14:32', guard: 'Carlos Silva', company: 'Shopping Norte', route: 'Perímetro Externo', location: 'Estacionamento B3', status: 'open', severity: 'high', isSOS: false, description: 'Indivíduo circulando pelo estacionamento durante horário não usual, verificando veículos.' },
  { id: 2, type: 'Dano ao Patrimônio', date: '2024-01-15', time: '11:18', guard: 'Maria Santos', company: 'Condomínio Jardins', route: 'Ronda Interna', location: 'Portaria Principal', status: 'in_progress', severity: 'medium', isSOS: false, description: 'Vidro da guarita danificado. Necessário acionamento de manutenção.' },
  { id: 3, type: 'Emergência — Acidente', date: '2024-01-14', time: '23:45', guard: 'João Oliveira', company: 'Fábrica ABC', route: 'Ronda Noturna', location: 'Setor B — Galpão 3', status: 'resolved', severity: 'emergency', isSOS: true, description: 'Queda de funcionário durante ronda noturna. SAMU acionado. Funcionário atendido e liberado.' },
  { id: 4, type: 'Acesso Não Autorizado', date: '2024-01-14', time: '18:55', guard: 'Ana Lima', company: 'Shopping Norte', route: 'Área Restrita', location: 'Corredor de Serviço', status: 'resolved', severity: 'high', isSOS: false, description: 'Pessoa sem identificação tentando acessar área de carga. Abordagem realizada.' },
  { id: 5, type: 'Iluminação com Defeito', date: '2024-01-14', time: '20:10', guard: 'Carlos Silva', company: 'Condomínio Jardins', route: 'Ronda Perimetral', location: 'Corredor Leste', status: 'resolved', severity: 'low', isSOS: false, description: 'Lâmpada do corredor leste apagada. Acionada manutenção.' },
  { id: 6, type: 'Veículo Suspeito', date: '2024-01-13', time: '02:20', guard: 'Pedro Costa', company: 'Fábrica ABC', route: 'Ronda Madrugada', location: 'Portão Principal', status: 'open', severity: 'medium', isSOS: false, description: 'Veículo estacionado próximo ao portão há mais de 2h sem movimentação.' },
];

const PAGE_SIZE = 8;
const sevCfg: Record<string, { label: string; cls: string }> = {
  emergency: { label: 'Emergência', cls: 'bg-red-600 text-white' },
  high:      { label: 'Alta',       cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium:    { label: 'Média',      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  low:       { label: 'Baixa',      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};
const staCfg: Record<string, { label: string; cls: string }> = {
  open:        { label: 'Aberta',       cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  in_progress: { label: 'Em andamento', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  resolved:    { label: 'Resolvida',    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

export function OccurrencesManager() {
  const [search, setSearch] = useState('');
  const [companyF, setCompanyF] = useState('all');
  const [typeF, setTypeF] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Occurrence | null>(null);

  const companies = Array.from(new Set(MOCK.map(o => o.company)));
  const types = Array.from(new Set(MOCK.map(o => o.type)));

  const filtered = MOCK.filter(o => {
    const q = search.toLowerCase();
    return (!q || o.type.toLowerCase().includes(q) || o.guard.toLowerCase().includes(q) || o.location.toLowerCase().includes(q))
      && (companyF === 'all' || o.company === companyF)
      && (typeF === 'all' || o.type === typeF)
      && (statusF === 'all' || o.status === statusF)
      && (!dateFrom || o.date >= dateFrom);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ocorrências</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registro e acompanhamento de ocorrências no campo</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 dark:bg-red-950/30 border border-red-500/20 dark:border-red-800 rounded-full">
          <Siren className="w-3.5 h-3.5 text-red-600" />
          <span className="text-[12px] font-semibold text-red-700 dark:text-red-400">{MOCK.filter(o => o.status === 'open').length} abertas</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: MOCK.length, color: 'text-foreground' },
          { label: 'Abertas', value: MOCK.filter(o => o.status === 'open').length, color: 'text-red-600' },
          { label: 'Em andamento', value: MOCK.filter(o => o.status === 'in_progress').length, color: 'text-amber-600' },
          { label: 'Resolvidas', value: MOCK.filter(o => o.status === 'resolved').length, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-3">
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por tipo, vigia ou local..." className="flex-1 bg-transparent text-[13px] outline-none text-foreground placeholder:text-muted-foreground" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <Select value={companyF} onValueChange={v => { setCompanyF(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-44 text-[12px]"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todas as empresas</SelectItem>{companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={typeF} onValueChange={v => { setTypeF(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-48 text-[12px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusF} onValueChange={v => { setStatusF(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-40 text-[12px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Aberta</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="resolved">Resolvida</SelectItem>
          </SelectContent>
        </Select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="h-9 px-3 rounded-lg text-[12px] text-foreground bg-background border border-border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-36" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Tipo', 'Data / Hora', 'Vigia', 'Empresa', 'Local', 'Severidade', 'Status', 'SOS', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center">
                  <AlertTriangle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhuma ocorrência encontrada</p>
                </td></tr>
              ) : paged.map(occ => (
                <tr key={occ.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3.5 pl-5"><p className="text-[13px] font-medium text-foreground whitespace-nowrap">{occ.type}</p></td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-[12px] text-foreground">{new Date(occ.date).toLocaleDateString('pt-BR')}</p>
                    <p className="text-[11px] text-muted-foreground">{occ.time}</p>
                  </td>
                  <td className="px-4 py-3.5"><p className="text-[12px] text-foreground whitespace-nowrap">{occ.guard}</p></td>
                  <td className="px-4 py-3.5"><p className="text-[12px] text-muted-foreground whitespace-nowrap">{occ.company}</p></td>
                  <td className="px-4 py-3.5"><p className="text-[12px] text-muted-foreground">{occ.location}</p></td>
                  <td className="px-4 py-3.5"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${sevCfg[occ.severity].cls}`}>{sevCfg[occ.severity].label}</span></td>
                  <td className="px-4 py-3.5"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${staCfg[occ.status].cls}`}>{staCfg[occ.status].label}</span></td>
                  <td className="px-4 py-3.5 text-center">
                    {occ.isSOS
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full"><Siren className="w-3 h-3" />SOS</span>
                      : <span className="text-muted-foreground text-[12px]">—</span>}
                  </td>
                  <td className="px-4 py-3.5 pr-5">
                    <button onClick={() => setSel(occ)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-950/30 text-muted-foreground hover:text-blue-600 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-[12px] text-muted-foreground">{Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–{Math.min(page*PAGE_SIZE,filtered.length)} de {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium transition-colors ${p===page?'bg-blue-600 text-white':'hover:bg-accent text-foreground border border-border'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!sel} onOpenChange={() => setSel(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {sel?.isSOS && <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1"><Siren className="w-3 h-3" />SOS</span>}
              {sel?.type}
            </DialogTitle>
            <DialogDescription>{sel?.company} · {sel?.route}</DialogDescription>
          </DialogHeader>
          {sel && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                {[{label:'Vigia',value:sel.guard},{label:'Local',value:sel.location},{label:'Data',value:new Date(sel.date).toLocaleDateString('pt-BR')},{label:'Hora',value:sel.time}].map(f=>(
                  <div key={f.label} className="bg-muted rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{f.label}</p>
                    <p className="text-[13px] font-medium text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${sevCfg[sel.severity].cls}`}>{sevCfg[sel.severity].label}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${staCfg[sel.status].cls}`}>{staCfg[sel.status].label}</span>
              </div>
              <div className="bg-muted rounded-lg px-3 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Descrição</p>
                <p className="text-[13px] text-foreground leading-relaxed">{sel.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
