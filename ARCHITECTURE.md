# 🏗️ Arquitetura do Projeto

Este projeto segue uma arquitetura em camadas inspirada em MVC/Clean Architecture.

## 📁 Estrutura de Pastas

```
src/
├── core/                    # Núcleo da aplicação
│   ├── Protocol.ts         # Classes base de protocolo
│   ├── BufferReader.ts     # Leitura de dados binários
│   ├── BufferWriter.ts     # Escrita de dados binários
│   ├── GameConnection.ts       # Cliente TCP
│   └── index.ts           # Exportações
│
├── models/                  # Modelos de dados (DTOs)
│   ├── role-base.model.ts
│   ├── role-status.model.ts
│   ├── role-inventory.model.ts
│   ├── role-pocket.model.ts
│   ├── role-storehouse.model.ts
│   └── index.ts
│
├── repositories/            # Camada de acesso a dados (RPCs)
│   ├── get-role-base/
│   │   ├── index.ts        # Implementação RPC
│   │   ├── input.ts        # Request DTO
│   │   ├── output.ts       # Response DTO
│   │   └── *.spec.ts       # Testes de integração
│   ├── get-role-status/
│   ├── get-role-base-status/
│   ├── get-role-pocket/
│   ├── get-role-equipment/
│   └── get-role-storehouse/
│
├── services/                # Camada de lógica de negócio
│   ├── role.service.ts     # Serviço de personagens
│   └── index.ts
│
├── config/                  # Configurações
│   └── index.ts
│
└── index.ts                 # Ponto de entrada principal

```

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────┐
│                   Aplicação                         │
│                      ↓ ↑                            │
├─────────────────────────────────────────────────────┤
│              Services (Lógica de Negócio)           │
│                      ↓ ↑                            │
├─────────────────────────────────────────────────────┤
│           Repositories (Acesso a Dados)             │
│                      ↓ ↑                            │
├─────────────────────────────────────────────────────┤
│              Core (GameConnection, Protocol)            │
│                      ↓ ↑                            │
└─────────────────────────────────────────────────────┘
                  Servidor TCP
```

## 📦 Camadas

### 1. Core (Infraestrutura)
Contém as funcionalidades básicas para comunicação TCP, serialização/deserialização de dados binários e protocolo RPC.

**Responsabilidades:**
- Gerenciar conexões TCP
- Serializar/deserializar dados binários (Big-Endian)
- Protocolo base RPC
- CompactUINT, Octets, etc.

### 2. Models (DTOs)
Interfaces TypeScript que representam as estruturas de dados do jogo.

**Responsabilidades:**
- Definir contratos de dados
- Type-safety
- Documentação de estruturas

### 3. Repositories (Acesso a Dados)
Implementações dos protocolos RPC específicos. Cada repository encapsula um RPC.

**Responsabilidades:**
- Implementar RPCs específicos
- Marshalling de argumentos
- Unmarshalling de respostas
- Testes de integração

### 4. Services (Lógica de Negócio)
Camada de alto nível que orquestra repositories e fornece uma API simplificada.

**Responsabilidades:**
- Lógica de negócio
- Orquestrar múltiplos RPCs
- Transformar dados
- API amigável para desenvolvedores

## 🎯 Uso

### Opção 1: Usando Services (Recomendado)

```typescript
import { GameConnection, RoleService } from './src';

const client = new GameConnection('127.0.0.1', 29400);
const roleService = new RoleService(client);

// API de alto nível, simples e intuitiva
const fullData = await roleService.getFullData(1073);
console.log(fullData.base.name);
```

### Opção 2: Usando Repositories Diretamente

```typescript
import { GameConnection, GetRoleBase } from './src';

const client = new GameConnection('127.0.0.1', 29400);

// Acesso direto aos RPCs
const rpc = await client.call(new GetRoleBase({ roleId: 1073 }));
if (rpc.output.retcode === 0) {
  console.log(rpc.output.base);
}
```

## ✅ Vantagens desta Arquitetura

1. **Separação de Responsabilidades**: Cada camada tem um propósito claro
2. **Testabilidade**: Fácil de testar cada camada isoladamente
3. **Manutenibilidade**: Código organizado e fácil de encontrar
4. **Escalabilidade**: Fácil adicionar novos RPCs e serviços
5. **Reutilização**: Models e repositories podem ser usados em diferentes contextos
6. **Type-Safety**: TypeScript em todas as camadas
7. **Documentação**: Estrutura auto-documentada

## 🧪 Testes

Os testes de integração estão organizados junto com seus repositories:

```bash
npm test                  # Modo watch
npm run test:run         # Executar uma vez
npm run test:ui          # Interface visual
npm run test:coverage    # Cobertura de código
```

## 📚 Exemplos

Consulte a pasta `examples/` para ver casos de uso:
- `usando-service.ts` - Usando a camada de serviço
- `exemplo-simples.ts` - Uso básico do cliente
- `exemplo-multiplos-personagens.ts` - Consultando múltiplos personagens

## 🔧 Adicionando Novos Recursos

### Novo RPC
1. Criar pasta em `src/repositories/nome-do-rpc/`
2. Implementar `index.ts`, `input.ts`, `output.ts`
3. Adicionar testes `*.spec.ts`
4. Exportar em `src/index.ts`

### Novo Serviço
1. Criar arquivo em `src/services/nome.service.ts`
2. Usar repositories existentes
3. Exportar em `src/services/index.ts`

### Novo Model
1. Criar arquivo em `src/models/nome.model.ts`
2. Exportar em `src/models/index.ts`

