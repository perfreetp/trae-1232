import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Plot } from '../../types';

export interface PlotCardProps {
  plot: Plot;
  onClick?: () => void;
}

const maturityConfig = {
  immature: { label: '未成熟', color: 'immature' },
  nearly: { label: '即将成熟', color: 'nearly' },
  mature: { label: '已成熟', color: 'mature' },
  overripe: { label: '过熟', color: 'overripe' }
};

const PlotCard: React.FC<PlotCardProps> = ({ plot, onClick }) => {
  const maturity = maturityConfig[plot.maturity];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/plot-detail/index?id=${plot.id}` });
    }
  };

  return (
    <View className={styles.plotCard} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.left}>
          <Text className={styles.address}>{plot.address}</Text>
          {plot.priority && (
            <View className={classnames(styles.tag, styles.tagPriority)}>
              <Text className={styles.tagText}>⚠️ 优先</Text>
            </View>
          )}
        </View>
        <View className={classnames(styles.maturityTag, styles[maturity.color])}>
          <Text className={styles.maturityText}>{maturity.label}</Text>
        </View>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>面积</Text>
          <Text className={styles.infoValue}>
            <Text className={styles.bigNum}>{plot.area}</Text>
            <Text className={styles.unit}> 亩</Text>
          </Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>位置</Text>
          <Text className={styles.infoValueSmall}>{plot.village} {plot.group}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>联系人</Text>
          <Text className={styles.infoValueSmall}>{plot.contactName}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>可进地</Text>
          <Text className={styles.infoValueSmall}>{plot.availableTime.slice(5, 16)}</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.statusRow}>
          {plot.hasDemand ? (
            <>
              <View className={classnames(styles.statusBadge, styles.statusQueued)}>
                <Text className={styles.statusBadgeText}>已排队</Text>
              </View>
              {plot.queuePosition && (
                <Text className={styles.queueInfo}>
                  当前第 <Text className={styles.queueNum}>{plot.queuePosition}</Text> / 共 {plot.queueTotal} 位
                </Text>
              )}
            </>
          ) : (
            <View className={classnames(styles.statusBadge, styles.statusIdle)}>
              <Text className={styles.statusBadgeText}>待发起</Text>
            </View>
          )}
        </View>

        {plot.hasDemand ? (
          <View className={styles.actionBtn}>
            <Text className={styles.actionText}>查看详情</Text>
          </View>
        ) : (
          <View className={classnames(styles.actionBtn, styles.primaryBtn)}>
            <Text className={styles.actionTextPrimary}>发起抢收</Text>
          </View>
        )}
      </View>

      {plot.note && (
        <View className={styles.noteBar}>
          <Text className={styles.noteIcon}>📝</Text>
          <Text className={styles.noteText}>{plot.note}</Text>
        </View>
      )}
    </View>
  );
};

export default PlotCard;
