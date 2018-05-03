from django.db import models
from django.utils import timezone

# Create your models here.

class Notices(models.Model):
    publicDate = models.DateTimeField()
    #teacherID = models.ForeignKey('Teacher', on_delete=models.CASCADE, )
    content = models.TextField(max_length=250)

    class Meta:
        ordering = ("-publicDate",)

#    def __str__(self):
#        return self.id