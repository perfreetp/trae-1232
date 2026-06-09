import { create } from 'zustand';
import { Plot, Order, QueueItem, DryingField, Notice, Demand, MaturityLevel } from '../types';
import { mockPlots } from '../data/mockPlots';
import { mockOrders } from '../data/mockOrders';
import { mockQueue, mockDryingFields, mockNotices } from '../data/mockWeather';

interface PublishDemandInput {
  plotId: string;
  area?: number;
  priority?: boolean;
  note?: string;
  availableTime?: string;
  maturity?: MaturityLevel;
}

interface AppState {
  plots: Plot[];
  orders: Order[];
  queue: QueueItem[];
  dryingFields: DryingField[];
  notices: Notice[];

  refreshQueueRank: () => void;
  publishDemand: (input: PublishDemandInput) => { demandId: string; queuePosition: number } | null;
  moveQueueItem: (id: string, direction: 'up' | 'down' | 'top') => void;
  togglePriority: (id: string) => void;
  getQueueByVillage: (village: string) => QueueItem[];
  updateOrder: (id: string, patch: Partial<Order>) => void;
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
  getOrder: (id: string) => Order | undefined;
  getPlot: (id: string) => Plot | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  plots: JSON.parse(JSON.stringify(mockPlots)),
  orders: JSON.parse(JSON.stringify(mockOrders)),
  queue: JSON.parse(JSON.stringify(mockQueue)),
  dryingFields: JSON.parse(JSON.stringify(mockDryingFields)),
  notices: JSON.parse(JSON.stringify(mockNotices)),

  refreshQueueRank: () => {
    const { queue, plots } = get();
    const total = queue.length;
    const updatedPlots = plots.map(p => ({ ...p }));
    queue.forEach((q, idx) => {
      const pos = idx + 1;
      const order = get().orders.find(o => o.demandId === q.demandId);
      const plot = updatedPlots.find(p => p.demandId === q.demandId);
      if (plot) {
        plot.queuePosition = pos;
        plot.queueTotal = total;
        plot.priority = q.priority;
      }
      q.estimatedTime = pos === 1 ? '现在' : pos === 2 ? '约30分钟后' : `约${(pos - 1) * 40}分钟后`;
      q.status = pos === 1 ? 'current' : pos === 2 ? 'next' : 'waiting';
      if (order) {
        order.plot.queuePosition = pos;
        order.plot.queueTotal = total;
        order.plot.priority = q.priority;
      }
    });
    set({ queue: [...queue], plots: updatedPlots, orders: [...get().orders] });
  },

  publishDemand: (input) => {
    const state = get();
    const plot = state.plots.find(p => p.id === input.plotId);
    if (!plot) return null;

    const newDemandId = 'd' + Date.now();
    const area = input.area ?? plot.area;

    const updatedPlots = state.plots.map(p => p.id === plot.id ? {
      ...p,
      hasDemand: true,
      demandId: newDemandId,
      area: input.area ?? p.area,
      maturity: input.maturity ?? p.maturity,
      availableTime: input.availableTime ?? p.availableTime,
      note: input.note ?? p.note,
      priority: input.priority ?? p.priority
    } : p);

    const newQueueItem: QueueItem = {
      id: 'q' + Date.now(),
      demandId: newDemandId,
      farmerName: plot.farmerName,
      village: plot.village,
      group: plot.group,
      area,
      priority: !!input.priority,
      maturity: input.maturity ?? plot.maturity,
      estimatedTime: '',
      status: 'waiting'
    };

    const newQueue = [...state.queue, newQueueItem];
    const total = newQueue.length;
    const pos = total;

    const pendingOrder: Order = {
      id: 'o' + Date.now(),
      demandId: newDemandId,
      demand: {
        id: newDemandId,
        plotId: plot.id,
        plot: plot,
        farmerId: plot.farmerId,
        farmerName: plot.farmerName,
        farmerPhone: plot.farmerPhone,
        area,
        priority: !!input.priority,
        status: 'queued',
        queuePosition: pos,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      } as Demand,
      plot: { ...plot, queuePosition: pos, queueTotal: total, demandId: newDemandId, hasDemand: true },
      farmerId: plot.farmerId,
      farmerName: plot.farmerName,
      farmerPhone: plot.farmerPhone,
      operatorId: '',
      operatorName: '待分配',
      operatorPhone: '',
      machineId: '',
      machineName: '待分配',
      area,
      quotedPrice: 60,
      totalAmount: Math.round(area * 60),
      status: 'pending',
      scheduledTime: input.availableTime ?? plot.availableTime
    };

    set({
      plots: updatedPlots,
      queue: newQueue,
      orders: [...state.orders, pendingOrder]
    });

    get().refreshQueueRank();
    return { demandId: newDemandId, queuePosition: pos };
  },

  moveQueueItem: (id, direction) => {
    const queue = [...get().queue];
    const idx = queue.findIndex(q => q.id === id);
    if (idx === -1) return;
    const [item] = queue.splice(idx, 1);
    let target: number;
    if (direction === 'up') target = Math.max(0, idx - 1);
    else if (direction === 'down') target = Math.min(queue.length, idx + 1);
    else target = 0;
    queue.splice(target, 0, item);
    set({ queue });
    get().refreshQueueRank();
  },

  togglePriority: (id) => {
    const queue = get().queue.map(q => q.id === id ? { ...q, priority: !q.priority } : q);
    set({ queue });
    get().refreshQueueRank();
  },

  getQueueByVillage: (village) => {
    return get().queue.filter(q => q.village === village);
  },

  updateOrder: (id, patch) => {
    const orders = get().orders.map(o => o.id === id ? { ...o, ...patch } : o);
    set({ orders });
  },

  addNotice: (notice) => {
    const n: Notice = {
      ...notice,
      id: 'n' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    set({ notices: [n, ...get().notices] });
  },

  getOrder: (id) => get().orders.find(o => o.id === id),
  getPlot: (id) => get().plots.find(p => p.id === id),
}));
