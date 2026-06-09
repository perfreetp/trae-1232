import React, { useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockWeather } from '../../data/mockWeather';
import { useAppStore } from '../../store/appStore';

const WeatherDetailPage: React.FC = () => {
  const w = mockWeather;
  const dryingFields = useAppStore(s => s.dryingFields);
  const refreshQueueRank = useAppStore(s => s.refreshQueueRank);

  useEffect(() => {
    refreshQueueRank();
  }, [refreshQueueRank]);

  const riskLabel: Record<string, string> = { none: '无风险', low: '低风险', medium: '中风险', high: '高风险' };
  const riskColor: Record<string, string> = { none: '#10B981', low: '#F59E0B', medium: '#F97316', high: '#EF4444' };
  const currentRisk = w.daily[0]?.riskLevel ?? 'none';
  const currentPrecip = w.daily[0]?.precipitation ?? 0;

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.hero}>
        <View className={styles.pattern} />
        <Text className={styles.location}>📍 {w.location}</Text>
        <Text className={styles.updateTime}>更新时间 {w.updateTime}</Text>
        <View className={styles.currentRow}>
          <View className={styles.currentLeft}>
            <Text className={styles.weatherIcon}>⛅</Text>
            <Text className={styles.weatherDesc}>{w.current.weather}</Text>
            <Text className={styles.tempRange}>{w.daily[0].tempLow}°C ~ {w.daily[0].tempHigh}°C</Text>
          </View>
          <View className={styles.tempWrap}>
            <Text className={styles.temp}>{w.current.temp}</Text>
            <Text className={styles.tempUnit}>°C</Text>
          </View>
        </View>
        <View className={styles.riskRow}>
          <View className={styles.riskCard}>
            <Text className={styles.riskIcon}>⚠️</Text>
            <Text className={styles.riskLabel}>收割风险</Text>
            <Text className={styles.riskValue} style={{ color: riskColor[currentRisk] }}>{riskLabel[currentRisk]}</Text>
          </View>
          <View className={styles.riskCard}>
            <Text className={styles.riskIcon}>💧</Text>
            <Text className={styles.riskLabel}>降雨概率</Text>
            <Text className={styles.riskValue}>{currentPrecip > 0 ? Math.min(90, currentPrecip + 20) : 10}%</Text>
          </View>
          <View className={styles.riskCard}>
            <Text className={styles.riskIcon}>🌿</Text>
            <Text className={styles.riskLabel}>晾晒指数</Text>
            <Text className={styles.riskValue}>{currentRisk === 'none' ? '优秀' : currentRisk === 'low' ? '良好' : currentRisk === 'medium' ? '一般' : '不宜'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {w.alerts && w.alerts.length > 0 && w.alerts.map(a => (
          <View key={a.id} className={styles.warnCard}>
            <View className={styles.warnHeader}>
              <Text className={styles.warnIcon}>🚨</Text>
              <Text className={styles.warnTag}>{a.level === 'blue' ? '蓝色' : a.level === 'yellow' ? '黄色' : a.level === 'orange' ? '橙色' : '红色'}</Text>
              <Text className={styles.warnTitle}>{a.title}</Text>
            </View>
            <Text className={styles.warnContent}>{a.content}</Text>
          </View>
        ))}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>⏱️</Text>
            <Text className={styles.cardHeaderTitle}>小时预报</Text>
            <Text className={styles.cardHeaderMore}>今日 {w.hourly.length}h</Text>
          </View>
          <ScrollView className={styles.hourly} scrollX>
            {w.hourly.map((h, i) => (
              <View key={i} className={classnames(styles.hourItem, i === 0 && styles.active)}>
                <Text className={styles.hourTime}>{h.time}</Text>
                <Text className={styles.hourIcon}>{h.weather.includes('晴') ? '☀️' : h.weather.includes('云') || h.weather.includes('多云') ? '⛅' : h.weather.includes('雨') ? '🌧️' : '🌤️'}</Text>
                <Text className={styles.hourTemp}>{h.temp}°</Text>
                <Text className={styles.hourRain}>{h.precipitation > 0 ? h.precipitation + 'mm' : '0%'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>📅</Text>
            <Text className={styles.cardHeaderTitle}>7 日预报</Text>
          </View>
          {w.daily.map((d, i) => (
            <View key={i} className={styles.dailyItem}>
              <View className={styles.dayLabel}>
                <Text className={styles.day1}>{i === 0 ? '今天' : i === 1 ? '明天' : d.weekday}</Text>
                <Text className={styles.day2}>{d.date}</Text>
              </View>
              <Text className={styles.dayIcon}>{d.icon}</Text>
              <View className={styles.dayTemp}>
                <View className={styles.tempBar}>
                  <View className={styles.l} style={{ left: `${Math.max(5, (d.tempLow - 15) * 4)}%` }} />
                  <View className={styles.r} style={{ left: `${Math.min(92, (d.tempHigh - 15) * 4)}%` }} />
                </View>
              </View>
              <Text className={styles.dayLow}>{d.tempLow}°</Text>
              <Text className={styles.dayHigh}>{d.tempHigh}°</Text>
            </View>
          ))}
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>📊</Text>
            <Text className={styles.cardHeaderTitle}>气象指数</Text>
          </View>
          <View className={styles.grid2}>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>💧</Text>
                <Text className={styles.infoLabel}>空气湿度</Text>
              </View>
              <Text className={styles.infoValue}>{w.current.humidity}%</Text>
              <Text className={styles.infoDesc}>{w.current.humidity < 60 ? '适合作业' : '湿度偏高'}</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>💨</Text>
                <Text className={styles.infoLabel}>风力风向</Text>
              </View>
              <Text className={styles.infoValue}>{w.current.wind} {w.current.windLevel}级</Text>
              <Text className={styles.infoDesc}>{w.current.windLevel <= 3 ? '对作业无影响' : '注意侧风作业'}</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>☀️</Text>
                <Text className={styles.infoLabel}>紫外线</Text>
              </View>
              <Text className={styles.infoValue}>{w.current.uvIndex >= 7 ? '强' : w.current.uvIndex >= 5 ? '中等' : '弱'}</Text>
              <Text className={styles.infoDesc}>UV {w.current.uvIndex}</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>🌫️</Text>
                <Text className={styles.infoLabel}>能见度</Text>
              </View>
              <Text className={styles.infoValue}>{w.current.visibility >= 10 ? '良好' : '一般'}</Text>
              <Text className={styles.infoDesc}>{w.current.visibility}km</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>🌡️</Text>
                <Text className={styles.infoLabel}>体感温度</Text>
              </View>
              <Text className={styles.infoValue}>{w.current.feelsLike}°C</Text>
              <Text className={styles.infoDesc}>{w.current.feelsLike >= 33 ? '注意防暑' : '舒适'}</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>🏭</Text>
                <Text className={styles.infoLabel}>空气质量</Text>
              </View>
              <Text className={styles.infoValue}>良</Text>
              <Text className={styles.infoDesc}>可正常作业</Text>
            </View>
          </View>
        </View>

        <View className={classnames(styles.card, styles.adviceCard)}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🌱</Text>
            <Text className={styles.cardHeaderTitle}>农事建议</Text>
          </View>
          {w.tips.map((tip, i) => (
            <View key={i} className={styles.adviceItem}>
              <View className={styles.adviceIcon}>{i === 0 ? '🌾' : i === 1 ? '☀️' : i === 2 ? '⚠️' : '💡'}</View>
              <View className={styles.adviceBody}>
                <Text className={styles.adviceTitle}>{i === 0 ? '抢收建议' : i === 1 ? '晾晒建议' : i === 2 ? '安全提醒' : '优先提示'}</Text>
                <Text className={styles.adviceContent}>{tip}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>☀️</Text>
            <Text className={styles.cardHeaderTitle}>晾晒场状态</Text>
          </View>
          {dryingFields.map(y => {
            const used = y.capacity - y.available;
            const percent = Math.round(used / y.capacity * 100);
            const statusText = y.status === 'available' ? '空闲' : y.status === 'partial' ? '紧张' : '已满';
            const statusColor = y.status === 'available' ? '#10B981' : y.status === 'partial' ? '#F59E0B' : '#EF4444';
            return (
              <View key={y.id} className={styles.dailyItem}>
                <View className={styles.dayLabel}>
                  <Text className={styles.day1}>{y.name}</Text>
                  <Text className={styles.day2}>容量 {y.capacity}吨 · 联系人 {y.contact}</Text>
                </View>
                <View style={{ flex: 1, display: 'flex', alignItems: 'center', marginRight: 16 }}>
                  <View style={{
                    flex: 1, height: 16, background: '#E5E7EB', borderRadius: 8,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: statusColor,
                      borderRadius: 8,
                    }} />
                  </View>
                </View>
                <Text style={{
                  fontSize: 22, padding: '4rpx 12rpx', borderRadius: 8,
                  background: `rgba(${y.status === 'available' ? '16,185,129' : y.status === 'partial' ? '245,158,11' : '239,68,68'},0.12)`,
                  color: statusColor,
                  fontWeight: 600,
                  marginLeft: 12,
                }}>
                  {statusText}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default WeatherDetailPage;
