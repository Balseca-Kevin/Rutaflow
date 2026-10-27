# Matriz de alineación RFC / ITIL — RutaFlow

Esta matriz indica el campo implementado, su ubicación y la regla de validación. «Alineado» corresponde al **diseño de un prototipo académico**; no implica conformidad o certificación ITIL de un servicio operativo.

| Requisito de la investigación | Implementación en RutaFlow | Control |
|---|---|---|
| ID único | RF-0001, RF-0002... visible en solicitud y reporte | Automático dentro del navegador; en producción debe ser global |
| Fecha de presentación | Fecha y hora al registrar la solicitud | Automática |
| Iniciador identificado | Nombre, correo y perfil en pasajero y desarrollador | Obligatorios al enviar |
| Propietario del cambio | Campo del comité «Propietario del cambio» | Obligatorio para aprobar |
| Prioridad propuesta | Radio botones del pasajero y del desarrollador; ordenación y filtro de bandeja | Obligatoria al solicitar |
| Prioridad aprobada | «Prioridad asignada por el comité» | Obligatoria para aprobar, puede diferir de la propuesta |
| Descripción / resumen | «Descripción del cambio» o «Descripción técnica» | Obligatoria |
| Motivo / caso de negocio | «Motivo» en pasajero, justificación técnica y del negocio en desarrollador, verificación del comité | Obligatorio para aprobar |
| Beneficios | Ambos formularios y comité | Obligatorios en solicitud y para aprobar |
| Consecuencias de no aplicar | Ambos formularios y comité | Obligatorios en solicitud y para aprobar |
| Tipo funcional | Categorías como asientos, pagos, interfaz, seguridad, bug, base de datos; filtro de bandeja | Obligatorio al solicitar |
| Clasificación ITIL | Estándar / Normal / Emergencia | La decide el comité al aprobar; estándar exige código previo; emergencia exige justificación de urgencia |
| Áreas de negocio afectadas | Campo técnico y verificación del comité | Obligatorio para aprobar |
| Servicio afectado | Módulo / servicio de reserva y campo del comité | Obligatorio para aprobar |
| Elementos de configuración CI | Campo técnico y del comité | Obligatorio para aprobar |
| Impacto | Evaluación del desarrollador / del comité | Obligatorio para aprobar |
| Riesgos | Evaluación técnica y campo específico del comité | Obligatorio para aprobar |
| Contramedidas | Mitigación y controles preventivos | Obligatorio para aprobar |
| Plan de reversión | Propuesta del desarrollador y verificación del comité | Obligatorio antes de aprobar |
| Plan de implementación | Propuesta del desarrollador y verificación del comité | Obligatorio antes de aprobar |
| Calendario | Fecha propuesta por el desarrollador / hora programada por comité | Obligatoria para aprobar |
| Recursos requeridos | Desarrollador y comité | Obligatorio para aprobar |
| Esfuerzo | Horas estimadas (desarrollador y comité) | Obligatorio para aprobar, mayor a 0 |
| Costos | Estimación USD del desarrollador y comité | Obligatorio para aprobar, permite 0 |
| Presupuesto | Aprobado / no requerido / pendiente | Si el costo es mayor a 0, no se permite aprobar con pendiente o no requerido |
| Documentos adicionales | Adjunto opcional | Conserva copia local limitada a 700 KB |
| Aprobador y revisores | Nombre del responsable y otros revisores | Responsable y decisión obligatorios |
| Aprobación / rechazo y motivo | Decisión + fundamento | Sin justificación no se registra ninguna resolución |
| Fecha de resolución | Fecha de la decisión | Automática |
| Restricciones / condiciones | Campo de comité | Opcional, visible en expediente resuelto |
| Historial de decisiones | Registro de presentación y resolución | Visible y exportable JSON (no inviolable) |
| Auditoría | Expediente con solicitud, revisión, resolución, fechas y actores | Demostrativa; faltan medidas del lado del servidor |

## Reglas operativas fuera del alcance

La aplicación se detiene tras aprobar o rechazar. No ejecuta despliegues, cambios de base de datos, migraciones, rollback reales ni gestión posterior de incidentes.

El login del desarrollador y el comité solo sirve para la exposición local: **no autentica ni autoriza de manera segura**. No hay control de acceso en servidor, concurrencia multiusuario ni repositorio central de auditoría.
