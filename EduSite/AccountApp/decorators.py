from functools import wraps
from urllib.parse import urlparse
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.shortcuts import resolve_url
from django.http import HttpResponseRedirect
from django.core.exceptions import ObjectDoesNotExist

from AccountApp.models import Course
from AccountApp import COURSE_KEY


def course_required(function=None, redirect_field_name=REDIRECT_FIELD_NAME, course_url='/user/course/'):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if COURSE_KEY in request.session:
                c_id = request.session[COURSE_KEY]
                try:
                    course = Course.objects.get(id=c_id)
                    request.db_name = course.db_name
                    request.course_desc = course.description
                    return view_func(request, *args, **kwargs)
                except ObjectDoesNotExist as e:
                    print(e)
                    return HttpResponseRedirect(course_url)
            else:
                return HttpResponseRedirect(course_url)
        return _wrapped_view
        
    if function:
        return decorator(function)
    return decorator