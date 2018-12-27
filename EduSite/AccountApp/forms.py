from django.forms import Form, CharField, IntegerField, ModelForm, PasswordInput, HiddenInput, CheckboxInput, TextInput, NumberInput
from .models import StudentProgressInfo

# FIELD_LIST = ['description', 'sectionID', 'flag', 'star']

class LoginForm(Form):
    username = CharField(label='用户名', label_suffix=' ')
    password = CharField(widget=PasswordInput, label='密码', label_suffix=' ')
    

class Student_Prof_Form(ModelForm):
    class Meta:
        model = StudentProgressInfo
        fields = '__all__'
        widgets = {
            'user_id': HiddenInput(),
            'gold': HiddenInput(),
            'progress': HiddenInput(),
            'rank': HiddenInput(),
            'level': HiddenInput(),
            'add_gold': HiddenInput(),
        }