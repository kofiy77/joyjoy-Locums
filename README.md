# JoyJoy Locums - Frontend (Optimized)

A comprehensive healthcare staffing platform for UK medical practices, featuring dedicated sections for GPs, Advanced Nurse Practitioners (ANP), PCNs (Primary Care Networks), Clinical Pharmacists, and Allied Healthcare Professionals.

## 🚀 Quick Start

```bash
npm install
npm run build
```

## 🖼️ Asset Management

**Important**: This repository excludes large image assets to keep under GitHub's size limits.

### For Production Deployment:

1. **Upload large images to a CDN** (Cloudinary, AWS S3, etc.)
2. **Update image references** in components to use CDN URLs
3. **Alternative**: Use Netlify Large Media for asset management

### Missing Assets:
- `/attached_assets/` folder (423MB) - Upload to external hosting
- Large images in `/client/src/assets/` - Use optimized versions

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Library**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: TanStack React Query + Zustand
- **Routing**: Wouter
- **Backend Integration**: Supabase

## 🌐 Deployment on Netlify

### Environment Variables Required:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key
VITE_API_URL=https://your-backend-api-domain.com/api
```

### Build Settings:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 20

## 📊 Repository Size Optimization

- **Before**: 464MB (with attached_assets)
- **After**: ~15MB (essential files only)
- **Assets**: Moved to external CDN hosting

---

🏥 Built for UK healthcare staffing excellence.
