# Asamblea Form (fork)

Este repositorio es un fork del formulario base original adaptado para el flujo de votación y manejo de poderes de la Asociación de Cooperativas Argentinas. Contiene lógica de autorización de acceso, carga/normalización de datos de la cooperativa, gestión dinámica de titulares y cartas de poder, y manejo de archivos adjuntos exportables.

Resumen rápido

- Framework: React + Vite + TypeScript
- Estado: fork con personalizaciones (cartas de poder, FileStatusBanner, localStorage-driven persistence)

## Estructura del proyecto

```
src/
├── assets/
│   ├── download.svg
│   ├── logo.webp
│   └── template-*.docx
├── components/
│   ├── AddItem/
│   │   ├── AddItem.tsx
   │   └── AddItem.css
│   ├── AccessToForm/
│   │   ├── AccessToForm.tsx
│   │   └── AccessToForm.css
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.css
│   ├── CartaPoder/
│   │   ├── CartaPoder.tsx
│   │   └── CartaPoder.css
│   ├── Card/
│   ├── BodyForm/
│   ├── Footer/
│   ├── FileStatusBanner/
│   ├── FormGroup/
│   ├── HeaderForm/
│   ├── Input/
│   └── NotificationToast/
├── pages/
│   ├── Home/
│   └── Form/
├── services/
│   └── services.ts
├── types/
│   └── types.ts
├── utils/
│   └── formDataExtractor.ts
├── main.tsx
└── App.tsx
```

## Instalación y ejecución

Clonar el repositorio y levantar el proyecto en modo desarrollo:

```bash
git clone https://github.com/acacoop/asamblea-form.git
cd asamblea-form
npm install
npm run dev
```

Abrir en el navegador:
http://localhost:5173/ (por defecto en Vite)

## Uso / Notas rápidas

- Modificar `src/data/example.csv` para pruebas locales si lo deseas.
- Para probar cartas de poder: carga titulares (por CSV o desde la cooperativa pre-cargada) y abre la sección "Cartas de poder" en el formulario.
- Si el banner de archivos aparece, puedes descargar PDFs / archivos base64 desde el `FileStatusBanner`.

## Dependencias y scripts

Dependencias principales (ver `package.json`): react, react-dom, react-router-dom, papaparse, jspdf, html2canvas, file-saver, docx, docxtemplater, pizzip.

Scripts útiles:

- `npm run dev` — inicia Vite en modo desarrollo
- `npm run build` — compila TypeScript y genera `dist`
- `npm run preview` — vista previa de `dist`
- `npm run lint` — ejecuta ESLint

## Comportamientos importantes del fork

- Persistencia: los datos del formulario se guardan en `localStorage` bajo la clave `formExistingData`. Dentro de ese objeto se encuentra `datos.cartasPoder` y `datos.archivos`.
- Cartas de poder: la lógica está en `src/components/CartaPoder/CartaPoder.tsx`. Reglas vigentes:
  - Un apoderado puede recibir hasta 2 delegaciones.
  - Un apoderado no puede ser poderdante en ninguna carta.
  - Un poderdante solo puede ceder su voto una vez.
  - No se permite auto-delegación.
- FileStatusBanner (`src/components/FileStatusBanner`) muestra archivos adjuntos (base64) y permite descargas individuales y en lote.
- Eventos: al persistir cambios se dispara `formExistingDataChanged` para sincronizar componentes.

## Notas para desarrolladores

- Normalización: `src/pages/Form/Form.tsx` realiza normalización de la cooperativa (codigo/nombre/votos). Si cambias la forma de los datos, actualiza esa normalización.
- Persistencia: `CartaPoder` usa `persistCartas` para actualizar `localStorage`. Considera validar y migrar datos si introduces cambios en la forma almacenada.
- UI: los botones y estilos están en `src/components/Button` y `src/components/CartaPoder/CartaPoder.css`.

## Licencia

Todos los derechos reservados.  
Este proyecto es de uso exclusivo dentro de Asociación de Cooperativas Argentinas C.L.  
No está permitido copiar, distribuir ni modificar fuera de la organización.

## Autor / Contacto

Miguel Miguez, mmiguez@acacoop.com.ar
Manuel Regiardo, mregiardo@acacoop.com.ar
