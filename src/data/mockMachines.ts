import { Machine } from '../types';

export const mockMachines: Machine[] = [
  {
    id: 'm001',
    operatorId: 'op001',
    operatorName: '刘机手',
    name: '约翰迪尔W80',
    model: 'John Deere W80',
    plateNumber: '豫A·收割机001',
    status: 'working',
    location: { lat: 34.0522, lng: 113.8700 },
    locationDesc: '红星村三组作业中',
    serviceRadius: 20,
    pricePerMu: 60,
    dailyCapacity: 120,
    year: 2022,
    createdAt: '2026-03-15'
  },
  {
    id: 'm002',
    operatorId: 'op002',
    operatorName: '王收割',
    name: '久保田1408',
    model: 'Kubota 1408',
    plateNumber: '豫A·收割机002',
    status: 'idle',
    location: { lat: 34.0530, lng: 113.8708 },
    locationDesc: '前进村二组场院',
    serviceRadius: 25,
    pricePerMu: 65,
    dailyCapacity: 100,
    year: 2023,
    createdAt: '2026-04-01'
  },
  {
    id: 'm003',
    operatorId: 'op003',
    operatorName: '赵收麦',
    name: '雷沃谷神',
    model: 'Lovol GM100',
    plateNumber: '豫A·收割机003',
    status: 'idle',
    location: { lat: 34.0528, lng: 113.8706 },
    locationDesc: '红星村五组',
    serviceRadius: 15,
    pricePerMu: 58,
    dailyCapacity: 80,
    year: 2021,
    createdAt: '2026-03-20'
  },
  {
    id: 'm004',
    operatorId: 'op004',
    operatorName: '孙麦客',
    name: '中联重科TE90',
    model: 'Zoomlion TE90',
    plateNumber: '豫A·收割机004',
    status: 'maintenance',
    location: { lat: 34.0535, lng: 113.8715 },
    locationDesc: '镇农机站维修',
    serviceRadius: 30,
    pricePerMu: 62,
    dailyCapacity: 150,
    year: 2024,
    createdAt: '2026-05-10'
  }
];
