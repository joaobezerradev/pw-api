# 🏰 GetFactionInfo - Obter Informações da Facção

Implementação completa do RPC **GetFactionInfo** (type 4606) para obter informações detalhadas de uma facção (guild).

## ✅ Status: FUNCIONAL na porta 29400

Este RPC foi testado e **funciona corretamente** na porta 29400 (GAMEDBD).

## 📋 O que foi implementado

### RPC: GetFactionInfo
- **Type**: `0x11FE` (4606 decimal)
- **Porta**: 29400 (GAMEDBD)
- **Input**: `factionId` (ID da facção)
- **Output**: Informações completas da facção

### Estrutura de Dados Retornada

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

## 🚀 Como Usar

### Opção 1: RPC Direto

```typescript
import { GameConnection } from './src';
import { GetFactionInfo } from './src/actions/get-faction-info';

const connection = new GameConnection('127.0.0.1', 29400);

// Obter informações da facção pelo factionId
const rpc = await connection.call(new GetFactionInfo({ factionId: 1 }));

if (rpc.output.retcode === 0 && rpc.output.faction) {
  const faction = rpc.output.faction;
  console.log(`Facção: ${faction.name}`);
  console.log(`Membros: ${faction.count}`);
}
```

### Opção 2: Integração com RoleActions

Para obter a facção de um personagem, você precisa:
1. **Obter o factionId do personagem** (via banco de dados ou outro RPC)
2. **Chamar GetFactionInfo** com esse factionId

```typescript
// Exemplo conceitual (requer factionId)
async function getFactionByRole(roleId: number) {
  // 1. Obter factionId do personagem (do banco de dados)
  const factionId = await getFactionIdFromDatabase(roleId);
  
  // 2. Obter dados da facção
  const rpc = await connection.call(new GetFactionInfo({ factionId }));
  
  return rpc.output.faction;
}
```

## ⚠️ Limitação Importante

**GetFactionInfo requer o `factionId`, não o `roleId`.**

Os RPCs testados que recebem `roleId` não funcionaram:
- ❌ GetUserFaction (type 4607) - Não disponível nas portas testadas
- ❌ GetFactionBaseInfo - Sem resposta

### Solução Alternativa

Para obter a facção de um personagem, você tem duas opções:

#### 1. Consulta ao Banco de Dados (Recomendado)

```sql
SELECT factionid, factionrole 
FROM roles 
WHERE id = ?
```

Depois use `GetFactionInfo` com o `factionid` obtido.

#### 2. Cache Local

Mantenha um mapeamento `roleId → factionId` em cache para evitar consultas extras.

## 📁 Arquivos Implementados

```
src/actions/get-faction-info/
├── index.ts                      # Implementação do RPC
├── input.ts                      # Input type
├── output.ts                     # Output types
└── get-faction-info.spec.ts     # Testes

examples/
└── exemplo-get-faction-by-role.ts  # Exemplo de uso
```

## 🧪 Testes

```bash
# Rodar teste do RPC
npm test get-faction-info

# Rodar exemplo
npx tsx examples/exemplo-get-faction-by-role.ts
```

## 📊 Teste Real

```bash
$ npx tsx test-get-faction-info-correct.ts

=== Testando GetFactionInfo (como no PHP) ===

Consultando factionId: 1...

✅ Resultado:
{
  "fid": 1,
  "name": "asdasda",
  "level": 0,
  "masterid": 0,
  "masterrole": 2,
  "count": 0,
  "members": [],
  "announce": "",
  "sysinfo": ""
}
```

## 🔍 Comparação com PHP

O código TypeScript implementa exatamente o mesmo fluxo do código PHP fornecido:

### PHP
```php
$getfaction->WriteUInt32(-1);
$getfaction->WriteUInt32($factionid);
$getfaction->Pack(Opcodes::$role['getFaction']); // type 4606
```

### TypeScript
```typescript
marshalArgument(writer: BufferWriter): void {
  writer.writeInt32BE(-1);  // Primeiro parâmetro
  writer.writeUInt32BE(this.input.factionId);
}
```

## 📝 Notas Técnicas

1. **Descarte de Bytes**: O RPC retorna 2 UInt32 iniciais que precisam ser descartados antes de ler os dados da facção
2. **GMember Structure**: O master é representado por `masterid` + `masterrole`
3. **CompactUINT**: O count de membros usa CompactUINT encoding
4. **Strings**: Nome, announce e sysinfo são Octets (strings UTF-16LE)

## ✅ Integração no Projeto

Para adicionar ao `RoleActions`:

```typescript
import { GetFactionInfo } from './get-faction-info';

// Em RoleActions
async getFactionInfo(factionId: number) {
  const rpc = await this.connection.call(
    new GetFactionInfo({ factionId })
  );
  return {
    retcode: rpc.output.retcode,
    data: rpc.output.faction,
  };
}
```

## 🎯 Resumo

| Item | Status |
|------|--------|
| RPC Implementado | ✅ GetFactionInfo (4606) |
| Porta Funcionando | ✅ 29400 (GAMEDBD) |
| Testes | ✅ Passando |
| Documentação | ✅ Completa |
| Exemplo | ✅ Incluído |
| Integração com código PHP | ✅ Compatível |

**Status Final**: ✅ **COMPLETO E FUNCIONAL**

