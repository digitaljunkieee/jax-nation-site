// Render build step: pulls the latest content from Sanity and bakes it into index.html.
// Build command on Render:  node build.js     (publish directory: .)
//
// Safe by design: if Sanity is not configured or cannot be reached, index.html is left
// exactly as committed, so the site never breaks because of the CMS.
//
// Env vars (set in Render): SANITY_PROJECT_ID (required), SANITY_DATASET (default production).
// Testing without network: SANITY_MOCK_FILE=path/to/response.json
const fs = require('fs');
const crypto = require('crypto');

const FILE = 'index.html';
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';

const QUERY = `{
  "film": *[_type=="film"] | order(coalesce(sortNumber, 9999) asc, _createdAt desc){
    title, blurb, youtubeUrl, "thumb": thumbnail.asset->url
  },
  "show": *[_type=="show" && defined(date)] | order(date asc){ title, date, venue, price },
  "merch": *[_type=="merch"] | order(coalesce(sortNumber, 9999) asc, _createdAt desc){
    name, price, description, "imageUrl": image.asset->url
  },
  "settings": *[_id=="siteSettings"][0]{
    studioRate, studioNote, studioFacts[]{label, value},
    founderName, founderRole, founderBio, "founderPhoto": founderPhoto.asset->url
  }
}`;

const log = (m) => console.log('[sanity-build] ' + m);
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const httpsUrl = (v) => (/^https:\/\//i.test(str(v)) ? str(v) : '');
const img = (v, w) => (str(v).startsWith('https://cdn.sanity.io/') ? `${str(v)}?w=${w}&auto=format&q=80` : '');

async function fetchContent() {
  if (process.env.SANITY_MOCK_FILE) return JSON.parse(fs.readFileSync(process.env.SANITY_MOCK_FILE, 'utf8'));
  const url = `https://${projectId}.api.sanity.io/v2025-01-01/data/query/${dataset}?query=${encodeURIComponent(QUERY)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
  return (await res.json()).result;
}

function merge(state, c) {
  const films = (c.film || []).filter((f) => str(f.title)).map((f) => ({
    title: str(f.title), blurb: str(f.blurb), youtubeUrl: httpsUrl(f.youtubeUrl), thumb: img(f.thumb, 640),
  }));
  if (films.length) state.portfolio.items = films;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const shows = (c.show || []).filter((s) => str(s.title) && str(s.date) >= yesterday).map((s) => ({
    title: str(s.title), date: str(s.date), venue: str(s.venue), price: str(s.price),
  }));
  state.shows.items = shows; // an empty list is valid: it shows the "nothing yet" message

  const merch = (c.merch || []).filter((m) => str(m.name)).map((m) => ({
    name: str(m.name), price: str(m.price), description: str(m.description), imageUrl: img(m.imageUrl, 700),
  }));
  if (merch.length) state.merch.items = merch;

  const s = c.settings || {};
  if (str(s.studioRate)) state.studioSpace.priceLine = str(s.studioRate);
  if (str(s.studioNote)) state.studioSpace.note = str(s.studioNote);
  const facts = (s.studioFacts || []).filter((f) => str(f.label) && str(f.value)).map((f) => ({ label: str(f.label), value: str(f.value) }));
  if (facts.length) state.studioSpace.facts = facts;
  if (str(s.founderName)) state.founder.name = str(s.founderName);
  if (str(s.founderRole)) state.founder.role = str(s.founderRole);
  if (str(s.founderBio)) state.founder.bio = str(s.founderBio);
  if (img(s.founderPhoto, 800)) state.founder.photoUrl = img(s.founderPhoto, 800);
  return { films: films.length, shows: shows.length, merch: merch.length };
}

(async () => {
  if (!projectId && !process.env.SANITY_MOCK_FILE) { log('SANITY_PROJECT_ID not set, keeping index.html as committed.'); return; }
  let content;
  try { content = await fetchContent(); } catch (e) { log('Could not reach Sanity (' + e.message + '), keeping index.html as committed.'); return; }
  if (!content) { log('Empty response, keeping index.html as committed.'); return; }

  const html = fs.readFileSync(FILE, 'utf8');
  const STATE_OPEN = '<script id="state-data" type="application/json">';
  const sStart = html.indexOf(STATE_OPEN);
  const sEnd = html.indexOf('</script>', sStart);
  // The real template tag starts a line; the same text also appears inside the page's own script strings
  const aOpen = '<script id="tpl-a" type="text/plain">';
  const aTag = html.indexOf('\n' + aOpen);
  const aStart = aTag < 0 ? -1 : aTag + 1;
  const aEnd = html.indexOf('</script>', aStart);
  if (sStart < 0 || sEnd < 0 || aStart < 0 || aEnd < 0) throw new Error('index.html markers not found');

  const state = JSON.parse(html.slice(sStart + STATE_OPEN.length, sEnd));
  const pristineTop = html.slice(aStart + aOpen.length, aEnd); // untouched page template, so re-running always works
  const counts = merge(state, content);
  // The in-page admin only works inside Claude. Replace the passcode that is visible in the page source.
  if (state.admin) state.admin.passcode = crypto.randomBytes(12).toString('hex');

  // Reuse the page's own pre-render helper so crawlers see the text without running JavaScript
  const gp = html.match(/function getPath\(obj, path\)\{[\s\S]*?\n\}\n/);
  const blk = html.match(/\/\* PRERENDER-START \*\/([\s\S]*?)\/\* PRERENDER-END \*\//);
  if (!gp || !blk) throw new Error('prerender helper not found');
  const prerender = new Function(gp[0] + '\n' + blk[1] + '\nreturn prerenderBindings;')();

  const stateTag = STATE_OPEN + JSON.stringify(state).replace(/</g, '\\u003c') + '</script>';
  const out = prerender(pristineTop, state) + stateTag + html.slice(sEnd + '</script>'.length);
  fs.writeFileSync(FILE, out);
  log(`Updated index.html: ${counts.films} films, ${counts.shows} shows, ${counts.merch} merch items.`);
})().catch((e) => { console.error('[sanity-build] ' + e.message + ', keeping index.html as committed.'); });
