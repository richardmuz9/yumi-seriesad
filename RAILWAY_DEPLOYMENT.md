# 🚄 Railway Deployment Guide

## ✅ Issues Fixed

### 1. **Canvas Dependency Removed**
- ❌ Removed `canvas` and `chartjs-node-canvas` packages
- ✅ Replaced with configuration-based chart generation
- ✅ No more Python/native compilation requirements

### 2. **Environment Variables Added**
- ✅ `YOUR_DOMAIN=https://yumi77965.online`
- ✅ `FRONTEND_URL=https://yumi77965.online`
- ✅ `API_URL=https://yumi-series-production.up.railway.app`
- ✅ `BACKEND_URL=https://yumi-series-production.up.railway.app`

### 3. **Railway Configuration**
- ✅ `nixpacks.toml` - Build configuration
- ✅ `railway.toml` - Deployment settings
- ✅ Health check endpoint at `/health`
- ✅ CORS configured for production domains

## 🔧 Railway Environment Variables Setup

Add these environment variables in your Railway project:

### **Required API Keys**
```bash
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
QWEN_API_KEY=your_qwen_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### **Payment Configuration**
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

ALIPAY_APP_ID=your_alipay_app_id_here
ALIPAY_PRIVATE_KEY=your_alipay_private_key_here
ALIPAY_PUBLIC_KEY=your_alipay_public_key_here
```

### **URLs & Domains** ⭐ **CRITICAL**
```bash
YOUR_DOMAIN=https://yumi77965.online
FRONTEND_URL=https://yumi77965.online
API_URL=https://yumi-series-production.up.railway.app
BACKEND_URL=https://yumi-series-production.up.railway.app
NODE_ENV=production
```

### **Database & Other**
```bash
DATABASE_URL=your_railway_postgres_url_here
AI_PROVIDERS=openai,anthropic,qwen
CORS_ORIGINS=https://yumi77965.online,http://localhost:3000
PORT=3001
```

## 🚀 Deployment Steps

### 1. **Connect Repository**
- Connect your GitHub repository to Railway
- Select the `backend` directory as the root

### 2. **Set Environment Variables**
- Go to Railway project settings
- Add all environment variables listed above
- ⚠️ **Critical**: Make sure URLs match your actual domains

### 3. **Database Setup**
- Add PostgreSQL plugin in Railway
- Copy the `DATABASE_URL` to your environment variables
- Run migrations after first deployment

### 4. **Deploy**
- Railway will automatically deploy when you push to master
- Check logs for any issues
- Health check available at: `https://your-app.railway.app/health`

## 🔍 Health Check

Your app now includes a health endpoint:
```
GET https://yumi-series-production.up.railway.app/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-06-22T08:30:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

## 🐛 Common Issues & Solutions

### **Issue 1: Canvas Build Errors**
✅ **Fixed**: Canvas dependency removed, no more native compilation

### **Issue 2: CORS Errors**
✅ **Fixed**: CORS configured for your domains
- Check `FRONTEND_URL` and `YOUR_DOMAIN` are set correctly

### **Issue 3: Payment Redirects Fail**
✅ **Fixed**: URLs now use environment variables
- Stripe success/cancel URLs: `${FRONTEND_URL}/charge?success=true`
- Alipay notify URL: `${BACKEND_URL}/api/billing/alipay/notify`

### **Issue 4: Environment Variables Not Working**
- Double-check variable names in Railway dashboard
- Restart deployment after adding variables
- Check logs for environment variable values

## 📝 Stripe Configuration

Update your Stripe dashboard:
1. **Webhook Endpoint**: `https://yumi-series-production.up.railway.app/api/billing/stripe/webhook`
2. **Success URL**: `https://yumi77965.online/charge?success=true`
3. **Cancel URL**: `https://yumi77965.online/charge?cancel=true`

## 📝 Alipay Configuration

Update your Alipay configuration:
1. **Notify URL**: `https://yumi-series-production.up.railway.app/api/billing/alipay/notify`
2. **Return URL**: `https://yumi77965.online/charge?success=true`

## ✅ Verification Checklist

- [ ] All environment variables set in Railway
- [ ] Health check endpoint responds
- [ ] CORS allows your frontend domain
- [ ] Database connection works
- [ ] Stripe webhooks configured
- [ ] Alipay notifications configured
- [ ] Payment redirects work correctly

## 🎉 Ready for Production!

Your Yumi Series backend should now deploy successfully on Railway without any native compilation issues! 