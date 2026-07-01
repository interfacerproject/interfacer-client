// semantic-release configuration
// See: https://semantic-release.gitbook.io/semantic-release/usage/configuration
module.exports = {
  branches: ["main"],
  plugins: [
    // Analyze commits to determine version bump
    "@semantic-release/commit-analyzer",
    // Generate release notes from commits
    "@semantic-release/release-notes-generator",
    // Handle version bump in package.json, but DON'T publish (we handle that via @semantic-release/exec for OIDC)
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    // Publish to npm using pnpm (gets auth from setup-node OIDC)
    [
      "@semantic-release/exec",
      {
        publishCmd: 'npm publish --provenance',
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
