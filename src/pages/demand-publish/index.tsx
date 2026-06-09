import React, { useState } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockPlots } from '../../data/mockPlots';
import { MaturityLevel } from '../../types';

const maturityOptions: { key: MaturityLevel; label: string; cls: string }[] = [
  { key: 'immature', label: '未熟', cls: 'm1' },
  { key: 'nearly', label: '将熟', cls: 'm2' },
  { key: 'mature', label: '成熟', cls: 'm3' },
  { key: 'overripe', label: '过熟', cls: 'm4' },
];

const DemandPublishPage: React.FC = () => {
  const router = useRouter();
  const defaultPlot = router.params.plotId
    ? mockPlots.find(p => p.id === router.params.plotId)
    : mockPlots[0];

  const [form, setForm] = useState({
    plotId: defaultPlot?.id || 'plot01',
    area: defaultPlot?.area || 8.5,
    maturity: defaultPlot?.maturity || 'mature' as MaturityLevel,
    contactName: defaultPlot?.contactName || '张丰收',
    contactPhone: defaultPlot?.contactPhone || '13812345678',
    startTime: '今日',
    endTime: '3日内',
    address: defaultPlot?.address || '红星村一组东大田',
    remark: defaultPlot?.remark || '',
  });
  const [agreed, setAgreed] = useState(true);

  const submit = () => {
    if (!agreed) {
      Taro.showToast({ title: '请先阅读并同意协议', icon: 'none' });
      return;
    }
    console.log('[DemandPublish] 提交:', form);
    Taro.showLoading({ title: '提交中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '✅ 抢收需求已发起', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1200);
    }, 800);
  };

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.content}>
        <View className={styles.formCard}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🌾</Text>
            <Text className={styles.cardHeaderTitle}>地块信息</Text>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>选择地块</Text>
            <View className={styles.formValue}>
              <View className={styles.inputBox}>
                <Text className={styles.inputText}>{form.address}</Text>
                <Text className={styles.arrowIcon}>›</Text>
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>种植面积</Text>
            <View className={styles.formValue}>
              <View className={styles.inputBox}>
                <Input
                  type="digit"
                  className={styles.inputText}
                  value={String(form.area)}
                  onInput={(e: any) => setForm({ ...form, area: parseFloat(e.detail.value) || 0 })}
                />
                <Text style={{ color: '#6B7280', fontSize: 26 }}>亩</Text>
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>成熟度</Text>
            <View className={styles.formValue}>
              <View className={styles.maturityBar}>
                {maturityOptions.map(m => (
                  <View
                    key={m.key}
                    className={classnames(styles.maturityItem, styles[m.cls], form.maturity === m.key && styles.active)}
                    onClick={() => setForm({ ...form, maturity: m.key })}
                  >
                    <Text className={styles.maturityText}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>👤</Text>
            <Text className={styles.cardHeaderTitle}>联系人信息</Text>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>联系人</Text>
            <View className={styles.formValue}>
              <View className={styles.inputBox}>
                <Input
                  className={styles.inputText}
                  value={form.contactName}
                  onInput={(e: any) => setForm({ ...form, contactName: e.detail.value })}
                />
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>联系电话</Text>
            <View className={styles.formValue}>
              <View className={styles.inputBox}>
                <Input
                  type="number"
                  className={styles.inputText}
                  value={form.contactPhone}
                  onInput={(e: any) => setForm({ ...form, contactPhone: e.detail.value })}
                  maxlength={11}
                />
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>可进地时间</Text>
            <View className={styles.formValue}>
              <View className={styles.timeRange}>
                <View
                  className={classnames(styles.radioItem, form.startTime === '今日' && styles.active)}
                  onClick={() => setForm({ ...form, startTime: '今日' })}
                ><Text className={styles.radioText}>今日</Text></View>
                <View
                  className={classnames(styles.radioItem, form.startTime === '明日' && styles.active)}
                  onClick={() => setForm({ ...form, startTime: '明日' })}
                ><Text className={styles.radioText}>明日</Text></View>
                <View
                  className={classnames(styles.radioItem, form.startTime === '2日内' && styles.active)}
                  onClick={() => setForm({ ...form, startTime: '2日内' })}
                ><Text className={styles.radioText}>2日内</Text></View>
                <View
                  className={classnames(styles.radioItem, form.startTime === '3日内' && styles.active)}
                  onClick={() => setForm({ ...form, startTime: '3日内' })}
                ><Text className={styles.radioText}>3日内</Text></View>
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>备注说明</Text>
            <View className={styles.formValue}>
              <View className={styles.textareaBox}>
                <Textarea
                  className={styles.placeholderText}
                  value={form.remark}
                  onInput={(e: any) => setForm({ ...form, remark: e.detail.value })}
                  placeholder="如地块有障碍物、需要晾晒服务、特殊情况等，请在此说明"
                  maxlength={200}
                  style={{ width: '100%', minHeight: 140, fontSize: 26, lineHeight: 1.5 }}
                />
              </View>
            </View>
          </View>
        </View>

        <View className={classnames(styles.formCard, styles.summaryCard)}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>📋</Text>
            <Text className={styles.cardHeaderTitle}>需求预览</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>地块位置</Text>
            <Text className={styles.summaryValue}>{form.address}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>种植面积</Text>
            <Text className={classnames(styles.summaryValue, styles.highlight)}>{form.area} 亩</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>成熟度</Text>
            <Text className={styles.summaryValue}>{maturityOptions.find(m => m.key === form.maturity)?.label}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>可进地</Text>
            <Text className={styles.summaryValue}>{form.startTime}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>参考报价</Text>
            <Text className={classnames(styles.summaryValue, styles.highlight)}>约 ¥{(form.area * 80).toFixed(0)}</Text>
          </View>
        </View>

        <View className={styles.agreeRow}>
          <View
            className={classnames(styles.checkbox, agreed && styles.checked)}
            onClick={() => setAgreed(!agreed)}
          >
            {agreed && <Text className={styles.checkIcon}>✓</Text>}
          </View>
          <Text className={styles.agreeText}>
            我已阅读并同意<Text className={styles.agreeLink}>《小麦抢收服务协议》</Text>
            ，确认信息属实，愿意配合协调员调度安排。
          </Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.ghost)} onClick={() => Taro.navigateBack()}>
          <Text className={styles.btnText}>取消</Text>
        </View>
        <View className={classnames(styles.btn, styles.primary)} onClick={submit}>
          <Text className={styles.btnText}>🚀 发起抢收</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DemandPublishPage;
