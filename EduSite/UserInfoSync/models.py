from django.db import models
from AccountApp.models import ClassInfo, StudentProf, TeacherProf

# Create your models here.
# --------------------------------------------------------
class StudentInfo(models.Model):
    student_id = models.PositiveIntegerField()                 # 学号 （唯一标识号）
    name = models.CharField(max_length=64)                     # 姓名
    class_id = models.PositiveIntegerField()                   # 所属班级的 id！
    user_id = models.IntegerField(default=-1)                  # user_id


# --------------------------------------------------------
class TeacherInfo(models.Model):
    teacher_id = models.PositiveIntegerField()                 # 工号编号 （唯一标识号）
    name = models.CharField(max_length=64)                     # 姓名
    user_id = models.IntegerField(default=-1)                  # user_id
    

# --------------------------------------------------------
# 班级信息  AccountApp.ClassInfo
class ClassOrinInfo(models.Model):
    class_id = models.PositiveIntegerField()                   # 原数据库中的ID
    name = models.CharField(max_length=128)                    # 班级名称
    classinfo_id = models.IntegerField(default=-1)             # ClassInfo.id