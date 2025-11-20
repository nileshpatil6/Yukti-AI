"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Brain,
  MessageCircle,
  Loader2,
  Circle
} from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audioUrl?: string
}

export default function VoiceModePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedVoice, setSelectedVoice] = useState("aura-asteria-en")
  const [subjects, setSubjects] = useState<any[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      const data = await response.json()
      setSubjects(data.subjects || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        await processAudio(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Failed to access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      // Convert audio to base64
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)

      reader.onloadend = async () => {
        const base64Audio = reader.result as string

        // Send to backend for transcription
        const response = await fetch("/api/voice/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64Audio }),
        })

        const data = await response.json()

        if (data.text) {
          // Add user message
          const userMessage: Message = {
            role: "user",
            content: data.text,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, userMessage])

          // Get AI response
          await getAIResponse(data.text)
        }
      }
    } catch (error) {
      console.error("Error processing audio:", error)
      alert("Failed to process audio. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const getAIResponse = async (userText: string) => {
    try {
      const response = await fetch("/api/voice/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          subjectId: selectedSubject,
          voice: selectedVoice,
        }),
      })

      const data = await response.json()

      if (data.text && data.audioUrl) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.text,
          timestamp: new Date(),
          audioUrl: data.audioUrl,
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Auto-play the response
        playAudio(data.audioUrl)
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
    }
  }

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.onplay = () => setIsPlaying(true)
    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => {
      setIsPlaying(false)
      console.error("Error playing audio")
    }

    audio.play()
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Mic className="h-8 w-8 text-purple-600" />
          Voice Mode
        </h1>
        <p className="text-gray-600">
          Talk to your AI teacher using voice commands
        </p>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Subject (Optional)
            </label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">AI Voice</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aura-asteria-en">
                  Asteria (Female, Friendly)
                </SelectItem>
                <SelectItem value="aura-luna-en">
                  Luna (Female, Professional)
                </SelectItem>
                <SelectItem value="aura-stella-en">
                  Stella (Female, Warm)
                </SelectItem>
                <SelectItem value="aura-orion-en">
                  Orion (Male, Deep)
                </SelectItem>
                <SelectItem value="aura-arcas-en">
                  Arcas (Male, Friendly)
                </SelectItem>
                <SelectItem value="aura-perseus-en">
                  Perseus (Male, Professional)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-4">
        {messages.length === 0 ? (
          <Card className="p-12 text-center">
            <Mic className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              Ready to start voice conversation
            </h3>
            <p className="text-gray-600">
              Press the microphone button below to start speaking
            </p>
          </Card>
        ) : (
          messages.map((message, index) => (
            <Card
              key={index}
              className={`p-4 ${
                message.role === "user"
                  ? "bg-blue-50 border-blue-200 ml-12"
                  : "bg-purple-50 border-purple-200 mr-12"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full ${
                    message.role === "user" ? "bg-blue-600" : "bg-purple-600"
                  }`}
                >
                  {message.role === "user" ? (
                    <MessageCircle className="h-4 w-4 text-white" />
                  ) : (
                    <Brain className="h-4 w-4 text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {message.role === "user" ? "You" : "AI Teacher"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  <p className="text-gray-800 mb-2">{message.content}</p>

                  {message.audioUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playAudio(message.audioUrl!)}
                      disabled={isPlaying}
                    >
                      <Volume2 className="h-3 w-3 mr-2" />
                      Play Response
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Recording Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Recording Button */}
          <Button
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || isPlaying}
            className={`w-48 h-48 rounded-full ${
              isRecording
                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isRecording ? (
              <div className="flex flex-col items-center">
                <Circle className="h-12 w-12 mb-2 fill-current" />
                <span className="text-sm">Recording...</span>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 mb-2 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Mic className="h-12 w-12 mb-2" />
                <span className="text-sm">Tap to Speak</span>
              </div>
            )}
          </Button>

          {/* Stop Audio Button */}
          {isPlaying && (
            <Button
              size="lg"
              variant="outline"
              onClick={stopAudio}
              className="rounded-full w-16 h-16"
            >
              <VolumeX className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Status */}
        <div className="mt-4 text-center">
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="h-2 w-2 mr-1 fill-current" />
              Recording in progress
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processing your voice...
            </Badge>
          )}
          {isPlaying && (
            <Badge className="bg-purple-600">
              <Volume2 className="h-3 w-3 mr-1" />
              Playing AI response
            </Badge>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 text-blue-900">How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tap the microphone button to start recording</li>
          <li>• Speak your question or topic</li>
          <li>• Tap again to stop and process</li>
          <li>• The AI will respond with voice and text</li>
          <li>• Select a subject for context-aware responses</li>
        </ul>
      </Card>
    </div>
  )
}
