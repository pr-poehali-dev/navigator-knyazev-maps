import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  TRANSPORT_TYPES, MOCK_ROUTES, MOCK_VEHICLES,
  TYPE_COLORS, TYPE_ICONS, SCHEDULE_DATA,
} from "./constants";

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

interface SidebarProps {
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  activeTab: "map" | "routes" | "schedule" | "3d";
  setActiveTab: (t: "map" | "routes" | "schedule" | "3d") => void;
  fromLocation: string;
  setFromLocation: (v: string) => void;
  toLocation: string;
  setToLocation: (v: string) => void;
  passengers: number;
  setPassengers: (v: number) => void;
  showPassengers: boolean;
  setShowPassengers: (v: boolean) => void;
  selectedRoute: number | null;
  setSelectedRoute: (v: number | null) => void;
}

export default function Sidebar({
  activeFilter, setActiveFilter,
  activeTab, setActiveTab,
  fromLocation, setFromLocation,
  toLocation, setToLocation,
  passengers, setPassengers,
  showPassengers, setShowPassengers,
  selectedRoute, setSelectedRoute,
}: SidebarProps) {
  const filteredRoutes = MOCK_ROUTES.filter(r => activeFilter === "all" || r.type === activeFilter);

  return (
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
  );
}
