# SistemaProati

Sistema web desenvolvido para auxiliar o controle e a organização dos equipamentos e espaços utilizados pelo setor de tecnologia da escola.

O projeto foi desenvolvido a partir de uma necessidade real observada durante a rotina do PROATI: melhorar o controle de equipamentos, empréstimos, agendamentos de salas, ocorrências e informações relacionadas ao uso dos recursos tecnológicos da escola.

---

## Sobre o projeto

O SistemaProati nasceu da necessidade de organizar processos que anteriormente dependiam de controles manuais e informações espalhadas.

Durante a rotina do PROATI, existem diversos equipamentos e espaços que precisam ser acompanhados, como:

- Chromebooks
- Tablets
- Salas e laboratórios
- Empréstimos de equipamentos
- Agendamentos de salas
- Professores
- Turmas
- Ocorrências técnicas

A proposta do sistema é centralizar essas informações em uma única aplicação, facilitando o controle diário e permitindo consultar o histórico e gerar informações para análise.

---

## Objetivo

O principal objetivo do SistemaProati é fornecer uma ferramenta para auxiliar o setor de tecnologia da escola no controle de equipamentos e recursos.

O sistema permite registrar e acompanhar:

- Empréstimos de equipamentos
- Devoluções
- Equipamentos disponíveis
- Agendamentos de salas
- Professores
- Turmas
- Ocorrências
- Histórico de utilização
- Relatórios e indicadores

Dessa forma, o projeto busca reduzir controles manuais e facilitar a organização das atividades realizadas pelo PROATI.

---

# Funcionalidades

## Dashboard

O Dashboard apresenta uma visão geral das informações do sistema.

Entre os indicadores estão:

- Total de Chromebooks
- Total de Tablets
- Equipamentos emprestados
- Equipamentos disponíveis
- Agendamentos
- Ocorrências
- Informações de utilização

Também existem informações para auxiliar na análise do uso dos equipamentos e recursos.

---

## Empréstimos

O módulo de empréstimos permite controlar a retirada e devolução dos equipamentos.

É possível registrar:

- Professor responsável
- Turma
- Quantidade
- Tipo de equipamento
- Finalidade do empréstimo
- Data da retirada
- Data da devolução
- Status

### Tipos de equipamento

Atualmente o sistema trabalha com:

- Chromebook
- Tablet

### Finalidade

Os empréstimos podem ser registrados para:

- Aula
- Uso próprio

No caso de uso próprio, não é necessário informar uma turma.

O sistema também verifica a quantidade de equipamentos disponíveis antes de realizar um novo empréstimo.

---

## Devolução de equipamentos

Os empréstimos ativos podem ser devolvidos diretamente pelo sistema.

Ao realizar a devolução:

1. O empréstimo é localizado.
2. O status é alterado.
3. A data de devolução é registrada.
4. O equipamento volta a ser contabilizado como disponível.

---

## Professores

O sistema possui um módulo para cadastro e consulta dos professores.

As informações podem ser utilizadas em:

- Empréstimos
- Agendamentos
- Ocorrências
- Relatórios

---

## Turmas

O módulo de turmas permite cadastrar e consultar as turmas utilizadas no sistema.

As turmas são utilizadas principalmente para identificar a finalidade de um empréstimo ou o grupo relacionado a um agendamento.

---

## Agendamentos

O módulo de agendamentos permite reservar salas e laboratórios para aulas.

O sistema trabalha com horários oficiais de aula e salas cadastradas.

### Salas utilizadas

Atualmente:

- Laboratório Seco
- Sala de Vídeo
- Sala de Leitura
- Sala de Informática
- Sala de Apoio
- Laboratório Úmido

### Horários

O sistema possui 9 períodos de aula:

| Aula | Horário |
|---|---|
| 1ª | 07:30 - 08:20 |
| 2ª | 08:20 - 09:10 |
| 3ª | 09:30 - 10:20 |
| 4ª | 10:20 - 11:10 |
| 5ª | 11:10 - 12:00 |
| 6ª | 13:00 - 13:50 |
| 7ª | 13:50 - 14:40 |
| 8ª | 15:00 - 15:50 |
| 9ª | 15:50 - 16:40 |

O sistema também verifica conflitos de horários e bloqueios previamente cadastrados.

---

## Ocorrências

O módulo de ocorrências permite registrar problemas encontrados durante a rotina do setor de tecnologia.

Uma ocorrência pode conter:

- Professor relacionado
- Sala
- Tipo
- Descrição
- Data
- Responsável
- Status
- Data de resolução

### Status

As ocorrências possuem os seguintes estados:

- Aberta
- Em andamento
- Resolvida

Isso permite acompanhar o andamento dos atendimentos realizados pelo PROATI.

---

## Relatórios

O sistema possui uma área destinada à análise dos dados registrados.

Os relatórios permitem visualizar informações relacionadas a:

- Empréstimos
- Professores
- Turmas
- Agendamentos
- Salas
- Ocorrências

O objetivo é transformar os registros do sistema em informações que possam auxiliar no acompanhamento da utilização dos recursos.

---

# Tecnologias utilizadas

## Frontend

- React
- Vite
- JavaScript
- Axios
- Lucide React
- CSS

## Backend

- Node.js
- Express
- JavaScript
- PostgreSQL
- pg

## Banco de dados

- PostgreSQL
- Supabase

## Versionamento

- Git
- GitHub

---

# Arquitetura

O projeto utiliza uma arquitetura separando frontend, backend e banco de dados.

```text
SistemaProati
│
├── frontend
│   └── React + Vite
│
├── backend
│   └── Node.js + Express
│
└── banco de dados
    └── PostgreSQL / Supabase