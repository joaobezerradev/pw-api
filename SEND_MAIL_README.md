# 📧 SendMail Action - Guia Completo

## ✅ SendMail (SysSendMail) - **FUNCIONANDO** ✨

**Protocolo:** Type 4214 (0x1076)  
**Porta:** 29100 (gdeliveryd)  
**Status:** ✅ **100% Funcional e Testado**

---

## 📋 Estrutura

### Input

```typescript
{
  tid: number;              // Transaction ID (timestamp em segundos)
  sysid: number;            // System ID (32)
  sys_type: number;         // Sender type (3 = system)
  receiver: number;         // Role ID do receptor
  title: string;            // Título do email
  context: string;          // Conteúdo (max 400 bytes)
  attach_obj: {             // GRoleInventory - Item anexado
    id: number;             // Item ID (0 = sem item, 4874 = exemplo)
    pos: number;            // Posição (-1 ou 0)
    count: number;          // Quantidade
    max_count: number;      // Quantidade máxima
    data: Buffer;           // Dados do item (geralmente vazio)
    proctype: number;       // Tipo de processamento (0)
    expire_date: number;    // Data de expiração (0)
    guid1: number;          // GUID parte 1 (0)
    guid2: number;          // GUID parte 2 (0)
    mask: number;           // Máscara (0)
  },
  attach_money: number;     // Gold anexado
}
```

### Output

```typescript
{
  tid: number;      // Transaction ID (retornado)
  retcode: number;  // 0 = sucesso, outros = erro
}
```

---

## 🚀 Exemplos de Uso

### Email Simples com Gold

```typescript
import { GameConnection, SendMail } from './src';

const connection = new GameConnection('127.0.0.1', 29100);

const result = await connection.call(new SendMail({
  tid: Math.floor(Date.now() / 1000),
  sysid: 32,
  sys_type: 3,
  receiver: 1073,  // Role ID
  title: 'Presente do Sistema',
  context: 'Obrigado por jogar! Aqui está um presente.',
  attach_obj: {
    id: 0,      // 0 = sem item
    pos: 0,
    count: 0,
    max_count: 0,
    data: Buffer.alloc(0),
    proctype: 0,
    expire_date: 0,
    guid1: 0,
    guid2: 0,
    mask: 0,
  },
  attach_money: 10000,  // 10.000 gold
}));

if (result.output.retcode === 0) {
  console.log('✅ Email enviado com sucesso!');
}
```

### Email com Item Anexado

```typescript
import { GameConnection, SendMail } from './src';

const connection = new GameConnection('127.0.0.1', 29100);

const result = await connection.call(new SendMail({
  tid: Math.floor(Date.now() / 1000),
  sysid: 32,
  sys_type: 3,
  receiver: 1073,
  title: 'Item Especial',
  context: 'Você ganhou um item especial!',
  attach_obj: {
    id: 4874,    // ID do item
    pos: 0,
    count: 1,    // Quantidade do item
    max_count: 1,
    data: Buffer.alloc(0),
    proctype: 0,
    expire_date: 0,
    guid1: 0,
    guid2: 0,
    mask: 0,
  },
  attach_money: 5000,  // 5.000 gold
}));

if (result.output.retcode === 0) {
  console.log('✅ Email com item enviado!');
}
```

---

## 🧪 Testes

### Rodar Exemplo

```bash
npx tsx examples/exemplo-send-mail.ts
```

### Rodar Testes de Integração

```bash
npm run test:run -- src/actions/send-mail/send-mail.spec.ts
```

**Nota:** Os testes de integração requerem que o servidor esteja rodando e acessível.

---

## 📦 Estrutura do Projeto

```
src/
├── actions/
│   └── send-mail/
│       ├── index.ts           # SendMail class
│       ├── input.ts           # SendMailInput type
│       ├── output.ts          # SendMailOutput type
│       └── send-mail.spec.ts  # Testes
│
├── models/
│   └── mail.model.ts          # MailAttachItem (GRoleInventory)
│
└── core/
    ├── buffer-writer.ts       # Serialização
    └── buffer-reader.ts       # Deserialização

examples/
└── exemplo-send-mail.ts       # Exemplo completo
```

---

## 🎯 Notas Importantes

### Ordem de Resposta

⚠️ **Importante:** A ordem dos campos na resposta é **diferente** do que está no XML!

- **XML define:** `retcode` (unsigned short), depois `tid` (unsigned int)
- **Servidor retorna:** `tid` primeiro, depois `retcode`

A implementação já está corrigida para ler na ordem correta.

### Configuração do Servidor

- **Porta:** 29100 (gdeliveryd)
- **Host:** 127.0.0.1 (local) ou IP do servidor
- **Service:** gdeliveryd

### Transaction ID (tid)

Use timestamp em segundos para garantir unicidade:

```typescript
const tid = Math.floor(Date.now() / 1000) & 0xFFFFFFFF;
```

### Sender Type (sys_type)

Valores comuns:
- `3` = System (recomendado para emails do sistema)
- `32` = NPC (para emails de NPCs)

### Item ID

- `0` = Sem item (apenas gold)
- `4874` = Item exemplo (ajuste conforme seu servidor)
- Consulte a tabela de itens do seu servidor para IDs válidos

---

## ✅ Status de Implementação

- ✅ **Serialização/Deserialização:** Completa
- ✅ **Support BigInt (int64):** Implementado
- ✅ **Support Octets/Strings:** Implementado
- ✅ **Testes de Integração:** Criados
- ✅ **Exemplos:** Funcionais
- ✅ **Logging (Pino):** Estruturado
- ✅ **Connection Optimizations:** Aplicadas

---

## 🐛 Troubleshooting

### Erro: Connection closed without response

**Causa:** Porta ou host incorretos, ou servidor não está rodando.

**Solução:** Verifique se o servidor está acessível na porta 29100.

### Erro: Retcode diferente de 0

**Causa:** Erro no servidor (role não existe, item inválido, etc).

**Solução:** Verifique os logs do servidor e os parâmetros enviados.

### Erro: RPC timeout

**Causa:** Servidor não respondeu no tempo limite (30s padrão).

**Solução:** Verifique conectividade ou aumente o timeout:

```typescript
await connection.call(new SendMail(input), 60000); // 60s timeout
```

---

## 📞 Suporte

Para mais informações, consulte:
- [README.md](./README.md) - Documentação geral do projeto
- [rpc.xml](./rpc.xml) - Definições de protocolos
- [Exemplos](./examples/) - Exemplos práticos

---

**Desenvolvido e testado com sucesso!** ✨
