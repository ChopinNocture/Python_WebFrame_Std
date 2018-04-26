from django.contrib import admin

# Register your models here.
from .models import *   # BlogArtis

admin.site.register(BlogArtis)
admin.site.register(TestData)
