import { Order } from '../types';

export interface OrderFinance {
  actualArea: number;
  quotedArea: number;
  unitPrice: number;
  workFee: number;
  fuelCost: number;
  debtAmount: number;
  totalPayable: number;
  actualPaid: number;
  areaDiff: number;
  hasWorkRecord: boolean;
}

const round2 = (v: number) => Math.round(v * 100) / 100;
const n = (v: any, d = 0) => {
  const x = Number(v);
  return isNaN(x) ? d : x;
};

export function calcOrderFinance(order: Order | null | undefined): OrderFinance {
  if (!order) {
    return {
      actualArea: 0, quotedArea: 0, unitPrice: 0,
      workFee: 0, fuelCost: 0, debtAmount: 0,
      totalPayable: 0, actualPaid: 0, areaDiff: 0, hasWorkRecord: false,
    };
  }
  const wr = order.workRecord;
  const hasWorkRecord = !!wr && (n(wr.actualArea, 0) > 0 || !!wr.photos?.length);
  const actualArea = hasWorkRecord ? n(wr!.actualArea, n(order.area)) : n(order.area);
  const quotedArea = n(order.area);
  const unitPrice = n(order.quotedPrice);
  const fuelCost = hasWorkRecord ? n(wr!.fuelCost) : 0;
  const debtAmount = hasWorkRecord ? n(wr!.debtAmount) : 0;
  const workFee = round2(actualArea * unitPrice);
  const totalPayable = round2(workFee + fuelCost);
  const actualPaid = round2(Math.max(0, totalPayable - debtAmount));
  const areaDiff = round2(actualArea - quotedArea);

  return {
    actualArea, quotedArea, unitPrice,
    workFee, fuelCost, debtAmount,
    totalPayable, actualPaid, areaDiff,
    hasWorkRecord,
  };
}

export function formatMoney(v: number): string {
  if (!isFinite(v) || isNaN(v)) v = 0;
  return '¥' + v.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

export function formatArea(v: number): string {
  if (!isFinite(v) || isNaN(v)) v = 0;
  return v.toFixed(v % 1 === 0 ? 0 : 1);
}
