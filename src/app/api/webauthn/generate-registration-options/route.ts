import { generateRegistrationOptions } from "@/ai/flows/generate-registration-options-flow";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
        const options = await generateRegistrationOptions({ email });
        return NextResponse.json(options);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
