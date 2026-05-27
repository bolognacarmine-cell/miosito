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
  if (socialSettings && socialSettings.enabled === false) {
    console.log('[social-publish] Disabilitato globalmente (content/social_settings.json -> enabled=false)');
    return;
  }

  const { publishPromotion } = require(path.join(repoRoot, 'netlify', 'functions', 'social-publisher.js'));

  console.log(`[social-publish] Avvio. FACEBOOK_PAGE_ID=${process.env.FACEBOOK_PAGE_ID || '(non impostato)'}`);

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

  if (targets.length === 0) {
    console.log('[social-publish] Nessun file prodotto/offerta modificato nell’ultimo commit. Nessuna pubblicazione.');
    return;
  }

  for (const target of targets) {
    try {
      const data = readJson(path.join(repoRoot, target.file));

      if (data.publish_to_social === false || data.active === false) {
        console.log(`[social-publish] Skip ${target.file} (publish_to_social=false o active=false)`);
        continue;
      }

      const title = data.title || '';
      const body = data.body || data.subtitle || '';
      const price = data.price ? `\nPrezzo: ${data.price}` : '';
      const content = `${title}\n\n${body}${price}\n\nScopri di più sul nostro sito!`;
      const caption = `${title} - ${String(body).substring(0, 100)}...`;

      const selectedPlatforms = Array.isArray(data.social_platforms) ? data.social_platforms : ['Facebook'];
      const enabledPlatforms = selectedPlatforms.filter((p) => isPlatformEnabled(socialSettings, p));
      if (enabledPlatforms.length === 0) {
        console.log(`[social-publish] Skip ${target.file} (nessuna piattaforma abilitata tra: ${selectedPlatforms.join(', ')})`);
        continue;
      }

      console.log(`[social-publish] Pubblico ${target.file} -> ${enabledPlatforms.join(', ')}`);
      await publishPromotion(content, '', caption, enabledPlatforms);
      console.log(`[social-publish] OK ${target.file}`);
    } catch (e) {
      console.error(`[social-publish] ERRORE ${target.file}: ${e.message}`);
      utils.build.failBuild(`Social publish error: ${target.file}: ${e.message}`);
      return;
    }
  }
};

