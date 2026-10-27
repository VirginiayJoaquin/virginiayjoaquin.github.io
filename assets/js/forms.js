// Utilidades compartidas por los formularios (RSVP y canciones).

export function limpiarErrores(form) {
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  form.querySelectorAll('[data-error-de]').forEach((el) => {
    el.textContent = '';
    el.hidden = true;
  });
  mostrarEstado(form, '');
}

export function mostrarError(form, nombre, mensaje) {
  const control = form.elements[nombre];
  const controles = control instanceof RadioNodeList ? [...control] : [control];
  controles.forEach((el) => el.setAttribute('aria-invalid', 'true'));
  const error = form.querySelector(`[data-error-de="${nombre}"]`);
  error.textContent = mensaje;
  error.hidden = false;
}

export function enfocarPrimerError(form) {
  form.querySelector('[aria-invalid="true"]')?.focus();
}

// tipo: '' | 'ok' | 'error'
export function mostrarEstado(form, mensaje, tipo = '') {
  const estado = form.querySelector('[data-estado]');
  estado.textContent = mensaje;
  estado.dataset.tipo = tipo;
}

export function marcarEnviando(form, enviando) {
  const boton = form.querySelector('[type="submit"]');
  if (enviando) {
    boton.dataset.textoOriginal = boton.textContent;
    boton.textContent = 'Enviando…';
  } else if (boton.dataset.textoOriginal) {
    boton.textContent = boton.dataset.textoOriginal;
  }
  boton.disabled = enviando;
  form.setAttribute('aria-busy', String(enviando));
}
