import React, { useState } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

type NoticeType = 'urgent' | 'road' | 'drying';

const typeConfig: Record<NoticeType, { icon: string; name: string; desc: string; placeholders: { title: string; content: string } }> = {
  urgent: {
    icon: '🚨', name: '紧急通知', desc: '立即推送给所有农户',
    placeholders: {
      title: '例如：明日暴雨红色预警，紧急抢收通知',
      content: '请所有农户今日下午前完成可收割地块作业...'
    }
  },
  road: {
    icon: '🛣️', name: '道路通知', desc: '道路通行/施工信息',
    placeholders: {
      title: '例如：前进村南大桥施工，绕行通知',
      content: '5月28日前进村南大桥封闭施工，建议从东环路绕行...'
    }
  },
  drying: {
    icon: '☀️', name: '晾晒通知', desc: '晾晒场开放/变更信息',
    placeholders: {
      title: '例如：村部晾晒场今日开放，容量充足',
      content: '红星村部晾晒场今日全天开放，剩余容量 80 吨，按到场顺序使用...'
    }
  },
};

const NoticePublishPage: React.FC = () => {
  const [type, setType] = useState<NoticeType>('urgent');
  const [scope, setScope] = useState('全部村组');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const cfg = typeConfig[type];

  const submit = () => {
    if (!title.trim()) { Taro.showToast({ title: '请填写标题', icon: 'none' }); return; }
    if (!content.trim()) { Taro.showToast({ title: '请填写内容', icon: 'none' }); return; }
    console.log('[NoticePublish] 发布:', { type, scope, title, content });
    Taro.showLoading({ title: '发布中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '✅ 通知已发布', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1200);
    }, 800);
  };

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.content}>
        <View className={styles.typeGroup}>
          {(Object.keys(typeConfig) as NoticeType[]).map(t => (
            <View
              key={t}
              className={classnames(styles.typeCard, styles[t], type === t && styles.active)}
              onClick={() => setType(t)}
            >
              <Text className={styles.typeIcon}>{typeConfig[t].icon}</Text>
              <Text className={styles.typeName}>{typeConfig[t].name}</Text>
              <Text className={styles.typeDesc}>{typeConfig[t].desc}</Text>
            </View>
          ))}
        </View>

        {type === 'urgent' ? (
          <View className={styles.tipBox}>
            <Text className={styles.tipText}>
              ⚠️ 紧急通知将以弹窗形式推送给全部农户，协调员将同步收到短信提醒，请谨慎发布。
            </Text>
          </View>
        ) : null}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>✏️</Text>
            <Text className={styles.cardHeaderTitle}>通知内容</Text>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>通知范围</Text>
            <View className={styles.formBody}>
              <View className={styles.inputBox} onClick={() => Taro.showActionSheet({ itemList: ['全部村组', '红星村', '前进村', '光明村'] }).then(r => r.tapIndex !== undefined && setScope(['全部村组', '红星村', '前进村', '光明村'][r.tapIndex]))}>
                <Text className={styles.inputText}>{scope}</Text>
                <Text className={styles.arrowIcon}>›</Text>
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>通知标题</Text>
            <View className={styles.formBody}>
              <View className={styles.inputBox}>
                <Input
                  style={{ flex: 1, fontSize: 28, color: '#111827' }}
                  placeholder={cfg.placeholders.title}
                  value={title}
                  onInput={(e: any) => setTitle(e.detail.value)}
                  maxlength={40}
                />
              </View>
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>详细内容</Text>
            <View className={styles.formBody}>
              <View className={styles.textareaBox}>
                <Textarea
                  value={content}
                  onInput={(e: any) => setContent(e.detail.value)}
                  placeholder={cfg.placeholders.content}
                  style={{ width: '100%', minHeight: 220, fontSize: 26, lineHeight: 1.6 }}
                  maxlength={500}
                />
              </View>
              <Text style={{ fontSize: 20, color: '#9CA3AF', marginTop: 6 }}>{content.length}/500</Text>
            </View>
          </View>
        </View>

        <View className={styles.previewCard}>
          <Text className={styles.previewLabel}>📱 通知预览</Text>
          <View className={styles.previewTitleRow}>
            <View className={classnames(styles.previewTypeTag, styles[type])}>
              <Text>{cfg.icon} {cfg.name}</Text>
            </View>
          </View>
          <Text className={styles.previewTitle}>{title || '标题预览'}</Text>
          <Text className={styles.previewContent}>{content || '通知内容预览，填写后在此显示...'}</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.ghost)} onClick={() => Taro.navigateBack()}>
          <Text className={styles.btnText}>取消</Text>
        </View>
        <View className={classnames(styles.btn, styles.primary)} onClick={submit}>
          <Text className={styles.btnText}>📢 立即发布</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default NoticePublishPage;
