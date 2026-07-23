import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function Card({
  title,
  subtitle,
  value,
  onPress,
}: {
  title: string;
  subtitle?: string;
  value?: string | number;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {value !== undefined ? <Text style={styles.value}>{value}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

export function ListRow({
  title,
  subtitle,
  meta,
  onPress,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          placeholder={placeholder}
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholderTextColor={colors.textMuted}
        />
      </View>
    </View>
  );
}

export function ChipRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function OfflineBanner({ visible, cachedAt }: { visible: boolean; cachedAt?: number | null }) {
  if (!visible) return null;
  return (
    <View style={styles.offline}>
      <Text style={styles.offlineText}>
        نمایش از حافظهٔ آفلاین
        {cachedAt
          ? ` · ${new Intl.DateTimeFormat('fa-IR', { timeStyle: 'short' }).format(new Date(cachedAt))}`
          : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'right',
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    textAlign: 'right',
  },
  rowMeta: {
    color: colors.primary,
    fontSize: 12,
    marginRight: spacing.sm,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  inputWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    textAlign: 'right',
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  offline: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  offlineText: {
    color: colors.warning,
    fontSize: 12,
    textAlign: 'center',
  },
});
