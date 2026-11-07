/**
 * repo-coordinates — single source of truth for this distribution's GitHub
 * coordinates (gbrain-copilot, the GitHub Copilot CLI port of gbrain).
 *
 * Every code path that self-updates, checks releases, fetches raw files, or
 * prints install/issue URLs imports from here, so a future re-fork is a
 * one-file change. Historical references in CHANGELOG.md, migration notes,
 * and code comments intentionally keep the upstream coordinates.
 */

/** The repo this distribution installs and upgrades from. */
export const GITHUB_REPO = 'jaypetez/gbrain-copilot';

/** The original project this distribution is forked from (attribution). */
export const UPSTREAM_REPO = 'garrytan/gbrain';

/** Default branch of GITHUB_REPO (upstream uses `master`; this fork uses `main`). */
export const DEFAULT_BRANCH = 'main';

export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
export const RELEASES_URL = `${GITHUB_URL}/releases`;
export const ISSUES_URL = `${GITHUB_URL}/issues`;
export const RELEASES_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/releases`;
export const RELEASES_API_URL = `${RELEASES_API_BASE}/latest`;
/** Raw-file base URL at any ref (branch or tag) of GITHUB_REPO. */
export const rawUrlAt = (ref: string): string => `https://raw.githubusercontent.com/${GITHUB_REPO}/${ref}`;
export const RAW_BASE_URL = rawUrlAt(DEFAULT_BRANCH);

/**
 * Repo slugs accepted by install-authenticity checks (bun-link detection and
 * npm-squatter classification in upgrade.ts). A source clone of either the
 * fork or the original upstream is a canonical install — only the unrelated
 * npm `gbrain` package should ever classify as suspect.
 */
export const ACCEPTED_REPO_SLUGS = [GITHUB_REPO, UPSTREAM_REPO];
