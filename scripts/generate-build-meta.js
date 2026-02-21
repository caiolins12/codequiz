const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getGitSha() {
  try {
    return String(execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })).trim();
  } catch {
    return null;
  }
}

const gitSha = getGitSha();
const deployId = `${(gitSha || 'local').slice(0, 12)}-${Date.now()}`;
const builtAt = new Date().toISOString();
const publicDir = path.join(process.cwd(), 'public');

const versionPayload = JSON.stringify({
  sha: deployId,
  git_sha: gitSha,
  built_at: builtAt
});
const buildMetaPayload = `window.__CODEQUIZ_BUILD_SHA='${deployId}';window.__CODEQUIZ_GIT_SHA='${gitSha || ''}';window.__CODEQUIZ_BUILT_AT='${builtAt}';`;

const outputTargets = [
  {
    versionPath: path.join(publicDir, 'version.json'),
    buildMetaPath: path.join(publicDir, 'build-meta.js')
  }
];

fs.mkdirSync(publicDir, { recursive: true });
for (const target of outputTargets) {
  fs.writeFileSync(target.versionPath, versionPayload, 'utf8');
  fs.writeFileSync(target.buildMetaPath, buildMetaPayload, 'utf8');
}

console.log(`[build-meta] version.json/build-meta.js generated for ${deployId} (public)`);
