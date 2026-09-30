export interface GithubRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;

  private: boolean;

  url: string;
  cloneUrl: string;

  defaultBranch: string;

  language: string | null;
  description: string | null;

  updatedAt: string;
}