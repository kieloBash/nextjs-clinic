import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { UserIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/app/generated/prisma'
import { FullAppointmentType } from '@/types/prisma.type'
import { formatTimeToString, getDifferenceTimeSlot } from '@/utils/helpers/date'
import { format } from 'date-fns'

interface IProps {
    selectedAppointment: FullAppointmentType
    clear: () => void
    getStatusColor: (e: string) => string
}
const SelectedAppointmentModal = ({ selectedAppointment, clear, getStatusColor }: IProps) => {
    return (
        <Dialog open={!!selectedAppointment} onOpenChange={clear}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Appointment Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                            <UserIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{selectedAppointment.patient.name}</h3>
                            <Badge className={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Date</label>
                            <p>{format(selectedAppointment.date, "EEEE, MMMM d, yyyy")}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Time</label>
                            <p>
                                {formatTimeToString(selectedAppointment.timeSlot.startTime)} ({getDifferenceTimeSlot(selectedAppointment.timeSlot)} min)
                            </p>
                        </div>
                        {/* <div>
                            <label className="text-sm font-medium text-gray-600">Type</label>
                            <p>{selectedAppointment.type}</p>
                        </div> */}
                        <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p>{selectedAppointment.patient.phone}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p>{selectedAppointment.patient.email}</p>
                    </div>
                </div>

                <DialogFooter className="flex space-x-2">
                    <Button variant="outline">Reschedule</Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                        Cancel Appointment
                    </Button>
                    <Button>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SelectedAppointmentModal