/** The fork's single install ref; switch only after it publishes stable evidence and tags. */
import { GITHUB_REPO, rawUrlAt } from './repo-coordinates.ts';

export const INSTALL_REF = 'main';
export const INSTALL_PIN = `github:${GITHUB_REPO}#${INSTALL_REF}`;
export const INSTALL_RAW_BASE = rawUrlAt(INSTALL_REF);
