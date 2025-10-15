/**
 * Service - Gerencia operações relacionadas a personagens
 */
import { GameConnection } from '../core/game-connection';
import { RoleActions } from '../actions/role-actions';
import { RoleBase, RoleStatus, RolePocket, RoleStorehouse, RoleInventory } from '../models';

export class RoleService {
  private actions: RoleActions;

  constructor(connection: GameConnection) {
    this.actions = new RoleActions(connection);
  }

  /**
   * Obtém dados básicos do personagem
   */
  async getBase(roleId: number): Promise<RoleBase | null> {
    const result = await this.actions.getBase(roleId);
    return result.retcode === 0 ? result.data || null : null;
  }

  /**
   * Obtém status do personagem
   */
  async getStatus(roleId: number): Promise<RoleStatus | null> {
    const result = await this.actions.getStatus(roleId);
    return result.retcode === 0 ? result.data || null : null;
  }

  /**
   * Obtém base + status (mais eficiente)
   */
  async getBaseAndStatus(roleId: number): Promise<{ base: RoleBase; status: RoleStatus } | null> {
    const result = await this.actions.getBaseAndStatus(roleId);
    if (result.retcode === 0 && result.base && result.status) {
      return { base: result.base, status: result.status };
    }
    return null;
  }

  /**
   * Obtém inventário do personagem
   */
  async getPocket(roleId: number): Promise<RolePocket | null> {
    const result = await this.actions.getPocket(roleId);
    return result.retcode === 0 ? result.data || null : null;
  }

  /**
   * Obtém equipamentos do personagem
   */
  async getEquipment(roleId: number): Promise<RoleInventory[]> {
    const result = await this.actions.getEquipment(roleId);
    return result.retcode === 0 ? result.data : [];
  }

  /**
   * Obtém armazém do personagem
   */
  async getStorehouse(roleId: number): Promise<RoleStorehouse | null> {
    const result = await this.actions.getStorehouse(roleId);
    return result.retcode === 0 ? result.data || null : null;
  }

  /**
   * Obtém dados completos do personagem
   */
  async getFullData(roleId: number) {
    const result = await this.actions.getFullData(roleId);
    return result.retcode === 0 ? result.data : null;
  }
}

