import {loadEnv} from 'vite';
const buildEnv=loadEnv('production',process.cwd(),'VITE_');
import {writeFileSync} from 'node:fs';
const origin=process.env.VITE_SITE_URL||buildEnv.VITE_SITE_URL||'https://ceylon-electronics-catalog.ssakan439.chatgpt.site';
const url=new URL(origin);if(url.protocol!=='https:')throw new Error('VITE_SITE_URL must use HTTPS');
const routes=['/','/products','/verify-quotation','/contact','/about','/legacy'];
writeFileSync('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(path=>`<url><loc>${new URL(path,url).href.replaceAll('&','&amp;')}</loc></url>`).join('')}</urlset>`);
writeFileSync('public/robots.txt',`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${new URL('/sitemap.xml',url).href}\n`);
