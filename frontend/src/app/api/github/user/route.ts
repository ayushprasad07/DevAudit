import { NextRequest, NextResponse } from "next/server";
import { getGithubAccessToken } from "@/github/githubToken";
import { NextApiRequest } from "next";

export async function GET(req : NextApiRequest){
    try {
        const accessToken = await getGithubAccessToken(req);

        const response = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            cache: "no-store",
        });

        if (!response.ok){
            return NextResponse.json({
                success: false,
                message : "Authenticatoin failed"
            },{
                status : 401
            })
        }

        const user = await response.json();

        return NextResponse.json({
        id: user.id,
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message : "Authenticatoin failed"
        },{
            status : 401
        });
    }
}