import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { OrderStatus } from '../../types';
import { useUserStore } from '../../store/userStore';
import { useAppStore } from '../../store/appStore';
import { calcOrderFinance, formatMoney, formatArea } from '../../utils/orderFinance';

const statusConfig: Record<OrderStatus, { title: string; desc: string }> = {
  pending: { title: '⏳ 等待机手接单', desc: '村级协调员正在调度，请耐心等候匹配' },
  accepted: { title: '✅ 机手已接单', desc: '机手正在前往您的地块，请保持电话畅通' },
  working: { title: '🚜 作业进行中', desc: '收割机正在为您作业，可电话联系现场进度' },
  submitted: { title: '📸 作业已提交确认', desc: '机手已上传作业记录，请您及时核实确认' },
  confirmed: { title: '✍️ 请进行结算评价', desc: '双方已确认亩数，请完成付款和服务评价' },
  settled: { title: '🎉 订单已完成', desc: '订单已结算完毕，感谢您的信任与支持' },
};

const calcWorkHours = (startTime?: string, endTime?: string): string => {
  if (!startTime || !endTime) return '—';
  const s = new Date(startTime.replace(' ', 'T')).getTime();
  const e = new Date(endTime.replace(' ', 'T')).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return '—';
  const hours = (e - s) / (1000 * 60 * 60);
  return hours.toFixed(1);
};

const safeNum = (v: number | undefined | null, fallback = 0): number => {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
};

const safeStr = (v: string | undefined | null, fallback = '—'): string => {
  return v && v.trim() ? v : fallback;
};

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentRole } = useUserStore();
  const getOrder = useAppStore(state => state.getOrder);

  const orderId = router.params.id || '';
  const order = getOrder(orderId);

  if (!order) {
    return (
      <View className={styles.pageWrap} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Text style={{ color: '#6B7280', fontSize: 32 }}>订单不存在</Text>
      </View>
    );
  }

  const sc = statusConfig[order.status];
  const createdAt = safeStr(order.plot.createdAt || order.demand.createdAt);
  const fin = useMemo(() => calcOrderFinance(order), [order]);
  const workHours = order.workRecord ? calcWorkHours(order.workRecord.startTime, order.workRecord.endTime) : '—';
  const evaluation = order.evaluation;
  const rating = safeNum(evaluation?.rating);

  const timeline = [
    { title: '抢收需求已发起', time: createdAt, active: true },
    { title: '村级协调员受理', time: createdAt, active: order.status !== 'pending' },
    { title: '机手已接单', time: order.acceptedAt || '', active: ['accepted', 'working', 'submitted', 'confirmed', 'settled'].includes(order.status) },
    { title: '开始作业', time: order.startedAt || '', active: ['working', 'submitted', 'confirmed', 'settled'].includes(order.status) },
    { title: '作业完成提交', time: order.completedAt || '', active: ['submitted', 'confirmed', 'settled'].includes(order.status) },
    { title: '农户确认亩数', time: order.workRecord?.confirmedAt || order.completedAt || '', active: ['confirmed', 'settled'].includes(order.status) },
    { title: '结算完成', time: order.settledAt || '', active: order.status === 'settled' },
  ].filter(t => t.time);

  const handleCall = (phone: string) => {
    if (!phone) return;
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
          { text: '📞 联系协调员', type: 'outline' as const, onClick: () => handleCall('13800000000') },
          { text: '取消需求', type: 'ghost' as const, onClick: () => Taro.showToast({ title: '已申请取消', icon: 'none' }) },
        ];
      case 'accepted':
        return [
          { text: '📞 联系机手', type: 'outline' as const, onClick: () => handleCall(order.operatorPhone) },
          { text: '💰 预付订金', type: 'primary' as const, onClick: () => handleAction('settle') },
        ];
      case 'submitted':
        return [
          { text: '❌ 有异议', type: 'outline' as const, onClick: () => Taro.showToast({ title: '已通知协调员', icon: 'none' }) },
          { text: '✅ 确认作业', type: 'primary' as const, onClick: () => handleAction('confirmWork') },
        ];
      case 'confirmed':
        return [
          { text: '去评价', type: 'primary' as const, onClick: () => handleAction('settle') },
        ];
      case 'settled':
        return [
          { text: '再次抢收', type: 'primary' as const, onClick: () => Taro.switchTab({ url: '/pages/plots/index' }) },
        ];
      default:
        return [
          { text: '📞 联系机手', type: 'outline' as const, onClick: () => handleCall(order.operatorPhone) },
          { text: '联系客服', type: 'ghost' as const, onClick: () => Taro.showToast({ title: '客服开发中', icon: 'none' }) },
        ];
    }
  };

  const operatorBtns = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return [
          { text: '📨 转派他人', type: 'outline' as const, onClick: () => handleAction('transfer') },
          { text: '🚜 立即接单', type: 'primary' as const, onClick: () => handleAction('accept') },
        ];
      case 'accepted':
        return [
          { text: '📞 联系农户', type: 'outline' as const, onClick: () => handleCall(order.farmerPhone) },
          { text: '🧭 导航前往', type: 'secondary' as const, onClick: () => Taro.showToast({ title: '导航开发中', icon: 'none' }) },
          { text: '开始作业', type: 'primary' as const, onClick: () => handleAction('startWork') },
        ];
      case 'working':
        return [
          { text: '📞 联系农户', type: 'outline' as const, onClick: () => handleCall(order.farmerPhone) },
          { text: '完成作业', type: 'primary' as const, onClick: () => handleAction('submitWork') },
        ];
      default:
        return [
          { text: '📞 联系农户', type: 'outline' as const, onClick: () => handleCall(order.farmerPhone) },
          { text: '查看评价', type: 'primary' as const, onClick: () => handleAction('settle') },
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
            <Text className={styles.infoValue}>{order.id}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>详细地址</Text>
            <Text className={styles.infoValue}>{safeStr(order.plot.address)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>种植面积</Text>
            <Text className={styles.infoValue}>{safeNum(order.area)} 亩</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>可进地</Text>
            <Text className={styles.infoValue}>{safeStr(order.scheduledTime)}</Text>
          </View>
          {order.plot.note && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.infoValue}>{safeStr(order.plot.note)}</Text>
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
              <Text>{safeStr(order.farmerName)} · {safeStr(order.farmerPhone)}</Text>
              <Text onClick={() => handleCall(order.farmerPhone)} style={{ color: '#F59E0B' }}>📞</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>机手</Text>
            <View className={styles.infoValue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>{safeStr(order.operatorName)} · {safeStr(order.operatorPhone)}</Text>
              <Text onClick={() => handleCall(order.operatorPhone)} style={{ color: '#F59E0B' }}>📞</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>收割机</Text>
            <Text className={styles.infoValue}>{safeStr(order.machineName)}</Text>
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
              <Text className={styles.infoValue}>
                {formatArea(fin.actualArea)}亩（实际）
                {fin.areaDiff !== 0 && <Text style={{ color: '#F59E0B', marginLeft: 8 }}>（原 {formatArea(fin.quotedArea)} 亩）</Text>}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>作业用时</Text>
              <Text className={styles.infoValue}>{workHours} 小时</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>油费备注</Text>
              <Text className={styles.infoValue}>
                {formatMoney(fin.fuelCost)}
                {order.workRecord.fuelNote ? `（${order.workRecord.fuelNote}）` : ''}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>补充说明</Text>
              <Text className={styles.infoValue}>{safeStr(order.workRecord.note, '作业顺利完成')}</Text>
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
            {fin.debtAmount > 0 && (
              <View className={styles.debtRow}>
                <Text className={styles.debtLabel}>⚠️ 待补欠款{order.workRecord.debtNote ? `（${order.workRecord.debtNote}）` : ''}</Text>
                <Text className={styles.debtValue}>{formatMoney(fin.debtAmount)}</Text>
              </View>
            )}
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>💰</Text>
            <Text className={styles.cardHeaderTitle}>费用明细</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>基础作业费</Text>
            <Text className={styles.priceValue}>{formatArea(fin.actualArea)}亩 × {formatMoney(fin.unitPrice)}/亩 = {formatMoney(fin.workFee)}</Text>
          </View>
          {fin.fuelCost > 0 && (
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>燃油费</Text>
              <Text className={styles.priceValue}>{formatMoney(fin.fuelCost)}</Text>
            </View>
          )}
          {fin.debtAmount > 0 && (
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>欠款扣减</Text>
              <Text className={styles.priceValue} style={{ color: '#EF4444' }}>- {formatMoney(fin.debtAmount)}</Text>
            </View>
          )}
          <View className={classnames(styles.priceRow, styles.totalRow)}>
            <Text className={styles.priceLabel}>应收总额</Text>
            <Text className={styles.priceValue}>{formatMoney(fin.totalPayable)}</Text>
          </View>
          {fin.debtAmount > 0 && (
            <View className={classnames(styles.priceRow, styles.totalRow)}>
              <Text className={styles.priceLabel}>实收</Text>
              <Text className={styles.priceValue} style={{ color: '#10B981' }}>{formatMoney(fin.actualPaid)}</Text>
            </View>
          )}
        </View>

        {evaluation && (
          <View className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardHeaderIcon}>⭐</Text>
              <Text className={styles.cardHeaderTitle}>服务评价</Text>
            </View>
            <View className={styles.starRow}>
              {[1,2,3,4,5].map(i => (
                <Text key={i} className={styles.star}>{i <= rating ? '⭐' : '☆'}</Text>
              ))}
              <Text style={{ marginLeft: 12, color: '#9CA3AF', fontSize: 24 }}>{evaluation.createdAt?.slice(0,10) || ''}</Text>
            </View>
            <Text className={styles.commentText}>{safeStr(evaluation.comment, '服务非常满意！')}</Text>
          </View>
        )}
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
