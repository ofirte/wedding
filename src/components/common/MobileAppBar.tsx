import React from "react";
import { useWeddingDetails } from "../../hooks/auth";
import { useTranslation } from "../../localization/LocalizationContext";
import GeneralMobileAppBar from "./GeneralMobileAppBar";

interface MobileAppBarProps {
  onMenuClick: () => void;
}

/**
 * @deprecated Use GeneralMobileAppBar directly for more flexibility
 * This component is kept for backward compatibility
 */
const MobileAppBar: React.FC<MobileAppBarProps> = ({ onMenuClick }) => {
  const { data: weddingDetails } = useWeddingDetails();
  const { t } = useTranslation();

  return (
    <GeneralMobileAppBar
      onMenuClick={onMenuClick}
      title={t("home.title")}
      subtitle={weddingDetails?.name}
    />
  );
};

export default MobileAppBar;
