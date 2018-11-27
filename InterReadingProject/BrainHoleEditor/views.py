from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed, HttpResponseRedirect, QueryDict

# Create your views here.
def test(request):
    return render(request=request, template_name="test.html", )
