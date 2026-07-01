// semantic-release configuration
// See: https://semantic-release.gitbook.io/semantic-release/usage/configuration
module.exports = {
  branches: ["main"],
  plugins: [
    // Analyze commits to determine version bump
    "@semantic-release/commit-analyzer",
    // Generate release notes from commits
    "@semantic-release/release-notes-generator",
    // Handle version bump in package.json, but skip npm publish (done in workflow step)
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    // Create GitHub release with notes
    [
      "@semantic-release/github",
      {
        successComment: false,
        failComment: false,
      },
    ],
  ],
};
