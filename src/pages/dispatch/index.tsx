import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store/appStore';
import { useUserStore } from '../../store/userStore';
import { QueueItem, MaturityLevel, OrderStatus, Order } from '../../types';

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

type ProgressStatus = 'queuing' | 'working' | 'submitted' | 'settled';

const progressStatusMap: Record<ProgressStatus, { label: string; statuses: OrderStatus[]; color: string }> = {
  queuing: { label: '排队中', statuses: ['pending', 'accepted'], color: '#8B5CF6' },
  working: { label: '作业中', statuses: ['working'], color: '#3B82F6' },
  submitted: { label: '待确认', statuses: ['submitted'], color: '#F59E0B' },
  settled: { label: '已结算', statuses: ['settled', 'confirmed'], color: '#10B981' },
};

type QueueTab = 'queue' | 'dispute';

const DispatchPage: React.FC = () => {
  const { user, currentRole } = useUserStore();
  const [village, setVillage] = useState('all');
  const [queueTab, setQueueTab] = useState<QueueTab>('queue');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Order | null>(null);
  const [resolutionType, setResolutionType] = useState<'reject' | 'adjust' | 'accept'>('adjust');
  const [resolutionNote, setResolutionNote] = useState('');

  const queue = useAppStore(s => s.queue);
  const orders = useAppStore(s => s.orders);
  const notices = useAppStore(s => s.notices);
  const moveQueueItem = useAppStore(s => s.moveQueueItem);
  const togglePriority = useAppStore(s => s.togglePriority);
  const refreshQueueRank = useAppStore(s => s.refreshQueueRank);
  const getDisputedOrders = useAppStore(s => s.getDisputedOrders);
  const handleDispute = useAppStore(s => s.handleDispute);
  const setOrderFilters = useAppStore(s => s.setOrderFilters);

  const isCoordinator = currentRole === 'coordinator';
  const disputedOrders = useMemo(() => getDisputedOrders(), [getDisputedOrders, orders]);

  useEffect(() => {
    refreshQueueRank();
  }, [refreshQueueRank]);

  const villageStats = useMemo(() => {
    const stats: Record<string, Record<ProgressStatus, { count: number; area: number }>> = {};
    villages.filter(v => v.key !== 'all').forEach(v => {
      stats[v.key] = {
        queuing: { count: 0, area: 0 },
        working: { count: 0, area: 0 },
        submitted: { count: 0, area: 0 },
        settled: { count: 0, area: 0 },
      };
    });

    orders.forEach(order => {
      const v = order.plot?.village;
      if (!v || !stats[v]) return;
      let targetStatus: ProgressStatus | null = null;
      (Object.keys(progressStatusMap) as ProgressStatus[]).forEach(key => {
        if (progressStatusMap[key].statuses.includes(order.status)) {
          targetStatus = key;
        }
      });
      if (targetStatus) {
        stats[v][targetStatus].count += 1;
        stats[v][targetStatus].area += order.area;
      }
    });

    return stats;
  }, [orders]);

  const filteredQueue = village === 'all'
    ? queue
    : queue.filter(q => q.village === village);

  const totalWaiting = queue.filter(q => q.status === 'waiting').length;
  const totalPriority = queue.filter(q => q.priority).length;
  const totalArea = queue.reduce((s, q) => s + q.area, 0);
  const overripeCount = queue.filter(q => q.maturity === 'overripe').length;

  const handleMoveUp = (q: QueueItem) => {
    if (q.status === 'current') return;
    moveQueueItem(q.id, 'up');
    Taro.showToast({ title: '已上移', icon: 'success' });
  };

  const handleMoveDown = (q: QueueItem) => {
    if (q.status === 'current') return;
    moveQueueItem(q.id, 'down');
    Taro.showToast({ title: '已下移', icon: 'success' });
  };

  const handleMoveTop = (q: QueueItem) => {
    moveQueueItem(q.id, 'top');
    Taro.showToast({ title: '已置顶', icon: 'success' });
  };

  const handleTogglePriority = (id: string) => {
    const item = queue.find(q => q.id === id);
    togglePriority(id);
    Taro.showToast({ title: item?.priority ? '已取消优先' : '已设为优先', icon: 'success' });
  };

  const handleJumpToOrders = (villageKey: string, status: ProgressStatus) => {
    const statusInfo = progressStatusMap[status];
    setOrderFilters({
      status: statusInfo.statuses[0],
      village: villageKey
    });
    Taro.showToast({
      title: `已筛选：${villageKey} ${statusInfo.label}`,
      icon: 'none',
      duration: 1500
    });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/orders/index' });
    }, 600);
  };

  const handleOpenMediate = (order: Order) => {
    setSelectedDispute(order);
    setResolutionType('adjust');
    setResolutionNote('');
    setModalVisible(true);
  };

  const handleConfirmMediate = () => {
    if (!selectedDispute) return;
    const resolutionTexts: Record<string, string> = {
      reject: '驳回异议，维持原作业数据',
      adjust: '调解完成，调整作业数据',
      accept: '接受异议，重新作业'
    };
    const finalResolution = resolutionNote
      ? `${resolutionTexts[resolutionType]}：${resolutionNote}`
      : resolutionTexts[resolutionType];
    const confirmed = resolutionType === 'reject' || resolutionType === 'adjust';

    handleDispute(
      selectedDispute.id,
      finalResolution,
      user?.id ?? 'coord001',
      user?.name ?? '协调员',
      confirmed
    );
    setModalVisible(false);
    setSelectedDispute(null);
    Taro.showToast({ title: '已处理', icon: 'success' });
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

        {isCoordinator && (
          <View className={styles.progressBoard}>
            <View className={styles.progressBoardHeader}>
              <View className={styles.progressBoardTitle}>
                <Text className={styles.progressBoardIcon}>📊</Text>
                <Text className={styles.progressBoardTitleText}>收割进度看板</Text>
              </View>
              <Text className={styles.progressBoardSubtitle}>按村组统计 · 点击可跳转筛选</Text>
            </View>
            <View className={styles.progressBoardBody}>
              {villages.filter(v => v.key !== 'all').map(v => {
                const vs = villageStats[v.key];
                const villageTotal = (Object.keys(vs) as ProgressStatus[])
                  .reduce((s, k) => s + vs[k].count, 0);
                return (
                  <View key={v.key} className={styles.villageRow}>
                    <View className={styles.villageRowHeader}>
                      <Text className={styles.villageName}>{v.label}</Text>
                      <Text className={styles.villageTotal}>{villageTotal}单 · {
                        (Object.keys(vs) as ProgressStatus[])
                          .reduce((s, k) => s + vs[k].area, 0).toFixed(1)
                      }亩</Text>
                    </View>
                    <View className={styles.villageStatusRow}>
                      {(Object.keys(progressStatusMap) as ProgressStatus[]).map(key => {
                        const info = progressStatusMap[key];
                        const data = vs[key];
                        return (
                          <View
                            key={key}
                            className={styles.statusCell}
                            style={{ borderLeftColor: info.color }}
                            onClick={() => data.count > 0 && handleJumpToOrders(v.key, key)}
                          >
                            <Text className={styles.statusLabel} style={{ color: info.color }}>
                              {info.label}
                            </Text>
                            <Text className={classnames(styles.statusCount, data.count > 0 && styles.clickable)}>
                              {data.count}单
                            </Text>
                            <Text className={styles.statusArea}>
                              {data.area.toFixed(1)}亩
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

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
        <View className={styles.queueTabsBar}>
          <View
            className={classnames(styles.queueTab, queueTab === 'queue' && styles.active)}
            onClick={() => setQueueTab('queue')}
          >
            <Text className={styles.queueTabIcon}>📋</Text>
            <Text className={styles.queueTabText}>排队列表</Text>
          </View>
          {isCoordinator && (
            <View
              className={classnames(styles.queueTab, queueTab === 'dispute' && styles.active)}
              onClick={() => setQueueTab('dispute')}
            >
              <Text className={styles.queueTabIcon}>⚠️</Text>
              <Text className={styles.queueTabText}>异议处理</Text>
              {disputedOrders.length > 0 && (
                <View className={styles.badge}>
                  <Text className={styles.badgeText}>{disputedOrders.length}</Text>
                </View>
              )}
            </View>
          )}
          <View
            className={styles.actionBtn}
            onClick={() => Taro.navigateTo({ url: '/pages/notice-publish/index' })}
          >
            <Text className={styles.actionBtnText}>+ 发布通知</Text>
          </View>
        </View>

        {queueTab === 'queue' && (
          <>
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
                      onClick={() => handleMoveUp(q)}
                    >
                      <Text className={styles.miniBtnText}>↑上移</Text>
                    </View>
                    <View
                      className={classnames(styles.miniBtn, styles.down)}
                      onClick={() => handleMoveDown(q)}
                    >
                      <Text className={styles.miniBtnText}>↓下移</Text>
                    </View>
                    <View
                      className={classnames(styles.miniBtn, styles.priority)}
                      onClick={() => handleMoveTop(q)}
                    >
                      <Text className={styles.miniBtnText}>置顶</Text>
                    </View>
                    <View
                      className={classnames(styles.miniBtn, styles.priority)}
                      onClick={() => handleTogglePriority(q.id)}
                    >
                      <Text className={styles.miniBtnText}>{q.priority ? '取消优先' : '设为优先'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {queueTab === 'dispute' && isCoordinator && (
          <>
            <View className={styles.queueHeader}>
              <View className={styles.queueHeaderLeft}>
                <Text className={styles.queueHeaderIcon}>⚖️</Text>
                <Text className={styles.queueHeaderTitle}>农户提起的异议需协调员处理</Text>
              </View>
              <Text className={styles.queueHeaderTip}>共 {disputedOrders.length} 条</Text>
            </View>

            {disputedOrders.length === 0 ? (
              <View className={styles.emptyDispute}>
                <Text className={styles.emptyDisputeIcon}>✅</Text>
                <Text className={styles.emptyDisputeText}>暂无待处理异议</Text>
              </View>
            ) : (
              disputedOrders.map(order => (
                <View key={order.id} className={styles.disputeItem}>
                  <View className={styles.disputeHeader}>
                    <Text className={styles.disputeFarmer}>{order.farmerName}</Text>
                    <View className={styles.disputeTag}>
                      <Text className={styles.disputeTagText}>
                        {order.dispute?.raisedBy === 'farmer' ? '农户发起' : '机手发起'}
                      </Text>
                    </View>
                  </View>
                  <View className={styles.disputeMeta}>
                    <View className={styles.disputeMetaItem}>
                      <Text className={styles.queueMetaIcon}>📍</Text>
                      <Text className={styles.queueMetaText}>
                        {order.plot?.village}{order.plot?.group}
                      </Text>
                    </View>
                    <View className={styles.disputeMetaItem}>
                      <Text className={styles.queueMetaIcon}>🌾</Text>
                      <Text className={styles.queueMetaText}>
                        {order.workRecord?.actualArea ?? order.area}亩
                        {order.workRecord && (
                          <Text className={styles.disputeAreaDiff}>
                            {' '}(标称{order.area}亩)
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                  <View className={styles.disputeContent}>
                    <Text className={styles.disputeContentLabel}>异议内容：</Text>
                    <Text className={styles.disputeContentText}>
                      {order.dispute?.content || '无详细说明'}
                    </Text>
                  </View>
                  <View className={styles.disputeFooter}>
                    <Text className={styles.disputeTime}>
                      提交于 {order.dispute?.createdAt?.slice(5, 16) || '--'}
                    </Text>
                    <View
                      className={styles.mediateBtn}
                      onClick={() => handleOpenMediate(order)}
                    >
                      <Text className={styles.mediateBtnText}>调解</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View className={styles.noticeSection}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📢</Text>
              <Text className={styles.sectionTitleText}>最新通知</Text>
            </View>
          </View>
          {notices.slice(0, 3).map(n => (
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

      {modalVisible && selectedDispute && (
        <View className={styles.modalMask} onClick={() => setModalVisible(false)}>
          <View className={styles.modalWrap} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>异议调解处理</Text>
              <Text className={styles.modalClose} onClick={() => setModalVisible(false)}>×</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.modalOrderInfo}>
                <Text className={styles.modalOrderLabel}>订单农户：</Text>
                <Text className={styles.modalOrderValue}>{selectedDispute.farmerName}</Text>
              </View>
              <View className={styles.modalOrderInfo}>
                <Text className={styles.modalOrderLabel}>异议内容：</Text>
                <Text className={styles.modalOrderValue}>
                  {selectedDispute.dispute?.content || '无'}
                </Text>
              </View>
              <View className={styles.modalSectionTitle}>
                <Text>选择处理结果</Text>
              </View>
              <View className={styles.resolutionOptions}>
                <View
                  className={classnames(styles.resolutionOption, resolutionType === 'reject' && styles.active)}
                  onClick={() => setResolutionType('reject')}
                >
                  <Text className={styles.resolutionOptionTitle}>驳回异议</Text>
                  <Text className={styles.resolutionOptionDesc}>作业数据无误，维持原判</Text>
                </View>
                <View
                  className={classnames(styles.resolutionOption, resolutionType === 'adjust' && styles.active)}
                  onClick={() => setResolutionType('adjust')}
                >
                  <Text className={styles.resolutionOptionTitle}>调解调整</Text>
                  <Text className={styles.resolutionOptionDesc}>双方各让一步，调整数据</Text>
                </View>
                <View
                  className={classnames(styles.resolutionOption, resolutionType === 'accept' && styles.active)}
                  onClick={() => setResolutionType('accept')}
                >
                  <Text className={styles.resolutionOptionTitle}>接受异议</Text>
                  <Text className={styles.resolutionOptionDesc}>安排重新作业或退款</Text>
                </View>
              </View>
              <View className={styles.modalSectionTitle}>
                <Text>备注说明（选填）</Text>
              </View>
              <View className={styles.noteInput}>
                <Text className={styles.noteInputPlaceholder}>
                  {resolutionNote || '输入调解说明，如：亩数调整为X亩...'}
                </Text>
              </View>
            </View>
            <View className={styles.modalFooter}>
              <View
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setModalVisible(false)}
              >
                <Text className={styles.modalBtnText}>取消</Text>
              </View>
              <View
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleConfirmMediate}
              >
                <Text className={styles.modalBtnText}>确认处理</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default DispatchPage;
