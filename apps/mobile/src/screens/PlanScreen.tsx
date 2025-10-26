import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DaySession {
  dayOfWeek: number;
  date: Date;
  duration?: number;
  hasWorkout: boolean;
  workout?: {
    name: string;
    type: string;
    tss: number;
    intervals?: any[];
    buildInstructions?: string;
  };
}

export default function PlanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [sessions, setSessions] = useState<DaySession[]>([]);
  const [selectedDay, setSelectedDay] = useState<DaySession | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [duration, setDuration] = useState('60');

  // Initialize week
  React.useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekDays: DaySession[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDays.push({
        dayOfWeek: i + 1,
        date,
        hasWorkout: false,
      });
    }
    setSessions(weekDays);
  }, []);

  const handleDayPress = (day: DaySession) => {
    if (day.hasWorkout && day.workout) {
      navigation.navigate('WorkoutDetails', {
        workout: {
          ...day.workout,
          duration: day.duration || 0,
        },
        date: day.date,
        dayName: DAYS[day.dayOfWeek - 1],
      });
    } else {
      setSelectedDay(day);
      setDuration(day.duration?.toString() || '60');
      setModalVisible(true);
    }
  };

  const handleSaveSession = () => {
    if (!selectedDay) return;

    const updatedSessions = sessions.map((s) =>
      s.date.getTime() === selectedDay.date.getTime()
        ? { ...s, duration: parseInt(duration), hasWorkout: parseInt(duration) > 0 }
        : s
    );

    setSessions(updatedSessions);
    setModalVisible(false);
    setSelectedDay(null);
  };

  const handleRemoveSession = () => {
    if (!selectedDay) return;

    const updatedSessions = sessions.map((s) =>
      s.date.getTime() === selectedDay.date.getTime()
        ? { ...s, duration: undefined, hasWorkout: false, workout: undefined }
        : s
    );

    setSessions(updatedSessions);
    setModalVisible(false);
    setSelectedDay(null);
  };

  const totalSessions = sessions.filter((s) => s.hasWorkout).length;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plan Your Training</Text>
          <Text style={styles.headerSubtitle}>
            Current week • {totalSessions} sessions • {totalDuration} min
          </Text>
        </View>

        {/* Week Grid */}
        <View style={styles.weekGrid}>
          {sessions.map((day, index) => (
            <TouchableOpacity
              key={day.date.toISOString()}
              style={[
                styles.dayCard,
                isToday(day.date) && styles.dayCardToday,
                day.hasWorkout && styles.dayCardWithWorkout,
              ]}
              onPress={() => handleDayPress(day)}
            >
              <Text style={styles.dayShort}>{DAYS_SHORT[index]}</Text>
              <Text style={styles.dayDate}>{day.date.getDate()}</Text>
              {day.hasWorkout ? (
                <View style={styles.workoutIndicator}>
                  {day.workout ? (
                    <Text style={styles.workoutName} numberOfLines={2}>
                      {day.workout.name}
                    </Text>
                  ) : (
                    <Text style={styles.duration}>{day.duration} min</Text>
                  )}
                </View>
              ) : (
                <Text style={styles.restDay}>Rest</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Workouts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Reset Week</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Session Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedDay ? DAYS[selectedDay.dayOfWeek - 1] : ''}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedDay?.date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Session Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                placeholder="60"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleSaveSession}
              >
                <Text style={styles.modalPrimaryButtonText}>Save</Text>
              </TouchableOpacity>
              {selectedDay?.hasWorkout && (
                <TouchableOpacity
                  style={styles.modalDangerButton}
                  onPress={handleRemoveSession}
                >
                  <Text style={styles.modalDangerButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  weekGrid: {
    padding: 16,
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  dayCardToday: {
    borderColor: '#f97316',
  },
  dayCardWithWorkout: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  dayShort: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  workoutIndicator: {
    marginTop: 4,
  },
  workoutName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  restDay: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    gap: 12,
  },
  modalPrimaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDangerButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalDangerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  modalSecondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
