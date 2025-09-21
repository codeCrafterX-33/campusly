import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const SkeletonBox = ({ width, height, borderRadius = 4, style = {} }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#333",
          opacity,
        },
        style,
      ]}
    />
  );
};

const ProfileSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Cover Photo */}
      <SkeletonBox width="100%" height={hp(25)} borderRadius={0} />

      {/* Profile Picture & Name */}
      <View style={styles.profileSection}>
        <SkeletonBox width={80} height={80} borderRadius={40} />
        <View style={styles.nameContainer}>
          <View style={styles.mb6}>
            <SkeletonBox width={120} height={18} />
          </View>
          <SkeletonBox width={180} height={14} />
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bioBlock}>
        <View style={styles.mb6}>
          <SkeletonBox width="100%" height={12} />
        </View>
        <View style={styles.mb6}>
          <SkeletonBox width="100%" height={12} />
        </View>
        <SkeletonBox width="100%" height={12} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[...Array(3)].map((_, i) => (
          <SkeletonBox key={i} width={100} height={40} borderRadius={10} />
        ))}
      </View>

      {/* About */}
      <View style={styles.mv14}>
        <SkeletonBox width={140} height={18} />
      </View>
      <View style={styles.mb6}>
        <SkeletonBox width="100%" height={12} />
      </View>
      <View style={styles.mb6}>
        <SkeletonBox width="100%" height={12} />
      </View>
      <SkeletonBox width="100%" height={12} />

      {/* Skills */}
      <View style={styles.mv14}>
        <SkeletonBox width={140} height={18} />
      </View>
      <View style={styles.skillsRow}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={styles.skillMargin}>
            <SkeletonBox width={60} height={24} borderRadius={20} />
          </View>
        ))}
      </View>

      {/* Activity */}
      <View style={styles.mv14}>
        <SkeletonBox width={140} height={18} />
      </View>
      <View style={styles.mb12}>
        <SkeletonBox width="100%" height={hp(10)} borderRadius={12} />
      </View>
      <SkeletonBox width="100%" height={hp(10)} borderRadius={12} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -hp(7),
    marginBottom: 12,
  },
  nameContainer: {
    marginLeft: 12,
  },
  bioBlock: {
    marginVertical: 10,
  },
  mb6: {
    marginBottom: 6,
  },
  mb12: {
    marginBottom: 12,
  },
  mv14: {
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 14,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  skillMargin: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default ProfileSkeleton;
