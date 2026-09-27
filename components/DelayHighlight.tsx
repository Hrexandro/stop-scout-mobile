import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { getDelayDisplayInfo } from "../src/domain/utils/delayFormatter";

interface DelayHighlightProps {
  delayInSeconds: number | null | undefined;
}

export default function DelayHighlight({
  delayInSeconds,
}: DelayHighlightProps) {
  const delayInfo = getDelayDisplayInfo(delayInSeconds);

  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!delayInfo.shouldAnimate) {
      opacity.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delayInfo.shouldAnimate, opacity]);

  return (
    <Animated.Text
      style={[
        styles.text,
        delayInfo.severity === "ON_TIME" && styles.onTime,
        delayInfo.severity === "MINOR" && styles.minor,
        delayInfo.severity === "MAJOR" && styles.major,
        { opacity },
      ]}
    >
      {delayInfo.formattedText}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
  },

  onTime: {
    color: "green",
  },

  minor: {
    color: "#CA8A04",
  },

  major: {
    color: "red",
    fontWeight: "bold",
  },
});
