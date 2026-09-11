// Official Meta Ad Library (Graph API `ads_archive`) client. This is the same
// public tool as https://www.facebook.com/ads/library — Meta publishes running
// ad creatives on purpose, for anyone to inspect. No login, no scraping, no
// personal data: results are ad content plus the advertiser Page name, never
// anything about the people who saw or clicked the ad.
const ENDPOINT = 'https://graph.facebook.com/v19.0/ads_archive';
const FIELDS = ['id', 'page_name', 'ad_creative_bodies', 'ad_creative_link_titles', 'ad_delivery_start_time', 'ad_snapshot_url'].join(',');

/** Throws if META_AD_LIBRARY_TOKEN is not configured — there is no offline/mock fallback. */
export async function searchAdsByPageId(pageId, { accessToken, country = 'BR', fetchImpl = fetch, limit = 25 } = {}) {
  if (!accessToken) throw new Error('provider_not_configured');
  const url = new URL(ENDPOINT);
  url.searchParams.set('search_page_ids', JSON.stringify([pageId]));
  url.searchParams.set('ad_reached_countries', JSON.stringify([country]));
  url.searchParams.set('ad_active_status', 'ACTIVE');
  url.searchParams.set('fields', FIELDS);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('access_token', accessToken);
  const response = await fetchImpl(url.toString());
  if (!response.ok) throw new Error(`ad_library_http_${response.status}`);
  const body = await response.json();
  return (body.data || []).map(ad => ({
    adId: ad.id,
    pageName: ad.page_name,
    headline: ad.ad_creative_link_titles?.[0] || null,
    creativeTheme: ad.ad_creative_bodies?.[0]?.slice(0, 500) || null,
    startedAt: ad.ad_delivery_start_time || null,
    sourceUrl: ad.ad_snapshot_url,
  }));
}
