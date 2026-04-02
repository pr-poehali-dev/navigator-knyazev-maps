import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AppHeader from "@/components/navigator/AppHeader";
import Sidebar from "@/components/navigator/Sidebar";
import MapView from "@/components/navigator/MapView";
import { NOTIFICATIONS_DEFAULT } from "@/components/navigator/constants";

export default function Index() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"map" | "routes" | "schedule" | "3d">("map");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [showPassengers, setShowPassengers] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [time, setTime] = useState(new Date());
  const [notifications] = useState(NOTIFICATIONS_DEFAULT);
  const [showNotif, setShowNotif] = useState(false);
  const [notifRead, setNotifRead] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background font-golos overflow-hidden relative">
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-8 blur-3xl" style={{ background: "radial-gradient(circle, #00d4ff, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-6 blur-3xl" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute top-2/3 left-0 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #00ff88, transparent)" }} />
      </div>

      <AppHeader
        time={time}
        notifications={notifications}
        showNotif={showNotif}
        setShowNotif={setShowNotif}
        notifRead={notifRead}
        setNotifRead={setNotifRead}
      />

      <main className="relative z-10 flex flex-col lg:flex-row" style={{ height: "calc(100vh - 61px)" }}>
        <Sidebar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fromLocation={fromLocation}
          setFromLocation={setFromLocation}
          toLocation={toLocation}
          setToLocation={setToLocation}
          passengers={passengers}
          setPassengers={setPassengers}
          showPassengers={showPassengers}
          setShowPassengers={setShowPassengers}
          selectedRoute={selectedRoute}
          setSelectedRoute={setSelectedRoute}
        />

        <MapView activeFilter={activeFilter} />
      </main>

      {/* Floating passengers hint */}
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
    </div>
  );
}
