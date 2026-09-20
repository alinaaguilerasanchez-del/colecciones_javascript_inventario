// ============================================
// SISTEMA DE INVENTARIO - COLECCIONES EN JS
// ============================================

// MAP: relaciona el código de un producto con sus datos.
const inventario = new Map();

// SET: almacena categorías sin duplicarlas.
const categoriasSet = new Set();

// ARRAY: representa una lista de movimientos.
const movimientos = [];

// QUEUE: pedidos pendientes (FIFO: primero en entrar, primero en salir).
const colaPedidos = [];

let siguienteId = 1;

const form = document.getElementById("productForm");
const tabla = document.getElementById("tablaProductos");
const listaCategorias = document.getElementById("listaCategorias");
const colaVista = document.getElementById("colaPedidos");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const cantidad = Number(document.getElementById("cantidad").value);
  const precio = Number(document.getElementById("precio").value);

  const producto = {
    id: siguienteId++,
    nombre,
    categoria,
    cantidad,
    precio
  };

  inventario.set(producto.id, producto);
  categoriasSet.add(categoria);
  movimientos.push({
    tipo: "ALTA",
    producto: nombre,
    fecha: new Date().toLocaleString("es-EC")
  });

  form.reset();
  render();
});

function eliminarProducto(id) {
  const producto = inventario.get(id);
  if (!producto) return;

  inventario.delete(id);

  // Se vuelve a construir el Set a partir del Map.
  categoriasSet.clear();
  for (const item of inventario.values()) {
    categoriasSet.add(item.categoria);
  }

  movimientos.push({
    tipo: "BAJA",
    producto: producto.nombre,
    fecha: new Date().toLocaleString("es-EC")
  });

  render();
}

document.getElementById("vaciarBtn").addEventListener("click", () => {
  if (inventario.size === 0) return;
  inventario.clear();
  categoriasSet.clear();
  movimientos.push({
    tipo: "VACIADO",
    producto: "Inventario completo",
    fecha: new Date().toLocaleString("es-EC")
  });
  render();
});

document.getElementById("pedidoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("pedido");
  const pedido = input.value.trim();

  if (pedido) {
    colaPedidos.push({
      id: Date.now(),
      nombre: pedido
    });
    input.value = "";
    renderCola();
  }
});

// Dequeue: elimina y devuelve el primer elemento.
document.getElementById("atenderBtn").addEventListener("click", () => {
  if (colaPedidos.length === 0) {
    alert("No hay pedidos pendientes.");
    return;
  }

  const atendido = colaPedidos.shift();
  alert(`Pedido atendido: ${atendido.nombre}`);
  renderCola();
});

function render() {
  tabla.innerHTML = "";

  // Iteración sobre Map.
  for (const [id, producto] of inventario) {
    const valor = producto.cantidad * producto.precio;
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${escapeHTML(producto.nombre)}</td>
      <td>${escapeHTML(producto.categoria)}</td>
      <td>${producto.cantidad}</td>
      <td>$${producto.precio.toFixed(2)}</td>
      <td>$${valor.toFixed(2)}</td>
      <td><button class="delete" onclick="eliminarProducto(${id})">Eliminar</button></td>
    `;

    tabla.appendChild(fila);
  }

  const totalUnidades = [...inventario.values()]
    .reduce((total, producto) => total + producto.cantidad, 0);

  const valorTotal = [...inventario.values()]
    .reduce((total, producto) => total + producto.cantidad * producto.precio, 0);

  document.getElementById("totalProductos").textContent = inventario.size;
  document.getElementById("unidades").textContent = totalUnidades;
  document.getElementById("categorias").textContent = categoriasSet.size;
  document.getElementById("valorInventario").textContent = `$${valorTotal.toFixed(2)}`;

  listaCategorias.innerHTML = "";
  for (const categoria of categoriasSet) {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = categoria;
    listaCategorias.appendChild(span);
  }

  renderCola();
}

function renderCola() {
  colaVista.innerHTML = "";

  colaPedidos.forEach((pedido, index) => {
    const li = document.createElement("li");
    li.textContent = `${pedido.nombre}${index === 0 ? " ← siguiente" : ""}`;
    colaVista.appendChild(li);
  });
}

function escapeHTML(texto) {
  return texto.replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[caracter]));
}

// Generador de QR.
// Para que el celular pueda abrir el programa, la URL debe ser pública,
// por ejemplo una página publicada con GitHub Pages, Netlify o similar.
document.getElementById("generarQR").addEventListener("click", () => {
  const url = document.getElementById("urlQR").value.trim();
  const qr = document.getElementById("qr");
  const mensaje = document.getElementById("qrMensaje");

  qr.innerHTML = "";
  mensaje.textContent = "";

  if (!url) {
    mensaje.textContent = "Escribe primero la URL pública donde estará publicado el programa.";
    return;
  }

  try {
    new URL(url);
  } catch {
    mensaje.textContent = "La dirección no parece ser una URL válida.";
    return;
  }

  new QRCode(qr, {
    text: url,
    width: 210,
    height: 210,
    correctLevel: QRCode.CorrectLevel.H
  });

  mensaje.textContent = "Escanea este código QR con el celular para abrir el programa.";
});

render();
