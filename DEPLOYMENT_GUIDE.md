# YouTube Automation Payment Site - Netlify Deployment Guide

## Issues Fixed for Production

### 1. CORS Headers Added
- Added proper CORS headers to all Netlify functions
- Handles preflight OPTIONS requests
- Allows cross-origin requests from the frontend

### 2. API Endpoint Updates
- Frontend now calls `/.netlify/functions/process-payment` instead of `/api/process-payment`
- Frontend now calls `/.netlify/functions/payment-status` instead of `/api/payment-status`
- Updated all response headers to include CORS

### 3. Netlify Configuration
- `netlify.toml` properly configured with redirects
- Functions directory set to `netlify/functions`
- API routes redirect to Netlify functions

## Deployment Steps

### 1. Install Netlify CLI (if not already installed)
```bash
npm install -g netlify-cli
```

### 2. Login to Netlify
```bash
netlify login
```

### 3. Initialize Netlify Site (if not already done)
```bash
netlify init
```

### 4. Deploy to Netlify
```bash
netlify deploy --prod
```

## Testing the Deployment

### 1. Test Health Check
```bash
curl https://your-site-name.netlify.app/.netlify/functions/health
```

### 2. Test Payment Processing
```bash
curl -X POST https://your-site-name.netlify.app/.netlify/functions/process-payment \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0712345678"}'
```

### 3. Test Payment Status
```bash
curl "https://your-site-name.netlify.app/.netlify/functions/payment-status?orderId=test_order_123"
```

## Local Development

### 1. Start Netlify Dev Server
```bash
netlify dev
```

### 2. Test Locally
```bash
node test-netlify-payment.js
```

## Environment Variables

Make sure these are set in your Netlify dashboard:
- `ZENO_API_KEY` - Your ZenoPay API key
- Any other environment variables needed

## Function Endpoints

- **Health Check**: `/.netlify/functions/health`
- **Process Payment**: `/.netlify/functions/process-payment` (POST)
- **Payment Status**: `/.netlify/functions/payment-status` (GET)

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure all functions have proper CORS headers
2. **Function Not Found**: Check that functions are in `netlify/functions/` directory
3. **API Key Issues**: Verify environment variables are set in Netlify dashboard
4. **Network Errors**: Check ZenoPay API connectivity and credentials

### Debug Steps:
1. Check Netlify function logs in the dashboard
2. Test functions individually using curl
3. Verify environment variables are set
4. Check ZenoPay API documentation for any changes

## Production Checklist

- [ ] All functions have CORS headers
- [ ] Frontend uses correct Netlify function endpoints
- [ ] Environment variables are set in Netlify
- [ ] ZenoPay API key is valid and active
- [ ] Test payment flow end-to-end
- [ ] Monitor function logs for errors
- [ ] Set up error monitoring/alerts if needed

## Support

If you encounter issues:
1. Check Netlify function logs
2. Test individual functions with curl
3. Verify ZenoPay API connectivity
4. Check browser console for frontend errors
