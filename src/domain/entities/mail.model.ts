/**
 * Item do inventário (GRoleInventory)
 */
export interface MailAttachItem {
  id: number;            // unsigned int - ID do item
  pos: number;           // int - Posição
  count: number;         // int - Quantidade
  max_count: number;     // int - Quantidade máxima
  data: Buffer;          // Octets - Dados do item
  proctype: number;      // int - Tipo de processamento
  expire_date: number;   // int - Data de expiração
  guid1: number;         // int - GUID parte 1
  guid2: number;         // int - GUID parte 2
  mask: number;          // int - Máscara
}

