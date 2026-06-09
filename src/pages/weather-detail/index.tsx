import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockWeather, mockDryingFields } from '../../data/mockWeather';

const WeatherDetailPage: React.FC = () => {
  const w = mockWeather;
  const riskLabel: Record<string, string> = { none: '无风险', low: '低风险', medium: '中风险', high: '高风险' };

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.hero}>
        <View className={styles.pattern} />
        <Text className={styles.location}>📍 {w.current.location}</Text>
        <Text className={styles.updateTime}>更新时间 {w.current.updateTime}</Text>
        <View className={styles.currentRow}>
          <View className={styles.currentLeft}>
            <Text className={styles.weatherIcon}>{w.current.icon}</Text>
            <Text className={styles.weatherDesc}>{w.current.description}</Text>
            <Text className={styles.tempRange}>{w.current.tempLow}°C ~ {w.current.tempHigh}°C</Text>
          </View>
          <View className={styles.tempWrap}>
            <Text className={styles.temp}>{w.current.temperature}</Text>
            <Text className={styles.tempUnit}>°C</Text>
          </View>
        </View>
        <View className={styles.riskRow}>
          <View className={styles.riskCard}>
            <Text className={styles.riskIcon}>⚠️</Text>
            <Text className={styles.riskLabel}>收割风险</Text>
            <Text className={classnames(styles.riskValue, styles[w.current.riskLevel])}>{riskLabel[w.current.riskLevel]}</Text>
          </View>
          <View className={styles.riskCard}>
            <Text className={styles.riskIcon}>💧</Text>
            <Text className={styles.riskLabel}>降雨概率</Text>
            <Text className={styles.riskValue}>{w.current.rainProb}%</Text>
          </View>
          <View className={styles.riskCard}>
            <Text className={styles.riskIcon}>🌿</Text>
            <Text className={styles.riskLabel}>晾晒指数</Text>
            <Text className={styles.riskValue}>{w.current.dryingIndex}</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {w.alerts?.map(a => (
          <View key={a.id} className={styles.warnCard}>
            <View className={styles.warnHeader}>
              <Text className={styles.warnIcon}>🚨</Text>
              <Text className={styles.warnTag}>{a.level}</Text>
              <Text className={styles.warnTitle}>{a.title}</Text>
            </View>
            <Text className={styles.warnContent}>{a.content}</Text>
          </View>
        ))}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>⏱️</Text>
            <Text className={styles.cardHeaderTitle}>小时预报</Text>
            <Text className={styles.cardHeaderMore}>今日 24h</Text>
          </View>
          <ScrollView className={styles.hourly} scrollX>
            {w.hourly.map((h, i) => (
              <View key={i} className={classnames(styles.hourItem, i === 2 && styles.active)}>
                <Text className={styles.hourTime}>{h.time}</Text>
                <Text className={styles.hourIcon}>{h.icon}</Text>
                <Text className={styles.hourTemp}>{h.temp}°</Text>
                <Text className={styles.hourRain}>{h.rainProb}%</Text>
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
              <Text className={styles.dayIcon}>{d.iconDay}</Text>
              <View className={styles.dayTemp}>
                <View className={styles.tempBar}>
                  <View className={styles.l} style={{ left: `${(d.tempLow - 10) * 3}%` }} />
                  <View className={styles.r} style={{ left: `${Math.min(90, (d.tempHigh - 10) * 3)}%` }} />
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
              <Text className={styles.infoDesc}>适合作业</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>💨</Text>
                <Text className={styles.infoLabel}>风力</Text>
              </View>
              <Text className={styles.infoValue}>{w.current.wind}</Text>
              <Text className={styles.infoDesc}>对作业无影响</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>☀️</Text>
                <Text className={styles.infoLabel}>紫外线</Text>
              </View>
              <Text className={styles.infoValue}>中等</Text>
              <Text className={styles.infoDesc}>建议佩戴遮阳帽</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>🌫️</Text>
                <Text className={styles.infoLabel}>能见度</Text>
              </View>
              <Text className={styles.infoValue}>良好</Text>
              <Text className={styles.infoDesc}>10km 以上</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>🌡️</Text>
                <Text className={styles.infoLabel}>体感温度</Text>
              </View>
              <Text className={styles.infoValue}>{w.current.temperature + 2}°C</Text>
              <Text className={styles.infoDesc}>注意防暑</Text>
            </View>
            <View className={styles.infoCell}>
              <View className={styles.infoRow}>
                <Text className={styles.infoIcon}>💨</Text>
                <Text className={styles.infoLabel}>空气质量</Text>
              </View>
              <Text className={styles.infoValue}>良 AQI 68</Text>
              <Text className={styles.infoDesc}>可正常作业</Text>
            </View>
          </View>
        </View>

        <View className={classnames(styles.card, styles.adviceCard)}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>🌱</Text>
            <Text className={styles.cardHeaderTitle}>农事建议</Text>
          </View>
          {w.farmingAdvice?.map((a, i) => (
            <View key={i} className={styles.adviceItem}>
              <View className={styles.adviceIcon}>{a.icon}</View>
              <View className={styles.adviceBody}>
                <Text className={styles.adviceTitle}>{a.title}</Text>
                <Text className={styles.adviceContent}>{a.content}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardHeaderIcon}>☀️</Text>
            <Text className={styles.cardHeaderTitle}>晾晒场状态</Text>
          </View>
          {mockDryingFields.map(y => (
            <View key={y.id} className={styles.dailyItem}>
              <View className={styles.dayLabel}>
                <Text className={styles.day1}>{y.name}</Text>
                <Text className={styles.day2}>容量 {y.capacity}吨</Text>
              </View>
              <View style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <View style={{
                  flex: 1, height: 16, background: '#E5E7EB', borderRadius: 8,
                  overflow: 'hidden', marginRight: 16
                }}>
                  <View style={{
                    height: '100%',
                    width: `${(y.used / y.capacity * 100).toFixed(0)}%`,
                    background: y.status === 'full' ? '#EF4444' : y.status === 'busy' ? '#F59E0B' : '#10B981',
                    borderRadius: 8,
                  }} />
                </View>
              </View>
              <Text style={{
                fontSize: 22, padding: '4rpx 12rpx', borderRadius: 8,
                background: y.status === 'full' ? 'rgba(239,68,68,0.12)' : y.status === 'busy' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                color: y.status === 'full' ? '#EF4444' : y.status === 'busy' ? '#F59E0B' : '#10B981',
                fontWeight: 600
              }}>
                {y.status === 'idle' ? '空闲' : y.status === 'busy' ? '紧张' : '已满'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default WeatherDetailPage;
