# 🚀 R2 Setup Guide for Demo Drop

## Step 1: Create Cloudflare R2 Account

1. **Go to [Cloudflare Dashboard](https://dash.cloudflare.com)**
2. **Navigate to R2 Object Storage**
3. **Create a new bucket** called `demo-drop-audio`
4. **Note your Account ID** (found in dashboard URL)

## Step 2: Create API Tokens

1. **Go to "Manage R2 API Tokens"**
2. **Create a new token** with these permissions:
   - Object Read
   - Object Write
   - Object Delete
3. **Save your Access Key ID and Secret Access Key**

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=demo-drop-audio

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 4: Test the Setup

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Check sync status:**

   ```bash
   curl http://localhost:3000/api/sync
   ```

3. **Sync files to R2:**
   ```bash
   curl -X POST http://localhost:3000/api/sync
   ```

## Step 5: Verify Everything Works

1. **Visit `http://localhost:3000/tracks`** - should show your tracks
2. **Click on a track** - should play from local storage
3. **Check R2 dashboard** - should see uploaded files

## 🎯 **What's Now Available**

### **Hybrid Storage System**

- ✅ **Local files** work as before
- ✅ **Cloud storage** for sharing
- ✅ **Automatic sync** to R2
- ✅ **Smart routing** (local first, cloud fallback)

### **New API Endpoints**

- `GET /api/sync` - Check sync status
- `POST /api/sync` - Sync files to R2
- `GET /api/stream/[filename]` - Stream from R2

### **Storage Manager Features**

- **Local + Cloud** hybrid storage
- **Automatic file detection**
- **Smart URL routing**
- **Sync status tracking**

## 🔧 **Next Steps**

### **Option 1: Test Current Setup**

- Keep using local storage
- Test R2 sync functionality
- Verify everything works

### **Option 2: Add Sharing Features**

- Create album sharing
- Add collaborative feedback
- Build sharing URLs

### **Option 3: Mobile App Prep**

- Create mobile-optimized APIs
- Add offline support
- Prepare for iOS app

## 💰 **Cost Tracking**

- **Current**: $0 (local storage)
- **With R2**: ~$9/year for 50GB
- **Scaling**: ~$18/year for 100GB

## 🚨 **Troubleshooting**

### **"R2 credentials not found"**

- Check your `.env.local` file
- Verify all R2 variables are set
- Restart your dev server

### **"Bucket not found"**

- Create the bucket in R2 dashboard
- Check bucket name in `.env.local`
- Verify bucket permissions

### **"Sync failed"**

- Check R2 API token permissions
- Verify file paths are correct
- Check console for specific errors

---

**Ready to test?** Once you've set up your R2 credentials, your app will have both local and cloud storage capabilities! 🎵
