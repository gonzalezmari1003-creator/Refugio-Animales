// Estado de autenticación
let currentUser = null;

// Inicializar la aplicación
async function initApp() {
    try {
        await initializeDatabase();
        checkSession();
    } catch (error) {
        console.error('Error initializing app:', error);
        showAuthMessage('Error al inicializar la aplicación', 'error');
    }
}

// Inicializar base de datos
async function initializeDatabase() {
    try {
        // Verificar si existe el usuario administrador
        const adminUsers = await supabase.select('usuarios', {
            eq: { username: DEFAULT_ADMIN.username }
        });

        if (!adminUsers || adminUsers.length === 0) {
            // Crear usuario administrador por defecto
            await supabase.insert('usuarios', {
                username: DEFAULT_ADMIN.username,
                password: DEFAULT_ADMIN.password,
                email: DEFAULT_ADMIN.email,
                rol: ROLES.ADMIN,
                fecha_registro: new Date().toISOString(),
                activo: true
            });
            console.log('Usuario administrador creado exitosamente');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Verificar sesión guardada
function checkSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    }
}

// Mostrar formulario de login
function showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    clearAuthForm();
}

// Mostrar formulario de registro
function showRegisterForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    clearAuthForm();
}

// Limpiar formularios
function clearAuthForm() {
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    hideAuthMessage();
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showAuthMessage('Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const users = await supabase.select('usuarios', {
            eq: { username: username }
        });

        if (users && users.length > 0) {
            const user = users[0];
            
            if (user.password === password) {
                if (!user.activo) {
                    showAuthMessage('Usuario desactivado. Contacta al administrador', 'error');
                    return;
                }

                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Registrar sesión
                await supabase.insert('sesiones', {
                    usuario_id: user.id,
                    username: user.username,
                    fecha_inicio: new Date().toISOString(),
                    ip_address: 'N/A'
                });

                // Registrar actividad
                await logActivity('Inicio de sesión', `Usuario ${user.username} inició sesión`);

                showApp();
                showAppMessage('¡Bienvenido ' + user.username + '!', 'success');
            } else {
                showAuthMessage('Contraseña incorrecta', 'error');
            }
        } else {
            showAuthMessage('Usuario no encontrado', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage('Error al iniciar sesión: ' + error.message, 'error');
    }
});

// Registro
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || !email || !password) {
        showAuthMessage('Por favor completa todos los campos', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    try {
        // Verificar si el usuario ya existe
        const existingUsers = await supabase.select('usuarios', {
            eq: { username: username }
        });

        if (existingUsers && existingUsers.length > 0) {
            showAuthMessage('El nombre de usuario ya está en uso', 'error');
            return;
        }

        // Verificar si el email ya existe
        const existingEmails = await supabase.select('usuarios', {
            eq: { email: email }
        });

        if (existingEmails && existingEmails.length > 0) {
            showAuthMessage('El email ya está registrado', 'error');
            return;
        }

        // Obtener todos los usuarios para asignar rol
        const allUsers = await supabase.select('usuarios');
        const rol = (allUsers && allUsers.length === 0) ? ROLES.ADMIN : ROLES.USER;

        // Crear nuevo usuario
        await supabase.insert('usuarios', {
            username: username,
            password: password,
            email: email,
            rol: rol,
            fecha_registro: new Date().toISOString(),
            activo: true
        });

        showAuthMessage('¡Registro exitoso! Ahora puedes iniciar sesión', 'success');
        
        setTimeout(() => {
            showLoginForm();
        }, 2000);

    } catch (error) {
        console.error('Register error:', error);
        showAuthMessage('Error al registrar: ' + error.message, 'error');
    }
});

// Cerrar sesión
async function logout() {
    if (currentUser) {
        try {
            await logActivity('Cierre de sesión', `Usuario ${currentUser.username} cerró sesión`);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    currentUser = null;
    localStorage.removeItem('currentUser');
    
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    
    showLoginForm();
    showAuthMessage('Sesión cerrada exitosamente', 'success');
}

// Mostrar aplicación
function showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Actualizar información del usuario
    document.getElementById('user-info').textContent = 
        `Bienvenido, ${currentUser.username} (${currentUser.rol})`;
    
    // Configurar permisos según el rol
    setupPermissions();
    
    // Cargar datos iniciales
    loadAnimals();
    loadSpecies();
}

// Configurar permisos según rol
function setupPermissions() {
    const isAdmin = currentUser.rol === ROLES.ADMIN;
    const isUser = currentUser.rol === ROLES.USER;
    const isGuest = currentUser.rol === ROLES.GUEST;

    // Ocultar opciones según permisos
    if (isGuest) {
        document.getElementById('nav-create').classList.add('hidden');
    } else {
        document.getElementById('nav-create').classList.remove('hidden');
    }

    if (isAdmin) {
        document.getElementById('nav-users').classList.remove('hidden');
        document.getElementById('nav-activity').classList.remove('hidden');
    } else {
        document.getElementById('nav-users').classList.add('hidden');
        document.getElementById('nav-activity').classList.add('hidden');
    }
}

// Registrar actividad
async function logActivity(action, details) {
    if (!currentUser) return;

    try {
        await supabase.insert('actividades', {
            usuario_id: currentUser.id,
            username: currentUser.username,
            accion: action,
            detalles: details,
            fecha: new Date().toISOString(),
            ip_address: 'N/A'
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Mensajes de autenticación
function showAuthMessage(message, type = 'success') {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
}

function hideAuthMessage() {
    document.getElementById('auth-message').classList.add('hidden');
}

// Mensajes de aplicación
function showAppMessage(message, type = 'success') {
    const messageEl = document.getElementById('app-message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 4000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);