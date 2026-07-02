import { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin, ArrowRight } from 'lucide-react';

interface Point {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  verified: boolean;
}

interface RouteMapProps {
  points: Point[];
  userLocation: { lat: number; lng: number } | null;
  currentPointIndex: number;
}

export function RouteMap({ points, userLocation, currentPointIndex }: RouteMapProps) {
  const [distance, setDistance] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nextPoint = points[currentPointIndex];

  useEffect(() => {
    if (userLocation && nextPoint) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        nextPoint.latitude,
        nextPoint.longitude
      );
      setDistance(dist);

      const bear = calculateBearing(
        userLocation.lat,
        userLocation.lng,
        nextPoint.latitude,
        nextPoint.longitude
      );
      setBearing(bear);
    }
  }, [userLocation, nextPoint]);

  useEffect(() => {
    drawMap();
  }, [points, userLocation, currentPointIndex]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  };

  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return ((θ * 180) / Math.PI + 360) % 360; // Bearing em graus
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Limpar canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    if (points.length === 0) return;

    // Calcular bounds
    const lats = points.map(p => p.latitude);
    const lngs = points.map(p => p.longitude);
    if (userLocation) {
      lats.push(userLocation.lat);
      lngs.push(userLocation.lng);
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    const padding = 40;

    // Função para converter coordenadas geográficas em pixels
    const toPixel = (lat: number, lng: number) => {
      const x = padding + ((lng - minLng) / lngRange) * (width - 2 * padding);
      const y = height - padding - ((lat - minLat) / latRange) * (height - 2 * padding);
      return { x, y };
    };

    // Desenhar linhas entre pontos
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    points.forEach((point, index) => {
      const { x, y } = toPixel(point.latitude, point.longitude);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Desenhar linha do usuário até o próximo ponto
    if (userLocation && nextPoint) {
      const userPixel = toPixel(userLocation.lat, userLocation.lng);
      const nextPixel = toPixel(nextPoint.latitude, nextPoint.longitude);
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(userPixel.x, userPixel.y);
      ctx.lineTo(nextPixel.x, nextPixel.y);
      ctx.stroke();

      // Desenhar seta de direção
      const angle = Math.atan2(nextPixel.y - userPixel.y, nextPixel.x - userPixel.x);
      const arrowSize = 15;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(nextPixel.x, nextPixel.y);
      ctx.lineTo(
        nextPixel.x - arrowSize * Math.cos(angle - Math.PI / 6),
        nextPixel.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        nextPixel.x - arrowSize * Math.cos(angle + Math.PI / 6),
        nextPixel.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }

    // Desenhar pontos
    points.forEach((point, index) => {
      const { x, y } = toPixel(point.latitude, point.longitude);
      
      // Círculo do ponto
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      
      if (point.verified) {
        ctx.fillStyle = '#22c55e'; // Verde para verificado
      } else if (index === currentPointIndex) {
        ctx.fillStyle = '#ef4444'; // Vermelho para próximo
      } else {
        ctx.fillStyle = '#6b7280'; // Cinza para pendente
      }
      
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Número do ponto
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);

      // Nome do ponto
      ctx.fillStyle = '#000000';
      ctx.font = '12px sans-serif';
      ctx.fillText(point.name, x, y + 35);
    });

    // Desenhar posição do usuário
    if (userLocation) {
      const { x, y } = toPixel(userLocation.lat, userLocation.lng);
      
      // Círculo externo pulsante
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fill();

      // Círculo do usuário
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Ícone de navegação
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📍', x, y);
    }
  };

  const getDirection = (bearing: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  return (
    <div className="space-y-4">
      {/* Informações de navegação */}
      {nextPoint && userLocation && distance !== null && bearing !== null && (
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Navigation 
                className="size-6" 
                style={{ transform: `rotate(${bearing}deg)` }}
              />
              <div>
                <p className="text-sm opacity-90">Próximo Ponto:</p>
                <p className="font-bold">{nextPoint.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatDistance(distance)}</p>
              <p className="text-sm opacity-90">{getDirection(bearing)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm mt-3 bg-red-600 rounded p-2">
            <MapPin className="size-4" />
            <span>
              Ponto {currentPointIndex + 1} de {points.length}
            </span>
            <ArrowRight className="size-4 ml-auto" />
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto"
          style={{ maxHeight: '400px' }}
        />
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2 bg-white p-2 rounded border">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Você</span>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded border">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Próximo</span>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded border">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Verificado</span>
        </div>
      </div>
    </div>
  );
}
