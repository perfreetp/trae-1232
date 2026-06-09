import { WeatherData, QueueItem, DryingField, Notice } from '../types';

export const mockWeather: WeatherData = {
  updateTime: '2026-06-10 14:30',
  location: '河南省郑州市xx县红星村',
  current: {
    temp: 32,
    weather: '多云',
    humidity: 45,
    wind: '东南风',
    windLevel: 2,
    feelsLike: 35,
    visibility: 15,
    uvIndex: 7
  },
  hourly: [
    { time: '14:00', temp: 32, weather: '多云', precipitation: 0, wind: '东南风2级' },
    { time: '15:00', temp: 33, weather: '多云', precipitation: 0, wind: '东南风2级' },
    { time: '16:00', temp: 32, weather: '多云转晴', precipitation: 0, wind: '东风2级' },
    { time: '17:00', temp: 31, weather: '晴', precipitation: 0, wind: '东风2级' },
    { time: '18:00', temp: 29, weather: '晴', precipitation: 0, wind: '东风1级' },
    { time: '19:00', temp: 27, weather: '晴', precipitation: 0, wind: '东风1级' },
    { time: '20:00', temp: 26, weather: '晴', precipitation: 0, wind: '无风' },
    { time: '21:00', temp: 25, weather: '晴', precipitation: 0, wind: '无风' }
  ],
  daily: [
    {
      date: '06-10', weekday: '今天', weather: '多云', icon: '⛅',
      tempHigh: 33, tempLow: 22, wind: '东南风', windLevel: 2,
      precipitation: 0, humidity: 45, riskLevel: 'low',
      riskTips: '今日天气良好，适合麦收作业'
    },
    {
      date: '06-11', weekday: '明天', weather: '晴', icon: '☀️',
      tempHigh: 35, tempLow: 23, wind: '南风', windLevel: 2,
      precipitation: 0, humidity: 40, riskLevel: 'none',
      riskTips: '晴天，非常适合收割'
    },
    {
      date: '06-12', weekday: '周五', weather: '晴转多云', icon: '🌤️',
      tempHigh: 34, tempLow: 24, wind: '南风', windLevel: 3,
      precipitation: 5, humidity: 48, riskLevel: 'low'
    },
    {
      date: '06-13', weekday: '周六', weather: '雷阵雨', icon: '⛈️',
      tempHigh: 28, tempLow: 21, wind: '东风', windLevel: 4,
      precipitation: 80, humidity: 80, riskLevel: 'high',
      riskTips: '有雷阵雨，建议提前抢收成熟地块'
    },
    {
      date: '06-14', weekday: '周日', weather: '中雨', icon: '🌧️',
      tempHigh: 25, tempLow: 20, wind: '东北风', windLevel: 3,
      precipitation: 60, humidity: 85, riskLevel: 'high',
      riskTips: '持续降雨，无法作业，注意排水'
    },
    {
      date: '06-15', weekday: '周一', weather: '阴转多云', icon: '🌥️',
      tempHigh: 27, tempLow: 20, wind: '北风', windLevel: 2,
      precipitation: 10, humidity: 70, riskLevel: 'medium',
      riskTips: '雨后天晴，可陆续恢复作业'
    },
    {
      date: '06-16', weekday: '周二', weather: '晴', icon: '☀️',
      tempHigh: 30, tempLow: 19, wind: '西北风', windLevel: 2,
      precipitation: 0, humidity: 55, riskLevel: 'none',
      riskTips: '好天气，抓紧收割'
    }
  ],
  alerts: [
    {
      id: 'a001',
      type: '暴雨预警',
      level: 'orange',
      title: '暴雨橙色预警',
      content: '预计6月13日08时至14日20时，我县将有雷阵雨，局部地区伴有短时强降水、雷暴大风等强对流天气，请广大农户注意抢收成熟小麦，做好排涝准备。',
      publishTime: '2026-06-10 10:00'
    }
  ],
  tips: [
    '未来3天将有降雨，请抓紧抢收已成熟地块',
    '今天下午风力较小，适合晾晒',
    '雷阵雨期间请远离田间电线杆',
    '预计周六日降雨，建议优先收割低洼地段'
  ]
};

export const mockQueue: QueueItem[] = [
  {
    id: 'q001',
    demandId: 'd002',
    farmerName: '张丰收',
    village: '红星村',
    group: '三组',
    area: 15.0,
    priority: true,
    maturity: 'mature',
    estimatedTime: '现在',
    status: 'current'
  },
  {
    id: 'q002',
    demandId: 'd004',
    farmerName: '王大田',
    village: '红星村',
    group: '二组',
    area: 20.5,
    priority: true,
    maturity: 'overripe',
    estimatedTime: '10:30',
    status: 'next'
  },
  {
    id: 'q003',
    demandId: 'd001',
    farmerName: '张丰收',
    village: '红星村',
    group: '三组',
    area: 12.5,
    priority: false,
    maturity: 'mature',
    estimatedTime: '13:00',
    status: 'waiting'
  },
  {
    id: 'q004',
    demandId: 'd003',
    farmerName: '李麦香',
    village: '红星村',
    group: '一组',
    area: 10.2,
    priority: false,
    maturity: 'mature',
    estimatedTime: '15:30',
    status: 'waiting'
  },
  {
    id: 'q005',
    demandId: 'd005',
    farmerName: '孙颗粒',
    village: '红星村',
    group: '五组',
    area: 18.0,
    priority: false,
    maturity: 'mature',
    estimatedTime: '明天上午',
    status: 'waiting'
  },
  {
    id: 'q006',
    demandId: 'd008',
    farmerName: '陈粮囤',
    village: '光明村',
    group: '二组',
    area: 22.0,
    priority: false,
    maturity: 'mature',
    estimatedTime: '明天下午',
    status: 'waiting'
  },
  {
    id: 'q007',
    demandId: 'd006',
    farmerName: '吴丰收',
    village: '前进村',
    group: '二组',
    area: 9.5,
    priority: false,
    maturity: 'mature',
    estimatedTime: '后天上午',
    status: 'waiting'
  },
  {
    id: 'q008',
    demandId: 'd007',
    farmerName: '郑麦浪',
    village: '前进村',
    group: '三组',
    area: 14.3,
    priority: false,
    maturity: 'mature',
    estimatedTime: '后天下午',
    status: 'waiting'
  }
];

export const mockDryingFields: DryingField[] = [
  {
    id: 'df001',
    name: '红星村文化广场晾晒场',
    village: '红星村',
    capacity: 200,
    available: 80,
    contact: '李主任',
    phone: '138****1111',
    status: 'partial'
  },
  {
    id: 'df002',
    name: '红星村小学操场',
    village: '红星村',
    capacity: 150,
    available: 0,
    contact: '王校长',
    phone: '139****2222',
    status: 'full'
  },
  {
    id: 'df003',
    name: '前进村村委会大院',
    village: '前进村',
    capacity: 120,
    available: 120,
    contact: '赵书记',
    phone: '137****3333',
    status: 'available'
  },
  {
    id: 'df004',
    name: '光明村公共晾晒场',
    village: '光明村',
    capacity: 180,
    available: 95,
    contact: '孙主任',
    phone: '136****4444',
    status: 'partial'
  }
];

export const mockNotices: Notice[] = [
  {
    id: 'n001',
    type: 'urgent',
    title: '紧急通知：13日有暴雨',
    content: '据气象部门预报，6月13日-14日我县将有大到暴雨，请广大农户抓紧抢收已成熟小麦，已收割的小麦注意防潮防雨。',
    publisherId: 'c001',
    publisherName: '镇农业办',
    urgent: true,
    validFrom: '2026-06-10',
    validTo: '2026-06-14',
    createdAt: '2026-06-10 09:00'
  },
  {
    id: 'n002',
    type: 'road',
    title: '红星村二组道路施工绕行通知',
    content: '红星村二组至河边路段今日起施工维修，预计两天，收割机请绕行村东头主路进入二组田间。',
    publisherId: 'c002',
    publisherName: '红星村村委会',
    village: '红星村',
    groups: ['二组'],
    urgent: false,
    validFrom: '2026-06-10',
    validTo: '2026-06-12',
    createdAt: '2026-06-10 08:00'
  },
  {
    id: 'n003',
    type: 'drying',
    title: '文化广场晾晒场开放通知',
    content: '红星村文化广场即日起全天候开放作为临时晾晒场，请有序使用，保持场地清洁，每晚20点前清场。',
    publisherId: 'c002',
    publisherName: '红星村村委会',
    village: '红星村',
    urgent: false,
    validFrom: '2026-06-08',
    validTo: '2026-06-20',
    createdAt: '2026-06-08 07:30'
  },
  {
    id: 'n004',
    type: 'urgent',
    title: '优先户识别与服务通知',
    content: '各村协调员请重点关注低保户、留守老人、病残家庭的抢收需求，优先安排作业，确保颗粒归仓。',
    publisherId: 'c001',
    publisherName: '镇农业办',
    urgent: true,
    validFrom: '2026-06-09',
    validTo: '2026-06-25',
    createdAt: '2026-06-09 10:00'
  }
];
