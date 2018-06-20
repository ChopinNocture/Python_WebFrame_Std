from django.contrib import admin

from .models import ClassInfo, StudentProf

# Register your models here.
admin.site.register(ClassInfo)
admin.site.register(StudentProf)