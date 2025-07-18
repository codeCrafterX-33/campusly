import React from "react";
import { Text, TextProps } from "react-native";

type TypographyVariant =
  | "bodyMedium"
  | "bodyLarge"
  | "titleMedium"
  | "titleLarge";

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "bodyMedium",
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "bodyMedium":
        return { fontSize: 14 };
      case "bodyLarge":
        return { fontSize: 16 };
      case "titleMedium":
        return { fontSize: 18, fontWeight: "500" as const };
      case "titleLarge":
        return { fontSize: 22, fontWeight: "600" as const };
      default:
        return {};
    }
  };

  return <Text style={[getVariantStyle(), style]} {...props} />;
};
