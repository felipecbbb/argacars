// Maneja el envío de los formularios de contacto al endpoint /api/contact
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('form.contact-form').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const btnHtml = btn ? btn.innerHTML : '';

      const data = {
        name: (form.querySelector('[name="name"]') || {}).value || '',
        email: (form.querySelector('[name="email"]') || {}).value || '',
        phone: (form.querySelector('[name="phone"]') || {}).value || '',
        message: (form.querySelector('[name="message"]') || {}).value || '',
        company: (form.querySelector('[name="company"]') || {}).value || '', // honeypot
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
