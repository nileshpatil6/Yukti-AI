"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Gamepad2,
  Play,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Plus,
  Star
} from "lucide-react"

interface Game {
  id: string
  topicId: string
  topic: {
    title: string
    subject: {
      id: string
      name: string
      color: string
    }
  }
  gameType: string
  createdAt: string
  sessions: {
    id: string
    score: number
    completedAt: string
  }[]
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [stats, setStats] = useState({
    totalGames: 0,
    totalSessions: 0,
    averageScore: 0,
    highScore: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/games")
      const data = await response.json()

      setGames(data.games || [])
      setStats(data.stats || stats)
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType.toLowerCase()) {
      case "trivia":
        return "🧩"
      case "matching":
        return "🎯"
      case "memory":
        return "🧠"
      case "puzzle":
        return "🎲"
      default:
        return "🎮"
    }
  }

  const getGameTypeColor = (gameType: string) => {
    switch (gameType.toLowerCase()) {
      case "trivia":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "matching":
        return "bg-green-100 text-green-700 border-green-200"
      case "memory":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "puzzle":
        return "bg-orange-100 text-orange-700 border-orange-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Gamepad2 className="h-8 w-8 text-purple-600" />
          Learning Games
        </h1>
        <p className="text-gray-600">
          Interactive games to make learning fun and engaging
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Total Games</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalGames}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2 mb-2">
            <Play className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Sessions Played</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalSessions}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Avg Score</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.averageScore}%
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">High Score</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.highScore}%
          </div>
        </Card>
      </div>

      {/* Games List */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Games</h2>
      </div>

      {games.length === 0 ? (
        <Card className="p-12 text-center">
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No games yet</h3>
          <p className="text-gray-600 mb-6">
            Generate interactive games from your subjects to make learning fun
          </p>
          <Link href="/dashboard/subjects">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Go to Subjects
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const bestScore = game.sessions.length > 0
              ? Math.max(...game.sessions.map((s) => s.score))
              : 0
            const lastPlayed = game.sessions.length > 0
              ? game.sessions[game.sessions.length - 1].completedAt
              : null

            return (
              <Card
                key={game.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                {/* Game Icon */}
                <div className="text-6xl mb-4 text-center">
                  {getGameTypeIcon(game.gameType)}
                </div>

                {/* Subject Badge */}
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <Badge
                    style={{
                      backgroundColor: game.topic.subject.color + "20",
                      color: game.topic.subject.color,
                      borderColor: game.topic.subject.color + "40",
                    }}
                  >
                    {game.topic.subject.name}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getGameTypeColor(game.gameType)}
                  >
                    {game.gameType}
                  </Badge>
                </div>

                {/* Topic Title */}
                <h3 className="text-xl font-bold mb-4 line-clamp-2">
                  {game.topic.title}
                </h3>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Play className="h-4 w-4" />
                    <span>{game.sessions.length} plays</span>
                  </div>
                  {bestScore > 0 && (
                    <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                      <Star className="h-4 w-4" />
                      <span>{bestScore}% best</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <Link href={`/dashboard/games/${game.id}`}>
                  <Button className="w-full gap-2">
                    <Play className="h-4 w-4" />
                    Play Game
                  </Button>
                </Link>

                {/* Created/Last Played Date */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                  {lastPlayed ? (
                    <>Last played {formatDate(lastPlayed)}</>
                  ) : (
                    <>Created {formatDate(game.createdAt)}</>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
