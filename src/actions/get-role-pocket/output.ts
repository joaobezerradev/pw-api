/**
 * Output para GetRolePocket RPC
 */

import { RoleInventory } from '../../models/role-inventory.model';

export type RolePocket = {
  capacity: number;
  timestamp: number;
  money: number;
  items: RoleInventory[];
  reserved1: number;
  reserved2: number;
};

export type GetRolePocketOutput = {
  retcode: number;
  pocket?: RolePocket;
};

export type { RoleInventory };

