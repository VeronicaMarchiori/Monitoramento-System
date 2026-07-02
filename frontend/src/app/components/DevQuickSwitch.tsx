import { useState } from 'react';
import { Zap, User, Shield, Trash2, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function DevQuickSwitch() {
  const { user, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Apenas em desenvolvimento
  if (import.meta.env.PROD) return null;

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 left-4 z-[9999] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
        title="Dev Quick Switch"
      >
        <Zap className="h-5 w-5" />
      </button>

      {/* Painel */}
      {open && (
        <div className="fixed bottom-20 left-4 z-[9999] bg-white rounded-lg shadow-2xl border-2 border-purple-600 w-72 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3">
            <h3 className="font-bold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Dev Quick Switch
            </h3>
          </div>

          {/* Status Atual */}
          <div className="p-3 bg-gray-50 border-b">
            <p className="text-xs text-gray-600 mb-1">Status Atual:</p>
            {user ? (
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${user.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'}`} />
                <span className="text-sm font-semibold">
                  {user.name} ({user.role === 'admin' ? 'Admin' : 'Vigilante'})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600">Não logado</span>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="p-3 space-y-2">
            <button
              onClick={async () => {
                await signIn('admin@admin.com', 'admin');
                setOpen(false);
                window.location.reload();
              }}
              className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <Shield className="h-4 w-4" />
              Login como Admin
            </button>

            <button
              onClick={async () => {
                await signIn('vigilante@vigilante.com', 'vigilante');
                setOpen(false);
                window.location.reload();
              }}
              className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <User className="h-4 w-4" />
              Login como Vigilante
            </button>

            <button
              onClick={() => {
                signOut();
                setOpen(false);
                window.location.reload();
              }}
              className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Ir para Tela de Login
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                setOpen(false);
                window.location.reload();
              }}
              className="w-full flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Limpar LocalStorage
            </button>
          </div>

          {/* Footer */}
          <div className="p-2 bg-gray-50 border-t">
            <p className="text-xs text-gray-500 text-center">
              💡 Ou mude DEV_SCREEN no App.tsx
            </p>
          </div>
        </div>
      )}
    </>
  );
}
