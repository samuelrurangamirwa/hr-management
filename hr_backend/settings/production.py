from .base import *
import os

DEBUG = False

SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-secret-key-change-in-production')

ALLOWED_HOSTS = [
    os.environ.get('RENDER_EXTERNAL_URL', '').replace('https://', '').replace('http://', ''),
    'localhost',
    '127.0.0.1',
    '.onrender.com',  # Allow all Render subdomains
]

# Database - Using SQLite for simplicity
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",  # Replace with your actual frontend domain
    "http://localhost:3000",  # For development
    "http://localhost:3001",  # For development
]

# Allow all origins in development (be more restrictive in production)
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files (if using)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings
SECURE_SSL_REDIRECT = not DEBUG  # Only redirect to HTTPS in production
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Email settings (configure as needed)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'hr_app': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}