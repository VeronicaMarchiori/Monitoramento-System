// Script para adicionar coordenadas GPS aos pontos das rotas
// Este arquivo pode ser usado para atualizar as rotas existentes com coordenadas de exemplo

export const sampleCoordinates = {
  // Coordenadas de exemplo em São Paulo - Região da Av. Paulista
  'Blocos A, B e C': [
    { lat: -23.5634, lng: -46.6542 }, // Bloco A - Entrada Principal
    { lat: -23.5638, lng: -46.6545 }, // Bloco A - 1º Andar
    { lat: -23.5641, lng: -46.6548 }, // Bloco B - Térreo
    { lat: -23.5645, lng: -46.6551 }, // Bloco B - 2º Andar
    { lat: -23.5648, lng: -46.6554 }, // Bloco C - Entrada
  ],
  
  'Perímetro Externo': [
    { lat: -23.5630, lng: -46.6540 }, // Portão Principal
    { lat: -23.5625, lng: -46.6535 }, // Estacionamento Norte
    { lat: -23.5650, lng: -46.6560 }, // Área de Lazer
    { lat: -23.5655, lng: -46.6555 }, // Portão dos Fundos
  ],
  
  'Torre Empresarial': [
    { lat: -23.5610, lng: -46.6520 }, // Recepção
    { lat: -23.5612, lng: -46.6522 }, // 5º Andar - Sala 501
    { lat: -23.5614, lng: -46.6524 }, // 10º Andar - Sala 1001
    { lat: -23.5616, lng: -46.6526 }, // 15º Andar - Sala 1501
    { lat: -23.5618, lng: -46.6528 }, // Cobertura
    { lat: -23.5619, lng: -46.6529 }, // Terraço
  ],
  
  'Instalações Gerais': [
    { lat: -23.5670, lng: -46.6570 }, // Casa de Máquinas
    { lat: -23.5672, lng: -46.6572 }, // Gerador Principal
    { lat: -23.5674, lng: -46.6574 }, // Central de Incêndio
    { lat: -23.5676, lng: -46.6576 }, // Quadro Elétrico Geral
  ],
};

// Função para atualizar uma rota com coordenadas
export function addCoordinatesToRoute(route: any): any {
  if (!route.points || route.points.length === 0) {
    return route;
  }

  const routeName = route.name;
  let coordinates: { lat: number; lng: number }[] = [];

  // Buscar coordenadas baseadas no nome da rota
  if (routeName.includes('Blocos') || routeName.includes('Condomínio')) {
    coordinates = sampleCoordinates['Blocos A, B e C'];
  } else if (routeName.includes('Perímetro') || routeName.includes('Externa')) {
    coordinates = sampleCoordinates['Perímetro Externo'];
  } else if (routeName.includes('Torre') || routeName.includes('Empresarial')) {
    coordinates = sampleCoordinates['Torre Empresarial'];
  } else if (routeName.includes('Instalações') || routeName.includes('Supervisão')) {
    coordinates = sampleCoordinates['Instalações Gerais'];
  } else {
    // Coordenadas genéricas próximas a Av. Paulista
    coordinates = [
      { lat: -23.5505, lng: -46.6333 },
      { lat: -23.5510, lng: -46.6340 },
      { lat: -23.5515, lng: -46.6345 },
      { lat: -23.5520, lng: -46.6350 },
    ];
  }

  // Atualizar pontos com coordenadas
  const updatedPoints = route.points.map((point: any, index: number) => {
    const coord = coordinates[index % coordinates.length];
    return {
      ...point,
      latitude: coord.lat,
      longitude: coord.lng,
    };
  });

  return {
    ...route,
    points: updatedPoints,
  };
}

// Coordenadas para pontos individuais por tipo
export function getDefaultCoordinatesForPointType(type: string, index: number) {
  // Base: Av. Paulista, São Paulo
  const baseLat = -23.5505;
  const baseLng = -46.6333;
  
  // Adicionar pequeno offset baseado no índice
  const offset = index * 0.001;
  
  return {
    latitude: baseLat + offset,
    longitude: baseLng + offset,
  };
}
