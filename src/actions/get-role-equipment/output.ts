/**
 * Output para GetRoleEquipment RPC
 */

import { RoleInventory } from '../../models/role-inventory.model';

export type GetRoleEquipmentOutput = {
  retcode: number;
  equipment: RoleInventory[];
};

export type { RoleInventory };

