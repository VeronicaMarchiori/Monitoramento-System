import { useState, useEffect } from 'react';
import { Play, MapPin, Navigation, CheckCircle, Clock, AlertTriangle, X, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { apiClient } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { QRCodePhotoCapture } from './QRCodePhotoCapture';
import { RoundMap } from './RoundMap';

interface Round {
  id: string;
  routeId: string;
  status: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
}

export function RoundsInterface() {
  const { user } = useAuth();
  const { location, getCurrentLocation, calculateDistance } = useGeolocation();
  const { isOnline, queueAction } = useOfflineSync();
  
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<any>(null);

  useEffect(() => {
    loadRoutes();
    getCurrentLocation();
  }, []);

  // Atualizar localização em tempo real durante a ronda
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (activeRound && currentRoute) {
      intervalId = setInterval(() => {
        getCurrentLocation();
      }, 10000);
      getCurrentLocation();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeRound, currentRoute]);

  const loadRoutes = async () => {
    try {
      const { routes: data } = await apiClient.getRoutes();
      
      if (!data || data.length === 0) {
        // Dados MOCK para teste
        const mockRoutes = [
          {
            id: 'mock-1',
            name: 'Ronda Shopping - Perímetro',
            type: 'external',
            scheduleStart: '00:00',
            scheduleEnd: '23:59',
            daysOfWeek: ['0', '1', '2', '3', '4', '5', '6'],
            points: [
              { id: 'p1', name: 'Portaria Principal', type: 'qrcode', latitude: -23.5505, longitude: -46.6333 },
              { id: 'p2', name: 'Estacionamento Subsolo', type: 'geolocation', latitude: -23.5510, longitude: -46.6338 },
              { id: 'p3', name: 'Saída de Emergência', type: 'qrcode', latitude: -23.5515, longitude: -46.6343 },
              { id: 'p4', name: 'Terraço', type: 'photo', latitude: -23.5520, longitude: -46.6348 },
              { id: 'p5', name: 'Central de Segurança', type: 'qrcode', latitude: -23.5525, longitude: -46.6353 },
            ]
          },
          {
            id: 'mock-2',
            name: 'Ronda Hospital',
            type: 'internal',
            scheduleStart: '00:00',
            scheduleEnd: '23:59',
            daysOfWeek: ['0', '1', '2', '3', '4', '5', '6'],
            points: [
              { id: 'p6', name: 'Recepção', type: 'qrcode', latitude: -23.5530, longitude: -46.6360 },
              { id: 'p7', name: 'Pronto Socorro', type: 'geolocation', latitude: -23.5535, longitude: -46.6365 },
              { id: 'p8', name: 'UTI 3º Andar', type: 'qrcode', latitude: -23.5540, longitude: -46.6370 },
            ]
          }
        ];
        setRoutes(mockRoutes);
      } else {
        setRoutes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRound = async (route: any) => {
    try {
      const roundData = {
        routeId: route.id,
        startedAt: new Date().toISOString(),
        userId: user?.id,
      };

      if (isOnline) {
        const { round } = await apiClient.createRound(roundData);
        setActiveRound(round);
      } else {
        const tempRound = { ...roundData, id: crypto.randomUUID(), status: 'in_progress' as const };
        setActiveRound(tempRound);
        queueAction({ type: 'create', entityType: 'ROUNDS', data: tempRound });
      }

      setCurrentRoute(route);
      setCheckpoints([]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkPoint = async (point: any) => {
    setCurrentPoint(point);

    if (point.type === 'qrcode') {
      setScannerOpen(true);
    } else if (point.type === 'photo') {
      setCameraOpen(true);
    }
  };

  const registerCheckpoint = async (point: any, data?: any) => {
    const checkpointData = {
      roundId: activeRound!.id,
      pointId: point.id,
      pointName: point.name,
      type: point.type,
      timestamp: new Date().toISOString(),
      location: location ? { latitude: location.latitude, longitude: location.longitude } : null,
      ...data,
    };

    try {
      if (isOnline) {
        await apiClient.createCheckpoint(checkpointData);
      } else {
        queueAction({ type: 'create', entityType: 'CHECKPOINTS', data: { ...checkpointData, id: crypto.randomUUID() } });
      }

      setCheckpoints([...checkpoints, checkpointData]);
      setCurrentPoint(null);
      setScannerOpen(false);
      setCameraOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const completeRound = async () => {
    if (!activeRound) return;

    try {
      const updateData = {
        status: 'completed',
        completedAt: new Date().toISOString(),
      };

      if (isOnline) {
        await apiClient.updateRound(activeRound.id, updateData);
      } else {
        queueAction({ type: 'update', entityType: 'ROUNDS', data: { id: activeRound.id, ...updateData } });
      }

      setActiveRound(null);
      setCurrentRoute(null);
      setCheckpoints([]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isPointCompleted = (pointId: string) => {
    return checkpoints.some(cp => cp.pointId === pointId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // RONDA ATIVA
  if (activeRound && currentRoute) {
    const completedPointIds = checkpoints.map(cp => cp.pointId);
    const nextPoint = currentRoute.points?.find((p: any) => !completedPointIds.includes(p.id));
    
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => {
                if (confirm('Deseja sair da ronda?')) {
                  setActiveRound(null);
                  setCurrentRoute(null);
                  setCheckpoints([]);
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">{currentRoute.name}</h1>
              <p className="text-sm text-gray-500">
                {checkpoints.length} de {currentRoute.points?.length || 0} pontos verificados
              </p>
            </div>
          </div>

          {/* Botões de Ação - Pontos (vermelho), Chat, Ocorrências (vermelho) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                const element = document.getElementById('pontos-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center py-3 rounded-lg border border-red-200 bg-white hover:bg-red-50 transition-colors"
            >
              <MapPin className="size-5 text-red-600 mb-1" />
              <span className="text-xs font-medium text-red-600">Pontos</span>
            </button>
            <button
              className="flex flex-col items-center justify-center py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="size-5 text-gray-700 mb-1" />
              <span className="text-xs font-medium text-gray-700">Chat</span>
            </button>
            <button
              className="flex flex-col items-center justify-center py-3 rounded-lg border border-red-200 bg-white hover:bg-red-50 transition-colors"
            >
              <AlertTriangle className="size-5 text-red-600 mb-1" />
              <span className="text-xs font-medium text-red-600">Ocorrências</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Card do Próximo Ponto - VERMELHO (ponto que falta) */}
          {nextPoint && (
            <div className="bg-red-600 rounded-2xl p-5 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-1">Faltam {(currentRoute.points?.length || 0) - checkpoints.length} pontos</p>
              <h2 className="text-xl font-bold mb-1">{nextPoint.name}</h2>
              <p className="text-sm opacity-90 mb-3">Ponto {(currentRoute.points?.findIndex((p: any) => p.id === nextPoint.id) || 0) + 1} de {currentRoute.points?.length || 0}</p>
              
              {nextPoint.latitude && nextPoint.longitude && location && (
                <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-5" />
                    <span className="text-sm font-medium">
                      {calculateDistance(
                        location.latitude,
                        location.longitude,
                        nextPoint.latitude,
                        nextPoint.longitude
                      ) < 1000 
                        ? `${Math.round(calculateDistance(location.latitude, location.longitude, nextPoint.latitude, nextPoint.longitude))}m`
                        : `${(calculateDistance(location.latitude, location.longitude, nextPoint.latitude, nextPoint.longitude) / 1000).toFixed(1)}km`
                      }
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const url = location
                        ? `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${nextPoint.latitude},${nextPoint.longitude}&travelmode=walking`
                        : `https://www.google.com/maps/search/?api=1&query=${nextPoint.latitude},${nextPoint.longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors"
                  >
                    Navegar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Aviso de Localização - Amarelo */}
          {!location && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 text-sm mb-1">Aviso de Localização</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Erro ao obter localização. Permissão negada. Por favor, permita o acesso à localização nas configurações do seu navegador. Usando localização padrão (São Paulo).
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs whitespace-nowrap"
                  onClick={() => getCurrentLocation()}
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Mapa */}
          {currentRoute.points && currentRoute.points.some((p: any) => p.latitude && p.longitude) && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <RoundMap
                points={currentRoute.points}
                completedPointIds={completedPointIds}
                currentLocation={location}
              />
            </div>
          )}

          {/* Lista de Pontos */}
          <div id="pontos-section" className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Pontos da Rota</h3>
            {currentRoute.points?.map((point: any, index: number) => {
              const completed = isPointCompleted(point.id);
              const isNext = nextPoint?.id === point.id;
              const distance = location && point.latitude && point.longitude
                ? calculateDistance(location.latitude, location.longitude, point.latitude, point.longitude)
                : null;
              
              return (
                <div
                  key={point.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    completed 
                      ? 'bg-green-50 border-green-200' 
                      : isNext
                      ? 'bg-red-50 border-red-200 shadow-sm'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    completed ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'
                  }`}>
                    {completed ? '✓' : index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{point.name}</h4>
                    {point.latitude && point.longitude && (
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                      </p>
                    )}
                    {distance !== null && (
                      <p className="text-xs text-gray-600 mt-1">
                        {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`} de distância
                      </p>
                    )}
                  </div>

                  {/* Botão de Navegação - VERMELHO para próximo ponto (que falta) */}
                  {!completed && point.latitude && point.longitude && (
                    <button
                      onClick={() => {
                        const url = location
                          ? `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${point.latitude},${point.longitude}&travelmode=walking`
                          : `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
                        window.open(url, '_blank');
                      }}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-colors ${
                        isNext 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      <Navigation className="size-5" />
                    </button>
                  )}

                  {completed && (
                    <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white">
                      <CheckCircle className="size-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botão Finalizar - AZUL */}
          {checkpoints.length === currentRoute.points?.length && currentRoute.points?.length > 0 && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-semibold rounded-xl"
              onClick={completeRound}
            >
              <CheckCircle className="size-6 mr-2" />
              Finalizar Ronda
            </Button>
          )}
        </div>

        {/* Dialogs */}
        <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escanear QR Code</DialogTitle>
              <DialogDescription>
                Posicione o QR Code dentro da área de captura
              </DialogDescription>
            </DialogHeader>
            <QRCodePhotoCapture
              onCapture={(data) => registerCheckpoint(currentPoint, { qrData: data })}
              onCancel={() => setScannerOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Capturar Foto</DialogTitle>
              <DialogDescription>
                Tire uma foto do local para registrar o checkpoint
              </DialogDescription>
            </DialogHeader>
            <QRCodePhotoCapture
              onCapture={(data) => registerCheckpoint(currentPoint, { photoData: data })}
              onCancel={() => setCameraOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // SELEÇÃO DE ROTAS
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-900">Minhas Rondas</h2>
        <p className="text-sm text-gray-500 mt-1">Selecione uma rota para começar</p>
      </div>

      <div className="p-4 space-y-3">
        {routes.map((route) => (
          <div
            key={route.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{route.name}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {route.points?.length || 0} pontos • {route.type === 'internal' ? 'Interna' : route.type === 'external' ? 'Externa' : 'Supervisão'}
              </p>
              
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-semibold rounded-lg"
                onClick={() => startRound(route)}
              >
                <Play className="size-5 mr-2" />
                Iniciar Ronda
              </Button>
            </div>
          </div>
        ))}

        {routes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <AlertTriangle className="size-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-900 font-semibold mb-1">Nenhuma rota disponível</p>
            <p className="text-sm text-gray-500">Entre em contato com o administrador</p>
          </div>
        )}
      </div>
    </div>
  );
}
