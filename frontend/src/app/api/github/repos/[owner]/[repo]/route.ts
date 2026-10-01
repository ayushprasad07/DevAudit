import { NextResponse, NextRequest } from "next/server";
import { getGithubAccessToken } from "@/github/githubToken";
import { GithubService } from "@/github/GithubService";
import { NextApiRequest } from "next";

interface RouteContext{
    params : Promise<{
        owner : string,
        repo : string
    }>
}

export async function GET(
    req : NextApiRequest,
    context : RouteContext
){
    try{
        const {owner, repo} = await context.params;

        const accessToken = await getGithubAccessToken(req);

        if(!accessToken){
            return NextResponse.json({
                success : false,
                message : "Not authenticated"
            },
            {
                status : 401
            })
        }

        const githubService = new GithubService(accessToken);

        const repository = await githubService.getRepository(owner, repo);

        return NextResponse.json({
            success : true,
            data : repository
        },
        {
            status : 200
        })
    }
    catch(error){
        console.log("Failed to fetch repository : ", error);

        return NextResponse.json({
            success : false,
            message : "Error fetching repository"
        },
        {
            status : 500
        })
    }
}