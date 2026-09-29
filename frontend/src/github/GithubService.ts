const GITHUB_API = "https://api.github.com";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
}

export class GithubService {
  constructor(private readonly accessToken: string) {}

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${GITHUB_API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API request failed: ${response.status}`
      );
    }

    return response.json();
  }

  async getCurrentUser() {
    return this.request("/user");
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    return this.request<GitHubRepository[]>(
      "/user/repos?sort=updated&per_page=100"
    );
  }
}