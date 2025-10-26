import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch progress data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Mock data
  const mockData = {
    currentFTP: 245,
    ftpChange: '+5W',
    ftpTrend: 'up',
    projectedFTP4Week: 252,
    projectedFTP6Week: 258,
    currentCTL: 62,
    projectedCTL4Week: 68,
    projectedCTL6Week: 72,
    recentActivities: [
      { date: '2024-01-20', tss: 85, type: 'Interval', duration: 90 },
      { date: '2024-01-18', tss: 45, type: 'Recovery', duration: 60 },
      { date: '2024-01-16', tss: 78, type: 'Endurance', duration: 120 },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* FTP Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current FTP</Text>
          <View style={styles.ftpRow}>
            <Text style={styles.ftpValue}>{mockData.currentFTP}W</Text>
            <View
              style={[
                styles.changeBadge,
                mockData.ftpTrend === 'up'
                  ? styles.changeBadgePositive
                  : styles.changeBadgeNegative,
              ]}
            >
              <Text
                style={[
                  styles.changeText,
                  mockData.ftpTrend === 'up'
                    ? styles.changeTextPositive
                    : styles.changeTextNegative,
                ]}
              >
                {mockData.ftpChange}
              </Text>
            </View>
          </View>
          <Text style={styles.cardSubtext}>vs last month</Text>
        </View>

        {/* Projections */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>4-6 Week Projections</Text>

          <View style={styles.projectionSection}>
            <Text style={styles.projectionLabel}>FTP Projection</Text>
            <View style={styles.projectionRow}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionPeriod}>4 weeks</Text>
                <Text style={styles.projectionValue}>
                  {mockData.projectedFTP4Week}W
                </Text>
              </View>
              <View style={styles.projectionDivider} />
              <View style={styles.projectionItem}>
                <Text style={styles.projectionPeriod}>6 weeks</Text>
                <Text style={styles.projectionValue}>
                  {mockData.projectedFTP6Week}W
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.projectionSection}>
            <Text style={styles.projectionLabel}>Fitness (CTL) Projection</Text>
            <View style={styles.projectionRow}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionPeriod}>4 weeks</Text>
                <Text style={styles.projectionValue}>
                  {mockData.projectedCTL4Week}
                </Text>
              </View>
              <View style={styles.projectionDivider} />
              <View style={styles.projectionItem}>
                <Text style={styles.projectionPeriod}>6 weeks</Text>
                <Text style={styles.projectionValue}>
                  {mockData.projectedCTL6Week}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.projectionNote}>
            Based on your current training plan and consistency
          </Text>
        </View>

        {/* Training Load */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Training Load</Text>
          <View style={styles.loadRow}>
            <View style={styles.loadItem}>
              <Text style={styles.loadValue}>{mockData.currentCTL}</Text>
              <Text style={styles.loadLabel}>Fitness (CTL)</Text>
            </View>
            <View style={styles.loadDivider} />
            <View style={styles.loadItem}>
              <Text style={styles.loadValue}>58</Text>
              <Text style={styles.loadLabel}>Fatigue (ATL)</Text>
            </View>
            <View style={styles.loadDivider} />
            <View style={styles.loadItem}>
              <Text style={[styles.loadValue, styles.loadValuePositive]}>+4</Text>
              <Text style={styles.loadLabel}>Form (TSB)</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activities</Text>
          {mockData.recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityType}>{activity.type}</Text>
                <Text style={styles.activityDate}>
                  {new Date(activity.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.activityStats}>
                <View style={styles.activityStat}>
                  <Text style={styles.activityStatLabel}>TSS</Text>
                  <Text style={styles.activityStatValue}>{activity.tss}</Text>
                </View>
                <View style={styles.activityStat}>
                  <Text style={styles.activityStatLabel}>Duration</Text>
                  <Text style={styles.activityStatValue}>
                    {activity.duration}min
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Sync with Strava</Text>
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
    paddingBottom: 32,
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  ftpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ftpValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f97316',
    marginRight: 12,
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeBadgePositive: {
    backgroundColor: '#d1fae5',
  },
  changeBadgeNegative: {
    backgroundColor: '#fee2e2',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  changeTextPositive: {
    color: '#059669',
  },
  changeTextNegative: {
    color: '#dc2626',
  },
  projectionSection: {
    marginBottom: 16,
  },
  projectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  projectionRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  projectionItem: {
    flex: 1,
    alignItems: 'center',
  },
  projectionDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  projectionPeriod: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  projectionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  projectionNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadItem: {
    flex: 1,
    alignItems: 'center',
  },
  loadDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  loadValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  loadValuePositive: {
    color: '#10b981',
  },
  loadLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  activityDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityStats: {
    flexDirection: 'row',
    gap: 16,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  actions: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
