"""
WSGI config for InterReadingProject project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/howto/deployment/wsgi/
"""

import os
import sys

from django.core.wsgi import get_wsgi_application

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

sys.path.insert(0,root_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'InterReadingProject.settings')

application = get_wsgi_application()
