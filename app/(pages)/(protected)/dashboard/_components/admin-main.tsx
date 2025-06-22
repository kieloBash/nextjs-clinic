"use client"

import { useState, useMemo } from "react"
import {
    Users,
    Search,
    MoreHorizontal,
    UserCheck,
    UserX,
    Trash2,
    Edit,
    Eye,
    Download,
    Plus,
    Shield,
    Stethoscope,
    UserPlus,
    BarChart3,
    Users2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User } from "next-auth"
import CreateUserModal from "./admin/create-user-modal"

// Mock user data
const mockUsers = [
    {
        id: "user-001",
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@clinic.com",
        role: "doctor",
        specialty: "Cardiology",
        status: "active",
        lastLogin: new Date("2024-01-15T10:30:00"),
        joinedDate: new Date("2023-06-15"),
        avatar: "/placeholder.svg?height=40&width=40",
        phone: "+1 (555) 123-4567",
        appointmentsCount: 245,
    },
    {
        id: "user-002",
        name: "John Smith",
        email: "john.smith@email.com",
        role: "patient",
        specialty: null,
        status: "active",
        lastLogin: new Date("2024-01-14T15:20:00"),
        joinedDate: new Date("2023-08-20"),
        avatar: "/placeholder.svg?height=40&width=40",
        phone: "+1 (555) 234-5678",
        appointmentsCount: 12,
    },
    {
        id: "user-003",
        name: "Dr. Michael Chen",
        email: "michael.chen@clinic.com",
        role: "doctor",
        specialty: "General Practice",
        status: "disabled",
        lastLogin: new Date("2024-01-10T09:15:00"),
        joinedDate: new Date("2023-04-10"),
        avatar: "/placeholder.svg?height=40&width=40",
        phone: "+1 (555) 345-6789",
        appointmentsCount: 189,
    },
    {
        id: "user-004",
        name: "Emily Rodriguez",
        email: "emily.rodriguez@clinic.com",
        role: "doctor",
        specialty: "Dermatology",
        status: "active",
        lastLogin: new Date("2024-01-15T14:45:00"),
        joinedDate: new Date("2023-09-05"),
        avatar: "/placeholder.svg?height=40&width=40",
        phone: "+1 (555) 456-7890",
        appointmentsCount: 156,
    },
    {
        id: "user-005",
        name: "Lisa Thompson",
        email: "lisa.thompson@email.com",
        role: "patient",
        specialty: null,
        status: "active",
        lastLogin: new Date("2024-01-13T11:30:00"),
        joinedDate: new Date("2023-11-12"),
        avatar: "/placeholder.svg?height=40&width=40",
        phone: "+1 (555) 567-8901",
        appointmentsCount: 8,
    },
    {
        id: "user-006",
        name: "Robert Brown",
        email: "robert.brown@email.com",
        role: "patient",
        specialty: null,
        status: "disabled",
        lastLogin: new Date("2024-01-05T16:20:00"),
        joinedDate: new Date("2023-07-18"),
        avatar: "/placeholder.svg?height=40&width=40",
        phone: "+1 (555) 678-9012",
        appointmentsCount: 15,
    },
    {
        id: "user-007",
        name: "Dr. David Kim",
        email: "david.kim@clinic.com",
        role: "doctor",
        specialty: "Orthopedics",
        status: "active",
        lastLogin: new Date("2024-01-15T08:00:00"),
        joinedDate: new Date("2023-03-22"),
        avatar: "/placeholder.svg?height=40&width=40",
        phone: "+1 (555) 789-0123",
        appointmentsCount: 203,
    },
    {
        id: "user-008",
        name: "Admin User",
        email: "admin@clinic.com",
        role: "admin",
        specialty: null,
        status: "active",
        lastLogin: new Date("2024-01-15T16:45:00"),
        joinedDate: new Date("2023-01-01"),
        avatar: "/placeholder.svg?height=40&width=40",
        phone: "+1 (555) 890-1234",
        appointmentsCount: 0,
    },
]

export default function AdminMainPage({ user }: { user: User }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [disableDialogOpen, setDisableDialogOpen] = useState(false)
    const [userToAction, setUserToAction] = useState<string | null>(null)
    const [bulkAction, setBulkAction] = useState<"delete" | "disable" | "enable" | null>(null)

    // Filter users based on search and filters
    const filteredUsers = useMemo(() => {
        return mockUsers.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesRole = roleFilter === "all" || user.role === roleFilter
            const matchesStatus = statusFilter === "all" || user.status === statusFilter

            return matchesSearch && matchesRole && matchesStatus
        })
    }, [searchTerm, roleFilter, statusFilter])

    // Calculate stats
    const stats = useMemo(() => {
        const totalUsers = mockUsers.length
        const activeUsers = mockUsers.filter((u) => u.status === "active").length
        const disabledUsers = mockUsers.filter((u) => u.status === "disabled").length
        const doctors = mockUsers.filter((u) => u.role === "doctor").length
        const patients = mockUsers.filter((u) => u.role === "patient").length

        return { totalUsers, activeUsers, disabledUsers, doctors, patients }
    }, [])

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "doctor":
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        <Stethoscope className="w-3 h-3 mr-1" />
                        Doctor
                    </Badge>
                )
            case "patient":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Patient
                    </Badge>
                )
            case "admin":
                return (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{role}</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Active
                    </Badge>
                )
            case "disabled":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <UserX className="w-3 h-3 mr-1" />
                        Disabled
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const handleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, userId])
        } else {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId))
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(filteredUsers.map((user) => user.id))
        } else {
            setSelectedUsers([])
        }
    }

    const handleDisableUser = (userId: string) => {
        setUserToAction(userId)
        setDisableDialogOpen(true)
    }

    const handleDeleteUser = (userId: string) => {
        setUserToAction(userId)
        setDeleteDialogOpen(true)
    }

    const handleBulkAction = (action: "delete" | "disable" | "enable") => {
        setBulkAction(action)
        if (action === "delete") {
            setDeleteDialogOpen(true)
        } else {
            setDisableDialogOpen(true)
        }
    }

    const confirmAction = () => {
        if (bulkAction) {
            console.log(`Bulk ${bulkAction} for users:`, selectedUsers)
            setSelectedUsers([])
            setBulkAction(null)
        } else if (userToAction) {
            console.log(`Action for user:`, userToAction)
            setUserToAction(null)
        }
        setDeleteDialogOpen(false)
        setDisableDialogOpen(false)
    }

    const exportUsers = () => {
        console.log("Exporting users...")
        // In a real app, this would generate and download a CSV/Excel file
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex justify-between w-full items-end">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                    <Users2Icon className="w-8 h-8 text-white" />
                                </div>
                                Admin Dashboard
                            </h1>
                            <p className="text-slate-600 text-lg">Manage all users, doctors, patients, and staff members</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* <Button variant="outline" onClick={exportUsers}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button> */}
                            <CreateUserModal />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.doctors}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Patients</CardTitle>
                            <UserPlus className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.patients}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>Manage and monitor all user accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search users by name, email, or specialty..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="doctor">Doctors</SelectItem>
                                    <SelectItem value="patient">Patients</SelectItem>
                                    <SelectItem value="admin">Admins</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Bulk Actions */}
                        {selectedUsers.length > 0 && (
                            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm font-medium">{selectedUsers.length} users selected</span>
                                <Button size="sm" variant="outline" onClick={() => handleBulkAction("enable")}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Enable
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleBulkAction("disable")}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Disable
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        )}

                        {/* Users Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Specialty</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead>Appointments</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                                        <AvatarFallback>
                                                            {user.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                                            <TableCell>
                                                {user.specialty ? (
                                                    <span className="text-sm">{user.specialty}</span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{user.lastLogin.toLocaleDateString()}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {user.lastLogin.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium">{user.appointmentsCount}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit User
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {user.status === "active" ? (
                                                            <DropdownMenuItem onClick={() => handleDisableUser(user.id)}>
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                Disable Account
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem>
                                                                <UserCheck className="mr-2 h-4 w-4" />
                                                                Enable Account
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {bulkAction === "delete"
                                    ? `This will permanently delete ${selectedUsers.length} selected user(s). This action cannot be undone.`
                                    : "This will permanently delete this user account. This action cannot be undone."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmAction} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Disable/Enable Confirmation Dialog */}
                <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {bulkAction === "disable" || (!bulkAction && userToAction) ? "Disable" : "Enable"} User Account
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {bulkAction === "disable"
                                    ? `This will disable ${selectedUsers.length} selected user account(s). They will not be able to log in.`
                                    : bulkAction === "enable"
                                        ? `This will enable ${selectedUsers.length} selected user account(s). They will be able to log in again.`
                                        : "This will change the user's account status. Are you sure you want to continue?"}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmAction}>
                                {bulkAction === "disable" || (!bulkAction && userToAction) ? "Disable" : "Enable"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
