# Changelog

## [Unreleased] - 2025-10-14

### Changed

#### 🔄 Refatoração Major: GameClient → GameConnection

- **Arquivo renomeado**: `src/core/game-client.ts` → `src/core/game-connection.ts`
- **Classe renomeada**: `GameClient` → `GameConnection`
- **Nomenclatura**: `client` → `connection` em todos os construtores e variáveis

**Motivação**: O nome `GameConnection` reflete melhor a responsabilidade da classe, que gerencia conexões TCP efêmeras (não persistentes) para cada chamada RPC.

#### 📦 Repositório Consolidado: RoleRepository

- **Criado**: `src/repositories/role-repository.ts`
- **Agrupa**: Todos os métodos `GetRole*` em uma única classe
- **Service layer**: Agora usa `RoleRepository` internamente ao invés de chamar RPCs diretamente

**Benefícios**:
- Camada de abstração clara entre services e RPCs
- Menor acoplamento
- Facilita mocking em testes
- API mais coerente

#### 🎨 Types vs Interfaces

- **DTOs**: Convertidos de `interface` para `type`
- **Contratos**: Mantidos como `interface` (Protocol, etc)

**Arquivos afetados**:
- `src/models/*.model.ts`
- `src/repositories/*/input.ts`
- `src/repositories/*/output.ts`

#### 📝 Documentação Atualizada

- README.md: Exemplos com `GameConnection` e `RoleRepository`
- ARCHITECTURE.md: Diagramas e explicações atualizadas
- Examples: Todos os exemplos atualizados

### Testing

✅ **17/17 testes** passando
✅ **7 test suites** executados com sucesso

### Migration Guide

#### Antes:
```typescript
import { GameClient, RoleService } from './src';

const client = new GameClient('127.0.0.1', 29400);
const service = new RoleService(client);
```

#### Depois:
```typescript
import { GameConnection, RoleService } from './src';

const connection = new GameConnection('127.0.0.1', 29400);
const service = new RoleService(connection);
```

#### Novo: RoleRepository

```typescript
import { GameConnection, RoleRepository } from './src';

const connection = new GameConnection('127.0.0.1', 29400);
const repository = new RoleRepository(connection);

// Acesso direto aos dados
const result = await repository.getBase(1073);
if (result.retcode === 0) {
  console.log(result.data.name);
}
```

---

## Estrutura do Projeto

```
src/
├── core/
│   ├── protocol.ts
│   ├── buffer-reader.ts
│   ├── buffer-writer.ts
│   └── game-connection.ts      ✨ Renomeado
│
├── models/                      ✨ Types (não interfaces)
│   ├── role-base.model.ts
│   ├── role-status.model.ts
│   ├── role-inventory.model.ts
│   ├── role-pocket.model.ts
│   └── role-storehouse.model.ts
│
├── repositories/
│   ├── role-repository.ts      ✨ Novo - Agrupa todos GetRole*
│   ├── get-role-base/
│   ├── get-role-status/
│   ├── get-role-base-status/
│   ├── get-role-pocket/
│   ├── get-role-equipment/
│   └── get-role-storehouse/
│
└── services/
    └── role.service.ts          ✨ Usa RoleRepository
```
