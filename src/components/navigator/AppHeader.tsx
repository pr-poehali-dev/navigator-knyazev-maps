import Icon from "@/components/ui/icon";
import { TYPE_COLORS } from "./constants";

interface Notification {
  id: number;
  text: string;
  type: string;
  read: boolean;
}

interface AppHeaderProps {
  time: Date;
  notifications: Notification[];
  showNotif: boolean;
  setShowNotif: (v: boolean) => void;
  notifRead: boolean;
  setNotifRead: (v: boolean) => void;
}

export default function AppHeader({
  time, notifications, showNotif, setShowNotif, notifRead, setNotifRead,
}: AppHeaderProps) {
  const unread = notifRead ? 0 : notifications.filter(n => !n.read).length;

  return (
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
  );
}
