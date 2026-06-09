export type UserRole = 'farmer' | 'operator' | 'coordinator';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  village?: string;
  group?: string;
}

export type MaturityLevel = 'immature' | 'nearly' | 'mature' | 'overripe';

export interface Plot {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  village: string;
  group: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  area: number;
  maturity: MaturityLevel;
  contactName: string;
  contactPhone: string;
  availableTime: string;
  hasDemand: boolean;
  demandId?: string;
  queuePosition?: number;
  queueTotal?: number;
  priority?: boolean;
  note?: string;
  createdAt: string;
}

export type DemandStatus = 'pending' | 'queued' | 'assigned' | 'working' | 'completed' | 'cancelled';

export interface Demand {
  id: string;
  plotId: string;
  plot: Plot;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  area: number;
  priority: boolean;
  status: DemandStatus;
  queuePosition: number;
  operatorId?: string;
  operatorName?: string;
  operatorPhone?: string;
  machineId?: string;
  estimatedTime?: string;
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'working' | 'submitted' | 'confirmed' | 'settled';

export type DisputeStatus = 'none' | 'raised' | 'processing' | 'resolved';

export interface OrderDispute {
  status: DisputeStatus;
  raisedBy: 'farmer' | 'operator';
  content: string;
  createdAt: string;
  handlerId?: string;
  handlerName?: string;
  handledAt?: string;
  resolution?: string;
}

export type DebtStatus = 'none' | 'partial' | 'full';

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'wechat' | 'alipay' | 'bank' | 'other';
  paidAt: string;
  paidBy: string;
  note?: string;
}

export interface WorkRecord {
  id: string;
  orderId: string;
  startTime: string;
  endTime?: string;
  actualArea: number;
  photos: string[];
  fuelCost: number;
  fuelNote?: string;
  debtAmount: number;
  debtNote?: string;
  note?: string;
  confirmedByFarmer?: boolean;
  confirmedAt?: string;
  disputed?: boolean;
  disputeId?: string;
}

export interface Order {
  id: string;
  demandId: string;
  demand: Demand;
  plot: Plot;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  operatorId: string;
  operatorName: string;
  operatorPhone: string;
  machineId: string;
  machineName: string;
  area: number;
  quotedPrice: number;
  totalAmount: number;
  status: OrderStatus;
  workRecord?: WorkRecord;
  evaluation?: Evaluation;
  scheduledTime: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  settledAt?: string;
  dispute?: OrderDispute;
  debtStatus?: DebtStatus;
  payments?: PaymentRecord[];
  paymentMethod?: string;
}

export interface Machine {
  id: string;
  operatorId: string;
  operatorName: string;
  name: string;
  model: string;
  plateNumber: string;
  status: 'idle' | 'working' | 'maintenance';
  location: {
    lat: number;
    lng: number;
  };
  locationDesc: string;
  serviceRadius: number;
  pricePerMu: number;
  dailyCapacity: number;
  year: number;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  orderId: string;
  rating: number;
  quality: number;
  attitude: number;
  punctuality: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

export interface WeatherForecast {
  date: string;
  weekday: string;
  weather: string;
  icon: string;
  tempHigh: number;
  tempLow: number;
  wind: string;
  windLevel: number;
  precipitation: number;
  humidity: number;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  riskTips?: string;
}

export interface WeatherHourly {
  time: string;
  temp: number;
  weather: string;
  precipitation: number;
  wind: string;
}

export interface WeatherData {
  updateTime: string;
  location: string;
  current: {
    temp: number;
    weather: string;
    humidity: number;
    wind: string;
    windLevel: number;
    feelsLike: number;
    visibility: number;
    uvIndex: number;
  };
  hourly: WeatherHourly[];
  daily: WeatherForecast[];
  alerts: WeatherAlert[];
  tips: string[];
}

export interface WeatherAlert {
  id: string;
  type: string;
  level: 'blue' | 'yellow' | 'orange' | 'red';
  title: string;
  content: string;
  publishTime: string;
}

export type NoticeType = 'road' | 'drying' | 'urgent';

export interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  content: string;
  publisherId: string;
  publisherName: string;
  village?: string;
  groups?: string[];
  urgent: boolean;
  validFrom: string;
  validTo: string;
  createdAt: string;
}

export interface DryingField {
  id: string;
  name: string;
  village: string;
  capacity: number;
  available: number;
  contact: string;
  phone: string;
  status: 'available' | 'partial' | 'full';
}

export interface QueueItem {
  id: string;
  demandId: string;
  farmerName: string;
  village: string;
  group: string;
  area: number;
  priority: boolean;
  maturity: MaturityLevel;
  estimatedTime?: string;
  status: 'waiting' | 'next' | 'current';
}

export interface VillageGroup {
  village: string;
  groups: string[];
}

export interface Statistics {
  totalPlots: number;
  totalArea: number;
  pendingDemands: number;
  inProgress: number;
  completedToday: number;
  completedArea: number;
  idleMachines: number;
  workingMachines: number;
  avgPrice: number;
  weatherRisk: 'none' | 'low' | 'medium' | 'high';
}
