from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# Create your models here.

class BlogArtis(models.Model):
    title = models.CharField(max_length=300)
    author = models.ForeignKey(User, related_name='blog_posts', on_delete=models.CASCADE,)
    body = models.TextField()
    publish = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("-publish",)

    def __str__(self):
        return self.title

class TestData(models.Model):
    test = models.BinaryField()
    testChar = models.PositiveIntegerField()
    testCC = models.CharField(max_length=100)

    def __str__(self):
        return "hahaha: " + self.testCC