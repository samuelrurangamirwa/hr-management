# 🚀 Django Backend Deployment on Render

## Prerequisites

- Render account (https://render.com)
- GitHub repository with your Django project
- PostgreSQL database on Render (or external)

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Prepare Your Django Project

#### 1.1 Create `requirements.txt`
✅ **Already created!** Contains all necessary dependencies:
```txt
Django==5.2.8
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.4.0
psycopg2-binary==2.9.9
python-decouple==3.8
Pillow==10.4.0
reportlab==4.2.2
gunicorn==23.0.0
whitenoise==6.7.0
dj-database-url==2.2.0
```

#### 1.2 Update Django Settings for Production

✅ **Already created!** Production settings configured in `hr_backend/settings/production.py` with:
- PostgreSQL database configuration
- CORS settings for frontend
- WhiteNoise for static files
- Security settings for production
- Email configuration

✅ **Settings switching configured** in `hr_backend/settings/__init__.py` to automatically use production settings on Render.

#### 1.3 Create `render.yaml` (Optional - for Blueprint deployment)
```yaml
services:
  - type: web
    name: hr-backend
    runtime: python3
    buildCommand: "pip install -r requirements.txt && python manage.py collectstatic --noinput"
    startCommand: "gunicorn hr_backend.wsgi:application --bind 0.0.0.0:$PORT"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: hr-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: RENDER
        value: true
      - key: DJANGO_SETTINGS_MODULE
        value: hr_backend.settings

  - type: pserv
    name: hr-db
    runtime: postgres
    databaseName: hr_system
    user: hr_user
    plan: free
```

### Step 2: Set Up Render Web Service

#### 2.1 Create Web Service (SQLite - No Database Setup Needed!)
**🎉 SQLite Advantage**: No separate database service required!
- Database file is created automatically in your app
- No additional cost or configuration
- Perfect for demos and small applications
1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `hr-backend`
   - **Runtime**: Python 3
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     python manage.py collectstatic --noinput
     python manage.py migrate
     ```
   - **Start Command**:
     ```bash
     gunicorn hr_backend.wsgi:application --bind 0.0.0.0:$PORT
     ```

### Step 3: Configure Environment Variables

In your Render Web Service settings, add these environment variables:

#### Required Variables:
```
SECRET_KEY=your-super-secret-key-here
RENDER=true
DJANGO_SETTINGS_MODULE=hr_backend.settings
DEBUG=false
ALLOWED_HOSTS=your-app-name.onrender.com
```

**Note**: No `DATABASE_URL` needed - SQLite database file is created automatically!

#### Optional Variables:
```
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Step 4: Database Migration Setup

#### 4.1 Database Setup Script
✅ **Already created!** `scripts/setup_db.py` handles:
- Database migrations
- Initial data seeding
- Static file collection
- Error handling and logging

#### 4.2 Update Build Command
```bash
pip install -r requirements.txt && python scripts/setup_db.py
```

### Step 5: Static Files Configuration

#### 5.1 Install WhiteNoise
Already in requirements.txt:
```txt
whitenoise==6.7.0
```

#### 5.2 Configure WhiteNoise in settings
Already configured in production.py:
```python
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Step 6: Deploy and Test

#### 6.1 Deploy
1. Push your changes to GitHub
2. Render will automatically redeploy
3. Monitor build logs for any errors

#### 6.2 Test Deployment
```bash
# Test basic connectivity
curl https://your-app-name.onrender.com/api/

# Test authentication
curl -X POST https://your-app-name.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Test employee endpoint
curl https://your-app-name.onrender.com/api/employees/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 7: Troubleshooting

#### Common Issues:

**1. Build Failures**
```bash
# Check build logs in Render dashboard
# Common issues:
# - Missing dependencies in requirements.txt
# - Database connection issues
# - Static files collection failures
```

**2. Database Issues (SQLite)**
```bash
# SQLite is file-based - no connection issues
# Check if db.sqlite3 file exists
# Ensure proper file permissions
# Database is created automatically on first run
```

**3. Static Files Not Loading**
```bash
# Ensure STATIC_ROOT is set
# Check WhiteNoise configuration
# Verify collectstatic ran successfully
```

**4. CORS Issues**
```bash
# Update CORS_ALLOWED_ORIGINS in environment variables
# Include your frontend domain
```

**5. Migration Issues**
```bash
# Check migration files are committed
# Ensure database has proper permissions
# Run migrations manually if needed
```

### Step 8: Post-Deployment Tasks

#### 8.1 Set Up Custom Domain (Optional)
1. Go to Render service settings
2. Add custom domain
3. Configure DNS records

#### 8.2 Enable HTTPS
- Render automatically provides SSL certificates
- All HTTP traffic is redirected to HTTPS

#### 8.3 Set Up Monitoring
- Enable health checks in Render dashboard
- Monitor application logs
- Set up error notifications

#### 8.4 Backup Strategy
- Render PostgreSQL includes automated backups
- Configure backup retention period
- Download backups periodically

---

## 📁 Files Created for Deployment

✅ **Configuration Files:**
- `requirements.txt` - Python dependencies
- `hr_backend/settings/production.py` - Production Django settings
- `hr_backend/settings/__init__.py` - Settings switching logic
- `render.yaml` - Render blueprint configuration
- `.env.example` - Environment variables template

✅ **Scripts:**
- `scripts/setup_db.py` - Database setup and seeding
- `test_deployment.py` - Pre-deployment testing

## 🔧 Quick Deployment Checklist

- [x] `requirements.txt` created with all dependencies (SQLite - no PostgreSQL)
- [x] Production settings configured (SQLite database)
- [x] Database setup script created
- [x] Render blueprint configuration ready (no database service)
- [x] Environment variables template provided
- [ ] Environment variables set in Render
- [ ] Repository pushed to GitHub
- [ ] Render web service created and deployed
- [ ] API endpoints tested
- [ ] Frontend configured to use production API

**🎉 SQLite Benefits:**
- ✅ No separate database service needed
- ✅ Automatic database file creation
- ✅ Zero additional cost
- ✅ Simplified deployment

## 🧪 Pre-Deployment Testing

Run the deployment test script before deploying:

```bash
python test_deployment.py
```

This will verify:
- Django settings configuration
- Database connectivity
- Model imports and queries
- API URL configuration
- Static files setup
- Management commands

---

## 📝 Useful Commands

```bash
# Test production settings locally (SQLite)
export RENDER=true
python manage.py runserver

# Test deployment readiness
python test_deployment.py

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Seed data
python manage.py seed_data

# Run setup script (same as deployment)
python scripts/setup_db.py
```

---

## 🚨 Important Notes

1. **SQLite Database**: File-based database created automatically - no setup needed!
2. **Secret Key**: Generate a new secret key for production
3. **Debug Mode**: Ensure DEBUG=False in production
4. **Allowed Hosts**: Include your Render domain
5. **CORS**: Configure for your frontend domain
6. **Static Files**: Use WhiteNoise for serving static files
7. **Migrations**: Run migrations during build process
8. **Environment Variables**: Never commit secrets to repository
9. **SQLite Limitations**: Good for demos/small apps, consider PostgreSQL for production scaling

## 💾 SQLite vs PostgreSQL

| Feature | SQLite (Current) | PostgreSQL (Alternative) |
|---------|------------------|--------------------------|
| **Setup** | ✅ Automatic | 🔧 Manual database service |
| **Cost** | ✅ Free | 💰 Paid service required |
| **Performance** | ⚠️ Single-writer | ✅ Multi-user concurrent |
| **Data Persistence** | ✅ File-based | ✅ Server-based |
| **Best For** | ✅ Demos/Portfolios | ✅ Production apps |

Your Django backend will be live on Render with automatic SSL, scaling, and monitoring! 🎉