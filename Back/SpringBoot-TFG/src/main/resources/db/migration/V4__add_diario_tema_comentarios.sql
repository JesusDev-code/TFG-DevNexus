CREATE TABLE diario_tema_comentarios (
    id         SERIAL PRIMARY KEY,
    texto      TEXT        NOT NULL,
    fecha      TIMESTAMP   NOT NULL DEFAULT NOW(),
    tema_id    INTEGER     NOT NULL REFERENCES diario_tema(id) ON DELETE CASCADE,
    autor_id   INTEGER     NOT NULL REFERENCES usuario(id)     ON DELETE CASCADE
);

CREATE INDEX idx_dtc_tema ON diario_tema_comentarios(tema_id);
