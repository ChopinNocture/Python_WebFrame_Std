from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class ClassInfo(models.Model):
    class_name = models.CharField(max_length=64)

    def __str__(self):
        return str(self.class_name)


class StudentProf(models.Model):
    user = models.OneToOneField(User, unique=True, on_delete=models.CASCADE,)
    student_number = models.PositiveIntegerField(unique=True)
    class_id = models.ForeignKey(ClassInfo, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.user.username)


class StudentProgressInfo(models.Model):
    user_id = models.IntegerField()
    gold = models.IntegerField(default=0)
    progress = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=0)

    class Meta:
        app_label = 'CourseFunApp'


class TeacherProf(models.Model):
    user = models.OneToOneField(User, unique=True, on_delete=models.CASCADE,)
    class_id_list = models.ManyToManyField("ClassInfo")  # JSONField()

    def __str__(self):
        return str(self.user.username)
        

MAX_DBNAME_LENGTH = 64
class Course(models.Model):
    description = models.CharField(max_length=MAX_DBNAME_LENGTH)
    db_name = models.CharField(max_length=MAX_DBNAME_LENGTH)

    def __str__(self):
        return self.description


TEACHER_GROUP_NAME = "teachers"
STUDENT_GROUP_NAME = "students"