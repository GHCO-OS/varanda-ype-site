// Minimal robots.txt gate. No collector in this codebase may fetch a third-party
// URL without checking this first — a Disallow (or a fetch failure) means skip,
// never retry with a different user agent or route around it.
const USER_AGENT = 'VarandaYpeCompetitiveBot/1.0 (+https://varandaype.com/cookies/)';

function parseRobots(body, userAgent) {
  const groups = [];
  let current = null;
  for (const raw of body.split('\n')) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();
    if (key === 'user-agent') {
      if (!current || current.rules.length) { current = { agents: [value.toLowerCase()], rules: [] }; groups.push(current); }
      else current.agents.push(value.toLowerCase());
    } else if (key === 'disallow' && current) current.rules.push({ type: 'disallow', path: value });
    else if (key === 'allow' && current) current.rules.push({ type: 'allow', path: value });
  }
  const forUs = groups.find(group => group.agents.some(agent => userAgent.toLowerCase().startsWith(agent)));
  const wildcard = groups.find(group => group.agents.includes('*'));
  return (forUs || wildcard || { rules: [] }).rules;
}

export async function isPathAllowed(origin, path, fetchImpl = fetch, userAgent = USER_AGENT) {
  let rules;
  try {
    const response = await fetchImpl(new URL('/robots.txt', origin).toString(), { headers: { 'User-Agent': userAgent } });
    if (!response.ok) return false;
    rules = parseRobots(await response.text(), userAgent);
  } catch {
    return false;
  }
  const matches = rules.filter(rule => path.startsWith(rule.path));
  if (!matches.length) return true;
  const longest = matches.reduce((best, rule) => (rule.path.length > best.path.length ? rule : best));
  return longest.type === 'allow';
}

export { USER_AGENT };
