import logging
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from ratelimit.decorators import ratelimit
from smtplib import SMTPException
from .forms import ContactForm

# Configuramos el logger para errores en producción
logger = logging.getLogger(__name__)

@ratelimit(key='ip', rate='5/m', method='POST', block=False)
def index(request):
    form = ContactForm()
    
    if request.method == 'POST':
        # 1. Verificar Rate Limiting
        if getattr(request, 'limited', False):
            messages.error(request, 'Has enviado demasiados mensajes. Por favor, espera un minuto.')
            return redirect('index')

        form = ContactForm(request.POST)
        
        # 2. Validación de datos y Honeypot
        if form.is_valid():
            email_usuario = form.cleaned_data['email']
            mensaje_usuario = form.cleaned_data['message']

            asunto = f"🛡️ Contacto Portfolio: {email_usuario}"
            cuerpo = f"Remitente: {email_usuario}\n\nContenido:\n{mensaje_usuario}"
            
            try:
                # 3. Envío seguro con timeout (el timeout se hereda de settings.EMAIL_TIMEOUT)
                send_mail(
                    asunto,
                    cuerpo,
                    settings.EMAIL_HOST_USER,
                    ['marcoscufre04@gmail.com'],
                    fail_silently=False,
                )
                messages.success(request, '¡Mensaje enviado con éxito! Te responderé pronto.')
                return redirect('index')

            except SMTPException as e:
                # 4. Manejo de excepciones y Logging
                logger.error(f"Error SMTP al enviar correo desde {email_usuario}: {str(e)}")
                messages.error(request, 'Error técnico al enviar el correo. Inténtalo más tarde.')
            except Exception as e:
                logger.error(f"Error inesperado en formulario de contacto: {str(e)}")
                messages.error(request, 'Algo salió mal. Por favor, inténtalo de nuevo.')
        else:
            messages.error(request, 'Por favor, corrige los errores en el formulario.')

    return render(request, 'index.html', {'form': form})


def proyecto_cine(request):
    return render(request, 'proyecto_cine.html')


def proyecto_agencia(request):
    return render(request, 'proyecto_agencia.html')


def proyecto_agrotrack(request):
    return render(request, 'proyecto_agrotrack.html')
