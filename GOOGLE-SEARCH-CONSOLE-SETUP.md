# Google Search Console Setup Guide

Complete guide to set up Google Search Console for Tammat and improve your search engine visibility.

## Overview

Google Search Console (GSC) is a free tool that helps you:
- Monitor your site's presence in Google Search results
- Submit sitemaps for faster indexing
- Identify and fix indexing issues
- Track search performance and rankings
- Receive alerts about issues

## Step-by-Step Setup

### 1. Create/Access Google Search Console Account

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click "Add Property"

### 2. Verify Domain Ownership

You have two verification options:

#### Option A: Domain Property (Recommended)

This verifies all URLs across all subdomains and protocols (http, https, www, non-www).

1. Select **"Domain"** property type
2. Enter your domain: `tammat.ae`
3. Copy the TXT record provided
4. Add it to your domain's DNS settings in Hostinger:
   - Log into Hostinger control panel
   - Navigate to DNS settings
   - Add a TXT record:
     - **Name**: `@` or leave blank
     - **Value**: Paste the verification code from GSC
     - **TTL**: 3600 (or default)
5. Click "Verify" in GSC (may take a few minutes to 48 hours)

#### Option B: URL Prefix

This verifies a specific URL (e.g., https://tammat.ae).

1. Select **"URL prefix"** property type
2. Enter: `https://tammat.ae`
3. Choose verification method:
   - **HTML file upload** (easiest for React apps):
     - Download the HTML verification file
     - Add it to `/public/` folder in your React project
     - Rebuild and deploy: `npm run build`
     - Click "Verify"
   - **HTML tag** (alternative):
     - Copy the meta tag
     - Add to `index.html` in `<head>` section
     - Rebuild and deploy
     - Click "Verify"

### 3. Submit Sitemap

Once verified:

1. In GSC, go to **Sitemaps** in the left sidebar
2. Enter sitemap URL: `sitemap.xml`
3. Click **Submit**
4. Wait for Google to process (can take hours to days)

Your sitemap URL will be: `https://tammat.ae/sitemap.xml`

### 4. Request Indexing for Key Pages

For faster indexing of important pages:

1. In GSC, go to **URL Inspection** in the left sidebar
2. Enter a URL to inspect (e.g., `https://tammat.ae`)
3. Click **Request Indexing**
4. Repeat for key pages:
   - `https://tammat.ae/services`
   - `https://tammat.ae/about`
   - `https://tammat.ae/contact`
   - `https://tammat.ae/knowledge`

**Note**: You can request indexing for up to 10 URLs per day.

### 5. Set Up Email Alerts

1. In GSC, click the settings icon (⚙️) in top right
2. Go to **Users and Permissions**
3. Ensure your email is listed
4. Alerts will be sent for:
   - Critical site issues
   - Manual actions
   - Security issues

## What to Monitor

### Performance Report

Track how your site appears in Google Search:

1. Go to **Performance** in GSC
2. Monitor these metrics:
   - **Total clicks**: How many users clicked on your site
   - **Total impressions**: How many times your site appeared in search
   - **Average CTR**: Click-through rate
   - **Average position**: Your ranking in search results

### Coverage Report

Check indexing status:

1. Go to **Coverage** (or **Pages** in new interface)
2. Look for:
   - ✅ **Valid pages**: Successfully indexed
   - ⚠️ **Warnings**: Indexed with issues
   - ❌ **Errors**: Not indexed due to problems
   - ℹ️ **Excluded**: Intentionally not indexed

### URL Inspection

Check individual page status:

1. Go to **URL Inspection**
2. Enter any URL
3. See:
   - Is it indexed?
   - Any crawl errors?
   - Mobile usability issues?
   - Rich results eligibility

## Common Issues and Solutions

### Issue: Sitemap Not Found

**Symptoms**: GSC shows sitemap couldn't be fetched

**Solutions**:
1. Verify sitemap is accessible at `https://tammat.ae/sitemap.xml`
2. Check nginx configuration allows access to XML files
3. Verify sitemap is valid XML (test with XML validator)
4. Ensure robots.txt references sitemap correctly

### Issue: Pages Not Indexed

**Symptoms**: Important pages don't appear in search results

**Solutions**:
1. Check `robots.txt` isn't blocking pages
2. Verify no `noindex` meta tags in HTML
3. Request indexing via URL Inspection tool
4. Ensure pages have unique, descriptive content
5. Check for crawl errors in Coverage report

### Issue: Mobile Usability Errors

**Symptoms**: GSC reports mobile usability issues

**Solutions**:
1. Test page with [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
2. Ensure viewport meta tag is present (already in your index.html)
3. Fix any reported issues (text too small, clickable elements too close)

### Issue: Duplicate Content

**Symptoms**: GSC shows duplicate title tags or meta descriptions

**Solutions**:
1. Ensure each page has unique title and description
2. Use canonical URLs (already implemented in SEO component)
3. Consolidate similar pages

## Best Practices

### 1. Regular Monitoring

- Check GSC weekly for issues
- Monitor performance trends monthly
- Act quickly on any errors or warnings

### 2. Content Updates

When you update content:
1. Use URL Inspection tool
2. Request re-indexing for updated pages
3. Monitor performance changes

### 3. New Pages

When adding new pages:
1. Add them to sitemap (regenerate with `npm run generate-sitemap`)
2. Request indexing via URL Inspection
3. Build internal links to new pages

### 4. Structured Data

Check if your structured data is working:
1. Go to **Enhancements** section
2. Look for structured data reports
3. Fix any errors shown

### 5. International Targeting

For multilingual sites:
1. Go to **Settings** → **International Targeting**
2. Set target country (United Arab Emirates)
3. Configure hreflang tags if you add Arabic version

## Performance Optimization for SEO

### Core Web Vitals

GSC shows Core Web Vitals metrics:

1. Go to **Core Web Vitals** report
2. Monitor:
   - **LCP** (Largest Contentful Paint): < 2.5s
   - **FID** (First Input Delay): < 100ms
   - **CLS** (Cumulative Layout Shift): < 0.1

Improve poor scores by:
- Optimizing images (use WebP format)
- Reducing JavaScript bundle size
- Using lazy loading
- Minimizing layout shifts

### Page Experience

Check overall page experience:

1. Go to **Page Experience** report
2. Ensure all metrics are "Good"
3. Fix any "Poor" or "Needs Improvement" items

## Timeline Expectations

| Action | Expected Time |
|--------|--------------|
| Domain verification | Minutes to 48 hours |
| Sitemap processing | Few hours to 1 week |
| First pages indexed | 1-7 days |
| Full site indexed | 1-4 weeks |
| Search rankings improve | 2-6 months |
| Consistent traffic | 3-12 months |

**Important**: SEO is a long-term strategy. Don't expect immediate results.

## Additional Resources

- [Google Search Central](https://developers.google.com/search)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Search Console Help](https://support.google.com/webmasters)
- [Rich Results Test](https://search.google.com/test/rich-results)

## Checklist

After setup, verify:

- [ ] Domain verified in GSC
- [ ] Sitemap submitted and processed
- [ ] Key pages requested for indexing
- [ ] Email alerts configured
- [ ] No critical errors in Coverage report
- [ ] robots.txt is accessible and correct
- [ ] Mobile usability is good
- [ ] HTTPS is working site-wide
- [ ] Core Web Vitals are in "Good" range

## Getting Help

If you encounter issues:

1. Check GSC help documentation
2. Use the URL Inspection tool for diagnostics
3. Review nginx and application logs
4. Test with Google's validation tools
5. Consult SEO forums or experts if needed

---

**Remember**: SEO success requires patience, consistent monitoring, and ongoing optimization. Focus on creating quality content and providing excellent user experience.

