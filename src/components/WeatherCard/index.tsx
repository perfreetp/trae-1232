import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { WeatherData } from '../../types';

export interface WeatherCardProps {
  weather: WeatherData;
  onClick?: () => void;
  compact?: boolean;
}

const riskLevelConfig = {
  none: { label: '无风险', color: 'riskNone' },
  low: { label: '低风险', color: 'riskLow' },
  medium: { label: '中风险', color: 'riskMedium' },
  high: { label: '高风险', color: 'riskHigh' }
};

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, onClick, compact = false }) => {
  const todayRisk = weather.daily[0]?.riskLevel || 'none';
  const risk = riskLevelConfig[todayRisk];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: '/pages/weather-detail/index' });
    }
  };

  if (compact) {
    return (
      <View className={styles.compactCard} onClick={handleClick}>
        <View className={styles.compactLeft}>
          <Text className={styles.compactIcon}>⛅</Text>
          <View>
            <Text className={styles.compactTemp}>{weather.current.temp}°</Text>
            <Text className={styles.compactLoc}>{weather.current.weather}</Text>
          </View>
        </View>
        <View className={styles.compactRight}>
          {weather.alerts.length > 0 && (
            <View className={classnames(styles.alertBadge, styles.riskHigh)}>
              <Text className={styles.alertText}>🚨 {weather.alerts[0].type}</Text>
            </View>
          )}
          {weather.daily.slice(1, 4).map((d, i) => (
            <View key={i} className={styles.miniDay}>
              <Text className={styles.miniDate}>{d.date.slice(3)}</Text>
              <Text className={styles.miniIcon}>{d.icon}</Text>
              <Text className={styles.miniTemp}>{d.tempHigh}°</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className={styles.weatherCard} onClick={handleClick}>
      <View className={styles.cardTop}>
        <View className={styles.location}>
          <Text className={styles.locIcon}>📍</Text>
          <Text className={styles.locText}>{weather.location}</Text>
        </View>
        <Text className={styles.updateTime}>更新 {weather.updateTime.slice(11)}</Text>
      </View>

      <View className={styles.mainWeather}>
        <Text className={styles.weatherIconLarge}>
          {weather.daily[0]?.icon || '☀️'}
        </Text>
        <View className={styles.tempBlock}>
          <Text className={styles.currentTemp}>{weather.current.temp}°</Text>
          <Text className={styles.weatherDesc}>{weather.current.weather}</Text>
        </View>
        <View className={styles.rangeBlock}>
          <Text className={styles.tempRange}>
            {weather.daily[0]?.tempLow}° ~ {weather.daily[0]?.tempHigh}°
          </Text>
          <View className={classnames(styles.riskBadge, styles[risk.color])}>
            <Text className={styles.riskText}>{risk.label}</Text>
          </View>
        </View>
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoCell}>
          <Text className={styles.infoCellIcon}>💧</Text>
          <Text className={styles.infoCellValue}>{weather.current.humidity}%</Text>
          <Text className={styles.infoCellLabel}>湿度</Text>
        </View>
        <View className={styles.infoDivider} />
        <View className={styles.infoCell}>
          <Text className={styles.infoCellIcon}>🌬️</Text>
          <Text className={styles.infoCellValue}>{weather.current.wind}{weather.current.windLevel}级</Text>
          <Text className={styles.infoCellLabel}>风力</Text>
        </View>
        <View className={styles.infoDivider} />
        <View className={styles.infoCell}>
          <Text className={styles.infoCellIcon}>☀️</Text>
          <Text className={styles.infoCellValue}>UV{weather.current.uvIndex}</Text>
          <Text className={styles.infoCellLabel}>紫外线</Text>
        </View>
        <View className={styles.infoDivider} />
        <View className={styles.infoCell}>
          <Text className={styles.infoCellIcon}>🌡️</Text>
          <Text className={styles.infoCellValue}>{weather.current.feelsLike}°</Text>
          <Text className={styles.infoCellLabel}>体感</Text>
        </View>
      </View>

      {weather.alerts.length > 0 && (
        <View className={styles.alertBox}>
          <Text className={styles.alertIcon}>🚨</Text>
          <View className={styles.alertContent}>
            <Text className={styles.alertTitle}>{weather.alerts[0].title}</Text>
            <Text className={styles.alertTime}>{weather.alerts[0].publishTime}</Text>
          </View>
          <Text className={styles.alertArrow}>›</Text>
        </View>
      )}

      <View className={styles.forecastRow}>
        {weather.daily.slice(1, 5).map((day, idx) => (
          <View key={idx} className={styles.forecastItem}>
            <Text className={styles.forecastWeekday}>{day.weekday}</Text>
            <Text className={styles.forecastIcon}>{day.icon}</Text>
            <Text className={styles.forecastTempLow}>{day.tempLow}°</Text>
            <View className={styles.forecastBar}>
              <View
                className={classnames(
                  styles.forecastBarFill,
                  day.riskLevel === 'high' && styles.barRisk
                )}
                style={{
                  height: `${Math.max(20, ((day.tempHigh - day.tempLow) / 20) * 100)}%`,
                  background: day.riskLevel === 'high'
                    ? 'linear-gradient(180deg, #EF4444, #F59E0B)'
                    : 'linear-gradient(180deg, #F59E0B, #FBBF24)'
                }}
              />
            </View>
            <Text className={styles.forecastTempHigh}>{day.tempHigh}°</Text>
          </View>
        ))}
      </View>

      <View className={styles.tipsBox}>
        <Text className={styles.tipsIcon}>💡</Text>
        <Text className={styles.tipsText}>
          {weather.tips[0] || '今日天气良好，适合麦收作业'}
        </Text>
      </View>
    </View>
  );
};

export default WeatherCard;
