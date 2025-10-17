# 🎮 Perfect World Game API Client

Cliente TypeScript moderno para comunicação com servidores Perfect World usando protocolo binário TCP.

## ✨ Características

- 🏗️ **Arquitetura Independente** - Cada action é autocontida
- 🔒 **Type-Safe** - TypeScript com validação completa
- 🧪 **Testado** - 45 testes de integração com Vitest
- 📦 **Modular** - Cada RPC/Protocol em sua própria estrutura
- ⚡ **Direto** - Sem camadas intermediárias desnecessárias
- 🔧 **Simples** - API intuitiva e fácil de usar

## 📦 Instalação

```bash
npm install
```

## 🚀 Uso Rápido

### RPCs (Request-Response)

```typescript
import { GetRoleBase, GetRoleStatus, SendMail } from './src';

// Obter dados básicos do personagem
const base = await GetRoleBase.fetch('127.0.0.1', 29400, {
  roleId: 1073,
});
console.log(`Nome: ${base.base?.name}`);
console.log(`Nível: ${base.base?.custom_status}`);

// Obter status do personagem
const status = await GetRoleStatus.fetch('127.0.0.1', 29400, {
  roleId: 1073,
});
console.log(`HP: ${status.status?.hp}/${status.status?.max_hp}`);

// Enviar email
const result = await SendMail.fetch('127.0.0.1', 29100, {
  tid: Date.now(),
  sysid: 32,
  sys_type: 3,
  receiver: 1073,
  title: 'Título do Email',
  context: 'Conteúdo aqui',
  attach_obj: {
    id: 0,
    pos: 0,
    count: 0,
    max_count: 0,
    data: Buffer.alloc(0),
    proctype: 0,
    expire_date: 0,
    guid1: 0,
    guid2: 0,
    mask: 0,
  },
  attach_money: 10000,
});
```

### Protocolos GM (Fire-and-Forget)

```typescript
import { GMBanRole, GMMuteRole, ChatBroadcast, ChatChannel } from './src';

// Banir personagem
await GMBanRole.send('127.0.0.1', 29300, {
  gmroleid: 1024,
  type: 100,
  forbid_time: 3600,
  reason: 'Violação das regras',
  roleid: 2048,
});

// Mutar personagem
await GMMuteRole.send('127.0.0.1', 29300, {
  gmroleid: 1024,
  type: 101,
  forbid_time: 1800,
  reason: 'Spam no chat',
  roleid: 2048,
});

// Broadcast no chat
await ChatBroadcast.send('127.0.0.1', 29300, {
  srcroleid: 1024,
  channel: ChatChannel.SYSTEM,
  emotion: 0,
  message: 'Manutenção em 10 minutos!',
});
```

### Protocolos com Paginação

```typescript
import { GMListOnlineUser } from './src';

// Buscar página específica
const page = await GMListOnlineUser.fetchPage('127.0.0.1', 29300, {
  handler: 0,
  blkickuser: 0,
});

console.log(`Jogadores: ${page.players.length}`);
console.log(`Próxima página: ${page.nextHandler}`);

// Buscar todos os jogadores online (todas as páginas)
const allPlayers = await GMListOnlineUser.fetchAll('127.0.0.1', 29300, {
  blkickuser: 0,
});

console.log(`Total de jogadores online: ${allPlayers.length}`);
allPlayers.forEach(p => {
  console.log(`- ${p.name} (Lv ${p.level})`);
});
```

## 🏗️ Arquitetura

### Estrutura do Projeto

```
src/
├── actions/              # Todas as actions (RPCs e Protocolos)
│   ├── get-role-base/
│   ├── get-role-status/
│   ├── get-role-equipment/
│   ├── send-mail/
│   ├── gm-ban-role.ts
│   ├── gm-mute-role.ts
│   ├── chat-broadcast.ts
│   └── ...
├── core/                 # Classes base e utilities
│   ├── protocol.ts       # Protocol e Rpc abstratos
│   ├── base-protocol.ts  # FireAndForget, BaseRpc, Paginated
│   ├── buffer-reader.ts
│   ├── buffer-writer.ts
│   └── logger.ts
├── models/              # DTOs e tipos
└── config/              # Configuração
```

### Classes Base

#### BaseRpc<TInput, TOutput>
Para RPCs que enviam request e esperam response:
- `GetRoleBase`
- `GetRoleStatus`
- `SendMail`
- `ForbidUser`
- etc.

#### FireAndForgetProtocol
Para protocolos que apenas enviam dados:
- `GMBanRole`
- `GMMuteRole`
- `ChatBroadcast`

#### PaginatedProtocol<TInput, TOutput>
Para protocolos com paginação:
- `GMListOnlineUser`

## 🎯 Portas dos Servidores

| Servidor | Porta | Uso |
|----------|-------|-----|
| **GAMEDBD** | 29400 | Dados de personagens, usuários, facções |
| **GDELIVERYD** | 29100 | Sistema de email, entregas |
| **GPROVIDER** | 29300 | Comandos GM, broadcasts, online users |

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Modo watch
npm test -- --watch

# Com coverage
npm test -- --coverage
```

## 📚 Actions Disponíveis

### RPCs (Port 29400 - GAMEDBD)
- `GetRoleBase` - Dados básicos do personagem
- `GetRoleStatus` - Status, HP, MP, level
- `GetRoleBaseStatus` - Base + Status em uma call
- `GetRolePocket` - Inventário
- `GetRoleEquipment` - Equipamentos
- `GetRoleStorehouse` - Armazém
- `GetUserRoles` - Lista de personagens do usuário
- `GetFactionInfo` - Informações da facção
- `GetUserFaction` - Facção do personagem
- `RenameRole` - Renomear personagem
- `ClearStorehousePasswd` - Limpar senha do armazém
- `ForbidUser` - Banir/desbanir conta

### RPCs (Port 29100 - GDELIVERYD)
- `SendMail` - Enviar email do sistema

### Protocolos GM (Port 29300 - GPROVIDER)
- `GMBanRole` - Banir personagem
- `GMMuteRole` - Mutar personagem
- `ChatBroadcast` - Broadcast no chat
- `GMListOnlineUser` - Listar jogadores online

### Utilities
- `ServerStatus` - Verificar status do servidor

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Build
npm run build

# Testes
npm test
```

## 📝 Licença

MIT
