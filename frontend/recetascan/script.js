const transcribedTextarea = document.getElementById('transcribed-text');
const validateButton = document.getElementById('validate');
const normalizeButton = document.getElementById('normalize');
const resultsSection = document.getElementById('results');
const medicationResultsDiv = document.getElementById('medication-results');
const correctionSection = document.getElementById('correction-section');
const manualCorrectionTextarea = document.getElementById('manual-correction');
const validateCorrectedButton = document.getElementById('validate-corrected');
const cancelCorrectionButton = document.getElementById('cancel-correction');
const correctionButtons = document.getElementById('correction-buttons');
const scanButton = document.getElementById('scan-button');
const recipeImage = document.getElementById('recipe-image');

// Extraer medicamentos del texto
function extractMeds(text) {
  return text.split(/\n|,|\./).map(s => s.trim()).filter(Boolean);
}

// OCR con Tesseract
scanButton.addEventListener('click', async () => {
  const file = recipeImage.files[0];
  
  if (!file) {
    alert('Por favor selecciona una imagen primero.');
    return;
  }
  
  scanButton.textContent = '⏳ Procesando...';
  scanButton.disabled = true;
  
  try {
    const { data: { text } } = await Tesseract.recognize(file, 'spa', {
      logger: m => console.log(m)
    });
    
    transcribedTextarea.value = text;
    
    // Mostrar notificación de éxito
    alert('¡Texto extraído con éxito! Ahora puede normalizar o validar el contenido.');
  } catch (error) {
    console.error('Error OCR:', error);
    alert('Error al procesar la imagen. Intente con otra imagen o ingrese el texto manualmente.');
  } finally {
    scanButton.textContent = '✨ Escanear con OCR';
    scanButton.disabled = false;
  }
});

// Validar con base de datos directamente
validateButton.addEventListener('click', async () => {
  const text = transcribedTextarea.value.trim();
  if (!text) { 
    alert('No hay texto para validar.'); 
    return; 
  }
  
  resultsSection.style.display = 'block';
  medicationResultsDiv.innerHTML = '<p>Validando...</p>';
  
  try {
    const meds = extractMeds(text);
    const res = await fetch('http://localhost:3000/validar-stock', {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({medicamentos: meds})
    });
    
    if (!res.ok) throw new Error('Error en validar-stock');
    
    const data = await res.json();
    medicationResultsDiv.innerHTML = '';
    
    data.forEach(med => {
      const el = document.createElement('div');
      el.className = `card p-2 ${med.disponible ? 'disponible' : 'no-disponible'}`;
      el.innerHTML = `<strong>${med.nombre}</strong> ${med.disponible ? '✔️ Disponible' : '❌ Sin stock'}`;
      medicationResultsDiv.appendChild(el);
    });
  } catch(e) { 
    console.error(e); 
    medicationResultsDiv.innerHTML = '<p class="text-danger">Error validando el stock.</p>'; 
  }
});

// Normalizar con IA
normalizeButton.addEventListener('click', async () => {
  const text = transcribedTextarea.value.trim();
  if (!text) { 
    alert('No hay texto para normalizar.'); 
    return; 
  }
  
  resultsSection.style.display = 'block';
  medicationResultsDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin me-2"></i> Consultando IA, por favor espere...</div>';
  normalizeButton.disabled = true;
  normalizeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
  
  try {
    console.log("Enviando texto a normalizar:", text);
    
    const res = await fetch('http://localhost:3000/normalizar-receta', {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({texto: text})
    });
    
    // Manejo detallado de errores HTTP
    if (!res.ok) {
      const statusText = res.statusText || 'Error desconocido';
      console.error(`Error HTTP ${res.status}: ${statusText}`);
      
      let errorMessage = `Error en el servidor (${res.status})`;
      let errorDetail = '';
      
      try {
        const errorData = await res.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
          if (res.status === 401) {
            errorDetail = 'La clave de API parece ser inválida o ha expirado. Contacte al administrador.';
          } else if (res.status === 500) {
            errorDetail = 'Puede intentar de nuevo o proceder con la edición manual.';
          }
        }
      } catch (jsonError) {
        // Si no podemos parsear el JSON, usamos el mensaje genérico
        errorDetail = 'No se pudo obtener detalles adicionales del error.';
      }
      
      medicationResultsDiv.innerHTML = `
        <div class="alert alert-danger">
          <h5>❌ Error con la IA o la validación</h5>
          <p>${errorMessage}</p>
          ${errorDetail ? `<p><small>${errorDetail}</small></p>` : ''}
          <div class="mt-3">
            <button class="btn btn-sm btn-outline-primary me-2" onclick="document.getElementById('normalize').click()">
              <i class="fas fa-redo"></i> Intentar de nuevo
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="document.getElementById('correction-section').style.display='block';document.getElementById('correction-buttons').style.display='flex';">
              <i class="fas fa-edit"></i> Editar manualmente
            </button>
          </div>
        </div>
      `;
      
      normalizeButton.disabled = false;
      normalizeButton.innerHTML = 'Normalizar con IA';
      return;
    }
    
    const data = await res.json();
    console.log("Respuesta del servidor:", data);
    
    if (data.error) {
      medicationResultsDiv.innerHTML = `
        <div class="alert alert-warning">
          <h5>⚠️ Problema con la IA</h5>
          <p>${data.error}</p>
          <button class="btn btn-sm btn-outline-warning" onclick="document.getElementById('correction-section').style.display='block';document.getElementById('correction-buttons').style.display='flex';">
            Editar manualmente
          </button>
        </div>
      `;
      return;
    }
    
    // Asegurarse de que tenemos datos normalizados
    if (!data.normalizado || !Array.isArray(data.normalizado) || data.normalizado.length === 0) {
      medicationResultsDiv.innerHTML = `
        <div class="alert alert-warning">
          <h5>⚠️ No se detectaron medicamentos</h5>
          <p>La IA no pudo identificar medicamentos en el texto proporcionado.</p>
          <button class="btn btn-sm btn-outline-warning" onclick="document.getElementById('correction-section').style.display='block';document.getElementById('correction-buttons').style.display='flex';">
            Ingresar manualmente
          </button>
        </div>
      `;
      return;
    }
    
    const normalizedText = data.normalizado.join('\n');
    
    // Mostrar el texto normalizado en el área de corrección manual
    manualCorrectionTextarea.value = normalizedText;
    correctionSection.style.display = 'block';
    correctionButtons.style.display = 'flex';
    
    // También mostrar como sugerencia
    const normBox = document.createElement('div');
    normBox.className = 'card p-2 sugerencia';
    normBox.innerHTML = `<em>Sugerencia IA:</em> ${normalizedText}`;
    medicationResultsDiv.innerHTML = '';
    medicationResultsDiv.appendChild(normBox);
    
    // Mostrar los resultados de validación si existen
    if (data.resultados && Array.isArray(data.resultados)) {
      data.resultados.forEach(med => {
        const el = document.createElement('div');
        el.className = `card p-2 ${med.disponible ? 'disponible' : 'no-disponible'}`;
        el.innerHTML = `<strong>${med.nombre}</strong> ${med.disponible ? '✔️ Disponible' : '❌ Sin stock'}`;
        medicationResultsDiv.appendChild(el);
      });
    }
    
    // Restaurar estado del botón
    normalizeButton.disabled = false;
    normalizeButton.innerHTML = 'Normalizar con IA';
  } catch(e) { 
    console.error("Error en la normalización:", e); 
    medicationResultsDiv.innerHTML = `
      <div class="alert alert-danger">
        <h5>❌ Error de conexión</h5>
        <p>No se pudo conectar con el servidor de IA. Detalles: ${e.message}</p>
        <div class="mt-3">
          <button class="btn btn-sm btn-outline-primary me-2" onclick="document.getElementById('normalize').click()">
            <i class="fas fa-redo"></i> Intentar de nuevo
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="document.getElementById('correction-section').style.display='block';document.getElementById('correction-buttons').style.display='flex';">
            <i class="fas fa-edit"></i> Editar manualmente
          </button>
        </div>
      </div>
    `;
    
    // Restaurar estado del botón
    normalizeButton.disabled = false;
    normalizeButton.innerHTML = 'Normalizar con IA';
  }
});

// Validar texto corregido manualmente
validateCorrectedButton.addEventListener('click', async () => {
  const correctedText = manualCorrectionTextarea.value.trim();
  
  if (!correctedText) {
    alert('El texto corregido está vacío.');
    return;
  }
  
  resultsSection.style.display = 'block';
  medicationResultsDiv.innerHTML = '<p>Validando texto corregido...</p>';
  
  try {
    const meds = extractMeds(correctedText);
    const response = await fetch('http://localhost:3000/validar-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicamentos: meds })
    });
    
    if (!response.ok) throw new Error('Error validando stock');
    
    const data = await response.json();
    medicationResultsDiv.innerHTML = '';
    
    // Mostrar que estamos usando el texto corregido
    const correctedNote = document.createElement('div');
    correctedNote.className = 'alert alert-info';
    correctedNote.innerHTML = '<strong>✏️ Usando texto corregido manualmente</strong>';
    medicationResultsDiv.appendChild(correctedNote);
    
    // Mostrar resultados
    data.forEach(med => {
      const el = document.createElement('div');
      el.className = `card p-2 ${med.disponible ? 'disponible' : 'no-disponible'}`;
      el.innerHTML = `<strong>${med.nombre}</strong> ${med.disponible ? '✔️ Disponible' : '❌ Sin stock'}`;
      medicationResultsDiv.appendChild(el);
    });
  } catch(e) {
    console.error(e);
    medicationResultsDiv.innerHTML = '<p class="text-danger">Error validando el stock con el texto corregido.</p>';
  }
});

// Cancelar corrección
cancelCorrectionButton.addEventListener('click', () => {
  correctionSection.style.display = 'none';
  correctionButtons.style.display = 'none';
});
