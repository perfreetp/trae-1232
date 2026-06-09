import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useUserStore } from '../../store/userStore';
import { useAppStore } from '../../store/appStore';
import { OrderStatus } from '../../types';
import OrderCard from '../../components/OrderCard';
import EmptyState from '../../components/EmptyState';

type TabType = 'all' | OrderStatus;

const statusTabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接单' },
  { key: 'accepted', label: '已接单' },
  { key: 'working', label: '作业中' },
  { key: 'submitted', label: '待确认' },
  { key: 'confirmed', label: '待评价' },
  { key: 'settled', label: '已完成' },
];

const OrdersPage: React.FC = () => {
  const { user, currentRole } = useUserStore();
  const orders = useAppStore(s => s.orders);
  const orderFilters = useAppStore(s => s.orderFilters);
  const clearOrderFilters = useAppStore(s => s.clearOrderFilters);
  const refreshQueueRank = useAppStore(s => s.refreshQueueRank);
  const [tab, setTab] = useState<TabType>('all');
  const [appliedFilters, setAppliedFilters] = useState<{ status: TabType; village: string }>({ status: 'all', village: '' });

  useDidShow(() => {
    if (orderFilters.status !== 'all' || orderFilters.village !== '') {
      setTab(orderFilters.status as TabType);
      setAppliedFilters({
        status: orderFilters.status as TabType,
        village: orderFilters.village
      });
      const villageText = orderFilters.village ? ` · ${orderFilters.village}` : '';
      const statusLabel = statusTabs.find(t => t.key === orderFilters.status)?.label || '';
      if (orderFilters.status !== 'all' || orderFilters.village) {
        Taro.showToast({
          title: `已筛选：${statusLabel || '全部'}${villageText}`,
          icon: 'none',
          duration: 2000
        });
      }
    }
  });

  useEffect(() => {
    refreshQueueRank();
  }, [refreshQueueRank]);

  const myOrders = useMemo(() => orders.filter(o => {
    if (currentRole === 'farmer') return o.farmerId === user?.id;
    if (currentRole === 'operator') return o.operatorId === 'op001' || o.operatorId === 'op002' || o.operatorId === 'op003';
    return true;
  }), [orders, currentRole, user]);

  const filteredOrders = useMemo(() => {
    let result = myOrders;
    const activeTab = appliedFilters.status !== 'all' ? appliedFilters.status : tab;
    if (activeTab !== 'all') {
      result = result.filter(o => o.status === activeTab);
    }
    if (appliedFilters.village) {
      result = result.filter(o => o.plot?.village === appliedFilters.village);
    }
    return result;
  }, [myOrders, tab, appliedFilters]);

  const tabCounts = statusTabs.reduce((acc, t) => {
    acc[t.key] = t.key === 'all'
      ? myOrders.length
      : myOrders.filter(o => o.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = myOrders
    .filter(o => o.status === 'settled')
    .reduce((s, o) => s + o.totalAmount, 0);
  const totalArea = myOrders
    .filter(o => o.status === 'settled')
    .reduce((s, o) => s + o.area, 0);

  const hasFilter = appliedFilters.status !== 'all' || appliedFilters.village !== '';

  const handleClearFilters = () => {
    clearOrderFilters();
    setAppliedFilters({ status: 'all', village: '' });
    setTab('all');
    Taro.showToast({ title: '已清除筛选', icon: 'success' });
  };

  const onRefresh = () => {
    console.log('[Orders] 刷新');
    setTimeout(() => Taro.stopPullDownRefresh(), 600);
  };

  return (
    <ScrollView
      className={styles.pageWrap}
      scrollY
      refresherEnabled
      onRefresherRefresh={onRefresh}
    >
      {hasFilter && (
        <View className={styles.filterBar}>
          <Text className={styles.filterBarText}>
            🎯 当前筛选：
            {appliedFilters.status !== 'all' && statusTabs.find(t => t.key === appliedFilters.status)?.label}
            {appliedFilters.status !== 'all' && appliedFilters.village && ' · '}
            {appliedFilters.village}
          </Text>
          <View className={styles.filterClear} onClick={handleClearFilters}>
            <Text className={styles.filterClearText}>清除</Text>
          </View>
        </View>
      )}

      <View className={styles.tabBar}>
        {statusTabs.slice(0, 5).map(t => {
          const isActive = (appliedFilters.status !== 'all' ? appliedFilters.status : tab) === t.key;
          return (
            <View
              key={t.key}
              className={classnames(styles.tabItem, isActive && styles.active)}
              onClick={() => {
                if (hasFilter) {
                  setAppliedFilters({ ...appliedFilters, status: t.key });
                } else {
                  setTab(t.key);
                }
              }}
            >
              <Text className={styles.tabLabel}>{t.label}</Text>
              <Text className={styles.tabCount}>{tabCounts[t.key] || 0}</Text>
            </View>
          );
        })}
      </View>

      <View className={styles.content}>
        <View className={styles.summaryCard}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{myOrders.length}</Text>
            <Text className={styles.summaryLabel}>总订单</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{myOrders.filter(o => o.status === 'working' || o.status === 'accepted').length}</Text>
            <Text className={styles.summaryLabel}>进行中</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{myOrders.filter(o => o.status === 'settled').length}</Text>
            <Text className={styles.summaryLabel}>已完成</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>¥{totalAmount}</Text>
            <Text className={styles.summaryLabel}>已结算</Text>
          </View>
        </View>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="📦"
            title={hasFilter ? '没有符合条件的订单' : '暂无订单'}
            description={hasFilter ? '尝试清除筛选条件查看更多订单' : (currentRole === 'farmer' ? '去地块页面发起抢收需求吧' : '等待新的抢收订单派单')}
            actionText={hasFilter ? '清除筛选' : (currentRole === 'farmer' ? '去发起需求' : '刷新看看')}
            onAction={() => {
              if (hasFilter) {
                handleClearFilters();
              } else if (currentRole === 'farmer') {
                Taro.switchTab({ url: '/pages/plots/index' });
              }
            }}
          />
        ) : (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default OrdersPage;
