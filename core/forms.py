from django import forms
from django.core.validators import EmailValidator, MinLengthValidator, MaxLengthValidator

class ContactForm(forms.Form):
    # Campos reales con validaciones de longitud y formato
    email = forms.EmailField(
        validators=[EmailValidator()],
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'tu@email.com'})
    )
    message = forms.CharField(
        validators=[MinLengthValidator(10), MaxLengthValidator(2000)],
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Escribe tu mensaje...'})
    )
    
    # Campo Honeypot: Atractivo para bots, invisible para humanos
    website = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'style': 'display:none !important;', 'tabindex': '-1', 'autocomplete': 'off'})
    )

    def clean(self):
        cleaned_data = super().clean()
        # Si el campo honeypot tiene contenido, es un bot
        if cleaned_data.get('website'):
            raise forms.ValidationError("Bot detected.")
        return cleaned_data
