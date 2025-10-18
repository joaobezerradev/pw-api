/**
 * Model - Armazém do personagem
 */
import { RoleInventory } from './role-inventory.model';

export type RoleStorehouse = {
  capacity: number;
  money: number;
  items: RoleInventory[];
  size1: number;
  size2: number;
  dress: RoleInventory[];
  material: RoleInventory[];
  size3: number;
  generalcard: RoleInventory[];
  reserved: number;
};

