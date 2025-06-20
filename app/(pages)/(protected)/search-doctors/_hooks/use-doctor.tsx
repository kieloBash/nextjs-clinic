"use client";

import { FETCH_INTERVAL } from "@/utils/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { FETCH_SEARCH_SINGLE_DOCTOR } from "@/utils/api-endpoints";
import { ApiResponse, IPaginatedQuery } from "@/types/global.type";
import { KEY_GET_DOCTORS } from "./keys";
import { FullDoctorSearchType } from "@/types/prisma.type";

const ROUTE = FETCH_SEARCH_SINGLE_DOCTOR;
const KEY = KEY_GET_DOCTORS;
const INTERVAL = FETCH_INTERVAL;

const fetchData = async ({
    id,
}: { id?: string }): Promise<ApiResponse<any>> => {
    const response = await fetch(
        `${ROUTE}?id=${id}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

type IProps = { id?: string }

const useDoctor = (
    { id }: IProps
) => {

    const { data, error, isLoading, isFetching, isError } = useQuery<ApiResponse<FullDoctorSearchType>>({
        queryKey: [KEY, id],
        queryFn: () =>
            fetchData({ id }),
        staleTime: INTERVAL,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled: id !== null && id !== ""
    });

    return {
        ...data,
        error,
        isLoading,
        isFetching,
        isError,
    };
};

export default useDoctor;