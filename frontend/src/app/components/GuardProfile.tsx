import { useMemo } from 'react';
import { ArrowLeft, LogOut, ChevronRight, Shield, Clock, MapPin, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { getGuardPalette } from '../utils/guardPalette';

interface GuardProfileProps { onBack: () => void; }

export function GuardProfile({ onBack }: GuardProfileProps) {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const C = getGuardPalette(theme);

  const data = useMemo(() => ({
    fullName: user?.name || 'Carlos Silva',
    cpf: '123.456.789-00',
    email: user?.email || 'carlos.silva@example.com',
    phone: '(11) 98765-4321',
    position: 'Vigilante Patrimonial',
    admissionDate: '15/03/2023',
    registration: 'VIG-2023-001',
    company: 'SecureGuard Vigilância Ltda.',
    shift: 'Noturno · 22h–06h',
    sector: 'Perímetro Externo',
    supervisor: 'João Santos',
    roundsTotal: 148,
    roundsMonth: 24,
    hoursMonth: '96h',
    certExpiry: '15/06/2025',
  }), [user]);

  const handleLogout = () => {
    if (confirm('ENCERRAR SESSÃO OPERACIONAL?')) signOut();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }}>

      {/* Header */}
      <div className="flex-shrink-0" style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: C.dim, border: `1px solid ${C.border}` }}>
            <ArrowLeft className="w-4 h-4" style={{ color: C.text }} />
          </button>
          <div>
            <p className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.muted }}>IDENTIFICAÇÃO DO AGENTE</p>
            <p className="text-[14px] font-black" style={{ color: C.text }}>PERFIL OPERACIONAL</p>
          </div>
        </div>

        {/* ID card */}
        <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${C.borderHi}`, boxShadow: `0 0 20px rgba(0,200,120,0.08)` }}>
          <div className="px-4 py-2 flex items-center justify-between"
            style={{ backgroundColor: 'rgba(0,200,120,0.1)' }}>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" style={{ color: C.green }} />
              <span className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.green }}>CREDENCIAL ATIVA</span>
            </div>
            <span className="text-[9px] font-mono" style={{ color: C.muted }}>{data.registration}</span>
          </div>
          <div className="px-4 py-4 flex items-center gap-4" style={{ backgroundColor: C.card }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-[24px] font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)', color: 'white', boxShadow: '0 4px 20px rgba(29,78,216,0.4)' }}>
              {data.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-black" style={{ color: C.text }}>{data.fullName}</p>
              <p className="text-[11px] font-mono" style={{ color: C.muted }}>{data.position}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
                <span className="text-[9px] font-black tracking-wider" style={{ color: C.green }}>STATUS: ATIVO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4 pb-8">

        {/* Metrics */}
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] mb-2" style={{ color: C.muted }}>INDICADORES OPERACIONAIS</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: data.roundsTotal, l: 'TOTAL', c: C.text, Icon: Activity },
              { v: data.roundsMonth, l: 'MÊS', c: C.green, Icon: Clock },
              { v: data.hoursMonth, l: 'HORAS', c: C.blue, Icon: Clock },
            ].map(s => (
              <div key={s.l} className="rounded-lg p-3 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                <p className="text-[20px] font-black font-mono" style={{ color: s.c }}>{s.v}</p>
                <p className="text-[8px] font-black tracking-widest mt-0.5" style={{ color: C.muted }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info sections */}
        <DataSection label="DADOS PESSOAIS" C={C}>
          <DataRow label="MATRÍCULA" value={data.registration} C={C} />
          <DataRow label="CPF" value={data.cpf} mono C={C} />
          <DataRow label="E-MAIL" value={data.email} C={C} />
          <DataRow label="TELEFONE" value={data.phone} mono C={C} />
        </DataSection>

        <DataSection label="DADOS FUNCIONAIS" C={C}>
          <DataRow label="CARGO" value={data.position} C={C} />
          <DataRow label="EMPRESA" value={data.company} C={C} />
          <DataRow label="TURNO" value={data.shift} C={C} />
          <DataRow label="SETOR" value={data.sector} C={C} />
          <DataRow label="SUPERVISOR" value={data.supervisor} C={C} />
          <DataRow label="ADMISSÃO" value={data.admissionDate} mono C={C} />
        </DataSection>

        <DataSection label="CERTIFICAÇÕES" C={C}>
          <DataRow label="CERT. VIGILÂNCIA" value="Ativo" valueColor={C.green} C={C} />
          <DataRow label="VALIDADE" value={data.certExpiry} mono C={C} />
        </DataSection>

        <DataSection label="CONFIGURAÇÕES" C={C}>
          {['Notificações', 'Modo exibição', 'Alterar senha', 'Sobre o sistema'].map(item => (
            <button key={item} className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition-opacity">
              <span className="text-[12px] font-mono" style={{ color: C.text }}>{item.toUpperCase()}</span>
              <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
            </button>
          ))}
        </DataSection>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-[12px] font-black tracking-wider"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: C.red }}>
          <LogOut className="w-4 h-4" />
          ENCERRAR SESSÃO
        </button>

        <p className="text-center text-[9px] font-mono" style={{ color: C.muted }}>
          VIGIASYSTEM v1.0 · MONITORAMENTO PATRIMONIAL
        </p>
      </div>
    </div>
  );
}

function DataSection({ label, children, C }: { label: string; children: React.ReactNode; C: ReturnType<typeof getGuardPalette> }) {
  return (
    <div>
      <p className="text-[9px] font-black tracking-[0.2em] mb-2 px-1" style={{ color: C.muted }}>{label}</p>
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        {children}
      </div>
    </div>
  );
}

function DataRow({ label, value, mono, valueColor, C }: { label: string; value: string; mono?: boolean; valueColor?: string; C: ReturnType<typeof getGuardPalette> }) {
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
      <span className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{label}</span>
      <span className={`text-[11px] font-bold ${mono ? 'font-mono' : ''}`} style={{ color: valueColor ?? C.text }}>{value}</span>
    </div>
  );
}
