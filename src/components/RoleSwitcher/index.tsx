import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { UserRole } from '../../types';

export interface RoleSwitcherProps {
  currentRole: UserRole;
  onChange?: (role: UserRole) => void;
}

const roleList: { key: UserRole; label: string; icon: string; desc: string }[] = [
  { key: 'farmer', label: '农户', icon: '👨‍🌾', desc: '发布抢收需求' },
  { key: 'operator', label: '机手', icon: '🚜', desc: '接单作业' },
  { key: 'coordinator', label: '协调员', icon: '📋', desc: '调度管理' }
];

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onChange }) => {
  return (
    <View className={styles.switcher}>
      {roleList.map((role) => (
        <View
          key={role.key}
          className={classnames(
            styles.roleItem,
            currentRole === role.key && styles.active
          )}
          onClick={() => onChange?.(role.key)}
        >
          <Text className={styles.roleIcon}>{role.icon}</Text>
          <View className={styles.roleInfo}>
            <Text className={styles.roleLabel}>{role.label}</Text>
            <Text className={styles.roleDesc}>{role.desc}</Text>
          </View>
          {currentRole === role.key && (
            <View className={styles.checkMark}>
              <Text className={styles.checkIcon}>✓</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default RoleSwitcher;
