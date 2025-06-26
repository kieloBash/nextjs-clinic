import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = process.env.CHAT_PROMPT;

export async function POST(req: Request) {
    const { message } = await req.json();

    if (!message || !systemMessage) {
        return new NextResponse(JSON.stringify({ message: "Missing message!" }), {
            status: 400,
        });
    }

    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4", // or "gpt-3.5-turbo"
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: message },
            ],
        });

        const response = chatCompletion.choices[0].message?.content;
        console.log({ response })

        return new NextResponse(
            JSON.stringify({
                message: "Successfully prompted to openai",
                payload: response,
            }),
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error in ai chatbot:", error);

        return new NextResponse(
            JSON.stringify({ message: "An unexpected error occurred", error: error.message }),
            { status: 500 }
        );
    }
}
