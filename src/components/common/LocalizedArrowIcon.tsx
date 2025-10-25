import React from "react";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";

interface LocalizedArrowIconProps {
  direction: "previous" | "next";
}

/**
 * Localized arrow icon that shows correct direction based on language (RTL/LTR)
 */
export const LocalizedArrowIcon: React.FC<LocalizedArrowIconProps> = ({
  direction,
}) => {
  const { isRtl } = useTranslation();

  const shouldShowBack =
    (direction === "previous" && !isRtl) || (direction === "next" && isRtl);

  return shouldShowBack ? <ArrowBackIos /> : <ArrowForwardIos />;
};
