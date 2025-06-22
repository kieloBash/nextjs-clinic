import { Badge } from "@/components/ui/badge"

export const getExperienceBadge = (appointments: number) => {
    if (appointments >= 300) {
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100" > Highly Experienced </Badge>
    } else if (appointments >= 150) {
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" > Experienced </Badge>
    } else if (appointments >= 50) {
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100" > Developing </Badge>
    } else {
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" > New </Badge>
    }
}