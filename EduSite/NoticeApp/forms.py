from django.forms import ModelForm

from .models import *


# 公告表单
class NoticesForm(ModelForm):
    class Meta:
        model = Notices
        fields = '__all__'


