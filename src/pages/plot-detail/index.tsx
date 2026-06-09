import React, { useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store/appStore';
import { MaturityLevel } from '../../types';

const maturityLabel: Record<MaturityLevel, string> = {
  immature: '未熟', nearly: '将熟', mature: '成熟', overripe: '过熟'
};

const maturityClass: Record<MaturityLevel, string> = {
  immature: 'maturity-immature', nearly: 'maturity-nearly',
  mature: 'maturity-mature', overripe: 'maturity-overripe'
};

const PlotDetailPage: React.FC = () => {
  const router = useRouter();
  const plots = useAppStore(s => s.plots);
  const queue = useAppStore(s => s.queue);
  const orders = useAppStore(s => s.orders);
  const refreshQueueRank = useAppStore(s => s.refreshQueueRank);

  useEffect(() => {
    refreshQueueRank();
  }, [refreshQueueRank]);

  const plot = plots.find(p => p.id === router.params.id) || plots[0];
  const queueItem = plot?.demandId ? queue.find(q => q.demandId === plot.demandId) : undefined;
  const queueIdx = queueItem ? queue.findIndex(q => q.id === queueItem.id) : -1;
  const totalQueue = queue.length;
  const progress = queueIdx >= 0 ? ((queueIdx + 1) / totalQueue * 100) : 0;
  const boundOrder = plot?.demandId ? orders.find(o => o.demandId === plot.demandId) : undefined;

  const handleCall = () => {
    Taro.makePhoneCall({ phoneNumber: plot.contactPhone }).catch(() => {});
  };

  const handleNavi = () => {
    Taro.showToast({ title: '导航功能开发中', icon: 'none' });
  };

  const handleDemand = () => {
    Taro.navigateTo({ url: '/pages/demand-publish/index?plotId=' + plot.id });
  };

  const handleOrder = () => {
    if (boundOrder) {
      Taro.navigateTo({ url: '/pages/order-detail/index?id=' + boundOrder.id });
    } else {
      Taro.switchTab({ url: '/pages/orders/index' });
    }
  };

  if (!plot) {
    return (
      <View className={styles.pageWrap}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.hero}>
        <View className={styles.heroPattern} />
        <Text className={styles.heroTitle}>📍 {plot.address}</Text>
        <View className={styles.heroTags}>
          <View className={classnames(styles.heroTag, styles[maturityClass[plot.maturity]])}>
            <Text className={styles.heroTagText}>🌾 {maturityLabel[plot.maturity]}</Text>
          </View>
          {plot.priority && (
            <View className={styles.heroTag} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
              <Text className={styles.heroTagText}>⭐ 优先户</Text>
            </View>
          )}
          <View className={styles.heroTag}>
            <Text className={styles.heroTagText}>🏘️ {plot.village}{plot.group}</Text>
          </View>
        </View>
        <View className={styles.heroStats}>
          <View className={styles.heroStatItem}>
            <Text className={styles.heroStatNum}>
              {plot.area}<Text className={styles.heroStatUnit}>亩</Text>
            </Text>
            <Text className={styles.heroStatLabel}>地块面积</Text>
          </View>
          <View className={styles.heroStatItem}>
            <Text className={styles.heroStatNum}>
              {Math.round(plot.area * 550)}<Text className={styles.heroStatUnit}>斤</Text>
            </Text>
            <Text className={styles.heroStatLabel}>预估总产量</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {queueItem && (
          <View className={classnames(styles.card, styles.queueCard)}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardHeaderIcon}>🎯</Text>
              <Text className={styles.cardHeaderTitle}>排队信息</Text>
            </View>
            <View className={styles.queueRankRow}>
              <View className={styles.queueRankBadge}>
                <Text className={styles.queueRankNo}>{plot.queuePosition ?? queueIdx + 1}</Text>
                <Text className={styles.queueRankLabel}>当前名次</Text>
              </View>
              <View className={styles.queueInfo}>
                <View className={styles.queueInfoRow}>
                  <Text className={styles.queueInfoLabel}>总排队数</Text>
                  <Text className={styles.queueInfoValue}>{plot.queueTotal ?? totalQueue} 户</Text>
                </View>
                <View className={styles.queueInfoRow}>
                  <Text className={styles.queueInfoLabel}>预计作业时间</Text>
                  <Text className={styles.queueInfoValue}>{queueItem.estimatedTime}</Text>
                </View>
                <View className={styles.queueInfoRow}>
                  <Text className={styles.queueInfoLabel}>所在村组</Text>
                  <Text className={styles.queueInfoValue}>{queueItem.village} {queueItem.group}</Text>
                </View>
                <View className={styles.queueInfoRow}>
                  <Text className={styles.queueInfoLabel}>订单编号</Text>
                  <Text className={styles.queueInfoValue} style={{ color: '#007aff' }}>{boundOrder?.id.toUpperCase() || '待生成'}</Text>
                </View>
              </View>
            </View>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${Math.min(98, progress + 5)}%` }} />
            </View>
            <View className={styles.progressTip}>
              <Text className={styles.progressTipText}>进度 {queueIdx + 1}/{totalQueue}</Text>
              <Text className={styles.progressTipText}>距离作业还有 {Math.max(0, queueIdx)} 户</Text>
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🌾</Text>
            <Text className={styles.cardHeaderTitle}>地块信息</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>地块编号</Text>
            <Text className={styles.infoValue}>{plot.id.toUpperCase()}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>详细地址</Text>
            <Text className={styles.infoValue}>{plot.address}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>地块面积</Text>
            <Text className={styles.infoValue}>{plot.area} 亩（约 {plot.area * 667} m²）</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>成熟度</Text>
            <Text className={styles.infoValue}>
              {maturityLabel[plot.maturity]}
              <Text className={classnames(maturityClass[plot.maturity])} style={{ marginLeft: 8 }}>●</Text>
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>小麦品种</Text>
            <Text className={styles.infoValue}>济麦22号（黄淮主栽）</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>预估亩产</Text>
            <Text className={styles.infoValue}>约 550 斤/亩（正常年景）</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>可进地时间</Text>
            <Text className={styles.infoValue}>{plot.availableTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>进地条件</Text>
            <Text className={styles.infoValue}>{plot.note ? plot.note : '柏油路直达，机械通行无障碍'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>地理坐标</Text>
            <Text className={styles.infoValue}>N {plot.location.lat.toFixed(4)}, E {plot.location.lng.toFixed(4)}</Text>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>👤</Text>
            <Text className={styles.cardHeaderTitle}>联系人信息</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>联系人</Text>
            <Text className={styles.infoValue}>{plot.contactName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>联系电话</Text>
            <Text className={styles.infoValue}>{plot.contactPhone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>所在村组</Text>
            <Text className={styles.infoValue}>{plot.village}村委会 {plot.group}</Text>
          </View>
          {plot.note && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注说明</Text>
              <Text className={styles.infoValue}>{plot.note}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.outline)} onClick={handleCall}>
          <Text className={styles.btnText}>📞 联系</Text>
        </View>
        <View className={classnames(styles.btn, styles.outline)} onClick={handleNavi}>
          <Text className={styles.btnText}>🧭 导航</Text>
        </View>
        {!plot.hasDemand ? (
          <View className={classnames(styles.btn, styles.primary)} onClick={handleDemand}>
            <Text className={styles.btnText}>🌾 发起抢收</Text>
          </View>
        ) : (
          <View className={classnames(styles.btn, styles.secondary)} onClick={handleOrder}>
            <Text className={styles.btnText}>📦 查看订单</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PlotDetailPage;
