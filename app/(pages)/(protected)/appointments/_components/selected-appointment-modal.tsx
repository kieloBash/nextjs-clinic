import React, { useMemo, useState } from 'react'
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
import { FullAppointmentType } from '@/types/prisma.type'
import { getDifferenceTimeSlot } from '@/utils/helpers/date'
import { format } from 'date-fns'
import { CREATED_PROMPT_SUCCESS, TIME_ZONE } from '@/utils/constants'
import { AppointmentStatus } from '@prisma/client'
import { showToast } from '@/utils/helpers/show-toast'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { KEY_GET_DOCTOR_APPOINTMENTS, KEY_GET_DOCTOR_QUEUES } from '../_hooks/keys'
import { COMPLETE_APPOINTMENT, CONFIRM_PAYMENT_APPOINTMENT } from '@/utils/api-endpoints'

interface IProps {
    selectedAppointment: FullAppointmentType
    clear: () => void
    getStatusColor: (e: string) => string
    getStatusLabel: (e: string) => string
}

const SelectedAppointmentModal = ({ selectedAppointment, clear, getStatusColor, getStatusLabel }: IProps) => {
    const [isUpdating, setisUpdating] = useState(false);
    const queryClient = useQueryClient();

    const startTime = useMemo(() => {
        return new Date(selectedAppointment.timeSlot.startTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: TIME_ZONE,
        });
    }, [selectedAppointment])

    const [hour, minute] = useMemo(() => {
        return startTime.split(":")
    }, [selectedAppointment, startTime])


    const handleConfirmPayment = async () => {
        try {
            setisUpdating(true)
            const body = { appointmentId: selectedAppointment.id }
            const res = await axios.post(CONFIRM_PAYMENT_APPOINTMENT, body);
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);

            await queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_QUEUES, KEY_GET_DOCTOR_APPOINTMENTS], exact: false });
            clear()

        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setisUpdating(false)
        }
    }
    const handleConfirmAppointment = async () => { }
    const handleRescheduleAppointment = async () => { }
    const handleCancelAppointment = async () => { }

    const getButtons = (status: AppointmentStatus) => {

        if (AppointmentStatus.PENDING === status) {
            return (
                <DialogFooter className="flex space-x-2">
                    <Button disabled={isUpdating} onClick={handleRescheduleAppointment} variant="outline">Reschedule</Button>
                    <Button disabled={isUpdating} onClick={handleCancelAppointment} variant="outline" className="text-red-600 hover:text-red-700">
                        Cancel Appointment
                    </Button>
                    <Button disabled={isUpdating} onClick={handleConfirmAppointment}>Confirm</Button>
                </DialogFooter>
            )
        } else if (AppointmentStatus.PENDING_PAYMENT === status) {
            return (
                <DialogFooter className="flex space-x-2">
                    <Button disabled={isUpdating} onClick={handleConfirmPayment}>Confirm Payment</Button>
                </DialogFooter>
            )
        }
    }

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
                            <Badge className={getStatusColor(selectedAppointment.status)}>{getStatusLabel(selectedAppointment.status)}</Badge>
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
                                {`${hour}:${minute}`} ({getDifferenceTimeSlot(selectedAppointment.timeSlot)} est.)
                            </p>
                        </div>
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

                {getButtons(selectedAppointment.status)}
            </DialogContent>
        </Dialog>
    )
}

export default SelectedAppointmentModal