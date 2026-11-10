import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function getGithubAccessToken(
    req : NextRequest
) : Promise<string> {

    const token  = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET!
    });

    if (!token || !token.githubAccessToken){
        throw new Error("Not authenticated");
    }

    return token.githubAccessToken;
}