import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FTPService } from '@timecrunchedathletes/shared';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [metrics, setMetrics] = React.useState<any>(null);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch metrics from API
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Mock data for now
  const mockMetrics = {
    ftp: 245,
    ctl: 62,
    atl: 58,
    tsb: 4,
    weeklyTSS: 320,
    weeklyHours: 6.5,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitle}>Here's your training overview</Text>
        </View>

        {/* FTP Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current FTP</Text>
          </View>
          <Text style={styles.ftpValue}>{mockMetrics.ftp}W</Text>
          <Text style={styles.cardSubtext}>Based on recent activities</Text>
        </View>

        {/* Training Load Cards */}
        <View style={styles.row}>
          <View style={[styles.smallCard, styles.cardMarginRight]}>
            <Text style={styles.smallCardLabel}>CTL (Fitness)</Text>
            <Text style={styles.smallCardValue}>{mockMetrics.ctl}</Text>
          </View>
          <View style={styles.smallCard}>
            <Text style={styles.smallCardLabel}>ATL (Fatigue)</Text>
            <Text style={styles.smallCardValue}>{mockMetrics.atl}</Text>
          </View>
        </View>

        {/* TSB Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Form (TSB)</Text>
          </View>
          <Text
            style={[
              styles.tsbValue,
              mockMetrics.tsb > 5
                ? styles.tsbPositive
                : mockMetrics.tsb < -10
                ? styles.tsbNegative
                : styles.tsbNeutral,
            ]}
          >
            {mockMetrics.tsb > 0 ? '+' : ''}
            {mockMetrics.tsb}
          </Text>
          <Text style={styles.cardSubtext}>
            {mockMetrics.tsb > 5
              ? 'Fresh - Ready for hard training'
              : mockMetrics.tsb < -10
              ? 'Fatigued - Consider recovery'
              : 'Optimal training zone'}
          </Text>
        </View>

        {/* This Week */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>This Week</Text>
          </View>
          <View style={styles.weekStats}>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>{mockMetrics.weeklyTSS}</Text>
              <Text style={styles.weekStatLabel}>TSS</Text>
            </View>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>
                {mockMetrics.weeklyHours.toFixed(1)}h
              </Text>
              <Text style={styles.weekStatLabel}>Training Time</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Plan This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
          >
            <Text style={styles.actionButtonTextSecondary}>Sync Strava</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ftpValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f97316',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardMarginRight: {
    marginRight: 8,
  },
  smallCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  smallCardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  tsbValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 4,
  },
  tsbPositive: {
    color: '#10b981',
  },
  tsbNegative: {
    color: '#ef4444',
  },
  tsbNeutral: {
    color: '#f59e0b',
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  weekStat: {
    alignItems: 'center',
  },
  weekStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  weekStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  actionButtonTextSecondary: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
