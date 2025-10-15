# �0�4 Guia R��pido

## Instala�0�4�0�0o

```bash
cd api-client
npm install
```

## Compilar

```bash
npm run build
```

## Executar Exemplo

```bash
npm run test
```

## Uso B��sico

### 1. Importar o cliente

```typescript
import { GameClient, GetRoleInfo } from './src';
```

### 2. Criar conex�0�0o

```typescript
import { getServerConfig } from './src/config';

const config = getServerConfig('GAMEDBD'); // ou 'GDELIVERYD', 'GPROVIDER'
const client = new GameClient(config.host, config.port);
await client.connect();
```

### 3. Fazer chamada RPC

```typescript
const rpc = new GetRoleInfo();
rpc.setRoleId(1024);

const resultado = await client.call(rpc);
```

### 4. Processar resposta

```typescript
if (resultado.getRetcode() === 0) {
  const info = resultado.getRoleInfo();
  console.log('Nome:', info?.name);
}
```

### 5. Desconectar

```typescript
client.disconnect();
```

## �7�5�1�5 Configura�0�4�0�0o do Servidor

Antes de testar, certifique-se de que o servidor est�� rodando:

```bash
# No diret��rio do servidor
docker-compose up -d
```

Verifique as portas dispon��veis no arquivo de configura�0�4�0�0o do servidor.

## �9�3 Portas do Servidor

**Host: 72.60.159.127**

- **29400** - GAMEDBD (Database Server) - Consultas de personagens/dados
- **29100** - GDELIVERYD (Delivery Server) - Entrega de itens/mensagens
- **29300** - GPROVIDER (Provider Server) - Servi�0�4os gerais

## �9�5 Estrutura de Dados Little-Endian

O protocolo usa **Little-Endian** para todos os n��meros:

| Tipo | Bytes | Ordem |
|------|-------|-------|
| int8 | 1 | N/A |
| int16 | 2 | Little-Endian |
| int32 | 4 | Little-Endian |
| float | 4 | Little-Endian |
| double | 8 | Little-Endian |

### CompactUINT

N��mero de tamanho vari��vel (1-5 bytes):

- **1 byte**: valores de 0 a 63 (0x00-0x3F)
  - Formato: `0xxxxxxx`
  
- **2 bytes**: valores de 64 a 16383 (0x40-0x3FFF)
  - Formato: `10xxxxxx xxxxxxxx`
  
- **4 bytes**: valores de 16384 a 536870911 (0x4000-0x1FFFFFFF)
  - Formato: `110xxxxx xxxxxxxx xxxxxxxx xxxxxxxx`
  
- **5 bytes**: valores maiores
  - Formato: `111xxxxx` + uint32

## �9�3 Debug

Para ver os pacotes sendo enviados/recebidos, o cliente j�� imprime logs:

```
�� Enviando pacote (type=3051, size=14 bytes)
�� Recebido pacote (type=3051, size=256 bytes)
```

## �9�1 Troubleshooting

### "Connection refused"
- Verifique se o servidor est�� rodando
- Confirme o HOST e PORT corretos

### "Connection timeout"
- Firewall pode estar bloqueando
- Servidor pode n�0�0o estar aceitando conex�0�1es externas

### "RPC timeout"
- Servidor pode estar sobrecarregado
- Aumente o timeout na chamada: `client.call(rpc, 30000)`

## �9�2 Pr��ximos Passos

1. Explore outros RPCs dispon��veis em `cnet/rpcalls.xml`
2. Adicione novos RPCs seguindo o exemplo de `GetRoleInfo`
3. Implemente tratamento de erros mais robusto
4. Adicione logging com winston ou similar
5. Crie um pool de conex�0�1es para melhor performance

## �0�3 Contribuindo

Para adicionar um novo RPC:

1. Encontre a defini�0�4�0�0o em `cnet/rpcalls.xml`
2. Crie `src/protocol/MeuNovoRpc.ts`
3. Implemente `marshalArgument()` e `unmarshalResult()`
4. Adicione ao `src/index.ts`
5. Teste com exemplo em `examples/`

## �9�5 Dicas

- Use `BufferWriter` para serializar dados
- Use `BufferReader` para deserializar dados  
- Sempre respeite o formato Little-Endian
- CompactUINT economiza bytes em tamanhos pequenos
- XID deve ser ��nico por chamada RPC
- Timeouts evitam travamentos

