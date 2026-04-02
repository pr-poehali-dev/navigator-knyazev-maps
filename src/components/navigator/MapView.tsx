import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { MOCK_VEHICLES, TRANSPORT_TYPES, TYPE_COLORS, TYPE_LABELS } from "./constants";

function makeVehicleIcon(type: string, number: string) {
  const color = TYPE_COLORS[type] || "#333";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="34" viewBox="0 0 52 34">
      <rect x="1" y="1" width="50" height="32" rx="9" fill="white" stroke="${color}" stroke-width="2"/>
      <text x="26" y="22" text-anchor="middle" font-family="Golos Text,sans-serif" font-weight="700" font-size="13" fill="${color}">${number}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [52, 34],
    iconAnchor: [26, 17],
    popupAnchor: [0, -20],
  });
}

function AnimatedVehicles({ vehicles, activeFilter }: { vehicles: typeof MOCK_VEHICLES, activeFilter: string }) {
  const map = useMap();
  const posRef = useRef(vehicles.map(v => ({
    ...v,
    dlat: (Math.random() - 0.5) * 0.0003,
    dlng: (Math.random() - 0.5) * 0.0004,
  })));
  const markersRef = useRef<Record<number, L.Marker>>({});
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    posRef.current.forEach(v => {
      if (activeFilter !== "all" && v.type !== activeFilter) {
        markersRef.current[v.id]?.remove();
        delete markersRef.current[v.id];
        return;
      }
      if (!markersRef.current[v.id]) {
        const marker = L.marker([v.lat, v.lng], { icon: makeVehicleIcon(v.type, v.number) });
        const fill = Math.round((v.passengers / v.capacity) * 100);
        const color = TYPE_COLORS[v.type];
        marker.bindPopup(`
          <div style="font-family:'Golos Text',sans-serif;min-width:150px;background:#fff;border:2px solid ${color};border-radius:12px;padding:12px;color:#1a1a2e;box-shadow:0 4px 20px rgba(0,0,0,0.12);">
            <div style="font-weight:700;color:${color};margin-bottom:6px;font-size:13px;">${TYPE_LABELS[v.type]} №${v.number}</div>
            <div style="font-size:11px;color:#555;margin-bottom:2px;">🚀 Скорость: ${v.speed} км/ч</div>
            <div style="font-size:11px;color:#555;margin-bottom:6px;">👥 Пассажиры: ${v.passengers}/${v.capacity} (${fill}%)</div>
            <div style="height:4px;background:#eee;border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${fill}%;background:${fill > 80 ? "#ff6b35" : fill > 50 ? "#fbbf24" : color};border-radius:4px;"></div>
            </div>
          </div>
        `, { className: "kp-popup" });
        marker.addTo(map);
        markersRef.current[v.id] = marker;
      }
    });

    Object.keys(markersRef.current).forEach(idStr => {
      const id = Number(idStr);
      const v = posRef.current.find(x => x.id === id);
      if (!v) return;
      if (activeFilter !== "all" && v.type !== activeFilter) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    const tick = (ts: number) => {
      if (ts - lastTickRef.current > 80) {
        lastTickRef.current = ts;
        posRef.current = posRef.current.map(v => {
          let nlat = v.lat + v.dlat;
          let nlng = v.lng + v.dlng;
          if (nlat > 55.78 || nlat < 55.73) v.dlat *= -1;
          if (nlng > 37.67 || nlng < 37.58) v.dlng *= -1;
          nlat = Math.max(55.73, Math.min(55.78, nlat));
          nlng = Math.max(37.58, Math.min(37.67, nlng));
          if (markersRef.current[v.id]) {
            markersRef.current[v.id].setLatLng([nlat, nlng]);
          }
          return { ...v, lat: nlat, lng: nlng };
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};
    };
  }, [activeFilter, map]);

  return null;
}

interface MapViewProps {
  activeFilter: string;
}

export default function MapView({ activeFilter }: MapViewProps) {
  const visibleCount = activeFilter === "all"
    ? MOCK_VEHICLES.length
    : MOCK_VEHICLES.filter(v => v.type === activeFilter).length;

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* LIVE badge */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-xl pointer-events-none"
        style={{ background: "rgba(6,9,20,0.85)", border: "1px solid rgba(0,255,136,0.25)", backdropFilter: "blur(10px)" }}>
        <div className="w-2 h-2 rounded-full animate-dot-blink" style={{ background: "#00ff88" }} />
        <span className="text-xs font-bold" style={{ color: "#00ff88" }}>LIVE</span>
        <span className="text-xs text-white/40">{visibleCount} ТС</span>
      </div>

      {/* Leaflet map — светлые тайлы OpenStreetMap */}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        <AnimatedVehicles vehicles={MOCK_VEHICLES} activeFilter={activeFilter} />
      </MapContainer>

      {/* Bottom legend strip */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-3 flex items-center justify-between z-[1000] pointer-events-none"
        style={{ background: "linear-gradient(0deg, rgba(5,8,15,0.85), transparent)" }}>
        <div className="flex items-center gap-4">
          {TRANSPORT_TYPES.slice(1).map(t => (
            <div key={t.id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[t.id] }} />
              <span className="hidden lg:inline text-xs text-white/35">{t.label}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-white/25">Обновлено только что</span>
      </div>

      {/* Popup styles */}
      <style>{`
        .kp-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 12px !important;
        }
        .kp-popup .leaflet-popup-content { margin: 0 !important; }
        .kp-popup .leaflet-popup-tip-container { display: none; }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(6,9,20,0.9) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(0,212,255,0.2) !important;
          color: #00d4ff !important;
        }
      `}</style>
    </div>
  );
}
