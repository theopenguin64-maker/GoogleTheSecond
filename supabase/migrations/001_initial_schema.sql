-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tokens table (inverted index)
CREATE TABLE IF NOT EXISTS tokens (
  word TEXT NOT NULL,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (word, file_id)
);

-- Create index on tokens.word for fast lookups
CREATE INDEX IF NOT EXISTS idx_tokens_word ON tokens(word);

-- Create index on tokens.file_id for efficient deletion
CREATE INDEX IF NOT EXISTS idx_tokens_file_id ON tokens(file_id);

