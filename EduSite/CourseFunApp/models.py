from django.db import models

# Create your models here.

# --------------------------------------------------------
MAX_CONTENT_LENGTH = 250


class Course(models.Model):
    treeData = models.BinaryField()
    # teacherID = models.ForeignKey('Teacher', on_delete=models.CASCADE, )
    description = models.TextField(max_length=MAX_CONTENT_LENGTH)

    def __str__(self):
        return "this is course" + self.description


# --------------------------------------------------------
class Lesson(models.Model):
    description = models.TextField(max_length=MAX_CONTENT_LENGTH)


SINGLE_SELECTION = 'SS'
MULTI_SELECTION = 'MS'
JUDGEMENT = 'YN'
FILL_EMPTY = 'FE'
SORT_QUESTION = 'SQ'
ANALISE_Q = 'AN'
VOICE_Q = 'VC'

QUESTION_TYPE_CHOICES = (
    (SINGLE_SELECTION, 'Single Selection'),
    (MULTI_SELECTION, 'Multiply Selection'),
    (JUDGEMENT, 'Judgement'),
    (FILL_EMPTY, 'Fill Empty'),
    (SORT_QUESTION, 'Sort'),
    (ANALISE_Q, 'Analise'),
    (VOICE_Q, 'Voice'),
)


# --------------------------------------------------------
# 题目基类
class Question(models.Model):
    description = models.TextField()
    sectionID = models.CharField(max_length=32)
    flag = models.PositiveSmallIntegerField()
    star = models.PositiveSmallIntegerField()

    class Meta:
        abstract = True

    @classmethod
    def get_url_name(cls):
        return cls.__name__.replace('Question', '', 1)


# 填空题
class FillInBlankQuestion(Question):
    blankKeys = models.TextField()


# 判断题
class TrueOrFalseQuestion(Question):
    Key = models.BooleanField()


# 单项选择题
class ChoiceQuestion(Question):
    options = models.TextField()
    key = models.PositiveSmallIntegerField()


# 多项选择题
class MultiChoiceQuestion(Question):
    options = models.TextField()
    keys = models.TextField()


# 配对题
class PairQuestion(Question):
    leftOptions = models.TextField()
    rightOptions = models.TextField()
    pairKeys = models.TextField()


# 排序题
class SortQuestion(Question):
    options = models.TextField()
    keys = models.TextField()