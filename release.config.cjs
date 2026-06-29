// semantic-release configuration
// See: https://semantic-release.gitbook.io/semantic-release/usage/configuration
module.exports = {
  branches: ["main"],
  plugins: [
    // Analyze commits to determine version bump
    "@semantic-release/commit-analyzer",
    // Generate release notes from commits
    "@semantic-release/release-notes-generator",
    // Publish to npm (updates package.json version at release time)
    [
      "@semantic-release/npm",
      {
        // npmPublish is true by default; the package is published to npm
      },
    ],
    // Create GitHub release with notes
    [
      "@semantic-release/github",
      {
        // Discussion links in release notes
        successComment: false,
        failComment: false,
      },
    ],
  ],
};
