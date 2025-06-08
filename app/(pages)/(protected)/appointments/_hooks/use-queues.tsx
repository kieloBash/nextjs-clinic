"use client";

import { FETCH_INTERVAL } from "@/utils/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { KEY_GET_DOCTOR_QUEUES } from "./keys";
import { FETCH_ALL_DOCTOR_APPOINTMENTS } from "@/utils/api-endpoints";
import { ApiResponse, FetchParams, IQueryProps } from "@/types/global.type";
import { TimeSlotStatus } from "@prisma/client"
import { FullQueueType } from "@/types/prisma.type";

const ROUTE = FETCH_ALL_DOCTOR_APPOINTMENTS;
const KEY = KEY_GET_DOCTOR_QUEUES;
const INTERVAL = FETCH_INTERVAL;

const default_limit = 10;
const default_filter = "all";

const fetchData = async ({
    page = 1,
    limit = default_limit,
    filter = default_filter,
    searchTerm = "",

    doctorId,
    statusFilter
}: FetchParams & { doctorId?: string, statusFilter: TimeSlotStatus | "ALL" }): Promise<ApiResponse<any>> => {
    const response = await fetch(
        `${ROUTE}?page=${page}&limit=${limit}&filter=${filter}&searchTerm=${searchTerm}&doctorId=${doctorId}&statusFilter=${statusFilter}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

type IProps = IQueryProps & { doctorId?: string, statusFilter?: TimeSlotStatus | "ALL" }

const useDoctorQueues = (
    { doctorId, page = 1, limit = default_limit, filter = default_filter, searchTerm = "", select, statusFilter = "ALL" }: IProps
) => {

    const { data, error, isLoading, isFetching, isError } = useQuery<ApiResponse<FullQueueType[]>>({
        queryKey: [KEY, doctorId, page, limit, filter, searchTerm, statusFilter],
        queryFn: () =>
            fetchData({ page, limit, filter, searchTerm, doctorId, statusFilter }),
        staleTime: INTERVAL,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        select,
        enabled: doctorId !== null && doctorId !== ""
    });

    return {
        ...data,
        error,
        isLoading,
        isFetching,
        isError,
    };
};

export default useDoctorQueues;