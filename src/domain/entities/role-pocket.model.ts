/**
 * Model - Inventário do personagem
 */
import { RoleInventory } from './role-inventory.model';

export type RolePocket = {
  capacity: number;
  timestamp: number;
  money: number;
  items: RoleInventory[];
  reserved1: number;
  reserved2: number;
};

