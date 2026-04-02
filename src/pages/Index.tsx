import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Icon from "@/components/ui/icon";

const TRANSPORT_TYPES = [
  { id: "all", label: "Все", icon: "Globe", badge: "badge-bus" },
  { id: "bus", label: "Автобусы", icon: "Bus", badge: "badge-bus", fare: 35 },
  { id: "tram", label: "Трамваи", icon: "TramFront", badge: "badge-tram", fare: 33 },
  { id: "trolley", label: "Троллейбусы", icon: "Zap", badge: "badge-trolley", fare: 33 },
  { id: "metro", label: "Метро", icon: "Building2", badge: "badge-metro", fare: 60 },
  { id: "train", label: "Поезда", icon: "Train", badge: "badge-train", fare: 120 },
  { id: "water", label: "Водный", icon: "Waves", badge: "badge-water", fare: 150 },
  { id: "minibus", label: "Маршрутки", icon: "Van", badge: "badge-minibus", fare: 40 },
];

const MOCK_ROUTES = [
  { id: 1, number: "А-47", type: "bus", from: "Площадь Победы", to: "ул. Ленина", time: 12, transfers: 0, fare: 35, status: "В пути", eta: "через 3 мин" },
  { id: 2, number: "Т-5", type: "tram", from: "Площадь Победы", to: "ул. Ленина", time: 18, transfers: 1, fare: 66, status: "На остановке", eta: "через 1 мин" },
  { id: 3, number: "М-1", type: "metro", from: "Площадь Победы", to: "ул. Ленина", time: 9, transfers: 0, fare: 60, status: "В движении", eta: "через 5 мин" },
  { id: 4, number: "П-120Э", type: "train", from: "Площадь Победы", to: "ул. Ленина", time: 25, transfers: 0, fare: 120, status: "По расписанию", eta: "через 8 мин" },
];

const MOCK_VEHICLES = [
  { id: 1, type: "bus", number: "47", lat: 55.762, lng: 37.618, speed: 42, passengers: 28, capacity: 60 },
  { id: 2, type: "tram", number: "5", lat: 55.758, lng: 37.632, speed: 28, passengers: 45, capacity: 120 },
  { id: 3, type: "metro", number: "М1", lat: 55.753, lng: 37.621, speed: 65, passengers: 180, capacity: 300 },
  { id: 4, type: "bus", number: "12", lat: 55.766, lng: 37.608, speed: 38, passengers: 15, capacity: 60 },
  { id: 5, type: "trolley", number: "3", lat: 55.749, lng: 37.641, speed: 30, passengers: 22, capacity: 80 },
  { id: 6, type: "water", number: "В1", lat: 55.745, lng: 37.598, speed: 18, passengers: 8, capacity: 40 },
  { id: 7, type: "train", number: "Э9", lat: 55.771, lng: 37.650, speed: 90, passengers: 240, capacity: 500 },
  { id: 8, type: "minibus", number: "К7", lat: 55.756, lng: 37.627, speed: 55, passengers: 12, capacity: 20 },
];

const TYPE_COLORS: Record<string, string> = {
  bus: "#ff6b35",
  tram: "#00ff88",
  trolley: "#00d4ff",
  metro: "#a78bfa",
  train: "#fbbf24",
  water: "#60a5fa",
  minibus: "#f472b6",
};

const TYPE_ICONS: Record<string, string> = {
  bus: "Bus",
  tram: "TramFront",
  trolley: "Zap",
  metro: "Building2",
  train: "Train",
  water: "Waves",
  minibus: "Van",
};

const TYPE_LABELS: Record<string, string> = {
  bus: "Автобус",
  tram: "Трамвай",
  trolley: "Троллейбус",
  metro: "Метро",
  train: "Поезд",
  water: "Водный",
  minibus: "Маршрутка",
};

const SCHEDULE_DATA = [
  { route: "А-47", type: "bus", stops: ["Центр", "Рынок", "Парк", "Школа №3", "Конечная"], times: ["08:00", "08:12", "08:24", "08:36", "08:50"] },
  { route: "Т-5", type: "tram", stops: ["Депо", "Площадь", "Проспект", "Больница", "Вокзал"], times: ["07:30", "07:44", "07:58", "08:10", "08:22"] },
  { route: "М-1", type: "metro", stops: ["Северная", "Центральная", "Южная", "Аэропорт"], times: ["06:00", "06:08", "06:16", "06:24"] },
  { route: "В-1", type: "water", stops: ["Речной порт", "Набережная", "Остров", "Яхт-клуб"], times: ["09:00", "09:20", "09:40", "10:00"] },
];

function makeVehicleIcon(type: string, number: string) {
  const color = TYPE_COLORS[type] || "#fff";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="32" viewBox="0 0 48 32">
      <rect x="1" y="1" width="46" height="30" rx="8" fill="#0a0e1a" stroke="${color}" stroke-width="1.5"/>
      <text x="24" y="21" text-anchor="middle" font-family="Golos Text,sans-serif" font-weight="700" font-size="13" fill="${color}">${number}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [48, 32],
    iconAnchor: [24, 16],
    popupAnchor: [0, -18],
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
        marker.bindPopup(`
          <div style="font-family:'Golos Text',sans-serif;min-width:140px;background:#0e1425;border:1px solid ${TYPE_COLORS[v.type]}40;border-radius:12px;padding:12px;color:#fff;">
            <div style="font-weight:700;color:${TYPE_COLORS[v.type]};margin-bottom:4px;">${TYPE_LABELS[v.type]} №${v.number}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:2px;">Скорость: ${v.speed} км/ч</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);">Пассажиры: ${v.passengers}/${v.capacity} (${fill}%)</div>
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

function VehicleCard3D({ vehicle }: { vehicle: typeof MOCK_VEHICLES[0] }) {
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const color = TYPE_COLORS[vehicle.type] || "#fff";
  const fill = (vehicle.passengers / vehicle.capacity) * 100;

  return (
    <div
      className="relative p-4 rounded-2xl cursor-pointer transition-all duration-200 select-none"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
        border: `1px solid ${color}30`,
        transform: `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
      }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setRotY(((e.clientX - rect.left - rect.width / 2) / rect.width) * 20);
        setRotX(-((e.clientY - rect.top - rect.height / 2) / rect.height) * 15);
      }}
      onMouseLeave={() => { setRotX(0); setRotY(0); }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + "20", border: `1px solid ${color}50` }}>
            <Icon name={TYPE_ICONS[vehicle.type]} size={15} style={{ color }} />
          </div>
          <div>
            <div className="text-xs font-bold font-oswald" style={{ color }}>№{vehicle.number}</div>
            <div className="text-xs text-white/40">{vehicle.speed} км/ч</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50">Заполнен</div>
          <div className="text-sm font-bold text-white">{Math.round(fill)}%</div>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${fill}%`, background: fill > 80 ? "#ff6b35" : fill > 50 ? "#fbbf24" : color }} />
      </div>
      <div className="mt-2 text-xs text-white/40">{vehicle.passengers} / {vehicle.capacity} пасс.</div>
    </div>
  );
}

export default function Index() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"map" | "routes" | "schedule" | "3d">("map");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [showPassengers, setShowPassengers] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [time, setTime] = useState(new Date());
  const [notifications] = useState([
    { id: 1, text: "Трамвай Т-5 прибывает через 1 мин", type: "tram", read: false },
    { id: 2, text: "Автобус А-47 задержан на 5 мин", type: "bus", read: false },
    { id: 3, text: "Поезд П-120Э отправляется вовремя", type: "train", read: true },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifRead, setNotifRead] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const unread = notifRead ? 0 : notifications.filter(n => !n.read).length;
  const filteredRoutes = MOCK_ROUTES.filter(r => activeFilter === "all" || r.type === activeFilter);

  return (
    <div className="min-h-screen bg-background font-golos overflow-hidden relative">
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-8 blur-3xl" style={{ background: "radial-gradient(circle, #00d4ff, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-6 blur-3xl" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute top-2/3 left-0 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #00ff88, transparent)" }} />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-5 py-3.5 border-b border-white/5"
        style={{ background: "rgba(6,9,20,0.85)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse-neon"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(0,212,255,0.4)" }}>
            <Icon name="MapPin" size={20} className="neon-text" />
          </div>
          <div>
            <div className="text-lg font-oswald font-bold tracking-widest neon-text leading-none">КНЯЗЕВ КАРТЫ</div>
            <div className="text-xs text-white/35 tracking-widest">Smart Navigator</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-white/50"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-dot-blink" />
            {time.toLocaleTimeString("ru-RU")}
          </div>

          <div className="relative">
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={() => { setShowNotif(!showNotif); setNotifRead(true); }}
            >
              <Icon name="Bell" size={15} className="text-white/60" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white font-bold flex items-center justify-center"
                  style={{ background: "#ff6b35", fontSize: 9 }}>{unread}</span>
              )}
            </button>

            {showNotif && (
              <div className="absolute top-full right-0 mt-2 rounded-2xl overflow-hidden z-50 animate-fade-in-up shadow-2xl"
                style={{ background: "rgba(8,12,24,0.97)", border: "1px solid rgba(0,212,255,0.15)", backdropFilter: "blur(20px)", width: 300 }}>
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Уведомления</span>
                  <span className="text-xs text-white/35">Все прочитаны</span>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 flex items-start gap-3 border-b border-white/5 last:border-0">
                    <div className="w-2 h-2 mt-1.5 rounded-full shrink-0" style={{ background: TYPE_COLORS[n.type] }} />
                    <span className="text-xs text-white/65 leading-relaxed">{n.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold neon-btn">
            <Icon name="User" size={13} />
            Войти
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col lg:flex-row" style={{ height: "calc(100vh - 61px)" }}>

        {/* Sidebar */}
        <aside className="w-full lg:w-[360px] shrink-0 flex flex-col border-r border-white/5 overflow-y-auto"
          style={{ background: "rgba(6,9,20,0.7)", backdropFilter: "blur(12px)" }}>

          {/* Route planner */}
          <div className="p-5 border-b border-white/5">
            <div className="text-xs font-semibold tracking-widest text-white/35 uppercase mb-4 flex items-center gap-2">
              <Icon name="Navigation" size={12} className="neon-text" />
              Планировщик маршрута
            </div>

            <div className="space-y-2 mb-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: "#00ff88" }} />
                <input type="text" placeholder="Откуда" value={fromLocation} onChange={e => setFromLocation(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-sm text-white placeholder-white/25 rounded-xl outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onFocus={e => e.target.style.border = "1px solid rgba(0,255,136,0.4)"}
                  onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.07)"} />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: "#ff6b35" }} />
                <input type="text" placeholder="Куда" value={toLocation} onChange={e => setToLocation(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-sm text-white placeholder-white/25 rounded-xl outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onFocus={e => e.target.style.border = "1px solid rgba(255,107,53,0.4)"}
                  onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.07)"} />
              </div>
            </div>

            {/* Passengers selector */}
            <div className="mb-3 rounded-xl overflow-hidden cursor-pointer transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              onClick={() => setShowPassengers(!showPassengers)}>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <Icon name="Users" size={14} className="text-white/45" />
                  <span className="text-sm text-white/60">Количество пассажиров</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold neon-text font-oswald">{passengers}</span>
                  <Icon name={showPassengers ? "ChevronUp" : "ChevronDown"} size={13} className="text-white/35" />
                </div>
              </div>
              {showPassengers && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 flex items-center gap-3 animate-fade-in-up">
                  <button onClick={e => { e.stopPropagation(); setPassengers(Math.max(1, passengers - 1)); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 transition-all"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Icon name="Minus" size={14} />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-oswald font-bold neon-text">{passengers}</span>
                    <span className="text-xs text-white/40 ml-1.5">чел.</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setPassengers(Math.min(20, passengers + 1)); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold neon-btn"
                    style={{ minWidth: 36 }}>
                    <Icon name="Plus" size={14} />
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => { if (fromLocation || toLocation) setActiveTab("routes"); }}
              className="w-full py-3 rounded-xl text-sm font-bold neon-btn flex items-center justify-center gap-2">
              <Icon name="Search" size={15} />
              Найти маршрут
            </button>
          </div>

          {/* Filters */}
          <div className="p-5 border-b border-white/5">
            <div className="text-xs font-semibold tracking-widest text-white/35 uppercase mb-3">Вид транспорта</div>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_TYPES.map(t => (
                <button key={t.id} onClick={() => setActiveFilter(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${t.badge}`}
                  style={{
                    opacity: activeFilter === t.id || activeFilter === "all" ? 1 : 0.35,
                    transform: activeFilter === t.id ? "scale(1.06)" : "scale(1)",
                    ...(activeFilter === t.id ? { boxShadow: `0 0 16px ${TYPE_COLORS[t.id] ?? "#00d4ff"}45` } : {})
                  }}>
                  <Icon name={t.icon} size={11} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-4 flex-1">
            <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
              {([["map", "Карта", "Map"], ["routes", "Маршруты", "Route"], ["schedule", "График", "Clock"], ["3d", "3D", "Box"]] as const).map(([id, label, icon]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={activeTab === id ? {
                    background: "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(139,92,246,0.12))",
                    color: "#00d4ff", border: "1px solid rgba(0,212,255,0.25)"
                  } : { color: "rgba(255,255,255,0.35)" }}>
                  <Icon name={icon} size={12} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* MAP tab */}
            {activeTab === "map" && (
              <div className="pb-5 space-y-2 animate-fade-in-up">
                <div className="p-3 rounded-xl text-xs leading-relaxed"
                  style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-dot-blink" style={{ background: "#00ff88" }} />
                    <span className="neon-text font-semibold">Онлайн-мониторинг</span>
                  </div>
                  <span className="text-white/45">На карте {MOCK_VEHICLES.length} транспортных средств в режиме реального времени</span>
                </div>
                {TRANSPORT_TYPES.slice(1).map(t => {
                  const count = MOCK_VEHICLES.filter(v => v.type === t.id).length;
                  return (
                    <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[t.id] }} />
                        <span className="text-xs text-white/55">{t.label}</span>
                      </div>
                      <span className="text-xs font-semibold font-oswald" style={{ color: TYPE_COLORS[t.id] }}>{count} ТС</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ROUTES tab */}
            {activeTab === "routes" && (
              <div className="space-y-3 pb-5 animate-fade-in-up">
                {filteredRoutes.length === 0
                  ? <div className="text-center py-8 text-white/25 text-sm">Нет маршрутов</div>
                  : filteredRoutes.map((route, i) => (
                    <div key={route.id} onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                      className="p-4 rounded-2xl cursor-pointer transition-all"
                      style={{
                        background: selectedRoute === route.id ? "rgba(0,212,255,0.07)" : "rgba(255,255,255,0.03)",
                        border: selectedRoute === route.id ? "1px solid rgba(0,212,255,0.28)" : "1px solid rgba(255,255,255,0.05)",
                        animationDelay: `${i * 0.07}s`
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-oswald badge-${route.type}`}>{route.number}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full animate-dot-blink" style={{ background: "#00ff88" }} />
                            <span className="text-xs text-white/40">{route.status}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold neon-text">{route.eta}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/50 mb-3">
                        <span className="truncate">{route.from}</span>
                        <Icon name="ArrowRight" size={10} className="text-white/25 shrink-0" />
                        <span className="truncate">{route.to}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-white/45">
                            <Icon name="Clock" size={11} />
                            {route.time} мин
                          </div>
                          {route.transfers > 0 && (
                            <div className="flex items-center gap-1 text-xs text-yellow-400/60">
                              <Icon name="ArrowLeftRight" size={11} />
                              {route.transfers} пересадка
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/35 mb-0.5">Итого</div>
                          <div className="text-sm font-bold font-oswald neon-text">
                            {route.fare * passengers} ₽
                            {passengers > 1 && <span className="text-xs text-white/35 font-normal ml-1">×{passengers}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* SCHEDULE tab */}
            {activeTab === "schedule" && (
              <div className="space-y-3 pb-5 animate-fade-in-up">
                {SCHEDULE_DATA.filter(s => activeFilter === "all" || s.type === activeFilter).map((s, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-oswald badge-${s.type}`}>{s.route}</span>
                      <div className="flex gap-1 items-center">
                        {s.stops.map((_, idx) => (
                          <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ background: idx === 0 ? "#00ff88" : idx === s.stops.length - 1 ? "#ff6b35" : "rgba(255,255,255,0.15)" }} />
                        ))}
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      {s.stops.map((stop, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs font-bold font-oswald w-12 shrink-0" style={{ color: TYPE_COLORS[s.type] }}>{s.times[idx]}</span>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: idx === 0 ? "#00ff88" : idx === s.stops.length - 1 ? "#ff6b35" : "rgba(255,255,255,0.2)" }} />
                          <span className="text-xs text-white/55 truncate">{stop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3D tab */}
            {activeTab === "3d" && (
              <div className="pb-5 animate-fade-in-up">
                <div className="text-xs text-white/35 mb-3">Наведите для 3D-эффекта</div>
                <div className="grid grid-cols-2 gap-2">
                  {MOCK_VEHICLES.filter(v => activeFilter === "all" || v.type === activeFilter).map(v => (
                    <VehicleCard3D key={v.id} vehicle={v} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          {/* LIVE badge */}
          <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-xl pointer-events-none"
            style={{ background: "rgba(6,9,20,0.9)", border: "1px solid rgba(0,255,136,0.2)", backdropFilter: "blur(10px)" }}>
            <div className="w-2 h-2 rounded-full animate-dot-blink" style={{ background: "#00ff88" }} />
            <span className="text-xs font-bold" style={{ color: "#00ff88" }}>LIVE</span>
            <span className="text-xs text-white/40">
              {activeFilter === "all" ? MOCK_VEHICLES.length : MOCK_VEHICLES.filter(v => v.type === activeFilter).length} ТС
            </span>
          </div>

          {/* Leaflet map */}
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <AnimatedVehicles vehicles={MOCK_VEHICLES} activeFilter={activeFilter} />
          </MapContainer>

          {/* Bottom strip */}
          <div className="absolute bottom-0 left-0 right-0 px-5 py-3 flex items-center justify-between z-[1000] pointer-events-none"
            style={{ background: "linear-gradient(0deg, rgba(5,8,15,0.9), transparent)" }}>
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
        </div>
      </main>

      {/* Floating hint */}
      {passengers > 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl animate-fade-in-up"
          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.35)", backdropFilter: "blur(20px)", boxShadow: "0 0 30px rgba(0,212,255,0.15)" }}>
          <Icon name="Users" size={15} className="neon-text" />
          <span className="text-sm text-white font-medium">{passengers} пассажира</span>
          <span className="text-white/35">·</span>
          <span className="text-sm neon-text font-bold">Стоимость ×{passengers}</span>
          <button className="text-white/35 hover:text-white ml-1 transition-colors" onClick={() => setPassengers(1)}>
            <Icon name="X" size={13} />
          </button>
        </div>
      )}

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
      `}</style>
    </div>
  );
}