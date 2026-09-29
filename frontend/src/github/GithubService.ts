import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";

const GITHUB_API = "https://api.github.com";

export class GithubService{
    private async getAccessToken(): Promise<string>{
        const session =  await getServerSession(authOptions);

        if (!session ){
            throw new Error("Not authenticated");
        }

        // Token will be retrieved from the server-side NextAuth JWT.
        // We will wire this up properly through a server-side helper.
        throw new Error("GitHub access token retrieval not implemented");
    }

    private async getCurretnUser(){
        const accessToken  = await this.getAccessToken();

        const response = await fetch(`${GITHUB_API}/user`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        });

        if (!response.ok){
            throw new Error("Failed to fetch current user");
        }

        return response.json();
    }
}