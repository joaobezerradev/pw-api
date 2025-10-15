/**
 * Output para GetRoleStorehouse RPC
 */

import { RoleInventory } from '../../models/role-inventory.model';

export type RoleStorehouse = {
  capacity: number;
  money: number;
  items: RoleInventory[];
  size1: number;
  size2: number;
  dress: RoleInventory[];       // Materiais
  material: RoleInventory[];    // Fashion
  size3: number;
  generalcard: RoleInventory[]; // Cards
  reserved: number;
};

export type GetRoleStorehouseOutput = {
  retcode: number;
  storehouse?: RoleStorehouse;
};

export type { RoleInventory };

