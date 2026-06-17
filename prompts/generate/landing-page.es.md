# Prompt de Generación de Landing Pages — Español

Usa este prompt para generar páginas de prueba para el corpus de PDTD.
Reemplaza todas las `{{VARIABLES}}` antes de enviar el prompt a una herramienta de IA.

---

## Variables

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{INDUSTRY}}` | Slug de industria del corpus | `clinics` |
| `{{TIPO_NEGOCIO}}` | Tipo de negocio en lenguaje natural | `clínica de fisioterapia` |
| `{{NOMBRE_NEGOCIO}}` | Nombre ficticio o real del negocio | `FisioNova` |
| `{{CIUDAD}}` | Ciudad (solo para ejemplos específicos) | `Valencia` |
| `{{DIRECCION}}` | Dirección postal (solo para específicos) | `Calle Mayor 14, 2º` |
| `{{DETALLES_ESPECIFICOS}}` | Detalles concretos que lo hacen real | ver tabla de industrias |

### Referencia por industria

| `{{INDUSTRY}}` | `{{TIPO_NEGOCIO}}` | `{{DETALLES_ESPECIFICOS}}` genérico | `{{DETALLES_ESPECIFICOS}}` específico |
|---|---|---|---|
| `clinics` | clínica de fisioterapia | — | Nombres de fisioterapeutas, patologías tratadas, precios reales, sistema de cita |
| `beauty-wellness` | salón de belleza / spa | — | Tratamientos concretos, nombres del equipo, lista de precios, zona de cobertura |
| `ecommerce` | tienda online | — | Nombres reales de productos, SKUs, zonas de envío, política de devolución |
| `local-retail` | tienda local | — | Horario exacto, dirección, categorías de producto, aparcamiento |
| `restaurants` | restaurante / cafetería | — | Platos del menú con precio, nombre del chef, origen de la cocina, reservas |
| `fitness-gym` | gimnasio / estudio | — | Horario de clases, bio de entrenadores, tarifas de abono |
| `professional-services` | despacho legal / asesoría / consultor | — | Especialidades concretas, socios nombrados, honorarios, tipos de caso |
| `home-services` | fontanero / electricista / limpieza | — | Códigos postales de cobertura, tarifa de desplazamiento, tiempo de respuesta |
| `agencies-portfolio` | agencia de diseño / dev / marketing | — | Clientes reales, equipo nombrado, stack tecnológico, proceso de trabajo |
| `education` | academia / tutorías / curso online | — | Plan de estudios, credenciales del profesor, fechas de inicio, precios |
| `saas-startup` | producto SaaS | — | Funcionalidades concretas, planes de precio, integraciones, perfil de usuario |

---

## Prompt A — Genérico (→ `corpus/generic/`)

> Eres un desarrollador web. Crea una landing page completa y autocontenida (todo el CSS inline dentro de `<style>`) para un **{{TIPO_NEGOCIO}}** llamado **"{{NOMBRE_NEGOCIO}}"**.
>
> Incluye estas secciones:
> - Hero con titular y botón de CTA
> - 3–4 tarjetas de características o servicios
> - Sección de testimonios (2–3 citas)
> - Una sección de "¿Por qué elegirnos?" o estadísticas
> - Footer con contacto y redes sociales
>
> Usa un aspecto moderno y profesional con una paleta de colores limpia.
> No añadas dirección real, teléfono real ni nombres de personal concreto.
> Devuelve únicamente el archivo HTML completo. Sin explicaciones.

**Resultado esperado:** AI Smell alto, Business Specificity bajo. Scores: `aiSmell [70,100]`, `businessSpecificity [0,30]`.

---

## Prompt B — Específico (→ `corpus/specific/`)

> Eres un desarrollador web. Crea una landing page completa y autocontenida (todo el CSS inline dentro de `<style>`) para un **{{TIPO_NEGOCIO}}** real llamado **"{{NOMBRE_NEGOCIO}}"**, ubicado en **{{DIRECCION}}, {{CIUDAD}}**.
>
> El negocio tiene estas características concretas:
> {{DETALLES_ESPECIFICOS}}
>
> Requisitos:
> - Usa el nombre real del negocio, la dirección y el teléfono en toda la página
> - Nombra al personal real con sus credenciales
> - Lista servicios o productos concretos con precios reales en euros
> - Escribe copy que solo tenga sentido para ESTE negocio específico, no una plantilla
> - Incluye una tabla real de horarios de apertura
> - Nada de texto de relleno genérico en ningún sitio
>
> Devuelve únicamente el archivo HTML completo. Sin explicaciones.

**Resultado esperado:** AI Smell bajo, Business Specificity alto. Scores: `aiSmell [0,30]`, `businessSpecificity [70,100]`.

---

## Después de generar

1. Guarda el HTML como `index.html` en la carpeta correcta del corpus
2. Copia `corpus/_templates/meta.json`, rellénalo y guárdalo junto al HTML
3. Pon los `expectedScores` según el prompt que hayas usado (A o B)
