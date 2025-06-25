"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Minimize2,
    RotateCcw,
    Clock,
    Calendar,
    Phone,
    MapPin,
    CreditCard,
    FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
    id: string
    content: string
    sender: "user" | "bot"
    timestamp: Date
}

interface SuggestionMessage {
    id: string
    text: string
    icon: React.ReactNode
    category: string
}

const suggestionMessages: SuggestionMessage[] = [
    {
        id: "1",
        text: "How do I book an appointment?",
        icon: <Calendar className="w-4 h-4" />,
        category: "Booking",
    },
    {
        id: "3",
        text: "How can I cancel or reschedule?",
        icon: <RotateCcw className="w-4 h-4" />,
        category: "Changes",
    },
    {
        id: "7",
        text: "How do I contact my doctor?",
        icon: <Phone className="w-4 h-4" />,
        category: "Contact",
    },
]

// Mock AI responses for demonstration
const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("book") || message.includes("appointment") || message.includes("schedule")) {
        return "To book an appointment, you can:\n\n1. **Online**: Log into your patient portal and select 'Book Appointment'\n2. **Phone**: Call us at (555) 123-4567 during business hours\n3. **Walk-in**: Visit our clinic for same-day appointments (subject to availability)\n\nYou'll need to select your preferred doctor, date, and time slot. We'll send you a confirmation email once booked!"
    }

    if (message.includes("hours") || message.includes("open") || message.includes("time")) {
        return "Our clinic hours are:\n\n**Monday - Friday**: 8:00 AM - 6:00 PM\n**Saturday**: 9:00 AM - 4:00 PM\n**Sunday**: Closed\n\n**Emergency Hours**: 24/7 emergency services available\n\nNote: Holiday hours may vary. Please call ahead to confirm availability."
    }

    if (message.includes("cancel") || message.includes("reschedule") || message.includes("change")) {
        return "To cancel or reschedule your appointment:\n\n**Online**: Log into your patient portal and manage your appointments\n**Phone**: Call us at (555) 123-4567 at least 24 hours in advance\n**Email**: Send us an email with your appointment details\n\n⚠️ **Cancellation Policy**: Please provide at least 24 hours notice to avoid cancellation fees."
    }

    if (message.includes("bring") || message.includes("documents") || message.includes("prepare")) {
        return "Please bring the following to your appointment:\n\n✅ **Required**:\n• Valid photo ID\n• Insurance card\n• List of current medications\n• Previous medical records (if applicable)\n\n📋 **Recommended**:\n• List of questions for your doctor\n• Symptom diary (if relevant)\n• Emergency contact information\n\n💡 **Tip**: Arrive 15 minutes early for check-in!"
    }

    if (message.includes("payment") || message.includes("insurance") || message.includes("cost")) {
        return "We accept the following payment methods:\n\n💳 **Insurance**: Most major insurance plans accepted\n💰 **Payment Options**:\n• Credit/Debit cards (Visa, MasterCard, Amex)\n• Cash\n• Check\n• HSA/FSA cards\n• Payment plans available\n\n📞 **Insurance Questions**: Call (555) 123-4567 to verify your coverage before your visit."
    }

    if (message.includes("location") || message.includes("address") || message.includes("directions")) {
        return "📍 **Clinic Location**:\nHealthcare Center\n123 Medical Drive, Suite 100\nCity, State 12345\n\n🚗 **Parking**: Free parking available in our lot\n🚌 **Public Transit**: Bus routes 15, 23, and 45 stop nearby\n\n🗺️ **Directions**: Use GPS navigation or visit our website for detailed directions and landmarks."
    }

    if (message.includes("contact") || message.includes("doctor") || message.includes("reach")) {
        return "Here are the ways to contact us:\n\n📞 **Main Line**: (555) 123-4567\n📧 **Email**: info@clinic.com\n💬 **Patient Portal**: Secure messaging with your doctor\n🏥 **Emergency**: Call 911 or visit our emergency department\n\n**Response Times**:\n• Phone: During business hours\n• Email: Within 24 hours\n• Portal messages: Within 1-2 business days"
    }

    if (message.includes("same-day") || message.includes("urgent") || message.includes("emergency")) {
        return "For same-day appointments:\n\n🚨 **Urgent Care**: Available for non-emergency urgent needs\n📞 **Call First**: (555) 123-4567 to check availability\n🏥 **Walk-ins**: Accepted based on availability (first-come, first-served)\n\n⚠️ **For Emergencies**: Call 911 or go to the nearest emergency room\n\n**Best Times for Same-Day**: Early morning or late afternoon typically have more availability."
    }

    // Default response
    return "I'm here to help with questions about appointments, clinic hours, payments, and general information. Could you please rephrase your question or try one of the suggested topics below? If you need immediate assistance, please call our clinic at (555) 123-4567."
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            content:
                "Hello! I'm your clinic assistant. I can help you with appointment booking, clinic hours, payments, and other frequently asked questions. How can I assist you today?",
            sender: "bot",
            timestamp: new Date(),
        },
    ])
    const [inputMessage, setInputMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus()
        }
    }, [isOpen, isMinimized])

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: content.trim(),
            sender: "user",
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputMessage("")
        setIsTyping(true)

        // TODO: backend for ai

        // Simulate AI thinking time
        setTimeout(
            () => {
                const botResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    content: getAIResponse(content),
                    sender: "bot",
                    timestamp: new Date(),
                }

                setMessages((prev) => [...prev, botResponse])
                setIsTyping(false)
            },
            1000 + Math.random() * 1000,
        ) // Random delay between 1-2 seconds
    }

    const handleSuggestionClick = (suggestion: SuggestionMessage) => {
        handleSendMessage(suggestion.text)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage(inputMessage)
        }
    }

    const resetChat = () => {
        setMessages([
            {
                id: "welcome",
                content:
                    "Hello! I'm your clinic assistant. I can help you with appointment booking, clinic hours, payments, and other frequently asked questions. How can I assist you today?",
                sender: "bot",
                timestamp: new Date(),
            },
        ])
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Card className={`w-96 shadow-2xl transition-all duration-300 py-0`}>
                {/* Header */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-white/20 rounded-full">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-medium">Clinic Assistant</CardTitle>
                            <p className="text-xs text-blue-100">Online • Ready to help</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={resetChat} className="h-8 w-8 p-0 text-white hover:bg-white/20">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <CardContent className="relative flex flex-col overflow-y-auto h-[350px] p-0">
                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`flex items-start space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                                                }`}
                                        >
                                            <div
                                                className={`p-2 rounded-full ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                            </div>
                                            <div
                                                className={`p-3 rounded-lg ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                <div className="text-sm whitespace-pre-line">{message.content}</div>
                                                <div
                                                    className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}
                                                >
                                                    {formatTime(message.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="flex items-start space-x-2">
                                            <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                            <div className="p-3 rounded-lg bg-gray-100">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: "0.1s" }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: "0.2s" }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div ref={messagesEndRef} />
                        </ScrollArea>

                        {/* Suggestions */}
                        {messages.length === 1 && (
                            <div className="p-4 border-t bg-gray-50">
                                <p className="text-xs text-gray-600 mb-3 font-medium">Quick questions:</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {suggestionMessages.slice(0, 3).map((suggestion) => (
                                        <Button
                                            key={suggestion.id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="justify-start text-xs h-auto p-2 hover:bg-blue-50 hover:border-blue-200"
                                        >
                                            <div className="flex items-center space-x-2">
                                                {suggestion.icon}
                                                <span className="truncate">{suggestion.text}</span>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t sticky bottom-0 z-10 bg-white w-full">
                            <div className="flex space-x-2">
                                <Input
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about appointments, hours, payments..."
                                    className="flex-1"
                                    disabled={isTyping}
                                />
                                <Button
                                    onClick={() => handleSendMessage(inputMessage)}
                                    disabled={!inputMessage.trim() || isTyping}
                                    className="bg-blue-500 hover:bg-blue-600"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
