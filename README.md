# 🎮 Perfect World Game API Client

Cliente TypeScript moderno para comunicação com servidores Perfect World usando protocolo binário TCP.

## ✨ Características

- 🏗️ **Arquitetura MVC/Clean** - Código organizado em camadas
- 🔒 **Type-Safe** - TypeScript com types em vez de interfaces para DTOs
- 🧪 **Testado** - 12 testes de integração com Vitest
- 📦 **Modular** - Cada RPC em sua própria pasta com input/output
- ⚡ **Alto Nível** - Service layer para uso simplificado
- 🔧 **Baixo Nível** - Acesso direto aos repositories quando necessário
- 📝 **kebab-case** - Convenção de nomenclatura consistente

## 📦 Instalação

```bash
npm install
```

## 🚀 Uso Rápido

### Com Service (Recomendado)

```typescript
import { GameConnection, RoleService, LogLevel } from './src';

// Com log configurável
const connection = new GameConnection('127.0.0.1', 29400, LogLevel.INFO);
const roleService = new RoleService(connection);

// Obtém todos os dados do personagem (paralelo)
const data = await roleService.getFullData(1073);
console.log(`${data.base.name} - Level ${data.status.level}`);
console.log(`Dinheiro: ${data.pocket.money}`);
console.log(`Equipamentos: ${data.equipment.length}`);
```

### Acesso Direto aos Repositories

```typescript
import { GameConnection, GetRoleBase } from './src';

const connection = new GameConnection('127.0.0.1', 29400);
const rpc = await connection.call(new GetRoleBase({ roleId: 1073 }));

if (rpc.output.retcode === 0) {
  console.log(rpc.output.base.name);
}
```

## 📁 Estrutura do Projeto

```
src/
├── core/                      # Infraestrutura (Protocol, TCP, Buffer)
│   ├── protocol.ts
│   ├── buffer-reader.ts
│   ├── buffer-writer.ts
│   └── game-connection.ts
│
├── models/                    # Types (DTOs)
│   ├── role-base.model.ts
│   ├── role-status.model.ts
│   ├── role-inventory.model.ts
│   ├── role-pocket.model.ts
│   └── role-storehouse.model.ts
│
├── repositories/              # RPCs (Acesso a dados)
│   ├── get-role-base/
│   │   ├── index.ts          # Implementação
│   │   ├── input.ts          # Request DTO
│   │   ├── output.ts         # Response DTO
│   │   └── *.spec.ts         # Testes
│   ├── get-role-status/
│   ├── get-role-base-status/
│   ├── get-role-pocket/
│   ├── get-role-equipment/
│   └── get-role-storehouse/
│
├── services/                  # Lógica de negócio
│   └── role.service.ts
│
└── config/                    # Configurações
    └── index.ts
```

## 🧪 Testes

```bash
npm test              # Modo watch
npm run test:run      # Executar uma vez
npm run test:ui       # Interface visual
npm run test:coverage # Cobertura
```

**Resultado:** 12/12 testes passando ✅

## 📚 Protocolos Disponíveis

| RPC | Type | Descrição |
|-----|------|-----------|
| `GetRoleBase` | 0x0BC5 | Dados básicos do personagem |
| `GetRoleStatus` | 0x0BC7 | Status (level, HP, MP, posição) |
| `GetRoleBaseStatus` | 0x0BD1 | Base + Status (1 chamada) ⚡ |
| `GetRolePocket` | 0x0BED | Inventário |
| `GetRoleEquipment` | 0x0BC9 | Equipamentos |
| `GetRoleStorehouse` | 0x0BD3 | Armazém (items, materials, fashion) |

## 🎯 RoleService API

```typescript
const roleService = new RoleService(connection);

// Dados básicos
await roleService.getBase(roleId);

// Status
await roleService.getStatus(roleId);

// Base + Status (otimizado)
await roleService.getBaseAndStatus(roleId);

// Inventário
await roleService.getPocket(roleId);

// Equipamentos
await roleService.getEquipment(roleId);

// Armazém
await roleService.getStorehouse(roleId);

// Tudo de uma vez (paralelo)
await roleService.getFullData(roleId);
```

## 📖 Documentação

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura detalhada
- [examples/](./examples/) - Exemplos de uso
- [docs/](./docs/) - Documentação adicional

## 🛠️ Desenvolvimento

### Adicionar Novo RPC

1. Criar pasta em `src/repositories/novo-rpc/`
2. Criar `input.ts`, `output.ts`, `index.ts`
3. Adicionar testes `*.spec.ts`
4. Exportar em `src/index.ts`

### Adicionar Novo Serviço

1. Criar `src/services/novo.service.ts`
2. Usar repositories existentes
3. Exportar em `src/services/index.ts`

## ⚙️ Configuração

```typescript
import { getServerConfig } from './src';

const config = getServerConfig();
// { host: '127.0.0.1', port: 29400 }
```

## 📝 Convenções

- **Arquivos**: kebab-case (`role-base.model.ts`)
- **Classes**: PascalCase (`RoleService`)
- **Types**: PascalCase (`RoleBase`)
- **Variáveis**: camelCase (`roleId`)
- **DTOs**: `type` ao invés de `interface`

## 🔧 Scripts

```bash
npm run build         # Compilar TypeScript
npm run dev          # Desenvolvimento
npm test             # Testes (watch)
npm run test:run     # Testes (once)
npm run test:ui      # UI de testes
```

## 📄 Licença

MIT
