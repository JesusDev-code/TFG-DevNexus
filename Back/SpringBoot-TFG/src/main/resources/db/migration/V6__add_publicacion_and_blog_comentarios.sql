-- Campos de publicación en el blog (separados del nombre interno del proyecto)
ALTER TABLE diario_tema
    ADD COLUMN IF NOT EXISTS titulo_publicacion  VARCHAR(200),
    ADD COLUMN IF NOT EXISTS descripcion_publicacion VARCHAR(500);

-- Distingue comentarios de comunidad (blog) de reviews de staff
ALTER TABLE diario_tema_comentarios
    ADD COLUMN IF NOT EXISTS comunidad BOOLEAN NOT NULL DEFAULT FALSE;
