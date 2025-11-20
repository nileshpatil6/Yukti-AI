"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  AlertTriangle
} from "lucide-react"

interface GameRendererProps {
  htmlContent: string
  title: string
  gameType: string
  onClose?: () => void
}

export function GameRenderer({ htmlContent, title, gameType, onClose }: GameRendererProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const handleRestart = () => {
    setIframeKey((prev) => prev + 1)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isFullscreen])

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white"
          : "w-full h-full"
      } flex flex-col`}
    >
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <Badge variant="secondary">{gameType}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            title="Restart Game"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              title="Close Game"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Game Warning */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <span>
            This is AI-generated interactive content. If the game doesn't work correctly,
            try regenerating it.
          </span>
        </div>
      </div>

      {/* Game Iframe */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        <iframe
          key={iframeKey}
          srcDoc={htmlContent}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={title}
        />
      </div>
    </div>
  )
}
