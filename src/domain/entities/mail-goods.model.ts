/**
 * Model - Item anexado no email
 */
export type MailGoods = {
  goods_id: number;                   // ID do item
  count: number;                      // Quantidade
  proctype: number;                   // Tipo de processamento
  goods_flag: number;                 // Atributo de loja
  goods_price: number;                // Preço real (após desconto)
  goods_price_before_discount: number; // Preço original
  paytype: number;                    // Tipo de pagamento
  reserved2: Buffer;                  // Reservado
};

