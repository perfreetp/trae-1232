import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Order } from '../../types';

export interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  showActions?: boolean;
}

const statusConfig = {
  pending: { label: '待接单', color: 'pending' },
  accepted: { label: '已接单', color: 'accepted' },
  working: { label: '作业中', color: 'working' },
  submitted: { label: '待确认', color: 'submitted' },
  confirmed: { label: '已确认', color: 'confirmed' },
  settled: { label: '已结算', color: 'settled' }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, showActions = true }) => {
  const status = statusConfig[order.status];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
    }
  };

  const handleCall = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    Taro.makePhoneCall({ phoneNumber: phone.replace(/\*/g, '0') });
  };

  return (
    <View className={styles.orderCard} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.orderNo}>
          <Text className={styles.orderNoLabel}>订单号</Text>
          <Text className={styles.orderNoValue}>{order.id.toUpperCase()}</Text>
        </View>
        <View className={classnames(styles.statusTag, styles[status.color])}>
          <Text className={styles.statusText}>{status.label}</Text>
        </View>
      </View>

      <View className={styles.plotInfo}>
        <Text className={styles.plotIcon}>🌾</Text>
        <View className={styles.plotDetail}>
          <Text className={styles.plotAddr}>{order.plot.address}</Text>
          <Text className={styles.plotMeta}>
            {order.plot.village}{order.plot.group} · {order.area}亩
          </Text>
        </View>
        {order.demand.priority && (
          <View className={styles.priorityBadge}>
            <Text className={styles.priorityText}>优先</Text>
          </View>
        )}
      </View>

      <View className={styles.peopleRow}>
        <View className={styles.peopleItem}>
          <Text className={styles.peopleLabel}>农户</Text>
          <Text className={styles.peopleName}>{order.farmerName}</Text>
          <Text
            className={styles.callBtn}
            onClick={(e) => handleCall(e, order.farmerPhone)}
          >📞</Text>
        </View>
        <View className={styles.peopleItem}>
          <Text className={styles.peopleLabel}>机手</Text>
          <Text className={styles.peopleName}>{order.operatorName}</Text>
          <Text
            className={styles.callBtn}
            onClick={(e) => handleCall(e, order.operatorPhone)}
          >📞</Text>
        </View>
      </View>

      <View className={styles.timeRow}>
        <Text className={styles.timeIcon}>🕐</Text>
        <Text className={styles.timeLabel}>约定时间</Text>
        <Text className={styles.timeValue}>{order.scheduledTime}</Text>
      </View>

      <View className={styles.footer}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>¥</Text>
          <Text className={styles.priceValue}>{order.totalAmount}</Text>
          <Text className={styles.priceUnit}>({order.quotedPrice}元/亩)</Text>
        </View>
        {showActions && (
          <View className={styles.actions}>
            {order.status === 'pending' && (
              <>
                <View className={classnames(styles.btn, styles.btnOutline)}>
                  <Text className={styles.btnTextOutline}>转派</Text>
                </View>
                <View className={classnames(styles.btn, styles.btnPrimary)}>
                  <Text className={styles.btnText}>接单</Text>
                </View>
              </>
            )}
            {order.status === 'accepted' && (
              <View className={classnames(styles.btn, styles.btnPrimary)}>
                <Text className={styles.btnText}>开始作业</Text>
              </View>
            )}
            {order.status === 'working' && (
              <View className={classnames(styles.btn, styles.btnSuccess)}>
                <Text className={styles.btnText}>提交作业</Text>
              </View>
            )}
            {order.status === 'confirmed' && !order.evaluation && (
              <View className={classnames(styles.btn, styles.btnPrimary)}>
                <Text className={styles.btnText}>去评价</Text>
              </View>
            )}
            {order.status === 'settled' && (
              <View className={classnames(styles.btn, styles.btnOutline)}>
                <Text className={styles.btnTextOutline}>查看评价</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {order.workRecord?.debtAmount && order.workRecord.debtAmount > 0 && (
        <View className={styles.debtBar}>
          <Text className={styles.debtIcon}>💰</Text>
          <Text className={styles.debtText}>
            欠款 ¥{order.workRecord.debtAmount} - {order.workRecord.debtNote}
          </Text>
        </View>
      )}
    </View>
  );
};

export default OrderCard;
