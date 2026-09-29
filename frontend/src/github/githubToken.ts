import { getToken } from "next-auth/jwt";
import type { NextApiRequest } from "next";

export async function getGithubAccessToken(
    req : NextApiRequest
) : Promise<String> {

    const token  = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET!
    });

    if (!token || !token.githubAccessToken){
        throw new Error("Not authenticated");
    }

    return token.githubAccessToken;
}