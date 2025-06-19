"use client"

import { useState, useMemo } from "react"
import type { User } from "next-auth"
import { Search, Star, Phone, Mail, Calendar, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DoctorCard from "./doctor-card"


// create a page where if the patient clicks on the schedule an appointment, it would rerdirrect them to the doctor details and the doctors available timeslot.

// maybe make the ui for displaying the available timeslot more intuuitive
// Mock doctor data based on your User model
const mockDoctors = [
    {
        id: "doc-001",
        email: "dr.sarah.johnson@clinic.com",
        name: "Dr. Sarah Johnson",
        image: "/placeholder.svg?height=100&width=100",
        phone: "(555) 123-4567",
        roleId: "doctor-role",
        hashedPassword: "hashed",
        isActive: true,
        createdAt: new Date("2022-01-15"),
        updatedAt: new Date("2024-01-15"),
        // Derived data from relations (would come from database queries)
        completedAppointments: 245,
        specialization: "Cardiology", // This would be stored elsewhere in your system
        experience: "8 years",
        rating: 4.8,
    },
    {
        id: "doc-002",
        email: "dr.michael.chen@clinic.com",
        name: "Dr. Michael Chen",
        image: "/placeholder.svg?height=100&width=100",
        phone: "(555) 234-5678",
        roleId: "doctor-role",
        hashedPassword: "hashed",
        isActive: true,
        createdAt: new Date("2021-03-20"),
        updatedAt: new Date("2024-01-14"),
        completedAppointments: 189,
        specialization: "Pediatrics",
        experience: "6 years",
        rating: 4.9,
    },
    {
        id: "doc-003",
        email: "dr.emily.rodriguez@clinic.com",
        name: "Dr. Emily Rodriguez",
        image: "/placeholder.svg?height=100&width=100",
        phone: "(555) 345-6789",
        roleId: "doctor-role",
        hashedPassword: "hashed",
        isActive: true,
        createdAt: new Date("2020-06-10"),
        updatedAt: new Date("2024-01-13"),
        completedAppointments: 312,
        specialization: "Dermatology",
        experience: "10 years",
        rating: 4.7,
    },
    {
        id: "doc-004",
        email: "dr.david.wilson@clinic.com",
        name: "Dr. David Wilson",
        image: "/placeholder.svg?height=100&width=100",
        phone: "(555) 456-7890",
        roleId: "doctor-role",
        hashedPassword: "hashed",
        isActive: true,
        createdAt: new Date("2023-02-28"),
        updatedAt: new Date("2024-01-12"),
        completedAppointments: 87,
        specialization: "Orthopedics",
        experience: "4 years",
        rating: 4.6,
    },
    {
        id: "doc-005",
        email: "dr.lisa.thompson@clinic.com",
        name: "Dr. Lisa Thompson",
        image: "/placeholder.svg?height=100&width=100",
        phone: "(555) 567-8901",
        roleId: "doctor-role",
        hashedPassword: "hashed",
        isActive: true,
        createdAt: new Date("2019-09-15"),
        updatedAt: new Date("2024-01-11"),
        completedAppointments: 428,
        specialization: "Internal Medicine",
        experience: "12 years",
        rating: 4.9,
    },
    {
        id: "doc-006",
        email: "dr.robert.brown@clinic.com",
        name: "Dr. Robert Brown",
        image: "/placeholder.svg?height=100&width=100",
        phone: "(555) 678-9012",
        roleId: "doctor-role",
        hashedPassword: "hashed",
        isActive: true,
        createdAt: new Date("2021-11-05"),
        updatedAt: new Date("2024-01-10"),
        completedAppointments: 156,
        specialization: "Neurology",
        experience: "7 years",
        rating: 4.5,
    },
]

const PatientMainPage = ({ user }: { user: User }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("most_experienced") // appointments, name, rating
    const [specializationFilter, setSpecializationFilter] = useState("all")

    // Get unique specializations for filter
    const specializations = useMemo(() => {
        const unique = Array.from(new Set(mockDoctors.map((doc) => doc.specialization)))
        return unique.sort()
    }, [])

    // Filter and sort doctors
    const filteredAndSortedDoctors = useMemo(() => {
        const filtered = mockDoctors.filter((doctor) => {
            const matchesSearch =
                doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.email.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesSpecialization = specializationFilter === "all" || doctor.specialization === specializationFilter

            return doctor.isActive && matchesSearch && matchesSpecialization
        })

        // Sort doctors
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "appointments":
                    return b.completedAppointments - a.completedAppointments
                case "name":
                    return a.name.localeCompare(b.name)
                case "rating":
                    return b.rating - a.rating
                default:
                    return 0
            }
        })

        return filtered
    }, [searchTerm, sortBy, specializationFilter])

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
                                placeholder="Search by doctor name, specialization, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Specialization Filter */}
                        <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                            <SelectTrigger className="w-full lg:w-[200px]">
                                <SelectValue placeholder="Specialization" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Specializations</SelectItem>
                                {specializations.map((spec) => (
                                    <SelectItem key={spec} value={spec}>
                                        {spec}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort By */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="most_experienced">Most Experienced</SelectItem>
                                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredAndSortedDoctors.length} doctor{filteredAndSortedDoctors.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    Sorted by:{" "}
                    {sortBy === "appointments"
                        ? "Experience"
                        : sortBy === "rating"
                            ? "Rating"
                            : sortBy === "name"
                                ? "Name"
                                : "Default"}
                </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedDoctors.map((doctor) => (
                    <DoctorCard doctor={doctor} key={doctor.id} />
                ))}
            </div>

            {/* No Results */}
            {filteredAndSortedDoctors.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria or filters to find more doctors.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default PatientMainPage
