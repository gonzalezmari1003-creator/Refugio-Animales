// Cambiar vista
function showView(viewName) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Desactivar todos los botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar vista seleccionada
    document.getElementById(`view-${viewName}`).classList.add('active');
    
    // Activar botón correspondiente
    const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Cargar datos según la vista
    switch(viewName) {
        case 'dashboard':
            loadAnimals();
            break;
        case 'create':
            resetAnimalForm();
            break;
        case 'species':
            loadSpeciesManagement();
            break;
        case 'adoptions':
            loadAdoptions();
            break;
        case 'users':
            if (currentUser.rol === ROLES.ADMIN) {
                loadUsers();
            }
            break;
        case 'activity':
            if (currentUser.rol === ROLES.ADMIN) {
                loadActivityLog();
            }
            break;
    }
}

// Gestión de Especies y Razas
async function loadSpeciesManagement() {
    const container = document.getElementById('species-content');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="animal-form">
                <h3 style="margin-bottom: 16px;">Especies Registradas</h3>
                <div id="species-list"></div>
            </div>
            <div class="animal-form">
                <h3 style="margin-bottom: 16px;">Razas Registradas</h3>
                <div id="breeds-list"></div>
            </div>
        </div>
    `;
    
    try {
        const species = await supabase.select('especies', { order: 'nombre' });
        const breeds = await supabase.select('razas', { order: 'nombre' });
        
        const speciesList = document.getElementById('species-list');
        const breedsList = document.getElementById('breeds-list');
        
        if (species && species.length > 0) {
            speciesList.innerHTML = species.map(s => `
                <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; margin-bottom: 8px;">
                    <strong>${s.nombre}</strong>
                    <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">${s.descripcion || 'Sin descripción'}</p>
                </div>
            `).join('');
        } else {
            speciesList.innerHTML = '<p style="color: #6b7280;">No hay especies registradas</p>';
        }
        
        if (breeds && breeds.length > 0) {
            breedsList.innerHTML = breeds.map(b => {
                const specieName = getSpecieName(b.especie_id);
                return `
                    <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; margin-bottom: 8px;">
                        <strong>${b.nombre}</strong>
                        <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">Especie: ${specieName}</p>
                    </div>
                `;
            }).join('');
        } else {
            breedsList.innerHTML = '<p style="color: #6b7280;">No hay razas registradas</p>';
        }
        
    } catch (error) {
        console.error('Error loading species management:', error);
    }
}

// Cargar adopciones
async function loadAdoptions() {
    const container = document.getElementById('adoptions-content');
    
    try {
        const adoptions = await supabase.select('adopciones', { order: 'fecha_adopcion.desc' });
        
        if (!adoptions || adoptions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❤️</div>
                    <h3>No hay adopciones registradas</h3>
                    <p>Las adopciones aparecerán aquí cuando se registren</p>
                </div>
            `;
            return;
        }
        
        // Obtener información de los animales
        const animalIds = adoptions.map(a => a.animal_id);
        const animals = await supabase.select('animales');
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Animal</th>
                        <th>Adoptante</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${adoptions.map(adoption => {
                        const animal = animals.find(a => a.id === adoption.animal_id);
                        const animalName = animal ? animal.nombre : 'Desconocido';
                        const date = new Date(adoption.fecha_adopcion).toLocaleDateString();
                        
                        return `
                            <tr>
                                <td>${date}</td>
                                <td><strong>${animalName}</strong></td>
                                <td>${adoption.adoptante_nombre}</td>
                                <td>${adoption.adoptante_telefono || 'N/A'}</td>
                                <td>${adoption.adoptante_email || 'N/A'}</td>
                                <td><span class="status-badge status-adoptado">${adoption.estado}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading adoptions:', error);
        container.innerHTML = '<p class="error">Error al cargar adopciones</p>';
    }
}

// Cargar usuarios (solo administrador)
async function loadUsers() {
    const container = document.getElementById('users-table');
    
    try {
        const users = await supabase.select('usuarios', { order: 'fecha_registro.desc' });
        
        if (!users || users.length === 0) {
            container.innerHTML = '<p>No hay usuarios registrados</p>';
            return;
        }
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Fecha Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => {
                        const date = new Date(user.fecha_registro).toLocaleDateString();
                        const isProtected = user.username === 'administrador' || user.id === currentUser.id;
                        const roleClass = user.rol === ROLES.ADMIN ? 'role-admin' : 
                                        user.rol === ROLES.USER ? 'role-user' : 'role-guest';
                        
                        return `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span>👤</span>
                                        <strong>${user.username}</strong>
                                    </div>
                                </td>
                                <td>${user.email}</td>
                                <td>
                                    <span class="role-badge ${roleClass}">${user.rol}</span>
                                </td>
                                <td>
                                    <span class="status-badge ${user.activo ? 'status-disponible' : 'status-tratamiento'}">
                                        ${user.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>${date}</td>
                                <td>
                                    ${!isProtected ? `
                                        <select onchange="changeUserRole(${user.id}, this.value)" 
                                                style="padding: 6px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                            <option value="${ROLES.ADMIN}" ${user.rol === ROLES.ADMIN ? 'selected' : ''}>
                                                Administrador
                                            </option>
                                            <option value="${ROLES.USER}" ${user.rol === ROLES.USER ? 'selected' : ''}>
                                                Usuario
                                            </option>
                                            <option value="${ROLES.GUEST}" ${user.rol === ROLES.GUEST ? 'selected' : ''}>
                                                Invitado
                                            </option>
                                        </select>
                                        <button onclick="toggleUserStatus(${user.id}, ${user.activo})" 
                                                class="btn-edit" 
                                                style="margin-left: 8px; padding: 6px 12px;">
                                            ${user.activo ? '🔒 Desactivar' : '🔓 Activar'}
                                        </button>
                                    ` : `
                                        <span style="font-size: 12px; color: #6b7280;">Protegido</span>
                                    `}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p class="error">Error al cargar usuarios</p>';
    }
}

// Cambiar rol de usuario
async function changeUserRole(userId, newRole) {
    if (currentUser.rol !== ROLES.ADMIN) {
        showAppMessage('No tienes permisos para cambiar roles', 'error');
        return;
    }
    
    try {
        await supabase.update('usuarios', userId, { rol: newRole });
        await logActivity('Cambio de rol', `Cambió el rol del usuario ID ${userId} a ${newRole}`);
        showAppMessage('Rol actualizado exitosamente', 'success');
        await loadUsers();
    } catch (error) {
        console.error('Error changing role:', error);
        showAppMessage('Error al cambiar rol: ' + error.message, 'error');
    }
}

// Activar/Desactivar usuario
async function toggleUserStatus(userId, currentStatus) {
    if (currentUser.rol !== ROLES.ADMIN) {
        showAppMessage('No tienes permisos para esta acción', 'error');
        return;
    }
    
    const newStatus = !currentStatus;
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Estás seguro de ${action} este usuario?`)) {
        return;
    }
    
    try {
        await supabase.update('usuarios', userId, { activo: newStatus });
        await logActivity(
            `Usuario ${action}`, 
            `${action === 'activar' ? 'Activó' : 'Desactivó'} el usuario ID ${userId}`
        );
        showAppMessage(`Usuario ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`, 'success');
        await loadUsers();
    } catch (error) {
        console.error('Error toggling user status:', error);
        showAppMessage('Error al cambiar estado: ' + error.message, 'error');
    }
}

// Cargar registro de actividad
async function loadActivityLog() {
    const container = document.getElementById('activity-table');
    
    try {
        const activities = await supabase.select('actividades', { 
            order: 'fecha.desc',
            limit: 100
        });
        
        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3>No hay actividades registradas</h3>
                    <p>Las actividades del sistema aparecerán aquí</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="max-height: 600px; overflow-y: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha y Hora</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activities.map(activity => {
                                const date = new Date(activity.fecha);
                                const dateStr = date.toLocaleDateString();
                                const timeStr = date.toLocaleTimeString();
                                
                                let actionClass = '';
                                if (activity.accion.includes('Crear')) actionClass = 'status-disponible';
                                else if (activity.accion.includes('Actualizar') || activity.accion.includes('Cambio')) 
                                    actionClass = 'status-adopcion';
                                else if (activity.accion.includes('Eliminar') || activity.accion.includes('Desactivar')) 
                                    actionClass = 'status-tratamiento';
                                else actionClass = 'status-adoptado';
                                
                                return `
                                    <tr>
                                        <td>
                                            <div style="font-size: 13px;">
                                                <div><strong>${dateStr}</strong></div>
                                                <div style="color: #6b7280;">${timeStr}</div>
                                            </div>
                                        </td>
                                        <td><strong>${activity.username}</strong></td>
                                        <td>
                                            <span class="status-badge ${actionClass}">
                                                ${activity.accion}
                                            </span>
                                        </td>
                                        <td style="font-size: 13px; color: #4b5563;">
                                            ${activity.detalles}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading activity log:', error);
        container.innerHTML = '<p class="error">Error al cargar actividades</p>';
    }
}