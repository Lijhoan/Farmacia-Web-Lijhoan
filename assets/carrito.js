// Funcionalidad del carrito de compras
class CarritoManager {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.carrito = [];
        this.init();
    }

    async init() {
        await this.cargarCarrito();
        this.actualizarContadorCarrito();
        this.setupEventListeners();
        this.actualizarVistaCarrito(); // AGREGAR ESTA LÍNEA para actualizar la vista si estamos en la página del carrito
    }

    async cargarCarrito() {
        try {
            const response = await fetch(`${this.baseURL}/carrito`);
            this.carrito = await response.json();
        } catch (error) {
            console.error('Error al cargar carrito:', error);
        }
    }

    async agregarProducto(producto) {
        try {
            const response = await fetch(`${this.baseURL}/carrito/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(producto)
            });
            
            const data = await response.json();
            this.carrito = data.carrito;
            this.actualizarContadorCarrito();
            this.mostrarNotificacion('Producto agregado al carrito');
            
        } catch (error) {
            console.error('Error al agregar producto:', error);
            this.mostrarNotificacion('Error al agregar producto', 'error');
        }
    }

    async actualizarCantidad(id, cantidad) {
        try {
            const response = await fetch(`${this.baseURL}/carrito/actualizar/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cantidad })
            });
            
            const data = await response.json();
            this.carrito = data.carrito;
            this.actualizarVistaCarrito(); // Actualizar vista
            this.actualizarContadorCarrito(); // Actualizar contador
            
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
        }
    }

    async eliminarProducto(id) {
        try {
            const response = await fetch(`${this.baseURL}/carrito/eliminar/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            this.carrito = data.carrito;
            this.actualizarVistaCarrito(); // Actualizar vista
            this.actualizarContadorCarrito(); // Actualizar contador
            this.mostrarNotificacion('Producto eliminado del carrito');
            
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    }

    async limpiarCarrito() {
        if (this.carrito.length === 0) {
            this.mostrarNotificacion('El carrito ya está vacío', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.baseURL}/carrito/limpiar`, {
                method: 'DELETE'
            });

            const data = await response.json();
            this.carrito = data.carrito;
            this.actualizarVistaCarrito(); // Actualizar vista
            this.actualizarContadorCarrito(); // Actualizar contador
            this.mostrarNotificacion('Carrito limpiado');

        } catch (error) {
            console.error('Error al limpiar carrito:', error);
        }
    }

    calcularTotal() {
        return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2);
    }

    actualizarContadorCarrito() {
        const contador = this.carrito.reduce((total, item) => total + item.cantidad, 0);
        const elementos = document.querySelectorAll('.carrito-contador');
        elementos.forEach(el => el.textContent = contador);

        // Mostrar/ocultar badge
        elementos.forEach(el => {
            if (contador > 0) {
                el.style.display = 'inline';
            } else {
                el.style.display = 'none';
            }
        });
    }

    actualizarVistaCarrito() {
        const carritoItems = document.getElementById('carrito-items');
        const carritoTotal = document.getElementById('carrito-total');

        if (!carritoItems) return; // Si no estamos en la página del carrito, salir

        if (this.carrito.length === 0) {
          carritoItems.innerHTML =
            '<div class="text-center py-4"><i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i><p class="text-muted">El carrito está vacío</p><a href="index.html" class="btn btn-primary">Continuar Comprando</a></div>';
          if (carritoTotal) carritoTotal.textContent = "$0.00";
          return;
        }

        carritoItems.innerHTML = this.carrito
          .map(
            (item) => `
            <div class="carrito-item d-flex align-items-center mb-3 p-3 border rounded">
                <img src="${item.imagen}" alt="${
              item.nombre
            }" class="me-3" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.nombre}</h6>
                    <small class="text-muted">${item.categoria}</small>
                    <div class="d-flex align-items-center mt-2">
                        <button class="btn btn-sm btn-outline-secondary me-2" onclick="carritoManager.actualizarCantidad('${
                          item.id
                        }', ${item.cantidad - 1})" ${
              item.cantidad <= 1 ? "disabled" : ""
            }>-</button>
                        <span class="mx-2 fw-bold">${item.cantidad}</span>
                        <button class="btn btn-sm btn-outline-secondary ms-2" onclick="carritoManager.actualizarCantidad('${
                          item.id
                        }', ${item.cantidad + 1})">+</button>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-primary fs-5">$${(
                      item.precio * item.cantidad
                    ).toFixed(2)}</div>
                    <button class="btn btn-sm btn-outline-danger mt-1" onclick="carritoManager.eliminarProducto('${
                      item.id
                    }')" title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
          )
          .join("");

        if (carritoTotal) {
            carritoTotal.textContent = `$${this.calcularTotal()}`;
        }
    }

    setupEventListeners() {
        // Agregar event listeners a botones de agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-agregar-carrito')) {
                e.preventDefault();
                const card = e.target.closest('.card');
                const producto = this.extraerDatosProducto(card, e.target);
                this.agregarProducto(producto);
            }
        });
    }

    extraerDatosProducto(card, button) {
      const titulo = card.querySelector(".card-title").textContent;

      // Mejorar la búsqueda de precio
      let precioElement = card.querySelector(
        ".fw-bold.text-primary, .product-price, .fw-bold.text-danger"
      );
      let precioText = "";

      if (precioElement) {
        precioText = precioElement.textContent;
      } else {
        // Si no encuentra precio específico, buscar cualquier elemento con precio
        const todoTexto = card.textContent;
        const matches = todoTexto.match(/\$\d+\.?\d*/g);
        if (matches && matches.length > 0) {
          // Tomar el último precio encontrado (generalmente el precio final)
          precioText = matches[matches.length - 1];
        }
      }

      const precio =
        parseFloat(precioText.replace("$", "").replace(",", "").trim()) || 10.0; // Precio por defecto si no se encuentra
      const imagen = card.querySelector(".card-img-top").src;

      return {
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nombre: titulo,
        precio: precio,
        imagen: imagen,
        categoria: this.obtenerCategoriaActual(),
      };
    }

    obtenerCategoriaActual() {
        const path = window.location.pathname;
        if (path.includes('medicamentos')) return 'Medicamentos';
        if (path.includes('cuidado-personal')) return 'Cuidado Personal';
        if (path.includes('cuidado-piel')) return 'Cuidado de la Piel';
        if (path.includes('vitaminas')) return 'Vitaminas';
        return 'General';
    }

    mostrarNotificacion(mensaje, tipo = 'success') {
        const alertClass = tipo === 'error' ? 'alert-danger' : 'alert-success';
        const notificacion = document.createElement('div');
        notificacion.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        notificacion.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notificacion.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.remove();
            }
        }, 3000);
    }
}

// Inicializar el carrito manager cuando la página cargue
let carritoManager;
document.addEventListener('DOMContentLoaded', () => {
    carritoManager = new CarritoManager();
});