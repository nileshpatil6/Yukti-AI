"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GameRenderer } from "@/components/games/game-renderer"
import { ArrowLeft, Gamepad2 } from "lucide-react"

interface Game {
  id: string
  topicId: string
  topic: {
    title: string
    subject: {
      name: string
      color: string
    }
  }
  gameType: string
  htmlContent: string
}

export default function GamePlayPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGame()
  }, [gameId])

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`)
      const data = await response.json()

      setGame(data.game)

      // Create a game session
      await fetch(`/api/games/${gameId}/sessions`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error fetching game:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    router.push("/dashboard/games")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Game not found</h3>
          <Button onClick={() => router.push("/dashboard/games")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <GameRenderer
        htmlContent={game.htmlContent}
        title={game.topic.title}
        gameType={game.gameType}
        onClose={handleClose}
      />
    </div>
  )
}
