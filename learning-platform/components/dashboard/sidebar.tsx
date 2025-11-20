"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Gamepad2,
  Mic,
  Sparkles,
  Trophy,
  Calendar,
  Settings,
  LogOut,
  Flame,
  GraduationCap,
  FileStack,
  Zap
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Subjects", href: "/dashboard/subjects", icon: BookOpen },
  { name: "AI Teacher", href: "/dashboard/ai-teacher", icon: Brain },
  { name: "Voice Mode", href: "/dashboard/voice", icon: Mic },
  { name: "Study Planner", href: "/dashboard/study-planner", icon: Calendar },
  { name: "Flashcards", href: "/dashboard/flashcards", icon: FileStack },
  { name: "Quizzes", href: "/dashboard/quizzes", icon: Zap },
  { name: "Games", href: "/dashboard/games", icon: Gamepad2 },
  { name: "Achievements", href: "/dashboard/achievements", icon: Trophy },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <GraduationCap className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Learn
        </span>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              {getInitials(session?.user?.name || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-gray-600">0 day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* XP Badge */}
      <div className="p-4 border-t">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Total XP</span>
            <Badge variant="secondary" className="text-xs">Level 1</Badge>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            0 XP
          </div>
        </div>
      </div>

      {/* Settings & Logout */}
      <div className="p-4 border-t space-y-2">
        <Link href="/dashboard/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
