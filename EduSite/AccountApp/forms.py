from django import forms # Form, CharFieldModelForm  , HiddenInput,Textarea,CheckboxInput

from .models import StudentProf

# FIELD_LIST = ['description', 'sectionID', 'flag', 'star']

class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

class Student_Prof_Form(forms.ModelForm):
    class Meta:
        model = StudentProf
        fields = '__all__'