import React, { useState } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockOrders } from '../../data/mockOrders';

const WorkSubmitPage: React.FC = () => {
  const router = useRouter();
  const order = mockOrders.find(o => o.id === router.params.id) || mockOrders[2];

  const [form, setForm] = useState({
    confirmedArea: order.area,
    workHours: 2.5,
    fuelCost: 120,
    notes: '作业顺利，地块规整，无障碍物',
    hasDebt: false,
    debtAmount: 0,
  });
  const [photos, setPhotos] = useState<string[]>(['🌾', '🚜', '🌾']);

  const addPhoto = () => {
    Taro.showActionSheet({
      itemList: ['拍照上传', '从相册选择'],
      success: () => {
        setPhotos([...photos, '🌾']);
        Taro.showToast({ title: '已添加', icon: 'success' });
      }
    });
  };

  const removePhoto = (idx: number) => {
    const arr = [...photos];
    arr.splice(idx, 1);
    setPhotos(arr);
  };

  const submit = () => {
    console.log('[WorkSubmit] 提交:', form, photos);
    Taro.showLoading({ title: '提交中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '✅ 作业记录已提交', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1200);
    }, 800);
  };

  const totalPrice = form.confirmedArea * order.unitPrice;

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>📋</Text>
            <Text className={styles.cardHeaderTitle}>订单信息</Text>
            <Text className={styles.cardHeaderTag}>NO.{order.orderNo}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>农户</Text>
            <Text className={styles.infoValue}>{order.farmerName} · {order.farmerPhone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>地址</Text>
            <Text className={styles.infoValue}>{order.plotAddress}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>原报亩数</Text>
            <Text className={styles.infoValue}>{order.area} 亩</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>单价</Text>
            <Text className={styles.infoValue}>¥{order.unitPrice}/亩</Text>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🚜</Text>
            <Text className={styles.cardHeaderTitle}>作业数据</Text>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>实际亩数</Text>
            <View className={styles.formBody}>
              <View className={styles.inputBox}>
                <Input
                  type="digit"
                  style={{ flex: 1, fontSize: 28, color: '#111827' }}
                  value={String(form.confirmedArea)}
                  onInput={(e: any) => setForm({ ...form, confirmedArea: parseFloat(e.detail.value) || 0 })}
                />
                <Text className={styles.inputUnit}>亩</Text>
              </View>
              {form.confirmedArea !== order.area && (
                <Text style={{ fontSize: 20, color: '#F59E0B', marginTop: 6 }}>
                  ⚠️ 与原报亩数相差 {(form.confirmedArea - order.area).toFixed(2)} 亩
                </Text>
              )}
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>作业时长</Text>
            <View className={styles.formBody}>
              <View className={styles.inputBox}>
                <Input
                  type="digit"
                  style={{ flex: 1, fontSize: 28, color: '#111827' }}
                  value={String(form.workHours)}
                  onInput={(e: any) => setForm({ ...form, workHours: parseFloat(e.detail.value) || 0 })}
                />
                <Text className={styles.inputUnit}>小时</Text>
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>油费备注</Text>
            <View className={styles.formBody}>
              <View className={styles.inputBox}>
                <Input
                  type="digit"
                  style={{ flex: 1, fontSize: 28, color: '#111827' }}
                  value={String(form.fuelCost)}
                  onInput={(e: any) => setForm({ ...form, fuelCost: parseFloat(e.detail.value) || 0 })}
                />
                <Text className={styles.inputUnit}>元</Text>
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>补充说明</Text>
            <View className={styles.formBody}>
              <View className={styles.textareaBox}>
                <Textarea
                  value={form.notes}
                  onInput={(e: any) => setForm({ ...form, notes: e.detail.value })}
                  placeholder="如特殊地形、障碍物、倒伏情况、秸秆处理方式等说明"
                  style={{ width: '100%', minHeight: 120, fontSize: 26, lineHeight: 1.5 }}
                  maxlength={300}
                />
              </View>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>📸</Text>
            <Text className={styles.cardHeaderTitle}>作业照片</Text>
          </View>
          <Text className={styles.photoTip}>请上传至少 3 张照片（收割前、收割中、收割后各 1 张）</Text>
          <View className={styles.photoGrid}>
            {photos.map((p, i) => (
              <View key={i} className={styles.photoItem}>
                <Text>{p}</Text>
                <View className={styles.photoDel} onClick={() => removePhoto(i)}>✕</View>
              </View>
            ))}
            {photos.length < 9 && (
              <View className={styles.photoAdd} onClick={addPhoto}>
                <Text className={styles.photoAddIcon}>＋</Text>
                <Text className={styles.photoAddText}>添加</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>💳</Text>
            <Text className={styles.cardHeaderTitle}>费用结算</Text>
          </View>
          <View
            className={styles.checkRow}
            onClick={() => setForm({ ...form, hasDebt: !form.hasDebt, debtAmount: form.hasDebt ? 0 : 300 })}
          >
            <View className={classnames(styles.checkbox, form.hasDebt && styles.checked)}>
              {form.hasDebt && <Text className={styles.checkIcon}>✓</Text>}
            </View>
            <Text className={styles.checkLabel}>农户暂欠款，部分未付清</Text>
          </View>
          {form.hasDebt && (
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>欠款金额</Text>
              <View className={styles.formBody}>
                <View className={styles.inputBox}>
                  <Input
                    type="digit"
                    style={{ flex: 1, fontSize: 28, color: '#EF4444' }}
                    value={String(form.debtAmount)}
                    onInput={(e: any) => setForm({ ...form, debtAmount: parseFloat(e.detail.value) || 0 })}
                  />
                  <Text className={styles.inputUnit}>元</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View className={classnames(styles.card, styles.previewCard)}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🧾</Text>
            <Text className={styles.cardHeaderTitle}>费用预览</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>实际作业</Text>
            <Text className={styles.priceValue}>{form.confirmedArea} 亩 × ¥{order.unitPrice}</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>作业费用</Text>
            <Text className={styles.priceValue}>¥{totalPrice}</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>油费（参考）</Text>
            <Text className={styles.priceValue}>¥{form.fuelCost}</Text>
          </View>
          {form.hasDebt && (
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel} style={{ color: '#EF4444' }}>待收欠款</Text>
              <Text className={styles.priceValue} style={{ color: '#EF4444' }}>¥{form.debtAmount}</Text>
            </View>
          )}
          <View className={classnames(styles.priceRow, styles.totalRow)}>
            <Text className={styles.priceLabel}>应收总额</Text>
            <Text className={styles.priceValue}>¥{totalPrice}</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.ghost)} onClick={() => Taro.navigateBack()}>
          <Text className={styles.btnText}>保存草稿</Text>
        </View>
        <View className={classnames(styles.btn, styles.primary)} onClick={submit}>
          <Text className={styles.btnText}>🚀 提交作业</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default WorkSubmitPage;
