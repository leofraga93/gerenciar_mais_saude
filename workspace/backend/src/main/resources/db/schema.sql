-- =============================================================
-- Esquema de referencia - PostgreSQL
-- O Hibernate gera as tabelas automaticamente em tempo de execucao
-- (os ENUMS sao persistidos como VARCHAR via @Enumerated(STRING)).
-- Este arquivo documenta o modelo de dados definido na spec.
-- =============================================================

-- ENUMS
CREATE TYPE tipo_componente AS ENUM ('CPU', 'GPU', 'RAM', 'PLACA_MAE', 'FONTE', 'GABINETE', 'ARMAZENAMENTO', 'PERIFERICO');
CREATE TYPE arquitetura_plataforma AS ENUM ('AMD_AM4', 'AMD_AM5', 'INTEL_LGA1700', 'INTEL_LGA1851');
CREATE TYPE tipo_ram AS ENUM ('DDR4', 'DDR5');

-- TABELA DE PRODUTOS/PECAS
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria tipo_componente NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    link_afiliado TEXT NOT NULL,
    plataforma arquitetura_plataforma,
    tipo_memoria tipo_ram,
    slots_ram_requeridos INT DEFAULT 0,
    slots_ram_fornecidos INT DEFAULT 0,
    consumo_watts INT DEFAULT 0,
    potencia_watts_fornecida INT DEFAULT 0,
    peso_desempenho INT NOT NULL CHECK (peso_desempenho BETWEEN 1 AND 4)
);

-- TABELA DE JOGOS E PESOS POR COMPONENTE
CREATE TABLE jogos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    imagem_url TEXT,
    peso_cpu INT NOT NULL CHECK (peso_cpu BETWEEN 1 AND 4),
    peso_gpu INT NOT NULL CHECK (peso_gpu BETWEEN 1 AND 4),
    peso_ram INT NOT NULL CHECK (peso_ram BETWEEN 1 AND 4)
);

-- TABELA DE RECEITAS BASE
CREATE TABLE receitas_base (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    arquitetura_marca VARCHAR(10) NOT NULL, -- 'AMD' ou 'INTEL'
    peso_geral_calculado INT NOT NULL
);

-- TABELA ASSOCIATIVA (ITENS DA RECEITA)
CREATE TABLE itens_receita (
    receita_id INT REFERENCES receitas_base(id),
    produto_id INT REFERENCES produtos(id),
    PRIMARY KEY (receita_id, produto_id)
);
