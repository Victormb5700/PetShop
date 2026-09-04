-- =============================================
-- PetAgenda - Banco de Dados MySQL
-- CRUD de agendamentos para Pet Shop
-- =============================================

CREATE DATABASE IF NOT EXISTS petshop
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE petshop;

CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_pet VARCHAR(100) NOT NULL,
    nome_tutor VARCHAR(100) NOT NULL,
    especie ENUM('Cachorro', 'Gato') NOT NULL,
    servico VARCHAR(100) NOT NULL,
    data_hora DATETIME NOT NULL,
    observacao VARCHAR(500),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dados de exemplo para testar a tela de listagem
INSERT INTO agendamentos (nome_pet, nome_tutor, especie, servico, data_hora, observacao) VALUES
('Thor', 'Mariana Souza', 'Cachorro', 'Banho e tosa', '2026-09-08 14:00:00', 'Usar shampoo neutro.'),
('Luna', 'Carlos Lima', 'Gato', 'Corte de unhas', '2026-09-09 10:30:00', 'Fica nervosa com secador.'),
('Bob', 'Ana Martins', 'Cachorro', 'Banho', '2026-09-10 16:15:00', NULL);
