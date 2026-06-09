import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  color = 'primary',
  trend,
  onClick
}) => {
  return (
    <View
      className={classnames(styles.statCard, styles[`color-${color}`])}
      onClick={onClick}
    >
      <View className={styles.cardHeader}>
        {icon && <Text className={styles.icon}>{icon}</Text>}
        <Text className={styles.label}>{label}</Text>
      </View>
      <View className={styles.cardBody}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {trend && <Text className={styles.trend}>{trend}</Text>}
    </View>
  );
};

export default StatCard;
