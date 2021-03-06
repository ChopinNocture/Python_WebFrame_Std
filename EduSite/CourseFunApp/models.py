from django.db import models
# from django.contrib.postgres.fields import JSONField
from django.utils import timezone

# --------------------------------------------------------
MAX_CONTENT_LENGTH = 250
UNLOCK_NUMBER = 3
MAX_JSON_LENGTH = 4096

# --------------------------------------------------------
class ClassSetting(models.Model):
    class_id = models.IntegerField()
    practise_setting = models.CharField(max_length=MAX_JSON_LENGTH)
    prac_lock_mode = models.BooleanField(default=True)
    unlock_number = models.IntegerField(default=UNLOCK_NUMBER)
    exam_ticket = models.PositiveIntegerField(default=0)
    quests_filter = models.CharField(max_length=MAX_JSON_LENGTH, default='none')
    lesson_order = models.CharField(max_length=MAX_JSON_LENGTH, null=True, blank=True)

# --------------------------------------------------------
class Examination(models.Model):
    title = models.CharField(max_length=MAX_CONTENT_LENGTH)
    duration = models.PositiveIntegerField()
    question_list = models.TextField(max_length=MAX_JSON_LENGTH, default='none')  # JSONField()
    start_time = models.DateTimeField(default=timezone.datetime.today())
    end_time = models.DateTimeField(default=timezone.datetime.today())
    class_id_list = models.CharField(max_length=MAX_JSON_LENGTH, default='none')    # JSONField()

    def __str__(self):
        return self.title


# --------------------------------------------------------
class ExamAnswer(models.Model):
    exam = models.ForeignKey(Examination, on_delete=models.CASCADE )
    user_id = models.IntegerField()
    answer_json = models.CharField(max_length=MAX_JSON_LENGTH)    # JSONField()
    score = models.FloatField(default=0, blank=True)
    addition_score = models.IntegerField(default=0, blank=True)


# --------------------------------------------------------
class Lesson(models.Model):
    description = models.CharField(max_length=MAX_CONTENT_LENGTH)


MEDIA_CHOICES = (('none', '无文件'),
                 ('image', '图片文件'),
                 ('video', '视频文件'),
                 ('audio', '音频文件'),
                 ('ppt', 'ppt'),
                 ('excel', 'Excel文件'),
                 ('word', 'Word文件'),
                )

MEDIA_CHOICES_DICT = dict()
for iter_i in list(MEDIA_CHOICES):
    MEDIA_CHOICES_DICT[list(iter_i)[0]] = list(iter_i)[1]


# --------------------------------------------------------
# ---------------
def file_voice_question_path(instance, filename):
    return '{0}/VoiceQuestion/Questions/{1}'.format(instance._state.db, filename)


def file_voice_key_path(instance, filename):
    return '{0}/VoiceQuestion/Keys/{1}'.format(instance._state.db, filename)


def file_lesson_path(instance, filename):
    return '{0}/lessons/{1}/{2}'.format(instance._state.db, instance.lesson.id, filename)


# --------------------------------------------------------
class LessonContent(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, )
    file_type = models.CharField(max_length=20, choices=MEDIA_CHOICES, default='none', null=True, )
    file = models.FileField(upload_to=file_lesson_path, null=True, blank=True)
    content = models.TextField()
    class_id_list = models.CharField(max_length=MAX_JSON_LENGTH)


# --------------------------------------------------------
# 题目基类
class Question(models.Model):
    description = models.TextField()
    sectionID = models.ForeignKey(Lesson, on_delete=models.CASCADE, )
    flag = models.PositiveSmallIntegerField()
    star = models.PositiveSmallIntegerField()    
    case_analyse = models.ForeignKey(
        'CaseAnalyseQuestion',
        models.SET_NULL,
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True

    @classmethod
    def get_url_name(cls):
        return cls.__name__.replace('Question', '', 1)
        

# 填空题
class FillInBlankQuestion(Question):
    key = models.TextField()


# 判断题
class TrueOrFalseQuestion(Question):
    key = models.BooleanField()


# 单项选择题
class ChoiceQuestion(Question):
    options = models.TextField()
    key = models.PositiveSmallIntegerField()


# 多项选择题
class MultiChoiceQuestion(Question):
    options = models.TextField()
    key = models.CharField(max_length=64)


# 配对题
class PairQuestion(Question):
    leftOptions = models.TextField()
    rightOptions = models.TextField()
    # pairKey = models.TextField()


# 排序题
class SortQuestion(Question):
    options = models.TextField()
    # key = models.TextField()


# 案例、简答题
class CaseAnalyseQuestion(Question):
    subQuestions = models.TextField(max_length=MAX_JSON_LENGTH)  # JSONField()


# 语音题
class VoiceQuestion(Question):
    qVoice = models.FileField(upload_to=file_voice_question_path, null=True, blank=True)
    key = models.FileField(upload_to=file_voice_key_path, null=True, blank=True)


# 合同题
class ContractQuestion(Question):
    key = models.TextField()

# ---------------
# 题目类方法
def get_qType_class(qType_name: str):
    for iterType in Question.__subclasses__():
        if iterType.get_url_name() == qType_name:
            return iterType
    raise AttributeError('Do not have this type:' + qType_name)


def get_qType_list():
    type_list = []
    for iterType in Question.__subclasses__():
        type_list.append(iterType.get_url_name())

    return type_list
