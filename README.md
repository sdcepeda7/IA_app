# 🏛️ Arquitecto DB AI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![Tailwind](https://img.shields.io/badge/Style-TailwindCSS-cyan)

> **Diseña, visualiza y audita bases de datos a la velocidad del pensamiento.**

Arquitecto DB AI es una herramienta web inteligente que transforma descripciones en lenguaje natural en diagramas Entidad-Relación (ER) completos, genera scripts SQL listos para producción y ofrece auditoría de esquemas con auto-corrección potenciada por Inteligencia Artificial.

---

## ✨ Características Principales

* **🤖 Texto a Diagrama:** Describe tu base de datos (ej. *"Un sistema de ventas con clientes, productos y facturas"*) y obtén un diagrama visual instantáneo.
* **📐 Renderizado Mermaid.js:** Visualización clara y moderna de entidades y relaciones.
* **💾 Exportación SQL:** Convierte tu diagrama visual en código `CREATE TABLE` para PostgreSQL con un solo clic.
* **🛡️ Auditoría Inteligente:** Detecta errores de normalización, claves faltantes o malas prácticas en tu diseño.
* **✨ Auto-Reparación (Magic Fix):** Aplica las correcciones sugeridas por la IA automáticamente sobre el diagrama.
* **🎨 UI Moderna:** Interfaz intuitiva con Modo Oscuro/Claro, controles de Zoom/Pan y diseño responsivo.
* **📥 Exportación de Imagen:** Descarga tu diagrama en formato PNG de alta calidad.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto fue construido utilizando un stack moderno y eficiente:

* **Frontend:** [React](https://react.dev/) 
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Iconos:** [Lucide React](https://lucide.dev/)
* **Visualización:** [Mermaid.js](https://mermaid.js.org/)
* **Inteligencia Artificial:** [Google Gemini API](https://ai.google.dev/) (Modelos Flash & Pro)

---

## 🚀 Instalación y Uso Local

Sigue estos pasos para correr el proyecto en tu máquina:

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/sdcepeda7/IA_app.git](https://github.com/sdcepeda7/IA_app.git)
    cd IA_app
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la raíz del proyecto y agrega tu API Key de Google Gemini:
    ```env
    VITE_GOOGLE_API_KEY=tu_api_key_aqui
    ```

4.  **Ejecutar el servidor de desarrollo**
    ```bash
    npm run dev
    ```

5.  Abre tu navegador en `http://localhost:5173` (o el puerto que indique la consola).

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar este proyecto:

1.  Haz un Fork del repositorio.
2.  Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`).
3.  Haz Commit de tus cambios (`git commit -m 'Agregado nueva característica'`).
4.  Haz Push a la rama (`git push origin feature/NuevaCaracteristica`).
5.  Abre un Pull Request.

---

## ☕ Apoya el Proyecto

Si este proyecto te ha sido útil, considera invitarme un café o hacer una donación para seguir mejorando las funcionalidades.

[![PayPal](https://img.shields.io/badge/PayPal-Donate-blue?style=for-the-badge&logo=paypal)](https://paypal.me/sdcepeda7)

---

## 👨‍💻 Autor

**Santiago Danilo Cepeda Galeano**
*Desarrollador Full Stack & Ingeniero Electrónico*

* [![GitHub](https://img.shields.io/badge/GitHub-sdcepeda7-black?style=flat&logo=github)](https://github.com/sdcepeda7)
* [![LinkedIn](https://img.shields.io/badge/LinkedIn-Perfil-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/santiago-danilo-cepeda-galeano-15511a293/)
* [![Instagram](https://img.shields.io/badge/Instagram-sdcepeda7-pink?style=flat&logo=instagram)](https://www.instagram.com/sdcepeda7/)

---
*Created with ❤️ using CodeSandbox & Gemini AI*
