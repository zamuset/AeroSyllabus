import { ReactNode, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleProp, ViewStyle } from 'react-native';

const ENTER_MS = 200;
const SHIFT = 6;
const nativeDriver = Platform.OS !== 'web';

function prefersReducedMotion() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    let active = true;
    const apply = (value: boolean) => {
      if (active) {
        setReduced(value);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      apply(media.matches);
      const onChange = () => apply(media.matches);
      media.addEventListener('change', onChange);
      return () => {
        active = false;
        media.removeEventListener('change', onChange);
      };
    }

    AccessibilityInfo.isReduceMotionEnabled().then(apply).catch(() => apply(false));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', apply);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

export function SoftEnter({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const shift = useRef(new Animated.Value(reduced ? 0 : SHIFT)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      shift.setValue(0);
      return;
    }
    opacity.setValue(0);
    shift.setValue(SHIFT);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(shift, {
        toValue: 0,
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nativeDriver,
      }),
    ]).start();
  }, [opacity, reduced, shift]);

  return (
    <Animated.View style={[style, { flex: 1, opacity, transform: [{ translateY: shift }] }]}>{children}</Animated.View>
  );
}

export function FadePresence({
  visible,
  children,
  style,
}: {
  visible: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(visible);

  if (visible && !shown) {
    setShown(true);
  }

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: reduced ? 0 : visible ? 160 : 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) {
        setShown(false);
      }
    });
    return () => animation.stop();
  }, [opacity, reduced, visible]);

  if (!shown) {
    return null;
  }

  return (
    <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[style, { opacity }]}>
      {children}
    </Animated.View>
  );
}
