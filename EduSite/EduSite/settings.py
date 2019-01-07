"""
Django settings for EduSite project.

Generated by 'django-admin startproject' using Django 2.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '-dlm1^!ab9ncwc-m4!*mcy1&5-rw*a)51q%(ip7s7%yxzrba#w'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '106.75.232.48', '172.18.8.122']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_cas_ng',
    'NoticeApp',
    'CourseFunApp',
    'AccountApp',
    'UserInfoSync',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_cas_ng.middleware.CASMiddleware',  # cas
]

ROOT_URLCONF = 'EduSite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'Templates')],
        'APP_DIRS': False,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.template.context_processors.media',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'EduSite.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'DB/db.sqlite3'),
#     },
#     'course_A': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'DB/course_A.sqlite3'),
#     },
#     'course_B': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'DB/course_B.sqlite3'),
#     },
#     'user_info_sync': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'DB/edu_user_info_sync.sqlite3'),
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'edu_basic',
        'USER': 'django',
        'PASSWORD': 'asdqwe123',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    },
    'course_A': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'edu_course_a',
        'USER': 'django',
        'PASSWORD': 'asdqwe123',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    },
    'course_B': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'edu_course_b',
        'USER': 'django',
        'PASSWORD': 'asdqwe123',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    },
    'user_info_sync': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'edu_user_info_sync',
        'USER': 'django',
        'PASSWORD': 'asdqwe123',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

DATABASE_ROUTERS = ['EduSite.db_router.CourseRouter', ]


# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    # },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

# LANGUAGE_CODE = 'en-us'
LANGUAGE_CODE = 'zh-Hans'

# TIME_ZONE = 'UTC'
TIME_ZONE = 'Asia/Shanghai'


USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

STATIC_URL = '/Statics/'

STATICFILES_DIRS = [os.path.join(BASE_DIR, "Statics")] 


# Media files
MEDIA_ROOT = os.path.join(BASE_DIR, "uploaded")
MEDIA_URL = '/uploaded/'


LOGIN_URL = 'user/login/'
# ------------------------------------------------------
# CAS
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'django_cas_ng.backends.CASBackend',
)

CAS_REDIRECT_URL = '/user/course/'
CAS_SERVER_URL = 'http://172.18.1.236/cas/login'
CAS_CREATE_USER = True
CAS_CREATE_USER_WITH_ID = False

LOGIN_URL = '/accounts/login/'

# ------------------------------------------------------

REDIRECT_LOGIN_URL = '/' + LOGIN_URL