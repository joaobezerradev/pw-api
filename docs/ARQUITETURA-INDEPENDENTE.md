# Arquitetura de Protocolos Independentes

## Visão Geral

Os protocolos foram refatorados para serem **completamente independentes**, não mais dependendo do `GameConnection` ou de gerenciamento centralizado de XID. Cada protocolo agora gerencia sua própria conexão TCP.

## Vantagens

### 1. **Simplicidade**
- Cada protocolo é autocontido
- Não precisa instanciar `GameConnection`
- Uso direto com métodos estáticos

### 2. **Liberdade**
- Não há dependências entre protocolos
- Cada protocolo define seu próprio comportamento
- Fácil de adicionar novos protocolos

### 3. **Clareza**
- O código do protocolo está todo em um lugar
- Lógica de conexão visível e modificável
- Documentação inline com exemplos

## Padrões de Protocolo

### Protocolo Fire-and-Forget (sem resposta)

Usado para: `ChatBroadcast`, `GMMuteRole`, `GMBanRole`, etc.

```typescript
import { GMMuteRole } from './src';

// Mutar um personagem por 24 horas
await GMMuteRole.send('127.0.0.1', 29100, {
  roleId: 1024,
  time: 86400,  // 24 horas em segundos
  reason: 'Comportamento inadequado'
});

// Desmutar
await GMMuteRole.unmute('127.0.0.1', 29100, {
  roleId: 1024,
  reason: 'Apelação aceita'
});
```

**Características:**
- Método `send()` ou similar
- Não aguarda resposta
- Conexão fecha imediatamente após envio
- Timeout curto (5 segundos)

### RPC com Resposta

Usado para: `GetRoleBase`, `GetRoleStatus`, `GetRolePocket`, etc.

```typescript
import { GetRoleBase } from './src';

// Buscar dados de um personagem
const result = await GetRoleBase.fetch('127.0.0.1', 29400, {
  roleId: 1024,
});

if (result.retcode === 0) {
  console.log(`Nome: ${result.base?.name}`);
  console.log(`Classe: ${result.base?.cls}`);
  console.log(`Nível: ${result.base?.level}`);
}
```

**Características:**
- Método `fetch()` ou similar
- Aguarda resposta do servidor
- Parse automático da resposta
- Timeout longo (20 segundos)
- Retorna objeto tipado

### Protocolo com Paginação

Usado para: `GMListOnlineUser`

```typescript
import { GMListOnlineUser } from './src';

// Buscar uma página
const { players, nextHandler } = await GMListOnlineUser.fetchPage(
  '127.0.0.1',
  29100,
  {
    gmRoleId: 32,
    handler: -1,  // Primeira página
  }
);

// Buscar TODOS (paginação automática)
const allPlayers = await GMListOnlineUser.fetchAll('127.0.0.1', 29100, {
  gmRoleId: 32,
});

console.log(`Total online: ${allPlayers.length}`);
```

**Características:**
- Métodos `fetchPage()` e `fetchAll()`
- Gerencia paginação automaticamente
- Loop interno até obter todos os dados
- Timeout longo (30 segundos)

## Estrutura de um Protocolo

### 1. Classe Base

```typescript
export class MeuProtocolo extends Protocol {
  // Dados de entrada
  private param1: number;
  private param2: string;
  
  // Dados de saída (se houver)
  public output?: MeuOutput;

  constructor(params: MeuInput) {
    super(0x123); // Tipo do protocolo
    this.param1 = params.param1;
    this.param2 = params.param2;
  }

  // Serialização
  marshal(writer: BufferWriter): void {
    writer.writeInt32BE(this.param1);
    writer.writeOctetsString(this.param2);
  }

  // Deserialização (se houver resposta)
  unmarshal(reader: BufferReader): void {
    this.output = {
      retcode: reader.readInt32BE(),
      data: reader.readOctetsAsString(),
    };
  }
}
```

### 2. Método Estático (Independente)

```typescript
static async send(host: string, port: number, params: MeuInput): Promise<MeuOutput> {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on('error', (err: Error) => reject(err));
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    
    // Para fire-and-forget
    socket.on('connect', () => {
      const protocol = new MeuProtocolo(params);
      
      const dataWriter = new BufferWriter();
      protocol.marshal(dataWriter);
      const data = dataWriter.toBuffer();
      
      const writer = new BufferWriter();
      writer.writeCompactUINT(protocol.getType());
      writer.writeCompactUINT(data.length);
      writer.writeBuffer(data);
      
      socket.write(writer.toBuffer(), () => {
        socket.end();
        resolve();
      });
    });
    
    socket.connect(port, host);
  });
}
```

## Comparação: Antes vs Depois

### ❌ Antes (Dependente)

```typescript
// Precisava criar GameConnection
const connection = new GameConnection('127.0.0.1', 29400);
const actions = new RoleActions(connection);

// Múltiplas camadas de abstração
const result = await actions.getBase(1024);

// GameConnection gerenciava XID para todos
// Difícil de usar protocolos isolados
```

### ✅ Depois (Independente)

```typescript
// Uso direto, sem dependências
const result = await GetRoleBase.fetch('127.0.0.1', 29400, {
  roleId: 1024,
});

// Cada protocolo gerencia sua própria conexão
// Simples, direto e independente
```

## Exemplos Práticos

### Broadcast de Mensagem

```typescript
import { ChatBroadcast, ChatChannel } from './src';

// Mensagem mundial
await ChatBroadcast.sendWorld('127.0.0.1', 29300, {
  message: 'Servidor reiniciará em 10 minutos!',
});

// Mensagem de sistema
await ChatBroadcast.sendSystem('127.0.0.1', 29300, {
  message: 'Manutenção programada às 02:00',
});
```

### Buscar Dados de Personagem

```typescript
import { GetRoleBase, GetRoleStatus } from './src';

// Paralelizar requisições independentes
const [base, status] = await Promise.all([
  GetRoleBase.fetch('127.0.0.1', 29400, { roleId: 1024 }),
  GetRoleStatus.fetch('127.0.0.1', 29400, { roleId: 1024 }),
]);

if (base.retcode === 0 && status.retcode === 0) {
  console.log(`${base.base?.name} - Level ${status.status?.level}`);
}
```

### Gerenciamento de Punições

```typescript
import { GMMuteRole, GMBanRole } from './src';

// Mute temporário
await GMMuteRole.send('127.0.0.1', 29100, {
  roleId: 1024,
  time: 3600,  // 1 hora
  reason: 'Spam no chat',
});

// Ban permanente
await GMBanRole.send('127.0.0.1', 29100, {
  roleId: 2048,
  time: 0,  // 0 = permanente
  reason: 'Uso de hack',
});
```

### Lista de Jogadores Online

```typescript
import { GMListOnlineUser } from './src';

// Buscar todos os jogadores
const players = await GMListOnlineUser.fetchAll('127.0.0.1', 29100, {
  gmRoleId: 32,
});

// Filtrar por critérios
const highLevelPlayers = players.filter(p => p.status === 1);

console.log(`${players.length} jogadores online`);
console.log(`${highLevelPlayers.length} de alto nível`);
```

## Portas dos Servidores

- **29100** - GDELIVERYD (GM Commands, Online Users)
- **29300** - GPROVIDER (Chat Broadcast)
- **29400** - GAMEDBD (Role Data, RPC)

## Migração

### Se você ainda usa GameConnection:

O código antigo continua funcionando! A `GameConnection` não foi removida, apenas não é mais necessária para os novos métodos estáticos.

```typescript
// ✅ Jeito antigo (ainda funciona)
const connection = new GameConnection('127.0.0.1', 29400);
const rpc = await connection.call(new GetRoleBase({ roleId: 1024 }));

// ✅ Jeito novo (recomendado)
const result = await GetRoleBase.fetch('127.0.0.1', 29400, {
  roleId: 1024,
});
```

## Benefícios da Arquitetura

1. **Menos código boilerplate** - Não precisa instanciar classes auxiliares
2. **Mais testável** - Cada protocolo pode ser testado isoladamente
3. **Mais fácil de entender** - Tudo está em um único arquivo
4. **Mais flexível** - Cada protocolo pode ter sua própria lógica
5. **Melhor performance** - Não há overhead de abstrações desnecessárias

## Conclusão

A nova arquitetura torna os protocolos **simples**, **independentes** e **fáceis de usar**. Cada protocolo é responsável por sua própria comunicação, sem depender de um sistema centralizado de gerenciamento de conexões.

