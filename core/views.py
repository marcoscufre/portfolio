import logging
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from django.core.cache import cache # <--- Usamos la caché nativa de Django
from smtplib import SMTPException
from .forms import ContactForm

# Logger para ver errores en los logs de Render
logger = logging.getLogger(__name__)

def index(request):
    form = ContactForm()
    
    if request.method == 'POST':
        # --- LÓGICA DE RATE LIMIT MANUAL ---
        # Obtenemos la IP del usuario
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
            
        cache_key = f"contact_limit_{ip}"
        intentos = cache.get(cache_key, 0)
        
        # Límite: 5 mensajes por cada 5 minutos
        if intentos >= 5:
            messages.error(request, 'Has enviado demasiados mensajes. Por favor, espera unos minutos.')
            return redirect('index')

        form = ContactForm(request.POST)
        
        if form.is_valid():
            email_usuario = form.cleaned_data['email']
            mensaje_usuario = form.cleaned_data['message']

            asunto = f"🛡️ Contacto Portfolio: {email_usuario}"
            cuerpo = f"Remitente: {email_usuario}\n\nContenido:\n{mensaje_usuario}"
            
            try:
                # Envío con el timeout configurado en settings.py
                send_mail(
                    asunto,
                    cuerpo,
                    settings.EMAIL_HOST_USER,
                    ['marcoscufre04@gmail.com'],
                    fail_silently=False,
                )
                
                # Incrementamos el contador de la IP y le damos una expiración de 5 minutos (300 seg)
                cache.set(cache_key, intentos + 1, 300)
                
                messages.success(request, '¡Mensaje enviado con éxito! Te responderé pronto.')
                return redirect('index')

            except SMTPException as e:
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
