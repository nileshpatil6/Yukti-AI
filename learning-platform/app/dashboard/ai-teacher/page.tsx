"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Brain,
  Send,
  Sparkles,
  BookOpen,
  Loader2,
  User,
  Bot
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  citations?: string[]
}

interface Subject {
  id: string
  displayName: string
  color: string
}

export default function AITeacherPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const subjectParam = searchParams.get("subject")

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI tutor. I can help you understand concepts from your uploaded notes, answer questions, and explain things in different ways. What would you like to learn today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectParam || "")
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      const data = await response.json()
      setSubjects(data.subjects || [])

      // Auto-select if only one subject or if param provided
      if (data.subjects?.length === 1) {
        setSelectedSubject(data.subjects[0].id)
      } else if (subjectParam && data.subjects?.some((s: Subject) => s.id === subjectParam)) {
        setSelectedSubject(subjectParam)
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setLoadingSubjects(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          subjectId: selectedSubject,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          citations: data.citations,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getPersonaIcon = () => {
    // You can customize based on user's selected AI persona
    return "🤖"
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">AI Teacher</h1>
              <p className="text-gray-600">
                Ask questions about your notes and get personalized explanations
              </p>
            </div>
          </div>

          {/* Subject Selector */}
          {!loadingSubjects && subjects.length > 0 && (
            <div className="w-64">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.displayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600">
                  <AvatarFallback className="text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                    : "bg-white border shadow-sm"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <p className={message.role === "user" ? "text-white" : "text-gray-900"}>
                    {message.content}
                  </p>
                </div>

                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.citations.map((citation, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                        >
                          {citation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {message.role === "user" && (
                <Avatar className="h-10 w-10 bg-gray-200">
                  <AvatarFallback>
                    <User className="h-5 w-5 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600">
                <AvatarFallback className="text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border shadow-sm rounded-2xl px-6 py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-6">
        <div className="max-w-4xl mx-auto">
          {subjects.length === 0 && !loadingSubjects && (
            <Card className="p-6 bg-blue-50 border-blue-200 mb-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    No subjects with notes yet
                  </p>
                  <p className="text-sm text-blue-700">
                    Create a subject and upload your notes to get personalized answers
                    from your AI teacher!
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedSubject
                    ? "Ask a question about this subject..."
                    : "Ask me anything, or select a subject for context..."
                }
                className="min-h-[60px] pr-12 resize-none"
                disabled={loading}
              />
              {input.trim() && (
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={loading}
                  className="absolute bottom-2 right-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Gemini AI</span>
            </div>
            <span className="text-xs">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
