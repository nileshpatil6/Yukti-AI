import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { roomId, questionId, userId, userName, submissionData, pointsEarned } = await req.json();

    if (!roomId || !questionId || !userId || !userName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already solved this question
    const { data: existing } = await supabase
      .from("voom_submissions")
      .select("*")
      .eq("room_id", roomId)
      .eq("question_id", questionId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Question already solved" },
        { status: 400 }
      );
    }

    // Insert submission
    const { error: submissionError } = await supabase
      .from("voom_submissions")
      .insert({
        room_id: roomId,
        question_id: questionId,
        user_id: userId,
        user_name: userName,
        submission_data: submissionData,
        points_earned: pointsEarned || 0
      });

    if (submissionError) {
      throw submissionError;
    }

    // Update user progress
    const { data: progress } = await supabase
      .from("voom_user_progress")
      .select("*")
      .eq("room_id", roomId)
      .eq("user_id", userId)
      .single();

    if (progress) {
      // Update existing progress
      await supabase
        .from("voom_user_progress")
        .update({
          questions_solved: progress.questions_solved + 1,
          total_points: progress.total_points + (pointsEarned || 0),
          last_solved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("room_id", roomId)
        .eq("user_id", userId);
    } else {
      // Create new progress
      await supabase
        .from("voom_user_progress")
        .insert({
          room_id: roomId,
          user_id: userId,
          user_name: userName,
          questions_solved: 1,
          total_points: pointsEarned || 0,
          last_solved_at: new Date().toISOString()
        });
    }

    // Update active users count
    const { data: activeUsers } = await supabase
      .from("voom_user_progress")
      .select("user_id", { count: "exact" })
      .eq("room_id", roomId);

    if (activeUsers) {
      await supabase
        .from("voom_rooms")
        .update({ active_users: activeUsers.length })
        .eq("id", roomId);
    }

    return NextResponse.json({
      success: true,
      message: "Submission recorded successfully"
    });

  } catch (error) {
    console.error("Error submitting solution:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit solution" },
      { status: 500 }
    );
  }
}
