from django.forms import ModelForm, HiddenInput, Textarea, CheckboxInput

from .models import *

FIELD_LIST = ['description', 'sectionID', 'flag', 'star']
Q_WIDGETS_SETTING = {
    'description': Textarea(attrs={'class': 'form-control'}),
    'sectionID': HiddenInput(),  # attrs={'id': 'Input_SectionID'}),
    'flag': HiddenInput(),
    'star': HiddenInput(),
}

Q_LABELS_SETTING = {
    'description': '题干'
}


# 填空题
class FillInBlankForm(ModelForm):
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
    class Meta:
        model = SortQuestion
        fields = FIELD_LIST + ['options']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'options': HiddenInput(),
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
