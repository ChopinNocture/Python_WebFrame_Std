from django.forms import ModelForm, Textarea

from .models import *


# 公告表单
class NoticesForm(ModelForm):
    class Meta:
        model = Notices
        widgets = {
            'content': Textarea(attrs={'class': 'form-control', 'cols':30, 'rows':4 }),
        }
        fields = '__all__'


