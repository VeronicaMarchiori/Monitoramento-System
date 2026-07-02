import { useState } from 'react';
import { Shield, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await signIn(formData.email.trim(), formData.password.trim());
      if (error) setError(error);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fill = (type: 'admin' | 'guard') =>
    setFormData(
      type === 'admin'
        ? { email: 'admin@admin.com', password: 'admin' }
        : { email: 'vigilante@vigilante.com', password: 'vigilante' },
    );

  return (
    <div className="min-h-screen flex">

      {/* ── Left: dark brand panel ── */}
      <div
        className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: '#0B1221' }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-[20px] tracking-tight">VigiaSystem</span>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)' }}>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-300 text-[12px] font-medium">Sistema operacional</span>
            </div>
            <h1 className="text-[36px] font-bold text-white leading-tight mb-3">
              Gestão completa<br />de rondas
            </h1>
            <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(148,163,184,0.85)' }}>
              Controle rotas, vigias e ocorrências em tempo real — do registro QR Code até o relatório final.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: '📍', text: 'Registro via QR Code e fotografia' },
              { icon: '🚨', text: 'Botão de emergência integrado' },
              { icon: '💬', text: 'Chat interno entre equipes' },
              { icon: '📊', text: 'Relatórios e histórico completos' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-[16px]">{f.icon}</span>
                <span className="text-[13px]" style={{ color: 'rgba(203,213,225,0.8)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[12px]" style={{ color: 'rgba(100,116,139,0.8)' }}>
          © 2024 VigiaSystem · Todos os direitos reservados
        </p>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex flex-col bg-background">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-foreground font-bold text-[15px]">VigiaSystem</span>
          </div>
          <div className="hidden lg:block" />

          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8 pb-10">
          <div className="w-full max-w-[360px]">

            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-foreground tracking-tight mb-1">Entrar</h2>
              <p className="text-[13px] text-muted-foreground">Acesse sua conta para continuar</p>
            </div>

            {/* Quick fill buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <button
                onClick={() => fill('admin')}
                className="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Admin</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">admin@admin.com</span>
              </button>
              <button
                onClick={() => fill('guard')}
                className="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-red-500 hover:bg-red-500/5 transition-all text-left"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Vigilante</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">vigilante@…</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground">ou insira manualmente</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-[13px] text-red-600 dark:text-red-400"
                style={{ backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                {error}
              </div>
            )}

            {/* Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">Email</label>
                <input
                  type="text"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-lg text-[13px] text-foreground bg-card border border-border outline-none transition-all placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full h-10 px-3 pr-10 rounded-lg text-[13px] text-foreground bg-card border border-border outline-none transition-all placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando…
                  </>
                ) : 'Entrar na plataforma'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
