import { useQuery } from "react-query";
import { getMyVideos } from "../utils/api";

const useMyVideos = (userEmail) => {
  const { data, isError, isLoading, refetch } = useQuery(
    ["myVideos", userEmail],
    () => getMyVideos(userEmail),
    {
      enabled: !!userEmail, // userEmail varsa sorguyu çalıştır
      refetchOnWindowFocus: false,
    }
  );

  return {
    data,
    isError,
    isLoading,
    refetch,
  };
};

export default useMyVideos;
