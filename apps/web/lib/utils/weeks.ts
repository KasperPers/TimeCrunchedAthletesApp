export function getWeekStart(date: Date = new Date()): Date {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

export function getNextWeekStarts(count: number = 4): Date[] {
  const weeks: Date[] = [];
  const currentWeekStart = getWeekStart();

  for (let i = 0; i < count; i++) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + i * 7);
    weeks.push(weekStart);
  }

  return weeks;
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

export function isCurrentWeek(weekStart: Date): boolean {
  const currentWeekStart = getWeekStart();
  return weekStart.getTime() === currentWeekStart.getTime();
}

export function getWeekLabel(weekStart: Date): string {
  if (isCurrentWeek(weekStart)) {
    return 'This Week';
  }

  const currentWeekStart = getWeekStart();
  const diffInWeeks = Math.round(
    (weekStart.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  if (diffInWeeks === 1) return 'Next Week';
  if (diffInWeeks > 1) return `Week ${diffInWeeks + 1}`;

  return formatWeekRange(weekStart);
}
