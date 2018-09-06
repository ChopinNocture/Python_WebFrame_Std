from django import forms # Form, CharFieldModelForm  , HiddenInput,Textarea,CheckboxInput

from .models import StudentProgressInfo

# FIELD_LIST = ['description', 'sectionID', 'flag', 'star']

class LoginForm(forms.Form):
    username = forms.CharField(label='用户名', label_suffix=' ')
    password = forms.CharField(widget=forms.PasswordInput, label='密码', label_suffix=' ')
    

class Student_Prof_Form(forms.ModelForm):
    class Meta:
        model = StudentProgressInfo
        fields = '__all__'