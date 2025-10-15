# ✅ TODO

## Concluído
- [x] Estrutura base do projeto TypeScript
- [x] BufferWriter com Big-Endian
- [x] BufferReader com Big-Endian
- [x] Implementação de CompactUINT
- [x] Suporte a strings UTF-16LE
- [x] Classe Protocol base
- [x] Classe Rpc base
- [x] GameClient com gerenciamento TCP
- [x] GetRoleInfo RPC implementado
- [x] Configuração centralizada
- [x] Documentação completa
- [x] Análise do repositório pwTools
- [x] Correção para Big-Endian (era Little-Endian)

## Em Progresso
- [ ] **Resolver problema de conexão com servidor**
  - Servidor fecha conexão imediatamente
  - Testar outras portas (29100, 29300)
  - Verificar se necessita Challenge-Response
  - Analisar logs do servidor

## Próximo
- [ ] Implementar Challenge-Response se necessário
- [ ] Testar conexão com GDELIVERYD (29100)
- [ ] Testar conexão com GPROVIDER (29300)
- [ ] Adicionar mais RPCs:
  - [ ] GetUser
  - [ ] GetRoleList
  - [ ] PutRole (salvar personagem)
  - [ ] SendMail
  - [ ] GetOnlineList

## Melhorias Futuras
- [ ] Pool de conexões
- [ ] Reconexão automática
- [ ] Logs estruturados (winston)
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] CLI para operações comuns
- [ ] Interface web para gerenciamento
- [ ] Sistema de cache
- [ ] Rate limiting
- [ ] Métricas e monitoring

## Bugs Conhecidos
- [ ] Servidor fecha conexão na porta 29400
  - Possível causa: requer autenticação
  - Possível causa: porta apenas interna
  - Possível causa: formato de pacote incorreto

## Documentação
- [x] README.md
- [x] GUIA_RAPIDO.md  
- [x] PROTOCOLO.md
- [x] SERVICOS.md
- [x] RESUMO.md
- [ ] API Reference
- [ ] Exemplos avançados
- [ ] Troubleshooting guide

