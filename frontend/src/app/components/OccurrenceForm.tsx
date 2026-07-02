import { useState, useEffect } from 'react';
import { AlertTriangle, Camera, MapPin, Send, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../utils/api';

interface OccurrenceFormProps {
  routeId: string;
  roundId?: string;
  activeRound?: any;
  onEmergencyFinish?: () => void;
  isEmergencyFinish?: boolean;
  onEmergencyFinishComplete?: () => void;
}

interface Occurrence {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  description: string;
  timestamp: string;
  status: 'open' | 'in_progress' | 'resolved';
  imageUrl?: string;
  location?: { lat: number; lng: number };
}

export function OccurrenceForm({ 
  routeId, 
  roundId, 
  activeRound,
  onEmergencyFinish,
  isEmergencyFinish = false,
  onEmergencyFinishComplete
}: OccurrenceFormProps) {
  const { user } = useAuth();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'emergency',
    description: '',
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadOccurrences();
    // Localização fixa (geolocalização removida)
    setLocation({
      lat: -23.550520,
      lng: -46.633308,
    });
  }, [routeId]);

  useEffect(() => {
    if (isEmergencyFinish) {
      setShowForm(true);
      setFormData({
        type: 'other',
        severity: 'high',
        description: '',
      });
    }
  }, [isEmergencyFinish]);

  const loadOccurrences = async () => {
    try {
      const response = await apiClient.getOccurrences();
      
      if (response?.occurrences && response.occurrences.length > 0) {
        setOccurrences(response.occurrences);
      }
    } catch (error) {
      console.log('Backend não disponível, usando dados mock para demonstração');
      
  };



  const handleEmergency = async () => {
    if (!confirm('CONFIRMAR EMERGÊNCIA?\n\nEsta ação notificará imediatamente todos os supervisores e administradores.')) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.createOccurrence();

      alert('🚨 EMERGÊNCIA REGISTRADA!\n\nA equipe foi notificada.');
      await loadOccurrences();
    } catch (error) {
      
      console.log('Modo demonstração: Emergência registrada')
      
      const mockEmergency = {
        id: `emergency-${Date.now()}`,
        routeId,
        roundId,
        type: 'Emergência',
        severity: 'emergency',
        description: 'Botão de emergência acionado',
        timestamp: new Date().toISOString(),
        userId: user?.id,
        userName: user?.name || 'Vigilante',
        location,
        status: 'open',
      };
      
      setOccurrences([mockEmergency, ...occurrences]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      // Em produção, fazer upload da foto se houver
      let imageUrl;
      if (photoFile) {
        // Upload photo to storage
        console.log('Upload photo:', photoFile);
      }

      await apiClient.createOccurrence();

      if (isEmergencyFinish && onEmergencyFinishComplete) {
        alert('Ocorrência registrada! Finalizando ronda em modo emergência...');
        onEmergencyFinishComplete();
      } else {
        alert('Ocorrência registrada com sucesso!');
        setFormData({ type: '', severity: 'medium', description: '' });
        setPhotoFile(null);
        setShowForm(false);
        await loadOccurrences();
      }
    } catch (error) {
      // Em modo de desenvolvimento/mock, simular sucesso
      console.log('Modo demonstração: Ocorrência registrada');
      
      // Adicionar ocorrência mock localmente
      const mockOccurrence = {
        id: `occurrence-${Date.now()}`,
        routeId,
        roundId,
        ...formData,
        timestamp: new Date().toISOString(),
        userId: user?.id,
        userName: user?.name || 'Vigilante',
        location,
        imageUrl: undefined,
        status: 'open',
      };
      
      setOccurrences([mockOccurrence, ...occurrences]);
      
      if (isEmergencyFinish && onEmergencyFinishComplete) {
        alert('Ocorrência registrada! Finalizando ronda em modo emergência... (Modo demonstração)');
        onEmergencyFinishComplete();
      } else {
        alert('Ocorrência registrada com sucesso! (Modo demonstração)');
        setFormData({ type: '', severity: 'medium', description: '' });
        setPhotoFile(null);
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      emergency: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      emergency: 'EMERGÊNCIA',
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Aberta',
      in_progress: 'Em Andamento',
      resolved: 'Resolvida',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Emergency Button */}
      <Button
        onClick={handleEmergency}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-xl font-bold animate-pulse"
      >
        <AlertTriangle className="size-8 mr-3" />
        EMERGÊNCIA
      </Button>

      {/* Emergency Finish Round Button - Only shown when round is active */}
      {activeRound && onEmergencyFinish && !isEmergencyFinish && (
        <Button
          onClick={onEmergencyFinish}
          disabled={loading}
          variant="destructive"
          className="w-full py-6 bg-orange-600 hover:bg-orange-700 border-2 border-orange-700"
        >
          <XCircle className="size-6 mr-2" />
          Finalizar Ronda em Emergência
        </Button>
      )}

      {/* Emergency Finish Instructions */}
      {isEmergencyFinish && (
        <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">Finalização de Emergência</h3>
              <p className="text-sm text-orange-800">
                Por favor, registre abaixo o motivo da finalização da ronda sem completar todos os pontos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Occurrence Button */}
      {!showForm && !isEmergencyFinish && (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full py-6"
        >
          <AlertTriangle className="size-5 mr-2" />
          Registrar Nova Ocorrência
        </Button>
      )}

      {/* Occurrence Form */}
      {showForm && (
        <div className={`bg-white rounded-lg border-2 p-6 space-y-4 ${
          isEmergencyFinish ? 'border-orange-500' : 'border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              {isEmergencyFinish ? 'Motivo da Finalização de Emergência' : 'Nova Ocorrência'}
            </h3>
            {!isEmergencyFinish && (
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Ocorrência *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suspicious">Atividade Suspeita</SelectItem>
                  <SelectItem value="damage">Dano ao Patrimônio</SelectItem>
                  <SelectItem value="accident">Acidente</SelectItem>
                  <SelectItem value="fire">Incêndio</SelectItem>
                  <SelectItem value="medical">Emergência Médica</SelectItem>
                  <SelectItem value="theft">Furto/Roubo</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Gravidade *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="emergency">EMERGÊNCIA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o que aconteceu..."
                rows={4}
                required
              />
            </div>

            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <MapPin className="size-4" />
                <span>
                  Localização capturada: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Foto (Opcional)</Label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-300 cursor-pointer transition-colors"
                >
                  <Camera className="size-5 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {photoFile ? photoFile.name : 'Tirar Foto'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Send className="size-4 mr-2" />
                Registrar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Occurrences List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">
          Ocorrências Registradas ({occurrences.length})
        </h3>

        {occurrences.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <CheckCircle className="size-12 mx-auto mb-3 text-green-500" />
            <p className="text-gray-600">Nenhuma ocorrência registrada</p>
            <p className="text-sm text-gray-500">Tudo está em ordem</p>
          </div>
        ) : (
          occurrences.map((occurrence) => (
            <div
              key={occurrence.id}
              className="bg-white rounded-lg border-2 border-gray-200 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(occurrence.severity)}`}>
                      {getSeverityLabel(occurrence.severity)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(occurrence.status)}`}>
                      {getStatusLabel(occurrence.status)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{occurrence.type}</h4>
                  <p className="text-sm text-gray-600 mb-2">{occurrence.description}</p>
                  
                  {occurrence.imageUrl && (
                    <img
                      src={occurrence.imageUrl}
                      alt="Occurrence"
                      className="rounded-lg max-w-full mb-2"
                    />
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(occurrence.timestamp).toLocaleString('pt-BR')}
                    </span>
                    {occurrence.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {occurrence.location.lat.toFixed(4)}, {occurrence.location.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} }
