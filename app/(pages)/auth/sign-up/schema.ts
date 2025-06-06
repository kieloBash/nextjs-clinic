import { z } from "zod"

export const patientFormSchema = z
    .object({
        name: z.string(),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(100),
        confirmPassword: z.string(),
        phone: z.string().min(10, { message: "Please enter a valid phone number" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

// Form schema for doctor signup
export const doctorFormSchema = z
    .object({
        name: z.string(),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(100),
        confirmPassword: z.string(),
        phone: z.string().min(10, { message: "Please enter a valid phone number" }),
        specialization: z.string().min(2, { message: "Please enter your specialization" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })