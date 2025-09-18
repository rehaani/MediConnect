import { verifyRegistration } from "@/ai/flows/verify-registration-flow";
import { NextResponse } from "next/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

export async function POST(request: Request) {
    try {
        const body: RegistrationResponseJSON = await request.json();
        const result = await verifyRegistration(body);
        return NextResponse.json(result);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
