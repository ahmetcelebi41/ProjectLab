import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { border, colors, radius, sizing, spacing } from '@/theme/tokens';
import type { ActivityEvent } from '@/types';

import {
  formatActivityDateTime,
  getActivityPresentation,
  groupActivityEvents,
  sortActivityEvents,
} from './activityPresentation';

type Props = Readonly<{
  emptyMessage?: string;
  events: readonly ActivityEvent[];
  grouped?: boolean;
  limit?: number;
  now?: number;
}>;

function ActivityRow({ event }: { event: ActivityEvent }) {
  const activity = getActivityPresentation(event);
  const href = activity.href;
  const content = (
    <Card style={styles.rowCard}>
      <View accessibilityElementsHidden importantForAccessibility="no" style={styles.icon}>
        <Typography color="primary" variant="button">{activity.icon}</Typography>
      </View>
      <View style={styles.copy}>
        <Typography color="textSecondary" variant="caption">{activity.typeLabel.toUpperCase()}</Typography>
        <Typography variant="button">{activity.title}</Typography>
        <Typography color="textSecondary">{activity.entityName}</Typography>
        {activity.detail ? <Typography color="textMuted" variant="small">{activity.detail}</Typography> : null}
        <Typography color="textMuted" variant="caption">
          {formatActivityDateTime(event.timestamp)}
        </Typography>
      </View>
      {activity.href ? (
        <Typography accessibilityElementsHidden color="primary" importantForAccessibility="no" variant="h4">→</Typography>
      ) : null}
    </Card>
  );

  if (!href) return content;

  return (
    <Pressable
      accessibilityHint="İlgili içeriği açar"
      accessibilityLabel={`${activity.title}, ${activity.entityName}`}
      accessibilityRole="link"
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function ActivityList({
  emptyMessage = 'Henüz aktivite kaydı yok.',
  events,
  grouped = false,
  limit,
  now,
}: Props) {
  const visibleEvents = sortActivityEvents(events).slice(0, limit);

  if (visibleEvents.length === 0) {
    return (
      <Card accessibilityLiveRegion="polite" style={styles.emptyCard}>
        <Typography accessibilityRole="header" variant="h4">Henüz aktivite yok</Typography>
        <Typography color="textSecondary">{emptyMessage}</Typography>
      </Card>
    );
  }

  if (!grouped) {
    return <View style={styles.list}>{visibleEvents.map((event) => <ActivityRow event={event} key={event.id} />)}</View>;
  }

  return (
    <View style={styles.groups}>
      {groupActivityEvents(visibleEvents, now).map((group) => (
        <View key={group.label} style={styles.group}>
          <Typography accessibilityRole="header" color="textSecondary" variant="h4">{group.label}</Typography>
          <View style={styles.list}>
            {group.events.map((event) => <ActivityRow event={event} key={event.id} />)}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groups: { gap: spacing.xl },
  group: { gap: spacing.sm },
  list: { gap: spacing.sm },
  pressable: { borderRadius: radius.card },
  pressed: { opacity: 0.8 },
  rowCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizing.touchTarget.minHeight,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: border.width,
    height: spacing.xxxxl,
    justifyContent: 'center',
    width: spacing.xxxxl,
  },
  copy: { flex: 1, gap: spacing.xxs },
  emptyCard: { gap: spacing.xs, padding: spacing.xl },
});
