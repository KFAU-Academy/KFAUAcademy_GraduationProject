import { useQuery } from "react-query";
import { getMyAnnouncements } from "../utils/api";

const useMyAnnouncements = (userEmail) => {
  const { data, isError, isLoading, refetch } = useQuery(
    ["myAnnouncements", userEmail],
    () => getMyAnnouncements(userEmail),
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

export default useMyAnnouncements;
