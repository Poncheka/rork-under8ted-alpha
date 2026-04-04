import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

interface GradientTextProps {
  text: string;
  size?: number;
  color?: string;
  style?: object;
}

export default React.memo(function GradientText({ text, size = 32, color = colors.acidYellow, style }: GradientTextProps) {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          { fontSize: size, color, lineHeight: size * 1.15 },
          style,
        ]}
        numberOfLines={2}
      >
        {text}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    fontWeight: '900' as const,
    letterSpacing: -1.5,
    textTransform: 'uppercase',
  },
});
