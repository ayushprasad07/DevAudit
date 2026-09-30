import { getGithubAccessToken } from "@/github/githubToken";
import { GithubService } from "@/github/GithubService";
import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest } from "next";

export async function GET(req : NextApiRequest){
    try {
        const accessToken = await getGithubAccessToken(req);

        if(!accessToken){
            return NextResponse.json({
                success: false,
                message : "Not authenticated"
            },{
                status : 401
            })
        }

        const githubService = new GithubService(accessToken);

        const repositories = await githubService.getRepositories();

        return NextResponse.json({
            success: true,
            data : repositories
        },{
            status : 200
        });
    } catch (error) {
        console.log("Repo error : ", error);

        return NextResponse.json({
            success: false,
            message : "Error fetching repositories"
        },{
            status : 500
        })
    }
}