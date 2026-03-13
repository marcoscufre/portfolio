from django import forms
from django.core.validators import EmailValidator, MinLengthValidator, MaxLengthValidator

class ContactForm(forms.Form):
    # Campo nombre agregado para la nueva integración
    name = forms.CharField(
        validators=[MinLengthValidator(2), MaxLengthValidator(100)],
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Tu nombre'})
    )
    email = forms.EmailField(
        validators=[EmailValidator()],
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'tu@email.com'})
    )
    message = forms.CharField(
        validators=[MinLengthValidator(10), MaxLengthValidator(2000)],
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Escribe tu mensaje...'})
    )
    
    # Honeypot: Atractivo para bots, invisible para humanos
    website = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'style': 'display:none !important;', 'tabindex': '-1', 'autocomplete': 'off'})
    )

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('website'):
            raise forms.ValidationError("Bot detected.")
        return cleaned_data
