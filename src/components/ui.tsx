import { ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';

import { SimulatedPressable } from './LoadGate';

import { imageSources } from '../data/images';
import { ImageKey } from '../data/types';
import { PillTone } from '../data/labels';
import { colors } from '../theme/theme';

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  if (!scroll) {
    return (
      <View style={styles.fill}>
        <View style={[styles.inner, styles.innerFill]}>{children}</View>
      </View>
    );
  }
  return (
    <ScrollView style={styles.fill} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

export function ScreenHeader({
  kicker,
  title,
  subtitle,
  back,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  return (
    <View style={styles.header}>
      {back ? (
        <SimulatedPressable
          accessibilityRole="button"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/inicio');
            }
          }}
          style={styles.back}
        >
          <Text style={styles.backText}>Volver</Text>
        </SimulatedPressable>
      ) : null}
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: PillTone }) {
  return (
    <View style={[styles.pill, pillTones[tone].box]}>
      <Text style={[styles.pillText, pillTones[tone].text]}>{label}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}) {
  return (
    <SimulatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, buttonVariants[variant], disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.buttonText, variant !== 'primary' && styles.buttonTextDark]}>{label}</Text>
    </SimulatedPressable>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const width = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` as `${number}%`;
  return (
    <View style={styles.track}>
      <View style={[styles.fillBar, { width }]} />
    </View>
  );
}

export function ImageSlot({
  imageKey,
  label,
  aspectRatio = 16 / 9,
  fit = 'cover',
  height,
}: {
  imageKey: ImageKey;
  label: string;
  aspectRatio?: number;
  fit?: 'cover' | 'contain';
  height?: number;
}) {
  const frame = height ? { height, width: '100%' as const } : { aspectRatio };
  const source = imageSources[imageKey];
  if (source) {
    return <Image source={source} style={[styles.image, frame]} resizeMode={fit} />;
  }
  return (
    <View style={[styles.slot, frame]}>
      <Text style={styles.slotKicker}>Imagen pendiente</Text>
      <Text style={styles.slotLabel}>{label}</Text>
      <Text style={styles.slotPath}>assets/images/{imageKey}</Text>
    </View>
  );
}

const pillTones: Record<PillTone, { box: ViewStyle; text: { color: string } }> = {
  neutral: { box: { backgroundColor: colors.canvas }, text: { color: colors.ink } },
  info: { box: { backgroundColor: colors.blueSoft }, text: { color: colors.blue } },
  ok: { box: { backgroundColor: colors.greenSoft }, text: { color: colors.green } },
  warn: { box: { backgroundColor: colors.amberSoft }, text: { color: colors.amber } },
  danger: { box: { backgroundColor: colors.redSoft }, text: { color: colors.red } },
};

const buttonVariants: Record<'primary' | 'secondary' | 'ghost', ViewStyle> = {
  primary: { backgroundColor: colors.navy },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  ghost: { backgroundColor: 'transparent' },
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: 40 },
  inner: { width: '100%', maxWidth: 1040, alignSelf: 'center', padding: 24, gap: 16 },
  innerFill: { flex: 1 },
  header: { gap: 6 },
  back: { alignSelf: 'flex-start', marginBottom: 4 },
  backText: { color: colors.blue, fontSize: 15, fontWeight: '600' },
  kicker: { color: colors.amber, fontSize: 13, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 32, fontWeight: '700', letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 10,
  },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 12, fontWeight: '700' },
  button: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  buttonTextDark: { color: colors.ink },
  track: { height: 8, borderRadius: 999, backgroundColor: '#E1E7ED', overflow: 'hidden' },
  fillBar: { height: 8, backgroundColor: colors.navy },
  image: { width: '100%', borderRadius: 12, backgroundColor: colors.canvas },
  slot: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B7C3CE',
    backgroundColor: '#F7F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 4,
  },
  slotKicker: { color: colors.amber, fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  slotLabel: { color: colors.ink, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  slotPath: { color: colors.muted, fontSize: 12, textAlign: 'center' },
});
