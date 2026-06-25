/**
 * Import client — GitHub, GitLab, and OSH auto-import.
 *
 * Ported from interfacer-gui hooks/useAutoimport.ts
 */
import { InterfacerConfig } from "../config/config";

export interface ImportedProjectData {
  main?: {
    title: string;
    link: string;
    description: string;
    tags: string[];
  };
  licenses?: Array<{ scope: string; licenseId: string }>;
}

export class ImportClient {
  constructor(private config: InterfacerConfig) {}

  /** Analyze a repository for Open Source Hardware compliance. */
  async analyzeRepoForOsh(repoUrl: string): Promise<boolean> {
    const oshUrl = this.config.oshUrl;
    if (!oshUrl) throw new Error("oshUrl not configured");

    try {
      const res = await fetch(`${oshUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoUrl }),
      });
      const data = await res.json();
      return data.ok === true;
    } catch {
      return false;
    }
  }

  /** Import project metadata from a GitHub URL. */
  async importFromGithub(url: string): Promise<ImportedProjectData> {
    // Extract owner/repo from URL
    const parts = url.replace(/\/$/, "").split("/");
    const repoName = parts.pop() || "";
    const owner = parts.pop() || "";

    if (!owner || !repoName) throw new Error(`Invalid GitHub URL: ${url}`);

    // Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (!repoRes.ok) throw new Error(`GitHub API error: ${repoRes.statusText}`);

    const repoData = await repoRes.json();

    const main = {
      title: repoData.name || repoName,
      link: repoData.html_url || url,
      description: repoData.description || "",
      tags: repoData.topics || [],
    };

    // Fetch license
    const licenses: Array<{ scope: string; licenseId: string }> = [];
    try {
      const licenseRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/license`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });
      if (licenseRes.ok) {
        const licenseData = await licenseRes.json();
        if (licenseData.license?.spdx_id) {
          licenses.push({
            scope: "All",
            licenseId: licenseData.license.spdx_id,
          });
        }
      }
    } catch {
      // License not available
    }

    // Fetch README for description
    try {
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/readme`,
        {
          headers: {
            Accept: "application/vnd.github.v3.raw",
          },
        }
      );
      if (readmeRes.ok) {
        const readme = await readmeRes.text();
        if (readme && !main.description) {
          main.description = readme.substring(0, 500);
        }
      }
    } catch {
      // Readme not available
    }

    return { main, licenses };
  }

  /** Import project metadata from a GitLab project. */
  async importFromGitlab(host: string, projectId: string): Promise<ImportedProjectData> {
    const gitlabHost = host || "https://gitlab.com";

    const metadataRes = await fetch(`${gitlabHost}/api/v4/projects/${projectId}`);
    if (!metadataRes.ok) throw new Error(`GitLab API error: ${metadataRes.statusText}`);

    const metadata = await metadataRes.json();

    const main = {
      title: metadata.name || "",
      link: metadata.web_url || "",
      description: metadata.description || "",
      tags: metadata.tag_list || [],
    };

    return { main };
  }
}
