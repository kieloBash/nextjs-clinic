"use client"

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control, FieldValues, Path } from "react-hook-form"

interface FormInputProps<T extends FieldValues> {
    control: Control<T>
    name: Path<T>
    label: string
    type?: string
    placeholder?: string
    icon?: any
    disabled?: boolean
}

export function FormInput<T extends FieldValues>({
    control,
    name,
    label,
    type = "text",
    placeholder,
    icon: Icon,
    disabled,
}: FormInputProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-gray-700 font-medium">{label}</FormLabel>
                    <FormControl>
                        <div className="relative">
                            {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />}
                            <Input
                                {...field}
                                type={type}
                                placeholder={placeholder}
                                disabled={disabled}
                                className="pl-10 h-10 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
