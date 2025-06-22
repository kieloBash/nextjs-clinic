import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/utils/email/sendEmail"; 

export async function POST(req: NextRequest) {
  try {
    const { to, subject, htmlContent } = await req.json();
    const result = await sendEmail(to, subject, htmlContent);

    return NextResponse.json({
      message: "Email sent successfully",
      info: result,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: String(error) },
      { status: 500 }
    );
  }
}
