import { Outlet, useNavigate, useLocation, useParams } from "react-router";
import { useCurrentUser } from "../../hooks/auth";
import { useEffect } from "react";
import DSLoading from "../common/DSLoading";

export default function WeddingRoute() {
  const { data: currentWeddingUser, isLoading: isLoadingWeddingUser } =
    useCurrentUser();
  const { weddingId: paramsWeddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoadingWeddingUser && currentWeddingUser?.weddingId) {
      const { weddingId } = currentWeddingUser;
      if (!!weddingId && !paramsWeddingId) {
        navigate(`/wedding/${weddingId}/home`);
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
