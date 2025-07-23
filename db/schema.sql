-- Table: books

CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    read_date DATE,
    notes TEXT,
    rating NUMERIC(3,1) NOT NULL CHECK (rating >= 0.0 AND rating <= 10.0),
    isbn TEXT UNIQUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rating ON books (rating ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_read_date ON books (read_date ASC NULLS LAST);
