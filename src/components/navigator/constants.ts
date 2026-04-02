export const TRANSPORT_TYPES = [
  { id: "all", label: "Все", icon: "Globe", badge: "badge-bus" },
  { id: "bus", label: "Автобусы", icon: "Bus", badge: "badge-bus", fare: 35 },
  { id: "tram", label: "Трамваи", icon: "TramFront", badge: "badge-tram", fare: 33 },
  { id: "trolley", label: "Троллейбусы", icon: "Zap", badge: "badge-trolley", fare: 33 },
  { id: "metro", label: "Метро", icon: "Building2", badge: "badge-metro", fare: 60 },
  { id: "train", label: "Поезда", icon: "Train", badge: "badge-train", fare: 120 },
  { id: "water", label: "Водный", icon: "Waves", badge: "badge-water", fare: 150 },
  { id: "minibus", label: "Маршрутки", icon: "Van", badge: "badge-minibus", fare: 40 },
];

export const MOCK_ROUTES = [
  { id: 1, number: "А-47", type: "bus", from: "Площадь Победы", to: "ул. Ленина", time: 12, transfers: 0, fare: 35, status: "В пути", eta: "через 3 мин" },
  { id: 2, number: "Т-5", type: "tram", from: "Площадь Победы", to: "ул. Ленина", time: 18, transfers: 1, fare: 66, status: "На остановке", eta: "через 1 мин" },
  { id: 3, number: "М-1", type: "metro", from: "Площадь Победы", to: "ул. Ленина", time: 9, transfers: 0, fare: 60, status: "В движении", eta: "через 5 мин" },
  { id: 4, number: "П-120Э", type: "train", from: "Площадь Победы", to: "ул. Ленина", time: 25, transfers: 0, fare: 120, status: "По расписанию", eta: "через 8 мин" },
];

export const MOCK_VEHICLES = [
  { id: 1, type: "bus", number: "47", lat: 55.762, lng: 37.618, speed: 42, passengers: 28, capacity: 60 },
  { id: 2, type: "tram", number: "5", lat: 55.758, lng: 37.632, speed: 28, passengers: 45, capacity: 120 },
  { id: 3, type: "metro", number: "М1", lat: 55.753, lng: 37.621, speed: 65, passengers: 180, capacity: 300 },
  { id: 4, type: "bus", number: "12", lat: 55.766, lng: 37.608, speed: 38, passengers: 15, capacity: 60 },
  { id: 5, type: "trolley", number: "3", lat: 55.749, lng: 37.641, speed: 30, passengers: 22, capacity: 80 },
  { id: 6, type: "water", number: "В1", lat: 55.745, lng: 37.598, speed: 18, passengers: 8, capacity: 40 },
  { id: 7, type: "train", number: "Э9", lat: 55.771, lng: 37.650, speed: 90, passengers: 240, capacity: 500 },
  { id: 8, type: "minibus", number: "К7", lat: 55.756, lng: 37.627, speed: 55, passengers: 12, capacity: 20 },
];

export const TYPE_COLORS: Record<string, string> = {
  bus: "#ff6b35",
  tram: "#00ff88",
  trolley: "#00d4ff",
  metro: "#a78bfa",
  train: "#fbbf24",
  water: "#60a5fa",
  minibus: "#f472b6",
};

export const TYPE_ICONS: Record<string, string> = {
  bus: "Bus",
  tram: "TramFront",
  trolley: "Zap",
  metro: "Building2",
  train: "Train",
  water: "Waves",
  minibus: "Van",
};

export const TYPE_LABELS: Record<string, string> = {
  bus: "Автобус",
  tram: "Трамвай",
  trolley: "Троллейбус",
  metro: "Метро",
  train: "Поезд",
  water: "Водный",
  minibus: "Маршрутка",
};

export const SCHEDULE_DATA = [
  { route: "А-47", type: "bus", stops: ["Центр", "Рынок", "Парк", "Школа №3", "Конечная"], times: ["08:00", "08:12", "08:24", "08:36", "08:50"] },
  { route: "Т-5", type: "tram", stops: ["Депо", "Площадь", "Проспект", "Больница", "Вокзал"], times: ["07:30", "07:44", "07:58", "08:10", "08:22"] },
  { route: "М-1", type: "metro", stops: ["Северная", "Центральная", "Южная", "Аэропорт"], times: ["06:00", "06:08", "06:16", "06:24"] },
  { route: "В-1", type: "water", stops: ["Речной порт", "Набережная", "Остров", "Яхт-клуб"], times: ["09:00", "09:20", "09:40", "10:00"] },
];

export const NOTIFICATIONS_DEFAULT = [
  { id: 1, text: "Трамвай Т-5 прибывает через 1 мин", type: "tram", read: false },
  { id: 2, text: "Автобус А-47 задержан на 5 мин", type: "bus", read: false },
  { id: 3, text: "Поезд П-120Э отправляется вовремя", type: "train", read: true },
];
