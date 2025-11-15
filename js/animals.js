// Variables globales
let allAnimals = [];
let allSpecies = [];
let allBreeds = [];
let allHealthStatuses = [];
let editingAnimalId = null;

// Cargar especies
async function loadSpecies() {
    try {
        const species = await supabase.select('especies', { order: 'nombre' });
        allSpecies = species || [];
        
        // Llenar select de especies
        const speciesSelect = document.getElementById('animal-especie');
        const filterSpeciesSelect = document.getElementById('filter-species');
        
        speciesSelect.innerHTML = '<option value="">Seleccionar</option>';
        filterSpeciesSelect.innerHTML = '<option value="">Todas las especies</option>';
        
        allSpecies.forEach(specie => {
            const option1 = document.createElement('option');
            option1.value = specie.id;
            option1.textContent = specie.nombre;
            speciesSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = specie.nombre;
            option2.textContent = specie.nombre;
            filterSpeciesSelect.appendChild(option2);
        });
        
        // Cargar razas
        await loadBreeds();
        
        // Cargar estados de salud
        await loadHealthStatuses();
        
    } catch (error) {
        console.error('Error loading species:', error);
    }
}

// Cargar razas
async function loadBreeds() {
    try {
        const breeds = await supabase.select('razas', { order: 'nombre' });
        allBreeds = breeds || [];
    } catch (error) {
        console.error('Error loading breeds:', error);
    }
}

// Cargar estados de salud
async function loadHealthStatuses() {
    try {
        const statuses = await supabase.select('estados_salud', { order: 'nombre' });
        allHealthStatuses = statuses || [];
        
        const healthSelect = document.getElementById('animal-salud');
        healthSelect.innerHTML = '<option value="">Seleccionar</option>';
        
        allHealthStatuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.id;
            option.textContent = status.nombre;
            healthSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading health statuses:', error);
    }
}

// Cambio de especie - actualizar razas
document.getElementById('animal-especie').addEventListener('change', async (e) => {
    const specieId = e.target.value;
    const breedSelect = document.getElementById('animal-raza');
    
    breedSelect.innerHTML = '<option value="">Seleccionar</option>';
    
    if (specieId) {
        const filteredBreeds = allBreeds.filter(breed => breed.especie_id == specieId);
        
        filteredBreeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed.id;
            option.textContent = breed.nombre;
            breedSelect.appendChild(option);
        });
        
        if (filteredBreeds.length === 0) {
            breedSelect.innerHTML = '<option value="">No hay razas disponibles</option>';
        }
    } else {
        breedSelect.innerHTML = '<option value="">Seleccionar especie primero</option>';
    }
});

// Cargar animales
async function loadAnimals() {
    try {
        const animals = await supabase.select('animales', { order: 'fecha_ingreso.desc' });
        allAnimals = animals || [];
        displayAnimals(allAnimals);
    } catch (error) {
        console.error('Error loading animals:', error);
        showAppMessage('Error al cargar animales: ' + error.message, 'error');
    }
}

// Mostrar animales
function displayAnimals(animals) {
    const grid = document.getElementById('animals-grid');
    
    if (!animals || animals.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-state-icon">🐾</div>
                <h3>No hay animales registrados</h3>
                <p>Comienza agregando un nuevo animal al refugio</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = animals.map(animal => {
        const specieName = getSpecieName(animal.especie_id);
        const breedName = getBreedName(animal.raza_id);
        const healthName = getHealthStatusName(animal.estado_salud_id);
        
        const statusClass = animal.estado.toLowerCase().replace(' ', '-');
        
        const canEdit = currentUser.rol !== ROLES.GUEST;
        const canDelete = currentUser.rol === ROLES.ADMIN;
        const canAdopt = animal.estado === ANIMAL_STATUS.DISPONIBLE;
        
        return `
            <div class="animal-card">
                <h3>${animal.nombre}</h3>
                <div class="animal-info">
                    <p><strong>🦁 Especie:</strong> ${specieName}</p>
                    <p><strong>🐕 Raza:</strong> ${breedName}</p>
                    <p><strong>🎂 Edad:</strong> ${animal.edad || 'No especificada'}</p>
                    <p><strong>⚧ Género:</strong> ${animal.genero || 'No especificado'}</p>
                    <p><strong>🎨 Color:</strong> ${animal.color || 'No especificado'}</p>
                    <p><strong>📊 Estado:</strong> <span class="status-badge status-${statusClass}">${animal.estado}</span></p>
                    <p><strong>💚 Salud:</strong> ${healthName}</p>
                    <p><strong>💉 Vacunado:</strong> ${animal.vacunado || 'No especificado'}</p>
                    ${animal.descripcion ? `<p style="margin-top: 12px; color: #4b5563;">${animal.descripcion}</p>` : ''}
                </div>
                <div class="animal-actions">
                    ${canEdit ? `<button class="btn-edit" onclick="editAnimal(${animal.id})">✏️ Editar</button>` : ''}
                    ${canAdopt ? `<button class="btn-adopt" onclick="adoptAnimal(${animal.id}, '${animal.nombre}')">❤️ Adoptar</button>` : ''}
                    ${canDelete ? `<button class="btn-delete" onclick="deleteAnimal(${animal.id}, '${animal.nombre}')">🗑️ Eliminar</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Obtener nombre de especie
function getSpecieName(specieId) {
    const specie = allSpecies.find(s => s.id == specieId);
    return specie ? specie.nombre : 'Desconocida';
}

// Obtener nombre de raza
function getBreedName(breedId) {
    const breed = allBreeds.find(b => b.id == breedId);
    return breed ? breed.nombre : 'Desconocida';
}

// Obtener nombre de estado de salud
function getHealthStatusName(healthId) {
    const health = allHealthStatuses.find(h => h.id == healthId);
    return health ? health.nombre : 'No especificado';
}

// Filtros
document.getElementById('search-animal').addEventListener('input', filterAnimals);
document.getElementById('filter-species').addEventListener('change', filterAnimals);
document.getElementById('filter-status').addEventListener('change', filterAnimals);

function filterAnimals() {
    const searchTerm = document.getElementById('search-animal').value.toLowerCase();
    const speciesFilter = document.getElementById('filter-species').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    let filtered = allAnimals;
    
    if (searchTerm) {
        filtered = filtered.filter(animal => 
            animal.nombre.toLowerCase().includes(searchTerm) ||
            (animal.descripcion && animal.descripcion.toLowerCase().includes(searchTerm))
        );
    }
    
    if (speciesFilter) {
        filtered = filtered.filter(animal => 
            getSpecieName(animal.especie_id) === speciesFilter
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(animal => animal.estado === statusFilter);
    }
    
    displayAnimals(filtered);
}

// Formulario de animal
document.getElementById('animal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (currentUser.rol === ROLES.GUEST) {
        showAppMessage('No tienes permisos para esta acción', 'error');
        return;
    }
    
    const animalData = {
        nombre: document.getElementById('animal-nombre').value.trim(),
        especie_id: document.getElementById('animal-especie').value,
        raza_id: document.getElementById('animal-raza').value,
        edad: document.getElementById('animal-edad').value.trim(),
        genero: document.getElementById('animal-genero').value,
        color: document.getElementById('animal-color').value.trim(),
        estado: document.getElementById('animal-estado').value,
        estado_salud_id: document.getElementById('animal-salud').value,
        descripcion: document.getElementById('animal-descripcion').value.trim(),
        vacunado: document.getElementById('animal-vacunado').value,
        usuario_creador_id: currentUser.id
    };
    
    if (!animalData.nombre || !animalData.especie_id || !animalData.raza_id || !animalData.edad || !animalData.estado_salud_id) {
        showAppMessage('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    
    try {
        if (editingAnimalId) {
            // Actualizar
            animalData.fecha_actualizacion = new Date().toISOString();
            await supabase.update('animales', editingAnimalId, animalData);
            await logActivity('Actualizar animal', `Actualizó el animal: ${animalData.nombre}`);
            showAppMessage('Animal actualizado exitosamente', 'success');
        } else {
            // Crear
            animalData.fecha_ingreso = new Date().toISOString();
            await supabase.insert('animales', animalData);
            await logActivity('Crear animal', `Creó el animal: ${animalData.nombre}`);
            showAppMessage('Animal registrado exitosamente', 'success');
        }
        
        await loadAnimals();
        showView('dashboard');
        resetAnimalForm();
        
    } catch (error) {
        console.error('Error saving animal:', error);
        showAppMessage('Error al guardar animal: ' + error.message, 'error');
    }
});

// Editar animal
async function editAnimal(id) {
    try {
        const animals = await supabase.select('animales', { eq: { id: id } });
        
        if (animals && animals.length > 0) {
            const animal = animals[0];
            editingAnimalId = id;
            
            document.getElementById('form-title').textContent = 'Editar Animal';
            document.getElementById('animal-id').value = id;
            document.getElementById('animal-nombre').value = animal.nombre;
            document.getElementById('animal-especie').value = animal.especie_id;
            
            // Trigger change para cargar razas
            document.getElementById('animal-especie').dispatchEvent(new Event('change'));
            
            setTimeout(() => {
                document.getElementById('animal-raza').value = animal.raza_id;
            }, 100);
            
            document.getElementById('animal-edad').value = animal.edad;
            document.getElementById('animal-genero').value = animal.genero || 'Macho';
            document.getElementById('animal-color').value = animal.color || '';
            document.getElementById('animal-estado').value = animal.estado;
            document.getElementById('animal-salud').value = animal.estado_salud_id;
            document.getElementById('animal-descripcion').value = animal.descripcion || '';
            document.getElementById('animal-vacunado').value = animal.vacunado || 'No';
            
            showView('create');
        }
    } catch (error) {
        console.error('Error loading animal:', error);
        showAppMessage('Error al cargar animal: ' + error.message, 'error');
    }
}

// Eliminar animal
async function deleteAnimal(id, nombre) {
    if (currentUser.rol !== ROLES.ADMIN) {
        showAppMessage('Solo los administradores pueden eliminar animales', 'error');
        return;
    }
    
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}? Esta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        await supabase.delete('animales', id);
        await logActivity('Eliminar animal', `Eliminó el animal: ${nombre}`);
        showAppMessage('Animal eliminado exitosamente', 'success');
        await loadAnimals();
    } catch (error) {
        console.error('Error deleting animal:', error);
        showAppMessage('Error al eliminar animal: ' + error.message, 'error');
    }
}

// Adoptar animal
async function adoptAnimal(id, nombre) {
    const adoptanteNombre = prompt('Ingrese el nombre del adoptante:');
    
    if (!adoptanteNombre || adoptanteNombre.trim() === '') {
        return;
    }
    
    const adoptanteTelefono = prompt('Ingrese el teléfono del adoptante:');
    const adoptanteEmail = prompt('Ingrese el email del adoptante (opcional):');
    
    try {
        // Crear registro de adopción
        await supabase.insert('adopciones', {
            animal_id: id,
            adoptante_nombre: adoptanteNombre.trim(),
            adoptante_telefono: adoptanteTelefono || '',
            adoptante_email: adoptanteEmail || '',
            fecha_adopcion: new Date().toISOString(),
            usuario_registro_id: currentUser.id,
            estado: 'Completada'
        });
        
        // Actualizar estado del animal
        await supabase.update('animales', id, {
            estado: ANIMAL_STATUS.ADOPTADO,
            fecha_actualizacion: new Date().toISOString()
        });
        
        await logActivity('Adopción registrada', `Registró adopción del animal: ${nombre} por ${adoptanteNombre}`);
        showAppMessage(`¡${nombre} ha sido adoptado exitosamente!`, 'success');
        await loadAnimals();
        
    } catch (error) {
        console.error('Error registering adoption:', error);
        showAppMessage('Error al registrar adopción: ' + error.message, 'error');
    }
}

// Cancelar formulario
function cancelForm() {
    showView('dashboard');
    resetAnimalForm();
}

// Resetear formulario
function resetAnimalForm() {
    document.getElementById('animal-form').reset();
    document.getElementById('form-title').textContent = 'Registrar Nuevo Animal';
    document.getElementById('animal-id').value = '';
    editingAnimalId = null;
    
    // Resetear select de razas
    document.getElementById('animal-raza').innerHTML = '<option value="">Seleccionar especie primero</option>';
}