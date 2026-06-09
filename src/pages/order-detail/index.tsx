import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockOrders } from '../../data/mockOrders';
import { OrderStatus } from '../../types';
import { useUserStore } from '../../store/userStore';

const statusConfig: Record<OrderStatus, { title: string; desc: string }> = {
  pending: { title: '⏳ 等待机手接单', desc: '村级协调员正在调度，请耐心等候匹配' },
  accepted: { title: '✅ 机手已接单', desc: '机手正在前往您的地块，请保持电话畅通' },
  working: { title: '🚜 作业进行中', desc: '收割机正在为您作业，可电话联系现场进度' },
  submitted: { title: '📸 作业已提交确认', desc: '机手已上传作业记录，请您及时核实确认' },
  confirmed: { title: '✍️ 请进行结算评价', desc: '双方已确认亩数，请完成付款和服务评价' },
  settled: { title: '🎉 订单已完成', desc: '订单已结算完毕，感谢您的信任与支持' },
};

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentRole } = useUserStore();
  const order = mockOrders.find(o => o.id === router.params.id) || mockOrders[0];
  const sc = statusConfig[order.status];

  const timeline = [
    { title: '抢收需求已发起', time: order.createdAt, active: true },
    { title: '村级协调员受理', time: order.createdAt, active: order.status !== 'pending' },
    { title: '机手已接单', time: order.acceptedAt || '', active: ['accepted', 'working', 'submitted', 'confirmed', 'settled'].includes(order.status) },
    { title: '开始作业', time: order.workStartedAt || '', active: ['working', 'submitted', 'confirmed', 'settled'].includes(order.status) },
    { title: '作业完成提交', time: order.workCompletedAt || '', active: ['submitted', 'confirmed', 'settled'].includes(order.status) },
    { title: '农户确认亩数', time: order.workCompletedAt || '', active: ['confirmed', 'settled'].includes(order.status) },
    { title: '结算完成', time: order.settledAt || '', active: order.status === 'settled' },
  ].filter(t => t.time);

  const handleCall = (phone: string) => {
    console.log('[OrderDetail] 拨打:', phone);
    Taro.makePhoneCall({ phoneNumber: phone }).catch(() => {});
  };

  const handleAction = (type: string) => {
    console.log('[OrderDetail] 操作:', type);
    const actions: Record<string, { url?: string; toast?: string }> = {
      accept: { toast: '✅ 已接单，请立即联系农户' },
      transfer: { toast: '📨 转派申请已提交' },
      startWork: { url: `/pages/work-submit/index?id=${order.id}` },
      submitWork: { url: `/pages/work-submit/index?id=${order.id}` },
      confirmWork: { toast: '✅ 已确认作业结果' },
      settle: { url: `/pages/settlement/index?id=${order.id}` },
    };
    const a = actions[type];
    if (a?.url) Taro.navigateTo({ url: a.url });
    else if (a?.toast) Taro.showToast({ title: a.toast, icon: 'success' });
  };

  const farmerBtns = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return [
          { text: '📞 联系协调员', type: 'outline', onClick: () => handleCall('13800000000') },
          { text: '取消需求', type: 'ghost', onClick: () => Taro.showToast({ title: '已申请取消', icon: 'none' }) },
        ];
      case 'accepted':
        return [
          { text: '📞 联系机手', type: 'outline', onClick: () => handleCall(order.operatorPhone) },
          { text: '💰 预付订金', type: 'primary', onClick: () => handleAction('settle') },
        ];
      case 'submitted':
        return [
          { text: '❌ 有异议', type: 'outline', onClick: () => Taro.showToast({ title: '已通知协调员', icon: 'none' }) },
          { text: '✅ 确认作业', type: 'primary', onClick: () => handleAction('confirmWork') },
        ];
      case 'confirmed':
        return [
          { text: '去评价', type: 'primary', onClick: () => handleAction('settle') },
        ];
      case 'settled':
        return [
          { text: '再次抢收', type: 'primary', onClick: () => Taro.switchTab({ url: '/pages/plots/index' }) },
        ];
      default:
        return [
          { text: '📞 联系机手', type: 'outline', onClick: () => handleCall(order.operatorPhone) },
          { text: '联系客服', type: 'ghost', onClick: () => Taro.showToast({ title: '客服开发中', icon: 'none' }) },
        ];
    }
  };

  const operatorBtns = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return [
          { text: '📨 转派他人', type: 'outline', onClick: () => handleAction('transfer') },
          { text: '🚜 立即接单', type: 'primary', onClick: () => handleAction('accept') },
        ];
      case 'accepted':
        return [
          { text: '📞 联系农户', type: 'outline', onClick: () => handleCall(order.farmerPhone) },
          { text: '🧭 导航前往', type: 'secondary', onClick: () => Taro.showToast({ title: '导航开发中', icon: 'none' }) },
          { text: '开始作业', type: 'primary', onClick: () => handleAction('startWork') },
        ];
      case 'working':
        return [
          { text: '📞 联系农户', type: 'outline', onClick: () => handleCall(order.farmerPhone) },
          { text: '完成作业', type: 'primary', onClick: () => handleAction('submitWork') },
        ];
      default:
        return [
          { text: '📞 联系农户', type: 'outline', onClick: () => handleCall(order.farmerPhone) },
          { text: '查看评价', type: 'primary', onClick: () => handleAction('settle') },
        ];
    }
  };

  const btns = currentRole === 'operator' ? operatorBtns(order.status) : farmerBtns(order.status);

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.statusBar}>
        <Text className={styles.statusTitle}>{sc.title}</Text>
        <Text className={styles.statusDesc}>{sc.desc}</Text>
      </View>

      <View className={styles.timelineWrap}>
        {timeline.map((t, i) => (
          <View key={i} className={classnames(styles.timelineItem, t.active && styles.active)}>
            <View className={styles.dotLine}>
              <View className={styles.dot} />
              {i < timeline.length - 1 && <View className={styles.line} />}
            </View>
            <View className={styles.timeBody}>
              <Text className={styles.timeTitle}>{t.title}</Text>
              <Text className={styles.timeValue}>{t.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🌾</Text>
            <Text className={styles.cardHeaderTitle}>地块信息</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>订单号</Text>
            <Text className={styles.infoValue}>{order.orderNo}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>详细地址</Text>
            <Text className={styles.infoValue}>{order.plotAddress}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>种植面积</Text>
            <Text className={styles.infoValue}>{order.area} 亩</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>可进地</Text>
            <Text className={styles.infoValue}>{order.availableTime}</Text>
          </View>
          {order.remark && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.infoValue}>{order.remark}</Text>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>👨‍🌾</Text>
            <Text className={styles.cardHeaderTitle}>双方信息</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>农户</Text>
            <View className={styles.infoValue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>{order.farmerName} · {order.farmerPhone}</Text>
              <Text onClick={() => handleCall(order.farmerPhone)} style={{ color: '#F59E0B' }}>📞</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>机手</Text>
            <View className={styles.infoValue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>{order.operatorName} · {order.operatorPhone}</Text>
              <Text onClick={() => handleCall(order.operatorPhone)} style={{ color: '#F59E0B' }}>📞</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>收割机</Text>
            <Text className={styles.infoValue}>{order.machineName}</Text>
          </View>
        </View>

        {order.workRecord && (
          <View className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardHeaderIcon}>📸</Text>
              <Text className={styles.cardHeaderTitle}>作业记录</Text>
              {order.status === 'settled' && <Text className={styles.cardHeaderAction}>已确认</Text>}
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>确认亩数</Text>
              <Text className={styles.infoValue}>{order.workRecord.confirmedArea} 亩{order.workRecord.confirmedArea !== order.area && <Text style={{ color: '#F59E0B', marginLeft: 8 }}>（原 {order.area} 亩）</Text>}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>作业用时</Text>
              <Text className={styles.infoValue}>{order.workRecord.workHours} 小时</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>油费备注</Text>
              <Text className={styles.infoValue}>¥{order.workRecord.fuelCost}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>补充说明</Text>
              <Text className={styles.infoValue}>{order.workRecord.notes || '作业顺利完成'}</Text>
            </View>
            {order.workRecord.photos?.length ? (
              <>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>作业照片</Text>
                </View>
                <View className={styles.photoGrid}>
                  {order.workRecord.photos.map((p, i) => (
                    <View key={i} className={styles.photoItem}>🌾</View>
                  ))}
                </View>
              </>
            ) : null}
            {order.workRecord.debtAmount ? (
              <View className={styles.debtRow}>
                <Text className={styles.debtLabel}>⚠️ 待补欠款</Text>
                <Text className={styles.debtValue}>¥{order.workRecord.debtAmount}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>💰</Text>
            <Text className={styles.cardHeaderTitle}>费用明细</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>作业单价</Text>
            <Text className={styles.priceValue}>¥{order.unitPrice} / 亩</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>作业亩数</Text>
            <Text className={styles.priceValue}>× {order.workRecord?.confirmedArea || order.area} 亩</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>基础作业费</Text>
            <Text className={styles.priceValue}>¥{((order.workRecord?.confirmedArea || order.area) * order.unitPrice).toFixed(0)}</Text>
          </View>
          {order.otherFees?.map((f, i) => (
            <View key={i} className={styles.priceRow}>
              <Text className={styles.priceLabel}>{f.label}</Text>
              <Text className={styles.priceValue}>¥{f.amount}</Text>
            </View>
          ))}
          {order.discount ? (
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>优惠减免</Text>
              <Text className={styles.priceValue} style={{ color: '#10B981' }}>-¥{order.discount}</Text>
            </View>
          ) : null}
          <View className={classnames(styles.priceRow, styles.totalRow)}>
            <Text className={styles.priceLabel}>应付总额</Text>
            <Text className={styles.priceValue}>¥{order.totalAmount}</Text>
          </View>
        </View>

        {order.review ? (
          <View className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardHeaderIcon}>⭐</Text>
              <Text className={styles.cardHeaderTitle}>服务评价</Text>
            </View>
            <View className={styles.starRow}>
              {[1,2,3,4,5].map(i => (
                <Text key={i} className={styles.star}>{i <= (order.review?.rating || 0) ? '⭐' : '☆'}</Text>
              ))}
              <Text style={{ marginLeft: 12, color: '#9CA3AF', fontSize: 24 }}>{order.review?.createdAt?.slice(0,10) || ''}</Text>
            </View>
            <Text className={styles.commentText}>{order.review.comment || '服务非常满意！'}</Text>
          </View>
        ) : null}
      </View>

      <View className={styles.bottomBar}>
        {btns.map((b, i) => (
          <View key={i} className={classnames(styles.btn, styles[b.type])} onClick={b.onClick}>
            <Text className={styles.btnText}>{b.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
