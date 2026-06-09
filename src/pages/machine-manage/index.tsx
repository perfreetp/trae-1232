import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockMachines } from '../../data/mockMachines';
import { MachineStatus } from '../../types';
import MachineCard from '../../components/MachineCard';

const filters = [
  { key: 'all', label: '全部' },
  { key: 'idle', label: '空闲' },
  { key: 'working', label: '作业中' },
  { key: 'maintenance', label: '维修中' },
];

const MachineManagePage: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? mockMachines
    : mockMachines.filter(m => m.status === filter);

  const idle = mockMachines.filter(m => m.status === 'idle').length;
  const working = mockMachines.filter(m => m.status === 'working').length;
  const total = mockMachines.reduce((s, m) => s + m.dailyCapacity, 0);

  return (
    <ScrollView className={styles.pageWrap} scrollY>
      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statsPattern} />
          <View className={styles.statsRow}>
            <View className={styles.statsCell}>
              <Text className={styles.statsNum}>{mockMachines.length}</Text>
              <Text className={styles.statsUnit}>台</Text>
              <Text className={styles.statsLabel}>收割机</Text>
            </View>
            <View className={styles.statsCell}>
              <Text className={styles.statsNum}>{idle}</Text>
              <Text className={styles.statsUnit}>台</Text>
              <Text className={styles.statsLabel}>空闲</Text>
            </View>
            <View className={styles.statsCell}>
              <Text className={styles.statsNum}>{total}</Text>
              <Text className={styles.statsUnit}>亩/天</Text>
              <Text className={styles.statsLabel}>日产能</Text>
            </View>
          </View>
        </View>

        <View className={styles.headerRow}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🚜</Text>
            <Text>我的车队</Text>
          </View>
          <View
            className={styles.addBtn}
            onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}
          >
            <Text className={styles.addBtnText}>+ 添加</Text>
          </View>
        </View>

        <ScrollView className={styles.filterBar} scrollX>
          {filters.map(f => (
            <View
              key={f.key}
              className={classnames(styles.filterItem, filter === f.key && styles.active)}
              onClick={() => setFilter(f.key)}
            >
              <Text className={styles.filterText}>
                {f.label}
                {f.key === 'all' && ` ${mockMachines.length}`}
                {f.key === 'idle' && ` ${idle}`}
                {f.key === 'working' && ` ${working}`}
              </Text>
            </View>
          ))}
        </ScrollView>

        {filtered.map(m => (
          <MachineCard
            key={m.id}
            machine={m}
            onDispatch={() => Taro.showToast({ title: `调度 ${m.name}`, icon: 'none' })}
          />
        ))}
      </View>

      <View
        className={styles.fabBtn}
        onClick={() => Taro.showToast({ title: '添加收割机', icon: 'none' })}
      >
        <Text className={styles.fabIcon}>＋</Text>
      </View>
    </ScrollView>
  );
};

export default MachineManagePage;
