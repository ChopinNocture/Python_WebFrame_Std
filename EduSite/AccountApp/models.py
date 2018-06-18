from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class StudentProf(models.Model):
    user = models.OneToOneField(User, unique=True)
    gold = models.IntegerField()
    progress
    rank