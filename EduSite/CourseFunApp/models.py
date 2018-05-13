from django.db import models

# Create your models here.

MAX_CONTENT_LENGTH = 250

class Course(models.Model):
    treeData = models.BinaryField()
    #teacherID = models.ForeignKey('Teacher', on_delete=models.CASCADE, )
    description = models.TextField(max_length=MAX_CONTENT_LENGTH)

    class Meta:
        ordering = ("-publicDate",)

    def __str__(self):
        return "this is course" + self.description


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


class Question(models.Model):
    questionType = models.CharField(
        max_length=2,
        choices=QUESTION_TYPE_CHOICES,
        default=SINGLE_SELECTION,
    )