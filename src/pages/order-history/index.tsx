import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockOrders } from '../../data/mockOrders';
import { useUserStore } from '../../store/userStore';

const years = ['2025', '2024', '2023', '2022'];

const OrderHistoryPage: React.FC = () => {
  const { currentRole, user } = useUserStore();
  const [year, setYear] = useState('2025');
  const [keyword, setKeyword] = useState('');

  const settled = mockOrders.filter(o => o.status === 'settled');
  const orders = keyword
    ? settled.filter(o => o.plotAddress.includes(keyword) || o.farmerName.includes(keyword))
    : settled;

  const totalArea = orders.reduce((s, o) => s + o.area, 0);
  const totalAmount = orders.reduce((s, o) => s + o.totalAmount, 0);

  const handleCall = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone }).catch(() => {});
  };

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.header}>
        <View className={styles.searchRow}>
          <View className={styles.searchBar}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder="搜索地块、农户姓名..."
              value={keyword}
              onInput={(e: any) => setKeyword(e.detail.value)}
            />
          </View>
          <View className={styles.calBtn}>📅</View>
        </View>
        <ScrollView className={styles.yearTabs} scrollX style={{ display: 'flex', gap: 16, overflow: 'auto' }}>
          {years.map(y => (
            <View
              key={y}
              className={classnames(styles.yearTab, year === y && styles.active)}
              onClick={() => setYear(y)}
            >
              <Text className={styles.yearText}>{y}年麦收</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.content}>
        <View className={styles.summary}>
          <View className={styles.sumCell}>
            <Text className={styles.sumNum}>{orders.length}</Text>
            <Text className={styles.sumLabel}>订单数</Text>
          </View>
          <View className={styles.sumCell}>
            <Text className={styles.sumNum}>{totalArea.toFixed(1)}</Text>
            <Text className={styles.sumLabel}>总面积(亩)</Text>
          </View>
          <View className={styles.sumCell}>
            <Text className={styles.sumNum}>¥{totalAmount}</Text>
            <Text className={styles.sumLabel}>总金额</Text>
          </View>
          <View className={styles.sumCell}>
            <Text className={styles.sumNum}>4.9</Text>
            <Text className={styles.sumLabel}>平均分</Text>
          </View>
        </View>

        {orders.map(o => (
          <View
            key={o.id}
            className={styles.orderItem}
            onClick={() => Taro.navigateTo({ url: `/pages/order-detail/index?id=${o.id}` })}
          >
            <View className={styles.orderTop}>
              <Text className={styles.orderNo}>NO.{o.orderNo} · {o.settledAt?.slice(0, 10)}</Text>
              <Text className={styles.statusTag}>
                {o.status === 'settled' ? '✅ 已完成' : '已取消'}
              </Text>
            </View>
            <View className={styles.orderMid}>
              <View className={styles.plotInfo}>
                <Text className={styles.plotAddr}>📍 {o.plotAddress}</Text>
                <Text className={styles.plotDetail}>🌾 {o.area} 亩 · ¥{o.unitPrice}/亩 · {o.machineName}</Text>
              </View>
              <View className={styles.priceCol}>
                <Text className={styles.price}>¥{o.totalAmount}</Text>
              </View>
            </View>
            <View className={styles.orderBottom}>
              <View className={styles.peerInfo}>
                <View className={styles.peerAvatar}>{currentRole === 'farmer' ? '🚜' : '🧑'}</View>
                <Text className={styles.peerName}>
                  {currentRole === 'farmer'
                    ? `机手 ${o.operatorName} · ${o.operatorPhone}`
                    : `农户 ${o.farmerName} · ${o.farmerPhone}`}
                </Text>
              </View>
              <View className={styles.actionBtns}>
                <View
                  className={styles.ghostBtn}
                  onClick={(e) => { e.stopPropagation(); handleCall(currentRole === 'farmer' ? o.operatorPhone : o.farmerPhone); }}
                >
                  <Text className={styles.ghostBtnText}>📞 联系</Text>
                </View>
                <View
                  className={styles.primaryBtn}
                  onClick={(e) => { e.stopPropagation(); Taro.switchTab({ url: '/pages/plots/index' }); }}
                >
                  <Text className={styles.primaryBtnText}>🌾 再来一单</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default OrderHistoryPage;
