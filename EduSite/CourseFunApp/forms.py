from django.forms import CharField, IntegerField, ModelForm, HiddenInput, Textarea, CheckboxInput, TextInput, NumberInput, FileInput, \
    Select

from .models import *

FIELD_LIST = ['description', 'flag', 'star']
Q_WIDGETS_SETTING = {
    'description': Textarea(attrs={'class': 'form-control'}),
    'flag': HiddenInput(),
    'sectionID': HiddenInput(),
    'star': HiddenInput(),
    'case_analyse': HiddenInput(),
}

Q_LABELS_SETTING = {
    'description': '题干'
}


# 填空题
class FillInBlankForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)

    class Meta:
        model = FillInBlankQuestion
        fields = FIELD_LIST + ['key']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'key': HiddenInput()
        })
        labels = Q_LABELS_SETTING


# 判断题
class TrueOrFalseForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)

    class Meta:
        model = TrueOrFalseQuestion
        fields = FIELD_LIST + ['key']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'key': CheckboxInput()
        })
        labels = Q_LABELS_SETTING
        labels.update({'key': '答案为 正确'})


# 单项选择题
class ChoiceForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)
    
    class Meta:
        model = ChoiceQuestion
        fields = FIELD_LIST + ['options', 'key']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'options': HiddenInput(),
            'key': HiddenInput(),
        })
        labels = Q_LABELS_SETTING
        labels.update({
            'key': 'SubmitKey'
        })
        help_texts = {
            'key': '1'
        }


# 多项选择题
class MultiChoiceForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)
    
    class Meta:
        model = MultiChoiceQuestion
        fields = FIELD_LIST + ['options', 'key']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'options': HiddenInput(),
            'key': HiddenInput(),
        })
        labels = Q_LABELS_SETTING


# 配对题
class PairForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)
    
    class Meta:
        model = PairQuestion
        fields = FIELD_LIST + ['leftOptions', 'rightOptions']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'leftOptions': HiddenInput(),
            'rightOptions': HiddenInput(),
        })
        labels = Q_LABELS_SETTING


# 排序题
class SortForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)
    
    class Meta:
        model = SortQuestion
        fields = FIELD_LIST + ['options']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'options': HiddenInput(),
        })
        labels = Q_LABELS_SETTING


# 案例、简答题
class CaseAnalyseForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)
    
    class Meta:
        model = CaseAnalyseQuestion
        fields = FIELD_LIST + ['subQuestions']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'subQuestions': HiddenInput(),
        })
        labels = Q_LABELS_SETTING

# 语音题
class VoiceForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)
    
    class Meta:
        model = VoiceQuestion
        fields = FIELD_LIST + ['qVoice', 'key']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'qVoice': FileInput(attrs={'class': 'custom-file-input',
                            'aria-describedby': 'title-audio-label',
                            'accept': 'audio/*'}),
            'key': FileInput(attrs={'class': 'custom-file-input',
                            'aria-describedby': 'title-audio-label',
                            'accept': 'audio/*'})
        })

        labels = Q_LABELS_SETTING

# 合同题
class ContractForm(ModelForm):
    sectionID = IntegerField(widget=HiddenInput)

    class Meta:
        model = ContractQuestion
        fields = FIELD_LIST + ['key']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'key': HiddenInput()
        })
        labels = Q_LABELS_SETTING

# ---------------
# 题目Form方法
current_module = __import__(__name__)
Q_FORM_SUFFIX = 'Form'


def get_qForm_class(qType_name: str):
    try:
        formCls = getattr(current_module.forms, qType_name + Q_FORM_SUFFIX)
    except (AttributeError) as e:
        print(e)
        raise AttributeError('Forms do not have this type:' + qType_name)

    if not issubclass(formCls, ModelForm):
        raise AttributeError('ModelForm do not have this type:' + qType_name)

    return formCls


# ---------------
# Examination form
class ExaminationForm(ModelForm):
    class Meta:
        model = Examination
        fields = '__all__'
        widgets = {
            'title': TextInput(attrs={'class': 'form-control',
                                      'placeholder': '请输入试卷名称',
                                      'aria-label': '试卷名称',
                                      'aria-describedby': 'exma-name-label',
                                      'pattern': '[\w\u4e00-\u9fa5, \-_<>;\'\"]{2,30}'}),
            'question_list': HiddenInput(),  # attrs={'id': 'Input_SectionID'}),
            'duration': NumberInput(attrs={'class': 'form-control',
                                           'id': 'exam-duration',
                                           'min': '10',
                                           'max': '1440',
                                           'aria-describedby': 'exam-duration-label'}),
            'start_time': HiddenInput(),
            'end_time': HiddenInput(),
            'class_id_list': HiddenInput(),
        }

        labels = {
            'title': '题干',
            'duration': '考试时长',
            'start_time': '考试时间',
            'end_time': '结束时间'
        }


# ---------------
# ExamAnswer form
class ExamAnswerForm(ModelForm):
    class Meta:
        model = ExamAnswer
        fields = '__all__'
        widgets = {
            'exam': HiddenInput(),  # attrs={'id': 'Input_SectionID'}),            
            'user_id': HiddenInput(),
            'answer_json': HiddenInput(),
            'score': HiddenInput(),
            'addition_score': HiddenInput(),
        }


# ---------------
# Lesson Content form
class LessonContentForm(ModelForm):
    file_name = CharField(widget=HiddenInput, required=False)
    lesson = IntegerField(widget=HiddenInput)

    class Meta:
        model = LessonContent
        fields = ['file_type', 'file', 'content', 'class_id_list']
        widgets = {
            'content': Textarea(attrs={'class': 'form-control',
                                       'placeholder': '请输入课程文字描述',
                                       'aria-label': '',
                                       'aria-describedby': 'lesson-content-label',
                                       'cols': 30, 'rows': 4}),
            'lesson': HiddenInput(),  # attrs={'id': 'Input_SectionID'}),            
            'class_id_list': HiddenInput(),
            'file': FileInput(attrs={'class': 'custom-file-input',
                                     'aria-describedby': 'exam-duration-label',
                                     'accept': 'image/*'}),
        }
        widgets.update({
            'file_type': Select(attrs={'class': 'form-control'}),
        })