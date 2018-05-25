from django.forms import ModelForm, HiddenInput

from .models import *

FIELD_LIST = ['description', 'sectionID', 'flag', 'star']
Q_WIDGETS_SETTING = {
    'sectionID': HiddenInput(), #attrs={'id': 'Input_SectionID'}),
    'flag': HiddenInput(),
    'star': HiddenInput(),
}

# 填空题
class FillInBlankForm(ModelForm):
    class Meta:
        model = FillInBlankQuestion
        fields = FIELD_LIST + ['blankKeys']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'blankKeys': HiddenInput()
        })
        


# 判断题
class TrueOrFalseForm(ModelForm):
    class Meta:
        model = TrueOrFalseQuestion
        fields = FIELD_LIST + ['Key']


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
        labels = {
            'key': 'SubmitKey'
        }
        help_texts = {
            'key': '1'
        }


# 多项选择题
class MultiChoiceForm(ModelForm):
    class Meta:
        model = MultiChoiceQuestion
        fields = FIELD_LIST + ['options', 'keys']
        widgets = Q_WIDGETS_SETTING
        widgets.update({
            'options': HiddenInput(),
            'keys': HiddenInput(),
        })


# 配对题
class PairForm(ModelForm):
    class Meta:
        model = PairQuestion
        fields = FIELD_LIST + ['leftOptions', 'rightOptions', 'pairKeys']


# 排序题
class SortForm(ModelForm):
    class Meta:
        model = SortQuestion
        fields = FIELD_LIST + ['options', 'keys']
