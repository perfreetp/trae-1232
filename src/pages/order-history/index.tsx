import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store/appStore';
import { useUserStore } from '../../store/userStore';
import { calcOrderFinance, formatMoney, formatArea } from '../../utils/orderFinance';

type DebtFilter = 'all' | 'none' | 'hasDebt' | 'partial' | 'cleared';

const DEBT_FILTER_TABS: { key: DebtFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'none', label: '无欠款' },
  { key: 'hasDebt', label: '有欠款' },
  { key: 'partial', label: '部分还款' },
  { key: 'cleared', label: '欠款已清' },
];

const OrderHistoryPage: React.FC = () => {
  const { currentRole, user } = useUserStore();
  const { orders: allOrders } = useAppStore();

  const settledOrders = useMemo(() => {
    return allOrders.filter(o => {
      if (o.status !== 'settled') return false;
      if (!user) return false;
      if (currentRole === 'farmer') {
        return o.farmerId === user.id;
      } else if (currentRole === 'operator') {
        return o.operatorId === user.id;
      }
      return true;
    });
  }, [allOrders, currentRole, user]);

  const years = useMemo(() => {
    const yearSet = new Set<string>();
    settledOrders.forEach(o => {
      if (o.settledAt) {
        yearSet.add(o.settledAt.slice(0, 4));
      }
    });
    const yearArr = Array.from(yearSet);
    yearArr.sort((a, b) => Number(b) - Number(a));
    return yearArr.length > 0 ? yearArr : ['2026'];
  }, [settledOrders]);

  const [year, setYear] = useState<string>(years[0]);
  const [keyword, setKeyword] = useState('');
  const [debtFilter, setDebtFilter] = useState<DebtFilter>('all');

  const ordersWithFin = useMemo(() => {
    return settledOrders.map(o => ({
      ...o,
      fin: calcOrderFinance(o),
    }));
  }, [settledOrders]);

  const orders = useMemo(() => {
    return ordersWithFin.filter(o => {
      if (!o.settledAt) return false;
      if (!o.settledAt.startsWith(year)) return false;

      if (keyword) {
        const kw = keyword.toLowerCase();
        const match =
          o.plot.address.toLowerCase().includes(kw) ||
          o.farmerName.toLowerCase().includes(kw) ||
          o.operatorName.toLowerCase().includes(kw) ||
          o.id.toLowerCase().includes(kw);
        if (!match) return false;
      }

      switch (debtFilter) {
        case 'none':
          return o.fin.debtAmount === 0 && o.fin.debtStatus === 'none';
        case 'hasDebt':
          return o.fin.debtStatus === 'full' || o.fin.debtStatus === 'partial';
        case 'partial':
          return o.fin.debtStatus === 'partial';
        case 'cleared':
          return o.fin.debtAmount > 0 && o.fin.debtStatus === 'none';
        case 'all':
        default:
          return true;
      }
    });
  }, [ordersWithFin, year, keyword, debtFilter]);

  const totalArea = useMemo(() => orders.reduce((s, o) => s + o.fin.actualArea, 0), [orders]);
  const totalAmount = useMemo(() => orders.reduce((s, o) => s + o.fin.totalPayable, 0), [orders]);
  const avgRating = useMemo(() => {
    const rated = orders.filter(o => o.evaluation && typeof o.evaluation.rating === 'number');
    if (rated.length === 0) return '--';
    const sum = rated.reduce((s, o) => s + (o.evaluation!.rating || 0), 0);
    return (sum / rated.length).toFixed(1);
  }, [orders]);

  const handleCall = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone }).catch(() => {});
  };

  const handleReorder = () => {
    if (currentRole === 'farmer') {
      Taro.switchTab({ url: '/pages/plots/index' }).catch(() => {
        Taro.navigateTo({ url: '/pages/plots/index' });
      });
    } else {
      Taro.switchTab({ url: '/pages/order-queue/index' }).catch(() => {
        Taro.navigateTo({ url: '/pages/order-queue/index' });
      });
    }
  };

  const formatOrderNo = (id: string) => {
    const num = id.replace(/\D/g, '');
    return num ? num.padStart(6, '0') : id.toUpperCase();
  };

  const renderDebtBadge = (o: typeof ordersWithFin[0]) => {
    const { debtStatus, remainingDebt, debtAmount } = o.fin;
    if (debtStatus === 'none' || debtAmount === 0) {
      return (
        <View className={classnames(styles.debtBadge, styles.badgeGreen)}>
          <Text className={styles.badgeText}>已结清</Text>
        </View>
      );
    }
    if (debtStatus === 'full') {
      return (
        <View className={classnames(styles.debtBadge, styles.badgeRed)}>
          <Text className={styles.badgeText}>全额欠款</Text>
        </View>
      );
    }
    return (
      <View className={classnames(styles.debtBadge, styles.badgeYellow)}>
        <Text className={styles.badgeText}>部分还款 {formatMoney(remainingDebt)}</Text>
      </View>
    );
  };

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.header}>
        <View className={styles.searchRow}>
          <View className={styles.searchBar}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder="搜索地块、农户姓名、订单号..."
              value={keyword}
              onInput={(e: any) => setKeyword(e.detail.value)}
            />
          </View>
          <View className={styles.calBtn}>📅</View>
        </View>
        <ScrollView className={styles.yearTabs} scrollX style={{ display: 'flex', gap: 16, overflow: 'auto' }}>
          {years.map(y => (
            <View
              key={y}
              className={classnames(styles.yearTab, year === y && styles.active)}
              onClick={() => setYear(y)}
            >
              <Text className={styles.yearText}>{y}年麦收</Text>
            </View>
          ))}
        </ScrollView>
        <ScrollView className={styles.debtTabs} scrollX style={{ display: 'flex', gap: 8, overflow: 'auto', marginTop: 12 }}>
          {DEBT_FILTER_TABS.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.debtTab, debtFilter === tab.key && styles.debtTabActive)}
              onClick={() => setDebtFilter(tab.key)}
            >
              <Text className={classnames(styles.debtTabText, debtFilter === tab.key && styles.debtTabTextActive)}>{tab.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.content}>
        <View className={styles.summary}>
          <View className={styles.sumCell}>
            <Text className={styles.sumNum}>{orders.length}</Text>
            <Text className={styles.sumLabel}>订单数</Text>
          </View>
          <View className={styles.sumCell}>
            <Text className={styles.sumNum}>{formatArea(totalArea)}</Text>
            <Text className={styles.sumLabel}>总面积(亩)</Text>
          </View>
          <View className={styles.sumCell}>
            <Text className={styles.sumNum}>{formatMoney(totalAmount)}</Text>
            <Text className={styles.sumLabel}>总金额</Text>
          </View>
          <View className={styles.sumCell}>
            <Text className={styles.sumNum}>{avgRating}</Text>
            <Text className={styles.sumLabel}>平均分</Text>
          </View>
        </View>

        {orders.map(o => (
          <View
            key={o.id}
            className={styles.orderItem}
            onClick={() => Taro.navigateTo({ url: `/pages/order-detail/index?id=${o.id}` })}
          >
            <View className={styles.orderTop}>
              <Text className={styles.orderNo}>NO.{formatOrderNo(o.id)} · {o.settledAt?.slice(0, 10)}</Text>
              <Text className={styles.statusTag}>
                {o.status === 'settled' ? '✅ 已完成' : '已取消'}
              </Text>
            </View>
            <View className={styles.orderMid}>
              <View className={styles.plotInfo}>
                <Text className={styles.plotAddr}>📍 {o.plot.address}</Text>
                <Text className={styles.plotDetail}>🌾 {formatArea(o.fin.actualArea)} 亩 · ¥{o.fin.unitPrice}/亩 · {o.machineName}</Text>
              </View>
              <View className={styles.priceCol}>
                <Text className={styles.price}>{formatMoney(o.fin.totalPayable)}</Text>
              </View>
            </View>
            <View className={styles.orderBottom}>
              <View className={styles.peerInfo}>
                <View className={styles.peerAvatar}>{currentRole === 'farmer' ? '🚜' : '🧑'}</View>
                <Text className={styles.peerName}>
                  {currentRole === 'farmer'
                    ? `机手 ${o.operatorName} · ${o.operatorPhone}`
                    : `农户 ${o.farmerName} · ${o.farmerPhone}`}
                </Text>
              </View>
              <View className={styles.rightBottom}>
                {renderDebtBadge(o)}
                <View className={styles.actionBtns}>
                  <View
                    className={styles.ghostBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(currentRole === 'farmer' ? o.operatorPhone : o.farmerPhone);
                    }}
                  >
                    <Text className={styles.ghostBtnText}>📞 联系</Text>
                  </View>
                  <View
                    className={styles.primaryBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReorder();
                    }}
                  >
                    <Text className={styles.primaryBtnText}>🌾 再来一单</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        {orders.length === 0 && (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无已完成的订单</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderHistoryPage;
