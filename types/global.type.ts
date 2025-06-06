export interface ILayout {
    children: React.ReactNode
}

export type FetchParams = {
    page?: number;
    limit?: number;
    filter?: string;
    searchTerm?: string;
    startDate?: Date;
    endDate?: Date;
};

export type ApiResponse<T> = {
    message: string;
    payload: T
};

export interface IQueryProps {
    page?: number,
    limit?: number,
    filter?: string,
    searchTerm?: string,
    select?: any
    startDate?: Date;
    endDate?: Date;
}