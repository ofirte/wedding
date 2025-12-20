import React from "react";
import {
  ArrowBackIos,
  ArrowForwardIos,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material";
import { SvgIconProps } from "@mui/material";
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

/**
 * Localized navigate icon for breadcrumbs - shows correct direction based on language (RTL/LTR)
 * In LTR: NavigateNext (pointing right)
 * In RTL: NavigateBefore (pointing left)
 */
export const LocalizedNavigateIcon: React.FC<SvgIconProps> = (props) => {
  const { isRtl } = useTranslation();

  return isRtl ? <NavigateBefore {...props} /> : <NavigateNext {...props} />;
};
