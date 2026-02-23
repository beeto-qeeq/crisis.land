"use client";

import React, { useState, useEffect, memo } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface ConflictoVivo {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  source: string;
  created_at: string;
}

const VISTA_INICIAL = {
  longitude: -103.3496,
  latitude: 20.6596,
  zoom: 8,
  pitch: 30,
  bearing: 0
};

const ESTILO_MAPA_OSCURO = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

function DeckGLOverlay(props: any) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

const StaticMarkerLayer = memo(({ conflictos }: { conflictos: ConflictoVivo[] }) => {
  const capas = [
    new ScatterplotLayer<ConflictoVivo>({
      id: 'capa-conflictos-estaticos',
      data: conflictos,
      pickable: true,
      filled: true,
      radiusUnits: 'pixels',
      getRadius: 6,
      getFillColor: [255, 0, 0, 255],
      getPosition: (d) => [d.longitude, d.latitude],
      updateTriggers: { getPosition: [conflictos] }
    })
  ];

  return <DeckGLOverlay layers={capas} interleaved={true} />;
});
StaticMarkerLayer.displayName = 'StaticMarkerLayer';

export default function Home() {
  const [conflictos, setConflictos] = useState<ConflictoVivo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConflictos(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="h-screen w-full bg-slate-950 overflow-hidden relative font-sans text-white">

      <div className="absolute top-5 left-5 z-10 pointer-events-none flex flex-col gap-4 max-h-[90vh] overflow-y-auto w-80 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <h1 className="text-white text-3xl font-bold mb-2 ml-1" style={{ textShadow: '0 0 10px #38bdf8' }}>
          MONITOR DE CRISIS
        </h1>

        {loading ? (
          <div className="bg-slate-900/80 border border-slate-500/50 p-4 rounded-lg backdrop-blur-md inline-block">
            <span className="text-slate-400 font-bold tracking-wider text-sm">Cargando base de datos satelital...</span>
          </div>
        ) : conflictos.length === 0 ? (
          <div className="bg-slate-900/80 border border-green-500/50 p-4 rounded-lg backdrop-blur-md inline-block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-bold uppercase tracking-wider text-sm">ZONA SEGURA</span>
            </div>
            <p className="text-slate-400 text-sm">No hay incidentes reportados.</p>
          </div>
        ) : (
          conflictos.map(conflicto => (
            <div key={conflicto.id} className="bg-slate-900/80 border border-red-500/50 p-4 rounded-lg backdrop-blur-md inline-block relative pointer-events-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-bold uppercase tracking-wider text-sm">Alerta Activa</span>
                <span className="ml-auto text-[10px] bg-red-600/20 text-red-500 px-2 py-0.5 rounded-full border border-red-500/30">
                  {conflicto.source}
                </span>
              </div>
              <h2 className="text-white text-lg font-semibold leading-tight">{conflicto.title}</h2>
              {conflicto.description && (
                <p className="text-slate-300 text-sm mt-1 mb-2 leading-snug">{conflicto.description}</p>
              )}
              <div className="flex flex-col gap-1 mt-2 bg-black/30 p-2 rounded">
                <p className="text-slate-400 font-mono text-[11px]">
                  LAT: {conflicto.latitude.toFixed(4)} | LNG: {conflicto.longitude.toFixed(4)}
                </p>
                <p className="text-slate-500 font-mono text-[10px] italic">
                  ⌚ {new Date(conflicto.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <Map
        initialViewState={VISTA_INICIAL}
        mapStyle={ESTILO_MAPA_OSCURO}
        // @ts-ignore
        projection={{ type: 'globe' }}
        style={{ width: '100%', height: '100%' }}
      >
        <StaticMarkerLayer conflictos={conflictos} />
      </Map>
    </main>
  );
}
