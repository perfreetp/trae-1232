import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

export interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title = '暂无数据',
  description,
  actionText,
  onAction
}) => {
  return (
    <View className={styles.emptyWrap}>
      <View className={styles.emptyIcon}>
        <Text className={styles.iconEmoji}>{icon}</Text>
      </View>
      <Text className={styles.emptyTitle}>{title}</Text>
      {description && (
        <Text className={styles.emptyDesc}>{description}</Text>
      )}
      {actionText && onAction && (
        <View className={styles.actionBtn} onClick={onAction}>
          <Text className={styles.actionText}>{actionText}</Text>
        </View>
      )}
    </View>
  );
};

export default EmptyState;
