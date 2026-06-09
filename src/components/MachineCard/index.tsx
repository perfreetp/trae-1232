import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Machine } from '../../types';

export interface MachineCardProps {
  machine: Machine;
  onClick?: () => void;
  showActions?: boolean;
}

const statusConfig = {
  idle: { label: '空闲', color: 'idle' },
  working: { label: '作业中', color: 'working' },
  maintenance: { label: '维修中', color: 'maintenance' }
};

const MachineCard: React.FC<MachineCardProps> = ({ machine, onClick, showActions = true }) => {
  const status = statusConfig[machine.status];

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    Taro.showToast({ title: '联系机手功能', icon: 'none' });
  };

  return (
    <View className={styles.machineCard} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.machineIcon}>🚜</Text>
          <View>
            <Text className={styles.machineName}>{machine.name}</Text>
            <Text className={styles.machineModel}>{machine.model} · {machine.year}年</Text>
          </View>
        </View>
        <View className={classnames(styles.statusTag, styles[status.color])}>
          <Text className={styles.statusText}>{status.label}</Text>
        </View>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>机手</Text>
          <Text className={styles.infoValue}>{machine.operatorName}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>报价</Text>
          <Text className={classnames(styles.infoValue, styles.priceValue)}>¥{machine.pricePerMu}/亩</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>日产能</Text>
          <Text className={styles.infoValue}>{machine.dailyCapacity}亩</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>服务半径</Text>
          <Text className={styles.infoValue}>{machine.serviceRadius}km</Text>
        </View>
      </View>

      <View className={styles.locationRow}>
        <Text className={styles.locIcon}>📍</Text>
        <Text className={styles.locText}>{machine.locationDesc}</Text>
      </View>

      {showActions && (
        <View className={styles.footer}>
          <Text className={styles.plateNo}>车牌 {machine.plateNumber}</Text>
          <View className={styles.actions}>
            <View className={classnames(styles.btn, styles.btnOutline)} onClick={handleCall}>
              <Text className={styles.btnTextOutline}>📞 联系</Text>
            </View>
            {machine.status === 'idle' && (
              <View className={classnames(styles.btn, styles.btnPrimary)}>
                <Text className={styles.btnText}>派单</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default MachineCard;
