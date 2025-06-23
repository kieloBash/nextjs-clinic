"use client"

import { useState } from "react"
import { UserPlus, Eye, EyeOff, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import axios from "axios"
import { REGISTER_ACCOUNT } from "@/utils/api-endpoints"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { showToast } from "@/utils/helpers/show-toast"
import { useLoading } from "@/components/providers/loading-provider"
import { useQueryClient } from "@tanstack/react-query"
import { KEY_GET_ALL_USERS } from "../../_hooks/keys"

interface CreateUserModalProps {
    onUserCreated?: (user: CreateUserData) => void
}

interface CreateUserData {
    email: string
    name: string
    phone: string
    roleId: string
    password: string
    isActive: boolean
}

export default function CreateUserModal({ onUserCreated }: CreateUserModalProps) {
    const [open, onOpenChange] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { isLoading, setIsLoading } = useLoading()
    const [formData, setFormData] = useState<CreateUserData>({
        email: "",
        name: "",
        phone: "",
        roleId: "",
        password: "",
        isActive: true,
    })

    const [errors, setErrors] = useState<Partial<CreateUserData>>({})
    const queryClient = useQueryClient();

    const updateFormData = (field: keyof CreateUserData, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateUserData> = {}

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Full name is required"
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters long"
        }

        // Phone validation (optional but if provided, should be valid)
        if (!formData.phone) {
            newErrors.phone = "Please enter a valid phone number"
        }

        // Role validation
        if (!formData.roleId) {
            newErrors.roleId = "Please select a role"
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        const formDatas = new FormData();
        formDatas.append("name", formData.name);
        formDatas.append("email", formData.email);
        formDatas.append("phone", formData.phone);
        formDatas.append("role", formData.roleId);
        formDatas.append("password", formData.password);

        try {
            setIsCreating(true)
            setIsLoading(true)
            const res = await axios.post(REGISTER_ACCOUNT, formDatas, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message)
            setFormData({
                email: "",
                name: "",
                phone: "",
                roleId: "",
                password: "",
                isActive: true,
            })
            onOpenChange(false)


            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_ALL_USERS], exact: false }),
            ]);

        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
        } finally {
            setIsCreating(false)
            setIsLoading(false)
        }
    }

    const generatePassword = () => {
        const length = 12
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        let password = ""

        // Ensure at least one of each required character type
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
        password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
        password += "0123456789"[Math.floor(Math.random() * 10)]

        // Fill the rest randomly
        for (let i = 3; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)]
        }

        // Shuffle the password
        password = password
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("")

        updateFormData("password", password)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Create New User
                    </DialogTitle>
                    <DialogDescription>
                        Add a new patient or doctor to the clinic system. All fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => updateFormData("name", e.target.value)}
                            placeholder="Enter full name"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            placeholder="Enter email address"
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => updateFormData("phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select value={formData.roleId} onValueChange={(value) => updateFormData("roleId", value)}>
                            <SelectTrigger className={errors.roleId ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select user role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={"PATIENT"}>
                                    {"Patient"}
                                </SelectItem>
                                <SelectItem value={"DOCTOR"}>
                                    {"Doctor"}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.roleId && <p className="text-sm text-red-500">{errors.roleId}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password *</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={generatePassword}
                                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                            >
                                Generate
                            </Button>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => updateFormData("password", e.target.value)}
                                placeholder="Enter password"
                                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </Button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        <p className="text-xs text-gray-500">
                            Password must be at least 8 characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    {/* Active Status */}
                    {/* <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="isActive">Account Status</Label>
                            <p className="text-sm text-gray-500">
                                {formData.isActive ? "Account will be active" : "Account will be inactive"}
                            </p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => updateFormData("isActive", checked)}
                        />
                    </div> */}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isCreating}>
                        {isCreating ? "Creating..." : "Create User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
