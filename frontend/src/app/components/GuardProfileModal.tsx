import { X, Phone, Mail, MapPin, Calendar, Shield, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import userAvatar from 'figma:asset/d63bbb04164cbfd88f680768bd7650b11073d372.png';

interface GuardProfileModalProps {
  guard: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    address?: string;
    createdAt?: string;
  };
  onClose: () => void;
}

export function GuardProfileModal({ guard, onClose }: GuardProfileModalProps) {
  // Dados mock de estatísticas do vigilante
  const stats = {
    completedRoutes: 245,
    activeHours: 1420,
    lastActivity: '2 horas atrás',
    status: 'active' as 'active' | 'inactive',
  };

  const recentRoutes = [
    { id: '1', name: 'Rota Noturna - Bloco A', date: '2024-11-16', status: 'completed' },
    { id: '2', name: 'Rota Externa - Perímetro', date: '2024-11-15', status: 'completed' },
    { id: '3', name: 'Supervisão - Garagem', date: '2024-11-14', status: 'completed' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary-600 text-white p-6 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex-shrink-0">
              <img src={userAvatar} alt={guard.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-xl">{guard.name}</h2>
              <p className="text-primary-100 text-sm">{guard.role || 'Vigilante'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div
              className={`size-3 rounded-full ${
                stats.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm font-medium text-gray-700">
              {stats.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              Última atividade: {stats.lastActivity}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <CheckCircle className="size-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.completedRoutes}</p>
            <p className="text-xs text-gray-600 mt-1">Rondas Completas</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Clock className="size-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.activeHours}h</p>
            <p className="text-xs text-gray-600 mt-1">Horas Ativas</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Shield className="size-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">98%</p>
            <p className="text-xs text-gray-600 mt-1">Taxa de Sucesso</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 space-y-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Informações de Contato</h3>
          
          {guard.email && (
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Mail className="size-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">E-mail</p>
                <p className="text-sm font-medium">{guard.email}</p>
              </div>
            </div>
          )}

          {guard.phone && (
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Phone className="size-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefone</p>
                <p className="text-sm font-medium">{guard.phone}</p>
              </div>
            </div>
          )}

          {guard.address && (
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MapPin className="size-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Endereço</p>
                <p className="text-sm font-medium">{guard.address}</p>
              </div>
            </div>
          )}

          {guard.createdAt && (
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="size-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Data de Cadastro</p>
                <p className="text-sm font-medium">
                  {new Date(guard.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Routes */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Rondas Recentes</h3>
          <div className="space-y-2">
            {recentRoutes.map((route) => (
              <div
                key={route.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="size-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{route.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(route.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  Concluída
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <Button onClick={onClose} className="w-full bg-primary-600 hover:bg-primary-700">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
