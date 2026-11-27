const { spawnSync } = require("child_process");
const fs = require("fs");

// On Windows, if current directory is an NTFS junction or symlink,
// resolve the canonical real path so Vercel CLI does not reject it.
const realPath = fs.realpathSync(process.cwd());
const args = process.argv.slice(2);
if (args.length === 0) {
  args.push("--prod");
}

console.log(`[BYT Deploy] Deploying from canonical path: ${realPath}`);
const result = spawnSync("npx", ["vercel", ...args, realPath], {
  stdio: "inherit",
  shell: true,
  cwd: realPath,
});

process.exit(result.status ?? 0);
