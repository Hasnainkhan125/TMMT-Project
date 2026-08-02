# Nginx Configuration for Tammat SEO

## VPS Nginx Configuration

This configuration file optimizes your Tammat React application for SEO and performance on a VPS with Nginx.

### Configuration File

Create or update your Nginx configuration at `/etc/nginx/sites-available/tammat`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tammat.ae www.tammat.ae;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.tammat.ae;

    # SSL Configuration (replace with your actual certificate paths)
    ssl_certificate /etc/letsencrypt/live/tammat.ae/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tammat.ae/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Redirect www to non-www
    return 301 https://tammat.ae$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tammat.ae;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/tammat.ae/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tammat.ae/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Document Root
    root /var/www/tammat/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SEO-friendly files
    location = /robots.txt {
        add_header Content-Type text/plain;
        expires 7d;
    }

    location = /sitemap.xml {
        add_header Content-Type application/xml;
        expires 7d;
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # API Proxy (if needed)
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logging
    access_log /var/log/nginx/tammat-access.log;
    error_log /var/log/nginx/tammat-error.log;
}
```

## Installation Steps

### 1. Upload Your Build Files

```bash
# Build your React app locally
npm run build

# Upload to VPS (via SCP or FTP)
scp -r dist/* user@your-vps-ip:/var/www/tammat/
```

### 2. Create Nginx Configuration

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Create nginx config
sudo nano /etc/nginx/sites-available/tammat

# Paste the configuration above, then save

# Enable the site
sudo ln -s /etc/nginx/sites-available/tammat /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. Set Up SSL with Let's Encrypt

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d tammat.ae -d www.tammat.ae

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

### 4. Set Correct Permissions

```bash
sudo chown -R www-data:www-data /var/www/tammat
sudo chmod -R 755 /var/www/tammat
```

## Verification

After deployment, verify:

1. **HTTPS is working**: Visit https://tammat.ae
2. **Redirects work**: 
   - http://tammat.ae → https://tammat.ae ✓
   - https://www.tammat.ae → https://tammat.ae ✓
3. **SEO files are accessible**:
   - https://tammat.ae/robots.txt
   - https://tammat.ae/sitemap.xml
4. **Gzip compression**: Check in browser DevTools Network tab
5. **Security headers**: Use https://securityheaders.com

## Performance Optimization

### Enable Brotli Compression (Optional)

For even better compression than gzip:

```bash
# Install brotli module
sudo apt install libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static

# Add to nginx config
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Enable HTTP/3 (QUIC)

For latest performance (Nginx 1.25+):

```nginx
listen 443 quic reuseport;
listen 443 ssl http2;
add_header Alt-Svc 'h3=":443"; ma=86400';
```

## Troubleshooting

### Issue: 404 on page refresh
**Solution**: Ensure `try_files $uri $uri/ /index.html;` is in your location block

### Issue: Assets not loading
**Solution**: Check file permissions and paths in DevTools

### Issue: SSL certificate errors
**Solution**: Verify certificate paths in nginx config match certbot installation

### Issue: Slow load times
**Solution**: Verify gzip is working with `curl -H "Accept-Encoding: gzip" -I https://tammat.ae`

## Maintenance

### Update Deployment

```bash
# Build locally
npm run build

# Upload to VPS
scp -r dist/* user@your-vps-ip:/var/www/tammat/

# Clear browser cache or use cache busting in Vite config
```

### Monitor Logs

```bash
# Watch access logs
sudo tail -f /var/log/nginx/tammat-access.log

# Watch error logs
sudo tail -f /var/log/nginx/tammat-error.log
```

