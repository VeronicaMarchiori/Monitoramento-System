import { useState } from 'react';
import {
  LayoutDashboard, Users, Building2, Route, MapPin,
  AlertTriangle, FileText, Settings, LogOut, Bell,
  Search, Sun, Moon, Menu, Shield, ChevronDown,
} from 'lucide-react';
import { useAuth, User } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { EmployeesManager } from './EmployeesManager';
import { ReportsManager } from './ReportsManager';
import { ClientsManager } from './ClientsManager';
import { RoutesManager } from './RoutesManager';
import { DashboardHome } from './DashboardHome';
import { OccurrencesManager } from './OccurrencesManager';

type MenuOption = 'home' | 'employees' | 'clients' | 'routes' | 'points' | 'occurrences' | 'reports' | 'settings';

interface DashboardProps { mockUser?: User; }

const navItems: { id: MenuOption; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'home',        label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'employees',   label: 'Funcionários',     icon: Users },
  { id: 'clients',     label: 'Empresas',         icon: Building2 },
  { id: 'routes',      label: 'Rondas',           icon: Route },
  { id: 'points',      label: 'Pontos de Ronda',  icon: MapPin },
  { id: 'occurrences', label: 'Ocorrências',      icon: AlertTriangle, badge: 3 },
  { id: 'reports',     label: 'Relatórios',       icon: FileText },
  { id: 'settings',    label: 'Configurações',    icon: Settings },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Dashboard({ mockUser }: DashboardProps) {
  const { user: authUser, signOut } = useAuth();
  const user = mockUser || authUser;
  const { theme, toggle: toggleTheme } = useTheme();
  const [current, setCurrent] = useState<MenuOption>('home');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderContent = () => {
    switch (current) {
      case 'home':        return <DashboardHome onNavigate={v => setCurrent(v as MenuOption)} />;
      case 'employees':   return <EmployeesManager />;
      case 'clients':     return <ClientsManager />;
      case 'routes':      return <RoutesManager />;
      case 'occurrences': return <OccurrencesManager />;
      case 'reports':     return <ReportsManager />;
      case 'points':      return <RoutesManager />;
      case 'settings':    return (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <Settings className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-base font-semibold text-foreground">Configurações</p>
            <p className="text-sm text-muted-foreground mt-1">Em desenvolvimento</p>
          </div>
        </div>
      );
      default: return <DashboardHome onNavigate={v => setCurrent(v as MenuOption)} />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0D1625' }}>

      {/* Brand */}
      <div className={`flex items-center gap-3 h-[64px] px-5 flex-shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}
        style={{ borderBottom: '1px solid rgba(203,213,225,0.07)' }}>
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/40">
          <Shield className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-[14px] leading-tight tracking-tight">VigiaSystem</p>
            <p className="text-[10px] font-medium tracking-wide" style={{ color: 'rgba(203,213,225,0.6)' }}>
              MONITORAMENTO PATRIMONIAL
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setCurrent(item.id); setMobileOpen(false); }}
              title={collapsed ? item.label : undefined}
              className={`relative w-full flex items-center gap-3 h-10 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                collapsed ? 'justify-center px-0' : 'px-3'
              }`}
              style={isActive
                ? { backgroundColor: 'rgba(59,130,246,0.12)', color: '#93C5FD' }
                : { color: 'rgba(203,213,225,0.75)', backgroundColor: 'transparent' }
              }
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(226,232,240,0.9)'; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(203,213,225,0.75)'; } }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" />
              )}
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: profile + actions */}
      <div className="px-3 pb-4 space-y-1 flex-shrink-0" style={{ borderTop: '1px solid rgba(203,213,225,0.07)' }}>
        {/* Profile */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg mt-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 shadow-md">
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px]" style={{ color: 'rgba(203,213,225,0.65)' }}>Administrador</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir' : 'Recolher'}
          className={`w-full flex items-center gap-2.5 h-9 rounded-lg text-[12px] transition-all px-3 ${collapsed ? 'justify-center px-0' : ''}`}
          style={{ color: 'rgba(203,213,225,0.6)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(226,232,240,0.8)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(203,213,225,0.6)'; }}
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
            {collapsed
              ? <><path d="M6 2L10 8L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>
              : <><path d="M10 2L6 8L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>}
          </svg>
          {!collapsed && <span>Recolher menu</span>}
        </button>

        <button
          onClick={signOut}
          title="Sair"
          className={`w-full flex items-center gap-2.5 h-9 rounded-lg text-[12px] transition-all px-3 ${collapsed ? 'justify-center px-0' : ''}`}
          style={{ color: 'rgba(203,213,225,0.6)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#F87171'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(203,213,225,0.6)'; }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-200 ease-in-out ${collapsed ? 'w-[64px]' : 'w-[240px]'}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 h-full w-[240px]" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-[64px] bg-card flex items-center px-5 lg:px-7 gap-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Greeting */}
          <div className="hidden md:block">
            <p className="text-[15px] font-bold text-foreground leading-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Administrador'}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden lg:flex items-center gap-2.5 h-9 rounded-xl px-3 ml-4"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-[13px] outline-none text-foreground placeholder:text-muted-foreground"
            />
            <kbd className="hidden xl:flex items-center gap-0.5 text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5 font-mono">⌘K</kbd>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Profile chip */}
            <button className="flex items-center gap-2.5 h-9 px-3 rounded-xl hover:bg-accent transition-colors group">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                {user?.name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[12px] font-semibold text-foreground leading-none">{user?.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Admin</p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
