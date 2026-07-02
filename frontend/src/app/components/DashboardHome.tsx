import {
  Users, Building2, Route, AlertTriangle, TrendingUp,
  CheckCircle2, Clock, ArrowUpRight, ArrowDownRight,
  Activity, Wifi, WifiOff, Shield, MapPin, QrCode,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DashboardHomeProps { onNavigate: (view: string) => void; }

/* ── Static data ── */
const weekData = [
  { day: 'Seg', rondas: 18, pontos: 142 },
  { day: 'Ter', rondas: 24, pontos: 196 },
  { day: 'Qua', rondas: 21, pontos: 168 },
  { day: 'Qui', rondas: 28, pontos: 224 },
  { day: 'Sex', rondas: 32, pontos: 258 },
  { day: 'Sáb', rondas: 15, pontos: 120 },
  { day: 'Dom', rondas: 12, pontos: 96 },
];

const vigias = [
  { id: 1, name: 'Carlos Silva',    route: 'Shopping Norte — Perímetro', status: 'on_round',   progress: 65, since: '1h 20min' },
  { id: 2, name: 'Maria Santos',    route: 'Condomínio Jardins',          status: 'on_round',   progress: 30, since: '42min' },
  { id: 3, name: 'João Oliveira',   route: null,                          status: 'available',  progress: 0,  since: null },
  { id: 4, name: 'Ana Lima',        route: 'Fábrica ABC — Noturna',       status: 'on_round',   progress: 80, since: '2h 05min' },
  { id: 5, name: 'Pedro Costa',     route: null,                          status: 'offline',    progress: 0,  since: null },
  { id: 6, name: 'Luana Ferreira',  route: null,                          status: 'available',  progress: 0,  since: null },
];

const lastScans = [
  { id: 1, point: 'Portaria Principal',  route: 'Shopping Norte',    guard: 'Carlos Silva',   time: '3 min atrás',  ok: true },
  { id: 2, point: 'Câmera Setor B',      route: 'Fábrica ABC',       guard: 'Ana Lima',       time: '8 min atrás',  ok: true },
  { id: 3, point: 'Escada Piso 2',       route: 'Condomínio Jardins',guard: 'Maria Santos',   time: '15 min atrás', ok: true },
  { id: 4, point: 'Estacionamento L3',   route: 'Shopping Norte',    guard: 'Carlos Silva',   time: '22 min atrás', ok: false },
];

const recentOccurrences = [
  { id: 1, type: 'Atividade Suspeita', guard: 'Carlos Silva', location: 'Shopping — Estacionamento', time: '14 min', severity: 'high', status: 'open' },
  { id: 2, type: 'Dano ao Patrimônio', guard: 'Maria Santos', location: 'Condomínio — Portaria',     time: '1h 02min', severity: 'medium', status: 'in_progress' },
  { id: 3, type: 'Acesso Não Autorizado', guard: 'Ana Lima',   location: 'Fábrica — Setor B',       time: '3h 15min', severity: 'high', status: 'resolved' },
];

const kpis = [
  {
    label: 'Vigias Ativos',
    value: '48',
    delta: '+3',
    up: true,
    sub: 'vs. mês anterior',
    icon: Users,
    iconBg: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
    nav: 'employees',
  },
  {
    label: 'Empresas Atendidas',
    value: '15',
    delta: '+2',
    up: true,
    sub: 'vs. mês anterior',
    icon: Building2,
    iconBg: 'from-indigo-500/20 to-indigo-600/10',
    iconColor: 'text-indigo-400',
    nav: 'clients',
  },
  {
    label: 'Rondas Hoje',
    value: '24',
    delta: '+12%',
    up: true,
    sub: 'vs. ontem',
    icon: Route,
    iconBg: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
    nav: 'routes',
  },
  {
    label: 'Ocorrências Abertas',
    value: '3',
    delta: '-1',
    up: false,
    sub: 'vs. ontem',
    icon: AlertTriangle,
    iconBg: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-400',
    nav: 'occurrences',
  },
];

/* ── Status helpers ── */
const vigiasStatus = {
  on_round:  { label: 'Em ronda',    dot: 'bg-blue-400 animate-pulse',  text: 'text-blue-400',  badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  available: { label: 'Disponível',  dot: 'bg-emerald-400',              text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  offline:   { label: 'Offline',     dot: 'bg-slate-500',                text: 'text-slate-400', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const ocurrenceSeverity = {
  high:   { bar: 'bg-amber-500/100',   text: 'text-amber-400' },
  medium: { bar: 'bg-blue-400',    text: 'text-blue-400' },
  low:    { bar: 'bg-slate-400',   text: 'text-slate-400' },
};

const occurrenceStatus = {
  open:        { label: 'Aberta',       cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  in_progress: { label: 'Em andamento', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  resolved:    { label: 'Resolvida',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

/* ── Tooltip ── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl shadow-xl text-[12px]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const onRound = vigias.filter(v => v.status === 'on_round').length;
  const available = vigias.filter(v => v.status === 'available').length;
  const offline = vigias.filter(v => v.status === 'offline').length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">

      {/* ── System status strip ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>Todos os sistemas operacionais</span>
          <span className="text-border">·</span>
          <span>Última sincronização: agora mesmo</span>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-muted-foreground">{onRound} em ronda</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-muted-foreground">{available} disponíveis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-slate-500 rounded-full" />
            <span className="text-muted-foreground">{offline} offline</span>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              onClick={() => onNavigate(kpi.nav)}
              className="relative overflow-hidden bg-card rounded-2xl p-5 text-left group transition-all duration-200 hover:-translate-y-0.5"
              style={{ border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 0 rgba(59,130,246,0)' }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </div>

              {/* Value */}
              <p className="text-3xl font-bold text-foreground tabular-nums mb-1">{kpi.value}</p>
              <p className="text-[13px] text-muted-foreground">{kpi.label}</p>

              {/* Delta */}
              <div className={`flex items-center gap-1 mt-2 text-[11px] font-medium ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{kpi.delta} {kpi.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main operational area ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Operations panel (left 2/3) */}
        <div className="xl:col-span-2 space-y-4">

          {/* Chart: rondas semana */}
          <div className="bg-card rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">Atividade Semanal</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Rondas e pontos verificados nos últimos 7 dias</p>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-blue-500/100" /><span>Rondas</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-indigo-400/40" /><span>Pontos</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-rondas-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="rondas" name="Rondas" stroke="#3B82F6" strokeWidth={2} fill="url(#grad-rondas-area)" dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Active rounds — operational view */}
          <div className="bg-card rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <h3 className="text-[14px] font-semibold text-foreground">Rondas Ativas</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {onRound} em andamento
                </span>
              </div>
              <button onClick={() => onNavigate('routes')} className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {vigias.filter(v => v.status === 'on_round').map(v => (
                <div key={v.id} className="px-6 py-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-400 text-[13px] font-bold flex-shrink-0">
                      {v.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[13px] font-semibold text-foreground">{v.name}</p>
                        <span className="text-[11px] text-muted-foreground font-mono">{v.since}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-2 truncate">{v.route}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                          <div className="h-full rounded-full bg-blue-500/100 transition-all" style={{ width: `${v.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-mono font-medium text-blue-400 flex-shrink-0">{v.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-4">

          {/* Vigia status */}
          <div className="bg-card rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[14px] font-semibold text-foreground">Status da Equipe</h3>
              <button onClick={() => onNavigate('employees')} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-3 space-y-1">
              {vigias.map(v => {
                const cfg = vigiasStatus[v.status as keyof typeof vigiasStatus];
                return (
                  <div key={v.id} className="flex items-center gap-3 py-2">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600/30 to-slate-700/20 flex items-center justify-center text-[11px] font-bold text-slate-300">
                        {v.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${cfg.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{v.name}</p>
                      <p className={`text-[10px] font-medium ${cfg.text}`}>{cfg.label}</p>
                    </div>
                    {v.status === 'on_round' && (
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    )}
                    {v.status === 'available' && (
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    )}
                    {v.status === 'offline' && (
                      <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center flex-shrink-0">
                        <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last QR scans */}
          <div className="bg-card rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[14px] font-semibold text-foreground">Últimas Leituras QR</h3>
            </div>
            <div className="px-5 py-3 space-y-3">
              {lastScans.map(scan => (
                <div key={scan.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    scan.ok ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}>
                    <QrCode className={`w-3.5 h-3.5 ${scan.ok ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-medium text-foreground truncate">{scan.point}</p>
                      <span className={`ml-2 flex-shrink-0 w-1.5 h-1.5 rounded-full ${scan.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{scan.guard}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{scan.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent occurrences ── */}
      <div className="bg-card rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <h3 className="text-[14px] font-semibold text-foreground">Ocorrências Recentes</h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              {recentOccurrences.filter(o => o.status === 'open').length} abertas
            </span>
          </div>
          <button onClick={() => onNavigate('occurrences')} className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {recentOccurrences.map(occ => {
            const sev = ocurrenceSeverity[occ.severity as keyof typeof ocurrenceSeverity];
            const sta = occurrenceStatus[occ.status as keyof typeof occurrenceStatus];
            return (
              <div key={occ.id} className="flex items-center gap-5 px-6 py-4 hover:bg-accent/30 transition-colors">
                {/* Severity bar */}
                <div className={`w-1 h-10 rounded-full flex-shrink-0 ${sev.bar}`} />

                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{occ.type}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] text-muted-foreground">{occ.guard}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{occ.location}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${sta.cls}`}>{sta.label}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{occ.time} atrás</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Pontos por dia */}
        <div className="md:col-span-2 bg-card rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-foreground">Pontos Verificados</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">Total de pontos verificados por dia</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekData} barSize={20} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="pontos" name="Pontos" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Indicadores operacionais */}
        <div className="bg-card rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-5">Indicadores Hoje</h3>
          <div className="space-y-4">
            {[
              { label: 'Taxa de conclusão', value: 94, color: 'bg-emerald-500/100', text: 'text-emerald-400' },
              { label: 'Pontos sem falha', value: 87, color: 'bg-blue-500/100', text: 'text-blue-400' },
              { label: 'Cobertura das rotas', value: 100, color: 'bg-indigo-500', text: 'text-indigo-400' },
            ].map(ind => (
              <div key={ind.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-muted-foreground">{ind.label}</span>
                  <span className={`text-[12px] font-bold ${ind.text}`}>{ind.value}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                  <div className={`h-full rounded-full ${ind.color} transition-all duration-700`} style={{ width: `${ind.value}%` }} />
                </div>
              </div>
            ))}

            <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[12px] font-medium text-foreground">Sistema</span>
                <span className="ml-auto text-[11px] font-medium text-emerald-400">Operacional</span>
              </div>
              {['API', 'GPS', 'Chat', 'Banco'].map(s => (
                <div key={s} className="flex items-center gap-2 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] text-muted-foreground">{s}</span>
                  <span className="ml-auto text-[10px] text-emerald-400/80">Online</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
