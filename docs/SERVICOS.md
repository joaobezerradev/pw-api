# 🌐 Serviços do Servidor

## Servidor: 72.60.159.127

### 🗄️ GAMEDBD - Port 29400
**Game Database Server**

Responsável por:
- Consultas de personagens (`GetRoleInfo`)
- Dados de usuários (`GetUser`)
- Informações de conta
- Dados persistentes do jogo

**Quando usar**: Para consultar ou atualizar dados de personagens, inventário, banco de dados.

**Exemplo**:
```typescript
const config = getServerConfig('GAMEDBD');
const client = new GameClient(config.host, config.port);

const rpc = new GetRoleInfo();
rpc.setRoleId(1024);
const result = await client.call(rpc);
```

---

### 📦 GDELIVERYD - Port 29100
**Delivery Server**

Responsável por:
- Entrega de itens
- Sistema de correio in-game
- Transferências entre personagens
- Marketplace/leilão

**Quando usar**: Para operações de entrega, correio, marketplace.

---

### 🔧 GPROVIDER - Port 29300
**Provider Server**

Responsável por:
- Serviços gerais
- Operações auxiliares
- Cache de dados
- Sincronização

**Quando usar**: Para operações gerais que não se encaixam nos outros serviços.

---

## Como Escolher o Serviço

```typescript
import { getServerConfig } from './config';

// Para consultas de personagens
const dbConfig = getServerConfig('GAMEDBD');

// Para sistema de correio/entrega
const deliveryConfig = getServerConfig('GDELIVERYD');

// Para serviços gerais
const providerConfig = getServerConfig('GPROVIDER');
```

## RPCs por Serviço

### GAMEDBD (29400)
- `GetRoleInfo` (3051) - Informações de personagem
- `GetUser` (3052) - Informações de usuário
- `PutRole` (3055) - Atualizar personagem
- `GetRoleData` - Dados completos do personagem
- `DBRoleList` - Listar personagens de uma conta

### GDELIVERYD (29100)
- `DeliverItem` - Entregar item
- `GetMail` - Buscar correio
- `SendMail` - Enviar correio
- `AuctionAttendList` - Lista de leilões

### GPROVIDER (29300)
- Operações de cache
- Sincronização de dados
- Broadcast de eventos

## Fluxo Típico de Uso

### 1. Consultar Personagem
```typescript
// Conecta ao GAMEDBD
const client = new GameClient('72.60.159.127', 29400);
await client.connect();

const rpc = new GetRoleInfo();
rpc.setRoleId(1024);
const info = await client.call(rpc);
```

### 2. Enviar Item por Correio
```typescript
// Conecta ao GDELIVERYD
const client = new GameClient('72.60.159.127', 29100);
await client.connect();

// Implementar SendMail RPC
```

## Troubleshooting

### Porta incorreta
Se você receber "Connection refused", verifique:
1. Porta correta para o serviço desejado
2. Firewall não está bloqueando
3. Servidor está online

### Timeout
Se receber timeout:
1. Verifique conectividade com `ping 72.60.159.127`
2. Teste a porta com `telnet 72.60.159.127 29400`
3. Aumente o timeout se necessário

### RPC não suportado
Se o RPC retornar erro:
1. Verifique se está usando a porta correta
2. Confirme o tipo do RPC em `rpcalls.xml`
3. Verifique se o serviço suporta aquele RPC

