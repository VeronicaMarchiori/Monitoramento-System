import { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Target, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface RoundMapProps {
  points: any[];
  completedPointIds: string[];
  currentLocation: { latitude: number; longitude: number } | null;
  onNavigateToPoint?: (point: any) => void;
}

export function RoundMap({ points, completedPointIds, currentLocation, onNavigateToPoint }: RoundMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [nextPoint, setNextPoint] = useState<any>(null);
  const [distanceToNext, setDistanceToNext] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Encontrar o próximo ponto não completado
  useEffect(() => {
    const next = points.find(p => !completedPointIds.includes(p.id));
    setNextPoint(next);
  }, [points, completedPointIds]);

  // Calcular distância até o próximo ponto
  useEffect(() => {
    if (currentLocation && nextPoint?.latitude && nextPoint?.longitude) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        nextPoint.latitude,
        nextPoint.longitude
      );
      setDistanceToNext(distance);
    } else {
      setDistanceToNext(null);
    }
  }, [currentLocation, nextPoint]);

  // Inicializar mapa
  useEffect(() => {
    const initMap = async () => {
      try {
        // Lazy load Leaflet
        const L = (await import('leaflet')).default;
        
        // Importar CSS do Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Fix Leaflet default icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapRef.current) return;

        // Centralizar no primeiro ponto ou localização atual
        const centerLat = currentLocation?.latitude || points[0]?.latitude || -23.5505;
        const centerLng = currentLocation?.longitude || points[0]?.longitude || -46.6333;

        const map = L.map(mapRef.current).setView([centerLat, centerLng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        setMapInstance(map);
        setMapLoaded(true);

        return () => {
          map.remove();
        };
      } catch (error) {
        setMapError('Erro ao carregar o mapa');
      }
    };

    initMap();
  }, []);

  // Atualizar marcadores no mapa
  useEffect(() => {
    if (!mapInstance) return;

    const L = (window as any).L;
    if (!L) return;

    // Limpar marcadores existentes
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
        mapInstance.removeLayer(layer);
      }
    });

    // Adicionar marcador de localização atual
    if (currentLocation) {
      const currentIcon = L.divIcon({
        html: `<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'current-location-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([currentLocation.latitude, currentLocation.longitude], { icon: currentIcon })
        .addTo(mapInstance)
        .bindPopup('Sua Localização');

      // Círculo de precisão
      L.circle([currentLocation.latitude, currentLocation.longitude], {
        radius: 50,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1,
      }).addTo(mapInstance);
    }

    // Adicionar marcadores dos pontos
    points.forEach((point, index) => {
      if (!point.latitude || !point.longitude) return;

      const isCompleted = completedPointIds.includes(point.id);
      const isNext = nextPoint?.id === point.id;
      
      let iconColor = '#6b7280'; // gray
      if (isCompleted) iconColor = '#10b981'; // green
      else if (isNext) iconColor = '#ef4444'; // red

      const icon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background: ${iconColor}; 
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
            ">
              ${isCompleted ? '✓' : index + 1}
            </div>
            ${isNext ? '<div style="position: absolute; top: -8px; right: -8px; background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; animation: pulse 2s infinite;"></div>' : ''}
          </div>
        `,
        className: 'checkpoint-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([point.latitude, point.longitude], { icon })
        .addTo(mapInstance);

      const popupContent = `
        <div style="min-width: 180px;">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${point.name}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
            ${point.type === 'qrcode' ? '📱 QR Code' : ''}
            ${point.type === 'photo' ? '📷 Foto' : ''}
          </div>
          <div style="background: #f3f4f6; padding: 6px 8px; border-radius: 4px; margin-top: 8px; font-size: 11px; font-family: monospace; color: #374151;">
            <div style="margin-bottom: 2px;">Lat: ${point.latitude.toFixed(6)}</div>
            <div>Lng: ${point.longitude.toFixed(6)}</div>
          </div>
          ${isCompleted ? '<div style="color: #10b981; font-size: 12px; margin-top: 8px; font-weight: bold;">✓ Completado</div>' : ''}
          ${isNext ? '<div style="color: #ef4444; font-size: 12px; margin-top: 8px; font-weight: bold;">→ Próximo ponto</div>' : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);

      // Abrir popup automaticamente para o próximo ponto
      if (isNext) {
        marker.openPopup();
      }
    });

    // Desenhar rota entre os pontos
    const routePoints = points
      .filter(p => p.latitude && p.longitude)
      .map(p => [p.latitude, p.longitude] as [number, number]);

    if (routePoints.length > 1) {
      L.polyline(routePoints, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
      }).addTo(mapInstance);
    }

    // Linha até o próximo ponto
    if (currentLocation && nextPoint?.latitude && nextPoint?.longitude) {
      L.polyline(
        [
          [currentLocation.latitude, currentLocation.longitude],
          [nextPoint.latitude, nextPoint.longitude],
        ],
        {
          color: '#ef4444',
          weight: 3,
          opacity: 0.8,
        }
      ).addTo(mapInstance);
    }

    // Ajustar visualização para mostrar todos os pontos
    const allPoints: [number, number][] = [];
    if (currentLocation) {
      allPoints.push([currentLocation.latitude, currentLocation.longitude]);
    }
    points.forEach(p => {
      if (p.latitude && p.longitude) {
        allPoints.push([p.latitude, p.longitude]);
      }
    });

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      mapInstance.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapInstance, points, completedPointIds, currentLocation, nextPoint]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // em metros
  };

  const openInGoogleMaps = () => {
    if (!nextPoint?.latitude || !nextPoint?.longitude) return;
    
    const url = currentLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${nextPoint.latitude},${nextPoint.longitude}&travelmode=walking`
      : `https://www.google.com/maps/search/?api=1&query=${nextPoint.latitude},${nextPoint.longitude}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Mapa */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary-600" />
              Mapa da Ronda
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="size-3" />
              {completedPointIds.length}/{points.length} pontos
            </Badge>
          </div>
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

      {/* Informações do próximo ponto */}
      {nextPoint && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white font-bold text-sm">
                      {points.findIndex(p => p.id === nextPoint.id) + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600">Próximo Ponto</p>
                      <p className="font-bold text-gray-900">{nextPoint.name}</p>
                    </div>
                  </div>
                  
                  {distanceToNext !== null && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Navigation className="size-4" />
                      <span>
                        Distância: {distanceToNext < 1000 
                          ? `${Math.round(distanceToNext)}m` 
                          : `${(distanceToNext / 1000).toFixed(2)}km`}
                      </span>
                    </div>
                  )}
                </div>

                {nextPoint.latitude && nextPoint.longitude && (
                  <Button
                    size="sm"
                    onClick={openInGoogleMaps}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <Navigation className="size-4 mr-2" />
                    Navegar
                  </Button>
                )}
              </div>

              {/* Progresso visual */}
              <div className="flex items-center gap-2">
                {points.map((point, index) => {
                  const isCompleted = completedPointIds.includes(point.id);
                  const isCurrent = point.id === nextPoint.id;
                  
                  return (
                    <div key={point.id} className="flex items-center flex-1">
                      <div
                        className={`h-2 flex-1 rounded-full transition-all ${
                          isCompleted
                            ? 'bg-green-500'
                            : isCurrent
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-gray-300'
                        }`}
                      />
                      {index < points.length - 1 && (
                        <div className="w-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todos os pontos completados */}
      {completedPointIds.length === points.length && points.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                <CheckCircle className="size-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-green-900">Todos os pontos completados!</p>
                <p className="text-sm text-green-700">Você pode finalizar a ronda agora.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Legenda:</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow" />
              <span className="text-gray-600">Sua localização</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow" />
              <span className="text-gray-600">Próximo ponto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600 border-2 border-white shadow" />
              <span className="text-gray-600">Ponto completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-600 border-2 border-white shadow" />
              <span className="text-gray-600">Ponto pendente</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adicionar animação de pulse para o próximo ponto */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
