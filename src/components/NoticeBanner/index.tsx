import React from 'react';
import { View, Text, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Notice } from '../../types';

export interface NoticeBannerProps {
  notices: Notice[];
  onItemClick?: (notice: Notice) => void;
}

const NoticeBanner: React.FC<NoticeBannerProps> = ({ notices, onItemClick }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'road': return '🛣️';
      case 'drying': return '☀️';
      default: return '📢';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'urgent': return '紧急';
      case 'road': return '道路';
      case 'drying': return '晾晒';
      default: return '通知';
    }
  };

  const handleClick = (notice: Notice) => {
    if (onItemClick) {
      onItemClick(notice);
    } else {
      Taro.showModal({
        title: notice.title,
        content: notice.content,
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#F59E0B'
      });
    }
  };

  if (notices.length === 0) return null;

  return (
    <View className={styles.banner}>
      <View className={styles.iconBox}>
        <Text className={styles.scrollIcon}>📢</Text>
      </View>
      <Swiper
        className={styles.swiper}
        vertical
        autoplay
        interval={4000}
        circular
        displayMultipleItems={1}
      >
        {notices.map((notice) => (
          <SwiperItem key={notice.id}>
            <View
              className={classnames(styles.item, notice.urgent && styles.urgent)}
              onClick={() => handleClick(notice)}
            >
              {notice.urgent && (
                <View className={classnames(styles.tag, styles.tagUrgent)}>
                  <Text className={styles.tagText}>{getTypeIcon(notice.type)}{getTypeLabel(notice.type)}</Text>
                </View>
              )}
              <Text className={styles.title}>{notice.title}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </SwiperItem>
        ))}
      </Swiper>
    </View>
  );
};

export default NoticeBanner;
