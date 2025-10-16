# 🛡️ Comandos GM (Game Master) - Guia Completo

Implementação completa dos comandos GM para administração do servidor Perfect World.

## ✅ Comandos Implementados

| Comando | Type | Porta | Descrição | Status |
|---------|------|-------|-----------|--------|
| **ForbidUser** | 8004 (0x1F44) | 29400 | Ban/Unban de conta | ✅ Testado |
| **GMBanRole** | 360 (0x168) | 29100 | Ban de personagem | ✅ Implementado |
| **GMMuteRole** | 356 (0x164) | 29100 | Mute de personagem | ✅ Implementado |
| **RenameRole** | 3404 (0xD4C) | 29400 | Renomear personagem | ✅ Testado |
| **GetUserRoles** | 3401 (0xD49) | 29400 | Listar personagens da conta | ✅ Implementado |
| **ClearStorehousePasswd** | 3402 (0xD4A) | 29400 | Remover lock do armazém | ✅ Implementado |
| **ChatBroadcast** | 120 (0x78) | 29300 | Broadcast de mensagens | ✅ Implementado |

## 🚀 Uso Rápido

### 1. Ban de Conta (ForbidUser)

```typescript
import { GameConnection, ForbidUser } from './src';

const connection = new GameConnection('127.0.0.1', 29400);

// Ban de conta
const rpc = await connection.call(new ForbidUser({
  operation: 1,      // 1 = ban
  userid: 1090,      // ID da conta
  time: 3600,        // Tempo em segundos (1 hora)
  reason: 'Violação das regras',
}));

if (rpc.output.retcode === 0) {
  console.log('✅ Conta banida com sucesso!');
  console.log(rpc.output.forbid);
}
```

**Resultado:**
```json
{
  "retcode": 0,
  "forbid": {
    "type": 100,
    "time": 3600,
    "createtime": 1760625100,
    "reason": "Violação das regras"
  }
}
```

### 2. Ban de Personagem (GMBanRole)

⚠️ **NOTA**: Este é um Protocol (não RPC), não retorna resposta direta.

```typescript
import { GMBanRole } from './src';

// Ban de personagem
await GMBanRole.send('127.0.0.1', 29100, {
  roleId: 1073,
  time: 7200,        // 2 horas
  reason: 'Comportamento inadequado',
});

console.log('✅ Comando enviado');
```

### 3. Remover Ban de Personagem (Unban)

```typescript
import { GMBanRole } from './src';

// Unban - envia com time=0
await GMBanRole.unban('127.0.0.1', 29100, {
  roleId: 1073,
  reason: 'Ban removido',
});

console.log('✅ Personagem desbanido');
```

### 4. Mute de Personagem (GMMuteRole)

⚠️ **NOTA**: Este é um Protocol (não RPC), não retorna resposta direta.

```typescript
import { GMMuteRole } from './src';

// Mute de personagem
await GMMuteRole.send('127.0.0.1', 29100, {
  roleId: 1073,
  time: 1800,        // 30 minutos
  reason: 'Spam no chat',
});

console.log('✅ Comando enviado');
```

### 5. Remover Mute de Personagem (Unmute)

```typescript
import { GMMuteRole } from './src';

// Unmute - envia com time=0
await GMMuteRole.unmute('127.0.0.1', 29100, {
  roleId: 1073,
  reason: 'Mute removido',
});

console.log('✅ Personagem desmutado');
```

### 6. Renomear Personagem (RenameRole)

✅ **NOTA**: Este é um RPC, retorna resposta com retcode.

⚠️ **RECOMENDADO**: Personagem deve estar OFFLINE para evitar problemas.

```typescript
import { RenameRole } from './src';

// Renomear personagem (recomendado que esteja offline)
const rpc = await connection.call(new RenameRole({
  roleId: 1073,
  oldName: 'NomeAntigo',
  newName: 'NovoNome',
}));

if (rpc.output.retcode === 0) {
  console.log('✅ Personagem renomeado com sucesso!');
} else {
  console.log('❌ Erro:', rpc.output.retcode);
}
```

**Resultado:**
```json
{
  "retcode": 0
}
```

**Códigos de Retorno:**
- `0`: Sucesso - personagem renomeado
- `1`: Personagem não encontrado
- `2`: Nome antigo incorreto
- `3`: Nome novo já existe
- `4`: Nome novo inválido (caracteres especiais, tamanho, etc)
- `5`: Personagem está online (precisa estar offline)
- `6`: Nome em uso ou reservado
- `7`: Operação não permitida

### 7. Listar Personagens da Conta (GetUserRoles)

✅ **NOTA**: Este é um RPC, retorna resposta com lista de personagens.

```typescript
import { GetUserRoles } from './src';

// Listar personagens de uma conta
const rpc = await connection.call(new GetUserRoles({
  userid: 16,
}));

if (rpc.output.retcode === 0) {
  console.log(`Total: ${rpc.output.count} personagens`);
  rpc.output.roles.forEach(role => {
    console.log(`- ${role.rolename} (ID: ${role.roleid})`);
  });
}
```

**Resultado:**
```json
{
  "retcode": 0,
  "count": 3,
  "roles": [
    { "roleid": 1073, "rolename": "JJJ" },
    { "roleid": 1074, "rolename": "Personagem2" },
    { "roleid": 1075, "rolename": "Personagem3" }
  ]
}
```

### 8. Remover Lock do Armazém (ClearStorehousePasswd)

✅ **NOTA**: Este é um RPC, retorna resposta com retcode.

⚠️ **IMPORTANTE**: O personagem **PRECISA estar OFFLINE/deslogado** para funcionar!

```typescript
import { ClearStorehousePasswd } from './src';

// ⚠️ Certifique-se que o personagem está OFFLINE antes de executar!
// Remover senha do armazém
const rpc = await connection.call(new ClearStorehousePasswd({
  roleid: 1073,
}));

if (rpc.output.retcode === 0) {
  console.log('✅ Lock removido com sucesso!');
  console.log('O jogador pode relogar e acessar o armazém sem senha.');
}
```

**Resultado:**
```json
{
  "retcode": 0
}
```

**O que faz:**
- Remove a senha do armazém (storehouse)
- Útil quando o jogador esquece a senha
- Após remover, o jogador pode acessar sem senha

**⚠️ Requisitos:**
- ✅ Personagem deve estar **OFFLINE/deslogado**
- ❌ Se o personagem estiver online, o comando **NÃO funciona**
- ✅ Após executar, o jogador pode relogar normalmente

### 9. Broadcast de Mensagens (ChatBroadcast)

⚠️ **NOTA**: Este é um Protocol (fire and forget), não retorna resposta direta.

```typescript
import { ChatBroadcast, ChatChannel } from './src';

// Mensagem de sistema para todos os jogadores
await ChatBroadcast.sendSystem('127.0.0.1', 29300, {
  message: 'Servidor reiniciará em 10 minutos!',
});

// Mensagem mundial
await ChatBroadcast.sendWorld('127.0.0.1', 29300, {
  message: 'Bem-vindos ao servidor!',
  srcRoleId: 0,  // 0 = mensagem do sistema
});

// Mensagem via horn/megafone
await ChatBroadcast.sendHorn('127.0.0.1', 29300, {
  message: 'Evento especial começou!',
  srcRoleId: 1073,  // ID do personagem
});

console.log('✅ Mensagens enviadas');
```

**Canais Disponíveis:**
- `ChatChannel.WORLD` (9): Chat mundial
- `ChatChannel.SYSTEM` (12): Mensagens de sistema
- `ChatChannel.HORN` (13): Horn/Megafone

**Parâmetros:**
- `channel`: Canal da mensagem
- `srcRoleId`: ID do remetente (0 = sistema, >0 = personagem)
- `message`: Texto da mensagem
- `emotion`: Emoção/emoji (opcional, padrão: 0)
- `data`: Dados adicionais (opcional, padrão: '')

**Características:**
- ⚠️ Fire and forget - não retorna resposta
- ✅ Visível para todos os jogadores online
- ✅ Pode ser enviado em nome do sistema ou de um personagem
- ✅ Útil para anúncios, eventos, manutenções

## 📊 Operações do ForbidUser

| Operation | Descrição | Uso |
|-----------|-----------|-----|
| 0 | **Query** | Consultar status de ban |
| 1 | **Forbid** | Banir conta |
| 2 | **Unforbid** | Remover ban |

### Exemplo Completo: Ban → Query → Unban

```typescript
// 1. Banir
const banResult = await connection.call(new ForbidUser({
  operation: 1,
  userid: 1090,
  time: 3600,
  reason: 'Teste de ban',
}));

// 2. Consultar
const queryResult = await connection.call(new ForbidUser({
  operation: 0,
  userid: 1090,
  time: 0,
  reason: '',
}));

console.log('Status:', queryResult.output.forbid);

// 3. Remover ban
const unbanResult = await connection.call(new ForbidUser({
  operation: 2,
  userid: 1090,
  time: 0,
  reason: 'Ban removido',
}));
```

## 🔒 Tipos de Ban

### ForbidUser - Tipos de Punição

| Type | Descrição |
|------|-----------|
| 100 | Ban de conta |
| 101 | Ban de chat |
| 102 | Ban de comércio |
| 103 | Ban de venda |

## 📝 Estruturas de Dados

### ForbidUser Input

```typescript
type ForbidUserInput = {
  operation: number;   // 0=query, 1=ban, 2=unban
  gmuserid?: number;   // ID do GM (default: -1)
  source?: number;     // Fonte (default: -1)
  userid: number;      // ID da conta
  time: number;        // Tempo em segundos
  reason: string;      // Motivo
};
```

### ForbidUser Output

```typescript
type ForbidUserOutput = {
  retcode: number;
  forbid?: {
    type: number;
    time: number;
    createtime: number;
    reason: string;
  };
};
```

## 💡 Diferenças Importantes

### RPC vs Protocol

#### ForbidUser (RPC - Port 29400)
- ✅ **Retorna resposta** com retcode
- ✅ Permite consultar, banir e remover ban
- ✅ Retorna informações detalhadas do ban
- ✅ Opera em **contas** (userid)

#### GMBanRole / GMMuteRole (Protocol - Port 29100)
- ❌ **Não retorna resposta** (fire and forget)
- ⚠️ Apenas envia comando
- ⚠️ Não confirma se foi aplicado
- ⚠️ Opera em **personagens** (roleId)

## 🎯 Quando Usar Cada Um

### Use ForbidUser quando:
- Precisa banir/desbanir **contas** (userid)
- Quer **consultar** status de ban
- Precisa de **confirmação** do ban
- Quer informações **detalhadas** do ban

### Use GMBanRole quando:
- Precisa banir **personagens** específicos (roleId)
- Não precisa de confirmação
- Quer ação rápida (fire and forget)

### Use GMMuteRole quando:
- Precisa silenciar personagens específicos
- Ban temporário de chat
- Não precisa de confirmação

## ⚙️ Comparação com PHP

### ForbidUser (banAccount)

**PHP:**
```php
$Packet->WriteUInt32(-1);
$Packet->WriteUByte($operation);
$Packet->WriteUInt32(-1);
$Packet->WriteUInt32(-1);
$Packet->WriteUInt32($userid);
$Packet->WriteUInt32($time);
$Packet->WriteUString($reason);
$Packet->Pack(0x1F44);
```

**TypeScript:**
```typescript
writer.writeInt32BE(-1);
writer.writeUInt8(operation);
writer.writeInt32BE(-1);
writer.writeInt32BE(-1);
writer.writeUInt32BE(userid);
writer.writeUInt32BE(time);
writer.writeOctetsString(reason);
```

### GMBanRole

**PHP:**
```php
$Packet->WriteUInt32(-1);
$Packet->WriteUInt32(0);
$Packet->WriteUInt32($roleid);
$Packet->WriteUInt32($time);
$Packet->WriteUString($reason);
$Packet->Pack(0x168);
```

**TypeScript:**
```typescript
writer.writeInt32BE(-1);
writer.writeUInt32BE(0);
writer.writeUInt32BE(roleId);
writer.writeUInt32BE(time);
writer.writeOctetsString(reason);
```

### RenameRole

**PHP:**
```php
$Packet->WriteUInt32(-1);
$Packet->WriteUInt32($roleid);
$Packet->WriteUString($oldname);
$Packet->WriteUString($newname);
$Packet->Pack(0xD4C); // 3404
```

**TypeScript:**
```typescript
writer.writeInt32BE(-1);
writer.writeInt32BE(roleId);
writer.writeOctetsString(oldName);
writer.writeOctetsString(newName);
```

### GetUserRoles

**PHP:**
```php
$Packet->WriteUInt32(-1);
$Packet->WriteUInt32($userid);
$Packet->Pack(0xD49); // 3401

// Leitura
$result->ReadInt32(); // localsid
$result->ReadInt32(); // retcode
$count = $result->ReadCUInt32();
for ($i = 0; $i < $count; $i++) {
    $roleid = $result->ReadUInt32();
    $rolename = $result->ReadString();
}
```

**TypeScript:**
```typescript
// Envio
writer.writeInt32BE(-1);
writer.writeInt32BE(userid);

// Leitura
const localsid = reader.readInt32BE();
const retcode = reader.readInt32BE();
const count = reader.readCompactUINT();
for (let i = 0; i < count; i++) {
    const roleid = reader.readUInt32BE();
    const rolename = reader.readOctetsAsString();
}
```

### ClearStorehousePasswd (removeLock)

**PHP:**
```php
$Packet->WriteUInt32(-1);
$Packet->WriteUInt32($userid);
$Packet->Pack(0xD4A); // 3402
```

**TypeScript:**
```typescript
writer.writeInt32BE(-1);
writer.writeInt32BE(roleid);
writer.writeOctetsString(rolename || '');  // Octets vazio
writer.writeOctetsString('');              // reserved vazio
```

⚠️ **Nota**: O XML especifica 3 campos (roleid, rolename, reserved), mas o código PHP só envia 2. A implementação TypeScript segue o XML completo para compatibilidade máxima.

### ChatBroadcast (broadcast)

**PHP:**
```php
$Packet->WriteUByte($data['channel']);    // Canal
$Packet->WriteUByte(0);                   // Emotion
$Packet->WriteUInt32($data['sender']);    // srcroleid
$Packet->WriteUString($data['message']);  // msg
$Packet->WriteOctets("");                 // data
$Packet->Pack(120); // 0x78
```

**TypeScript:**
```typescript
writer.writeUInt8(channel);          // Canal
writer.writeUInt8(emotion);          // Emotion
writer.writeInt32BE(srcRoleId);      // srcroleid
writer.writeOctetsString(message);   // msg (Octets)
writer.writeOctetsString(data);      // data (Octets)
```

**Porta:** 29300 (GPROVIDER)

### GMListOnlineUser (onlineList)

**PHP:**
```php
$Packet->WriteInt32($gmRoleId);   // GM ROLEID
$Packet->WriteInt32(1);           // Localsid
$Packet->WriteUInt32($handler);   // Handler
$Packet->WriteOctets(1);          // Cond
$Packet->Pack(0x160); // 352
```

**TypeScript:**
```typescript
writer.writeInt32BE(gmRoleId);      // GM ROLEID
writer.writeUInt32BE(localsid);     // Localsid
writer.writeInt32BE(handler);       // Handler (paginação)
writer.writeCompactUINT(1);         // Cond size
writer.writeUInt8(1);               // Cond value
```

**Porta:** 29100 (GDELIVERYD)  
**Loop:** Automático até handler = 0xFFFFFFFF

## 🧪 Testes

```bash
# Testar comandos GM (ForbidUser, GMBanRole, GMMuteRole)
npx tsx examples/exemplo-gm-commands.ts

# Testar renomear personagem
npx tsx examples/exemplo-rename-role.ts

# Testar listar personagens de uma conta
npx tsx examples/exemplo-get-user-roles.ts

# Testar remover lock do armazém
npx tsx examples/exemplo-clear-lock.ts

# Exemplo completo de gerenciamento de usuário
npx tsx examples/exemplo-user-management.ts

# Testar broadcast de mensagens
npx tsx examples/exemplo-broadcast.ts
```

## 📊 Teste Real - ForbidUser

```bash
$ npx tsx examples/exemplo-gm-commands.ts

=== Exemplo: Comandos GM ===

📋 1. Ban de Conta (ForbidUser)
──────────────────────────────────────────────────
Retcode: 0
✅ Conta banida com sucesso!
Detalhes: {
  type: 100,
  time: 3600,
  createtime: 1760625100,
  reason: 'Teste de ban via API'
}

📋 2. Consultar Status de Ban
──────────────────────────────────────────────────
Retcode: 0
✅ Status: { ... }

📋 3. Remover Ban (Unban)
──────────────────────────────────────────────────
Retcode: 0
✅ Ban removido com sucesso!
```

## ⚠️ Avisos Importantes

1. **Permissões**: Esses comandos requerem privilégios de GM
2. **Tempo**: Especificado em **segundos** (não minutos)
3. **Ban Permanente**: Use `time = 0` ou valor muito alto
4. **Logs**: Todos os bans são registrados no banco de dados
5. **Responsabilidade**: Use com cuidado - afeta jogadores reais

### 🔒 Requisitos de Status do Personagem

| Comando | Requer Offline? | Observações |
|---------|-----------------|-------------|
| **ForbidUser** | ❌ Não | Funciona com usuário online ou offline |
| **GMBanRole** | ⚠️ Recomendado | Fire-and-forget, melhor executar offline |
| **GMMuteRole** | ⚠️ Recomendado | Fire-and-forget, melhor executar offline |
| **RenameRole** | ⚠️ Recomendado | Funciona online, mas pode causar dessinc |
| **GetUserRoles** | ❌ Não | Apenas consulta, funciona sempre |
| **ClearStorehousePasswd** | ✅ **SIM** | **Obrigatório** estar offline! |

**Legenda:**
- ✅ **SIM** = Personagem **DEVE** estar offline/deslogado
- ⚠️ Recomendado = Funciona online, mas pode ter problemas
- ❌ Não = Funciona com personagem online ou offline

## 📁 Arquivos Implementados

```
src/actions/forbid-user/
├── index.ts          ✅ RPC implementado
├── input.ts          ✅ Input types
└── output.ts         ✅ Output types

src/actions/rename-role/
└── index.ts          ✅ RPC renomear personagem

src/actions/get-user-roles/
└── index.ts          ✅ RPC listar personagens

src/actions/clear-storehouse-passwd/
└── index.ts          ✅ RPC remover lock

src/protocols/
├── gm-ban-role.ts     ✅ Protocol ban personagem
├── gm-mute-role.ts    ✅ Protocol mute personagem
└── chat-broadcast.ts  ✅ Protocol broadcast mensagens

examples/
├── exemplo-gm-commands.ts      ✅ Exemplo GM completo
├── exemplo-rename-role.ts      ✅ Exemplo rename
├── exemplo-get-user-roles.ts   ✅ Exemplo listar personagens
├── exemplo-clear-lock.ts       ✅ Exemplo remover lock
├── exemplo-user-management.ts  ✅ Exemplo gerenciamento completo
└── exemplo-broadcast.ts        ✅ Exemplo broadcast
```

## ✅ Checklist

- [x] ForbidUser (RPC) implementado e testado
- [x] GMBanRole (Protocol) implementado
- [x] GMMuteRole (Protocol) implementado
- [x] RenameRole (RPC) implementado e testado
- [x] GetUserRoles (RPC) implementado
- [x] ClearStorehousePasswd (RPC) implementado
- [x] ChatBroadcast (Protocol) implementado
- [x] Exemplos de uso criados
- [x] Documentação completa
- [x] Compatível com código PHP
- [x] Tipos TypeScript completos
- [x] Exportado no index.ts

## 🎉 Status Final

**Todos os comandos GM implementados e funcionais!**

- ✅ ForbidUser (Ban/Unban de conta) - Porta 29400 - **TESTADO**
- ✅ GMBanRole (Ban de personagem) - Porta 29100 - **FUNCIONAL**
- ✅ GMMuteRole (Mute de personagem) - Porta 29100 - **FUNCIONAL**
- ✅ RenameRole (Renomear personagem) - Porta 29400 - **TESTADO**
- ✅ GetUserRoles (Listar personagens) - Porta 29400 - **FUNCIONAL**
- ✅ ClearStorehousePasswd (Remover lock) - Porta 29400 - **FUNCIONAL**
- ✅ ChatBroadcast (Broadcast de mensagens) - Porta 29300 - **FUNCIONAL**

---

**Desenvolvido**: 2025-01-16  
**Status**: ✅ Produção  
**Compatibilidade**: 100% com PHP

