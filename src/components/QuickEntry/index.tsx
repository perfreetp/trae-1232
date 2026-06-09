import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

export interface QuickEntryItem {
  key: string;
  icon: string;
  label: string;
  path?: string;
  color?: 'primary' | 'green' | 'blue' | 'red' | 'purple' | 'orange';
  badge?: number | string;
  onClick?: () => void;
}

export interface QuickEntryProps {
  items: QuickEntryItem[];
  columns?: number;
}

const QuickEntry: React.FC<QuickEntryProps> = ({ items, columns = 4 }) => {
  const handleClick = (item: QuickEntryItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      Taro.navigateTo({ url: item.path });
    }
  };

  return (
    <View className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map((item) => (
        <View
          key={item.key}
          className={classnames(styles.item, styles[`bg-${item.color || 'primary'}`])}
          onClick={() => handleClick(item)}
        >
          <View className={styles.iconWrap}>
            <Text className={styles.icon}>{item.icon}</Text>
            {item.badge !== undefined && item.badge !== null && (
              <View className={styles.badge}>
                <Text className={styles.badgeText}>
                  {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                </Text>
              </View>
            )}
          </View>
          <Text className={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default QuickEntry;
