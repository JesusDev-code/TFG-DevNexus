CREATE TABLE IF NOT EXISTS usuario_fcm_token (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token           VARCHAR(500) NOT NULL UNIQUE,
    plataforma      VARCHAR(20) NOT NULL,
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_uso       TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fcm_token_usuario ON usuario_fcm_token(usuario_id);

ALTER TABLE usuario DROP COLUMN IF EXISTS fcm_token;
