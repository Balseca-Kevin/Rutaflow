# Textos para el informe de la práctica

## Justificación de la selección y el diseño de los formularios

Después de revisar distintas propuestas de formularios de solicitud de cambios, se decidió elaborar dos formularios diferenciados, uno para el pasajero y otro para el desarrollador, complementados con una sección de evaluación exclusiva para el Comité de Cambios. Esta decisión responde a que los solicitantes no poseen el mismo nivel de conocimiento del sistema de reservas de buses: el pasajero puede describir el problema, explicar su necesidad y señalar el beneficio esperado, mientras que el desarrollador puede aportar información técnica sobre módulos, componentes afectados, riesgos, esfuerzo, costos, pruebas y posibles procedimientos de implementación y reversión. Para evitar que la simplicidad del formulario público implique pérdida de información, el comité completa los apartados requeridos por la solicitud de cambio (RFC), incluidos propietario del cambio, impacto, recursos, clasificación, presupuesto y decisión documentada. De esta manera, el diseño equilibra facilidad de uso, integridad del expediente y trazabilidad, tomando como referencia los contenidos del checklist RFC de IT Process Wiki y la clasificación de cambios estándar, normal y de emergencia descrita por ITIL.

## Conclusiones

1. La práctica permitió comprender que un formulario de solicitud de cambios no consiste únicamente en describir una modificación; también debe conservar quién la solicita, cuándo se presenta, por qué es necesaria, cuál es su impacto y cómo se resolvió. Estos datos fortalecen la trazabilidad y permiten reconstruir las decisiones tomadas sobre el sistema.

2. La separación de formularios según el perfil del solicitante resultó adecuada para la plataforma de reservas de buses. El pasajero puede comunicar problemas funcionales sin manejar términos técnicos, mientras que el desarrollador presenta información detallada sobre servicios, base de datos, riesgos, recursos y alternativas de solución. El comité unifica ambos tipos de solicitudes en un reporte de evaluación.

3. Incorporar la clasificación ITIL —estándar, normal y emergencia— permitió diferenciar la naturaleza del procedimiento de autorización de la prioridad y del módulo afectado. Asimismo, exigir planes de implementación y reversión antes de aprobar favorece una gestión preventiva de riesgos, especialmente en funcionalidades críticas como pagos, disponibilidad de asientos y emisión de comprobantes.

4. La aplicación desarrollada permite demostrar el registro, la evaluación y la aprobación o rechazo de solicitudes con identificadores, fechas y justificaciones. No obstante, al emplear almacenamiento local y un login de demostración, su trazabilidad es académica y no ofrece todavía las garantías de seguridad e integridad que exige una solución empresarial.

## Recomendaciones

1. Para una futura versión productiva, incorporar una base de datos centralizada, autenticación real y permisos validados en el servidor, de modo que las solicitudes puedan consultarse de forma segura desde distintos dispositivos y que cada decisión quede asociada a una identidad verificable.

2. Mantener los formularios diferenciados por perfil y conservar la validación de información esencial antes de aprobar un cambio. En particular, exigir identificación del responsable, evaluación de impacto, riesgos, costos, recursos, calendario y planes de implementación y reversión.

3. Implementar un historial de auditoría inalterable, respaldos y políticas de conservación documental. También sería conveniente relacionar cada RFC con incidencias, tareas de desarrollo, versiones y evidencias de pruebas para mantener una trazabilidad completa.

4. Incorporar posteriormente etapas controladas de ejecución, pruebas posteriores, comunicación a los pasajeros y cierre del cambio. Estas funciones deben añadirse únicamente si se amplía el alcance académico actual, que finaliza con la decisión del comité.

5. Definir un catálogo formal de cambios estándar previamente autorizados y un procedimiento específico para emergencias, con responsables y límites claros. La prioridad de una solicitud no debe confundirse con su tipo ITIL ni servir para omitir controles de seguridad.

## Nota metodológica

Este prototipo es un ejercicio de aplicación de conceptos de gestión de cambios, no una implementación certificada de ITIL ni una herramienta de auditoría productiva. Los reportes y anexos se almacenan en el navegador y los roles son simulados. La evaluación del comité utiliza información aportada por el solicitante y campos adicionales para completar el expediente antes de registrar la resolución.

## Fuentes de consulta

- IT Process Wiki (IT Process Maps): Lista de control - Solicitud de Cambio RFC. https://wiki.es.it-processmaps.com/index.php/Lista_de_control_-_Solicitud_de_Cambio_RFC
- ServiceNow: What Is IT Change Management? https://www.servicenow.com/products/itsm/what-is-it-change-management.html
- AXELOS / ITIL 4 Change Enablement Practice, material de evaluación: https://eu-assets.contentstack.com/v3/assets/blt637b065823946b12/blta30a30c16f99245c/655b562466052b040a367c55/EN_ITIL4_Change_Enablement_Sample_Paper1_Rationales_v.1.0.pdf
