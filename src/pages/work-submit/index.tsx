import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store/appStore';
import { WorkRecord } from '../../types';
import { calcOrderFinance, formatMoney, formatArea } from '../../utils/orderFinance';

const WorkSubmitPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.id || '';
  const getOrder = useAppStore(state => state.getOrder);
  const updateOrder = useAppStore(state => state.updateOrder);
  const order = getOrder(orderId) || getOrder('o002') || null;

  const fin = useMemo(() => calcOrderFinance(order), [order]);

  const [form, setForm] = useState({
    confirmedArea: fin.actualArea > 0 ? fin.actualArea : order?.area ?? 0,
    workHours: 2.5,
    fuelCost: fin.fuelCost > 0 ? fin.fuelCost : 0,
    notes: order?.workRecord?.note || order?.plot?.note || '',
    hasDebt: fin.debtAmount > 0,
    debtAmount: fin.debtAmount > 0 ? fin.debtAmount : 0,
  });
  const [photos, setPhotos] = useState<string[]>(
    order?.workRecord?.photos?.length ? order.workRecord.photos : []
  );

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

  const unitPrice = order?.quotedPrice ?? 0;
  const plotAddress = order?.plot?.address ?? '';
  const originalArea = order?.area ?? 0;

  const workFee = useMemo(
    () => Math.round(form.confirmedArea * unitPrice * 100) / 100,
    [form.confirmedArea, unitPrice]
  );
  const totalPayable = useMemo(
    () => Math.round((workFee + form.fuelCost) * 100) / 100,
    [workFee, form.fuelCost]
  );
  const actualPaid = useMemo(
    () => Math.max(0, Math.round((totalPayable - form.debtAmount) * 100) / 100),
    [totalPayable, form.debtAmount]
  );
  const areaDiff = useMemo(
    () => Math.round((form.confirmedArea - originalArea) * 100) / 100,
    [form.confirmedArea, originalArea]
  );

  const submit = () => {
    if (!order) {
      Taro.showToast({ title: '订单不存在', icon: 'error' });
      return;
    }
    if (form.confirmedArea <= 0) {
      Taro.showToast({ title: '请输入实际亩数', icon: 'none' });
      return;
    }
    if (form.workHours <= 0) {
      Taro.showToast({ title: '请输入作业时长', icon: 'none' });
      return;
    }
    if (photos.length < 3) {
      Taro.showToast({ title: '请至少上传3张照片', icon: 'none' });
      return;
    }
    if (form.hasDebt && form.debtAmount > totalPayable) {
      Taro.showToast({ title: '欠款金额不能大于应收总额', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '提交中...', mask: true });

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const workRecord: WorkRecord = {
      id: order.workRecord?.id || ('w' + Date.now()),
      orderId: order.id,
      startTime: order.startedAt || order.workRecord?.startTime || now,
      endTime: now,
      actualArea: form.confirmedArea,
      confirmedAt: now,
      photos: [...photos],
      fuelCost: form.fuelCost,
      fuelNote: form.fuelCost > 0 ? ('0号柴油' + Math.round(form.fuelCost / 7.6) + '升') : '',
      debtAmount: form.hasDebt ? form.debtAmount : 0,
      debtNote: form.hasDebt && form.debtAmount > 0 ? '先付一部分，余款下周结清' : '',
      note: form.notes || '',
    };

    setTimeout(() => {
      updateOrder(order.id, {
        status: 'submitted',
        workRecord,
        area: form.confirmedArea,
        totalAmount: Math.round(totalPayable),
        completedAt: now,
      });
      Taro.hideLoading();
      Taro.showToast({ title: '✅ 作业记录已提交', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1200);
    }, 800);
  };

  if (!order) {
    return (
      <ScrollView className={styles.pageWrap} scrollY>
        <View className={styles.content}>
          <Text>订单不存在</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>📋</Text>
            <Text className={styles.cardHeaderTitle}>订单信息</Text>
            <Text className={styles.cardHeaderTag}>NO.{order.id.toUpperCase()}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>农户</Text>
            <Text className={styles.infoValue}>{order.farmerName || '-'} · {order.farmerPhone || '-'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>地址</Text>
            <Text className={styles.infoValue}>{plotAddress || '-'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>原报亩数</Text>
            <Text className={styles.infoValue}>{formatArea(originalArea)} 亩</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>单价</Text>
            <Text className={styles.infoValue}>¥{unitPrice}/亩</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>村/组</Text>
            <Text className={styles.infoValue}>{order.plot?.village || '-'} {order.plot?.group || ''}</Text>
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
              {areaDiff !== 0 && (
                <Text style={{ fontSize: 20, color: '#F59E0B', marginTop: 6 }}>
                  ⚠️ 与原报亩数相差 {areaDiff > 0 ? '+' : ''}{formatArea(areaDiff)} 亩
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
              <View className={styles.tipRow}>
                <Text className={styles.tipIcon}>💡</Text>
                <Text className={styles.tipText}>GPS 辅助作业：实际作业 02 小时 30 分</Text>
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>燃油费（可选）</Text>
            <View className={styles.formBody}>
              <View className={styles.inputBox}>
                <Text className={styles.inputPrefix}>¥</Text>
                <Input
                  type="digit"
                  style={{ flex: 1, fontSize: 28, color: '#111827' }}
                  value={String(form.fuelCost)}
                  onInput={(e: any) => setForm({ ...form, fuelCost: parseFloat(e.detail.value) || 0 })}
                />
                <Text className={styles.inputUnit}>元</Text>
              </View>
              <View className={styles.tipRow}>
                <Text className={styles.tipIcon}>⛽</Text>
                <Text className={styles.tipText}>
                  约耗油 {form.fuelCost > 0 ? Math.round(form.fuelCost / 7.6) : 0} 升（参考价 7.6 元/升）
                </Text>
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>备注说明</Text>
            <View className={styles.formBody}>
              <Textarea
                className={styles.textarea}
                placeholder="地块情况、作物状况、异常事件等"
                value={form.notes}
                onInput={(e: any) => setForm({ ...form, notes: e.detail.value || '' })}
              />
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>📸</Text>
            <Text className={styles.cardHeaderTitle}>作业照片（至少3张）</Text>
            <Text className={styles.cardHeaderTag} style={{ color: photos.length < 3 ? '#EF4444' : '#10B981' }}>
              {photos.length}/9
            </Text>
          </View>
          <View className={styles.photoGrid}>
            {photos.map((p, i) => (
              <View key={i} className={styles.photoItem}>
                <Text className={styles.photoIcon}>{p}</Text>
                <Text className={styles.photoRemove} onClick={() => removePhoto(i)}>×</Text>
              </View>
            ))}
            {photos.length < 9 && (
              <View className={classnames(styles.photoItem, styles.photoAdd)} onClick={addPhoto}>
                <Text className={styles.photoAddIcon}>+</Text>
                <Text className={styles.photoAddText}>上传照片</Text>
              </View>
            )}
          </View>
          <View className={styles.photoTipRow}>
            <Text className={styles.photoTip}>🌾 收割前全景</Text>
            <Text className={styles.photoTip}>� 作业中现场</Text>
            <Text className={styles.photoTip}>✅ 完成后合影</Text>
          </View>
        </View>

        <View className={classnames(styles.card, styles.debtCard)}>
          <View className={styles.debtTop}>
            <View>
              <Text className={styles.debtTitle}>💳 农户欠款登记</Text>
              <Text className={styles.debtSub}>资金周转困难时可标记，系统追踪还款</Text>
            </View>
            <View
              className={classnames(styles.switchBtn, form.hasDebt && styles.active)}
              onClick={() => setForm({ ...form, hasDebt: !form.hasDebt })}
            >
              <View className={classnames(styles.switchDot, form.hasDebt && styles.on)} />
            </View>
          </View>
          {form.hasDebt && (
            <View className={styles.debtBody}>
              <Text className={styles.formLabel}>欠款金额</Text>
              <View className={styles.inputBox}>
                <Text className={styles.inputPrefix}>¥</Text>
                <Input
                  type="digit"
                  style={{ flex: 1, fontSize: 28, color: '#111827' }}
                  value={String(form.debtAmount)}
                  onInput={(e: any) => setForm({ ...form, debtAmount: parseFloat(e.detail.value) || 0 })}
                />
                <Text className={styles.inputUnit}>元</Text>
              </View>
            </View>
          )}
        </View>

        <View className={classnames(styles.card, styles.previewCard)}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>💰</Text>
            <Text className={styles.cardHeaderTitle}>费用预览</Text>
          </View>
          <View className={styles.previewRow}>
            <Text className={styles.previewLabel}>基础作业费</Text>
            <Text className={styles.previewValue}>
              {formatArea(form.confirmedArea)} 亩 × ¥{unitPrice}/亩
            </Text>
            <Text className={styles.previewMoney}>{formatMoney(workFee)}</Text>
          </View>
          {form.fuelCost > 0 && (
            <View className={styles.previewRow}>
              <Text className={styles.previewLabel}>燃油费</Text>
              <Text className={styles.previewValue}>
                柴油 {Math.round(form.fuelCost / 7.6)} 升 × 7.6 元/升
              </Text>
              <Text className={styles.previewMoney}>{formatMoney(form.fuelCost)}</Text>
            </View>
          )}
          {form.hasDebt && form.debtAmount > 0 && (
            <View className={classnames(styles.previewRow, styles.debt)}>
              <Text className={styles.previewLabel}>农户欠款</Text>
              <Text className={styles.previewValue}>暂未支付</Text>
              <Text className={styles.previewMoney}>-{formatMoney(form.debtAmount)}</Text>
            </View>
          )}
          <View className={styles.previewTotalRow}>
            <Text className={styles.previewTotalLabel}>应收总额</Text>
            <Text className={styles.previewTotalMoney}>{formatMoney(totalPayable)}</Text>
          </View>
          {form.hasDebt && form.debtAmount > 0 && (
            <View className={styles.previewTotalRow}>
              <Text className={styles.previewTotalLabel}>本次实收</Text>
              <Text className={styles.previewTotalMoney} style={{ color: '#10B981' }}>
                {formatMoney(actualPaid)}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 160 }} />
      </View>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.save)} onClick={() => Taro.showToast({ title: '已保存草稿', icon: 'success' })}>
          <Text className={styles.btnText}>保存草稿</Text>
        </View>
        <View className={classnames(styles.btn, styles.submit)} onClick={submit}>
          <Text className={styles.btnText}>确认提交</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default WorkSubmitPage;
