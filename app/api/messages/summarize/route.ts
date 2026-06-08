import { NextResponse } from "next/server";
import { readDB } from "../../../lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || request.headers.get("x-user-id");
    const groupId = url.searchParams.get("groupId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Missing User ID." }, { status: 401 });
    }

    if (!groupId) {
      return NextResponse.json({ error: "Missing Group ID." }, { status: 400 });
    }

    const db = await readDB();

    // Verify user is member of the group
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const isMember = group.managerId === userId || group.members.some((m) => m.id === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied. Not a member of this group." }, { status: 403 });
    }

    // Fetch the last 50 messages for this group
    const groupMessages = db.messages
      .filter((m) => m.groupId === groupId)
      .slice(-50);

    if (groupMessages.length === 0) {
      return NextResponse.json({
        success: true,
        summary: "No discussion messages found in this group yet. Try sending some messages to enable AI summarization!"
      });
    }

    // Smart parsing for Status, Blockers, and Next steps
    const statusUpdates: string[] = [];
    const blockers: string[] = [];
    const nextSteps: string[] = [];

    // Keywords mapping
    for (const msg of groupMessages) {
      const text = msg.content || "";
      const textLower = text.toLowerCase();
      const sender = msg.userName.split(" ")[0];

      // Identify Blockers
      if (
        textLower.includes("blocker") ||
        textLower.includes("stuck") ||
        textLower.includes("issue") ||
        textLower.includes("problem") ||
        textLower.includes("error") ||
        textLower.includes("⚠️") ||
        textLower.includes("needs help") ||
        textLower.includes("lock")
      ) {
        // Format blocker message beautifully
        let cleaned = text.replace(/⚠️/g, "").replace(/blocker:/gi, "").trim();
        if (cleaned.length > 80) cleaned = cleaned.substring(0, 77) + "...";
        blockers.push(`${sender}: ${cleaned}`);
      }
      // Identify Status / Completions
      else if (
        textLower.includes("finished") ||
        textLower.includes("completed") ||
        textLower.includes("done") ||
        textLower.includes("setup") ||
        textLower.includes("designed") ||
        textLower.includes("reviewing") ||
        textLower.includes("benchmarking")
      ) {
        let cleaned = text.replace(/done with/gi, "completed").trim();
        if (cleaned.length > 80) cleaned = cleaned.substring(0, 77) + "...";
        statusUpdates.push(`${sender}: ${cleaned}`);
      }
      // Identify Next Steps
      else if (
        textLower.includes("next up") ||
        textLower.includes("will") ||
        textLower.includes("going to") ||
        textLower.includes("starting") ||
        textLower.includes("schedule") ||
        textLower.includes("today") ||
        textLower.includes("friday")
      ) {
        let cleaned = text.replace(/next up:/gi, "").trim();
        if (cleaned.length > 80) cleaned = cleaned.substring(0, 77) + "...";
        nextSteps.push(`${sender}: ${cleaned}`);
      }
    }

    // Deduplicate array values
    const uniqueStatus = Array.from(new Set(statusUpdates)).slice(-3);
    const uniqueBlockers = Array.from(new Set(blockers)).slice(-3);
    const uniqueNext = Array.from(new Set(nextSteps)).slice(-3);

    // Build bulleted formatted summary
    let summaryParts: string[] = [];

    // 1. Current Status
    if (uniqueStatus.length > 0) {
      summaryParts.push("🔄 **Current Status**:\n" + uniqueStatus.map(s => `• ${s}`).join("\n"));
    } else {
      // Fallback
      const lastMsg = groupMessages[groupMessages.length - 1];
      summaryParts.push(`🔄 **Current Status**:\n• ${lastMsg.userName.split(" ")[0]} shared an update: "${lastMsg.content.substring(0, 60)}${lastMsg.content.length > 60 ? "..." : ""}"`);
    }

    // 2. Blockers
    if (uniqueBlockers.length > 0) {
      summaryParts.push("⚠️ **Blockers**:\n" + uniqueBlockers.map(b => `• ${b}`).join("\n"));
    } else {
      summaryParts.push("⚠️ **Blockers**:\n• No active blockers reported. Team is moving smoothly!");
    }

    // 3. Next Up
    if (uniqueNext.length > 0) {
      summaryParts.push("📅 **Next Up**:\n" + uniqueNext.map(n => `• ${n}`).join("\n"));
    } else {
      summaryParts.push("📅 **Next Up**:\n• Awaiting next task assignments and sync schedule.");
    }

    const summary = summaryParts.join("\n\n");

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Messages summarization error:", error);
    return NextResponse.json({ error: "Failed to generate workspace summary" }, { status: 500 });
  }
}
