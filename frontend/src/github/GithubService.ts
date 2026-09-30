import type {GithubRepository} from "@/github/types";

const GITHUB_API = "https://api.github.com";

interface GitHubRepositoryResponse {
  id: number;
  name: string;
  full_name: string;

  owner: {
    login: string;
  };

  private: boolean;

  html_url: string;
  clone_url: string;

  default_branch: string;

  language: string | null;
  description: string | null;

  updated_at: string;
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

  async getRepositories(): Promise<GithubRepository[]> {
        const repositories =
            await this.request<GitHubRepositoryResponse[]>(
            "/user/repos?sort=updated&per_page=100"
            );

        return repositories.map((repository) => ({
            id: repository.id,
            name: repository.name,
            fullName: repository.full_name,
            owner: repository.owner.login,
            url: repository.html_url,
            cloneUrl: repository.clone_url,
            private: repository.private,
            defaultBranch: repository.default_branch,
            language: repository.language,
            description: repository.description,
            updatedAt: repository.updated_at,
        }));
    }
}