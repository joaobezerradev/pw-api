/**
 * Role Actions - Agrupa todas as ações relacionadas a personagens
 */
import { GameConnection } from '../core';
import { GetRoleBase } from './get-role-base';
import { GetRoleStatus } from './get-role-status';
import { GetRoleBaseStatus } from './get-role-base-status';
import { GetRolePocket } from './get-role-pocket';
import { GetRoleEquipment } from './get-role-equipment';
import { GetRoleStorehouse } from './get-role-storehouse';
import { RoleBase, RoleStatus, RolePocket, RoleStorehouse, RoleInventory } from '../models';

export class RoleActions {
  constructor(private connection: GameConnection) {}

  /**
   * Obtém dados básicos do personagem
   */
  async getBase(roleId: number): Promise<{ retcode: number; data?: RoleBase }> {
    const rpc = await this.connection.call(new GetRoleBase({ roleId }));
    return {
      retcode: rpc.output.retcode,
      data: rpc.output.base as RoleBase | undefined,
    };
  }

  /**
   * Obtém status do personagem
   */
  async getStatus(roleId: number): Promise<{ retcode: number; data?: RoleStatus }> {
    const rpc = await this.connection.call(new GetRoleStatus({ roleId }));
    return {
      retcode: rpc.output.retcode,
      data: rpc.output.status as RoleStatus | undefined,
    };
  }

  /**
   * Obtém base + status em uma única chamada (mais eficiente)
   */
  async getBaseAndStatus(roleId: number): Promise<{
    retcode: number;
    base?: RoleBase;
    status?: RoleStatus;
  }> {
    const rpc = await this.connection.call(new GetRoleBaseStatus({ roleId }));
    return {
      retcode: rpc.output.retcode,
      base: rpc.output.base as RoleBase | undefined,
      status: rpc.output.status as RoleStatus | undefined,
    };
  }

  /**
   * Obtém inventário do personagem
   */
  async getPocket(roleId: number): Promise<{ retcode: number; data?: RolePocket }> {
    const rpc = await this.connection.call(new GetRolePocket({ roleId }));
    return {
      retcode: rpc.output.retcode,
      data: rpc.output.pocket as RolePocket | undefined,
    };
  }

  /**
   * Obtém equipamentos do personagem
   */
  async getEquipment(roleId: number): Promise<{ retcode: number; data: RoleInventory[] }> {
    const rpc = await this.connection.call(new GetRoleEquipment({ roleId }));
    return {
      retcode: rpc.output.retcode,
      data: rpc.output.equipment as RoleInventory[],
    };
  }

  /**
   * Obtém armazém do personagem
   */
  async getStorehouse(roleId: number): Promise<{ retcode: number; data?: RoleStorehouse }> {
    const rpc = await this.connection.call(new GetRoleStorehouse({ roleId }));
    return {
      retcode: rpc.output.retcode,
      data: rpc.output.storehouse as RoleStorehouse | undefined,
    };
  }

  /**
   * Obtém dados completos do personagem (todas as chamadas em paralelo)
   */
  async getFullData(roleId: number) {
    const [baseStatus, pocket, equipment, storehouse] = await Promise.all([
      this.getBaseAndStatus(roleId),
      this.getPocket(roleId),
      this.getEquipment(roleId),
      this.getStorehouse(roleId),
    ]);

    if (baseStatus.retcode !== 0 || !baseStatus.base || !baseStatus.status) {
      return {
        retcode: baseStatus.retcode,
        data: null,
      };
    }

    return {
      retcode: 0,
      data: {
        base: baseStatus.base,
        status: baseStatus.status,
        pocket: pocket.data,
        equipment: equipment.data,
        storehouse: storehouse.data,
      },
    };
  }
}

