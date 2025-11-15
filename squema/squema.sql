-- =============================================
-- SISTEMA DE GESTIÓN - REFUGIO DE ANIMALES
-- Base de Datos Completa para Supabase (versión corregida)
-- =============================================

-- Eliminar tablas si existen (para reiniciar)
DROP TABLE IF EXISTS actividades CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS adopciones CASCADE;
DROP TABLE IF EXISTS fotos_animales CASCADE;
DROP TABLE IF EXISTS vacunas_animales CASCADE;
DROP TABLE IF EXISTS medicamentos_animales CASCADE;
DROP TABLE IF EXISTS alimentacion_animales CASCADE;
DROP TABLE IF EXISTS animales CASCADE;
DROP TABLE IF EXISTS razas CASCADE;
DROP TABLE IF EXISTS especies CASCADE;
DROP TABLE IF EXISTS estados_salud CASCADE;
DROP TABLE IF EXISTS vacunas CASCADE;
DROP TABLE IF EXISTS medicamentos CASCADE;
DROP TABLE IF EXISTS tipos_alimentacion CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- =============================================
-- EXTENSIONES REQUERIDAS
-- Nota: En algunos entornos (hosted) puede requerirse permiso para crear extensiones.
-- Supabase normalmente permite 'pg_trgm' — si falla, pide al admin que la habilite.
-- =============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- TABLA: usuarios
-- Almacena información de usuarios del sistema
-- =============================================
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL DEFAULT 'Usuario',
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- =============================================
-- TABLA: especies
-- Catálogo de especies de animales
-- =============================================
CREATE TABLE especies (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar especies por defecto
INSERT INTO especies (nombre, descripcion) VALUES
('Perro', 'Canis lupus familiaris'),
('Gato', 'Felis catus'),
('Conejo', 'Oryctolagus cuniculus'),
('Ave', 'Aves diversas especies'),
('Hámster', 'Cricetinae'),
('Tortuga', 'Testudines'),
('Pez', 'Peces de agua dulce y salada'),
('Otro', 'Otras especies no categorizadas');

-- =============================================
-- TABLA: razas
-- Catálogo de razas por especie
-- =============================================
CREATE TABLE razas (
    id BIGSERIAL PRIMARY KEY,
    especie_id BIGINT NOT NULL REFERENCES especies(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(especie_id, nombre)
);

-- Índice para razas
CREATE INDEX idx_razas_especie ON razas(especie_id);

-- Insertar razas por defecto
-- Razas de Perros
INSERT INTO razas (especie_id, nombre, descripcion) VALUES
(1, 'Mestizo', 'Perro de raza mixta'),
(1, 'Labrador Retriever', 'Raza grande, amigable y activa'),
(1, 'Pastor Alemán', 'Raza inteligente y leal'),
(1, 'Golden Retriever', 'Raza dócil y familiar'),
(1, 'Bulldog', 'Raza pequeña a mediana, tranquila'),
(1, 'Chihuahua', 'Raza toy, pequeña'),
(1, 'Poodle', 'Raza inteligente, hipoalergénica'),
(1, 'Beagle', 'Raza mediana, cazadora'),
(1, 'Rottweiler', 'Raza grande, guardiana'),
(1, 'Yorkshire Terrier', 'Raza toy, pequeña');

-- Razas de Gatos
INSERT INTO razas (especie_id, nombre, descripcion) VALUES
(2, 'Mestizo', 'Gato de raza mixta'),
(2, 'Siamés', 'Gato oriental, vocal'),
(2, 'Persa', 'Pelo largo, tranquilo'),
(2, 'Maine Coon', 'Raza grande, amigable'),
(2, 'Bengalí', 'Aspecto salvaje, activo'),
(2, 'Angora', 'Pelo largo, elegante'),
(2, 'Británico de Pelo Corto', 'Robusto y tranquilo'),
(2, 'Sphynx', 'Sin pelo, cariñoso'),
(2, 'Ragdoll', 'Dócil y grande'),
(2, 'Abisinio', 'Activo y curioso');

-- Razas de Conejos
INSERT INTO razas (especie_id, nombre, descripcion) VALUES
(3, 'Común', 'Conejo doméstico común'),
(3, 'Holland Lop', 'Orejas caídas, pequeño'),
(3, 'Angora', 'Pelo largo'),
(3, 'Rex', 'Pelo aterciopelado'),
(3, 'Enano', 'Muy pequeño'),
(3, 'Gigante de Flandes', 'Muy grande');

-- Razas de Aves
INSERT INTO razas (especie_id, nombre, descripcion) VALUES
(4, 'Canario', 'Ave cantora pequeña'),
(4, 'Periquito', 'Pequeño loro'),
(4, 'Ninfa', 'Cacatúa pequeña'),
(4, 'Loro', 'Ave grande, inteligente'),
(4, 'Agapornis', 'Pequeño loro africano'),
(4, 'Paloma', 'Ave doméstica común');

-- Otras especies
INSERT INTO razas (especie_id, nombre, descripcion) VALUES
(5, 'Sirio', 'Hámster dorado'),
(5, 'Ruso', 'Hámster enano'),
(6, 'Mediterránea', 'Tortuga de tierra'),
(6, 'Acuática', 'Tortuga de agua'),
(7, 'Goldfish', 'Pez dorado'),
(7, 'Betta', 'Pez luchador'),
(8, 'Sin Clasificar', 'Otros animales');

-- =============================================
-- TABLA: estados_salud
-- Catálogo de estados de salud
-- =============================================
CREATE TABLE estados_salud (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    color TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar estados de salud
INSERT INTO estados_salud (nombre, descripcion, color) VALUES
('Excelente', 'Animal en perfecto estado de salud', '#10b981'),
('Bueno', 'Animal saludable con revisiones al día', '#3b82f6'),
('Regular', 'Animal con condiciones menores bajo control', '#f59e0b'),
('Requiere Atención', 'Animal que necesita tratamiento o seguimiento', '#ef4444'),
('En Recuperación', 'Animal recuperándose de enfermedad o lesión', '#8b5cf6'),
('Crítico', 'Animal en estado delicado que requiere atención urgente', '#dc2626');

-- =============================================
-- TABLA: animales
-- Registro principal de animales del refugio
-- =============================================
CREATE TABLE animales (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    especie_id BIGINT NOT NULL REFERENCES especies(id),
    raza_id BIGINT NOT NULL REFERENCES razas(id),
    edad TEXT,
    genero TEXT CHECK (genero IN ('Macho', 'Hembra', 'Desconocido')),
    color TEXT,
    peso_kg DECIMAL(5,2),
    estado TEXT NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'En adopción', 'Adoptado', 'En tratamiento')),
    estado_salud_id BIGINT REFERENCES estados_salud(id),
    descripcion TEXT,
    vacunado TEXT CHECK (vacunado IN ('Si', 'No', 'Parcialmente')),
    esterilizado BOOLEAN DEFAULT FALSE,
    microchip TEXT,
    usuario_creador_id BIGINT REFERENCES usuarios(id),
    fecha_ingreso TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_adopcion TIMESTAMPTZ
);

-- Índices para animales
CREATE INDEX idx_animales_especie ON animales(especie_id);
CREATE INDEX idx_animales_raza ON animales(raza_id);
CREATE INDEX idx_animales_estado ON animales(estado);
CREATE INDEX idx_animales_estado_salud ON animales(estado_salud_id);
CREATE INDEX idx_animales_fecha_ingreso ON animales(fecha_ingreso);

-- =============================================
-- TABLA: fotos_animales
-- Almacena fotos de los animales
-- =============================================
CREATE TABLE fotos_animales (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    url_foto TEXT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    descripcion TEXT,
    fecha_subida TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para fotos
CREATE INDEX idx_fotos_animal ON fotos_animales(animal_id);
CREATE INDEX idx_fotos_principal ON fotos_animales(es_principal);

-- =============================================
-- TABLA: vacunas
-- Catálogo de vacunas disponibles
-- =============================================
CREATE TABLE vacunas (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    especie_aplicable TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar vacunas comunes
INSERT INTO vacunas (nombre, descripcion, especie_aplicable) VALUES
('Rabia', 'Vacuna antirrábica', 'Perro, Gato'),
('Parvovirus', 'Vacuna contra parvovirus canino', 'Perro'),
('Moquillo', 'Vacuna contra el moquillo', 'Perro'),
('Triple Felina', 'Vacuna contra rinotraqueítis, calicivirus y panleucopenia', 'Gato'),
('Leucemia Felina', 'Vacuna contra la leucemia felina', 'Gato'),
('Polivalente', 'Vacuna múltiple', 'Perro, Gato'),
('Bordetella', 'Vacuna contra tos de las perreras', 'Perro');

-- =============================================
-- TABLA: vacunas_animales
-- Registro de vacunas aplicadas a cada animal
-- =============================================
CREATE TABLE vacunas_animales (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    vacuna_id BIGINT NOT NULL REFERENCES vacunas(id),
    fecha_aplicacion DATE NOT NULL,
    fecha_proxima_dosis DATE,
    veterinario TEXT,
    observaciones TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para vacunas de animales
CREATE INDEX idx_vacunas_animales_animal ON vacunas_animales(animal_id);
CREATE INDEX idx_vacunas_animales_vacuna ON vacunas_animales(vacuna_id);

-- =============================================
-- TABLA: medicamentos
-- Catálogo de medicamentos
-- =============================================
CREATE TABLE medicamentos (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    tipo TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar medicamentos comunes
INSERT INTO medicamentos (nombre, descripcion, tipo) VALUES
('Antibiótico General', 'Tratamiento de infecciones bacterianas', 'Antibiótico'),
('Antiparasitario Interno', 'Tratamiento contra parásitos internos', 'Antiparasitario'),
('Antiparasitario Externo', 'Tratamiento contra pulgas y garrapatas', 'Antiparasitario'),
('Analgésico', 'Alivio del dolor', 'Analgésico'),
('Antiinflamatorio', 'Reducción de inflamación', 'Antiinflamatorio'),
('Vitaminas', 'Suplemento vitamínico', 'Suplemento');

-- =============================================
-- TABLA: medicamentos_animales
-- Registro de medicamentos administrados
-- =============================================
CREATE TABLE medicamentos_animales (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    medicamento_id BIGINT NOT NULL REFERENCES medicamentos(id),
    dosis TEXT NOT NULL,
    frecuencia TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    veterinario TEXT,
    observaciones TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para medicamentos de animales
CREATE INDEX idx_medicamentos_animales_animal ON medicamentos_animales(animal_id);
CREATE INDEX idx_medicamentos_animales_medicamento ON medicamentos_animales(medicamento_id);

-- =============================================
-- TABLA: tipos_alimentacion
-- Catálogo de tipos de alimentación
-- =============================================
CREATE TABLE tipos_alimentacion (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar tipos de alimentación
INSERT INTO tipos_alimentacion (nombre, descripcion) VALUES
('Alimento Seco (Croquetas)', 'Alimento balanceado seco'),
('Alimento Húmedo (Lata)', 'Alimento enlatado o en sobre'),
('Dieta BARF', 'Alimentos crudos biológicamente apropiados'),
('Dieta Casera', 'Alimento preparado en casa'),
('Alimento Especial', 'Dieta veterinaria especializada'),
('Mixta', 'Combinación de varios tipos');

-- =============================================
-- TABLA: alimentacion_animales
-- Registro de alimentación de cada animal
-- =============================================
CREATE TABLE alimentacion_animales (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    tipo_alimentacion_id BIGINT NOT NULL REFERENCES tipos_alimentacion(id),
    marca TEXT,
    cantidad_diaria TEXT,
    frecuencia_comidas INTEGER,
    observaciones TEXT,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para alimentación
CREATE INDEX idx_alimentacion_animal ON alimentacion_animales(animal_id);

-- =============================================
-- TABLA: adopciones
-- Registro de adopciones realizadas
-- =============================================
CREATE TABLE adopciones (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL REFERENCES animales(id),
    adoptante_nombre TEXT NOT NULL,
    adoptante_telefono TEXT,
    adoptante_email TEXT,
    adoptante_direccion TEXT,
    adoptante_dni TEXT,
    fecha_adopcion TIMESTAMPTZ DEFAULT NOW(),
    monto_adopcion DECIMAL(10,2) DEFAULT 0,
    estado TEXT DEFAULT 'Completada' CHECK (estado IN ('Pendiente', 'Completada', 'Cancelada')),
    usuario_registro_id BIGINT REFERENCES usuarios(id),
    observaciones TEXT,
    fecha_seguimiento DATE
);

-- Índices para adopciones
CREATE INDEX idx_adopciones_animal ON adopciones(animal_id);
CREATE INDEX idx_adopciones_estado ON adopciones(estado);
CREATE INDEX idx_adopciones_fecha ON adopciones(fecha_adopcion);

-- =============================================
-- TABLA: sesiones
-- Control de sesiones de usuario
-- =============================================
CREATE TABLE sesiones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    ip_address TEXT,
    user_agent TEXT
);

-- Índices para sesiones
CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_fecha ON sesiones(fecha_inicio);

-- =============================================
-- TABLA: actividades
-- Log de actividades del sistema
-- =============================================
CREATE TABLE actividades (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    accion TEXT NOT NULL,
    detalles TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT
);

-- Índices para actividades
CREATE INDEX idx_actividades_usuario ON actividades(usuario_id);
-- Evitamos usar DESC en la definición del índice para compatibilidad amplia
CREATE INDEX idx_actividades_fecha ON actividades(fecha);
CREATE INDEX idx_actividades_accion ON actividades(accion);

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar fecha de modificación en usuarios
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usuarios
CREATE TRIGGER update_usuarios_modtime
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Función para actualizar fecha_actualizacion en animales
CREATE OR REPLACE FUNCTION update_animales_modtime_function()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para animales (usa la columna fecha_actualizacion)
CREATE TRIGGER update_animales_modtime
    BEFORE UPDATE ON animales
    FOR EACH ROW
    EXECUTE FUNCTION update_animales_modtime_function();

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- Nota: Supabase recomienda usar RLS, pero para este proyecto
-- usaremos la API Key anon que ya proporciona acceso
-- =============================================

-- Habilitar RLS en todas las tablas (opcional)
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE animales ENABLE ROW LEVEL SECURITY;
-- etc...

-- =============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =============================================

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (username, password, email, rol, activo)
VALUES ('administrador', 'Admin2025', 'admin@refugio.com', 'Administrador', true)
ON CONFLICT (username) DO NOTHING;

-- Insertar algunos animales de ejemplo (opcional)
INSERT INTO animales (
    nombre, 
    especie_id, 
    raza_id, 
    edad, 
    genero, 
    color, 
    estado, 
    estado_salud_id, 
    descripcion, 
    vacunado,
    usuario_creador_id
) VALUES
(
    'Max',
    1,
    1,
    '3 años',
    'Macho',
    'Café y blanco',
    'Disponible',
    2,
    'Perro muy amigable y juguetón, ideal para familias con niños. Le encanta jugar con pelotas.',
    'Si',
    1
),
(
    'Luna',
    2,
    2,
    '2 años',
    'Hembra',
    'Gris',
    'Disponible',
    2,
    'Gata tranquila y cariñosa, perfecta para apartamentos. Le gusta dormir en lugares altos.',
    'Si',
    1
),
(
    'Rocky',
    1,
    3,
    '5 años',
    'Macho',
    'Negro y café',
    'En adopción',
    3,
    'Pastor Alemán entrenado, excelente guardián. Necesita espacio y ejercicio diario.',
    'Si',
    1
),
(
    'Mimi',
    2,
    3,
    '1 año',
    'Hembra',
    'Blanco',
    'Disponible',
    1,
    'Gata persa muy hermosa y elegante. Requiere cepillado regular por su pelo largo.',
    'Parcialmente',
    1
),
(
    'Toby',
    3,
    1,
    '6 meses',
    'Macho',
    'Blanco y gris',
    'Disponible',
    2,
    'Conejo muy tierno y sociable. Le gustan las zanahorias y la lechuga.',
    'No',
    1
);

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista: Animales con información completa
CREATE OR REPLACE VIEW v_animales_completo AS
SELECT 
    a.id,
    a.nombre,
    a.edad,
    a.genero,
    a.color,
    a.peso_kg,
    a.estado,
    a.descripcion,
    a.vacunado,
    a.esterilizado,
    a.microchip,
    a.fecha_ingreso,
    a.fecha_actualizacion,
    e.nombre AS especie_nombre,
    r.nombre AS raza_nombre,
    es.nombre AS estado_salud_nombre,
    es.color AS estado_salud_color,
    u.username AS creador_username
FROM animales a
LEFT JOIN especies e ON a.especie_id = e.id
LEFT JOIN razas r ON a.raza_id = r.id
LEFT JOIN estados_salud es ON a.estado_salud_id = es.id
LEFT JOIN usuarios u ON a.usuario_creador_id = u.id;

-- Vista: Estadísticas del refugio
CREATE OR REPLACE VIEW v_estadisticas_refugio AS
SELECT 
    COUNT(*) AS total_animales,
    COUNT(*) FILTER (WHERE estado = 'Disponible') AS disponibles,
    COUNT(*) FILTER (WHERE estado = 'En adopción') AS en_adopcion,
    COUNT(*) FILTER (WHERE estado = 'Adoptado') AS adoptados,
    COUNT(*) FILTER (WHERE estado = 'En tratamiento') AS en_tratamiento,
    COUNT(DISTINCT especie_id) AS total_especies
FROM animales;

-- Vista: Adopciones con información completa
CREATE OR REPLACE VIEW v_adopciones_completo AS
SELECT 
    ad.id,
    ad.fecha_adopcion,
    ad.estado AS estado_adopcion,
    ad.monto_adopcion,
    ad.adoptante_nombre,
    ad.adoptante_telefono,
    ad.adoptante_email,
    ad.observaciones,
    a.nombre AS animal_nombre,
    e.nombre AS animal_especie,
    r.nombre AS animal_raza,
    u.username AS registrado_por
FROM adopciones ad
LEFT JOIN animales a ON ad.animal_id = a.id
LEFT JOIN especies e ON a.especie_id = e.id
LEFT JOIN razas r ON a.raza_id = r.id
LEFT JOIN usuarios u ON ad.usuario_registro_id = u.id;

-- Vista: Actividad reciente
CREATE OR REPLACE VIEW v_actividad_reciente AS
SELECT 
    ac.id,
    ac.username,
    ac.accion,
    ac.detalles,
    ac.fecha,
    u.rol AS usuario_rol
FROM actividades ac
LEFT JOIN usuarios u ON ac.usuario_id = u.id
ORDER BY ac.fecha DESC
LIMIT 100;

-- =============================================
-- FUNCIONES ÚTILES
-- =============================================

-- Función: Obtener estadísticas por especie
CREATE OR REPLACE FUNCTION get_stats_by_species()
RETURNS TABLE (
    especie TEXT,
    total BIGINT,
    disponibles BIGINT,
    adoptados BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.nombre AS especie,
        COUNT(a.id) AS total,
        COUNT(a.id) FILTER (WHERE a.estado = 'Disponible') AS disponibles,
        COUNT(a.id) FILTER (WHERE a.estado = 'Adoptado') AS adoptados
    FROM especies e
    LEFT JOIN animales a ON e.id = a.especie_id
    GROUP BY e.nombre
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener animales próximos a vacunar
CREATE OR REPLACE FUNCTION get_animals_need_vaccine()
RETURNS TABLE (
    animal_id BIGINT,
    animal_nombre TEXT,
    vacuna_nombre TEXT,
    fecha_proxima_dosis DATE,
    dias_restantes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        va.animal_id,
        a.nombre AS animal_nombre,
        v.nombre AS vacuna_nombre,
        va.fecha_proxima_dosis,
        (va.fecha_proxima_dosis - CURRENT_DATE)::INTEGER AS dias_restantes
    FROM vacunas_animales va
    JOIN animales a ON va.animal_id = a.id
    JOIN vacunas v ON va.vacuna_id = v.id
    WHERE va.fecha_proxima_dosis IS NOT NULL
      AND va.fecha_proxima_dosis >= CURRENT_DATE
      AND va.fecha_proxima_dosis <= (CURRENT_DATE + INTERVAL '30 days')::DATE
    ORDER BY va.fecha_proxima_dosis;
END;
$$ LANGUAGE plpgsql;

-- Función: Registrar actividad automáticamente
CREATE OR REPLACE FUNCTION log_animal_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO actividades (usuario_id, username, accion, detalles)
        VALUES (NEW.usuario_creador_id, 'Sistema', 'Animal Registrado', 
                'Nuevo animal registrado: ' || NEW.nombre);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.estado IS DISTINCT FROM NEW.estado) THEN
            INSERT INTO actividades (usuario_id, username, accion, detalles)
            VALUES (NEW.usuario_creador_id, 'Sistema', 'Estado Actualizado', 
                    'Animal ' || NEW.nombre || ' cambió de ' || OLD.estado || ' a ' || NEW.estado);
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO actividades (usuario_id, username, accion, detalles)
        VALUES (OLD.usuario_creador_id, 'Sistema', 'Animal Eliminado', 
                'Animal eliminado: ' || OLD.nombre);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log automático de cambios en animales
CREATE TRIGGER trigger_log_animal_changes
    AFTER INSERT OR UPDATE OR DELETE ON animales
    FOR EACH ROW
    EXECUTE FUNCTION log_animal_changes();

-- =============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN (TEXT SEARCH)
-- Requieren la extensión pg_trgm (se creó al inicio)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_animales_nombre_trgm ON animales USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_animales_descripcion_trgm ON animales USING gin (descripcion gin_trgm_ops);

-- =============================================
-- COMENTARIOS EN LAS TABLAS
-- =============================================
COMMENT ON TABLE usuarios IS 'Almacena la información de los usuarios del sistema con sus roles y permisos';
COMMENT ON TABLE especies IS 'Catálogo de especies de animales que puede albergar el refugio';
COMMENT ON TABLE razas IS 'Catálogo de razas específicas para cada especie';
COMMENT ON TABLE estados_salud IS 'Estados de salud predefinidos para los animales';
COMMENT ON TABLE animales IS 'Tabla principal con toda la información de los animales del refugio';
COMMENT ON TABLE fotos_animales IS 'Almacena las URLs de las fotos de cada animal';
COMMENT ON TABLE vacunas IS 'Catálogo de vacunas disponibles';
COMMENT ON TABLE vacunas_animales IS 'Registro de vacunas aplicadas a cada animal';
COMMENT ON TABLE medicamentos IS 'Catálogo de medicamentos disponibles';
COMMENT ON TABLE medicamentos_animales IS 'Registro de medicamentos administrados a cada animal';
COMMENT ON TABLE tipos_alimentacion IS 'Tipos de alimentación disponibles';
COMMENT ON TABLE alimentacion_animales IS 'Plan de alimentación de cada animal';
COMMENT ON TABLE adopciones IS 'Registro completo de todas las adopciones realizadas';
COMMENT ON TABLE sesiones IS 'Control de sesiones de usuario para auditoría';
COMMENT ON TABLE actividades IS 'Log de todas las actividades realizadas en el sistema';

-- =============================================
-- CONSULTAS DE VERIFICACIÓN
-- =============================================

-- Verificar que todas las tablas se crearon correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar datos iniciales
SELECT 'Especies' AS tabla, COUNT(*) AS registros FROM especies
UNION ALL
SELECT 'Razas', COUNT(*) FROM razas
UNION ALL
SELECT 'Estados de Salud', COUNT(*) FROM estados_salud
UNION ALL
SELECT 'Vacunas', COUNT(*) FROM vacunas
UNION ALL
SELECT 'Medicamentos', COUNT(*) FROM medicamentos
UNION ALL
SELECT 'Tipos de Alimentación', COUNT(*) FROM tipos_alimentacion
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Animales', COUNT(*) FROM animales;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos creada exitosamente (versión corregida)';
    RAISE NOTICE '📊 Tablas creadas y configuradas';
    RAISE NOTICE '👤 Usuario administrador: administrador / Admin2025 (si se insertó)';
    RAISE NOTICE '🐾 Sistema listo para usar';
END $$;
