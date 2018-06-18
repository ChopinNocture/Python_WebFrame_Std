from django import forms # Form, CharFieldModelForm  , HiddenInput,Textarea,CheckboxInput

from .models import *

# FIELD_LIST = ['description', 'sectionID', 'flag', 'star']

class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)