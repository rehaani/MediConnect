import { generateAuthenticationOptions } from "@/ai/flows/generate-authentication-options-flow";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const options = await generateAuthenticationOptions();
        return NextResponse.json(options);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
