import { useState } from 'react';
import { Route, MapPin, Plus, Trash2, Building2, Clock, Users, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';

interface RoutePoint {
  id: string;
  name: string;
  description: string;
  order: number;
  latitude: string;
  longitude: string;
  qrCode: string;
}

export function CreateRouteForm() {
  const [routeData, setRouteData] = useState({
    name: '',
    description: '',
    clientId: '',
    type: 'internal' as 'internal' | 'external' | 'supervision',
    estimatedDuration: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    assignedGuards: [] as string[],
  });

  const [points, setPoints] = useState<RoutePoint[]>([]);

  const mockClients = [
    { id: '1', name: 'Shopping Center Norte' },
    { id: '2', name: 'Condomínio Residencial Vista Verde' },
    { id: '3', name: 'Edifício Comercial Central' },
  ];

  const mockGuards = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' },
    { id: '3', name: 'Pedro Oliveira' },
  ];

  const addPoint = () => {
    const newPoint: RoutePoint = {
      id: Date.now().toString(),
      name: '',
      description: '',
      order: points.length + 1,
      latitude: '',
      longitude: '',
      qrCode: `QR-${Date.now()}`,
    };
    setPoints([...points, newPoint]);
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id).map((p, index) => ({ ...p, order: index + 1 })));
  };

  const updatePoint = (id: string, field: keyof RoutePoint, value: string) => {
    setPoints(points.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!routeData.name || !routeData.clientId || points.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um ponto.');
      return;
    }

    console.log('Rota criada:', { ...routeData, points });
    alert('Rota criada com sucesso! (Modo demonstração)');
    
    // Reset form
    setRouteData({
      name: '',
      description: '',
      clientId: '',
      type: 'internal',
      estimatedDuration: '',
      frequency: 'daily',
      assignedGuards: [],
    });
    setPoints([]);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      internal: 'Ronda Interna',
      external: 'Ronda Externa',
      supervision: 'Supervisão',
    };
    return labels[type as keyof typeof labels];
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 flex items-center gap-2">
          <Route className="size-8 text-primary-600" />
          Criar Nova Rota
        </h1>
        <p className="text-gray-600 mt-1">
          Configure uma nova rota de vigilância com pontos de verificação
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="size-5" />
            Informações Básicas
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <Select
                value={routeData.clientId}
                onValueChange={(value) => setRouteData({ ...routeData, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Rota *</Label>
              <Input
                id="name"
                value={routeData.name}
                onChange={(e) => setRouteData({ ...routeData, name: e.target.value })}
                placeholder="Ex: Ronda Noturna - Pavimento 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={routeData.description}
                onChange={(e) => setRouteData({ ...routeData, description: e.target.value })}
                placeholder="Descreva os objetivos e detalhes desta rota..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Ronda *</Label>
                <Select
                  value={routeData.type}
                  onValueChange={(value: any) => setRouteData({ ...routeData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Ronda Interna</SelectItem>
                    <SelectItem value="external">Ronda Externa</SelectItem>
                    <SelectItem value="supervision">Supervisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência *</Label>
                <Select
                  value={routeData.frequency}
                  onValueChange={(value: any) => setRouteData({ ...routeData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Duração Estimada (minutos)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                value={routeData.estimatedDuration}
                onChange={(e) => setRouteData({ ...routeData, estimatedDuration: e.target.value })}
                placeholder="Ex: 45"
              />
            </div>
          </div>
        </Card>

        {/* Route Points */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="size-5" />
              Pontos de Verificação
            </h2>
            <Button type="button" onClick={addPoint} size="sm" variant="outline">
              <Plus className="size-4 mr-2" />
              Adicionar Ponto
            </Button>
          </div>

          {points.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <MapPin className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Nenhum ponto adicionado</p>
              <p className="text-sm text-gray-500">Clique em "Adicionar Ponto" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {points.map((point, index) => (
                <div key={point.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center size-8 rounded-full bg-primary-100 text-primary-600 font-semibold">
                        {point.order}
                      </div>
                      <span className="font-medium text-gray-900">Ponto {point.order}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removePoint(point.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`point-name-${point.id}`}>Nome do Ponto *</Label>
                      <Input
                        id={`point-name-${point.id}`}
                        value={point.name}
                        onChange={(e) => updatePoint(point.id, 'name', e.target.value)}
                        placeholder="Ex: Entrada Principal"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`point-description-${point.id}`}>Descrição</Label>
                      <Input
                        id={`point-description-${point.id}`}
                        value={point.description}
                        onChange={(e) => updatePoint(point.id, 'description', e.target.value)}
                        placeholder="Detalhes sobre o ponto de verificação"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`point-lat-${point.id}`}>Latitude</Label>
                        <Input
                          id={`point-lat-${point.id}`}
                          value={point.latitude}
                          onChange={(e) => updatePoint(point.id, 'latitude', e.target.value)}
                          placeholder="-23.550520"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`point-lng-${point.id}`}>Longitude</Label>
                        <Input
                          id={`point-lng-${point.id}`}
                          value={point.longitude}
                          onChange={(e) => updatePoint(point.id, 'longitude', e.target.value)}
                          placeholder="-46.633308"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded text-sm text-gray-600">
                      <span className="font-medium">QR Code:</span> {point.qrCode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Assigned Guards */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="size-5" />
            Vigilantes Designados (Opcional)
          </h2>

          <div className="space-y-2">
            <Label>Selecione os vigilantes responsáveis por esta rota</Label>
            <div className="grid grid-cols-2 gap-2">
              {mockGuards.map((guard) => (
                <label
                  key={guard.id}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={routeData.assignedGuards.includes(guard.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRouteData({
                          ...routeData,
                          assignedGuards: [...routeData.assignedGuards, guard.id],
                        });
                      } else {
                        setRouteData({
                          ...routeData,
                          assignedGuards: routeData.assignedGuards.filter(id => id !== guard.id),
                        });
                      }
                    }}
                    className="size-4"
                  />
                  <span className="text-sm">{guard.name}</span>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Resumo da Rota</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-gray-600" />
              <span>
                <span className="text-gray-600">Cliente:</span>{' '}
                <span className="font-medium">
                  {mockClients.find(c => c.id === routeData.clientId)?.name || 'Não selecionado'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Route className="size-4 text-gray-600" />
              <span>
                <span className="text-gray-600">Tipo:</span>{' '}
                <span className="font-medium">{getTypeLabel(routeData.type)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-gray-600" />
              <span>
                <span className="text-gray-600">Pontos de Verificação:</span>{' '}
                <span className="font-medium">{points.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-gray-600" />
              <span>
                <span className="text-gray-600">Vigilantes Designados:</span>{' '}
                <span className="font-medium">{routeData.assignedGuards.length}</span>
              </span>
            </div>
            {routeData.estimatedDuration && (
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-gray-600" />
                <span>
                  <span className="text-gray-600">Duração Estimada:</span>{' '}
                  <span className="font-medium">{routeData.estimatedDuration} minutos</span>
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              if (confirm('Deseja cancelar a criação desta rota? Todas as informações serão perdidas.')) {
                setRouteData({
                  name: '',
                  description: '',
                  clientId: '',
                  type: 'internal',
                  estimatedDuration: '',
                  frequency: 'daily',
                  assignedGuards: [],
                });
                setPoints([]);
              }
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700">
            Criar Rota
          </Button>
        </div>
      </form>
    </div>
  );
}
