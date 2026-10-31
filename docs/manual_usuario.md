# Manual de usuario — SIGCA Centro Armonía

**Sistema Integral de Gestión de Citas y Atención Clínica**  
Versión del manual: 1.0  
Aplicación: Centro Armonía

## 1. Propósito

Este manual explica cómo navegar el portal público y cómo usar los módulos administrativos de SIGCA. Las opciones disponibles dependen del rol de la cuenta: administrador, recepción o profesional.

## 2. Iniciar la aplicación

Cuando el sistema se ejecuta con Docker, abre [http://localhost:3000](http://localhost:3000) en el navegador. La pantalla inicial es el portal público. Para conocer cómo instalar y arrancar la aplicación, consulta el [README](../README.md).

Selecciona **Iniciar sesión** en el encabezado para abrir el acceso administrativo. Escribe el correo y la contraseña asignados y confirma. Al ingresar, la aplicación muestra el panel administrativo. Para salir, usa la opción de cerrar sesión del menú de usuario.

Las cuentas de la sección 4 son datos de demostración. No uses esas contraseñas en una instalación real.

## 3. Roles y permisos

| Rol | Módulos principales | Restricciones principales |
|---|---|---|
| **Administrador** | Panel, pacientes, responsables, servicios, solicitudes, citas, calendario, materiales, pagos, caja, contenido institucional, usuarios y mensajes. | Puede administrar usuarios y configuración institucional. |
| **Recepción** | Panel, pacientes, responsables, consulta de servicios, solicitudes, citas, calendario, materiales, pagos y caja propia. | No administra usuarios ni contenido institucional. Las cajas y movimientos financieros se limitan a su usuario. |
| **Profesional** | Panel, pacientes asignados, citas propias, calendario y materiales. | Solo ve pacientes relacionados con su agenda; no puede consultar pagos ni operar caja. Puede marcar sus citas como completadas, pero no programarlas, reprogramarlas ni cancelarlas. |

El sistema también protege las operaciones en el servidor. Si una cuenta intenta abrir una opción fuera de su rol, la aplicación la redirige o rechaza la acción.

## 4. Cuentas de demostración

Los registros iniciales se cargan automáticamente cuando la base de datos está vacía. Contraseñas:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `smorales@centroarmonia.com.gt` | `Admin123!` |
| Recepción 1 | `recepcion@centroarmonia.com.gt` | `Recep123!` |
| Recepción 2 | `recepcion2@centroarmonia.com.gt` | `Recep123!` |
| Profesional EAV | `acastillo@centroarmonia.com.gt` | `Profe123!` |
| Profesional Psicología | `evalencia@centroarmonia.com.gt` | `Profe123!` |
| Profesional Lenguaje | `mramirez@centroarmonia.com.gt` | `Profe123!` |

Si ya existe información en las colecciones, el sistema no reemplaza esos datos con las cuentas de demostración.

## 5. Portal público

El portal puede consultarse sin iniciar sesión. Desde el menú se puede visitar:

- **Inicio:** presentación del centro y accesos a sus servicios.
- **Servicios:** información de los tratamientos disponibles y acceso para solicitar atención.
- **Misión y visión:** propósito y pilares institucionales.
- **Contenido educativo:** materiales informativos publicados.
- **Corporativo:** información para empresas y organizaciones.
- **Horarios y contacto:** horarios publicados, sedes e información de contacto.
- **Agendar cita:** formulario para enviar una solicitud de cita.

### Enviar una solicitud de cita

1. Abre **Agendar cita**.
2. Completa los datos solicitados, como nombre, correo, teléfono, servicio y fecha preferida.
3. Añade sede preferida y un mensaje si corresponde.
4. Envía el formulario y espera el mensaje de recepción de la solicitud.

La solicitud pública **no confirma una cita**. Recepción revisa la bandeja de solicitudes, contacta a la persona y, si corresponde, registra la cita en la agenda.

### Enviar un mensaje de contacto

1. Abre **Horarios y contacto**.
2. Completa nombre, correo, asunto y mensaje; el teléfono es opcional.
3. Envía el formulario. El mensaje aparecerá en la bandeja de administración.

## 6. Panel administrativo

El panel resume información operativa y puede mostrar citas próximas y accesos rápidos según el rol. Selecciona una opción en el menú lateral para abrir cada módulo. Los datos y acciones visibles pueden variar por permisos.

## 7. Pacientes y responsables

### Registrar un paciente

1. Abre **Pacientes** y selecciona **Registrar nuevo paciente**.
2. Completa nombres, apellidos y fecha de nacimiento; añade sexo, teléfono, dirección y observaciones si están disponibles.
3. Guarda el registro.

Para una persona menor de 18 años, registra y asocia al menos un responsable antes de programar la cita. Puedes hacerlo en **Responsables** o durante el flujo de programación de una cita.

### Consultar y actualizar un expediente

- Busca por nombre, apellido o identificador.
- Abre la ficha para consultar información y datos relacionados que permite tu rol.
- Usa editar para corregir información. Las cuentas de recepción y administración pueden modificar los datos; el profesional consulta información básica de sus pacientes asignados.
- La opción de estado permite desactivar o reactivar un paciente. La desactivación es lógica: conserva el registro y su historial.

Registra en observaciones solo información necesaria para la atención y el trabajo autorizado.

### Registrar un responsable

1. Abre **Responsables** y selecciona **Registrar responsable**.
2. Completa nombres, apellidos, parentesco y teléfono. Correo y dirección pueden añadirse como información de contacto.
3. Asocia el responsable con el paciente y guarda.

## 8. Servicios

En **Servicios** se consulta el catálogo, con descripción, duración y precio. Administración puede crear o editar servicios y cambiar su estado. Solo los servicios activos pueden usarse para nuevas citas. Recepción puede consultar el catálogo para orientar y programar.

## 9. Solicitudes de cita

Recepción y administración pueden abrir **Solicitudes** y revisar las solicitudes recibidas en el portal público. Para atender una solicitud:

1. Revisa los datos de contacto, servicio y fecha preferida.
2. Contacta al solicitante para confirmar la información y disponibilidad.
3. Convierte la solicitud en una cita indicando o asociando al paciente, profesional, fecha, hora y sede.
4. Si no procede, marca la solicitud como rechazada. Una solicitud atendida conserva la referencia a la cita generada cuando corresponde.

## 10. Programar y gestionar citas

La programación está disponible para administración y recepción en **Citas**. Los profesionales consultan las citas de su agenda y pueden completar las propias.

### Crear una cita

1. Selecciona **Programar cita**.
2. Elige un paciente existente o activa la opción para registrar uno nuevo.
3. Para un paciente nuevo, completa nombres, apellidos y fecha de nacimiento. Si es menor de edad, completa también los datos obligatorios del responsable.
4. Elige servicio, profesional, fecha, hora de inicio y sede. Añade observaciones operativas si hacen falta.
5. Revisa el aviso de disponibilidad y guarda.

El sistema calcula la hora final usando la duración del servicio y comprueba disponibilidad, horario, paciente, servicio y profesional. Las citas no pueden quedar en el pasado ni traslaparse con otra cita activa del profesional. Si hay un problema, corrige los datos que indique el mensaje.

### Cambiar el estado o reprogramar

- **Pendiente → Confirmada:** administración o recepción confirma la coordinación con el paciente.
- **Confirmada → Completada:** recepción/administración o el profesional asignado marca que la atención terminó.
- **Cancelar:** administración o recepción puede cancelar citas que aún no estén completadas. Si hay pagos asociados, primero puede ser necesario anularlos con el procedimiento financiero permitido.
- **Reprogramar:** administración o recepción cambia fecha u hora de una cita no completada ni cancelada, sujeto a disponibilidad.

Usa los filtros por estado, profesional y fecha en **Citas**. **Calendario** ofrece una vista por fechas; seleccionar una cita permite consultar sus detalles.

## 11. Materiales

En **Materiales** se consulta el material disponible y sus asignaciones. Administración puede registrar o actualizar materiales. El personal profesional puede asignar material a pacientes activos según las opciones del módulo. Verifica el paciente antes de confirmar la asignación.

## 12. Pagos y comprobantes

El módulo **Pagos** está disponible para administración y recepción.

1. Confirma que el paciente tenga una cita con saldo pendiente.
2. Selecciona **Registrar nuevo pago**.
3. Selecciona la cita, indica el monto, el método (efectivo, transferencia o tarjeta) y el concepto. Añade notas si son necesarias.
4. Confirma el registro y, si se requiere, imprime el comprobante interno.

El importe debe ser mayor que cero, no puede superar el saldo de la cita y se registra en la caja abierta del usuario. El sistema actualiza el saldo automáticamente. Los pagos no se eliminan: para corregir uno, usa **Anular**, escribe un motivo claro y conserva el comprobante para auditoría.

El comprobante que genera SIGCA es un **comprobante interno**; no sustituye una factura fiscal ni una factura electrónica SAT-FEL.

## 13. Caja diaria

Cada usuario de recepción opera su propia caja; administración puede consultar la operación general.

### Abrir caja

1. Abre **Caja diaria**.
2. Selecciona **Abrir nueva caja diaria**.
3. Indica el monto inicial en efectivo y confirma.

Solo puede existir una caja abierta por usuario. Los pagos de ese usuario se asocian a su caja abierta.

### Revisar movimientos y cerrar caja

Durante el turno revisa ingresos por método de pago, egresos registrados y efectivo esperado. Al terminar:

1. Selecciona **Cerrar caja diaria**.
2. Cuenta el efectivo físico e ingresa el monto contado.
3. Añade observaciones si existe una diferencia y confirma el cierre.

El sistema conserva movimientos y muestra efectivo esperado, efectivo contado y diferencia. Una caja cerrada no admite nuevos pagos.

## 14. Usuarios, contenido y mensajes

- **Usuarios** (administración): crea cuentas indicando nombre, correo, contraseña y rol; actualiza datos, cambia estado y restablece contraseñas. Usa cuentas personales, no compartidas.
- **Contenido institucional** (administración): actualiza textos y elementos institucionales visibles en el portal.
- **Mensajes** (administración): consulta los mensajes enviados por el formulario de contacto y puede marcarlos como leídos.

## 15. Recomendaciones de uso

- Confirma identidad y fecha de nacimiento antes de crear o modificar un expediente.
- Asocia un responsable a los pacientes menores antes de programarles una cita.
- Revisa fecha, hora, profesional y sede antes de confirmar una cita.
- Registra pagos únicamente cuando haya una caja abierta y entrega el comprobante correspondiente.
- Justifica las anulaciones de pagos y revisa el arqueo antes de cerrar caja.
- Cierra sesión al terminar, especialmente en equipos compartidos.

## 16. Ayuda

Si un módulo no aparece, confirma que la cuenta tenga el rol necesario. Si la página no carga en una instalación local, revisa primero el estado de Docker y los logs descritos en el [README](../README.md#solución-de-problemas-comunes). Para fallas operativas, facilita al soporte el módulo, la acción realizada y el mensaje mostrado; no envíes contraseñas ni tokens.
