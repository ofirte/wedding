import { useWeddingDetails } from "./useWeddingDetails";

type WeddingDateInfo = {
  weddingDate: Date;
  daysRemaining: number;
};
export const useWeddingDate = (weddingId?: string): WeddingDateInfo | null => {
  const { data: weddingDetails, isLoading: isLoadingWeddingDetails } =
    useWeddingDetails(weddingId);
  const calcuateDaysRemaning = (weddingDate: Date): number => {
    const today = new Date();
    const timeDiff = weddingDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
  if (isLoadingWeddingDetails) return null;
  if (!weddingDetails?.date) return null;
  return {
    weddingDate: weddingDetails.date,
    daysRemaining: calcuateDaysRemaning(weddingDetails.date),
  };
};
