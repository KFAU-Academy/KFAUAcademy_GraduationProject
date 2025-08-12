import React from "react";
import { useQuery } from "react-query";
import { getAllAnnouncements } from "../utils/api";

const useAnnouncements = () => {
  const { data, isError, isLoading, refetch } = useQuery(
    "allAnnouncements",
    getAllAnnouncements,
    { refetchOnWindowFocus: false }
  );

  return {
    data,
    isError,
    isLoading,
    refetch,
  };
};

export default useAnnouncements;
