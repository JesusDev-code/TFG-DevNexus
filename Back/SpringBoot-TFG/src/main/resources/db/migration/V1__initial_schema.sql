-- ============================================================
-- V1 - Initial Schema
-- All statements use IF NOT EXISTS to support baseline-on-migrate
-- over an existing database (Hibernate ddl-auto: update history).
-- ============================================================

CREATE TABLE IF NOT EXISTS rol (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS departamento (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuario (
    id                  SERIAL PRIMARY KEY,
    firebase_uid        VARCHAR(128) NOT NULL UNIQUE,
    email               VARCHAR(100) NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    biografia           VARCHAR(500),
    foto_perfil         VARCHAR(500),
    rol_id              INTEGER NOT NULL REFERENCES rol(id),
    departamento_id     INTEGER REFERENCES departamento(id),
    fcm_token           VARCHAR(255),
    permite_contacto    BOOLEAN NOT NULL DEFAULT TRUE,
    motivo_no_contacto  TEXT,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_firebase_uid ON usuario(firebase_uid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email       ON usuario(email);

CREATE TABLE IF NOT EXISTS diario_tema (
    id          SERIAL PRIMARY KEY,
    titulo      VARCHAR(100),
    descripcion VARCHAR(255),
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id)
);

CREATE INDEX IF NOT EXISTS idx_tema_usuario ON diario_tema(usuario_id);

CREATE TABLE IF NOT EXISTS diario (
    id                  SERIAL PRIMARY KEY,
    contenido           TEXT,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    visibilidad         VARCHAR(20) NOT NULL DEFAULT 'PRIVADO',
    revisado_por        INTEGER REFERENCES usuario(id),
    revision_comentario TEXT,
    revision_en         TIMESTAMP,
    usuario_id          INTEGER REFERENCES usuario(id),
    tema_id             INTEGER REFERENCES diario_tema(id)
);

CREATE INDEX IF NOT EXISTS idx_diario_usuario     ON diario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_diario_visibilidad ON diario(visibilidad);
CREATE INDEX IF NOT EXISTS idx_diario_tema        ON diario(tema_id);

CREATE TABLE IF NOT EXISTS diario_colaboraciones (
    id                BIGSERIAL PRIMARY KEY,
    tema_id           INTEGER NOT NULL REFERENCES diario_tema(id),
    usuario_id        INTEGER NOT NULL REFERENCES usuario(id),
    estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_invitacion  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diario_comentarios (
    id          SERIAL PRIMARY KEY,
    texto       TEXT NOT NULL,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW(),
    diario_id   INTEGER NOT NULL REFERENCES diario(id),
    autor_id    INTEGER NOT NULL REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS conversacion (
    id             SERIAL PRIMARY KEY,
    titulo         VARCHAR(150),
    tipo           VARCHAR(20) NOT NULL DEFAULT 'individual',
    creado_por     INTEGER NOT NULL REFERENCES usuario(id),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_creado ON conversacion(creado_por);

CREATE TABLE IF NOT EXISTS conversacion_participante (
    conversacion_id  INTEGER NOT NULL REFERENCES conversacion(id),
    usuario_id       INTEGER NOT NULL REFERENCES usuario(id),
    fecha_entrada    TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_salida     TIMESTAMP,
    PRIMARY KEY (conversacion_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS mensaje (
    id               SERIAL PRIMARY KEY,
    conversacion_id  INTEGER NOT NULL REFERENCES conversacion(id),
    autor_id         INTEGER NOT NULL REFERENCES usuario(id),
    texto            TEXT NOT NULL,
    fecha_envio      TIMESTAMP NOT NULL DEFAULT NOW(),
    leido_en         TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_msg_conversacion ON mensaje(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_msg_autor        ON mensaje(autor_id);
CREATE INDEX IF NOT EXISTS idx_msg_fecha        ON mensaje(fecha_envio);

CREATE TABLE IF NOT EXISTS notificacion (
    id          SERIAL PRIMARY KEY,
    mensaje     TEXT NOT NULL,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW(),
    leida       BOOLEAN NOT NULL DEFAULT FALSE,
    usuario_id  INTEGER REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS ticket (
    id             SERIAL PRIMARY KEY,
    titulo         VARCHAR(100) NOT NULL,
    descripcion    TEXT,
    estado         VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',
    prioridad      VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_id     INTEGER REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS ticket_historico (
    id              SERIAL PRIMARY KEY,
    ticket_id       INTEGER NOT NULL REFERENCES ticket(id),
    estado_anterior VARCHAR(30),
    estado_nuevo    VARCHAR(30) NOT NULL,
    usuario_id      INTEGER NOT NULL REFERENCES usuario(id),
    comentario      TEXT,
    fecha           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_comentario (
    id          SERIAL PRIMARY KEY,
    ticket_id   INTEGER NOT NULL REFERENCES ticket(id),
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id),
    texto       TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evento (
    id           SERIAL PRIMARY KEY,
    titulo       VARCHAR(100) NOT NULL,
    descripcion  TEXT,
    fecha_evento DATE NOT NULL,
    hora_evento  TIME NOT NULL,
    visibilidad  VARCHAR(20) NOT NULL DEFAULT 'PRIVADO',
    usuario_id   INTEGER REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS auditoria (
    id             SERIAL PRIMARY KEY,
    accion         VARCHAR(100) NOT NULL,
    recurso        VARCHAR(100) NOT NULL,
    descripcion    TEXT,
    severidad      VARCHAR(20) NOT NULL DEFAULT 'INFO',
    fecha          TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_id     INTEGER,
    usuario_email  VARCHAR(255)
);
