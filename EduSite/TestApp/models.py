from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# Create your models here.

class BlogArtis(models.Model):
    title = models.CharField(max_length=300)
    author = models.ForeignKey(User, related_name='blog_posts', on_delete=models.CASCADE,)
    body = models.TextField()
    publis = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("-publis",)

    def __str__(self):
        return self.title
