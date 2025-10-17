# Changelog

## [2.0.0] - 2025-10-17

### 🎉 BREAKING CHANGES

#### ✅ GameConnection Removido Completamente
- **Removido**: `src/core/game-connection.ts`
- **Motivo**: Arquitetura totalmente independente, cada action gerencia sua própria conexão

#### 🏗️ Nova Arquitetura Independente

Todos os protocolos e RPCs agora são **completamente independentes**:

**Antes (v1.x)**:
```typescript
const connection = new GameConnection('127.0.0.1', 29400);
const rpc = await connection.call(new GetRoleBase({ roleId: 1073 }));
console.log(rpc.output.base);
```

**Agora (v2.0)**:
```typescript
const result = await GetRoleBase.fetch('127.0.0.1', 29400, { roleId: 1073 });
console.log(result.base);
```

### ✨ Novidades

#### Classes Base Genéricas
- `BaseRpc<TInput, TOutput>` - Para RPCs com request/response
- `FireAndForgetProtocol` - Para protocolos sem resposta
- `PaginatedProtocol<TInput, TOutput>` - Para protocolos com paginação

#### Reorganização Completa
- ✅ Todos os protocolos movidos para `/src/actions`
- ✅ Diretório `/src/protocols` removido
- ✅ Diretório `/src/utils` removido (ServerStatus → actions)
- ✅ RoleService e RoleActions removidos (desnecessários)

#### Métodos Estáticos Intuitivos
- RPCs: `.fetch(host, port, input)`
- Fire-and-Forget: `.send(host, port, params)`
- Paginados: `.fetchPage()` e `.fetchAll()`

### 🗑️ Removido

#### Código
- `GameConnection` - Não mais necessário
- `RoleService` - Camada intermediária removida
- `RoleActions` - Duplicação desnecessária
- `/src/utils/` - Movido para actions
- `/src/protocols/` - Consolidado em actions

#### Documentação Obsoleta
- `/docs/` - Documentação antiga removida
- `/examples/` - Exemplos desatualizados removidos
- `LIMPEZA-E-REORGANIZACAO.md` - Temporário
- `REFATORACAO-COMPLETA.md` - Temporário

### 🧪 Testes

- ✅ **17 arquivos de teste** (45 testes)
- ✅ **100% passando**
- ✅ Todos atualizados para nova arquitetura
- ✅ Zero dependência de GameConnection

### 📦 Actions Disponíveis

#### RPCs (29400 - GAMEDBD)
- `GetRoleBase`
- `GetRoleStatus`
- `GetRoleBaseStatus`
- `GetRolePocket`
- `GetRoleEquipment`
- `GetRoleStorehouse`
- `GetUserRoles`
- `GetFactionInfo`
- `GetUserFaction`
- `RenameRole`
- `ClearStorehousePasswd`
- `ForbidUser`

#### RPCs (29100 - GDELIVERYD)
- `SendMail`

#### Protocolos GM (29300 - GPROVIDER)
- `GMBanRole`
- `GMMuteRole`
- `ChatBroadcast`
- `GMListOnlineUser`

#### Utilities
- `ServerStatus`

### 🔧 Migration Guide v1.x → v2.0

#### GetRoleBase
```typescript
// v1.x
const connection = new GameConnection('127.0.0.1', 29400);
const rpc = await connection.call(new GetRoleBase({ roleId: 1073 }));
if (rpc.output.retcode === 0) {
  console.log(rpc.output.base.name);
}

// v2.0
const result = await GetRoleBase.fetch('127.0.0.1', 29400, { roleId: 1073 });
if (result.retcode === 0) {
  console.log(result.base.name);
}
```

#### GMBanRole
```typescript
// v1.x
const connection = new GameConnection('127.0.0.1', 29300);
await connection.sendProtocol(new GMBanRole({
  gmroleid: 1024,
  type: 100,
  forbid_time: 3600,
  reason: 'Test',
  roleid: 2048,
}));

// v2.0
await GMBanRole.send('127.0.0.1', 29300, {
  gmroleid: 1024,
  type: 100,
  forbid_time: 3600,
  reason: 'Test',
  roleid: 2048,
});
```

#### SendMail
```typescript
// v1.x
const connection = new GameConnection('127.0.0.1', 29100);
const rpc = await connection.call(new SendMail({
  tid: Date.now(),
  sysid: 32,
  // ...
}));

// v2.0
const result = await SendMail.fetch('127.0.0.1', 29100, {
  tid: Date.now(),
  sysid: 32,
  // ...
});
```

---

## [1.0.0] - 2025-10-14

### Initial Release

- ✅ Estrutura base do projeto TypeScript
- ✅ BufferWriter/BufferReader com Big-Endian
- ✅ Suporte a CompactUINT
- ✅ Strings UTF-16LE
- ✅ Classes Protocol e Rpc base
- ✅ GameConnection (antigo GameClient)
- ✅ RPCs implementados
- ✅ Testes de integração
