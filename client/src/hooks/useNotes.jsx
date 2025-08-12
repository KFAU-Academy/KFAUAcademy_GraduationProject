import React from "react";
import { useQuery } from "react-query";
import { getAllNotes } from "../utils/api";

const useNotes = () => {
  const { data, isError, isLoading, refetch } = useQuery(
    "allNotes",
    getAllNotes,
    { refetchOnWindowFocus: false }
  );

  return {
    data,
    isError,
    isLoading,
    refetch,
  };
};

export default useNotes;
