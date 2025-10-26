import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutDetails'>;

export default function WorkoutDetailsScreen({ route, navigation }: Props) {
  const { workout, date, dayName } = route.params;

  const getZoneColor = (zone: string) => {
    if (zone.includes('Z1') || zone.includes('Recovery')) return '#10b981';
    if (zone.includes('Z2') || zone.includes('Endurance')) return '#3b82f6';
    if (zone.includes('Z3') || zone.includes('Tempo')) return '#f59e0b';
    if (zone.includes('Z4') || zone.includes('Threshold')) return '#f97316';
    if (zone.includes('Z5') || zone.includes('VO2Max')) return '#ef4444';
    if (zone.includes('Z6') || zone.includes('Anaerobic')) return '#dc2626';
    return '#6b7280';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.date}>
            {new Date(date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Workout Title */}
        <View style={styles.titleCard}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={styles.metaValue}>{workout.type}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>TSS</Text>
              <Text style={styles.metaValue}>{workout.tss}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>{workout.duration} min</Text>
            </View>
          </View>
        </View>

        {/* Build Instructions */}
        {workout.buildInstructions && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How to Build This Workout</Text>
            <Text style={styles.instructions}>{workout.buildInstructions}</Text>
          </View>
        )}

        {/* Intervals */}
        {workout.intervals && workout.intervals.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Workout Structure</Text>
            {workout.intervals.map((interval: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.intervalCard,
                  { borderLeftColor: getZoneColor(interval.zone) },
                ]}
              >
                <View style={styles.intervalHeader}>
                  <Text style={styles.intervalName}>{interval.name}</Text>
                  <Text style={styles.intervalDuration}>
                    {interval.duration} min
                  </Text>
                </View>
                <View style={styles.intervalDetails}>
                  <View style={styles.intervalDetailRow}>
                    <Text style={styles.intervalDetailLabel}>Zone:</Text>
                    <Text
                      style={[
                        styles.intervalZone,
                        { color: getZoneColor(interval.zone) },
                      ]}
                    >
                      {interval.zone}
                    </Text>
                  </View>
                  <View style={styles.intervalDetailRow}>
                    <Text style={styles.intervalDetailLabel}>Power:</Text>
                    <Text style={styles.intervalDetailValue}>
                      {interval.power}
                    </Text>
                  </View>
                  {interval.cadence && (
                    <View style={styles.intervalDetailRow}>
                      <Text style={styles.intervalDetailLabel}>Cadence:</Text>
                      <Text style={styles.intervalDetailValue}>
                        {interval.cadence}
                      </Text>
                    </View>
                  )}
                </View>
                {interval.description && (
                  <Text style={styles.intervalDescription}>
                    {interval.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Export to Zwift</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Share Workout</Text>
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
  header: {
    marginBottom: 16,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#9ca3af',
  },
  titleCard: {
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
  workoutName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  intervalCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  intervalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  intervalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  intervalDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  intervalDetails: {
    marginBottom: 8,
  },
  intervalDetailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  intervalDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 70,
  },
  intervalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  intervalZone: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  intervalDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
