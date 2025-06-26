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
import axios from "axios"
import { AI_CHAT_PROMPT } from "@/utils/api-endpoints"
import { showToast } from "@/utils/helpers/show-toast"

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

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false)
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
        if (isOpen) {
            inputRef.current?.focus()
        }
    }, [isOpen])

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
        try {
            const res = await axios.post(AI_CHAT_PROMPT, { message: content })

            if (res && res.data) {
                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    content: res.data.payload,
                    sender: "bot",
                    timestamp: new Date(),
                }
                setMessages((prev) => [...prev, aiResponse])
            }

        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsTyping(false)
        }
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
            </Card>
        </div>
    )
}
