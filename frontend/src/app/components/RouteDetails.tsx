import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, CheckCircle2, Camera, Zap, ChevronRight,
  QrCode, Navigation2, CheckCheck, XCircle, AlertTriangle,
  MapPin, Clock, Shield, Crosshair, Wifi, Signal,
  Radio, MessageSquare,
} from 'lucide-react';
import { CameraSimulator } from './CameraSimulator';
import { ChatInterface } from './ChatInterface';
import { OccurrenceForm } from './OccurrenceForm';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../utils/api';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from './ui/alert-dialog';

import { getGuardPalette } from '../utils/guardPalette';
import { useTheme } from '../hooks/useTheme';

interface RouteDetailsProps { route: any; onBack: () => void; }
interface RoutePoint {
  id: string; name: string; latitude: number; longitude: number;
  qrCode: string; order: number; verified: boolean; verifiedAt?: string;
}

type ActiveTab = 'mission' | 'comm' | 'incident';

export function RouteDetails({ route, onBack }: RouteDetailsProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const C = getGuardPalette(theme);
  const [tab, setTab] = useState<ActiveTab>('mission');
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [activeRound, setActiveRound] = useState<any>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false);
  const [successPoint, setSuccessPoint] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'success'>('idle');

  useEffect(() => { loadPoints(); }, [route.id]);

  useEffect(() => {
    if (activeRound && !timerRef.current) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [activeRound]);

  const loadPoints = async () => {
    try {
      const r = await apiClient.getRoutePoints(route.id);
      setPoints(r?.points?.length ? r.points : []);
    } catch {
      setPoints([]);
    }
  };

  const startRound = async () => {
    try {
      const { round } = await apiClient.createRound({ routeId: route.id, startedAt: new Date().toISOString(), userId: user?.id });
      setActiveRound(round);
    } catch {
      setActiveRound({ id: `RND-${Date.now().toString().slice(-6)}`, routeId: route.id, startedAt: new Date().toISOString() });
    }
  };

  const verifyPoint = async (pointId: string) => {
    try { await apiClient.verifyCheckpoint({ roundId: activeRound?.id, pointId, verifiedAt: new Date().toISOString() }); } catch {}
    setPoints(prev => prev.map(p => p.id === pointId ? { ...p, verified: true, verifiedAt: new Date().toISOString() } : p));
    setCameraOpen(false);
    setSelectedPoint(null);
    setSuccessPoint(pointId);
    setTimeout(() => setSuccessPoint(null), 2500);
  };

  const finishRound = async (isEmergency = false) => {
    if (!isEmergency && !points.every(p => p.verified)) { alert('Registre todos os pontos antes de finalizar.'); return; }
    try { await apiClient.finishRound(activeRound?.id, { isEmergency }); } catch {}
    onBack();
  };

  const fmtElapsed = () => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return h > 0
      ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const completed = points.filter(p => p.verified).length;
  const pct = points.length > 0 ? Math.round((completed / points.length) * 100) : 0;
  const nextPoint = activeRound ? points.find(p => !p.verified) : null;
  const remaining = points.length - completed;

  const tabs: { id: ActiveTab; label: string; Icon: React.ElementType }[] = [
    { id: 'mission',  label: 'MISSÃO',  Icon: Shield },
    { id: 'comm',     label: 'RÁDIO',   Icon: Radio },
    { id: 'incident', label: 'INCID.',  Icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }}>

      {/* Point success overlay */}
      {successPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="rounded-2xl px-8 py-7 flex flex-col items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(0,200,120,0.95), rgba(0,160,90,0.95))', boxShadow: `0 0 60px rgba(0,200,120,0.6)` }}>
            <CheckCheck className="w-14 h-14 text-white" />
            <div className="text-center">
              <p className="text-white font-black text-[18px] tracking-tight">PONTO REGISTRADO</p>
              <p className="text-green-100 text-[11px] font-mono mt-1">PROGRESSO ATUALIZADO · {pct}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0" style={{ backgroundColor: C.surface }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: C.dim, border: `1px solid ${C.border}` }}>
            <ArrowLeft className="w-4 h-4" style={{ color: C.text }} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {activeRound && (
                <span className="text-[8px] font-black tracking-[0.2em] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'rgba(0,200,120,0.1)', color: C.green, border: `1px solid ${C.borderHi}` }}>
                  OPERAÇÃO ATIVA
                </span>
              )}
              <span className="text-[9px] font-mono" style={{ color: C.muted }}>
                {activeRound?.id || 'PRÉ-MISSÃO'}
              </span>
            </div>
            <p className="text-[14px] font-black truncate mt-0.5" style={{ color: C.text }}>
              {route.name || `ROTA ${route.id?.slice(-4)?.toUpperCase()}`}
            </p>
          </div>

          {activeRound && (
            <div className="text-right flex-shrink-0">
              <p className="text-[9px] font-black tracking-widest" style={{ color: C.muted }}>DECORRIDO</p>
              <p className="text-[14px] font-black font-mono" style={{ color: C.green }}>{fmtElapsed()}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black tracking-[0.15em]" style={{ color: C.muted }}>PROGRESSO DA MISSÃO</span>
            <span className="text-[11px] font-black font-mono" style={{ color: pct === 100 ? C.green : C.text }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-sm overflow-hidden" style={{ backgroundColor: C.dim }}>
            <div className="h-full rounded-sm transition-all duration-700"
              style={{ width: `${pct}%`, background: pct === 100 ? `linear-gradient(90deg,${C.green},#00A060)` : `linear-gradient(90deg,${C.blue},#2563EB)` }} />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[9px] font-mono" style={{ color: C.muted }}>
            <span>{completed}/{points.length} PONTOS VERIFICADOS</span>
            <span>{remaining} RESTANTES</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex" style={{ borderTop: `1px solid ${C.border}` }}>
          {tabs.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-black tracking-widest transition-all"
                style={{
                  color: active ? C.green : C.muted,
                  borderBottom: active ? `2px solid ${C.green}` : '2px solid transparent',
                  backgroundColor: active ? 'rgba(0,200,120,0.05)' : 'transparent',
                }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto">

        {/* MISSION TAB */}
        {tab === 'mission' && (
          <div className="p-4 space-y-3 pb-28" style={{ backgroundColor: C.bg }}>

            {/* Start / Main action */}
            {!activeRound ? (
              <button onClick={startRound}
                className="w-full py-5 rounded-xl text-[15px] font-black tracking-wider flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, ${C.green}, #009F60)`, boxShadow: `0 4px 30px rgba(0,200,120,0.4)`, color: '#000' }}>
                <Shield className="w-5 h-5" />
                INICIAR MISSÃO
              </button>
            ) : nextPoint ? (
              <button
                onClick={() => { setSelectedPoint(nextPoint); setCameraOpen(true); }}
                className="w-full py-5 rounded-xl text-[15px] font-black tracking-wider flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, ${C.blue}, #1D4ED8)`, boxShadow: `0 4px 30px rgba(59,130,246,0.4)`, color: 'white' }}>
                <QrCode className="w-5 h-5" />
                REGISTRAR PONTO
              </button>
            ) : completed === points.length && points.length > 0 ? (
              <button onClick={() => finishRound(false)}
                className="w-full py-5 rounded-xl text-[15px] font-black tracking-wider flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, ${C.green}, #009F60)`, boxShadow: `0 4px 30px rgba(0,200,120,0.4)`, color: '#000' }}>
                <CheckCheck className="w-5 h-5" />
                CONCLUIR MISSÃO
              </button>
            ) : null}

            {/* Next point card */}
            {activeRound && nextPoint && (
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.borderHi}`, boxShadow: `0 0 20px rgba(0,200,120,0.08)` }}>
                <div className="px-4 py-2 flex items-center justify-between"
                  style={{ backgroundColor: 'rgba(0,200,120,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <Navigation2 className="w-3.5 h-3.5" style={{ color: C.green }} />
                    <span className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.green }}>PRÓXIMO WAYPOINT</span>
                  </div>
                  <span className="text-[11px] font-black font-mono" style={{ color: C.green }}>~120m</span>
                </div>
                <div className="px-4 py-3" style={{ backgroundColor: C.card }}>
                  <p className="text-[15px] font-black" style={{ color: C.text }}>{nextPoint.name}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono" style={{ color: C.muted }}>
                    <span className="flex items-center gap-1"><QrCode className="w-3 h-3" />QR CODE</span>
                    <span className="flex items-center gap-1"><Signal className="w-3 h-3" />GPS·OK</span>
                    <span className="flex items-center gap-1 font-bold" style={{ color: C.amber }}>OBRIGATÓRIO</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tactical map */}
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}`, height: 200 }}>
              <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #060E1C 0%, #0A1628 50%, #060E1C 100%)' }}>
                {/* Fake grid overlay */}
                <div className="flex-1 relative" style={{
                  backgroundImage: `linear-gradient(rgba(0,200,120,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,120,0.04) 1px, transparent 1px)`,
                  backgroundSize: '32px 32px',
                }}>
                  {/* Fake GPS dot */}
                  <div className="absolute" style={{ top: '50%', left: '40%', transform: 'translate(-50%,-50%)' }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: C.blue, boxShadow: `0 0 10px ${C.blue}` }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: `${C.blue}40` }} />
                  </div>
                  {/* Fake target */}
                  <div className="absolute" style={{ top: '35%', left: '65%', transform: 'translate(-50%,-50%)' }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.green, boxShadow: `0 0 8px ${C.green}` }} />
                  </div>
                  {/* Dashed route line */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="40%" y1="50%" x2="65%" y2="35%" stroke={C.green} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                  </svg>
                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2"
                    style={{ backgroundColor: 'rgba(7,16,30,0.8)', borderTop: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
                      <span className="text-[9px] font-mono font-bold" style={{ color: C.green }}>GPS ATIVO · PRECISÃO 3m</span>
                    </div>
                    <span className="text-[9px] font-mono" style={{ color: C.muted }}>-23.5505, -46.6333</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Waypoints list */}
            <div>
              <p className="text-[9px] font-black tracking-[0.2em] mb-2.5" style={{ color: C.muted }}>
                WAYPOINTS DA MISSÃO · {points.length} PONTOS
              </p>
              <div className="space-y-2">
                {points.map((pt, i) => {
                  const isNext = activeRound && !pt.verified && points.slice(0, i).every(p => p.verified);
                  const borderCol = pt.verified ? 'rgba(0,200,120,0.3)' : isNext ? 'rgba(59,130,246,0.4)' : C.border;
                  const numBg = pt.verified ? C.green : isNext ? C.blue : C.dim;
                  const numColor = pt.verified || isNext ? '#000' : C.muted;

                  return (
                    <div key={pt.id} className="rounded-xl px-4 py-3.5"
                      style={{ backgroundColor: C.card, border: `1px solid ${borderCol}`, boxShadow: isNext ? `0 0 12px rgba(59,130,246,0.1)` : undefined }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black font-mono flex-shrink-0"
                          style={{ backgroundColor: numBg, color: pt.verified ? '#fff' : isNext ? '#fff' : C.muted }}>
                          {pt.verified ? '✓' : String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-bold" style={{ color: pt.verified ? C.green : isNext ? C.text : C.muted }}>
                              {pt.name}
                            </p>
                            {isNext && (
                              <span className="text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: C.blue, border: '1px solid rgba(59,130,246,0.3)' }}>
                                PRÓXIMO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[9px] font-mono" style={{ color: C.muted }}>
                            <span>QR CODE</span>
                            <span>OBRIGATÓRIO</span>
                            {pt.verified && pt.verifiedAt && (
                              <span style={{ color: C.green }}>
                                ✓ {new Date(pt.verifiedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>

                        {isNext && activeRound && (
                          <button
                            onClick={() => { setSelectedPoint(pt); setCameraOpen(true); }}
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: C.blue, border: `1px solid rgba(59,130,246,0.4)` }}>
                            <Camera className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emergency finish */}
            {activeRound && remaining > 0 && (
              <button
                onClick={() => setShowEmergencyDialog(true)}
                className="w-full py-3.5 rounded-xl text-[12px] font-black tracking-wider flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: C.red }}>
                <XCircle className="w-4 h-4" />
                FINALIZAR EM EMERGÊNCIA
              </button>
            )}
          </div>
        )}

        {/* RADIO / CHAT TAB */}
        {tab === 'comm' && (
          <div className="h-full" style={{ backgroundColor: C.bg }}>
            <ChatInterface routeId={route.id} />
          </div>
        )}

        {/* INCIDENT TAB */}
        {tab === 'incident' && (
          <div style={{ backgroundColor: C.bg }}>
            <OccurrenceForm
              routeId={route.id}
              roundId={activeRound?.id}
              activeRound={activeRound}
              onEmergencyFinish={() => setShowEmergencyDialog(true)}
              isEmergencyFinish={emergencyConfirmed}
              onEmergencyFinishComplete={() => { setEmergencyConfirmed(false); finishRound(true); }}
            />
          </div>
        )}
      </main>

      {/* Floating SOS */}
      <button
        onClick={() => { setTab('incident'); }}
        className="fixed bottom-6 right-4 z-40 w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
        style={{
          background: `linear-gradient(135deg, ${C.red}, #B91C1C)`,
          boxShadow: `0 0 20px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.2)`,
          border: '2px solid rgba(239,68,68,0.5)',
        }}>
        <Zap className="w-5 h-5 text-white" />
        <span className="text-white text-[8px] font-black tracking-widest">SOS</span>
      </button>

      {/* QR Camera */}
      {cameraOpen && selectedPoint && (
        <TacticalScanner
          pointName={selectedPoint.name}
          onClose={() => { setCameraOpen(false); setSelectedPoint(null); }}
          onCapture={() => verifyPoint(selectedPoint.id)}
          C={C}
        />
      )}

      {/* Emergency dialog */}
      <AlertDialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <AlertDialogContent style={{ backgroundColor: C.surface, border: `1px solid rgba(239,68,68,0.3)` }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2" style={{ color: C.red }}>
              <XCircle className="w-5 h-5" /> FINALIZAÇÃO DE EMERGÊNCIA
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: C.muted }}>
              A missão será encerrada sem completar todos os pontos. Será necessário registrar uma ocorrência com justificativa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ backgroundColor: C.dim, color: C.text, border: `1px solid ${C.border}` }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              style={{ backgroundColor: C.red, color: 'white' }}
              onClick={() => { setShowEmergencyDialog(false); setEmergencyConfirmed(true); setTab('incident'); }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Tactical scanner UI ─────────────────────────────────────── */
function TacticalScanner({ pointName, onClose, onCapture, C }: { pointName: string; onClose: () => void; onCapture: () => void; C: ReturnType<typeof getGuardPalette> }) {
  const [phase, setPhase] = useState<'align' | 'scanning' | 'ok'>('align');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('scanning'), 1200);
    const t2 = setTimeout(() => setPhase('ok'), 2800);
    const t3 = setTimeout(() => onCapture(), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const phaseColor = phase === 'ok' ? C.green : phase === 'scanning' ? C.blue : C.amber;
  const phaseLabel = phase === 'ok' ? 'LEITURA OK' : phase === 'scanning' ? 'PROCESSANDO...' : 'ALINHE O QR CODE';

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#020810' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: C.dim }}>
          <ArrowLeft className="w-4 h-4" style={{ color: C.text }} />
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.muted }}>LEITURA DE PONTO</p>
          <p className="text-[12px] font-bold" style={{ color: C.text }}>{pointName}</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Camera area */}
      <div className="flex-1 relative flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at center, #0A1628 0%, #020810 100%)' }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(${C.green} 1px, transparent 1px), linear-gradient(90deg, ${C.green} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

        {/* Scanner frame */}
        <div className="relative w-64 h-64">
          {/* Corner brackets */}
          {[['top-0 left-0', 'rounded-tl-lg'], ['top-0 right-0 rotate-90', 'rounded-tr-lg'],
            ['bottom-0 left-0 -rotate-90', 'rounded-bl-lg'], ['bottom-0 right-0 rotate-180', 'rounded-br-lg']].map(([pos, _], i) => (
            <div key={i} className={`absolute ${pos} w-8 h-8`}
              style={{
                borderTop: `3px solid ${phaseColor}`,
                borderLeft: `3px solid ${phaseColor}`,
                boxShadow: `0 0 8px ${phaseColor}`,
                transform: i === 1 ? 'rotate(90deg)' : i === 2 ? 'rotate(-90deg)' : i === 3 ? 'rotate(180deg)' : undefined,
              }} />
          ))}

          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-8 h-8">
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: `${phaseColor}60`, transform: 'translateX(-50%)' }} />
              <div className="absolute top-1/2 left-0 right-0 h-px" style={{ backgroundColor: `${phaseColor}60`, transform: 'translateY(-50%)' }} />
              <div className="absolute inset-1/4 rounded-full border" style={{ borderColor: phaseColor, boxShadow: `0 0 10px ${phaseColor}` }} />
            </div>
          </div>

          {/* Scan line */}
          {phase === 'scanning' && (
            <div className="absolute left-2 right-2 h-0.5 rounded-full"
              style={{ backgroundColor: C.blue, boxShadow: `0 0 10px ${C.blue}`, animation: 'scanLine 1s ease-in-out infinite', top: '50%' }} />
          )}

          {/* Success overlay */}
          {phase === 'ok' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: `rgba(0,200,120,0.15)`, border: `2px solid ${C.green}` }}>
              <CheckCheck className="w-16 h-16" style={{ color: C.green }} />
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="absolute bottom-12 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: `${phaseColor}15`, border: `1px solid ${phaseColor}40` }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: phaseColor, boxShadow: `0 0 6px ${phaseColor}` }} />
            <span className="text-[11px] font-black tracking-widest" style={{ color: phaseColor }}>{phaseLabel}</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-mono" style={{ color: C.muted }}>
            <span className="flex items-center gap-1"><Signal className="w-3 h-3" style={{ color: C.green }} />GPS·OK</span>
            <span className="flex items-center gap-1"><Crosshair className="w-3 h-3" style={{ color: C.green }} />PRECISÃO 3m</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>
        <p className="text-center text-[10px] font-mono" style={{ color: C.muted }}>
          MANTENHA O DISPOSITIVO ESTÁVEL · LEITURA AUTOMÁTICA
        </p>
      </div>

      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 20%; }
          50% { top: 80%; }
        }
      `}</style>
    </div>
  );
}
