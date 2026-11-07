/**
 * GBRA-224: every install surface routes through one ref, INSTALL_REF (src/core/install-ref.ts).
 */
import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { INSTALL_PIN, INSTALL_RAW_BASE, INSTALL_REF } from '../src/core/install-ref.ts';
import { driftIn, findInstallRefDrift, rewriteText } from '../scripts/check-install-ref.ts';

const ROOT = join(import.meta.dir, '..');

describe('install ref lint', () => {
  test('the constant uses the fork branch a new install follows by default', () => {
    expect(INSTALL_REF).toBe('main');
    expect(INSTALL_PIN).toBe('github:jaypetez/gbrain-copilot#main');
    expect(INSTALL_RAW_BASE).toBe('https://raw.githubusercontent.com/jaypetez/gbrain-copilot/main');
  });

  test('the repository has no install surface off the constant', () => {
    expect(findInstallRefDrift(ROOT).map(d => `${d.file}:${d.line} ${d.found}`)).toEqual([]);
  });

  test('docs: a master or other named pin, or a runbook or helper fetch off the ref, is drift; exact pins are not', () => {
    const doc = [
      'bun install -g github:jaypetez/gbrain-copilot#master',
      'bun install -g github:jaypetez/gbrain-copilot#stable',
      'bun add -g github:jaypetez/gbrain-copilot#v0.60.1.0 and github:jaypetez/gbrain-copilot#v${VERSION}',
      'curl https://raw.githubusercontent.com/jaypetez/gbrain-copilot/master/BOOTSTRAP_FOR_AGENTS.md',
      'curl https://raw.githubusercontent.com/jaypetez/gbrain-copilot/main/scripts/setup-in-agent.sh',
      'read https://raw.githubusercontent.com/jaypetez/gbrain-copilot/master/INSTALL_FOR_AGENTS.md',
      'bun install -g github:jaypetez/gbrain-copilot#latest-stable',
    ].join('\n');
    expect(driftIn('docs/x.md', doc, 'latest-stable').map(d => [d.line, d.found])).toEqual([
      [1, 'github:jaypetez/gbrain-copilot#master'],
      [2, 'github:jaypetez/gbrain-copilot#stable'],
      [4, 'raw.githubusercontent.com/jaypetez/gbrain-copilot/master/BOOTSTRAP_FOR_AGENTS.md'],
      [5, 'raw.githubusercontent.com/jaypetez/gbrain-copilot/main/scripts/setup-in-agent.sh'],
    ]);
    expect(driftIn('docs/x.md', doc).map(d => d.line).sort()).toEqual([1, 2, 4, 7]);
    expect(driftIn('CHANGELOG.md', doc)).toEqual([]);
    expect(driftIn('docs/x.md', `bun add -g github:jaypetez/gbrain-copilot#${'d'.repeat(40)}\nbun add -g github:jaypetez/gbrain-copilot#abc1234\n`)).toEqual([]);
    expect(rewriteText('docs/x.md', `github:jaypetez/gbrain-copilot#${'a'.repeat(40)}`, 'stable')).toBe(`github:jaypetez/gbrain-copilot#${'a'.repeat(40)}`);
  });

  test('TypeScript never spells an install ref; it imports the constant', () => {
    expect(driftIn('src/x.ts', "const a = 'bun install -g github:jaypetez/gbrain-copilot#latest-stable';")).toHaveLength(1);
    expect(driftIn('src/x.ts', "const u = 'https://raw.githubusercontent.com/jaypetez/gbrain-copilot/latest-stable/BOOTSTRAP_FOR_AGENTS.md';")).toHaveLength(1);
    expect(driftIn('src/x.ts', 'const a = `github:jaypetez/gbrain-copilot#v${v}`; const b = INSTALL_PIN;')).toEqual([]);
  });

  test('the setup helper resolves the constant, and --write flips every text surface in one pass', () => {
    expect(driftIn('scripts/setup-in-agent.sh', 'gbrain_install_ref=master\n')).toHaveLength(1);
    const doc = 'github:jaypetez/gbrain-copilot#latest-stable\nraw.githubusercontent.com/jaypetez/gbrain-copilot/latest-stable/BOOTSTRAP_FOR_AGENTS.md\ngbrain_install_ref=latest-stable\ngithub:jaypetez/gbrain-copilot#v1.2.3.4\n';
    const flipped = rewriteText('README.md', doc, 'stable');
    expect(flipped).toBe('github:jaypetez/gbrain-copilot#stable\nraw.githubusercontent.com/jaypetez/gbrain-copilot/stable/BOOTSTRAP_FOR_AGENTS.md\ngbrain_install_ref=stable\ngithub:jaypetez/gbrain-copilot#v1.2.3.4\n');
    expect(driftIn('README.md', flipped, 'stable')).toEqual([]);
    expect(rewriteText('src/x.ts', doc, 'stable')).toBe(doc);
  });
});
