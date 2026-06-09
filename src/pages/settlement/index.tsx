import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useUserStore } from '../../store/userStore';
import { useAppStore } from '../../store/appStore';
import { calcOrderFinance, formatMoney, formatArea } from '../../utils/orderFinance';

const ratingLabels = ['差', '一般', '中等', '良好', '优秀'];
const defaultTags = [
  '效率高', '准时到达', '收割干净', '服务态度好',
  '价格公道', '技术专业', '沟通顺畅', '推荐使用'
];

const methodLabels: Record<string, string> = {
  wechat: '微信',
  alipay: '支付宝',
  cash: '现金',
  card: '银行卡',
  bank: '银行转账',
  other: '其他'
};

const SettlementPage: React.FC = () => {
  const router = useRouter();
  const { currentRole } = useUserStore();
  const { getOrder, updateOrder, addPayment } = useAppStore();
  const order = getOrder(router.params.id) || useAppStore.getState().orders[useAppStore.getState().orders.length - 1];

  const fin = useMemo(() => calcOrderFinance(order), [order]);

  const orderNo = useMemo(() => order?.id ?? '', [order]);
  const plotAddress = useMemo(() => order?.plot?.address ?? '', [order]);

  const initialPayMethod = useMemo(() => {
    const pm = (order as any)?.paymentMethod;
    return pm || 'wechat';
  }, [order]);

  const initialRatings = useMemo(() => {
    const ev = order?.evaluation;
    if (ev) {
      return {
        overall: ev.rating ?? 5,
        speed: ev.punctuality ?? 5,
        quality: ev.quality ?? 5,
        attitude: ev.attitude ?? 5
      };
    }
    return { overall: 5, speed: 5, quality: 5, attitude: 5 };
  }, [order]);

  const initialTags = useMemo(() => {
    const ev = (order?.evaluation as any);
    if (ev?.tags && Array.isArray(ev.tags) && ev.tags.length > 0) {
      return ev.tags;
    }
    return ['效率高', '收割干净', '服务态度好'];
  }, [order]);

  const initialComment = useMemo(() => {
    const ev = order?.evaluation;
    if (ev?.comment) return ev.comment;
    return '非常专业的机手，准时到达，收割干净，秸秆处理也到位，明年继续合作！';
  }, [order]);

  const [payMethod, setPayMethod] = useState(initialPayMethod);
  const [ratings, setRatings] = useState(initialRatings);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [comment, setComment] = useState(initialComment);
  const [paid, setPaid] = useState(order?.status === 'settled');
  const [reviewSubmitted, setReviewSubmitted] = useState(!!order?.evaluation);

  const repayProgress = useMemo(() => {
    if (fin.debtAmount <= 0) return 100;
    return Math.min(100, Math.round((fin.totalPaid / fin.debtAmount) * 100));
  }, [fin.debtAmount, fin.totalPaid]);

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
  };

  const setRating = (k: string, v: number) => {
    setRatings({ ...ratings, [k]: v });
  };

  const handleSelectPayMethod = (method: string) => {
    setPayMethod(method);
    if (order?.id) {
      updateOrder(order.id, { paymentMethod: method } as any);
    }
  };

  const pay = () => {
    if (!order?.id) return;
    console.log('[Settlement] 支付:', payMethod, '金额:', fin.actualPaid);
    Taro.showLoading({ title: '支付中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      setPaid(true);
      if (fin.debtAmount > 0 && fin.actualPaid > 0) {
        addPayment(order.id, {
          amount: fin.actualPaid,
          method: payMethod as any,
          paidAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          paidBy: order.farmerName
        });
      }
      updateOrder(order.id, {
        status: 'settled',
        settledAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        paymentMethod: payMethod,
        totalAmount: fin.totalPayable
      } as any);
      Taro.showToast({ title: '✅ 支付成功', icon: 'success' });
    }, 1000);
  };

  const submitReview = () => {
    if (!order?.id) return;
    console.log('[Settlement] 评价:', { ratings, tags, comment });
    Taro.showLoading({ title: '提交中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      const evaluation = {
        id: 'e' + Date.now(),
        orderId: order.id,
        rating: ratings.overall,
        quality: ratings.quality,
        attitude: ratings.attitude,
        punctuality: ratings.speed,
        comment,
        tags,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      updateOrder(order.id, { evaluation, totalAmount: fin.totalPayable } as any);
      setReviewSubmitted(true);
      Taro.showToast({ title: '✅ 评价已提交', icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/orders/index' }), 1200);
    }, 800);
  };

  if (!order) {
    return (
      <View className={styles.pageWrap} style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  const payments = order.payments ?? [];

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.header}>
        <Text className={styles.orderNo}>订单号 {orderNo}</Text>
        <Text className={styles.title}>{paid ? '✅ 结算完成' : '💰 待结算金额'}</Text>
        <View className={styles.amountWrap}>
          <Text className={styles.amount}>{paid ? formatMoney(fin.actualPaid) : formatMoney(fin.totalPayable)}</Text>
        </View>
      </View>

      <View className={styles.content}>
        {paid ? (
          <View className={styles.successBanner}>
            <View className={styles.successIcon}>✓</View>
            <View className={styles.successBody}>
              <Text className={styles.successTitle}>支付成功</Text>
              <Text className={styles.successDesc}>款项已转入机手账户，感谢使用小麦抢收服务！</Text>
            </View>
          </View>
        ) : null}

        <View className={styles.finOverviewCard}>
          <View className={styles.finOverviewItem}>
            <View className={styles.finIconWrap} style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
              <Text className={styles.finIcon}>📋</Text>
            </View>
            <Text className={styles.finAmount} style={{ color: '#EA580C' }}>{formatMoney(fin.totalPayable)}</Text>
            <Text className={styles.finLabel}>应收总额</Text>
          </View>
          <View className={styles.finOverviewItem}>
            <View className={styles.finIconWrap} style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
              <Text className={styles.finIcon}>✅</Text>
            </View>
            <Text className={styles.finAmount} style={{ color: '#059669' }}>{formatMoney(fin.totalPaid)}</Text>
            <Text className={styles.finLabel}>已付金额</Text>
          </View>
          <View className={styles.finOverviewItem}>
            <View className={styles.finIconWrap} style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
              <Text className={styles.finIcon}>⏳</Text>
            </View>
            <Text className={styles.finAmount} style={{ color: '#DC2626' }}>{formatMoney(fin.remainingDebt)}</Text>
            <Text className={styles.finLabel}>待付金额</Text>
          </View>
        </View>

        {fin.debtAmount > 0 ? (
          <View className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardHeaderIcon}>📊</Text>
              <Text className={styles.cardHeaderTitle}>还款状态</Text>
            </View>
            <View className={styles.progressWrap}>
              <View className={styles.progressBar}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${repayProgress}%` }}
                />
              </View>
              <View className={styles.progressInfo}>
                <Text className={styles.progressPercent}>还款进度 {repayProgress}%</Text>
                <Text className={styles.progressDetail}>
                  已付 {formatMoney(fin.totalPaid)} / 欠款 {formatMoney(fin.debtAmount)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {fin.debtAmount > 0 ? (
          <View className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardHeaderIcon}>💳</Text>
              <Text className={styles.cardHeaderTitle}>还款记录</Text>
            </View>
            {payments.length > 0 ? (
              <View className={styles.paymentList}>
                {payments.map(p => (
                  <View key={p.id} className={styles.paymentItem}>
                    <View className={styles.paymentInfo}>
                      <Text className={styles.paymentAmount}>{formatMoney(p.amount)}</Text>
                      <Text className={styles.paymentMeta}>
                        {methodLabels[p.method] || p.method} · {p.paidAt}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyPayment}>
                <Text className={styles.emptyText}>暂无还款记录</Text>
              </View>
            )}
          </View>
        ) : null}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🧾</Text>
            <Text className={styles.cardHeaderTitle}>费用明细</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>地块地址</Text>
            <Text className={styles.infoValue}>{plotAddress}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>基础作业费</Text>
            <Text className={styles.infoValue}>{formatArea(fin.actualArea)} 亩 × {formatMoney(fin.unitPrice)} = {formatMoney(fin.workFee)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>燃油费</Text>
            <Text className={styles.infoValue}>{formatMoney(fin.fuelCost)}</Text>
          </View>
          {fin.debtAmount > 0 ? (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel} style={{ color: '#EF4444' }}>欠款扣减</Text>
              <Text className={styles.infoValue} style={{ color: '#10B981' }}>-{formatMoney(fin.debtAmount)}</Text>
            </View>
          ) : null}
          <View className={classnames(styles.infoRow, styles.totalRow)}>
            <Text className={styles.infoLabel}>应付总额</Text>
            <Text className={styles.infoValue}>{formatMoney(fin.totalPayable)}</Text>
          </View>
        </View>

        {!paid && currentRole === 'farmer' ? (
          <View className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardHeaderIcon}>💳</Text>
              <Text className={styles.cardHeaderTitle}>支付方式</Text>
            </View>
            <View className={styles.payMethods}>
              <View
                className={classnames(styles.payMethod, payMethod === 'wechat' && styles.active)}
                onClick={() => handleSelectPayMethod('wechat')}
              >
                <Text className={styles.payIcon}>💚</Text>
                <Text className={styles.payName}>微信</Text>
              </View>
              <View
                className={classnames(styles.payMethod, payMethod === 'alipay' && styles.active)}
                onClick={() => handleSelectPayMethod('alipay')}
              >
                <Text className={styles.payIcon}>💙</Text>
                <Text className={styles.payName}>支付宝</Text>
              </View>
              <View
                className={classnames(styles.payMethod, payMethod === 'cash' && styles.active)}
                onClick={() => handleSelectPayMethod('cash')}
              >
                <Text className={styles.payIcon}>💴</Text>
                <Text className={styles.payName}>现金</Text>
              </View>
              <View
                className={classnames(styles.payMethod, payMethod === 'card' && styles.active)}
                onClick={() => handleSelectPayMethod('card')}
              >
                <Text className={styles.payIcon}>💳</Text>
                <Text className={styles.payName}>银行卡</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>⭐</Text>
            <Text className={styles.cardHeaderTitle}>
              服务评价{reviewSubmitted ? '（已提交）' : ''}
            </Text>
          </View>

          <View className={styles.ratingSection}>
            {[
              { key: 'overall', label: '综合评分' },
              { key: 'speed', label: '作业速度' },
              { key: 'quality', label: '收割质量' },
              { key: 'attitude', label: '服务态度' },
            ].map(r => (
              <View key={r.key} className={styles.ratingRow}>
                <Text className={styles.ratingLabel}>{r.label}</Text>
                <View className={styles.stars}>
                  {[1,2,3,4,5].map(n => (
                    <Text
                      key={n}
                      className={classnames(styles.star, n <= ratings[r.key as keyof typeof ratings] && styles.active)}
                      onClick={() => !reviewSubmitted && setRating(r.key, n)}
                    >★</Text>
                  ))}
                </View>
                <Text className={styles.ratingHint}>
                  {ratingLabels[ratings[r.key as keyof typeof ratings] - 1]}
                </Text>
              </View>
            ))}
          </View>

          <View className={styles.ratingRow} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text className={styles.ratingLabel}>服务标签</Text>
            <View className={styles.tagGroup}>
              {defaultTags.map(t => (
                <Text
                  key={t}
                  className={classnames(styles.tag, tags.includes(t) && styles.active)}
                  onClick={() => !reviewSubmitted && toggleTag(t)}
                >{t}</Text>
              ))}
            </View>
          </View>

          <View className={styles.commentBox}>
            <Textarea
              value={comment}
              onInput={(e: any) => !reviewSubmitted && setComment(e.detail.value)}
              placeholder="说说您对本次抢收服务的体验吧..."
              style={{ width: '100%', minHeight: 140, fontSize: 26, lineHeight: 1.5 }}
              maxlength={300}
              disabled={reviewSubmitted}
            />
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        {!paid && currentRole === 'farmer' ? (
          <>
            <View className={classnames(styles.btn, styles.ghost)} onClick={() => Taro.navigateBack()}>
              <Text className={styles.btnText}>稍后</Text>
            </View>
            <View className={classnames(styles.btn, styles.primary)} onClick={pay}>
              <Text className={styles.btnText}>立即支付 {formatMoney(fin.actualPaid)}</Text>
            </View>
          </>
        ) : (
          <>
            <View className={classnames(styles.btn, styles.ghost)} onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
              <Text className={styles.btnText}>跳过</Text>
            </View>
            <View
              className={classnames(styles.btn, reviewSubmitted ? styles.ghost : styles.secondary)}
              onClick={!reviewSubmitted ? submitReview : undefined}
            >
              <Text className={styles.btnText}>{reviewSubmitted ? '已评价' : '提交评价'}</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SettlementPage;
