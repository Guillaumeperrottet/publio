import { NextResponse } from "next/server";
import { markAllNotificationsAsRead } from "@/features/notifications/actions";

export async function POST() {
  try {
    await markAllNotificationsAsRead();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
