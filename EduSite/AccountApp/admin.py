from django.contrib import admin

from .models import ClassInfo, StudentProf, Course

# Register your models here.
admin.site.register(ClassInfo)
admin.site.register(StudentProf)
admin.site.register(Course)