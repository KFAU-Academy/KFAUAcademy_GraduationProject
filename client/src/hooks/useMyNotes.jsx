import { useQuery } from "react-query";
import { getMyNotes } from "../utils/api";

const useMyNotes = (userEmail) => {
  const { data, isError, isLoading, refetch } = useQuery(
    ["myNotes", userEmail],
    () => getMyNotes(userEmail),
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

export default useMyNotes;
