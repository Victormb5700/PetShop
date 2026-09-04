# PetAgenda - CRUD de Pet Shop

Projeto criado com Node.js + Express + MySQL no backend e HTML + CSS + JavaScript no frontend.

## Funções
- Criar agendamento
- Listar todos os agendamentos
- Editar agendamento
- Excluir agendamento
- Buscar por pet, tutor, serviço ou observação
- Filtrar por cachorro/gato e por data
- Selecionar data e hora com Flatpickr
- Campo de observações
- Interface responsiva em duas telas

## Como rodar
1. Abra o MySQL/phpMyAdmin e importe `sql/criar_banco_petshop.sql`.
2. Na pasta do projeto execute `npm install`.
3. Execute `npm start`.
4. Abra `http://localhost:3000`.

Se seu MySQL possuir senha, altere `password` dentro de `backend/server.js`.
