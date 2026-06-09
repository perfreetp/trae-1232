import { create } from 'zustand';
import {
  Plot, Order, QueueItem, DryingField, Notice, Demand, MaturityLevel,
  PaymentRecord, DebtStatus
} from '../types';
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

const nowStr = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

function calcDebtStatus(order: Order): DebtStatus {
  const debt = order.workRecord?.debtAmount ?? 0;
  if (debt <= 0) return 'none';
  const paid = (order.payments ?? []).reduce((s, p) => s + p.amount, 0);
  if (paid <= 0) return 'full';
  if (paid >= debt) return 'none';
  return 'partial';
}

interface OrderFilters {
  status: OrderStatus | 'all';
  village: string;
}

interface AppState {
  plots: Plot[];
  orders: Order[];
  queue: QueueItem[];
  dryingFields: DryingField[];
  notices: Notice[];
  orderFilters: OrderFilters;

  setOrderFilters: (filters: Partial<OrderFilters>) => void;
  clearOrderFilters: () => void;
  refreshQueueRank: () => void;
  publishDemand: (input: PublishDemandInput) => { demandId: string; queuePosition: number } | null;
  moveQueueItem: (id: string, direction: 'up' | 'down' | 'top') => void;
  togglePriority: (id: string) => void;
  getQueueByVillage: (village: string) => QueueItem[];
  updateOrder: (id: string, patch: Partial<Order>) => void;
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
  getOrder: (id: string) => Order | undefined;
  getPlot: (id: string) => Plot | undefined;
  confirmWork: (orderId: string) => void;
  raiseDispute: (orderId: string, content: string) => void;
  handleDispute: (orderId: string, resolution: string, handlerId: string, handlerName: string, confirmed: boolean) => void;
  addPayment: (orderId: string, record: Omit<PaymentRecord, 'id' | 'orderId'>) => number;
  settleOrder: (orderId: string, method: string) => void;
  getTotalPaid: (orderId: string) => number;
  getRemainingDebt: (orderId: string) => number;
  getDisputedOrders: () => Order[];
}

export const useAppStore = create<AppState>((set, get) => ({
  plots: JSON.parse(JSON.stringify(mockPlots)),
  orders: JSON.parse(JSON.stringify(mockOrders)).map(o => ({
    ...o,
    debtStatus: calcDebtStatus(o),
    payments: o.payments ?? [],
    dispute: o.dispute ?? { status: 'none', raisedBy: 'farmer', content: '', createdAt: nowStr() }
  })),
  queue: JSON.parse(JSON.stringify(mockQueue)),
  dryingFields: JSON.parse(JSON.stringify(mockDryingFields)),
  notices: JSON.parse(JSON.stringify(mockNotices)),
  orderFilters: { status: 'all', village: '' },

  setOrderFilters: (filters) => {
    set({ orderFilters: { ...get().orderFilters, ...filters } });
  },
  clearOrderFilters: () => {
    set({ orderFilters: { status: 'all', village: '' } });
  },

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
        createdAt: nowStr()
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
      scheduledTime: input.availableTime ?? plot.availableTime,
      debtStatus: 'none',
      payments: [],
      dispute: { status: 'none', raisedBy: 'farmer', content: '', createdAt: nowStr() }
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
    const orders = get().orders.map(o => {
      if (o.id !== id) return o;
      const merged = { ...o, ...patch };
      merged.debtStatus = calcDebtStatus(merged);
      return merged;
    });
    set({ orders });
  },

  addNotice: (notice) => {
    const n: Notice = {
      ...notice,
      id: 'n' + Date.now(),
      createdAt: nowStr()
    };
    set({ notices: [n, ...get().notices] });
  },

  getOrder: (id) => get().orders.find(o => o.id === id),
  getPlot: (id) => get().plots.find(p => p.id === id),

  confirmWork: (orderId) => {
    const order = get().getOrder(orderId);
    if (!order) return;
    const now = nowStr();
    const wr = order.workRecord ? { ...order.workRecord, confirmedByFarmer: true, confirmedAt: now } : undefined;
    get().updateOrder(orderId, {
      status: 'confirmed',
      workRecord: wr,
      dispute: { status: 'none', raisedBy: 'farmer', content: '', createdAt: now }
    });
  },

  raiseDispute: (orderId, content) => {
    const order = get().getOrder(orderId);
    if (!order) return;
    const now = nowStr();
    const wr = order.workRecord ? { ...order.workRecord, disputed: true } : undefined;
    get().updateOrder(orderId, {
      workRecord: wr,
      dispute: {
        status: 'raised',
        raisedBy: 'farmer',
        content,
        createdAt: now
      }
    });
  },

  handleDispute: (orderId, resolution, handlerId, handlerName, confirmed) => {
    const order = get().getOrder(orderId);
    if (!order) return;
    const now = nowStr();
    const d = order.dispute;
    const wr = order.workRecord
      ? { ...order.workRecord, disputed: !confirmed, confirmedByFarmer: confirmed, confirmedAt: confirmed ? now : undefined }
      : undefined;
    get().updateOrder(orderId, {
      status: confirmed ? 'confirmed' : order.status,
      workRecord: wr,
      dispute: d ? {
        ...d,
        status: 'resolved',
        handlerId,
        handlerName,
        handledAt: now,
        resolution
      } : undefined
    });
  },

  addPayment: (orderId, record) => {
    const order = get().getOrder(orderId);
    if (!order) return 0;
    const payment: PaymentRecord = {
      ...record,
      id: 'p' + Date.now(),
      orderId
    };
    const existing = order.payments ?? [];
    const payments = [...existing, payment];
    get().updateOrder(orderId, { payments });
    const updated = get().getOrder(orderId)!;
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const debt = updated.workRecord?.debtAmount ?? 0;
    if (totalPaid >= debt && debt > 0 && updated.status === 'confirmed') {
      get().updateOrder(orderId, { status: 'settled', settledAt: nowStr() });
    }
    return payment.amount;
  },

  settleOrder: (orderId, method) => {
    const order = get().getOrder(orderId);
    if (!order) return;
    const now = nowStr();
    const fin = {
      totalPayable: (order.totalAmount ?? 0),
      debt: order.workRecord?.debtAmount ?? 0
    };
    const payNow = Math.max(0, fin.totalPayable - fin.debt);
    const payments = [...(order.payments ?? [])];
    if (payNow > 0) {
      payments.push({
        id: 'p' + Date.now(),
        orderId,
        amount: payNow,
        method: method as any,
        paidAt: now,
        paidBy: order.farmerName
      });
    }
    get().updateOrder(orderId, {
      status: 'settled',
      settledAt: now,
      paymentMethod: method,
      payments
    });
  },

  getTotalPaid: (orderId) => {
    const o = get().getOrder(orderId);
    return (o?.payments ?? []).reduce((s, p) => s + p.amount, 0);
  },

  getRemainingDebt: (orderId) => {
    const o = get().getOrder(orderId);
    if (!o) return 0;
    const debt = o.workRecord?.debtAmount ?? 0;
    const paid = (o.payments ?? []).reduce((s, p) => s + p.amount, 0);
    return Math.max(0, debt - paid);
  },

  getDisputedOrders: () => {
    return get().orders.filter(o => o.dispute?.status === 'raised' || o.dispute?.status === 'processing');
  },
}));
