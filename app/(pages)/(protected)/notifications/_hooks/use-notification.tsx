"use client";

import { FETCH_INTERVAL } from "@/utils/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { FETCH_SINGLE_NOTIFICATION } from "@/utils/api-endpoints";
import { ApiResponse } from "@/types/global.type";
import { KEY_GET_NOTIFICATIONS } from "./keys";
import { FullDoctorSearchType, FullNotificationType } from "@/types/prisma.type";
import { Notification } from "@prisma/client";

const ROUTE = FETCH_SINGLE_NOTIFICATION;
const KEY = KEY_GET_NOTIFICATIONS;
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

const useNotification = (
    { id }: IProps
) => {

    const { data, error, isLoading, isFetching, isError } = useQuery<ApiResponse<FullNotificationType>>({
        queryKey: [KEY + "-" + id],
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

export default useNotification;