# �9�9 Documenta�0�4�0�0o do Protocolo

## Vis�0�0o Geral

O servidor do jogo usa um protocolo bin��rio TCP com codifica�0�4�0�0o **Little-Endian**. A comunica�0�4�0�0o �� baseada em pacotes que cont��m:

1. Tamanho do pacote (CompactUINT)
2. Tipo do protocolo (CompactUINT)
3. Dados do protocolo

## Formato de Pacote

```
�������������������������������������Щ������������������������������������Щ���������������������������������
��  Tamanho (1-5)  ��  Tipo (1-5)      ��  Dados (N)     ��
��  CompactUINT    ��  CompactUINT     ��  Vari��vel      ��
�������������������������������������ة������������������������������������ة���������������������������������
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

| Tipo | Tamanho | Descri�0�4�0�0o | Exemplo |
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

N��mero inteiro n�0�0o negativo de tamanho vari��vel (1-5 bytes).

#### Codifica�0�4�0�0o

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

| Valor | Hex | Descri�0�4�0�0o |
|-------|-----|-----------|
| 10 | `0A` | 1 byte |
| 100 | `80 64` | 2 bytes |
| 3051 | `BE 17` | 2 bytes (tipo GetRoleInfo) |
| 1000000 | `C0 0F 42 40` | 4 bytes |

### Octets

Array de bytes com tamanho prefixado.

```
�������������������������������Щ�����������������������������������
��  Tamanho     ��  Dados          ��
��  CompactUINT ��  N bytes        ��
�������������������������������ة�����������������������������������
```

Exemplo - String "Hello":
```
05              -> Tamanho (5 bytes)
48 65 6C 6C 6F  -> "Hello" em ASCII
```

### String

Octets contendo texto UTF-8 (sem null terminator no protocolo).

## Estrutura RPC

RPCs (Remote Procedure Calls) s�0�0o protocolos que esperam resposta.

### Requisi�0�4�0�0o

```
�����������������������������Щ�������������������������������������
��  XID        ��  Argumentos      ��
��  uint32     ��  Vari��vel        ��
�����������������������������ة�������������������������������������
```

### Resposta

```
�����������������������������Щ�������������������������������������
��  XID        ��  Resultado       ��
��  uint32     ��  Vari��vel        ��
�����������������������������ة�������������������������������������
```

- **XID**: Identificador da transa�0�4�0�0o (usado para correlacionar request/response)
- Mesmo XID na requisi�0�4�0�0o e resposta

## GetRoleInfo (Type: 3051)

### Defini�0�4�0�0o (rpcalls.xml)

```xml
<rpcdata name="RoleInfoRes">
    <variable name="retcode" type="int" default="-1"/>
    <variable name="value" type="GRoleInfo"/>
</rpcdata>
<rpc name="GetRoleInfo" type="3051" argument="RoleId" result="RoleInfoRes"/>
```

### RoleId (Argumento)

```
������������������������������
��  roleId     ��
��  int32      ��
������������������������������
```

### RoleInfoRes (Resultado)

```
�����������������������������Щ�������������������������������������
��  retcode    ��  GRoleInfo       ��
��  int32      ��  Struct          ��
�����������������������������ة�������������������������������������
```

### GRoleInfo (Estrutura)

```
Field           Type        Description
����������������������������������������������������������������������������������������
version         byte        Vers�0�0o da estrutura (1)
id              uint32      ID do personagem
name            Octets      Nome (UTF-8)
race            uint32      Ra�0�4a (0-7)
cls             uint32      Classe (0-11)
gender          byte        G��nero (0=M, 1=F)
custom_data     Octets      Dados de customiza�0�4�0�0o
config_data     Octets      Dados de configura�0�4�0�0o
custom_stamp    uint32      Timestamp de customiza�0�4�0�0o
status          byte        Status do personagem
delete_time     uint32      Timestamp de dele�0�4�0�0o
create_time     uint32      Timestamp de cria�0�4�0�0o
lastlogin_time  uint32      Timestamp ��ltimo login
posx            float       Posi�0�4�0�0o X
posy            float       Posi�0�4�0�0o Y
posz            float       Posi�0�4�0�0o Z
worldtag        int32       Tag do mundo
```

### Exemplo de Fluxo

#### 1. Cliente �� Servidor (Requisi�0�4�0�0o)

```
Tamanho: 14 bytes (0x0E)
Tipo: 3051 (0xBE17)
XID: 1 (0x01000000)
RoleId: 1024 (0x00040000)

Hex completo:
0E BE 17 01 00 00 00 00 04 00 00
```

#### 2. Servidor �� Cliente (Resposta)

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

## C��digos de Retorno Comuns

| C��digo | Significado |
|--------|-------------|
| 0 | Sucesso |
| -1 | Erro gen��rico |
| -2 | Personagem n�0�0o encontrado |
| -3 | Permiss�0�0o negada |
| -100 | Timeout de banco de dados |
| -101 | Erro de serializa�0�4�0�0o |

## Ra�0�4as e Classes

### Ra�0�4as (race)

| ID | Nome |
|----|------|
| 0 | Humano |
| 1 | Sirene |
| 2 | Elfo |
| 3 | B��rbaro |
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
| 3 | Mercen��rio |
| 4 | Arqueiro |
| 5 | Arcano |
| 6 | Feiticeiro |
| 7 | M��stico |
| 8 | B��rbaro |
| 9 | Druida |
| 10 | Assassino |
| 11 | Xam�0�0 |

## Outros RPCs Dispon��veis

Baseado em `cnet/rpcalls.xml`:

| Nome | Type | Descri�0�4�0�0o |
|------|------|-----------|
| GetRoleInfo | 3051 | Obter informa�0�4�0�1es de personagem |
| GetUser | 3052 | Obter informa�0�4�0�1es de usu��rio |
| PostPlayerLogin | 3053 | Login de jogador |
| PostPlayerLogout | 3054 | Logout de jogador |
| PutRole | 3055 | Atualizar personagem |
| ... | ... | Veja rpcalls.xml para lista completa |

## Refer��ncias

- `/cnet/rpcalls.xml` - Defini�0�4�0�1es de RPC
- `/cgame/common/protocol.h` - Estruturas de protocolo do jogo
- `/share/io/protocol.h` - Framework base de protocolo
- `/cgame/common/packetwrapper.h` - Serializa�0�4�0�0o de pacotes

## Ferramentas

### Wireshark

Para debug de rede, use filtro:

```
tcp.port == 29100 and tcp.len > 0
```

### Hexdump

Para analisar pacotes bin��rios:

```bash
xxd pacote.bin
```

## Seguran�0�4a

�7�2�1�5 **Importante**: Este protocolo n�0�0o usa criptografia por padr�0�0o. Em produ�0�4�0�0o:

1. Use TLS/SSL
2. Implemente autentica�0�4�0�0o
3. Valide todos os dados de entrada
4. Rate limiting para prevenir DoS
5. Logs de auditoria

## Performance

### Otimiza�0�4�0�1es

- Use pool de conex�0�1es
- Reuse buffers
- CompactUINT economiza bytes
- Batch m��ltiplas opera�0�4�0�1es quando poss��vel

### Limites

- Tamanho m��ximo de pacote: varia por tipo (veja `maxsize` em rpcalls.xml)
- Timeout padr�0�0o de RPC: 10-30 segundos
- Keep-alive: configure conforme necess��rio

