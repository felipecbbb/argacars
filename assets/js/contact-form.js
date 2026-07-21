// Maneja el envío de los formularios de contacto al endpoint /api/contact
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('form.contact-form').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const btnHtml = btn ? btn.innerHTML : '';

      const val = function (n) { return ((form.querySelector('[name="' + n + '"]') || {}).value || '').trim(); };
      const data = {
        name: val('name'),
        email: val('email'),
        phone: val('phone'),
        modelo: val('modelo'),
        anio: val('anio'),
        km: val('km'),
        equipamiento: val('equipamiento'),
        presupuesto: val('presupuesto'),
        enlaces: val('enlaces'),
        company: val('company'), // honeypot
      };

      if (btn) { btn.disabled = true; btn.innerHTML = 'Enviando…'; }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(function () { return {}; });

        if (res.ok && json.ok) {
          // Meta Pixel: conversión de lead (solo en envío correcto)
          if (typeof fbq === 'function') {
            fbq('track', 'Lead', { content_name: 'Solicitud de presupuesto' });
          }
          form.reset();
          if (btn) { btn.innerHTML = '✓ Enviado'; }
          alert('¡Gracias! Hemos recibido tu solicitud. Te contactaremos muy pronto.');
        } else {
          throw new Error(json.error || 'Error al enviar');
        }
      } catch (err) {
        alert('No se pudo enviar el formulario. Escríbenos a info@argapremiumcars.com o inténtalo de nuevo.');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
      }
    });
  });
});
