// Configuración de Supabase
const SUPABASE_CONFIG = {
    url: 'https://gajpuwiwxtaydazvppqu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhanB1d2l3eHRheWRhenZwcHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjk3ODUsImV4cCI6MjA3ODY0NTc4NX0.wkBAk1jsG_9oWOsvksEgNZmsMzlO_RMYIdpZXmW4U04'
};

// Usuario administrador por defecto
const DEFAULT_ADMIN = {
    username: 'administrador',
    password: 'Admin2025',
    email: 'admin@refugio.com'
};

// Roles disponibles
const ROLES = {
    ADMIN: 'Administrador',
    USER: 'Usuario',
    GUEST: 'Invitado'
};

// Estados de animales
const ANIMAL_STATUS = {
    DISPONIBLE: 'Disponible',
    EN_ADOPCION: 'En adopción',
    ADOPTADO: 'Adoptado',
    EN_TRATAMIENTO: 'En tratamiento'
};