from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages

# Create your views here.


def index(request):
    if request.method == 'POST':
        email_usuario = request.POST.get('email')
        mensaje_usuario = request.POST.get('message')

        asunto = f"Nuevo mensaje de contacto del Portfolio: {email_usuario}"
        cuerpo_mensaje = f"Has recibido un nuevo mensaje de: {email_usuario}\n\nContenido:\n{mensaje_usuario}"
        remitente = settings.EMAIL_HOST_USER
        destinatario = ['marcoscufre04@gmail.com']

        try:
            send_mail(asunto, cuerpo_mensaje, remitente, destinatario)
            messages.success(request, '¡Mensaje enviado con éxito! Te responderé pronto.')
        except Exception:
            messages.error(request, 'Hubo un error al enviar el mensaje. Inténtalo de nuevo más tarde.')
            
        return redirect('index')

    return render(request, 'index.html')


def proyecto_cine(request):
    return render(request, 'proyecto_cine.html')


def proyecto_agencia(request):
    return render(request, 'proyecto_agencia.html')


def proyecto_agrotrack(request):
    return render(request, 'proyecto_agrotrack.html')


