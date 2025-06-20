"use client"

import { useState, useMemo } from "react"
import type { User } from "next-auth"
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DoctorCard from "./doctor-card"
import useDoctors from "../_hooks/use-doctors"
import { useDebounce } from "@/utils/helpers/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const PatientMainPage = ({ user }: { user: User }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<any>("most_experienced")
    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(9)

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const doctors = useDoctors({ userId: user.id, searchTerm: debouncedSearchTerm, sortBy, limit, page: currentPage })

    const { data: filteredAndSortedDoctors, isLoading, pagination } = useMemo(() => {
        return { data: doctors?.payload?.data ?? [], pagination: doctors?.payload?.pagination, isLoading: doctors.isLoading || doctors.isFetching }
    }, [doctors])

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    const handleSortChange = (value: any) => {
        setSortBy(value)
        setCurrentPage(1)
    }

    const handleLimitChange = (value: string) => {
        setLimit(Number.parseInt(value))
        setCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const getPageNumbers = () => {
        if (!pagination) return []

        const { page, totalPages } = pagination
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show smart pagination
            if (page <= 3) {
                // Show first pages
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            } else if (page >= totalPages - 2) {
                // Show last pages
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                // Show middle pages
                pages.push(1)
                pages.push("...")
                for (let i = page - 1; i <= page + 1; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }

    const getSortLabel = (sortValue: string) => {
        switch (sortValue) {
            case "most_experienced":
                return "Most Experienced"
            case "name_asc":
                return "Name (A-Z)"
            case "name_desc":
                return "Name (Z-A)"
            default:
                return "Default"
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Find Your Doctor</h1>
                <p className="text-muted-foreground">Search and book appointments with our qualified doctors</p>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by doctor name..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Sort By */}
                        <Select value={sortBy} onValueChange={handleSortChange} disabled={isLoading}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="most_experienced">Most Experienced</SelectItem>
                                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={limit.toString()} onValueChange={handleLimitChange} disabled={isLoading}>
                            <SelectTrigger className="w-full lg:w-[120px]">
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">6 per page</SelectItem>
                                <SelectItem value="9">9 per page</SelectItem>
                                <SelectItem value="12">12 per page</SelectItem>
                                <SelectItem value="18">18 per page</SelectItem>
                                <SelectItem value="24">24 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <Skeleton className="h-4 w-32" />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredAndSortedDoctors.length} of {pagination?.totalItems || 0} doctor
                            {(pagination?.totalItems || 0) !== 1 ? "s" : ""}
                            {pagination && pagination.totalPages > 1 && (
                                <span>
                                    {" "}
                                    (Page {pagination.page} of {pagination.totalPages})
                                </span>
                            )}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    Sorted by: {getSortLabel(sortBy)}
                </div>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: limit }).map((_, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-9 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Doctors Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedDoctors.map((doctor) => (
                        <DoctorCard doctor={doctor} key={doctor.id} />
                    ))}
                </div>
            )}

            {/* No Results */}
            {!isLoading && filteredAndSortedDoctors.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria or filters to find more doctors.</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && pagination && pagination.totalPages > 1 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                            </div>

                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((pageNum, index) => (
                                    <div key={index}>
                                        {pageNum === "..." ? (
                                            <span className="px-3 py-2 text-muted-foreground">...</span>
                                        ) : (
                                            <Button
                                                variant={pageNum === pagination.page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum as number)}
                                                className="min-w-[40px]"
                                            >
                                                {pageNum}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>

                        {/* Pagination Info */}
                        <div className="text-center mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                                {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} results
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading Overlay for Page Changes */}
            {isLoading && currentPage > 1 && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-6">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p className="text-sm font-medium">Loading doctors...</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default PatientMainPage
