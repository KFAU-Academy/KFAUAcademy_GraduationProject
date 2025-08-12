import React from "react";
import { useQuery } from "react-query";
import { getAllVideos } from "../utils/api";

const useVideos = () => {
  const { data, isError, isLoading, refetch } = useQuery(
    "allVideos",
    getAllVideos,
    { refetchOnWindowFocus: false }
  );

  return {
    data,
    isError,
    isLoading,
    refetch,
  };
};

export default useVideos;
