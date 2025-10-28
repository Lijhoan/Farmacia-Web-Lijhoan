document.addEventListener('DOMContentLoaded', function() {
    // Primero, asegurarnos de que los botones de agregar al carrito tengan la clase correcta
    const botones = document.querySelectorAll('.btn-farmacia');
    botones.forEach(boton => {
        if (boton.textContent.includes('Añadir') || boton.textContent.includes('carrito')) {
            boton.classList.add('btn-agregar-carrito');
        }
    });
    
    // Función para inicializar los filtros
    function inicializarFiltros() {
        // Detectar la página actual para aplicar configuraciones específicas
        const pathname = window.location.pathname;
        const esVitaminas = pathname.includes('vitaminas.html');
        const esCuidadoPiel = pathname.includes('cuidado-piel.html');
        
        // Elementos del DOM - con manejo específico para cada página
        let categoriasCheckboxes = document.querySelectorAll('.filtro-categoria');
        let precioRange = document.querySelector('#precioMax');
        let precioValor = document.querySelector('#precioMaxValor');
        let btnAplicarFiltros = document.querySelector('#btnAplicarFiltros');
        const gridProductos = document.querySelector('#gridProductos');
        
        // Configuración específica para la página de vitaminas
        if (esVitaminas) {
            // Si no hay checkboxes con la clase filtro-categoria, los agregamos
            if (categoriasCheckboxes.length === 0) {
                const checkboxes = document.querySelectorAll('#tipo1, #tipo2, #tipo3, #tipo4, #tipo5');
                checkboxes.forEach((checkbox, index) => {
                    checkbox.classList.add('filtro-categoria');
                    
                    // Asignar valores según el ID
                    switch(checkbox.id) {
                        case 'tipo1':
                            checkbox.setAttribute('value', 'multivitaminicos');
                            break;
                        case 'tipo2':
                            checkbox.setAttribute('value', 'vitamina-c');
                            break;
                        case 'tipo3':
                            checkbox.setAttribute('value', 'vitamina-d');
                            break;
                        case 'tipo4':
                            checkbox.setAttribute('value', 'omega-3');
                            break;
                        case 'tipo5':
                            checkbox.setAttribute('value', 'probioticos');
                            break;
                    }
                });
                
                // Actualizar la referencia a los checkboxes
                categoriasCheckboxes = document.querySelectorAll('.filtro-categoria');
            }
            
            // Configurar el rango de precio
            if (!precioRange) {
                precioRange = document.querySelector('#customRange1');
                if (precioRange) {
                    precioRange.setAttribute('id', 'precioMax');
                    
                    // Agregar elemento para mostrar el valor
                    const valorDisplay = document.createElement('small');
                    valorDisplay.className = 'text-muted';
                    valorDisplay.innerHTML = 'Hasta: <span id="precioMaxValor">$0.00</span>';
                    
                    // Insertamos después del rango
                    const rangeContainer = precioRange.parentNode;
                    rangeContainer.appendChild(valorDisplay);
                    
                    // Actualizar referencia
                    precioValor = document.querySelector('#precioMaxValor');
                }
            }
            
            // Configurar el botón de aplicar filtros
            if (!btnAplicarFiltros) {
                const botones = document.querySelectorAll('.btn-farmacia');
                botones.forEach(boton => {
                    if (boton.textContent.includes('Aplicar Filtros')) {
                        boton.setAttribute('id', 'btnAplicarFiltros');
                        btnAplicarFiltros = boton;
                    }
                });
            }
        }
        
        // Configuración específica para la página de cuidado de la piel
        if (esCuidadoPiel) {
            // Si no hay checkboxes con la clase filtro-categoria, los agregamos
            if (categoriasCheckboxes.length === 0) {
                const checkboxes = document.querySelectorAll('#categoria1, #categoria2, #categoria3, #categoria4, #categoria5');
                checkboxes.forEach((checkbox, index) => {
                    checkbox.classList.add('filtro-categoria');
                    
                    // Asignar valores según el ID
                    switch(checkbox.id) {
                        case 'categoria1':
                            checkbox.setAttribute('value', 'crema-hidratante');
                            break;
                        case 'categoria2':
                            checkbox.setAttribute('value', 'protector-solar');
                            break;
                        case 'categoria3':
                            checkbox.setAttribute('value', 'serum-facial');
                            break;
                        case 'categoria4':
                            checkbox.setAttribute('value', 'limpiadores');
                            break;
                        case 'categoria5':
                            checkbox.setAttribute('value', 'mascarillas');
                            break;
                    }
                });
                
                // Actualizar la referencia a los checkboxes
                categoriasCheckboxes = document.querySelectorAll('.filtro-categoria');
            }
            
            // Configurar el rango de precio
            if (!precioRange) {
                precioRange = document.querySelector('#priceRange');
                if (precioRange) {
                    precioRange.setAttribute('id', 'precioMax');
                    
                    // Reemplazar los elementos existentes con nuestro elemento de valor
                    const rangeContainer = precioRange.parentNode;
                    const existingValues = rangeContainer.querySelector('.d-flex.justify-content-between');
                    if (existingValues) {
                        existingValues.remove();
                    }
                    
                    // Agregar elemento para mostrar el valor
                    const valorDisplay = document.createElement('small');
                    valorDisplay.className = 'text-muted';
                    valorDisplay.innerHTML = 'Hasta: <span id="precioMaxValor">$0.00</span>';
                    
                    // Insertamos después del rango
                    rangeContainer.appendChild(valorDisplay);
                    
                    // Actualizar referencia
                    precioValor = document.querySelector('#precioMaxValor');
                }
            }
            
            // Configurar el botón de aplicar filtros
            if (!btnAplicarFiltros) {
                const botones = document.querySelectorAll('.btn-farmacia');
                botones.forEach(boton => {
                    if (boton.textContent.includes('Aplicar Filtros')) {
                        boton.setAttribute('id', 'btnAplicarFiltros');
                        btnAplicarFiltros = boton;
                    }
                });
            }
        }
        
        // Configurar el botón de aplicar filtros (para todos los casos)
        if (btnAplicarFiltros) {
            btnAplicarFiltros.addEventListener('click', aplicarFiltros);
        } else {
            // Si todavía no encontramos el botón, buscamos por texto
            const botones = document.querySelectorAll('.btn-farmacia');
            botones.forEach(boton => {
                if (boton.textContent.includes('Aplicar Filtros')) {
                    boton.addEventListener('click', aplicarFiltros);
                }
            });
        }
        
        // Configurar el rango de precio (para todos los casos)
        if (precioRange) {
            // Configurar el rango de precio si no tiene min, max y step
            if (!precioRange.hasAttribute('min')) {
                precioRange.setAttribute('min', '0');
            }
            if (!precioRange.hasAttribute('max')) {
                precioRange.setAttribute('max', '100');
            }
            if (!precioRange.hasAttribute('step')) {
                precioRange.setAttribute('step', '0.5');
            }
            
            // Actualizar el valor del precio cuando se mueve el slider
            precioRange.addEventListener('input', function() {
                if (precioValor) {
                    precioValor.textContent = `$${parseFloat(this.value).toFixed(2)}`;
                }
            });
        }
        
        // Función principal para aplicar los filtros
        function aplicarFiltros() {
            // Obtener categorías seleccionadas
            const categoriasSeleccionadas = [];
            categoriasCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    categoriasSeleccionadas.push(checkbox.value);
                }
            });
            
            // Obtener precio máximo
            const precioMaximo = precioRange ? parseFloat(precioRange.value) : Infinity;
            
            // Filtrar productos
            const productos = gridProductos ? 
                gridProductos.querySelectorAll('.product, .col-md-6.col-lg-4.mb-4') : 
                document.querySelectorAll('.product, .col-md-6.col-lg-4.mb-4');
            
            let productosVisibles = 0;
            
            productos.forEach(producto => {
                // Agregar clase product si no la tiene
                if (!producto.classList.contains('product')) {
                    producto.classList.add('product');
                }
                
                // Obtener categoría del producto
                let categoriaProducto = producto.getAttribute('data-category');
                
                // Si no tiene categoría, la determinamos automáticamente según la página
                if (!categoriaProducto) {
                    const titulo = producto.querySelector('.card-title')?.textContent.toLowerCase() || '';
                    
                    if (esVitaminas) {
                        if (titulo.includes('multivitamínico')) {
                            categoriaProducto = 'multivitaminicos';
                        } else if (titulo.includes('vitamina c')) {
                            categoriaProducto = 'vitamina-c';
                        } else if (titulo.includes('vitamina d')) {
                            categoriaProducto = 'vitamina-d';
                        } else if (titulo.includes('omega-3')) {
                            categoriaProducto = 'omega-3';
                        } else if (titulo.includes('probiótico')) {
                            categoriaProducto = 'probioticos';
                        } else {
                            categoriaProducto = 'general';
                        }
                    } else if (esCuidadoPiel) {
                        if (titulo.includes('crema') && !titulo.includes('contorno')) {
                            categoriaProducto = 'crema-hidratante';
                        } else if (titulo.includes('protector solar')) {
                            categoriaProducto = 'protector-solar';
                        } else if (titulo.includes('serum')) {
                            categoriaProducto = 'serum-facial';
                        } else if (titulo.includes('limpiador')) {
                            categoriaProducto = 'limpiadores';
                        } else if (titulo.includes('mascarilla')) {
                            categoriaProducto = 'mascarillas';
                        } else if (titulo.includes('contorno')) {
                            categoriaProducto = 'contorno-ojos';
                        } else {
                            categoriaProducto = 'general';
                        }
                    } else {
                        // Para otras páginas
                        if (titulo.includes('multivitamínicos') || titulo.includes('vitamina')) {
                            categoriaProducto = 'multivitaminicos';
                        } else if (titulo.includes('paracetamol') || titulo.includes('ibuprofeno') || titulo.includes('aspirina')) {
                            categoriaProducto = 'analgesicos';
                        } else if (titulo.includes('amoxicilina') || titulo.includes('antibiótico')) {
                            categoriaProducto = 'antibioticos';
                        } else if (titulo.includes('antigripal') || titulo.includes('gripe') || titulo.includes('resfriado')) {
                            categoriaProducto = 'antigripales';
                        } else if (titulo.includes('shampoo') || titulo.includes('jabón') || titulo.includes('desodorante')) {
                            categoriaProducto = 'higiene-corporal';
                        } else if (titulo.includes('cepillo') || titulo.includes('pasta dental') || titulo.includes('enjuague')) {
                            categoriaProducto = 'higiene-bucal';
                        } else {
                            categoriaProducto = 'general';
                        }
                    }
                    
                    producto.setAttribute('data-category', categoriaProducto);
                }
                
                // Obtener precio del producto
                let precioProducto = 0;
                if (producto.hasAttribute('data-price')) {
                    precioProducto = parseFloat(producto.getAttribute('data-price'));
                } else {
                    // Intentamos obtener el precio del texto
                    const precioElemento = producto.querySelector('.fw-bold.text-primary, .product-price');
                    if (precioElemento) {
                        const precioTexto = precioElemento.textContent.replace('$', '').replace(',', '').trim();
                        precioProducto = parseFloat(precioTexto) || 0;
                        // Guardamos el precio para futuras consultas
                        producto.setAttribute('data-price', precioProducto);
                    }
                }
                
                // Verificar si el producto cumple con los filtros
                const cumpleCategoria = categoriasSeleccionadas.length === 0 || 
                                      categoriasSeleccionadas.includes(categoriaProducto);
                const cumplePrecio = precioProducto <= precioMaximo;
                
                // Mostrar u ocultar el producto según los filtros
                if (cumpleCategoria && cumplePrecio) {
                    producto.style.display = '';
                    productosVisibles++;
                } else {
                    producto.style.display = 'none';
                }
            });
            
            // Actualizar contador de productos visibles
            actualizarContadorProductos(productosVisibles, productos.length);
        }
        
        // Función para actualizar el contador de productos visibles
        function actualizarContadorProductos(visibles, total) {
            // Buscar el elemento que muestra el contador
            const contadorElemento = document.querySelector('.d-flex.justify-content-between.align-items-center.mb-4 p');
            if (contadorElemento) {
                contadorElemento.textContent = `Mostrando ${visibles} de ${total} productos`;
            }
        }
        
        // Verificar si necesitamos agregar atributos data-category y data-price a los productos
        function verificarAtributosProductos() {
            const productos = gridProductos ? 
                gridProductos.querySelectorAll('.col-md-6.col-lg-4.mb-4') : 
                document.querySelectorAll('.col-md-6.col-lg-4.mb-4');
            
            productos.forEach(producto => {
                // Agregar clase product si no la tiene
                if (!producto.classList.contains('product')) {
                    producto.classList.add('product');
                }
                
                // Si no tiene el atributo data-category, lo agregamos con un valor predeterminado
                if (!producto.hasAttribute('data-category')) {
                    // Determinamos una categoría basada en el título del producto
                    const titulo = producto.querySelector('.card-title')?.textContent.toLowerCase() || '';
                    
                    let categoria = 'general';
                    if (esVitaminas) {
                        if (titulo.includes('multivitamínico')) {
                            categoria = 'multivitaminicos';
                        } else if (titulo.includes('vitamina c')) {
                            categoria = 'vitamina-c';
                        } else if (titulo.includes('vitamina d')) {
                            categoria = 'vitamina-d';
                        } else if (titulo.includes('omega-3')) {
                            categoria = 'omega-3';
                        } else if (titulo.includes('probiótico')) {
                            categoria = 'probioticos';
                        }
                    } else if (esCuidadoPiel) {
                        if (titulo.includes('crema') && !titulo.includes('contorno')) {
                            categoria = 'crema-hidratante';
                        } else if (titulo.includes('protector solar')) {
                            categoria = 'protector-solar';
                        } else if (titulo.includes('serum')) {
                            categoria = 'serum-facial';
                        } else if (titulo.includes('limpiador')) {
                            categoria = 'limpiadores';
                        } else if (titulo.includes('mascarilla')) {
                            categoria = 'mascarillas';
                        } else if (titulo.includes('contorno')) {
                            categoria = 'contorno-ojos';
                        }
                    } else {
                        // Para otras páginas
                        if (titulo.includes('multivitamínicos') || titulo.includes('vitamina')) {
                            categoria = 'multivitaminicos';
                        } else if (titulo.includes('paracetamol') || titulo.includes('ibuprofeno') || titulo.includes('aspirina')) {
                            categoria = 'analgesicos';
                        } else if (titulo.includes('amoxicilina') || titulo.includes('antibiótico')) {
                            categoria = 'antibioticos';
                        } else if (titulo.includes('antigripal') || titulo.includes('gripe') || titulo.includes('resfriado')) {
                            categoria = 'antigripales';
                        } else if (titulo.includes('shampoo') || titulo.includes('jabón') || titulo.includes('desodorante')) {
                            categoria = 'higiene-corporal';
                        } else if (titulo.includes('cepillo') || titulo.includes('pasta dental') || titulo.includes('enjuague')) {
                            categoria = 'higiene-bucal';
                        }
                    }
                    
                    producto.setAttribute('data-category', categoria);
                }
                
                // Si no tiene el atributo data-price, lo agregamos con un valor predeterminado
                if (!producto.hasAttribute('data-price')) {
                    // Intentamos obtener el precio del texto
                    const precioElemento = producto.querySelector('.fw-bold.text-primary, .product-price');
                    let precio = 0;
                    
                    if (precioElemento) {
                        const precioTexto = precioElemento.textContent.replace('$', '').replace(',', '').trim();
                        precio = parseFloat(precioTexto) || 0;
                    }
                    
                    producto.setAttribute('data-price', precio);
                }
            });
        }
        
        // Llamar a la función para verificar atributos al cargar la página
        verificarAtributosProductos();
        
        // Aplicar filtros automáticamente si hay parámetros en la URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('categoria') || urlParams.has('precio')) {
            // Establecer los valores de los filtros según los parámetros de la URL
            if (urlParams.has('categoria') && categoriasCheckboxes.length > 0) {
                const categoriaParam = urlParams.get('categoria');
                categoriasCheckboxes.forEach(checkbox => {
                    checkbox.checked = checkbox.value === categoriaParam;
                });
            }
            
            if (urlParams.has('precio') && precioRange) {
                precioRange.value = urlParams.get('precio');
                if (precioValor) {
                    precioValor.textContent = `$${parseFloat(precioRange.value).toFixed(2)}`;
                }
            }
            
            // Aplicar los filtros
            aplicarFiltros();
        }
    }
    
    // Llamar a la función de inicialización
    inicializarFiltros();
});