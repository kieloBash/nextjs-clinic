"use client"

import { useEffect, useState } from "react"
import { Clock, User as UserIcon, UserCheck, UserX, Trash2, SkipForward, ArrowRight, Users2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import useDoctorQueues from "../_hooks/use-queues"
import { User } from "next-auth"
import { FullQueueType } from "@/types/prisma.type"
import { QueueStatus } from "@prisma/client"
import axios from "axios"
import { CONFIRM_QUEUE, REMOVE_QUEUE, UPDATE_QUEUE_STATUS } from "@/utils/api-endpoints"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { showToast } from "@/utils/helpers/show-toast"
import AddToQueueModal from "./add-to-queue-modal"
import CompleteAppointmentModal from "./complete-appointment-modal-queue"
import { useQueryClient } from "@tanstack/react-query"
import { KEY_GET_DOCTOR_APPOINTMENTS, KEY_GET_DOCTOR_QUEUES, KEY_GET_DOCTOR_TIMESLOTS } from "../_hooks/keys"
import MainLoadingPage from "@/components/globals/main-loading"

export default function DoctorQueue({ user }: { user: User }) {
    const queues = useDoctorQueues({ doctorId: user?.id });
    const queryClient = useQueryClient();

    const [queue, setQueue] = useState<FullQueueType[]>([]);
    const [skippedQueues, setSkippedQueues] = useState<FullQueueType[]>([]);
    const [currentQueue, setCurrentQueue] = useState<FullQueueType | null | undefined>(null);

    useEffect(() => {
        if (queues.payload) {
            setQueue(queues.payload.filter((q) => q.status === QueueStatus.WAITING))
            setSkippedQueues(queues.payload.filter((q) => q.status === QueueStatus.SKIPPED))
            setCurrentQueue(queues.payload.find((q) => q.status === QueueStatus.APPROVED))
        }
    }, [queues.payload])

    const handleCallNext = async () => {
        if (queue.length === 0) return;

        const nextQueue = queue[0];

        // Optimistically update UI
        setCurrentQueue(nextQueue);
        setQueue((prev) => prev.slice(1));

        try {
            const res = await axios.post(CONFIRM_QUEUE, {
                queueId: nextQueue.id,
            });
            // Optional: show success toast
            showToast("success", "Queue confirmed", res.data.message);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_QUEUES], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_APPOINTMENTS], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_TIMESLOTS], exact: false }),
            ]);

        } catch (error: any) {
            // Rollback on failure
            setCurrentQueue(null);
            setQueue((prev) => [nextQueue, ...prev]); // Reinsert at the start
            showToast("error", "Failed to confirm queue", error?.response?.data?.message || error.message);
        }
    };

    const handleCompleteAppointment = () => {
        setCurrentQueue(null)
    }

    const handleSkipQueue = async (queueId: string) => {
        const queueToSkip = queue.find((p) => p.id === queueId)
        if (queueToSkip) {
            // Optimistic update
            setSkippedQueues((prev) => [...prev, { ...queueToSkip, status: QueueStatus.SKIPPED }])
            setQueue((prev) => prev.filter((p) => p.id !== queueId))

            try {
                const res = await axios.patch(UPDATE_QUEUE_STATUS, {
                    queueId,
                    status: QueueStatus.SKIPPED
                })
                showToast("success", CREATED_PROMPT_SUCCESS, res.data.message)
            } catch (error: any) {
                // Rollback the optimistic update
                setSkippedQueues((prev) => prev.filter((p) => p.id !== queueId))
                setQueue((prev) => [...prev, queueToSkip])
                showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
            }
        }
    }


    const handleRemoveFromQueue = async (queueId: string) => {
        const queueToRemove = queue.find((p) => p.id === queueId);
        if (!queueToRemove) return;

        // Optimistic update
        setQueue((prev) => prev.filter((p) => p.id !== queueId));

        try {
            const res = await axios.delete(`${REMOVE_QUEUE}?queueId=${queueId}`);
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);
        } catch (error: any) {
            // Rollback on failure
            setQueue((prev) => [...prev, queueToRemove]);
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        }
    };


    const handleReturnSkippedToQueue = async (queueId: string) => {
        const skippedQueue = skippedQueues.find((p) => p.id === queueId);
        if (skippedQueue) {
            // Optimistic update
            const updatedQueue = { ...skippedQueue, status: QueueStatus.WAITING };
            setQueue((prev) => [...prev, updatedQueue]);
            setSkippedQueues((prev) => prev.filter((p) => p.id !== queueId));

            try {
                const res = await axios.patch(UPDATE_QUEUE_STATUS, {
                    queueId,
                    status: QueueStatus.WAITING
                })
                showToast("success", "Queue returned", res.data.message);
            } catch (error: any) {
                // Rollback on failure
                setQueue((prev) => prev.filter((p) => p.id !== queueId));
                setSkippedQueues((prev) => [...prev, skippedQueue]);
                showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
            }
        }
    };

    const handleRemoveSkipped = async (queueId: string) => {
        const skippedToRemove = skippedQueues.find((p) => p.id === queueId);
        if (!skippedToRemove) return;

        // Optimistic update
        setSkippedQueues((prev) => prev.filter((p) => p.id !== queueId));

        try {
            const res = await axios.delete(`${REMOVE_QUEUE}?queueId=${queueId}`);
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);
        } catch (error: any) {
            // Rollback on failure
            setSkippedQueues((prev) => [...prev, skippedToRemove]);
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        }
    };


    const handleClearAllQueue = () => {
        setQueue([])
        setSkippedQueues([])
        setCurrentQueue(null)
        //TODO: add backend
    }

    const handleAddToQueue = (newQueue: FullQueueType & { rollback?: boolean }) => {
        if (newQueue.rollback) {
            setQueue((prev) => prev.filter((q) => q.id !== newQueue.id));
        } else {
            setQueue((prev) => [...prev, newQueue]);
        }
    };

    const nextThreeQueues = queue.slice(0, 3)

    return (
        <div className="space-y-6">
            {/* Current Patient & Next Up Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Patient */}
                <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-green-800">
                            <UserCheck className="w-5 h-5 mr-2" />
                            Current Patient
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentQueue ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{currentQueue.patient.name}</h3>
                                    <p className="text-sm text-muted-foreground">Email: {currentQueue.patient.email}</p>
                                    <p className="text-sm text-muted-foreground">Phone: {currentQueue.patient.phone}</p>
                                </div>
                                {/* <Button onClick={handleCompleteAppointment} className="w-full">
                                    Complete Appointment
                                </Button> */}
                                <CompleteAppointmentModal queue={currentQueue} onClose={handleCompleteAppointment} />
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <UserIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No current patient</p>
                                {queue.length > 0 && (
                                    <Button onClick={handleCallNext} className="mt-4">
                                        Call Next Patient
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Next Up */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-blue-800">
                            <Clock className="w-5 h-5 mr-2" />
                            Next Up
                        </CardTitle>
                        <CardDescription>Next {Math.min(3, queue.length)} patients in queue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nextThreeQueues.length > 0 ? (
                            <div className="space-y-3">
                                {nextThreeQueues.map((queue, index) => (
                                    <div key={queue.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div className="flex items-center space-x-3">
                                            <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}</Badge>
                                            <div>
                                                <p className="font-medium">{queue.patient.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {queue.patient.email} • {queue.patient.phone}
                                                </p>
                                            </div>
                                        </div>
                                        {index === 0 && <ArrowRight className="w-4 h-4 text-blue-600" />}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground">No patients in queue</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Queue Management */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Patient Queue ({queue.length})</h2>
                <div className="flex space-x-2">
                    {!currentQueue && queue.length > 0 && (
                        <Button onClick={handleCallNext}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Call Next Patient
                        </Button>
                    )}
                    <AddToQueueModal onAddToQueue={handleAddToQueue} />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={queue.length === 0 && skippedQueues.length === 0}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Queue
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear All Queue</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove all patients from the queue and skipped list. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearAllQueue}>Clear All</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Main Queue */}
            <Card>
                <CardHeader>
                    <CardTitle>Waiting Patients</CardTitle>
                </CardHeader>
                <CardContent>
                    {queue.length > 0 ? (
                        <div className="space-y-3">
                            {queue.map((queue, index) => {
                                console.log(queue)
                                const patient = queue.patient;

                                return (
                                    <div
                                        key={queue.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Badge variant="outline">#{index + 1}</Badge>
                                            <div>
                                                <h4 className="font-medium">{patient.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {patient.email} • {patient.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleSkipQueue(queue.id)}>
                                                <SkipForward className="w-4 h-4 mr-1" />
                                                Skip
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <UserX className="w-4 h-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Patient</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove {patient.name} from the queue?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRemoveFromQueue(queue.id)}>
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users2 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No patients in queue</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Skipped Patients */}
            {skippedQueues.length > 0 && (
                <>
                    <Separator />
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <SkipForward className="w-5 h-5 mr-2" />
                                Skipped Patients ({skippedQueues.length})
                            </CardTitle>
                            <CardDescription>Patients who were skipped and can be returned to the queue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {skippedQueues.map((queue) => (
                                    <div
                                        key={queue.id}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                                    >
                                        <div>
                                            <h4 className="font-medium">{queue.patient.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {queue.patient.email} • {queue.patient.phone}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleReturnSkippedToQueue(queue.id)}>
                                                Return to Queue
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <UserX className="w-4 h-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Skipped Patient</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to permanently remove {queue.patient.name} from the skipped list?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRemoveSkipped(queue.id)}>
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
