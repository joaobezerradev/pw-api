/**
 * Model - Item de inventário
 */
export type RoleInventory = {
  id: number;
  pos: number;
  count: number;
  max_count: number;
  data: Buffer;
  proctype: number;
  expire_date: number;
  guid1: number;
  guid2: number;
  mask: number;
};

