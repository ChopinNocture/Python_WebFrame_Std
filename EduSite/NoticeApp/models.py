from django.db import models
from django.utils import timezone

# Create your models here.

MAX_CONTENT_LENGTH = 300

class Notices(models.Model):
    publicDate = models.DateTimeField(default=timezone.datetime.today())
    expireDate = models.DateTimeField(default=timezone.datetime.today())
    #teacherID = models.ForeignKey('Teacher', on_delete=models.CASCADE, )
    content = models.CharField(max_length=MAX_CONTENT_LENGTH)

    class Meta:
        ordering = ("-publicDate",)
        app_label = 'CourseFunApp'

    def __str__(self):
        return self.content