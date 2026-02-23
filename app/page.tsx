"use client";

import React, { useState, useEffect, memo } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface ConflictoVivo {
  id: string;
  tipo: string;
  coordenadas: [number, number];
  nivelPeligro: number;
}

const VISTA_INICIAL = {
  longitude: -102.5528,
  latitude: 23.6345,
  zoom: 2.5,
  pitch: 30,
  bearing: 0
};

const ESTILO_MAPA_OSCURO = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

function DeckGLOverlay(props: any) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

// Extraemos la capa de animación para que no re-renderice todo el mapa 30 veces por segundo
const AnimatedPulseLayer = memo(({ conflicto }: { conflicto: ConflictoVivo }) => {
  const [fasePulso, setFasePulso] = useState(0);

  useEffect(() => {
    const intervaloAnimacion = setInterval(() => {
      setFasePulso((faseActual) => (faseActual + 2) % 100);
    }, 30);
    return () => clearInterval(intervaloAnimacion);
  }, []);

  const capas = [
    new ScatterplotLayer<ConflictoVivo>({
      id: 'capa-conflicto-pulso',
      data: [conflicto],
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      getPosition: (d) => d.coordenadas,
      getRadius: (d) => 5000 + (fasePulso * 300),
      getFillColor: [255, 0, 0, 150 - (fasePulso * 1.5)],
      getLineColor: [255, 0, 0, 255 - fasePulso],
      updateTriggers: {
        getRadius: [fasePulso],
        getFillColor: [fasePulso],
        getLineColor: [fasePulso],
        getPosition: [conflicto]
      }
    }),
    new ScatterplotLayer<ConflictoVivo>({
      id: 'capa-conflicto-centro',
      data: [conflicto],
      filled: true,
      getPosition: (d) => d.coordenadas,
      getRadius: 2000,
      getFillColor: [255, 255, 255, 255],
      updateTriggers: { getPosition: [conflicto] }
    })
  ];

  // Interleaved false para mayor compatibilidad con maplibre
  return <DeckGLOverlay layers={capas} interleaved={false} />;
});
AnimatedPulseLayer.displayName = 'AnimatedPulseLayer';

export default function Home() {
  const [conflicto, setConflicto] = useState<ConflictoVivo>({
    id: 'conflicto-001',
    tipo: 'Enfrentamiento Armado',
    coordenadas: [-102.5528, 23.6345],
    nivelPeligro: 100
  });

  useEffect(() => {
    const intervaloDatos = setInterval(() => {
      setConflicto((actual) => {
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;

        return {
          ...actual,
          coordenadas: [actual.coordenadas[0] + lngOffset, actual.coordenadas[1] + latOffset],
        };
      });
    }, 3000);

    return () => clearInterval(intervaloDatos);
  }, []);

  return (
    <main className="h-screen w-full bg-slate-950 overflow-hidden relative">
      <div className="absolute top-5 left-5 z-10 pointer-events-none">
        <h1 className="text-white text-3xl font-bold mb-2" style={{ textShadow: '0 0 10px #38bdf8' }}>
          MONITOR DE CRISIS
        </h1>

        <div className="bg-slate-900/80 border border-red-500/50 p-4 rounded-lg backdrop-blur-md inline-block">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-bold uppercase tracking-wider text-sm">Alerta Activa</span>
          </div>
          <h2 className="text-white text-lg font-semibold">{conflicto.tipo}</h2>
          <p className="text-slate-400 font-mono text-sm mt-1">
            LAT: {conflicto.coordenadas[1].toFixed(4)} | LNG: {conflicto.coordenadas[0].toFixed(4)}
          </p>
          <p className="text-xs text-slate-500 mt-2 italic">Actualizando telemetría...</p>
        </div>
      </div>

      <Map
        initialViewState={VISTA_INICIAL}
        mapStyle={ESTILO_MAPA_OSCURO}
        style={{ width: '100%', height: '100%' }}
      >
        <AnimatedPulseLayer conflicto={conflicto} />
      </Map>
    </main>
  );
}
