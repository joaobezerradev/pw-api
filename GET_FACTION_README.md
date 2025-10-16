# 🏰 RPCs de Facção - Guia Completo

Implementação completa dos RPCs de facção (guild) para Perfect World.

## ✅ Status: AMBOS FUNCIONANDO na porta 29400!

| RPC | Type | Entrada | Saída | Status |
|-----|------|---------|-------|--------|
| **GetUserFaction** | 4607 (0x11FF) | roleId | Dados da facção do personagem | ✅ Funcional |
| **GetFactionInfo** | 4606 (0x11FE) | factionId | Informações completas da facção | ✅ Funcional |

## 🚀 Uso Rápido

### GetUserFaction - Obter facção pelo RoleId

```typescript
import { GameConnection, GetUserFaction } from './src';

const connection = new GameConnection('127.0.0.1', 29400);

const rpc = await connection.call(new GetUserFaction({ roleId: 1073 }));

if (rpc.output.faction) {
  console.log(`Personagem: ${rpc.output.faction.name}`);
  console.log(`Facção ID: ${rpc.output.faction.factionid}`);
  console.log(`Cargo: ${rpc.output.faction.role}`);
}
```

**Retorna:**
```json
{
  "roleid": 1073,
  "name": "JJJ",
  "factionid": 11,
  "cls": 0,
  "role": 2,
  "nickname": ""
}
```

### GetFactionInfo - Obter informações da facção

```typescript
import { GameConnection, GetFactionInfo } from './src';

const connection = new GameConnection('127.0.0.1', 29400);

const rpc = await connection.call(new GetFactionInfo({ factionId: 11 }));

if (rpc.output.faction) {
  console.log(`Nome: ${rpc.output.faction.name}`);
  console.log(`Membros: ${rpc.output.faction.count}`);
  console.log(`Líder: ${rpc.output.faction.masterid}`);
}
```

**Retorna:**
```json
{
  "fid": 11,
  "name": "aaa",
  "level": 0,
  "masterid": 1073,
  "count": 1,
  "members": [...],
  "announce": "...",
  "sysinfo": "..."
}
```

## 🔗 Fluxo Completo (2 Etapas)

Para obter todas as informações da facção de um personagem:

```typescript
// 1. Obter facção do personagem
const userFaction = await connection.call(new GetUserFaction({ roleId: 1073 }));
const factionId = userFaction.output.faction?.factionid;

// 2. Obter dados completos da facção
if (factionId) {
  const faction = await connection.call(new GetFactionInfo({ factionId }));
  console.log(faction.output.faction);
}
```

## 📊 Diferença entre os RPCs

### GetUserFaction
- **Entrada**: `roleId` (ID do personagem)
- **Retorna**: Dados básicos do personagem na facção
- **Use quando**: Quiser saber qual facção o personagem pertence

### GetFactionInfo
- **Entrada**: `factionId` (ID da facção)
- **Retorna**: Informações completas da facção
- **Use quando**: Quiser detalhes completos da guild (membros, líder, anúncios)

## 🔍 Estruturas de Dados

### UserFaction (GetUserFaction)

```typescript
type UserFaction = {
  unk1: number;           // Campo desconhecido (geralmente 2147483647)
  unk2: number;           // Campo desconhecido (geralmente 0)
  roleid: number;         // ID do personagem
  name: string;           // Nome do personagem
  factionid: number;      // ID da facção (0 = sem facção)
  cls: number;            // Classe do personagem
  role: number;           // Cargo na facção
  delayexpel: Buffer;     // Dados de expulsão
  extend: Buffer;         // Dados estendidos
  nickname: string;       // Apelido na facção
};
```

### FactionInfo (GetFactionInfo)

```typescript
type FactionInfo = {
  fid: number;            // ID da facção
  name: string;           // Nome da facção
  level: number;          // Level da facção
  masterid: number;       // ID do líder
  masterrole: number;     // Cargo do líder
  count: number;          // Total de membros
  members: Array<{        // Lista de membros
    memberid: number;
    memberrole: number;
  }>;
  announce: string;       // Anúncio da facção
  sysinfo: string;        // Informações do sistema
};
```

## 💡 Detalhes Técnicos Importantes

### GetUserFaction - 3 Parâmetros!

**IMPORTANTE**: Este RPC requer **3 parâmetros** (não 2 como outros RPCs):

```typescript
marshalArgument(writer: BufferWriter): void {
  writer.writeInt32BE(-1);      // Parâmetro 1
  writer.writeUInt32BE(1);       // Parâmetro 2 (OBRIGATÓRIO!)
  writer.writeUInt32BE(roleId);  // Parâmetro 3
}
```

Se enviar apenas 2 parâmetros, o servidor fecha a conexão.

### GetFactionInfo - Descarte de Bytes

Este RPC retorna 2 UInt32 iniciais que devem ser descartados:

```typescript
unmarshalResult(reader: BufferReader): void {
  reader.readUInt32BE();  // Descartar
  reader.readUInt32BE();  // Descartar
  // Agora ler a estrutura GFactionInfo
  const fid = reader.readUInt32BE();
  // ...
}
```

## 🧪 Testes

```bash
# Testar GetUserFaction
npm test get-user-faction

# Testar GetFactionInfo
npm test get-faction-info

# Rodar todos os testes de facção
npm test faction
```

## 📁 Exemplos

```bash
# Exemplo GetUserFaction
npx tsx examples/exemplo-get-user-faction.ts

# Exemplo GetFactionInfo
npx tsx examples/exemplo-get-faction-by-role.ts
```

## 🎯 Cargos na Facção (role)

| Valor | Cargo |
|-------|-------|
| 0 | Membro |
| 1 | Veterano |
| 2 | Comandante/Diretor |
| 3 | Vice-Líder |
| 4 | Líder |

*(Os valores podem variar dependendo da configuração do servidor)*

## ⚙️ Comparação com PHP

### GetUserFaction

**PHP:**
```php
$getfaction->WriteUInt32(-1);
$getfaction->WriteUInt32(1);
$getfaction->WriteUInt32($roleid);
$getfaction->Pack(Opcodes::$role['getUserFaction']);
```

**TypeScript:**
```typescript
writer.writeInt32BE(-1);
writer.writeUInt32BE(1);
writer.writeUInt32BE(this.input.roleId);
```

### GetFactionInfo

**PHP:**
```php
$getfaction->WriteUInt32(-1);
$getfaction->WriteUInt32($factionid);
$getfaction->Pack(Opcodes::$role['getFaction']);
```

**TypeScript:**
```typescript
writer.writeInt32BE(-1);
writer.writeUInt32BE(this.input.factionId);
```

## 📊 Testes Reais

### GetUserFaction

```bash
$ npx tsx test-user-faction-final.ts

✅ SUCESSO! Dados obtidos:
{
  "roleid": 1073,
  "name": "JJJ",
  "factionid": 11,
  "cls": 0,
  "role": 2,
  "nickname": ""
}
```

### GetFactionInfo

```bash
$ npx tsx test-get-faction-info-correct.ts

✅ Resultado:
{
  "fid": 11,
  "name": "aaa",
  "level": 0,
  "masterid": 1073,
  "count": 1,
  "members": [...],
  "announce": "..."
}
```

## ✅ Checklist de Implementação

- [x] GetUserFaction implementado
- [x] GetFactionInfo implementado
- [x] Testes criados e passando
- [x] Exemplos funcionais
- [x] Documentação completa
- [x] Tipos TypeScript completos
- [x] Compatível com código PHP
- [x] Exportado no index.ts

## 🎉 Status Final

**Ambos os RPCs estão 100% funcionais e testados!**

- ✅ GetUserFaction (porta 29400)
- ✅ GetFactionInfo (porta 29400)
- ✅ 4/4 testes passando
- ✅ Exemplos funcionando
- ✅ Compatível com implementação PHP

---

**Desenvolvido e testado em**: 2025-01-16  
**Porta**: 29400 (GAMEDBD)  
**Status**: ✅ Produção

