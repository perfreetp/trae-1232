import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useUserStore } from '../../store/userStore';
import { mockPlots } from '../../data/mockPlots';
import PlotCard from '../../components/PlotCard';
import EmptyState from '../../components/EmptyState';

type FilterType = 'all' | 'queued' | 'idle' | 'mature' | 'priority';

const PlotsPage: React.FC = () => {
  const { user, currentRole } = useUserStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const myPlots = currentRole === 'farmer'
    ? mockPlots.filter(p => p.farmerId === user?.id)
    : mockPlots;

  const filteredPlots = myPlots.filter(p => {
    switch (filter) {
      case 'queued': return p.hasDemand;
      case 'idle': return !p.hasDemand;
      case 'mature': return p.maturity === 'mature' || p.maturity === 'overripe';
      case 'priority': return p.priority;
      default: return true;
    }
  });

  const totalArea = myPlots.reduce((s, p) => s + p.area, 0);
  const queuedCount = myPlots.filter(p => p.hasDemand).length;
  const matureCount = myPlots.filter(p => p.maturity === 'mature' || p.maturity === 'overripe').length;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `全部 ${myPlots.length}` },
    { key: 'queued', label: `排队中 ${queuedCount}` },
    { key: 'mature', label: `可收割 ${matureCount}` },
    { key: 'idle', label: `待发起 ${myPlots.length - queuedCount}` },
    { key: 'priority', label: `优先 ${myPlots.filter(p => p.priority).length}` },
  ];

  const handleAddPlot = () => {
    Taro.navigateTo({ url: '/pages/demand-publish/index' });
  };

  const onRefresh = () => {
    console.log('[Plots] 刷新');
    setTimeout(() => Taro.stopPullDownRefresh(), 600);
  };

  return (
    <ScrollView
      className={styles.pageWrap}
      scrollY
      refresherEnabled
      onRefresherRefresh={onRefresh}
    >
      <View className={styles.header}>
        <ScrollView className={styles.filterBar} scrollX>
          {filters.map(f => (
            <View
              key={f.key}
              className={classnames(styles.filterItem, filter === f.key && styles.active)}
              onClick={() => setFilter(f.key)}
            >
              <Text className={styles.filterText}>{f.label}</Text>
            </View>
          ))}
        </ScrollView>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchPlaceholder}>搜索地块位置、农户姓名...</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsRow}>
          <View className={styles.statsCell}>
            <Text className={styles.statsNum}>{myPlots.length}</Text>
            <Text className={styles.statsLabel}>地块数</Text>
          </View>
          <View className={styles.statsCell}>
            <Text className={styles.statsNum}>{totalArea.toFixed(1)}</Text>
            <Text className={styles.statsLabel}>总面积(亩)</Text>
          </View>
          <View className={styles.statsCell}>
            <Text className={styles.statsNum}>{queuedCount}</Text>
            <Text className={styles.statsLabel}>抢收中</Text>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🌾</Text>
            <Text className={styles.sectionTitleText}>地块列表</Text>
          </View>
          <View className={styles.addBtn} onClick={handleAddPlot}>
            <Text className={styles.addBtnText}>+ 新增地块</Text>
          </View>
        </View>

        {filteredPlots.length === 0 ? (
          <EmptyState
            icon="🌾"
            title="暂无地块"
            description="点击下方按钮登记您的第一块麦田"
            actionText="登记地块"
            onAction={handleAddPlot}
          />
        ) : (
          filteredPlots.map(plot => (
            <PlotCard
              key={plot.id}
              plot={plot}
              onClick={() => Taro.navigateTo({ url: `/pages/plot-detail/index?id=${plot.id}` })}
            />
          ))
        )}
      </View>

      <View className={styles.fabBtn} onClick={handleAddPlot}>
        <Text className={styles.fabIcon}>＋</Text>
      </View>
    </ScrollView>
  );
};

export default PlotsPage;
