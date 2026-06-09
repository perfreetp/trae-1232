import React, { useState } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockOrders } from '../../data/mockOrders';
import { useUserStore } from '../../store/userStore';

const ratingLabels = ['差', '一般', '中等', '良好', '优秀'];
const defaultTags = [
  '效率高', '准时到达', '收割干净', '服务态度好',
  '价格公道', '技术专业', '沟通顺畅', '推荐使用'
];

const SettlementPage: React.FC = () => {
  const router = useRouter();
  const { currentRole } = useUserStore();
  const order = mockOrders.find(o => o.id === router.params.id) || mockOrders[5];

  const [payMethod, setPayMethod] = useState('wechat');
  const [ratings, setRatings] = useState({ overall: 5, speed: 5, quality: 5, attitude: 5 });
  const [tags, setTags] = useState<string[]>(['效率高', '收割干净', '服务态度好']);
  const [comment, setComment] = useState('非常专业的机手，准时到达，收割干净，秸秆处理也到位，明年继续合作！');
  const [paid, setPaid] = useState(order.status === 'settled');

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
  };

  const setRating = (k: string, v: number) => {
    setRatings({ ...ratings, [k]: v });
  };

  const pay = () => {
    console.log('[Settlement] 支付:', payMethod, '金额:', order.totalAmount);
    Taro.showLoading({ title: '支付中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      setPaid(true);
      Taro.showToast({ title: '✅ 支付成功', icon: 'success' });
    }, 1000);
  };

  const submitReview = () => {
    console.log('[Settlement] 评价:', { ratings, tags, comment });
    Taro.showLoading({ title: '提交中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '✅ 评价已提交', icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/orders/index' }), 1200);
    }, 800);
  };

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.header}>
        <Text className={styles.orderNo}>订单号 {order.orderNo}</Text>
        <Text className={styles.title}>{paid ? '✅ 结算完成' : '💰 待结算金额'}</Text>
        <View className={styles.amountWrap}>
          <Text className={styles.amountPrefix}>¥</Text>
          <Text className={styles.amount}>{order.totalAmount}</Text>
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

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🧾</Text>
            <Text className={styles.cardHeaderTitle}>费用明细</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>作业亩数</Text>
            <Text className={styles.infoValue}>{order.workRecord?.confirmedArea || order.area} 亩 × ¥{order.unitPrice}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>基础费用</Text>
            <Text className={styles.infoValue}>¥{((order.workRecord?.confirmedArea || order.area) * order.unitPrice).toFixed(0)}</Text>
          </View>
          {order.otherFees?.map((f, i) => (
            <View key={i} className={styles.infoRow}>
              <Text className={styles.infoLabel}>{f.label}</Text>
              <Text className={styles.infoValue}>¥{f.amount}</Text>
            </View>
          ))}
          {order.discount ? (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>优惠</Text>
              <Text className={styles.infoValue} style={{ color: '#10B981' }}>-¥{order.discount}</Text>
            </View>
          ) : null}
          {order.workRecord?.debtAmount ? (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel} style={{ color: '#EF4444' }}>已减欠款</Text>
              <Text className={styles.infoValue} style={{ color: '#10B981' }}>-¥{order.workRecord.debtAmount}</Text>
            </View>
          ) : null}
          <View className={classnames(styles.infoRow, styles.totalRow)}>
            <Text className={styles.infoLabel}>应付总额</Text>
            <Text className={styles.infoValue}>¥{order.totalAmount}</Text>
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
                onClick={() => setPayMethod('wechat')}
              >
                <Text className={styles.payIcon}>💚</Text>
                <Text className={styles.payName}>微信</Text>
              </View>
              <View
                className={classnames(styles.payMethod, payMethod === 'alipay' && styles.active)}
                onClick={() => setPayMethod('alipay')}
              >
                <Text className={styles.payIcon}>💙</Text>
                <Text className={styles.payName}>支付宝</Text>
              </View>
              <View
                className={classnames(styles.payMethod, payMethod === 'cash' && styles.active)}
                onClick={() => setPayMethod('cash')}
              >
                <Text className={styles.payIcon}>💴</Text>
                <Text className={styles.payName}>现金</Text>
              </View>
              <View
                className={classnames(styles.payMethod, payMethod === 'card' && styles.active)}
                onClick={() => setPayMethod('card')}
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
            <Text className={styles.cardHeaderTitle}>服务评价</Text>
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
                      onClick={() => setRating(r.key, n)}
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
                  onClick={() => toggleTag(t)}
                >{t}</Text>
              ))}
            </View>
          </View>

          <View className={styles.commentBox}>
            <Textarea
              value={comment}
              onInput={(e: any) => setComment(e.detail.value)}
              placeholder="说说您对本次抢收服务的体验吧..."
              style={{ width: '100%', minHeight: 140, fontSize: 26, lineHeight: 1.5 }}
              maxlength={300}
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
              <Text className={styles.btnText}>立即支付 ¥{order.totalAmount}</Text>
            </View>
          </>
        ) : (
          <>
            <View className={classnames(styles.btn, styles.ghost)} onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
              <Text className={styles.btnText}>跳过</Text>
            </View>
            <View className={classnames(styles.btn, styles.secondary)} onClick={submitReview}>
              <Text className={styles.btnText}>提交评价</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SettlementPage;
