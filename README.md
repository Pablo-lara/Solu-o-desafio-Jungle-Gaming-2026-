# Jungle Gaming — Distributed Wagering Processor

Solução técnica desenvolvida para o desafio da Jungle Gaming, com foco no processamento de apostas, consistência financeira, idempotência e segurança em operações concorrentes.

## Sobre o projeto

O projeto implementa uma API para gerenciamento de carteiras digitais e processamento de transações de apostas. O objetivo é garantir que operações financeiras sejam processadas de maneira consistente, mesmo quando múltiplas requisições são recebidas simultaneamente.

A solução utiliza NestJS e TypeScript para estruturar a aplicação em módulos e camadas, com persistência em PostgreSQL por meio do MikroORM.

### Principais objetivos

- Processar transações de apostas com validação de saldo.
- Prevenir saldos negativos em operações concorrentes.
- Implementar idempotência para evitar o processamento duplicado de requisições.
- Registrar movimentações financeiras por meio de um ledger.
- Organizar a aplicação em camadas, separando domínio, casos de uso, infraestrutura e apresentação.
- Validar o comportamento do sistema por meio de testes automatizados.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| [NestJS](https://nestjs.com/) | Framework para construção da API |
| [TypeScript](https://www.typescriptlang.org/) | Linguagem principal |
| [Bun](https://bun.sh/) | Runtime e gerenciamento de dependências |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional |
| [MikroORM](https://mikro-orm.io/) | Mapeamento objeto-relacional e persistência |

## Arquitetura

A aplicação segue uma organização inspirada em Domain-Driven Design (DDD), com separação de responsabilidades entre as principais camadas.

- **Domain:** contém os conceitos centrais do negócio, como carteiras, movimentações financeiras e objetos de valor.
- **Application:** coordena os casos de uso, incluindo abertura de carteiras e processamento de transações.
- **Infrastructure:** concentra os detalhes de persistência e integração com o banco de dados.
- **Presentation:** disponibiliza os endpoints HTTP e recebe as requisições dos clientes.

Essa separação facilita a manutenção, a testabilidade e a evolução das regras de negócio sem acoplar o domínio diretamente aos detalhes técnicos.

## Funcionalidades

### Carteiras digitais

A aplicação disponibiliza operações relacionadas à criação e à consulta de carteiras, com controle de saldo e moeda.

### Processamento de apostas

O fluxo de apostas valida as informações recebidas e aplica as regras financeiras antes de concluir uma transação.

### Controle de concorrência

O processamento considera o risco de múltiplas operações tentarem consumir o mesmo saldo simultaneamente. O objetivo é preservar a consistência financeira e impedir que o saldo disponível seja ultrapassado.

### Idempotência

As requisições de transação utilizam chaves de idempotência para permitir a identificação de operações repetidas e reduzir o risco de duplicidade no processamento.

### Ledger financeiro

As movimentações são registradas em entidades próprias, permitindo manter um histórico das operações e dos saldos anteriores e posteriores às transações.

### Outbox

A solução possui uma entidade de outbox, destinada ao suporte de um padrão de publicação confiável de mensagens. O comportamento efetivamente implementado depende da configuração e do fluxo de processamento presentes no código.

## Endpoints principais

Os endpoints identificados no código de teste incluem:

| Método | Endpoint | Finalidade |
|---|---|---|
| `POST` | `/wallets` | Criar uma carteira |
| `GET` | `/wallets/:id` | Consultar uma carteira pelo identificador |
| `POST` | `/wagering/transactions` | Enviar uma transação de aposta para processamento |

Os endpoints podem exigir campos adicionais e validações específicas, conforme os DTOs e as regras de negócio implementadas.

### Exemplo: criação de carteira

Requisição:

```http
POST /wallets
Content-Type: application/json
```

```json
{
  "playerId": "player-001",
  "initialBalance": {
    "amount": "100.00",
    "currency": "BRL"
  }
}
```

### Exemplo: processamento de aposta

Requisição:

```http
POST /wagering/transactions
Content-Type: application/json
Idempotency-Key: bet-key-001
```

```json
{
  "providerId": "provider-test",
  "externalTransactionId": "ext-tx-001",
  "idempotencyKey": "bet-key-001",
  "playerId": "player-001",
  "walletId": "wallet-uuid",
  "roundId": "round-001",
  "gameId": "slot-001",
  "kind": "BET",
  "money": {
    "amount": "40.00",
    "currency": "BRL"
  }
}
```

Os valores de identificação são ilustrativos. A resposta e os códigos HTTP dependem das condições de processamento e das regras da API.

O comando utiliza a configuração E2E do Vitest definida no projeto. Verifique as variáveis de ambiente e a disponibilidade do banco antes de executar os testes.

## Configuração do ambiente

### Pré-requisitos

- [Bun](https://bun.sh/) instalado.
- PostgreSQL disponível.
- Variáveis de ambiente configuradas para a conexão com o banco de dados.

### Instalação

Clone o repositório e entre no diretório do projeto:

```bash
git clone https://github.com/Pablo-lara/Solu-o-desafio-Jungle-Gaming-2026-.git
cd Solu-o-desafio-Jungle-Gaming-2026-
```

Instale as dependências:

```bash
bun install
```

Configure as variáveis de ambiente utilizadas pela aplicação. Os valores padrão definidos no código para a conexão com o PostgreSQL são:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=wager_service
```

**Importante:** os valores acima são destinados ao ambiente local de desenvolvimento. Utilize credenciais próprias e seguras em outros ambientes.

### Inicialização

Após configurar o banco de dados, inicie a aplicação usando o script de desenvolvimento definido no `package.json`.

Consulte os scripts disponíveis antes de executar o comando de inicialização:

```bash
bun run
```

## Considerações técnicas

O processamento de transações financeiras exige atenção especial à atomicidade, à concorrência, à idempotência e à consistência dos registros.

Este projeto explora esses desafios em uma API modular, buscando demonstrar práticas de desenvolvimento backend aplicadas a sistemas financeiros e plataformas de apostas.

## Autor

**Pablo Lara**

---

Projeto desenvolvido como solução técnica para o desafio da Jungle Gaming.
