import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "moti/skeleton";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const ProfileSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Cover Photo */}
      <Skeleton width="100%" height={hp(25)} radius={0} colorMode="dark" />

      {/* Profile Picture & Name */}
      <View style={styles.profileSection}>
        <Skeleton width={80} height={80} radius="round" colorMode="dark" />
        <View style={styles.nameContainer}>
          <View style={styles.mb6}>
            <Skeleton width={120} height={18} radius={4} colorMode="dark" />
          </View>
          <Skeleton width={180} height={14} radius={4} colorMode="dark" />
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bioBlock}>
        <View style={styles.mb6}>
          <Skeleton width="100%" height={12} radius={4} colorMode="dark" />
        </View>
        <View style={styles.mb6}>
          <Skeleton width="100%" height={12} radius={4} colorMode="dark" />
        </View>
        <Skeleton width="100%" height={12} radius={4} colorMode="dark" />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            width={100}
            height={40}
            radius={10}
            colorMode="dark"
          />
        ))}
      </View>

      {/* About */}
      <View style={styles.mv14}>
        <Skeleton width={140} height={18} radius={4} colorMode="dark" />
      </View>
      <View style={styles.mb6}>
        <Skeleton width="100%" height={12} radius={4} colorMode="dark" />
      </View>
      <View style={styles.mb6}>
        <Skeleton width="100%" height={12} radius={4} colorMode="dark" />
      </View>
      <Skeleton width="100%" height={12} radius={4} colorMode="dark" />

      {/* Skills */}
      <View style={styles.mv14}>
        <Skeleton width={140} height={18} radius={4} colorMode="dark" />
      </View>
      <View style={styles.skillsRow}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={styles.skillMargin}>
            <Skeleton width={60} height={24} radius={20} colorMode="dark" />
          </View>
        ))}
      </View>

      {/* Activity */}
      <View style={styles.mv14}>
        <Skeleton width={140} height={18} radius={4} colorMode="dark" />
      </View>
      <View style={styles.mb12}>
        <Skeleton width="100%" height={hp(10)} radius={12} colorMode="dark" />
      </View>
      <Skeleton width="100%" height={hp(10)} radius={12} colorMode="dark" />
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
