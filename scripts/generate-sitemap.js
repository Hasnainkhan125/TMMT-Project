import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define your routes here
const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/services', changefreq: 'weekly', priority: 0.9 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/knowledge', changefreq: 'weekly', priority: 0.8 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.8 },
  // Add more public routes as needed
];

async function generateSitemap() {
  try {
    // Replace with your actual domain
    const hostname = 'https://tammat.ae';
    
    const sitemap = new SitemapStream({ hostname });
    const writeStream = createWriteStream(
      resolve(__dirname, '../public/sitemap.xml')
    );

    sitemap.pipe(writeStream);

    // Add each route to the sitemap
    routes.forEach((route) => {
      sitemap.write({
        url: route.url,
        changefreq: route.changefreq,
        priority: route.priority,
        lastmod: new Date().toISOString(),
      });
    });

    sitemap.end();

    await streamToPromise(sitemap);
    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();

