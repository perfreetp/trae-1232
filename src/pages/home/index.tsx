import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useUserStore } from '../../store/userStore';
import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types';
import { mockWeather } from '../../data/mockWeather';
import { mockMachines } from '../../data/mockMachines';
import NoticeBanner from '../../components/NoticeBanner';
import WeatherCard from '../../components/WeatherCard';
import QuickEntry, { QuickEntryItem } from '../../components/QuickEntry';
import StatCard from '../../components/StatCard';

const roleConfig: Record<UserRole, { icon: string; label: string; greetings: string }> = {
  farmer: { icon: '👨‍🌾', label: '农户', greetings: '欢迎使用小麦抢收平台' },
  operator: { icon: '🚜', label: '机手', greetings: '今日任务准备好了吗' },
  coordinator: { icon: '📋', label: '协调员', greetings: '今日调度任务待处理' }
};

const HomePage: React.FC = () => {
  const { user, currentRole, setRole } = useUserStore();
  const plots = useAppStore(s => s.plots);
  const orders = useAppStore(s => s.orders);
  const queue = useAppStore(s => s.queue);
  const dryingFields = useAppStore(s => s.dryingFields);
  const notices = useAppStore(s => s.notices);
  const refreshQueueRank = useAppStore(s => s.refreshQueueRank);
  const roleInfo = roleConfig[currentRole];

  useEffect(() => {
    refreshQueueRank();
  }, [refreshQueueRank]);

  const urgentNotices = notices.filter(n => n.urgent).slice(0, 3);
  const myPlots = currentRole === 'farmer' ? plots.filter(p => p.farmerId === user?.id) : plots;
  const myOrders = orders.filter(o => {
    if (currentRole === 'farmer') return o.farmerId === user?.id;
    if (currentRole === 'operator') return o.operatorId === 'op001' || o.operatorId === 'op002' || o.operatorId === 'op003';
    return true;
  });

  const pendingCount = currentRole === 'farmer'
    ? myPlots.filter(p => p.hasDemand && (p.queuePosition ?? 99) > 0).length
    : currentRole === 'operator'
    ? orders.filter(o => o.status === 'pending').length
    : queue.filter(q => q.status === 'waiting').length;

  const workingCount = currentRole === 'operator'
    ? orders.filter(o => o.status === 'working').length
    : mockMachines.filter(m => m.status === 'working').length;

  const completedToday = orders.filter(o => o.status === 'settled').length;
  const idleMachines = mockMachines.filter(m => m.status === 'idle').length;

  const quickEntries: QuickEntryItem[] = currentRole === 'farmer' ? [
    { key: 'plot', icon: '🌾', label: '地块登记', color: 'green', path: '/pages/plots/index' },
    { key: 'demand', icon: '📝', label: '发起抢收', color: 'primary', badge: myPlots.filter(p => !p.hasDemand && p.maturity !== 'immature').length || undefined, path: '/pages/demand-publish/index' },
    { key: 'queue', icon: '📊', label: '我的排队', color: 'blue', path: '/pages/plots/index' },
    { key: 'weather', icon: '⛅', label: '天气查看', color: 'orange', path: '/pages/weather-detail/index' },
    { key: 'orders', icon: '📦', label: '我的订单', color: 'purple', path: '/pages/orders/index' },
    { key: 'work', icon: '✅', label: '作业确认', color: 'green', path: '/pages/order-history/index' },
    { key: 'evaluate', icon: '⭐', label: '服务评价', color: 'primary', path: '/pages/order-history/index' },
    { key: 'history', icon: '📜', label: '历史记录', color: 'blue', path: '/pages/order-history/index' },
  ] : currentRole === 'operator' ? [
    { key: 'orders', icon: '📦', label: '订单大厅', color: 'primary', badge: pendingCount || undefined, path: '/pages/orders/index' },
    { key: 'machine', icon: '🚜', label: '收割机', color: 'blue', path: '/pages/machine-manage/index' },
    { key: 'working', icon: '⚡', label: '作业中', color: 'green', badge: workingCount || undefined, path: '/pages/orders/index' },
    { key: 'submit', icon: '📸', label: '作业提交', color: 'orange', path: '/pages/orders/index' },
    { key: 'weather', icon: '⛅', label: '天气查看', color: 'purple', path: '/pages/weather-detail/index' },
    { key: 'settle', icon: '💰', label: '结算记录', color: 'green', path: '/pages/order-history/index' },
    { key: 'rank', icon: '🏆', label: '服务排行', color: 'primary' },
    { key: 'history', icon: '📜', label: '历史订单', color: 'blue', path: '/pages/order-history/index' },
  ] : [
    { key: 'dispatch', icon: '📋', label: '排队调度', color: 'primary', path: '/pages/dispatch/index' },
    { key: 'priority', icon: '🎯', label: '优先户', color: 'red', badge: queue.filter(q => q.priority).length || undefined, path: '/pages/dispatch/index' },
    { key: 'notice', icon: '📢', label: '发布通知', color: 'orange', path: '/pages/notice-publish/index' },
    { key: 'drying', icon: '☀️', label: '晾晒场', color: 'green' },
    { key: 'weather', icon: '⛅', label: '天气预警', color: 'blue', badge: mockWeather.alerts.length || undefined, path: '/pages/weather-detail/index' },
    { key: 'stats', icon: '📊', label: '数据统计', color: 'purple' },
    { key: 'machine', icon: '🚜', label: '农机调度', color: 'primary' },
    { key: 'village', icon: '🏘️', label: '村组管理', color: 'orange' },
  ];

  const todoItems = currentRole === 'farmer' ? [
    { icon: '🌾', title: '西洼地待收割', desc: '第1位 · 预计现在', path: '/pages/plot-detail/index?id=p003' },
    { icon: '⏳', title: '东头麦田排队中', desc: '第3位 · 预计13:00', path: '/pages/plot-detail/index?id=p001' },
    { icon: '✅', title: '待评价订单 O003', desc: '河边麦田已完成', path: '/pages/settlement/index?id=o003' },
  ] : currentRole === 'operator' ? [
    { icon: '📦', title: '待接单 ' + pendingCount + ' 个', desc: '红星村五组 18亩', path: '/pages/orders/index' },
    { icon: '⚡', title: '西洼地作业中', desc: '张丰收 15亩 · 预计10:30完', path: '/pages/order-detail/index?id=o002' },
    { icon: '📸', title: '提交作业记录', desc: '河边麦田 O003', path: '/pages/work-submit/index?id=o002' },
  ] : [
    { icon: '🎯', title: '优先户待确认', desc: queue.filter(q => q.priority).length + ' 户需重点关注', path: '/pages/dispatch/index' },
    { icon: '📋', title: '待调度 ' + queue.filter(q => q.status === 'waiting').length + ' 单', desc: '红星村、前进村排队中', path: '/pages/dispatch/index' },
    { icon: '📢', title: '紧急通知发布', desc: '暴雨预警 请提前抢收', path: '/pages/notice-publish/index' },
  ];

  const handleSwitchRole = () => {
    const roles: UserRole[] = ['farmer', 'operator', 'coordinator'];
    const idx = roles.indexOf(currentRole);
    const nextRole = roles[(idx + 1) % roles.length];
    setRole(nextRole);
    Taro.showToast({ title: `切换为${roleConfig[nextRole].label}身份`, icon: 'success' });
    console.log('[Home] 切换角色:', { from: currentRole, to: nextRole });
  };

  const onRefresh = () => {
    console.log('[Home] 页面刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '已更新', icon: 'success' });
    }, 800);
  };

  return (
    <ScrollView
      className={styles.pageWrap}
      scrollY
      refresherEnabled
      refresherTriggered={false}
      onRefresherRefresh={onRefresh}
    >
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.userInfo}>
            <View className={styles.avatar}>
              <Text className={styles.avatarIcon}>{roleInfo.icon}</Text>
            </View>
            <View className={styles.userDetail}>
              <Text className={styles.greeting}>您好，{roleInfo.label}</Text>
              <Text className={styles.userName}>{user?.name || '用户'}</Text>
              <View className={styles.roleTag}>
                <Text className={styles.roleTagIcon}>📍</Text>
                <Text className={styles.roleTagText}>{user?.village || '红星村'} {user?.group || ''}</Text>
              </View>
            </View>
          </View>
          <View className={styles.switchBtn} onClick={handleSwitchRole}>
            <Text className={styles.switchBtnText}>🔄 切换身份</Text>
          </View>
        </View>
        <Text className={styles.headerTitle}>🌾 三夏抢收，颗粒归仓</Text>
        <Text className={styles.headerSubtitle}>{roleInfo.greetings} · 共{myPlots.length}块地 · 总{myPlots.reduce((s, p) => s + p.area, 0).toFixed(1)}亩</Text>
      </View>

      <View className={styles.content}>
        <NoticeBanner notices={urgentNotices} />

        <View className={styles.section}>
          <WeatherCard weather={mockWeather} />
        </View>

        <View className={styles.section}>
          <QuickEntry items={quickEntries} columns={4} />
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📊</Text>
              <Text className={styles.sectionTitleText}>今日数据看板</Text>
            </View>
          </View>
          <View className={styles.statGrid}>
            <StatCard
              label={currentRole === 'farmer' ? '待收割' : currentRole === 'operator' ? '待接单' : '待调度'}
              value={pendingCount}
              unit="单"
              icon="⏳"
              color="warning"
              onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}
            />
            <StatCard
              label="作业中"
              value={workingCount}
              unit="单"
              icon="⚡"
              color="primary"
            />
            <StatCard
              label="今日完成"
              value={completedToday}
              unit="单"
              icon="✅"
              color="success"
              trend={`面积 ${orders.filter(o => o.status === 'settled').reduce((s, o) => s + o.area, 0).toFixed(0)} 亩`}
            />
            <StatCard
              label="空闲农机"
              value={idleMachines}
              unit="台"
              icon="🚜"
              color="info"
              onClick={() => Taro.navigateTo({ url: '/pages/machine-manage/index' })}
            />
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📋</Text>
              <Text className={styles.sectionTitleText}>待办事项</Text>
            </View>
            <Text className={styles.sectionMore}>查看全部 ›</Text>
          </View>
          <View className={styles.todoCard}>
            <View className={styles.todoList}>
              {todoItems.map((item, idx) => (
                <View
                  key={idx}
                  className={styles.todoItem}
                  onClick={() => item.path && Taro.navigateTo({ url: item.path })}
                >
                  <Text className={styles.todoItemIcon}>{item.icon}</Text>
                  <View className={styles.todoItemBody}>
                    <Text className={styles.todoItemTitle}>{item.title}</Text>
                    <Text className={styles.todoItemDesc}>{item.desc}</Text>
                  </View>
                  <Text className={styles.todoItemArrow}>›</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.dryingCard}>
            <View className={styles.dryingHeader}>
              <View className={styles.dryingTitle}>
                <Text className={styles.dryingTitleIcon}>☀️</Text>
                <Text className={styles.dryingTitleText}>晾晒场动态</Text>
              </View>
              <Text className={styles.sectionMore}>更多 ›</Text>
            </View>
            <View className={styles.dryingList}>
              {dryingFields.slice(0, 3).map((field) => (
                <View key={field.id} className={styles.dryingItem}>
                  <View className={styles.dryingItemLeft}>
                    <Text className={styles.dryingItemName}>{field.name}</Text>
                    <Text className={styles.dryingItemVillage}>{field.village} · 联系人 {field.contact}</Text>
                  </View>
                  <View className={styles.dryingItemRight}>
                    <Text className={styles.dryingCapacity}>{field.available}吨</Text>
                    <Text className={classnames(styles.dryingStatus, styles[field.status])}>
                      {field.status === 'available' ? '空闲' : field.status === 'partial' ? '部分' : '已满'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
