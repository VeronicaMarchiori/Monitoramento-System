// Hook de geolocalização desabilitado
// Sistema agora usa apenas registro por câmera/QR Code

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export function useGeolocation() {
  // Retorna localização padrão (São Paulo) sem tentar acessar GPS
  const location: Coordinates = {
    latitude: -23.550520,
    longitude: -46.633308,
    accuracy: 0,
  };

  const error = null;
  const isLoading = false;
  const permissionStatus = 'granted' as const;

  const getCurrentLocation = () => {
    // Não faz nada - geolocalização desabilitada
    return Promise.resolve(location);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Retorna sempre 0 - função legacy mantida para compatibilidade
    return 0;
  };

  return {
    location,
    error,
    isLoading,
    permissionStatus,
    getCurrentLocation,
    calculateDistance,
  };
}
