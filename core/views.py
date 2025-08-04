from django.shortcuts import render

# Create your views here.


def index(request):
    return render(request, 'index.html')


def proyecto_cine(request):
    return render(request, 'proyecto_cine.html')


def proyecto_agencia(request):
    return render(request, 'proyecto_agencia.html')


def proyecto_ecommerce(request):
    return render(request, 'proyecto_ecommerce.html')


