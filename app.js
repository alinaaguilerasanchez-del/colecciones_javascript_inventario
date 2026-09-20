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

// Historial de pedidos que ya fueron atendidos.
const pedidosAtendidos = [];

const productosIniciales = [
  { nombre: "Hamburguesa", categoria: "Comida", cantidad: 10, precio: 3.50 },
  { nombre: "Pizza", categoria: "Comida", cantidad: 10, precio: 5.00 },
  { nombre: "Hot Dog", categoria: "Comida", cantidad: 10, precio: 2.50 },
  { nombre: "Papas Fritas", categoria: "Comida", cantidad: 10, precio: 1.50 },
  { nombre: "Gaseosa", categoria: "Bebidas", cantidad: 10, precio: 1.00 },
  { nombre: "Ensalada", categoria: "Comida", cantidad: 10, precio: 3.00 },
  { nombre: "Jugo Natural", categoria: "Bebidas", cantidad: 10, precio: 2.00 },
  { nombre: "Nuggets", categoria: "Comida", cantidad: 10, precio: 3.25 }
];

let siguienteId = 1;

const form = document.getElementById("productForm");
const tabla = document.getElementById("tablaProductos");
const listaCategorias = document.getElementById("listaCategorias");
const colaVista = document.getElementById("colaPedidos");
const colaEstado = document.getElementById("colaEstado");
const historialVista = document.getElementById("historialPedidos");
const historialEstado = document.getElementById("historialEstado");
const nombreSelect = document.getElementById("nombre");
const categoriaInput = document.getElementById("categoria");
const precioInput = document.getElementById("precio");
const pedidoSelect = document.getElementById("pedido");

for (const producto of productosIniciales) {
  const opcion = document.createElement("option");
  opcion.value = producto.nombre;
  opcion.textContent = producto.nombre;
  nombreSelect.appendChild(opcion);

  const opcionPedido = document.createElement("option");
  opcionPedido.value = producto.nombre;
  opcionPedido.textContent = producto.nombre;
  pedidoSelect.appendChild(opcionPedido);
}

nombreSelect.addEventListener("change", () => {
  const producto = productosIniciales.find((item) => item.nombre === nombreSelect.value);
  categoriaInput.value = producto ? producto.categoria : "";
  precioInput.value = producto ? producto.precio.toFixed(2) : "";
});

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
  pedidosAtendidos.unshift({
    ...atendido,
    hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })
  });
  alert(`Pedido atendido: ${atendido.nombre}`);
  renderCola();
  renderHistorial();
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
  renderHistorial();
}

function renderCola() {
  colaVista.innerHTML = "";

  if (colaPedidos.length === 0) {
    colaEstado.textContent = "No hay pedidos pendientes. La fila está vacía.";
    return;
  }

  colaEstado.textContent = `${colaPedidos.length} pedido${colaPedidos.length === 1 ? "" : "s"} esperando atención.`;

  colaPedidos.forEach((pedido, index) => {
    const li = document.createElement("li");
    li.textContent = index === 0
      ? `Siguiente: ${pedido.nombre}`
      : `Esperando: ${pedido.nombre}`;
    colaVista.appendChild(li);
  });
}

function renderHistorial() {
  historialVista.innerHTML = "";

  if (pedidosAtendidos.length === 0) {
    historialEstado.textContent = "Todavía no se ha atendido ningún pedido.";
    return;
  }

  historialEstado.textContent = `${pedidosAtendidos.length} pedido${pedidosAtendidos.length === 1 ? " atendido" : " atendidos"}.`;

  pedidosAtendidos.forEach((pedido) => {
    const item = document.createElement("li");
    item.textContent = `${pedido.nombre} - atendido a las ${pedido.hora}`;
    historialVista.appendChild(item);
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

// Generador de QR de un solo uso. La URL queda guardada en este navegador
// para que el mismo código siga disponible después de recargar la página.
const urlQR = document.getElementById("urlQR");
const generarQR = document.getElementById("generarQR");
const qr = document.getElementById("qr");
const mensajeQR = document.getElementById("qrMensaje");
const controlesQR = document.querySelector(".qr-controls");
const ocultarQR = document.getElementById("ocultarQR");
const claveQR = "inventario-url-qr";
const claveQROculto = "inventario-qr-oculto";

function mostrarQR(url) {
  qr.innerHTML = "";
  new QRCode(qr, {
    text: url,
    width: 210,
    height: 210,
    correctLevel: QRCode.CorrectLevel.H
  });

  controlesQR.hidden = true;
  controlesQR.style.display = "none";
  ocultarQR.hidden = false;
  mensajeQR.textContent = "QR listo. Puedes escanearlo varias veces para abrir el programa.";
}

generarQR.addEventListener("click", () => {
  const url = urlQR.value.trim();

  if (!url) {
    mensajeQR.textContent = "Escribe primero la URL pública donde estará publicado el programa.";
    return;
  }

  try {
    new URL(url);
  } catch {
    mensajeQR.textContent = "La dirección no parece ser una URL válida.";
    return;
  }

  localStorage.setItem(claveQR, url);
  localStorage.removeItem(claveQROculto);
  mostrarQR(url);
});

ocultarQR.addEventListener("click", () => {
  localStorage.setItem(claveQROculto, "true");
  qr.innerHTML = "";
  mensajeQR.textContent = "QR oculto después del escaneo.";
  ocultarQR.hidden = true;
});

const urlGuardada = localStorage.getItem(claveQR);
if (urlGuardada && localStorage.getItem(claveQROculto) !== "true") {
  mostrarQR(urlGuardada);
} else if (localStorage.getItem(claveQROculto) === "true") {
  controlesQR.hidden = true;
  controlesQR.style.display = "none";
  mensajeQR.textContent = "El QR ya fue ocultado después del escaneo.";
}

render();
