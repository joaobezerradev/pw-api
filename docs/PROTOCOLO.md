# 📡 Documentação do Protocolo

## Visão Geral

O servidor do jogo usa um protocolo binário TCP com codificação **Little-Endian**. A comunicação é baseada em pacotes que contêm:

1. Tamanho do pacote (CompactUINT)
2. Tipo do protocolo (CompactUINT)
3. Dados do protocolo

## Formato de Pacote

```
┌─────────────────┬──────────────────┬────────────────┐
│  Tamanho (1-5)  │  Tipo (1-5)      │  Dados (N)     │
│  CompactUINT    │  CompactUINT     │  Variável      │
└─────────────────┴──────────────────┴────────────────┘
```

### Exemplo Real

Envio de GetRoleInfo (RoleId = 1024):

```
Bytes (Hex):
0E          -> Tamanho do pacote (14 bytes)
BE 17       -> Tipo do protocolo (3051 em CompactUINT)
01 00 00 00 -> XID (1)
00 04 00 00 -> RoleId (1024)
```

## Tipos de Dados

### Tipos Primitivos (Little-Endian)

| Tipo | Tamanho | Descrição | Exemplo |
|------|---------|-----------|---------|
| `int8` | 1 byte | Inteiro com sinal | -128 a 127 |
| `uint8` | 1 byte | Inteiro sem sinal | 0 a 255 |
| `int16` | 2 bytes | Short com sinal | -32768 a 32767 |
| `uint16` | 2 bytes | Short sem sinal | 0 a 65535 |
| `int32` | 4 bytes | Int com sinal | -2^31 a 2^31-1 |
| `uint32` | 4 bytes | Int sem sinal | 0 a 2^32-1 |
| `float` | 4 bytes | Ponto flutuante | IEEE 754 |
| `double` | 8 bytes | Ponto flutuante duplo | IEEE 754 |

### CompactUINT

Número inteiro não negativo de tamanho variável (1-5 bytes).

#### Codificação

```
Valor < 64 (0x40):
  [0xxxxxxx]
  1 byte

Valor < 16384 (0x4000):
  [10xxxxxx] [xxxxxxxx]
  2 bytes

Valor < 536870912 (0x20000000):
  [110xxxxx] [xxxxxxxx] [xxxxxxxx] [xxxxxxxx]
  4 bytes

Valor >= 536870912:
  [111xxxxx] [uint32 em little-endian]
  5 bytes
```

#### Exemplos

| Valor | Hex | Descrição |
|-------|-----|-----------|
| 10 | `0A` | 1 byte |
| 100 | `80 64` | 2 bytes |
| 3051 | `BE 17` | 2 bytes (tipo GetRoleInfo) |
| 1000000 | `C0 0F 42 40` | 4 bytes |

### Octets

Array de bytes com tamanho prefixado.

```
┌──────────────┬─────────────────┐
│  Tamanho     │  Dados          │
│  CompactUINT │  N bytes        │
└──────────────┴─────────────────┘
```

Exemplo - String "Hello":
```
05              -> Tamanho (5 bytes)
48 65 6C 6C 6F  -> "Hello" em ASCII
```

### String

Octets contendo texto UTF-8 (sem null terminator no protocolo).

## Estrutura RPC

RPCs (Remote Procedure Calls) são protocolos que esperam resposta.

### Requisição

```
┌─────────────┬──────────────────┐
│  XID        │  Argumentos      │
│  uint32     │  Variável        │
└─────────────┴──────────────────┘
```

### Resposta

```
┌─────────────┬──────────────────┐
│  XID        │  Resultado       │
│  uint32     │  Variável        │
└─────────────┴──────────────────┘
```

- **XID**: Identificador da transação (usado para correlacionar request/response)
- Mesmo XID na requisição e resposta

## GetRoleInfo (Type: 3051)

### Definição (rpcalls.xml)

```xml
<rpcdata name="RoleInfoRes">
    <variable name="retcode" type="int" default="-1"/>
    <variable name="value" type="GRoleInfo"/>
</rpcdata>
<rpc name="GetRoleInfo" type="3051" argument="RoleId" result="RoleInfoRes"/>
```

### RoleId (Argumento)

```
┌─────────────┐
│  roleId     │
│  int32      │
└─────────────┘
```

### RoleInfoRes (Resultado)

```
┌─────────────┬──────────────────┐
│  retcode    │  GRoleInfo       │
│  int32      │  Struct          │
└─────────────┴──────────────────┘
```

### GRoleInfo (Estrutura)

```
Field           Type        Description
────────────────────────────────────────────
version         byte        Versão da estrutura (1)
id              uint32      ID do personagem
name            Octets      Nome (UTF-8)
race            uint32      Raça (0-7)
cls             uint32      Classe (0-11)
gender          byte        Gênero (0=M, 1=F)
custom_data     Octets      Dados de customização
config_data     Octets      Dados de configuração
custom_stamp    uint32      Timestamp de customização
status          byte        Status do personagem
delete_time     uint32      Timestamp de deleção
create_time     uint32      Timestamp de criação
lastlogin_time  uint32      Timestamp último login
posx            float       Posição X
posy            float       Posição Y
posz            float       Posição Z
worldtag        int32       Tag do mundo
```

### Exemplo de Fluxo

#### 1. Cliente → Servidor (Requisição)

```
Tamanho: 14 bytes (0x0E)
Tipo: 3051 (0xBE17)
XID: 1 (0x01000000)
RoleId: 1024 (0x00040000)

Hex completo:
0E BE 17 01 00 00 00 00 04 00 00
```

#### 2. Servidor → Cliente (Resposta)

```
Tamanho: ~200 bytes
Tipo: 3051 (0xBE17)
XID: 1 (0x01000000)
Retcode: 0 (0x00000000) - sucesso
GRoleInfo: {
  version: 1
  id: 1024
  name: "MyCharacter"
  race: 2 (Elfo)
  cls: 4 (Arqueiro)
  gender: 0 (Masculino)
  ...
}
```

## Códigos de Retorno Comuns

| Código | Significado |
|--------|-------------|
| 0 | Sucesso |
| -1 | Erro genérico |
| -2 | Personagem não encontrado |
| -3 | Permissão negada |
| -100 | Timeout de banco de dados |
| -101 | Erro de serialização |

## Raças e Classes

### Raças (race)

| ID | Nome |
|----|------|
| 0 | Humano |
| 1 | Sirene |
| 2 | Elfo |
| 3 | Bárbaro |
| 4 | Alado |
| 5 | Raposa |
| 6 | Noturno |
| 7 | Glacial |

### Classes (cls)

| ID | Nome |
|----|------|
| 0 | Guerreiro |
| 1 | Mago |
| 2 | Sacerdote |
| 3 | Mercenário |
| 4 | Arqueiro |
| 5 | Arcano |
| 6 | Feiticeiro |
| 7 | Místico |
| 8 | Bárbaro |
| 9 | Druida |
| 10 | Assassino |
| 11 | Xamã |

## Outros RPCs Disponíveis

Baseado em `cnet/rpcalls.xml`:

| Nome | Type | Descrição |
|------|------|-----------|
| GetRoleInfo | 3051 | Obter informações de personagem |
| GetUser | 3052 | Obter informações de usuário |
| PostPlayerLogin | 3053 | Login de jogador |
| PostPlayerLogout | 3054 | Logout de jogador |
| PutRole | 3055 | Atualizar personagem |
| ... | ... | Veja rpcalls.xml para lista completa |

## Referências

- `/cnet/rpcalls.xml` - Definições de RPC
- `/cgame/common/protocol.h` - Estruturas de protocolo do jogo
- `/share/io/protocol.h` - Framework base de protocolo
- `/cgame/common/packetwrapper.h` - Serialização de pacotes

## Ferramentas

### Wireshark

Para debug de rede, use filtro:

```
tcp.port == 29100 and tcp.len > 0
```

### Hexdump

Para analisar pacotes binários:

```bash
xxd pacote.bin
```

## Segurança

⚠️ **Importante**: Este protocolo não usa criptografia por padrão. Em produção:

1. Use TLS/SSL
2. Implemente autenticação
3. Valide todos os dados de entrada
4. Rate limiting para prevenir DoS
5. Logs de auditoria

## Performance

### Otimizações

- Use pool de conexões
- Reuse buffers
- CompactUINT economiza bytes
- Batch múltiplas operações quando possível

### Limites

- Tamanho máximo de pacote: varia por tipo (veja `maxsize` em rpcalls.xml)
- Timeout padrão de RPC: 10-30 segundos
- Keep-alive: configure conforme necessário

