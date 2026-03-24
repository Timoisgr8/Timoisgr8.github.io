export interface PortfolioConfig {
  display: boolean;
  description?: string;
  featured?: boolean;
  demo?: string;
  tags?: string[];
  order?: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
  updatedAt: string;
  defaultBranch: string;
  portfolio: PortfolioConfig;
}

export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  location: string | null;
  blog: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
  updated_at: string;
  default_branch: string;
}
