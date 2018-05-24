from django.forms import ModelForm, HiddenInput

from .models import *

FIELD_LIST = ['description', 'sectionID', 'flag', 'star']


# 填空题
class FillInBlankForm(ModelForm):
    class Meta:
        model = FillInBlankQuestion
        fields = FIELD_LIST + ['blankKeys']
        widgets = {
            'blankKeys': HiddenInput()
        }


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
        widgets = {
            'options': HiddenInput(attrs={'id': 'Input_Options'}),
            'key': HiddenInput(attrs={'id': 'Input_Key'}),
        }
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
        widgets = {
            'options': HiddenInput(attrs={'id': 'Input_Options'}),
            'keys': HiddenInput(attrs={'id': 'Input_Key'}),
        }


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
