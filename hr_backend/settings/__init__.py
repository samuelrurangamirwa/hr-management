import os

# Use production settings if RENDER environment variable is set
if os.environ.get('RENDER'):
    from .production import *
else:
    from .base import *