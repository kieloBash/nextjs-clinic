"use client";

import { FETCH_INTERVAL, FORMAT } from "@/utils/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { KEY_GET_DOCTOR_APPOINTMENTS } from "./keys";
import { FETCH_ALL_DOCTOR_TIMESLOT } from "@/utils/api-endpoints";
import { ApiResponse, FetchParams, IQueryProps } from "@/types/global.type";
import { AppointmentStatus } from "@prisma/client"

const ROUTE = FETCH_ALL_DOCTOR_TIMESLOT;
const KEY = KEY_GET_DOCTOR_APPOINTMENTS;
const INTERVAL = FETCH_INTERVAL;

const default_limit = 10;
const default_filter = "all";

const fetchData = async ({
    page = 1,
    limit = default_limit,
    filter = default_filter,
    searchTerm = "",

    startDate = startOfMonth(new Date()),
    endDate = endOfMonth(new Date()),

    doctorId,
    statusFilter
}: FetchParams & { doctorId?: string, statusFilter: AppointmentStatus | "ALL" }): Promise<ApiResponse<any>> => {
    const response = await fetch(
        `${ROUTE}?page=${page}&limit=${limit}&filter=${filter}&searchTerm=${searchTerm}&startDate=${format(startDate, FORMAT)}&endDate=${format(endDate, FORMAT)}&doctorId=${doctorId}&statusFilter=${statusFilter}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

type IProps = IQueryProps & { doctorId?: string, statusFilter?: AppointmentStatus | "ALL" }

const useDoctorAppointments = (
    { doctorId, page = 1, limit = default_limit, filter = default_filter, searchTerm = "", select, startDate = startOfMonth(new Date()), endDate = endOfMonth(new Date()), statusFilter = "ALL" }: IProps
) => {

    const { data, error, isLoading, isFetching, isError } = useQuery<ApiResponse<any[]>>({
        queryKey: [KEY, doctorId, page, limit, filter, searchTerm, format(startDate, FORMAT), format(endDate, FORMAT), statusFilter],
        queryFn: () =>
            fetchData({ page, limit, filter, searchTerm, startDate, endDate, doctorId, statusFilter }),
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

export default useDoctorAppointments;