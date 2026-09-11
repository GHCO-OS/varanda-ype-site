import { landingPath, platformKeys } from '../shared/marketing-config.js';

const input = Object.fromEntries(process.argv.slice(2).map(value => {
  const [key, ...rest] = value.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));
if (!platformKeys.includes(input.platform)) throw new Error(`platform must be one of: ${platformKeys.join(', ')}`);
const slug = /^[a-z0-9_]+$/;
for (const key of ['source','medium','campaign','content','term','intent','audience','creative']) if (input[key] && !slug.test(input[key])) throw new Error(`${key} must use lowercase letters, numbers and underscores`);
const url = new URL(landingPath(input.platform), 'https://varandaype.com');
const mapping = { source: 'utm_source', medium: 'utm_medium', campaign: 'utm_campaign', content: 'utm_content', term: 'utm_term', intent: 'intent', audience: 'audience', creative: 'creative' };
for (const [inputKey, outputKey] of Object.entries(mapping)) if (input[inputKey]) url.searchParams.set(outputKey, input[inputKey]);
process.stdout.write(`${url.toString()}\n`);
