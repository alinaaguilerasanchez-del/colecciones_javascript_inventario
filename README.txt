# Sistema de Inventario Agrícola - Colecciones en JavaScript

## Objetivo
Demostrar casos de uso reales de colecciones en una aplicación web.

## Colecciones utilizadas
- **Map:** almacena productos mediante un ID como clave.
- **Set:** evita categorías duplicadas.
- **Array:** registra movimientos y también se utiliza para representar una cola.
- **Queue (FIFO):** los pedidos se agregan con `push()` y se atienden con `shift()`.

## Ejecutar
1. Abre `index.html` en un navegador.
2. Registra productos.
3. Agrega pedidos.
4. Prueba eliminar y vaciar productos.
5. Para generar un QR funcional para el celular, publica la carpeta en un servicio web y pega la URL pública en el campo del QR.

## Importante sobre el QR
Un archivo abierto directamente como `file://` no tiene una dirección pública que otro celular pueda abrir. Por eso el QR debe contener una URL pública, por ejemplo una página publicada mediante GitHub Pages o un servicio de hosting.
