import logging
import resend  # Librería oficial
from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib import messages
from django.core.cache import cache
from .forms import ContactForm

# Logger para ver errores en los logs de Render
logger = logging.getLogger(__name__)

# Configuración global de Resend
resend.api_key = settings.RESEND_API_KEY

def index(request):
    form = ContactForm()
    
    if request.method == 'POST':
        # --- RATE LIMIT MANUAL (IP-based) ---
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        cache_key = f"contact_limit_{ip}"
        intentos = cache.get(cache_key, 0)
        
        if intentos >= 5:
            messages.error(request, 'Has enviado demasiados mensajes. Por favor, espera unos minutos.')
            return redirect('index')

        form = ContactForm(request.POST)
        
        if form.is_valid():
            nombre = form.cleaned_data['name']
            email_visitante = form.cleaned_data['email']
            mensaje_usuario = form.cleaned_data['message']

            try:
                # Envío vía API de Resend
                params = {
                    "from": settings.DEFAULT_FROM_EMAIL,
                    "to": ["marcoscufre04@gmail.com"],
                    "subject": f"🚀 Nuevo mensaje de {nombre}",
                    "reply_to": email_visitante,
                    "html": f"""
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #007bff;">Nuevo mensaje desde tu Portfolio</h2>
                            <p><strong>Nombre:</strong> {nombre}</p>
                            <p><strong>Email:</strong> {email_visitante}</p>
                            <p><strong>Mensaje:</strong></p>
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                                {mensaje_usuario}
                            </div>
                            <hr style="margin-top: 20px;">
                            <p style="font-size: 12px; color: #777;">Enviado automáticamente por tu sistema Django.</p>
                        </div>
                    """,
                }
                
                resend.Emails.send(params)
                
                # Actualizar caché de rate limit
                cache.set(cache_key, intentos + 1, 300)
                
                messages.success(request, '¡Mensaje enviado con éxito! Te responderé pronto.')
                return redirect('index')

            except Exception as e:
                logger.error(f"Error en Resend API: {str(e)}")
                messages.error(request, 'Algo salió mal. Por favor, inténtalo de nuevo más tarde.')
        else:
            messages.error(request, 'Por favor, corrige los errores en el formulario.')

    return render(request, 'index.html', {'form': form})


def proyecto_cine(request):
    return render(request, 'proyecto_cine.html')


def proyecto_agencia(request):
    return render(request, 'proyecto_agencia.html')


def proyecto_agrotrack(request):
    return render(request, 'proyecto_agrotrack.html')
