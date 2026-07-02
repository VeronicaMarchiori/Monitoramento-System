import { useState, useEffect } from 'react';
import {
  Shield, Play, CheckCircle2, AlertTriangle,
  MessageSquare, User, ChevronRight,
  WifiOff, Zap, MapPin, Clock,
  Activity, Navigation2, Battery, Signal,
  ListChecks, ArrowLeft, Sun, Moon,
  Circle,
} from 'lucide-react';
import { RouteDetails } from './RouteDetails';
import { GuardProfile } from './GuardProfile';
import { ClientSelection } from './ClientSelection';
import { ChatInterface } from './ChatInterface';
import { useAuth, User as UserType } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { apiClient } from '../utils/api';

/* ── Theme-aware palette — imported from shared util ─────────── */
import { getGuardPalette } from '../utils/guardPalette';
function usePalette(theme: string) {
  return getGuardPalette(theme as 'light' | 'dark');
}

type AppTab = 'home' | 'mission' | 'chat' | 'profile';

interface AppRoute {
  id: string; name: string;
  status: 'pending' | 'in_progress' | 'completed';
  nextCheckTime?: string; totalPoints?: number;
  completedPoints?: number; scheduleStart?: string; scheduleEnd?: string;
}

interface GuardDashboardProps { mockUser?: UserType; }

/* ── Mock chat clients ────────────────────────────────────────── */
const CHAT_CLIENTS = [
  {
    id: '1',
    name: 'Shopping Center Norte',
    sector: 'ZONA-A',
    lastMsg: 'Ponto 3 confirmado. Seguindo.',
    lastTime: '22:31',
    unread: 0,
    onlineGuards: ['Carlos', 'Maria'],
  },
  {
    id: '2',
    name: 'Condomínio Vista Verde',
    sector: 'ZONA-B',
    lastMsg: 'Central: Confirmar posição.',
    lastTime: '22:15',
    unread: 2,
    onlineGuards: ['João'],
  },
  {
    id: '3',
    name: 'Fábrica Industrial ABC',
    sector: 'ZONA-C',
    lastMsg: 'Ronda noturna iniciada.',
    lastTime: '21:58',
    unread: 0,
    onlineGuards: ['Ana', 'Pedro'],
  },
];

/* ── Status bar ───────────────────────────────────────────────── */
function StatusBar({ online, C }: { online: boolean; C: ReturnType<typeof usePalette> }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 10000); return () => clearInterval(t); }, []);

  return (
    <div className="flex items-center justify-between px-4 h-8 text-[10px] font-mono flex-shrink-0"
      style={{ backgroundColor: C.navBg, borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-3">
        <span style={{ color: C.muted }}>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex items-center gap-1">
          <Signal className="w-3 h-3" style={{ color: online ? C.green : C.red }} />
          <span style={{ color: online ? C.green : C.red }}>{online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Navigation2 className="w-3 h-3" style={{ color: C.green }} />
          <span style={{ color: C.green }}>GPS·OK</span>
        </div>
        <div className="flex items-center gap-1" style={{ color: C.muted }}>
          <Battery className="w-3 h-3" />
          <span>87%</span>
        </div>
      </div>
    </div>
  );
}

/* ── Floating SOS ─────────────────────────────────────────────── */
function SOSButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="fixed z-50 right-4 bottom-24 w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
      style={{
        background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
        boxShadow: '0 0 20px rgba(220,38,38,0.6), 0 0 40px rgba(220,38,38,0.2)',
        border: '2px solid rgba(220,38,38,0.5)',
      }}
    >
      <Zap className="w-5 h-5 text-white" />
      <span className="text-white text-[8px] font-black tracking-widest">SOS</span>
    </button>
  );
}

/* ── Bottom nav ───────────────────────────────────────────────── */
function BottomNav({ tab, setTab, C }: { tab: AppTab; setTab: (t: AppTab) => void; C: ReturnType<typeof usePalette> }) {
  const items: { id: AppTab; label: string; Icon: React.ElementType }[] = [
    { id: 'home',    label: 'BASE',    Icon: Activity },
    { id: 'mission', label: 'MISSÃO',  Icon: ListChecks },
    { id: 'chat',    label: 'CHAT',    Icon: MessageSquare },
    { id: 'profile', label: 'AGENTE',  Icon: User },
  ];
  return (
    <nav className="flex flex-shrink-0" style={{ backgroundColor: C.navBg, borderTop: `1px solid ${C.border}` }}>
      {items.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all"
            style={{ color: active ? C.green : C.muted }}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-black tracking-widest">{label}</span>
            {active && <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: C.green }} />}
          </button>
        );
      })}
    </nav>
  );
}

/* ── Home tab ─────────────────────────────────────────────────── */
function HomeTab({ routes, loading, onMission, C }: {
  routes: AppRoute[]; loading: boolean; onMission: () => void; C: ReturnType<typeof usePalette>;
}) {
  const active = routes.find(r => r.status === 'in_progress');
  const completed = routes.filter(r => r.status === 'completed').length;
  const pending = routes.filter(r => r.status === 'pending').length;
  const pct = active?.totalPoints
    ? Math.round(((active.completedPoints ?? 0) / active.totalPoints) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4" style={{ backgroundColor: C.bg }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.muted }}>PAINEL OPERACIONAL</p>
          <p className="text-[13px] font-bold" style={{ color: C.text }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded"
          style={{ backgroundColor: active ? `${C.green}15` : `${C.muted}20`, border: `1px solid ${active ? C.borderHi : C.border}` }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? C.green : C.muted }} />
          <span className="text-[9px] font-black tracking-widest" style={{ color: active ? C.green : C.muted }}>
            {active ? 'EM OPERAÇÃO' : 'DISPONÍVEL'}
          </span>
        </div>
      </div>

      {active ? (
        <button onClick={onMission} className="w-full text-left rounded-xl overflow-hidden active:scale-[0.99] transition-transform"
          style={{ border: `1px solid ${C.borderHi}`, boxShadow: `0 0 30px ${C.green}15` }}>
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: `${C.green}12` }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
              <span className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.green }}>MISSÃO ATIVA</span>
            </div>
            <span className="text-[9px] font-mono" style={{ color: C.muted }}>ID:{active.id.slice(-4).toUpperCase()}</span>
          </div>
          <div className="px-4 py-4 space-y-4" style={{ backgroundColor: C.card }}>
            <div>
              <p className="text-[18px] font-black" style={{ color: C.text }}>{active.name || `Rota #${active.id.slice(-3)}`}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>Shopping Center Norte · Turno noturno</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono" style={{ color: C.muted }}>PROGRESSO</span>
                <span className="text-[14px] font-black font-mono" style={{ color: C.green }}>{pct}%</span>
              </div>
              <div className="h-2 rounded-sm overflow-hidden" style={{ backgroundColor: C.dim }}>
                <div className="h-full rounded-sm transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.green}, ${C.green}99)` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] font-mono" style={{ color: C.muted }}>
                <span>{active.completedPoints ?? 0}/{active.totalPoints ?? 0} PONTOS</span>
                <span>{(active.totalPoints ?? 0) - (active.completedPoints ?? 0)} RESTANTES</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation2 className="w-4 h-4" style={{ color: C.green }} />
                <span className="text-[11px] font-bold" style={{ color: C.text }}>Próximo: Portaria Principal</span>
              </div>
              <div className="flex items-center gap-1" style={{ color: C.green }}>
                <span className="text-[11px] font-mono font-bold">120m</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </button>
      ) : (
        <div className="rounded-xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[9px] font-black tracking-[0.2em] mb-3" style={{ color: C.muted }}>SITUAÇÃO ATUAL</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.dim, border: `1px solid ${C.border}` }}>
              <Shield className="w-6 h-6" style={{ color: C.muted }} />
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: C.text }}>Sem missão ativa</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Aguardando designação de ronda</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'CONCLUÍDAS', value: completed, color: C.green },
          { label: 'PENDENTES',  value: pending,   color: C.amber },
          { label: 'KM HOJE',    value: '4.7',     color: C.blue },
        ].map(s => (
          <div key={s.label} className="rounded-lg p-3 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[18px] font-black font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[8px] font-black tracking-widest mt-0.5" style={{ color: C.muted }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[9px] font-black tracking-[0.2em] mb-2" style={{ color: C.muted }}>MISSÕES DISPONÍVEIS</p>
        <div className="space-y-2">
          {loading ? [1, 2].map(i => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: C.card }} />
          )) : routes.filter(r => r.status !== 'in_progress').map((route, i) => (
            <MissionCard key={route.id} route={route} index={i} onPress={onMission} C={C} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MissionCard({ route, index, onPress, C }: { route: AppRoute; index: number; onPress: () => void; C: ReturnType<typeof usePalette> }) {
  const isCompleted = route.status === 'completed';
  return (
    <button onClick={onPress} className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left active:scale-[0.99] transition-transform"
      style={{ backgroundColor: C.card, border: `1px solid ${isCompleted ? `${C.green}25` : C.border}` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black font-mono flex-shrink-0"
        style={{ backgroundColor: isCompleted ? `${C.green}15` : C.dim, color: isCompleted ? C.green : C.text }}>
        {isCompleted ? '✓' : String(index + 1).padStart(2, '0')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate" style={{ color: C.text }}>{route.name || `Rota ${index + 1}`}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-black tracking-wider" style={{ color: isCompleted ? C.green : C.muted }}>
            {isCompleted ? 'CONCLUÍDA' : 'AGUARDANDO'}
          </span>
          {route.scheduleStart && (
            <>
              <span style={{ color: C.muted }}>·</span>
              <span className="text-[9px] font-mono" style={{ color: C.muted }}>{route.scheduleStart}–{route.scheduleEnd}</span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
    </button>
  );
}

/* ── History tab ──────────────────────────────────────────────── */
function HistoryTab({ C }: { C: ReturnType<typeof usePalette> }) {
  const records = [
    { id: '1', date: '15/01', time: '22:14', company: 'Shopping Norte', name: 'Perímetro Externo', duration: '1h 24min', km: '3.2', occ: 1, pts: '8/8' },
    { id: '2', date: '14/01', time: '22:08', company: 'Condomínio Jardins', name: 'Ronda Interna', duration: '52min', km: '1.8', occ: 0, pts: '6/6' },
    { id: '3', date: '13/01', time: '23:01', company: 'Fábrica ABC', name: 'Noturna Completa', duration: '2h 10min', km: '5.1', occ: 2, pts: '12/12' },
    { id: '4', date: '12/01', time: '22:05', company: 'Shopping Norte', name: 'Perímetro Externo', duration: '1h 18min', km: '3.0', occ: 0, pts: '8/8' },
  ];

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: C.bg }}>
      <div className="px-4 pt-4 pb-2">
        <p className="text-[9px] font-black tracking-[0.2em] mb-3" style={{ color: C.muted }}>REGISTRO OPERACIONAL</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: records.length, l: 'TOTAL', c: C.text },
            { v: records.reduce((s, r) => s + parseFloat(r.km), 0).toFixed(1), l: 'KM TOTAL', c: C.blue },
            { v: records.reduce((s, r) => s + r.occ, 0), l: 'OCORRÊNCIAS', c: C.amber },
          ].map(s => (
            <div key={s.l} className="rounded-lg p-3 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              <p className="text-[16px] font-black font-mono" style={{ color: s.c }}>{s.v}</p>
              <p className="text-[8px] font-black tracking-widest" style={{ color: C.muted }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 pb-6 space-y-2 mt-2">
        {records.map(r => (
          <div key={r.id} className="rounded-xl px-4 py-3.5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${C.green}15`, color: C.green }}>
                  {r.date} · {r.time}
                </span>
                <p className="text-[13px] font-bold mt-1.5" style={{ color: C.text }}>{r.name}</p>
                <p className="text-[11px]" style={{ color: C.muted }}>{r.company}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-mono font-bold" style={{ color: C.green }}>{r.pts}</p>
                <p className="text-[9px]" style={{ color: C.muted }}>pontos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono pt-2"
              style={{ color: C.muted, borderTop: `1px solid ${C.border}` }}>
              <span>⏱ {r.duration}</span>
              <span>📍 {r.km} km</span>
              {r.occ > 0 && <span style={{ color: C.amber }}>⚠ {r.occ} ocorr.</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Chat list tab ────────────────────────────────────────────── */
function ChatListTab({ onOpen, C }: {
  onOpen: (client: typeof CHAT_CLIENTS[0]) => void;
  C: ReturnType<typeof usePalette>;
}) {
  const totalUnread = CHAT_CLIENTS.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: C.bg }}>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.muted }}>CANAIS OPERACIONAIS</p>
          {totalUnread > 0 && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ backgroundColor: C.red, color: 'white' }}>
              {totalUnread} novo{totalUnread > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
          Selecione o cliente para acessar o chat
        </p>
      </div>

      <div className="px-4 pb-6 space-y-2 mt-1">
        {CHAT_CLIENTS.map(client => (
          <button
            key={client.id}
            onClick={() => onOpen(client)}
            className="w-full rounded-xl overflow-hidden text-left active:scale-[0.99] transition-transform"
            style={{ border: `1px solid ${client.unread > 0 ? C.borderHi : C.border}` }}
          >
            {/* Sector badge */}
            <div className="flex items-center justify-between px-4 py-2"
              style={{ backgroundColor: `${C.green}08`, borderBottom: `1px solid ${C.border}` }}>
              <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: C.green }}>
                {client.sector}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
                <span className="text-[8px] font-mono" style={{ color: C.green }}>
                  {client.onlineGuards.length} ONLINE
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3" style={{ backgroundColor: C.card }}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                  style={{ backgroundColor: C.dim, border: `1px solid ${C.border}` }}>
                  🏢
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-black truncate" style={{ color: C.text }}>
                      {client.name}
                    </p>
                    <span className="text-[10px] font-mono flex-shrink-0" style={{ color: C.muted }}>
                      {client.lastTime}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: C.muted }}>
                    {client.lastMsg}
                  </p>
                  {/* Online guards */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {client.onlineGuards.slice(0, 3).map(g => (
                      <span key={g} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${C.blue}15`, color: C.blue }}>
                        {g.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Unread badge + arrow */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {client.unread > 0 ? (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{ backgroundColor: C.red, color: 'white' }}>
                      {client.unread}
                    </span>
                  ) : (
                    <span className="w-5 h-5" />
                  )}
                  <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Chat conversation screen ─────────────────────────────────── */
function ChatConversation({ client, onBack, C }: {
  client: typeof CHAT_CLIENTS[0];
  onBack: () => void;
  C: ReturnType<typeof usePalette>;
}) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: C.dim }}>
          <ArrowLeft className="w-4 h-4" style={{ color: C.text }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black tracking-[0.15em]" style={{ color: C.muted }}>
            CANAL · {client.sector}
          </p>
          <p className="text-[13px] font-black truncate" style={{ color: C.text }}>{client.name}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded"
          style={{ backgroundColor: `${C.green}12`, border: `1px solid ${C.borderHi}` }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
          <span className="text-[9px] font-black" style={{ color: C.green }}>
            {client.onlineGuards.length} ONLINE
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-auto">
        <ChatInterface routeId={client.id} />
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export function GuardDashboard({ mockUser }: GuardDashboardProps) {
  const { user: authUser } = useAuth();
  const user = mockUser || authUser;
  const { theme, toggle: toggleTheme } = useTheme();
  const C = usePalette(theme);

  const [tab, setTab] = useState<AppTab>('home');
  const [routes, setRoutes] = useState<AppRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<AppRoute | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [chatClient, setChatClient] = useState<typeof CHAT_CLIENTS[0] | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);

 useEffect(() => {
  const loadRoutes = async () => {
    try {
      setLoading(true);

      const result = await apiClient.getRoutes();
      const data = result?.data || result?.rondas || result?.routes || result || [];

      const mappedRoutes: AppRoute[] = data.map((ronda: any) => ({
        id: String(ronda.idRonda || ronda.id),
        name: ronda.nome || ronda.name || "Ronda sem nome",
        status: ronda.status || "pending",
        totalPoints: ronda.totalPontos || ronda.totalPoints || 0,
        completedPoints: ronda.completedPoints || 0,
        scheduleStart: ronda.scheduleStart || ronda.dataInicio || "",
        scheduleEnd: ronda.scheduleEnd || ronda.dataFim || "",
      }));

      setRoutes(mappedRoutes);
    } catch (error) {
      console.error("Erro ao carregar rondas:", error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  loadRoutes();
}, []);

  /* Full-screen states */
  if (selectedRoute) return <RouteDetails route={selectedRoute} onBack={() => setSelectedRoute(null)} />;
  if (tab === 'profile') return <GuardProfile onBack={() => setTab('home')} />;

  /* Company selection */
  if (!selectedClient) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }}>
        <StatusBar online={online} C={C} />
        <div className="px-4 py-4 flex-shrink-0" style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)', color: 'white' }}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-[0.15em]" style={{ color: C.muted }}>VIGIASYSTEM</p>
                <p className="text-[14px] font-black" style={{ color: C.text }}>{user?.name ?? 'AGENTE'}</p>
              </div>
            </div>
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ backgroundColor: C.dim, border: `1px solid ${C.border}` }}>
              {theme === 'dark'
                ? <Sun className="w-4 h-4" style={{ color: C.amber }} />
                : <Moon className="w-4 h-4" style={{ color: C.blue }} />}
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: `${C.amber}10`, border: `1px solid ${C.amber}25` }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.amber }} />
            <p className="text-[10px] font-mono" style={{ color: C.amber }}>SELECIONE O LOCAL DE OPERAÇÃO PARA INICIAR</p>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <ClientSelection onSelectClient={(id) => setSelectedClient(id)} />
        </div>
        <SOSButton onPress={handleSOS} />
        <BottomNav tab={tab} setTab={setTab} C={C} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }}>
      <StatusBar online={online} C={C} />

      {/* Agent header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)', color: 'white' }}>
            {user?.name?.charAt(0).toUpperCase() ?? 'V'}
          </div>
          <div>
            <p className="text-[9px] font-black tracking-[0.15em]" style={{ color: C.muted }}>AGENTE OPERACIONAL</p>
            <p className="text-[13px] font-black" style={{ color: C.text }}>{user?.name ?? 'VIGILANTE'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeRoute && (
            <button onClick={() => setSelectedRoute(activeRoute)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: `${C.green}12`, border: `1px solid ${C.borderHi}` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
              <span className="text-[9px] font-black tracking-widest" style={{ color: C.green }}>EM RONDA</span>
            </button>
          )}
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: C.dim, border: `1px solid ${C.border}` }}>
            {theme === 'dark'
              ? <Sun className="w-3.5 h-3.5" style={{ color: C.amber }} />
              : <Moon className="w-3.5 h-3.5" style={{ color: C.blue }} />}
          </button>
          <button onClick={() => setSelectedClient(null)}
            className="px-2 py-1.5 rounded-lg text-[9px] font-black tracking-wider"
            style={{ backgroundColor: C.dim, color: C.muted }}>
            TROCAR
          </button>
        </div>
      </div>

      {/* Offline banner */}
      {!online && (
        <div className="flex items-center justify-center gap-2 py-2 text-[10px] font-mono flex-shrink-0"
          style={{ backgroundColor: `${C.amber}12`, borderBottom: `1px solid ${C.amber}25`, color: C.amber }}>
          <WifiOff className="w-3 h-3" />
          OFFLINE · 2 REGISTROS PENDENTES
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'home' && (
          <HomeTab routes={routes} loading={loading} C={C} onMission={() => {
            const r = activeRoute ?? routes.find(r => r.status === 'pending');
            if (r) setSelectedRoute(r);
          }} />
        )}

        {tab === 'mission' && (
          <div className="flex-1 overflow-auto" style={{ backgroundColor: C.bg }}>
            <div className="px-4 pt-4 pb-2">
              <p className="text-[9px] font-black tracking-[0.2em] mb-3" style={{ color: C.muted }}>ORDENS DE MISSÃO</p>
            </div>
            <div className="px-4 pb-6 space-y-2">
              {routes.map((route, i) => (
                <MissionCard key={route.id} route={route} index={i} C={C} onPress={() => setSelectedRoute(route)} />
              ))}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          chatClient ? (
            <ChatConversation
              client={chatClient}
              onBack={() => setChatClient(null)}
              C={C}
            />
          ) : (
            <ChatListTab onOpen={(c) => setChatClient(c)} C={C} />
          )
        )}
      </div>

      <SOSButton onPress={handleSOS} />
      <BottomNav tab={tab} setTab={t => { if (t !== 'chat') setChatClient(null); setTab(t); }} C={C} />
    </div>
  );
}
