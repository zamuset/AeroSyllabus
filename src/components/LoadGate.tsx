import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/theme';

type LoadContextValue = {
  run: (action?: () => void | Promise<void>) => Promise<void>;
};

const LoadContext = createContext<LoadContextValue | null>(null);

export function LoadProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const running = useRef(false);

  const run = useCallback(async (action?: () => void | Promise<void>) => {
    if (running.current) {
      return;
    }
    running.current = true;
    setVisible(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      await action?.();
    } finally {
      setVisible(false);
      running.current = false;
    }
  }, []);

  return (
    <LoadContext.Provider value={{ run }}>
      <View style={styles.host}>
        {children}
        {visible ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.white} size="large" />
            <Text style={styles.caption}>Cargando</Text>
          </View>
        ) : null}
      </View>
    </LoadContext.Provider>
  );
}

export function SimulatedPressable({ onPress, disabled, ...rest }: PressableProps) {
  const load = useContext(LoadContext);
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={(event) => {
        const action = () => {
          onPress?.(event);
        };
        if (!load) {
          action();
          return;
        }
        void load.run(action);
      }}
    />
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(11, 28, 44, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 20,
  },
  caption: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
