import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockQueue, mockNotices } from '../../data/mockWeather';
import { mockPlots } from '../../data/mockPlots';
import { QueueItem, MaturityLevel } from '../../types';

const villages = [
  { key: 'all', label: '全部' },
  { key: '红星村', label: '红星村' },
  { key: '前进村', label: '前进村' },
  { key: '光明村', label: '光明村' },
];

const maturityLabel: Record<MaturityLevel, string> = {
  immature: '未熟',
  nearly: '将熟',
  mature: '成熟',
  overripe: '过熟'
};

const DispatchPage: React.FC = () => {
  const [village, setVillage] = useState('all');
  const [queue, setQueue] = useState<QueueItem[]>(mockQueue);

  const filteredQueue = village === 'all'
    ? queue
    : queue.filter(q => q.village === village);

  const totalWaiting = queue.filter(q => q.status === 'waiting').length;
  const totalPriority = queue.filter(q => q.priority).length;
  const totalArea = queue.reduce((s, q) => s + q.area, 0);
  const overripeCount = queue.filter(q => q.maturity === 'overripe').length;

  const handleMoveUp = (idx: number) => {
    if (idx <= 0 || filteredQueue[idx].status === 'current') return;
    const newQueue = [...queue];
    const q = filteredQueue[idx];
    const realIdx = newQueue.findIndex(x => x.id === q.id);
    const prevQ = filteredQueue[idx - 1];
    const prevRealIdx = newQueue.findIndex(x => x.id === prevQ.id);
    if (prevQ.status !== 'current') {
      [newQueue[realIdx], newQueue[prevRealIdx]] = [newQueue[prevRealIdx], newQueue[realIdx]];
      setQueue(newQueue);
      Taro.showToast({ title: '已上移', icon: 'success' });
      console.log('[Dispatch] 上移排队:', q.farmerName);
    }
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= filteredQueue.length - 1 || filteredQueue[idx].status === 'current') return;
    const newQueue = [...queue];
    const q = filteredQueue[idx];
    const realIdx = newQueue.findIndex(x => x.id === q.id);
    const nextQ = filteredQueue[idx + 1];
    const nextRealIdx = newQueue.findIndex(x => x.id === nextQ.id);
    [newQueue[realIdx], newQueue[nextRealIdx]] = [newQueue[nextRealIdx], newQueue[realIdx]];
    setQueue(newQueue);
    Taro.showToast({ title: '已下移', icon: 'success' });
  };

  const handleTogglePriority = (id: string) => {
    const newQueue = queue.map(q => q.id === id ? { ...q, priority: !q.priority } : q);
    setQueue(newQueue);
    const item = queue.find(q => q.id === id);
    Taro.showToast({ title: item?.priority ? '已取消优先' : '已设为优先', icon: 'success' });
  };

  const onRefresh = () => {
    console.log('[Dispatch] 刷新');
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
        <ScrollView className={styles.villageTabs} scrollX>
          {villages.map(v => (
            <View
              key={v.key}
              className={classnames(styles.villageTab, village === v.key && styles.active)}
              onClick={() => setVillage(v.key)}
            >
              <Text className={styles.villageTabText}>{v.label}</Text>
            </View>
          ))}
        </ScrollView>

        <View className={styles.quickStats}>
          <View className={styles.quickCell}>
            <Text className={styles.quickNum}>{queue.length}</Text>
            <Text className={styles.quickLabel}>排队总数</Text>
          </View>
          <View className={styles.quickCell}>
            <Text className={styles.quickNum}>{totalWaiting}</Text>
            <Text className={styles.quickLabel}>待作业</Text>
          </View>
          <View className={styles.quickCell}>
            <Text className={styles.quickNum}>{totalPriority}</Text>
            <Text className={styles.quickLabel}>优先户</Text>
          </View>
          <View className={styles.quickCell}>
            <Text className={styles.quickNum}>{totalArea.toFixed(0)}</Text>
            <Text className={styles.quickLabel}>总面积(亩)</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📋</Text>
            <Text className={styles.sectionTitleText}>排队列表</Text>
          </View>
          <View
            className={styles.actionBtn}
            onClick={() => Taro.navigateTo({ url: '/pages/notice-publish/index' })}
          >
            <Text className={styles.actionBtnText}>+ 发布通知</Text>
          </View>
        </View>

        <View className={styles.queueHeader}>
          <View className={styles.queueHeaderLeft}>
            <Text className={styles.queueHeaderIcon}>💡</Text>
            <Text className={styles.queueHeaderTitle}>点击排序按钮可调整顺序</Text>
          </View>
          <Text className={styles.queueHeaderTip}>共 {filteredQueue.length} 条</Text>
        </View>

        {filteredQueue.map((q, idx) => (
          <View key={q.id} className={classnames(styles.queueItem, styles[q.status])}>
            <View className={styles.rankNo}>
              <Text className={styles.rankNoText}>{idx + 1}</Text>
            </View>
            <View className={styles.queueBody}>
              <View className={styles.queueTop}>
                <Text className={styles.queueName}>{q.farmerName}</Text>
                {q.priority && (
                  <View className={styles.priorityTag}>
                    <Text className={styles.priorityTagText}>优先</Text>
                  </View>
                )}
                {(q.maturity === 'mature' || q.maturity === 'overripe') && (
                  <View className={classnames(styles.maturityTag, q.maturity)}>
                    <Text className={styles.maturityTagText}>{maturityLabel[q.maturity]}</Text>
                  </View>
                )}
              </View>
              <View className={styles.queueMeta}>
                <View className={styles.queueMetaItem}>
                  <Text className={styles.queueMetaIcon}>📍</Text>
                  <Text className={styles.queueMetaText}>{q.village}{q.group}</Text>
                </View>
                <View className={styles.queueMetaItem}>
                  <Text className={styles.queueMetaIcon}>🌾</Text>
                  <Text className={styles.queueMetaText}>{q.area}亩</Text>
                </View>
              </View>
            </View>
            <View className={styles.queueRight}>
              <Text className={styles.queueTime}>{q.estimatedTime}</Text>
              <Text className={styles.queueTimeLabel}>预计作业</Text>
              <View className={styles.queueActions}>
                <View
                  className={classnames(styles.miniBtn, styles.up)}
                  onClick={() => handleMoveUp(idx)}
                >
                  <Text className={styles.miniBtnText}>↑上移</Text>
                </View>
                <View
                  className={classnames(styles.miniBtn, styles.down)}
                  onClick={() => handleMoveDown(idx)}
                >
                  <Text className={styles.miniBtnText}>↓下移</Text>
                </View>
                <View
                  className={classnames(styles.miniBtn, styles.priority)}
                  onClick={() => handleTogglePriority(q.id)}
                >
                  <Text className={styles.miniBtnText}>{q.priority ? '取消' : '优先'}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View className={styles.noticeSection}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📢</Text>
              <Text className={styles.sectionTitleText}>最新通知</Text>
            </View>
          </View>
          {mockNotices.slice(0, 3).map(n => (
            <View key={n.id} className={styles.noticeCard}>
              <View className={styles.noticeCardHeader}>
                <View className={classnames(styles.noticeTypeTag, n.type)}>
                  <Text className={styles.noticeTypeText}>
                    {n.type === 'urgent' ? '🚨紧急' : n.type === 'road' ? '🛣️道路' : '☀️晾晒'}
                  </Text>
                </View>
                <Text className={styles.noticeTitle}>{n.title}</Text>
                <Text className={styles.noticeTime}>{n.createdAt.slice(5, 11)}</Text>
              </View>
              <Text className={styles.noticeContent}>{n.content}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default DispatchPage;
