import { GameDBConnection } from '@infra/connections';
import {
  GetRoleBase,
  GetRoleStatus,
  GetRoleBaseStatus,
  GetRolePocket,
  GetRoleEquipment,
  GetRoleStorehouse,
  GetFactionInfo,
  GetUserFaction,
  GetUserRoles,
  ForbidUser,
  RenameRole,
  ClearStorehousePasswd,
} from '@infra/clients/gamedb';

/**
 * Factory estática para actions do GameDB
 * 
 * @example
 * ```typescript
 * const getRoleBase = GameDBFactory.makeGetRoleBase();
 * const result = await getRoleBase.execute({ roleId: 1073 });
 * ```
 */
export class GameDBFactory {
  static makeGetRoleBase(): GetRoleBase {
    return new GetRoleBase(new GameDBConnection());
  }

  static makeGetRoleStatus(): GetRoleStatus {
    return new GetRoleStatus(new GameDBConnection());
  }

  static makeGetRoleBaseStatus(): GetRoleBaseStatus {
    return new GetRoleBaseStatus(new GameDBConnection());
  }

  static makeGetRolePocket(): GetRolePocket {
    return new GetRolePocket(new GameDBConnection());
  }

  static makeGetRoleEquipment(): GetRoleEquipment {
    return new GetRoleEquipment(new GameDBConnection());
  }

  static makeGetRoleStorehouse(): GetRoleStorehouse {
    return new GetRoleStorehouse(new GameDBConnection());
  }

  static makeGetFactionInfo(): GetFactionInfo {
    return new GetFactionInfo(new GameDBConnection());
  }

  static makeGetUserFaction(): GetUserFaction {
    return new GetUserFaction(new GameDBConnection());
  }

  static makeGetUserRoles(): GetUserRoles {
    return new GetUserRoles(new GameDBConnection());
  }

  static makeForbidUser(): ForbidUser {
    return new ForbidUser(new GameDBConnection());
  }

  static makeRenameRole(): RenameRole {
    return new RenameRole(new GameDBConnection());
  }

  static makeClearStorehousePasswd(): ClearStorehousePasswd {
    return new ClearStorehousePasswd(new GameDBConnection());
  }
}
