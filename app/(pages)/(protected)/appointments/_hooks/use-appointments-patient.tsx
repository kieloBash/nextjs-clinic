"use client";

import { FETCH_INTERVAL, FORMAT } from "@/utils/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { KEY_GET_PATIENT_APPOINTMENTS } from "./keys";
import { FETCH_ALL_PATIENT_APPOINTMENTS } from "@/utils/api-endpoints";
import { ApiResponse, FetchParams, IPaginatedQuery, IQueryProps } from "@/types/global.type";
import { AppointmentStatus } from "@prisma/client"
import { FullAppointmentType } from "@/types/prisma.type";

const ROUTE = FETCH_ALL_PATIENT_APPOINTMENTS;
const KEY = KEY_GET_PATIENT_APPOINTMENTS;
const INTERVAL = FETCH_INTERVAL;

const default_limit = 10;
const default_filter = "all";
const default_start_date = startOfWeek(new Date());
const default_end_date = startOfWeek(new Date());

const fetchData = async ({
    page = 1,
    limit = default_limit,
    filter = default_filter,
    searchTerm = "",

    startDate = default_start_date,
    endDate = default_end_date,
    patientId,
    statusFilter
}: FetchParams & { patientId?: string, statusFilter: AppointmentStatus | "ALL" }): Promise<ApiResponse<any>> => {
    const response = await fetch(
        `${ROUTE}?page=${page}&limit=${limit}&filter=${filter}&searchTerm=${searchTerm}&startDate=${format(startDate, FORMAT)}&endDate=${format(endDate, FORMAT)}&patientId=${patientId}&statusFilter=${statusFilter}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

type IProps = IQueryProps & { patientId?: string, statusFilter?: AppointmentStatus | "ALL" }

type IQueryResponse = IPaginatedQuery<{
    appointments: FullAppointmentType[], statusSummary: {
        total: number;
        completed: number;
        cancelled: number;
        pending_or_confirmed: number;
    }
}>;

const usePatientAppointments = (
    { patientId, page = 1, limit = default_limit, filter = default_filter, searchTerm = "", select, startDate = default_start_date, endDate = default_end_date, statusFilter = "ALL" }: IProps
) => {

    const { data, error, isLoading, isFetching, isError } = useQuery<ApiResponse<IQueryResponse>>({
        queryKey: [KEY, patientId, page, limit, filter, searchTerm, format(startDate, FORMAT), format(endDate, FORMAT), statusFilter],
        queryFn: () =>
            fetchData({ page, limit, filter, searchTerm, startDate, endDate, patientId, statusFilter }),
        staleTime: INTERVAL,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        select,
        enabled: patientId !== null && patientId !== ""
    });

    return {
        ...data,
        error,
        isLoading,
        isFetching,
        isError,
    };
};

export default usePatientAppointments;