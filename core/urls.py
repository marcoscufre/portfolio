from django.urls import path, include
from .views import index, proyecto_cine, proyecto_agencia, proyecto_agrotrack, proyecto_logitrack

urlpatterns = [
    path('', index, name='index'),
    path('proyecto/cine/', proyecto_cine, name='proyecto_cine'),
    path('proyecto/agencia/', proyecto_agencia, name='proyecto_agencia'),
    path('proyecto/agrotrack/', proyecto_agrotrack, name='proyecto_agrotrack'),
    path('proyecto/logitrack/', proyecto_logitrack, name='proyecto_logitrack'),
]
