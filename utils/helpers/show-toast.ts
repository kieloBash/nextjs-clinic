import { toast } from "sonner"

export function showToast(type: "success" | "error", title: string, description?: any) {
    toast(title, {
        description,
        duration: 4000,
        className: type === "error" ? "bg-red-500 text-white" : undefined,
    })
}
