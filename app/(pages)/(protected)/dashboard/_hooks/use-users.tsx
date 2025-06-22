"use client";

import { FETCH_INTERVAL, FORMAT } from "@/utils/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { FETCH_ALL_USERS } from "@/utils/api-endpoints";
import { ApiResponse, DoctorAnalyticsPayload, FetchParams, IPaginatedQuery, IQueryProps } from "@/types/global.type";
import { KEY_GET_ALL_USERS } from "./keys";
import { UserFullType } from "@/types/prisma.type";

const ROUTE = FETCH_ALL_USERS;
const KEY = KEY_GET_ALL_USERS;
const INTERVAL = FETCH_INTERVAL;

const default_limit = 10;
const default_filter = "ALL";
const default_start_date = startOfMonth(new Date());
const default_end_date = endOfMonth(new Date());

const fetchData = async ({
    page = 1,
    limit = default_limit,
    filter = default_filter,
    searchTerm = "",

    startDate = default_start_date,
    endDate = default_end_date,
    roleFilter
}: FetchParams & { roleFilter: "DOCTOR" | "PATIENT" | "ALL" }): Promise<ApiResponse<IPaginatedQuery<any>>> => {
    const response = await fetch(
        `${ROUTE}?page=${page}&limit=${limit}&filter=${filter}&searchTerm=${searchTerm}&startDate=${format(startDate, FORMAT)}&endDate=${format(endDate, FORMAT)}&roleFilter=${roleFilter}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

type IProps = IQueryProps & { roleFilter?: "DOCTOR" | "PATIENT" | "ALL" }

interface IQueryReponse {
    users: UserFullType[]
    totalUsersByRoleName: { roleName: string; count: number }[]
}

const useUsers = (
    { page = 1, limit = default_limit, filter = default_filter, searchTerm = "", select, startDate = default_start_date, endDate = default_end_date, roleFilter = "ALL" }: IProps
) => {

    const { data, error, isLoading, isFetching, isError } = useQuery<ApiResponse<IPaginatedQuery<IQueryReponse>>>({
        queryKey: [KEY, , page, limit, filter, searchTerm, format(startDate, FORMAT), format(endDate, FORMAT), roleFilter],
        queryFn: () =>
            fetchData({ page, limit, filter, searchTerm, startDate, endDate, roleFilter }),
        staleTime: INTERVAL,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        select,
    });

    return {
        ...data,
        error,
        isLoading,
        isFetching,
        isError,
    };
};

export default useUsers;