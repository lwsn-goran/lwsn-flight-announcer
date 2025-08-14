import * as cheerio from 'cheerio';

export async function GET() {
  const url = process.env.WEATHERLINK_STENKOVEC || '';
  if (!url) return new Response(JSON.stringify({ summary: 'WeatherLink URL not set', details: '' }), { status:200 });
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await resp.text();
    const $ = cheerio.load(html);
    const texts = $('body').text().replace(/\s+/g, ' ').trim();
    const summary = texts.slice(0, 200) + (texts.length > 200 ? '…' : '');
    return new Response(JSON.stringify({ summary, details: texts }), { status:200 });
  } catch (e:any) {
    return new Response(JSON.stringify({ summary: 'AWOS unavailable', details: '' }), { status:200 });
  }
}
