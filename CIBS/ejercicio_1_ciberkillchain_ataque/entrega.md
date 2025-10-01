# Alumno: Williams Limonchi

# Sistema víctima ( Muy breve descripción del trabajo práctico con link si hay)

- La aplicación permite monitorear y controlar dispositivos remotos, registrar mediciones de sensores (temperatura, presión), gestionar apuntes de valores UP/DOWN, y visualizar información técnica de cada módulo a través de una interfaz web responsiva con navegación por cuadrantes geográficos.

# Objetivo del ataque
- 1: Sabotear los dispositivos conectados a través de la inyección de comandos falsos, para provocar fallas en el sistema y se presente la necesidad de cambiar los componentes. Con esta manipulación el atacante busca favorecer intereses económicos vendiendo componentes que forman parte del sistema a mayor precio.
  
# Resolución

## Reconnaissance
- [[T1592] Gather Victim Host Information ](https://attack.mitre.org/techniques/T1592/) Obtener informacion sobre el sistema y ver repositorios sobre el dispositivo, si es hardware abierto para ver puertos disponibles. Así como analizar el sistema operativo, firmware de módulos, versión del broker MQTT, base de datos y herramientas de visualización.
- [T1590 – Gather Victim Network Information](https://attack.mitre.org/techniques/T1590/) Identificación de arquitectura de red local, configuraciones de firewall, direcciones IP internas y puertos de servicios clave.
- [T1589 – Gather Victim Identity Information](https://attack.mitre.org/techniques/T1589/) Recolección de credenciales válidas, certificados TLS, y claves API vinculadas a módulos IoT y servicios backend.
- [T1083 – File and Directory Discovery](https://attack.mitre.org/techniques/T1083/) Inspección de archivos de configuración locales, logs de transmisión, certificados y claves almacenadas en los módulos o en el servidor.

## Weaponization
- [T1587.001 – Develop Capabilities: Malware](https://attack.mitre.org/techniques/T1587/001/) El atacante crea un cliente MQTT diseñado para hacerse pasar por un módulo auténtico y enviar información alterada usando las credenciales y certificados ya disponibles.
- [CWE-345 – Insufficient Verification of Data Authenticity](https://cwe.mitre.org/data/definitions/345.html) Se aprovecha de la ausencia de comprobaciones de procedencia o integridad en el backend que permite insertar datos falsos presentados como legítimos.
- [CWE-306 – Missing Authentication for Critical Function](https://cwe.mitre.org/data/definitions/306.html) Se explota la capacidad de publicar en tópicos sensibles sin controles extra sobre el dispositivo o su rol, limitándose únicamente a la protección TLS.
- [T1584.001 – Compromise Infrastructure: Device Installation](https://attack.mitre.org/techniques/T1584/001/) El atacante sustituye o altera módulos físicos por equipos controlados que emiten de forma encubierta datos falsos.

## Delivery
- [T1565.002 – Data Manipulation: Network Traffic Manipulation](https://attack.mitre.org/techniques/T1565/002/) Inyección de datos falsificados en el flujo habitual de comunicación mediante publicaciones no verificadas en tópicos autorizados del sistema.
- [T1200 – Hardware Additions](https://attack.mitre.org/techniques/T1200/) Sustitución de un sensor legítimo por uno manipulado que simula ser original, pero opera bajo control del atacante.
- [CWE-345 – Insufficient Verification of Data Authenticity](https://cwe.mitre.org/data/definitions/345.html) El sistema acepta como válidos los datos enviados por el nuevo módulo, ya que no se aplica verificación adicional más allá de la autenticación TLS.

## Exploitation

- [CWE-345 – Insufficient Verification of Data Authenticity](https://cwe.mitre.org/data/definitions/345.html) El sistema no aplica verificación de integridad ni autenticidad sobre los datos recibidos, lo que permite que el módulo falsificado emita información arbitraria sin ser detectado.
- [CWE-306 – Missing Authentication for Critical Function](https://cwe.mitre.org/data/definitions/306.html) El backend acepta publicaciones en tópicos críticos sin controles adicionales más allá de la conexión TLS, confiando ciegamente en el canal.
- [T1203 – Exploitation for Client Execution](https://attack.mitre.org/techniques/T1203/) Aunque no se explota un fallo tradicional, el módulo manipulado ejecuta su función maliciosa de forma persistente, entregando datos falsificados que impactan en la lógica del sistema.

## Installation

- [T1546.008 – Event Triggered Execution: Accessibility Features](https://attack.mitre.org/techniques/T1546/008/) Se modifica el firmware del módulo para incluir funciones maliciosas persistentes que manipulan los datos reportados.
- [T1070.006 – Indicator Removal on Host: Timestomp](https://attack.mitre.org/techniques/T1070/006/) Se oculta el rastro de la instalación modificando fechas de compilación o checksums del firmware, para evitar que se detecten cambios en auditorías técnicas.
- [T1543.003 – Create or Modify System Process: Windows Service (análogo)](https://attack.mitre.org/techniques/T1543/003/) Se configura el módulo para que el script malicioso inicie automáticamente al encender el dispositivo, asegurando persistencia sin intervención.

## Command & Control

- [T1071.001 – Application Layer Protocol: Web Protocols](https://attack.mitre.org/techniques/T1071/001/) Se utiliza MQTT o HTTP para encapsular comandos C2 dentro de tráfico de aplicación aparentemente legítimo.
- [T1572 – Protocol Tunneling](https://attack.mitre.org/techniques/T1572/) Los comandos de control se inyectan dentro de estructuras de datos válidas, lo que permite evadir reglas de inspección de paquetes y mantener el canal abierto sin ser detectado.
- [T1008 – Fallback Channels](https://attack.mitre.org/techniques/T1008/) Se configura un canal alternativo —por ejemplo, HTTP POST hacia un servidor externo controlado por el atacante— en caso de bloqueo del canal primario por cambios defensivos.

## Actions on Objetives

- [T1565.002 – Data Manipulation: Network Traffic Manipulation](https://attack.mitre.org/techniques/T1565/002/) Modificación de los datos transmitidos a través de la red, alterando lo reportado por el módulo falsificado sin generar fallos sintácticos.
- [T1499 – Endpoint Denial of Service](https://attack.mitre.org/techniques/T1499/) Inyección de tráfico masivo o datos inestables para degradar el funcionamiento del broker o la visualización si se busca sabotaje.
- [T1584.005 – Compromise Infrastructure: Botnet](https://attack.mitre.org/techniques/T1584/005/) Uso del módulo falsificado como punto de anclaje para actividades paralelas, como túneles de red, almacenamiento encubierto o pivoting hacia otros sistemas.
