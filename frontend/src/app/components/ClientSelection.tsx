import { useState } from 'react';
import { Search, ChevronRight, MapPin, Shield, Route, Building2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { getGuardPalette } from '../utils/guardPalette';

interface Client { id: string; name: string; address: string; activeRoutes: number; type: string; distance?: string; sector?: string; }

const clients: Client[] = [
  { id: '1', name: 'Shopping Center Norte', address: 'Av. Principal, 1000 — Centro', activeRoutes: 3, type: 'COMERCIAL', distance: '0.8 km', sector: 'ZONA-A' },
  { id: '2', name: 'Condomínio Vista Verde', address: 'Rua das Flores, 500 — Jardim América', activeRoutes: 2, type: 'RESIDENCIAL', distance: '1.4 km', sector: 'ZONA-B' },
  { id: '3', name: 'Fábrica Industrial ABC', address: 'Rod. Anhanguera Km 30', activeRoutes: 4, type: 'INDUSTRIAL', distance: '3.2 km', sector: 'ZONA-C' },
];

export function ClientSelection({ onSelectClient }: { onSelectClient: (id: string) => void }) {
  const { theme } = useTheme();
  const C = getGuardPalette(theme);
  const [search, setSearch] = useState('');
  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 space-y-4" style={{ backgroundColor: C.bg }}>
      <div>
        <p className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.muted }}>LOCAIS DE OPERAÇÃO</p>
        <p className="text-[15px] font-black mt-0.5" style={{ color: C.text }}>Selecione o local de operação</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 h-11 px-4 rounded-lg" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.muted }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="BUSCAR LOCAL..."
          className="flex-1 bg-transparent text-[12px] outline-none font-mono tracking-wider uppercase"
          style={{ color: C.text, '::placeholder': { color: C.muted } } as any}
        />
      </div>

      {/* List */}
      <div className="space-y-2.5">
        <p className="text-[9px] font-black tracking-[0.2em]" style={{ color: C.muted }}>
          {filtered.length} LOCAL{filtered.length !== 1 ? 'IS' : ''} DISPONÍVEL{filtered.length !== 1 ? 'IS' : ''}
        </p>
        {filtered.map((client, i) => (
          <button
            key={client.id}
            onClick={() => onSelectClient(client.id)}
            className="w-full rounded-xl overflow-hidden text-left active:scale-[0.99] transition-transform"
            style={{ border: `1px solid ${C.border}` }}
          >
            {/* Top badge */}
            <div className="flex items-center justify-between px-4 py-2"
              style={{ backgroundColor: 'rgba(0,200,120,0.05)', borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: C.green }}>
                  {client.sector}
                </span>
                <span style={{ color: C.muted }}>·</span>
                <span className="text-[8px] font-black tracking-wider" style={{ color: C.muted }}>{client.type}</span>
              </div>
              {client.distance && (
                <span className="text-[9px] font-mono" style={{ color: C.muted }}>{client.distance}</span>
              )}
            </div>

            {/* Body */}
            <div className="px-4 py-3.5" style={{ backgroundColor: C.card }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[18px]"
                  style={{ backgroundColor: C.dim, border: `1px solid ${C.border}` }}>
                  {client.type === 'COMERCIAL' ? '🏬' : client.type === 'RESIDENCIAL' ? '🏢' : '🏭'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black truncate" style={{ color: C.text }}>{client.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: C.muted }} />
                    <p className="text-[10px] font-mono truncate" style={{ color: C.muted }}>{client.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <div className="flex flex-col items-end">
                    <p className="text-[14px] font-black font-mono" style={{ color: C.green }}>{client.activeRoutes}</p>
                    <p className="text-[8px] font-black tracking-wider" style={{ color: C.muted }}>ROTAS</p>
                  </div>
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
