# Formulario ACA

Este proyecto es un formulario base pensado para que se pueda forkar y reutilizar dentro de la empresa en distintos ámbitos y temas.  
La idea es contar con una estructura flexible que permita crear rápidamente nuevos formularios a partir de esta base.

## Tecnologías utilizadas

- React
- Vite
- TypeScript
- PapaParse (para la lectura de archivos CSV)

## Estructura del proyecto

```
src/
├── assets/
│   └── logo.png
├── components/
│   ├── BodyForm/
│   ├── Button/
│   ├── Card/
│   ├── Footer/
│   ├── FormGroup/
│   ├── HeaderForm/
│   └── Input/
├── data/
│   └── example.csv
└── pages/
    ├── Home/
    └── Form/
```

## Instalación y ejecución

Clonar el repositorio y levantar el proyecto en modo desarrollo:

```bash
git clone https://github.com/acacoop/form.git
cd formulario-aca
npm i
npm run dev
```

Abrir en el navegador:
http://localhost:5173/ (por defecto en Vite)

## Uso

- Modificar el archivo `src/data/example.csv` para probar la lectura de datos.
- Los componentes en `src/components/` están diseñados para ser reutilizados y combinados en distintos formularios.
- Crear nuevas páginas en `src/pages/` según la necesidad del formulario.

## Licencia

Todos los derechos reservados.  
Este proyecto es de uso exclusivo dentro de Asociación de Cooperativas Argentinas C.L.  
No está permitido copiar, distribuir ni modificar fuera de la organización.


## Autor / Contacto

Miguel Miguez, mmiguez@acacoop.com.ar
