const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

const tryReadSocialSettings = (repoRoot) => {
  try {
    return readJson(path.join(repoRoot, 'content', 'social_settings.json'));
  } catch (e) {
    return null;
  }
};

const isPlatformEnabled = (socialSettings, platformName) => {
  if (socialSettings && socialSettings.enabled === false) return false;
  const list = Array.isArray(socialSettings?.platforms) ? socialSettings.platforms : [];
  const found = list.find(
    (p) => String(p?.name || '').toLowerCase() === String(platformName || '').toLowerCase()
  );
  if (!found) return false;
  return found.enabled !== false;
};

const getChangedFiles = () => {
  const out = execSync('git diff-tree --no-commit-id --name-status -r HEAD', { encoding: 'utf8' });
  return out
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split(/\s+/);
      const file = rest.join(' ').trim();
      return { status, file };
    });
};

exports.onSuccess = async ({ utils }) => {
  const repoRoot = process.cwd();
  const socialSettings = tryReadSocialSettings(repoRoot);
  if (socialSettings && socialSettings.enabled === false) return;

  const { publishPromotion } = require(path.join(repoRoot, 'netlify', 'functions', 'social-publisher.js'));

  let changed;
  try {
    changed = getChangedFiles();
  } catch (e) {
    utils.build.failBuild(`Errore lettura git diff: ${e.message}`);
    return;
  }

  const targets = changed.filter(
    (c) =>
      (c.status === 'A' || c.status === 'M') &&
      (c.file.startsWith('content/prodotti/') || c.file.startsWith('content/offerte/')) &&
      c.file.endsWith('.json')
  );

  if (targets.length === 0) return;

  for (const target of targets) {
    try {
      const data = readJson(path.join(repoRoot, target.file));

      if (data.publish_to_social === false || data.active === false) continue;

      const title = data.title || '';
      const body = data.body || data.subtitle || '';
      const price = data.price ? `\nPrezzo: ${data.price}` : '';
      const content = `${title}\n\n${body}${price}\n\nScopri di più sul nostro sito!`;
      const caption = `${title} - ${String(body).substring(0, 100)}...`;

      const selectedPlatforms = Array.isArray(data.social_platforms) ? data.social_platforms : ['Facebook'];
      const enabledPlatforms = selectedPlatforms.filter((p) => isPlatformEnabled(socialSettings, p));
      if (enabledPlatforms.length === 0) continue;

      await publishPromotion(content, '', caption, enabledPlatforms);
    } catch (e) {
      utils.status.show({
        title: 'Social publish error',
        summary: `${target.file}: ${e.message}`,
      });
    }
  }
};

