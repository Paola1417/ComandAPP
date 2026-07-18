// ============================================
// DATOS DE PRODUCTOS
// ============================================
const productos = {
    hamburguesas: [
        {
            id: 'h1',
            nombre: 'Hamburguesa Clásica',
            descripcion: 'Carne de res, lechuga, tomate, queso y especialidad.',
            precio: 18000,
            imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
        },
        {
            id: 'h2',
            nombre: 'Hamburguesa BBQ',
            descripcion: 'Carne de res, tocino, cebolla crispy, queso y BBQ.',
            precio: 20000,
            imagen: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400'
        },
        {
            id: 'h3',
            nombre: 'Hamburguesa Pollo',
            descripcion: 'Pechuga de pollo, lechuga, tomate y mayonesa.',
            precio: 17000,
            imagen: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400'
        }
    ],
    combos: [
        {
            id: 'c1',
            nombre: 'Combo Clásico',
            descripcion: 'Hamburguesa + Papas + Gaseosa',
            precio: 16000,
            imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400'
        },
        {
            id: 'c2',
            nombre: 'Combo Doble',
            descripcion: 'Doble carne + Papas + Gaseosa',
            precio: 34000,
            imagen: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'
        },
        {
            id: 'c3',
            nombre: 'Combo Familiar',
            descripcion: '2 hamburguesas + 2 Papas + 2 Gaseosas',
            precio: 60000,
            imagen: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400'
        }
    ],
    bebidas: [
        {
            id: 'b1',
            nombre: 'Gaseosa',
            descripcion: 'Gaseosa fría 350ml',
            precio: 5000,
            imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400'
        },
        {
            id: 'b2',
            nombre: 'Limonada Natural',
            descripcion: 'Limonada natural con hielo',
            precio: 6000,
            imagen: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400'
        },
        {
            id: 'b3',
            nombre: 'Agua Mineral',
            descripcion: 'Agua mineral sin gas 500ml',
            precio: 4000,
            imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'
        }
    ],
    postres: [
        {
            id: 'p1',
            nombre: 'Papas Francesas',
            descripcion: 'Papas fritas crocantes con sal',
            precio: 7000,
            imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'
        }
    ]
};

const iconosCategoria = {
    hamburguesas: '🍔',
    combos: '🍟',
    bebidas: '🥤',
    postres: '🍰'
};

const titulosCategoria = {
    hamburguesas: 'Hamburguesas',
    combos: 'Combos',
    bebidas: 'Bebidas',
    postres: 'Postres'
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
let pedido = [];
let categoriaActual = 'hamburguesas';
let contadorPedido = 124;
let historialPedidos = [];
let statsVentas = {
    totalVentas: 0,
    totalPedidos: 0,
    totalProductos: 0,
    productosVendidos: {}
};

// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================
function cambiarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => {
        s.style.display = 'none';
    });

    const seccionActiva = document.getElementById('seccion-' + seccion);
    if (seccionActiva) {
        seccionActiva.style.display = 'block';
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('activo');
    });
    const linkActivo = document.querySelector('.nav-link[data-seccion="' + seccion + '"]');
    if (linkActivo) {
        linkActivo.classList.add('activo');
    }

    if (seccion === 'menu') {
        renderizarMenuCompleto();
    } else if (seccion === 'pedidos') {
        renderizarHistorialPedidos();
    } else if (seccion === 'reportes') {
        actualizarReportes();
    }
}

// ============================================
// FUNCIONES DE RENDERIZADO - INICIO
// ============================================
function renderizarProductos(categoria) {
    const grid = document.getElementById('grid-productos');
    const titulo = document.getElementById('titulo-categoria');
    titulo.textContent = titulosCategoria[categoria];

    const items = productos[categoria] || [];
    grid.innerHTML = items.map(prod => `
        <div class="card-producto">
            <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy">
            <div class="card-producto-info">
                <h4>${prod.nombre}</h4>
                <p>${prod.descripcion}</p>
                <div class="precio">$${prod.precio.toLocaleString('es-CO')}</div>
                <button class="btn-agregar" data-id="${prod.id}" data-categoria="${categoria}">Agregar</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-agregar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const cat = this.getAttribute('data-categoria');
            agregarProducto(id, cat);
        });
    });
}

function filtrarCategoria(categoria, btn) {
    categoriaActual = categoria;
    document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    renderizarProductos(categoria);
}

// ============================================
// FUNCIONES DE RENDERIZADO - MENÚ
// ============================================
function renderizarMenuCompleto() {
    const contenedor = document.getElementById('menu-completo');
    let html = '';

    Object.keys(productos).forEach(categoria => {
        html += `
            <div class="menu-categoria">
                <h3>${iconosCategoria[categoria]} ${titulosCategoria[categoria]}</h3>
                <div class="grid-productos">
                    ${productos[categoria].map(prod => `
                        <div class="card-producto">
                            <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy">
                            <div class="card-producto-info">
                                <h4>${prod.nombre}</h4>
                                <p>${prod.descripcion}</p>
                                <div class="precio">$${prod.precio.toLocaleString('es-CO')}</div>
                                <button class="btn-agregar-menu" data-id="${prod.id}" data-categoria="${categoria}">Agregar al pedido</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;

    document.querySelectorAll('.btn-agregar-menu').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const cat = this.getAttribute('data-categoria');
            agregarProducto(id, cat);
            this.textContent = '✓ Agregado';
            this.style.background = 'var(--exito)';
            setTimeout(() => {
                this.textContent = 'Agregar al pedido';
                this.style.background = '';
            }, 1000);
        });
    });
}

// ============================================
// FUNCIONES DE RENDERIZADO - PEDIDOS
// ============================================
function renderizarHistorialPedidos() {
    const contenedor = document.getElementById('lista-pedidos-historial');

    if (historialPedidos.length === 0) {
        contenedor.innerHTML = `
            <div class="pedidos-vacio">
                <div class="icono-grande">📭</div>
                <h3>No hay pedidos registrados</h3>
                <p>Los pedidos confirmados aparecerán aquí</p>
            </div>
        `;
        return;
    }

    let html = '';
    [...historialPedidos].reverse().forEach(pedidoHist => {
        html += `
            <div class="pedido-historial-card">
                <div class="pedido-historial-header">
                    <h4>${pedidoHist.numero}</h4>
                    <span class="estado">✓ Confirmado</span>
                </div>
                <div class="pedido-historial-items">
                    ${pedidoHist.items.map(item => `
                        <div class="pedido-historial-item">
                            <span class="nombre">${item.nombre} x${item.cantidad}</span>
                            <span class="detalle">$${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="pedido-historial-total">
                    Total: $${pedidoHist.total.toLocaleString('es-CO')}
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

// ============================================
// FUNCIONES DE RENDERIZADO - REPORTES
// ============================================
function actualizarReportes() {
    document.getElementById('reporte-ventas').textContent = '$' + statsVentas.totalVentas.toLocaleString('es-CO');
    document.getElementById('reporte-pedidos').textContent = statsVentas.totalPedidos;
    document.getElementById('reporte-productos').textContent = statsVentas.totalProductos;

    const promedio = statsVentas.totalPedidos > 0 
        ? Math.round(statsVentas.totalVentas / statsVentas.totalPedidos) 
        : 0;
    document.getElementById('reporte-promedio').textContent = '$' + promedio.toLocaleString('es-CO');

    const contenedor = document.getElementById('reporte-top-productos');
    const productosOrdenados = Object.entries(statsVentas.productosVendidos)
        .sort((a, b) => b[1].cantidad - a[1].cantidad)
        .slice(0, 5);

    if (productosOrdenados.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--gris); text-align: center; padding: 20px;">Aún no hay datos de ventas</p>';
        return;
    }

    const maxVentas = productosOrdenados[0][1].cantidad;
    let html = '';
    productosOrdenados.forEach((item, index) => {
        const porcentaje = (item[1].cantidad / maxVentas) * 100;
        html += `
            <div class="top-producto">
                <div class="top-rank">${index + 1}</div>
                <div class="top-info">
                    <h5>${item[1].nombre}</h5>
                    <p>${item[1].cantidad} unidades vendidas</p>
                    <div class="top-barra">
                        <div class="top-barra-fill" style="width: ${porcentaje}%"></div>
                    </div>
                </div>
                <div class="top-ventas">$${(item[1].cantidad * item[1].precio).toLocaleString('es-CO')}</div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

// ============================================
// FUNCIONES DEL PEDIDO
// ============================================
function agregarProducto(id, categoria) {
    const producto = productos[categoria].find(p => p.id === id);
    if (!producto) return;

    const existente = pedido.find(item => item.id === id);
    if (existente) {
        existente.cantidad++;
    } else {
        pedido.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }
    actualizarPedido();
}

function eliminarProducto(id) {
    pedido = pedido.filter(item => item.id !== id);
    actualizarPedido();
}

function cambiarCantidad(id, delta) {
    const item = pedido.find(i => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        eliminarProducto(id);
        return;
    }
    actualizarPedido();
}

function actualizarPedido() {
    const lista = document.getElementById('pedido-lista');
    const totalDiv = document.getElementById('pedido-total');
    const totalValor = document.getElementById('total-valor');

    if (pedido.length === 0) {
        lista.innerHTML = `
            <div class="pedido-vacio">
                <div class="icono-carrito">🛒</div>
                <p>No hay productos en el pedido.</p>
            </div>
        `;
        totalDiv.style.display = 'none';
        return;
    }

    let total = 0;
    let html = '';
    pedido.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `
            <div class="pedido-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="pedido-item-info">
                    <h5>${item.nombre}</h5>
                    <div class="precio-item">$${subtotal.toLocaleString('es-CO')}</div>
                </div>
                <div class="pedido-item-controles">
                    <button class="btn-cantidad" data-id="${item.id}" data-delta="-1">−</button>
                    <span class="cantidad-num">${item.cantidad}</span>
                    <button class="btn-cantidad" data-id="${item.id}" data-delta="1">+</button>
                </div>
                <button class="btn-eliminar" data-id="${item.id}">🗑</button>
            </div>
        `;
    });

    lista.innerHTML = html;
    totalDiv.style.display = 'block';
    totalValor.textContent = '$' + total.toLocaleString('es-CO');

    document.querySelectorAll('.btn-cantidad').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const delta = parseInt(this.getAttribute('data-delta'));
            cambiarCantidad(id, delta);
        });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            eliminarProducto(id);
        });
    });
}

function confirmarPedido() {
    if (pedido.length === 0) {
        document.getElementById('modal-error').classList.add('activo');
        return;
    }

    contadorPedido++;
    const numeroPedido = '#PED-' + String(contadorPedido).padStart(6, '0');
    
    const total = pedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    historialPedidos.push({
        numero: numeroPedido,
        items: [...pedido],
        total: total,
        fecha: new Date().toLocaleString('es-CO')
    });

    statsVentas.totalVentas += total;
    statsVentas.totalPedidos++;
    pedido.forEach(item => {
        statsVentas.totalProductos += item.cantidad;
        if (!statsVentas.productosVendidos[item.id]) {
            statsVentas.productosVendidos[item.id] = {
                nombre: item.nombre,
                precio: item.precio,
                cantidad: 0
            };
        }
        statsVentas.productosVendidos[item.id].cantidad += item.cantidad;
    });

    document.getElementById('pedido-numero-texto').textContent = 'Número de pedido: ' + numeroPedido;
    document.getElementById('modal-exito').classList.add('activo');

    pedido = [];
    actualizarPedido();
}

function cerrarModal(id) {
    document.getElementById(id).classList.remove('activo');
}

// ============================================
// INICIALIZACIÓN DE EVENTOS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    renderizarProductos('hamburguesas');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const seccion = this.getAttribute('data-seccion');
            cambiarSeccion(seccion);
        });
    });

    document.querySelectorAll('.categoria-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            filtrarCategoria(categoria, this);
        });
    });

    document.getElementById('btn-confirmar').addEventListener('click', confirmarPedido);

    document.getElementById('btn-cerrar-error').addEventListener('click', function() {
        cerrarModal('modal-error');
    });

    document.getElementById('btn-cerrar-exito').addEventListener('click', function() {
        cerrarModal('modal-exito');
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('activo');
            }
        });
    });

    document.getElementById('btn-cerrar-sesion').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('¿Está seguro que desea cerrar sesión?')) {
            alert('Sesión cerrada correctamente');
            location.reload();
        }
    });
});