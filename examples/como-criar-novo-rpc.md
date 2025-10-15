# 📖 Como Criar um Novo RPC

Este guia mostra como adicionar novos RPCs à aplicação, baseado no `rpcalls.xml`.

## Passo 1: Encontrar o RPC em rpcalls.xml

Exemplo: Vamos criar o RPC `GetRoleList` (listar personagens de uma conta)

```xml
<!-- Em cnet/rpcalls.xml -->
<rpcdata name="RoleList">
    <variable name="count" type="CUInt"/>
    <variable name="id" type="int"/>
    <variable name="name" type="Octets" attr="ref"/>
</rpcdata>

<rpc name="GetRoleList" 
     type="3401" 
     argument="UserId" 
     result="RoleListRes" 
     maxsize="8192"/>
```

## Passo 2: Criar o arquivo do RPC

Crie `src/protocol/GetRoleList.ts`:

```typescript
import { Rpc } from './Protocol';
import { BufferWriter } from './BufferWriter';
import { BufferReader } from './BufferReader';

/**
 * Interface para um item da lista de personagens
 */
export interface RoleListItem {
  id: number;
  name: string;
}

/**
 * RPC GetRoleList - Type 0xD49 (3401 decimal)
 * Lista personagens de uma conta
 */
export class GetRoleList extends Rpc {
  // Argumento
  private userId: number = 0;

  // Resultado
  private retcode: number = -1;
  private roles: RoleListItem[] = [];

  constructor() {
    super(0xD49); // Type do GetRoleList
  }

  /**
   * Define o ID do usuário
   */
  setUserId(userId: number): void {
    this.userId = userId;
  }

  /**
   * Retorna o código de retorno
   */
  getRetcode(): number {
    return this.retcode;
  }

  /**
   * Retorna a lista de personagens
   */
  getRoles(): RoleListItem[] {
    return this.roles;
  }

  /**
   * Serializa o argumento (UserId)
   */
  marshalArgument(writer: BufferWriter): void {
    writer.writeUInt32BE(-1);        // localsid (sempre -1)
    writer.writeUInt32BE(this.userId); // userId
  }

  /**
   * Deserializa o resultado (RoleListRes)
   */
  unmarshalResult(reader: BufferReader): void {
    // Lê o retcode
    this.retcode = reader.readUInt32BE();

    if (this.retcode === 0 && reader.hasMore()) {
      // Lê o array de personagens
      const count = reader.readCompactUINT();
      
      for (let i = 0; i < count; i++) {
        const role: RoleListItem = {
          id: reader.readUInt32BE(),
          name: reader.readString()
        };
        this.roles.push(role);
      }
    }
  }
}
```

## Passo 3: Exportar no index.ts

Adicione ao `src/index.ts`:

```typescript
export { GetRoleList } from './protocol/GetRoleList';
export type { RoleListItem } from './protocol/GetRoleList';
```

## Passo 4: Criar exemplo de uso

Crie `examples/exemplo-get-role-list.ts`:

```typescript
import { GameConnection, GetRoleList, getServerConfig } from '../src';

async function exemplo() {
  const USER_ID = 32;  // ID do usuário
  
  const config = getServerConfig('GAMEDBD');
  const client = new GameConnection(config.host, config.port);
  
  try {
    await client.connect();
    
    const rpc = new GetRoleList();
    rpc.setUserId(USER_ID);
    
    const result = await client.call(rpc);
    
    if (result.getRetcode() === 0) {
      const roles = result.getRoles();
      
      console.log(`Personagens da conta ${USER_ID}:`);
      roles.forEach(role => {
        console.log(`  [${role.id}] ${role.name}`);
      });
    }
    
  } finally {
    client.disconnect();
  }
}

exemplo();
```

## Mapeamento de Tipos

### XML → TypeScript

| Tipo XML | BufferWriter | BufferReader | TypeScript |
|----------|--------------|--------------|------------|
| `char`, `byte` | `writeInt8()` / `writeUInt8()` | `readInt8()` / `readUInt8()` | `number` |
| `short` | `writeInt16BE()` | `readInt16BE()` | `number` |
| `int`, `unsigned int` | `writeInt32BE()` / `writeUInt32BE()` | `readInt32BE()` / `readUInt32BE()` | `number` |
| `float` | `writeFloatBE()` | `readFloatBE()` | `number` |
| `double` | `writeDoubleBE()` | `readDoubleBE()` | `number` |
| `CUInt` | `writeCompactUINT()` | `readCompactUINT()` | `number` |
| `Octets` | `writeOctets()` | `readOctets()` | `Buffer` |
| `String` | `writeString()` | `readString()` | `string` |

### Arrays

Para arrays no XML:

```xml
<variable name="items" type="Array">
    <item name="id" type="int"/>
    <item name="count" type="int"/>
</variable>
```

No TypeScript:

```typescript
// Marshal (escrever)
const items = [{ id: 1, count: 5 }, { id: 2, count: 3 }];
writer.writeCompactUINT(items.length);
for (const item of items) {
  writer.writeUInt32BE(item.id);
  writer.writeUInt32BE(item.count);
}

// Unmarshal (ler)
const count = reader.readCompactUINT();
const items = [];
for (let i = 0; i < count; i++) {
  items.push({
    id: reader.readUInt32BE(),
    count: reader.readUInt32BE()
  });
}
```

## Checklist para Novo RPC

- [ ] Encontrar definição em `rpcalls.xml`
- [ ] Anotar o opcode (type) - converter para hex se necessário
- [ ] Anotar a porta do serviço
- [ ] Identificar argumentos e tipos
- [ ] Identificar resultado e tipos
- [ ] Criar arquivo TypeScript do RPC
- [ ] Implementar `marshalArgument()`
- [ ] Implementar `unmarshalResult()`
- [ ] Exportar no `index.ts`
- [ ] Criar exemplo de uso
- [ ] Testar conexão
- [ ] Documentar

## Dicas

### 1. Sempre use -1 para localsid
```typescript
writer.writeUInt32BE(-1); // localsid
```

### 2. Números negativos
Para escrever -1 como unsigned:
```typescript
writer.writeUInt32BE(-1); // Será 0xFFFFFFFF
```

### 3. Strings são UTF-16LE
```typescript
writer.writeString("Nome"); // Automaticamente converte para UTF-16LE
```

### 4. CompactUINT para tamanhos
```typescript
// Tamanho de array
writer.writeCompactUINT(array.length);

// Tamanho de octets
writer.writeCompactUINT(buffer.length);
writer.writeBuffer(buffer);
```

### 5. Verificar se há mais dados
```typescript
if (reader.hasMore()) {
  // Lê campos opcionais
}
```

## Referências

- `cnet/rpcalls.xml` - Definições de todos os RPCs
- `pwTools-reference/` - Exemplos em JavaScript
- `src/protocol/GetRoleInfo.ts` - Exemplo completo
- `PROTOCOLO.md` - Detalhes técnicos

## Próximos RPCs Úteis

1. **GetUser** (0xBBA) - Informações da conta
2. **PutRole** - Salvar personagem
3. **GetRoleGuild** (0x11FF) - Guild do personagem
4. **SendMail** - Enviar correio
5. **GetOnlineList** - Jogadores online

