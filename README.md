# AURA by Esmeralda Zepeda - Boutique & Tienda Online

Sistema móvil integral para gestión de inventario textil, control de costos y márgenes de ganancia, pedidos en tiempo real con notificaciones sonoras y emisión automática de facturas electrónicas (CFDI 4.0), sincronizado con **Google Cloud Firestore**.

---

## ✨ Características Principales

1. **Gestión de Inventario & Costos**:
   - Desglose de costos: tela/confección, mano de obra, empaque de lujo, envíos y otros gastos.
   - Cálculo automático del precio de venta al público (PVP) según el margen de ganancia (%) deseado.
   - Existencias por tallas (XS, S, M, L, XL, Unitalla) y colores.

2. **Punto de Venta Móvil (POS) & Pedidos**:
   - Registro de ventas rápido y adaptado a dispositivos móviles.
   - Calculador de cambio en efectivo, tarjeta o transferencia SPEI.
   - Vista "Tienda Cliente" para que las clientas elijan prendas y envíen pedidos directo al teléfono de Esmeralda.

3. **Notificación Inmediata de Pedidos**:
   - Campanilla boutique sintetizada con Web Audio API y vibración en el teléfono.
   - Alerta visual flotante al recibir nuevos pedidos vía Firestore.

4. **Facturación Electrónica Automática (CFDI 4.0)**:
   - Emisión inmediata con Folio Fiscal (UUID), sellos digitales, QR verificador oficial y cálculo de IVA 16%.
   - Descarga en PDF/impresión térmica, exportación XML y envío directo por WhatsApp.

5. **Sincronización en la Nube con Firebase**:
   - Base de datos en tiempo real (Cloud Firestore) para sincronizar múltiples teléfonos o computadoras.

---

## 🚀 Cómo Subir este Proyecto a GitHub

Abre tu terminal en la carpeta de este proyecto y corre los siguientes comandos:

```bash
# 1. Inicializar git si aún no está inicializado
git init

# 2. Agregar todos los archivos
git add .

# 3. Guardar el primer commit
git commit -m "Inicializar mi tienda boutique online - Esmeralda Zepeda"

# 4. Cambiar a la rama principal
git branch -M main

# 5. Conectar tu repositorio remoto de GitHub (sustituye con tu usuario y repo de GitHub)
git remote add origin https://github.com/TU-USUARIO/tienda-esmeralda-zepeda.git

# 6. Subir el proyecto
git push -u origin main
```

---

## 🌐 Publicar tu Tienda Online en Internet Gratis

Una vez subido a GitHub:
1. Conecta tu repositorio con **[Vercel](https://vercel.com)** o **[Netlify](https://netlify.com)**.
2. La plataforma detectará automáticamente la configuración Vite y desplegará tu tienda en segundos con HTTPS y enlace público.
