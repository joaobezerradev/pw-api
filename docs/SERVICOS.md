# �9�4 Servi�0�4os do Servidor

## Servidor: 72.60.159.127

### �9�6�1�5 GAMEDBD - Port 29400
**Game Database Server**

Respons��vel por:
- Consultas de personagens (`GetRoleInfo`)
- Dados de usu��rios (`GetUser`)
- Informa�0�4�0�1es de conta
- Dados persistentes do jogo

**Quando usar**: Para consultar ou atualizar dados de personagens, invent��rio, banco de dados.

**Exemplo**:
```typescript
const config = getServerConfig('GAMEDBD');
const client = new GameClient(config.host, config.port);

const rpc = new GetRoleInfo();
rpc.setRoleId(1024);
const result = await client.call(rpc);
```

---

### �9�4 GDELIVERYD - Port 29100
**Delivery Server**

Respons��vel por:
- Entrega de itens
- Sistema de correio in-game
- Transfer��ncias entre personagens
- Marketplace/leil�0�0o

**Quando usar**: Para opera�0�4�0�1es de entrega, correio, marketplace.

---

### �9�9 GPROVIDER - Port 29300
**Provider Server**

Respons��vel por:
- Servi�0�4os gerais
- Opera�0�4�0�1es auxiliares
- Cache de dados
- Sincroniza�0�4�0�0o

**Quando usar**: Para opera�0�4�0�1es gerais que n�0�0o se encaixam nos outros servi�0�4os.

---

## Como Escolher o Servi�0�4o

```typescript
import { getServerConfig } from './config';

// Para consultas de personagens
const dbConfig = getServerConfig('GAMEDBD');

// Para sistema de correio/entrega
const deliveryConfig = getServerConfig('GDELIVERYD');

// Para servi�0�4os gerais
const providerConfig = getServerConfig('GPROVIDER');
```

## RPCs por Servi�0�4o

### GAMEDBD (29400)
- `GetRoleInfo` (3051) - Informa�0�4�0�1es de personagem
- `GetUser` (3052) - Informa�0�4�0�1es de usu��rio
- `PutRole` (3055) - Atualizar personagem
- `GetRoleData` - Dados completos do personagem
- `DBRoleList` - Listar personagens de uma conta

### GDELIVERYD (29100)
- `DeliverItem` - Entregar item
- `GetMail` - Buscar correio
- `SendMail` - Enviar correio
- `AuctionAttendList` - Lista de leil�0�1es

### GPROVIDER (29300)
- Opera�0�4�0�1es de cache
- Sincroniza�0�4�0�0o de dados
- Broadcast de eventos

## Fluxo T��pico de Uso

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
Se voc�� receber "Connection refused", verifique:
1. Porta correta para o servi�0�4o desejado
2. Firewall n�0�0o est�� bloqueando
3. Servidor est�� online

### Timeout
Se receber timeout:
1. Verifique conectividade com `ping 72.60.159.127`
2. Teste a porta com `telnet 72.60.159.127 29400`
3. Aumente o timeout se necess��rio

### RPC n�0�0o suportado
Se o RPC retornar erro:
1. Verifique se est�� usando a porta correta
2. Confirme o tipo do RPC em `rpcalls.xml`
3. Verifique se o servi�0�4o suporta aquele RPC

