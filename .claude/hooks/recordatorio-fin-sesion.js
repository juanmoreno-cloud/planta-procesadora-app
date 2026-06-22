// Hook de fin de sesión (Stop) para Optiflow.
// Imprime un recordatorio para mantener CLAUDE.md actualizado y guardar el progreso.
// Se ejecuta automáticamente cuando Claude Code termina una sesión.
// No bloquea nada: solo muestra el mensaje (salida por stderr, código de salida 0).

const mensaje = `
===== RECORDATORIO OPTIFLOW (fin de sesión) =====
Antes de cerrar:
  1) Actualiza CLAUDE.md → sección 5 "Estado actual" con lo que se hizo y lo que sigue.
  2) Guarda el progreso en GitHub:
       git add -A
       git commit -m "Describe brevemente lo que hiciste"
       git push
=================================================
`;

console.error(mensaje);
process.exit(0);
