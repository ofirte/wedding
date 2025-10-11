import { Outlet, useNavigate, useLocation, useParams } from "react-router";
import { useCurrentUser, useUpdateUser } from "../../hooks/auth";
import { useEffect } from "react";
import DSLoading from "../common/DSLoading";
import { is } from "date-fns/locale";

export default function WeddingRoute() {
  const { data: currentWeddingUser, isLoading: isLoadingWeddingUser } =
    useCurrentUser();
  const { weddingId: paramsWeddingId } = useParams<{ weddingId: string }>();
  const { mutate: updateUser } = useUpdateUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      !isLoadingWeddingUser &&
      !currentWeddingUser?.weddingIds?.length &&
      !!currentWeddingUser?.weddingId
    ) {
      const weddingIds = [currentWeddingUser.weddingId];
      updateUser({ userData: { weddingIds } });
    }
    if (
      !isLoadingWeddingUser &&
      !!currentWeddingUser &&
      Array.isArray(currentWeddingUser?.weddingIds) &&
      currentWeddingUser?.weddingIds?.length > 0
    ) {
      if (currentWeddingUser?.weddingIds?.length === 1) {
        const weddingId = currentWeddingUser.weddingIds[0];
        if (!!weddingId && !paramsWeddingId) {
          navigate(`/wedding/${weddingId}/home`);
        }
      } else if (!paramsWeddingId && currentWeddingUser?.weddingIds?.length > 1) {
        navigate("/weddings");
      }
    }
  }, [
    isLoadingWeddingUser,
    currentWeddingUser,
    navigate,
    location.pathname,
    paramsWeddingId,
  ]);

  if (isLoadingWeddingUser) {
    return <DSLoading message={"Loading wedding details..."} />;
  }

  return <Outlet />;
}
