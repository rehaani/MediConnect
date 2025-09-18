import { verifyAuthentication } from "@/ai/flows/verify-authentication-flow";
import { NextResponse } from "next/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";

export async function POST(request: Request) {
    try {
        const body: AuthenticationResponseJSON = await request.json();
        const result = await verifyAuthentication(body);
        return NextResponse.json(result);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
