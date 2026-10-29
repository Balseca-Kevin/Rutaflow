# RutaFlow — Solicitudes RFC y Comité de Cambios (versión final)

Aplicación web académica de solicitudes de cambio para un sistema de reservas de viajes en buses. Está basada en las capturas de formulario de pasajero y desarrollador, con los bloques complementarios de la RFC del IT Process Wiki y clasificación de cambios según ITIL.

## Ejecución

1. Descomprimir este proyecto.
2. Abrir `index.html` en Google Chrome o Microsoft Edge. También funciona mediante Live Server de VS Code.
3. En la pantalla de acceso elegir **Continuar como pasajero** sin iniciar sesión, o entrar como personal autorizado:

| Rol | Usuario | Contraseña |
|---|---|---|
| Pasajero | Sin cuenta | Sin contraseña |
| Desarrollador | `desarrollador` | `dev123` |
| Comité | `comite` | `comite123` |

Son cuentas ficticias visibles en el login para exposición. No constituyen un mecanismo seguro de autenticación.

## Flujo implementado

**Pasajero o personal interno** → registra nombre, contacto, rol (pasajero, comprador, representante, oficinista o administrador de cooperativa), módulo de reservas u operación interna, descripción, motivo, beneficios, consecuencias si no se implementa, prioridad, categoría funcional, origen y evidencia adjunta opcional. El sistema agrega ID y fecha automáticamente. No requiere acceso con cuenta.

**Desarrollador** → registra nombre y contacto del iniciador, especialidad, módulo, justificación, beneficios, consecuencias de no cambiar, áreas del negocio y CIs, impacto, riesgo, esfuerzo, costo, recursos, mitigación, propuesta de implementación y reversión, prioridad, tipo funcional, origen, tarea o rama Git, pruebas y adjuntos opcionales.

**Comité de Cambios** → accede al expediente prellenado y consulta los datos originales sin editarlos. Completa los bloques RFC faltantes y registra una resolución con fecha y nombre del revisor. El comité puede aprobar o rechazar con explicación obligatoria. La decisión queda cerrada y se añade al historial de trazabilidad. La bandeja permite ordenar las solicitudes pendientes por prioridad y filtrar por estado, prioridad y tipo funcional. El comité puede exportar un expediente JSON de evidencia. El sistema **no implementa ni despliega** cambios.

### Reglas de aprobación

Para aprobar, el comité debe documentar identificación del propietario, prioridad asignada, clasificación ITIL, caso de negocio (razón, beneficios, consecuencias), áreas/servicios/CI afectados, impacto, riesgos, mitigación, costo, presupuesto, esfuerzo, recursos, fecha programada, **plan de implementación** y **plan de reversión**; además de revisor y justificación.

- **Normal:** requiere evaluación, programación y decisión del comité.
- **Estándar:** bajo riesgo y con procedimiento previamente autorizado. El formulario exige la referencia de preautorización; la decisión del comité en esta demo representa verificación/documentación, no sustituye la autorización previa.
- **Emergencia:** requiere justificación adicional de urgencia. La demostración sigue el mismo comité, aunque en un sistema real podría usar una autoridad de cambio de emergencia.

Un cambio con costo mayor que cero no se puede aprobar con presupuesto pendiente o marcado como «no requerido». El rechazo requiere nombre del aprobador y motivación, aunque no se exigen planes de ejecución para una solicitud que no se llevará a cabo.

**Dos conceptos diferentes:** la *categoría funcional* («reservas y asientos», «seguridad», «Bug/Error») no reemplaza la *clasificación ITIL* («estándar», «normal», «emergencia»).

## Prueba sugerida en clase

1. Abrir como pasajero sin login, completar el formulario y enviar. Anotar el código `RF-....`.
2. Entrar con cuenta desarrollador y registrar un RFC técnico, incluyendo plan y rollback.
3. Ingresar como comité. Comprobar que los reportes contienen la información original.
4. Elegir **Aprobar** con la evaluación incompleta: debe mostrar un aviso e impedir guardar.
5. Completar los bloques del comité (incluido rollback y ventana) y aprobar con justificación.
6. Abrir otra solicitud y rechazarla indicando el motivo.
7. Revisar fechas e historial, y exportar el JSON de uno de los reportes.

## Integración prevista con Gran Continental

- Los módulos del formulario incluyen los de operación interna del sistema: venta presencial, revisión de comprobantes, flota y planos de asientos, y administración de usuarios y cooperativas.
- En el prototipo el rol se elige en el formulario. En Gran Continental se tomará de la sesión (Cliente, Oficinista o Administrador de cooperativa), con las tablas `roles`, `permisos` y `rol_permiso`.
- `localStorage` se reemplazará por tablas en PostgreSQL mediante Prisma, el ID RF lo generará el servidor y el historial usará la tabla `auditoria`.

## Alcance y limitaciones

- Funciona sin dependencias en HTML/CSS/JavaScript.
- Almacena solicitudes, evaluaciones, decisiones y adjuntos en `localStorage` del **mismo navegador y mismo origen**. Para compartirlos entre computadores se requiere backend y base de datos. Los ejemplos iniciales son ficticios.
- Las restricciones por rol y contraseñas son demostrativas del lado del cliente; pueden eludirse y no constituyen seguridad. No usar datos personales reales ni efectuar transacciones reales.
- El ID se genera localmente: **no es globalmente único entre dispositivos**. En producción debe ser generado por el servidor.
- Un archivo de hasta 700 KB por RFC puede guardarse en el navegador. La exportación JSON contiene los metadatos del adjunto, **no el archivo binario**.
- La exportación y el registro local **no son evidencias a prueba de manipulación**. Para auditorías reales se necesita control de acceso en servidor, registro append-only, respaldos, integridad y retención.
- Registrar una aprobación no ejecuta el cambio ni reemplaza controles operativos de implementación o revisión posterior.
- La UI conserva la estructura de ambos bocetos, adaptada al sistema de reservas de buses.

## Estructura del ZIP

- `index.html`: acceso, formularios y comité.
- `assets/styles.css`, `assets/updated.css`, `assets/rfc.css`: estilos.
- `assets/app.js`: datos, validación, evaluación RFC, rol y trazabilidad.
- `TEXTO_PARA_INFORME.md`: justificación, conclusiones y recomendaciones listas para adaptar al informe.
- `MATRIZ_CUMPLIMIENTO_RFC.md`: comprobación requisito por requisito.

## Referencias técnicas

- IT Process Wiki (IT Process Maps). [Lista de control - Solicitud de Cambio RFC](https://wiki.es.it-processmaps.com/index.php/Lista_de_control_-_Solicitud_de_Cambio_RFC).
- AXELOS / PeopleCert (material de examen). [ITIL 4 Change Enablement Practice, rationales](https://eu-assets.contentstack.com/v3/assets/blt637b065823946b12/blta30a30c16f99245c/655b562466052b040a367c55/EN_ITIL4_Change_Enablement_Sample_Paper1_Rationales_v.1.0.pdf).
- ServiceNow. [What Is IT Change Management?](https://www.servicenow.com/products/itsm/what-is-it-change-management.html).
