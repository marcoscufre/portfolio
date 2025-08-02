from django.urls import path, include
from .views import index, proyecto_cine, proyecto_agencia, proyecto_ecommerce, about

urlpatterns = [
    path('', index, name='index'),
    path('proyecto/cine/', proyecto_cine, name='proyecto_cine'),
    path('proyecto/agencia/', proyecto_agencia, name='proyecto_agencia'),
    path('proyecto/ecommerce/', proyecto_ecommerce, name='proyecto_ecommerce'),
    path('about/', about, name='about'),
]
