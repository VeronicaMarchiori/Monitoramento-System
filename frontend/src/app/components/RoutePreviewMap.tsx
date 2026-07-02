import { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, QrCode, Camera, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface RoutePreviewMapProps {
  route: any;
  open: boolean;
  onClose: () => void;
  onStartRoute: () => void;
}

export function RoutePreviewMap({ route, open, onClose, onStartRoute }: RoutePreviewMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!open) return;

    const initMap = async () => {
      try {
        // Lazy load Leaflet
        const L = (await import('leaflet')).default;
        
        // Importar CSS do Leaflet se ainda não foi importado
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Fix Leaflet default icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapRef.current) return;

        // Centralizar no primeiro ponto ou São Paulo
        const centerLat = route.points?.[0]?.latitude || -23.5505;
        const centerLng = route.points?.[0]?.longitude || -46.6333;

        const map = L.map(mapRef.current).setView([centerLat, centerLng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        setMapInstance(map);
        setMapLoaded(true);

        return () => {
          map.remove();
          setMapInstance(null);
          setMapLoaded(false);
        };
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError('Erro ao carregar o mapa');
      }
    };

    initMap();
  }, [open, route]);

  // Atualizar marcadores no mapa
  useEffect(() => {
    if (!mapInstance || !route.points) return;

    const L = (window as any).L;
    if (!L) return;

    // Limpar marcadores existentes
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.removeLayer(layer);
      }
    });

    // Adicionar marcadores dos pontos
    route.points.forEach((point: any, index: number) => {
      if (!point.latitude || !point.longitude) return;

      const icon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background: #3b82f6; 
              width: 36px; 
              height: 36px; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
            ">
              ${index + 1}
            </div>
          </div>
        `,
        className: 'checkpoint-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([point.latitude, point.longitude], { icon })
        .addTo(mapInstance);

      const popupContent = `
        <div style="min-width: 180px;">
          <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${point.name}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
            ${point.type === 'qrcode' ? '📱 Verificação por QR Code' : ''}
            ${point.type === 'photo' ? '📷 Verificação por Foto' : ''}
          </div>
          ${point.description ? `<div style="font-size: 12px; color: #999; margin-top: 4px;">${point.description}</div>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    // Desenhar rota entre os pontos
    const routePoints = route.points
      .filter((p: any) => p.latitude && p.longitude)
      .map((p: any) => [p.latitude, p.longitude] as [number, number]);

    if (routePoints.length > 1) {
      L.polyline(routePoints, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
      }).addTo(mapInstance);
    }

    // Ajustar visualização para mostrar todos os pontos
    if (routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints);
      mapInstance.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [mapInstance, route]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-primary-600" />
            {route.name}
          </DialogTitle>
          <DialogDescription>
            Visualize o mapa e todos os pontos de checagem desta rota
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Rota */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Tipo de Ronda</p>
              <p className="font-medium">
                {route.type === 'internal' && 'Ronda Interna'}
                {route.type === 'external' && 'Ronda Externa'}
                {route.type === 'supervision' && 'Supervisão'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Pontos de Verificação</p>
              <p className="font-medium">{route.points?.length || 0} pontos</p>
            </div>
            {route.scheduleStart && route.scheduleEnd && (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Horário Permitido</p>
                  <p className="font-medium">{route.scheduleStart} - {route.scheduleEnd}</p>
                </div>
                {route.daysOfWeek && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Dias da Semana</p>
                    <div className="flex flex-wrap gap-1">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <Badge
                          key={index}
                          variant={route.daysOfWeek.includes(index.toString()) ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mapa */}
          <Card className="border-primary-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mapa da Região</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {mapError ? (
                <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-b-lg">
                  <div className="text-center p-6">
                    <p className="text-red-600 font-medium mb-2">Erro ao carregar mapa</p>
                    <p className="text-sm text-gray-600">{mapError}</p>
                  </div>
                </div>
              ) : !mapLoaded ? (
                <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-b-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando mapa...</p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={mapRef} 
                  className="w-full h-[400px] rounded-b-lg"
                  style={{ zIndex: 0 }}
                />
              )}
            </CardContent>
          </Card>

          {/* Lista de Pontos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pontos de Verificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {route.points?.map((point: any, index: number) => (
                  <div
                    key={point.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{point.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        {point.type === 'qrcode' && (
                          <>
                            <QrCode className="size-3" /> 
                            <span>QR Code</span>
                          </>
                        )}
                        {point.type === 'photo' && (
                          <>
                            <Camera className="size-3" /> 
                            <span>Foto</span>
                          </>
                        )}
                      </div>
                      {point.latitude && point.longitude && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs font-medium text-gray-700 mb-1">📍 Coordenadas GPS:</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono">
                              Lat: {point.latitude.toFixed(6)}
                            </code>
                            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono">
                              Lng: {point.longitude.toFixed(6)}
                            </code>
                          </div>
                        </div>
                      )}
                      {point.description && (
                        <p className="text-xs text-gray-500 mt-2">{point.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legenda */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm font-medium text-primary-900 mb-2">📍 Informações Importantes</p>
            <ul className="text-sm text-primary-800 space-y-1">
              <li>• Os números no mapa indicam a ordem de visitação dos pontos</li>
              <li>• A linha azul mostra o trajeto sugerido entre os pontos</li>
              <li>• Para pontos de QR Code, tire uma foto do código para registrar</li>
              <li>• Você pode acessar chat e ocorrências durante a ronda</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              <X className="size-4 mr-2" />
              Fechar
            </Button>
            <Button
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              onClick={() => {
                onStartRoute();
                onClose();
              }}
            >
              <Navigation className="size-4 mr-2" />
              Iniciar Ronda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
