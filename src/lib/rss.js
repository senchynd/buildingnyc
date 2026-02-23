import { XMLParser } from 'fast-xml-parser';

const SUBSTACK_BASE = 'https://buildingnycdotco.substack.com';

function stripHtml(str) {
  return str?.replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim() ?? '';
}

export async function getArticlesForProject(projectSlug) {
  try {
    const response = await fetch(`${SUBSTACK_BASE}/feed?tag=${projectSlug}`);
    const xml = await response.text();

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(xml);
    const raw = result.rss.channel.item;
    const items = Array.isArray(raw) ? raw : raw ? [raw] : [];

    return items.map(item => ({
      title: stripHtml(item.title),
      description: stripHtml(item.description ?? '').substring(0, 180) + '…',
      url: item.link,
    }));
  } catch (e) {
    console.error('RSS fetch failed:', e);
    return [];
  }
}
