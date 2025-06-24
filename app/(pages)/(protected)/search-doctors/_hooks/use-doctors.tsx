"use client";

import { FETCH_INTERVAL, FORMAT } from "@/utils/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { FETCH_SEARCH_DOCTORS } from "@/utils/api-endpoints";
import { ApiResponse, FetchParams, IPaginatedQuery, IQueryProps } from "@/types/global.type";
import { KEY_GET_DOCTORS } from "./keys";
import { FullDoctorSearchType, UserFullType } from "@/types/prisma.type";
import { SORT_BY_DOCTORS } from "../_components/helper";

const ROUTE = FETCH_SEARCH_DOCTORS;
const KEY = KEY_GET_DOCTORS;
const INTERVAL = FETCH_INTERVAL;

const default_limit = 10;
const default_filter = "all";
const default_start_date = startOfMonth(new Date());
const default_end_date = endOfMonth(new Date());

const fetchData = async ({
    page = 1,
    limit = default_limit,
    filter = default_filter,
    searchTerm = "",

    startDate = default_start_date,
    endDate = default_end_date,
    userId,
    sortBy
}: FetchParams & { userId?: string, sortBy: SORT_BY_DOCTORS }): Promise<ApiResponse<any>> => {
    const response = await fetch(
        `${ROUTE}?page=${page}&limit=${limit}&filter=${filter}&searchTerm=${searchTerm}&startDate=${format(startDate, FORMAT)}&endDate=${format(endDate, FORMAT)}&userId=${userId}&sortBy=${sortBy}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

type IProps = IQueryProps & { userId?: string, sortBy?: SORT_BY_DOCTORS }

const useDoctors = (
    { userId, page = 1, limit = default_limit, filter = default_filter, searchTerm = "", select, startDate = default_start_date, endDate = default_end_date, sortBy = "most_experienced" }: IProps
) => {

    const { data, error, isLoading, isFetching, isError } = useQuery<ApiResponse<IPaginatedQuery<FullDoctorSearchType[]>>>({
        queryKey: [KEY, userId, page, limit, filter, searchTerm, format(startDate, FORMAT), format(endDate, FORMAT), sortBy],
        queryFn: () =>
            fetchData({ page, limit, filter, searchTerm, startDate, endDate, userId, sortBy }),
        staleTime: INTERVAL,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        select,
        enabled: userId !== null && userId !== ""
    });

    return {
        ...data,
        error,
        isLoading,
        isFetching,
        isError,
    };
};

export default useDoctors;