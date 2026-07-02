import { useState } from 'react';
import {
  FileText, CheckCircle, AlertTriangle, Clock, TrendingUp,
  Download, Eye, ChevronLeft, ChevronRight, Search, X,
  QrCode, Camera, MapPin, XCircle,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

const PAGE_SIZE = 8;

const formatDate = (ds: string) =>
  new Date(ds).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatDuration = (m: number) => {
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}min` : `${m % 60}min`;
};

const exportPDF = (report: any) => {
  const win = window.open('', '_blank');
  if (!win) { toast.error('Bloqueador de pop-up detectado. Permita pop-ups para exportar.'); return; }
  const ok = report.pointsChecked.filter((p: any) => p.status === 'success').length;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório — ${report.routeName}</title>
  <style>body{font-family:Arial,sans-serif;color:#111;max-width:210mm;margin:0 auto;padding:20px;line-height:1.5}h1{color:#1e3a8a;border-bottom:2px solid #1e3a8a;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:12px 0}th{background:#1e3a8a;color:#fff;padding:8px;font-size:11px;text-align:left}td{padding:8px;border-bottom:1px solid #e5e7eb;font-size:11px}.badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}.ok{background:#d1fae5;color:#065f46}.fail{background:#fee2e2;color:#991b1b}.footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:12px;text-align:center;font-size:10px;color:#6b7280}.no-print{text-align:center;margin-top:20px}@media print{.no-print{display:none}}</style>
  </head><body>
  <h1>RELATÓRIO DE RONDA</h1>
  <p><strong>${report.routeName}</strong> · ${report.establishmentName}</p>
  <table><tr><th>Vigia</th><th>Início</th><th>Término</th><th>Duração</th><th>Conclusão</th><th>Pontos OK</th></tr>
  <tr><td>${report.guardName}</td><td>${formatDate(report.startTime)}</td><td>${formatDate(report.endTime)}</td><td>${formatDuration(report.duration)}</td><td>${report.completionRate}%</td><td>${ok}/${report.pointsChecked.length}</td></tr></table>
  <h2>Pontos de Verificação</h2>
  <table><tr><th>#</th><th>Ponto</th><th>Status</th><th>Data/Hora</th><th>Obs</th></tr>
  ${report.pointsChecked.map((p: any, i: number) => `<tr><td>${i+1}</td><td>${p.pointName}</td><td><span class="badge ${p.status==='success'?'ok':'fail'}">${p.status==='success'?'OK':'Falha'}</span></td><td>${formatDate(p.checkedAt)}</td><td>${p.note??''}</td></tr>`).join('')}
  </table>
  ${report.occurrences.length?`<h2>Ocorrências</h2><table><tr><th>Tipo</th><th>Severidade</th><th>Status</th><th>Descrição</th></tr>${report.occurrences.map((o:any)=>`<tr><td>${o.type}</td><td>${o.severity}</td><td>${o.resolved?'Resolvida':'Pendente'}</td><td>${o.description}</td></tr>`).join('')}</table>`:''}
  <div class="footer">VigiaSystem · Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
  <div class="no-print"><button onclick="window.print()" style="background:#1e3a8a;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px">Imprimir / Salvar PDF</button></div>
  </body></html>`);
  win.document.close();
  toast.success('Relatório aberto para impressão!');
};

const exportAllPDF = (reports: any[]) => {
  reports.forEach((r, i) => setTimeout(() => exportPDF(r), i * 600));
  setTimeout(() => toast.success(`${reports.length} relatórios exportados!`), reports.length * 600 + 500);
};

const exportExcel = (reports: any[]) => {
  const rows = [
    ['Vigia', 'Empresa', 'Rota', 'Início', 'Término', 'Duração', 'Conclusão', 'Pontos OK', 'Ocorrências'],
    ...reports.map(r => [
      r.guardName, r.establishmentName, r.routeName,
      formatDate(r.startTime), formatDate(r.endTime),
      formatDuration(r.duration), `${r.completionRate}%`,
      `${r.pointsChecked.filter((p: any) => p.status === 'success').length}/${r.pointsChecked.length}`,
      r.occurrences.length,
    ]),
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `relatorios_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success('Planilha exportada com sucesso!');
};

const mockRoundReports: any[] = [];

const getReportStats = () => ({
  totalRounds: 0,
  completedRounds: 0,
  averageTime: "0h",
  totalOccurrences: 0,
});

export function ReportsManager() {
  const [guardFilter, setGuardFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const stats = getReportStats();

  const guards = Array.from(new Set(mockRoundReports.map((r: any) => r.guardName)));
  const companies = Array.from(new Set(mockRoundReports.map((r: any) => r.establishmentName)));

  const filtered = (mockRoundReports as any[]).filter(r => {
    const q = search.toLowerCase();
    return (!q || r.routeName.toLowerCase().includes(q) || r.guardName.toLowerCase().includes(q) || r.establishmentName.toLowerCase().includes(q))
      && (guardFilter === 'all' || r.guardName === guardFilter)
      && (companyFilter === 'all' || r.establishmentName === companyFilter)
      && (statusFilter === 'all' || r.status === statusFilter)
      && (!dateFrom || r.startTime >= dateFrom);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const inputCls = 'h-9 px-3 rounded-lg text-[12px] text-foreground bg-background border border-border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Histórico completo de rondas realizadas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportExcel(filtered)} className="flex items-center gap-2 px-4 h-9 border border-border bg-card hover:bg-accent text-foreground text-[13px] font-medium rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Exportar Excel
          </button>
          <button onClick={() => exportAllPDF(filtered)} className="flex items-center gap-2 px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de Rondas', value: stats.total, Icon: FileText, color: 'text-blue-600', bg: 'bg-blue-500/10 dark:bg-blue-950/30' },
          { label: 'Taxa Média', value: `${stats.avgCompletionRate}%`, Icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10 dark:bg-emerald-950/30' },
          { label: 'Tempo Médio', value: formatDuration(stats.avgDuration), Icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10 dark:bg-amber-950/30' },
          { label: 'Ocorrências', value: stats.totalOccurrences, Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-500/10 dark:bg-red-950/30' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <s.Icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar ronda, vigia, empresa..." className="flex-1 bg-transparent text-[13px] outline-none text-foreground placeholder:text-muted-foreground" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <Select value={guardFilter} onValueChange={v => { setGuardFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-44 text-[12px]"><SelectValue placeholder="Vigia" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos os vigias</SelectItem>{guards.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={companyFilter} onValueChange={v => { setCompanyFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-44 text-[12px]"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todas as empresas</SelectItem>{companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-40 text-[12px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="partial">Com problemas</SelectItem>
          </SelectContent>
        </Select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className={`${inputCls} w-36`} />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Rota / Empresa', 'Vigia', 'Início', 'Duração', 'Conclusão', 'Pontos', 'Ocorrências', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhum relatório encontrado</p>
                </td></tr>
              ) : paged.map((r: any) => {
                const okPts = r.pointsChecked.filter((p: any) => p.status === 'success').length;
                return (
                  <tr key={r.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3.5 pl-5">
                      <p className="text-[13px] font-medium text-foreground">{r.routeName}</p>
                      <p className="text-[11px] text-muted-foreground">{r.establishmentName}</p>
                    </td>
                    <td className="px-4 py-3.5"><p className="text-[12px] text-foreground whitespace-nowrap">{r.guardName}</p></td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-[12px] text-foreground">{new Date(r.startTime).toLocaleDateString('pt-BR')}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(r.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-[12px] text-muted-foreground font-mono">{formatDuration(r.duration)}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500/100" style={{ width: `${r.completionRate}%` }} />
                        </div>
                        <span className="text-[12px] font-medium text-foreground">{r.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] text-muted-foreground font-mono">{okPts}/{r.pointsChecked.length}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.occurrences.length > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                        {r.occurrences.length} {r.occurrences.length === 1 ? 'ocorrência' : 'ocorrências'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {r.status === 'completed' ? 'Concluído' : 'Com problemas'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 pr-5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(r)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-950/30 text-muted-foreground hover:text-blue-600 transition-colors" title="Ver detalhes">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => exportPDF(r)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-950/30 text-muted-foreground hover:text-emerald-600 transition-colors" title="Exportar PDF">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-[12px] text-muted-foreground">{Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–{Math.min(page*PAGE_SIZE,filtered.length)} de {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-accent"><ChevronLeft className="w-3.5 h-3.5" /></button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium ${p===page?'bg-blue-600 text-white':'hover:bg-accent text-foreground border border-border'}`}>{p}</button>)}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-accent"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.routeName}</DialogTitle>
            <DialogDescription>{selected?.establishmentName} · {selected?.guardName}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 mt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Início', value: formatDate(selected.startTime) },
                  { label: 'Término', value: formatDate(selected.endTime) },
                  { label: 'Duração', value: formatDuration(selected.duration) },
                  { label: 'Conclusão', value: `${selected.completionRate}%` },
                ].map(f => (
                  <div key={f.label} className="bg-muted rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{f.label}</p>
                    <p className="text-[13px] font-semibold text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-[12px] font-semibold text-foreground mb-3">Pontos de Verificação ({selected.pointsChecked.length})</h4>
                <div className="space-y-2">
                  {selected.pointsChecked.map((pt: any, i: number) => (
                    <div key={pt.pointId ?? i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${pt.status === 'success' ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/20 dark:border-emerald-800' : 'bg-red-500/10 dark:bg-red-950/20 border-red-500/20 dark:border-red-800'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${pt.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground">{pt.pointName}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDate(pt.checkedAt)}</p>
                        {pt.note && <p className="text-[11px] text-red-600 mt-0.5">⚠ {pt.note}</p>}
                      </div>
                      {pt.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {selected.occurrences.length > 0 && (
                <div>
                  <h4 className="text-[12px] font-semibold text-foreground mb-3">Ocorrências ({selected.occurrences.length})</h4>
                  {selected.occurrences.map((occ: any) => (
                    <div key={occ.id} className="px-3 py-3 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-800 rounded-lg mb-2">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[13px] font-medium text-foreground">{occ.type}</p>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${occ.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{occ.resolved ? 'Resolvida' : 'Pendente'}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">{occ.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button onClick={() => setSelected(null)} className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium hover:bg-accent transition-colors">Fechar</button>
                <button onClick={() => { exportPDF(selected); setSelected(null); }} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Exportar PDF
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
