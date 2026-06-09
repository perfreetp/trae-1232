import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useUserStore } from '../../store/userStore';
import { mockOrders } from '../../data/mockOrders';
import RoleSwitcher from '../../components/RoleSwitcher';

const MinePage: React.FC = () => {
  const { user, currentRole } = useUserStore();

  const myOrders = mockOrders.filter(o => {
    if (currentRole === 'farmer') return o.farmerId === user?.id;
    if (currentRole === 'operator') return o.operatorId === 'op001';
    return true;
  });
  const totalAmount = myOrders.filter(o => o.status === 'settled').reduce((s, o) => s + o.totalAmount, 0);

  const menuGroups = [
    {
      icon: '📋', title: '业务管理',
      items: currentRole === 'farmer' ? [
        { icon: '🌾', iconClass: '', title: '我的地块', desc: '管理地块信息', url: '/pages/plots/index', switchTab: true },
        { icon: '📦', iconClass: 'purple', title: '抢收订单', desc: `${myOrders.length} 个订单`, url: '/pages/orders/index', switchTab: true, badge: myOrders.filter(o => o.status === 'submitted' || o.status === 'working').length },
        { icon: '📜', iconClass: 'blue', title: '历史订单', desc: '查看过往记录', url: '/pages/order-history/index' },
      ] : currentRole === 'operator' ? [
        { icon: '🚜', iconClass: 'green', title: '收割机管理', desc: '维护车辆信息', url: '/pages/machine-manage/index' },
        { icon: '📦', iconClass: 'purple', title: '我的派单', desc: `${myOrders.length} 个订单`, url: '/pages/orders/index', switchTab: true, badge: myOrders.filter(o => o.status === 'pending').length },
        { icon: '📜', iconClass: 'blue', title: '作业历史', desc: '历史作业记录', url: '/pages/order-history/index' },
      ] : [
        { icon: '🎯', iconClass: '', title: '排队调度', desc: '调整作业顺序', url: '/pages/dispatch/index', switchTab: true },
        { icon: '📢', iconClass: 'red', title: '发布通知', desc: '道路/晾晒/紧急', url: '/pages/notice-publish/index' },
        { icon: '📜', iconClass: 'blue', title: '调度历史', desc: '查看操作记录', url: '/pages/order-history/index' },
      ]
    },
    {
      icon: '⚙️', title: '其他',
      items: [
        { icon: '🌤️', iconClass: 'blue', title: '天气详情', desc: '农事气象预报', url: '/pages/weather-detail/index' },
        { icon: '⚙️', iconClass: 'gray', title: '设置', desc: '消息通知等', url: '' },
        { icon: '📞', iconClass: 'green', title: '联系客服', desc: '400-888-6666', url: '' },
      ]
    }
  ];

  const onRefresh = () => {
    console.log('[Mine] 刷新');
    setTimeout(() => Taro.stopPullDownRefresh(), 600);
  };

  const handleItemClick = (item: any) => {
    if (!item.url) {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    if (item.switchTab) {
      Taro.switchTab({ url: item.url });
    } else {
      Taro.navigateTo({ url: item.url });
    }
  };

  return (
    <ScrollView
      className={styles.pageWrap}
      scrollY
      refresherEnabled
      onRefresherRefresh={onRefresh}
    >
      <View className={styles.header}>
        <View className={styles.pattern} />
        <View className={styles.pattern2} />
        <View className={styles.userCard}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>🧑‍🌾</Text>
          </View>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{user?.name}</Text>
            <Text className={styles.userPhone}>📱 {user?.phone}</Text>
            <View className={styles.roleSwitchWrap}>
              <RoleSwitcher compact />
            </View>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statsCell}>
            <Text className={styles.statsNum}>{myOrders.length}</Text>
            <Text className={styles.statsLabel}>
              {currentRole === 'farmer' ? '发起单' : currentRole === 'operator' ? '作业单' : '调度单'}
            </Text>
          </View>
          <View className={styles.statsCell}>
            <Text className={styles.statsNum}>{myOrders.filter(o => o.status === 'settled').length}</Text>
            <Text className={styles.statsLabel}>已完成</Text>
          </View>
          <View className={styles.statsCell}>
            <Text className={styles.statsNum}>¥{totalAmount}</Text>
            <Text className={styles.statsLabel}>
              {currentRole === 'farmer' ? '已付款' : '已收入'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {menuGroups.map(group => (
          <View key={group.title} className={styles.section}>
            <View className={styles.sectionHeader}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>{group.icon}</Text>
                <Text className={styles.sectionText}>{group.title}</Text>
              </View>
            </View>
            {group.items.map((item, i) => (
              <View key={i} className={styles.listItem} onClick={() => handleItemClick(item)}>
                <View className={classnames(styles.itemIcon, styles[item.iconClass])}>
                  <Text className={styles.itemIconText}>{item.icon}</Text>
                </View>
                <View className={styles.itemBody}>
                  <Text className={styles.itemTitle}>{item.title}</Text>
                  <Text className={styles.itemDesc}>{item.desc}</Text>
                </View>
                {item.badge ? (
                  <View className={styles.itemBadge}>
                    <Text className={styles.itemBadgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Text className={styles.itemArrow}>›</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MinePage;
