import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Get leaderboard data
    const { data, error } = await supabase
      .from("voom_user_progress")
      .select("*")
      .eq("room_id", roomId)
      .order("questions_solved", { ascending: false })
      .order("total_points", { ascending: false })
      .order("last_solved_at", { ascending: true });

    if (error) {
      throw error;
    }

    const leaderboard = data.map((entry: any, index: number) => ({
      rank: index + 1,
      user_id: entry.user_id,
      user_name: entry.user_name,
      questions_solved: entry.questions_solved,
      total_points: entry.total_points,
      last_solved_at: entry.last_solved_at
    }));

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard
    });

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
