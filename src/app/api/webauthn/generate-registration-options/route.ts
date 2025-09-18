import { generateRegistrationOptions } from "@/ai/flows/generate-registration-options-flow";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const options = await generateRegistrationOptions();
        return NextResponse.json(options);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
