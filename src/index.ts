/**
 * API Client - Exportações principais
 */

// Core
export { GameConnection, Protocol, Rpc, BufferReader, BufferWriter, LogLevel, Logger } from './core';
export { GameServerConfig, getServerConfig } from './config';

// Services (Camada de negócio - agregação)
export { RoleService } from './services';

// Actions (Operações diretas - RPCs/Protocols)
export { RoleActions } from './actions/role-actions';

// Models (DTOs)
export type {
  RoleBase,
  RoleStatus,
  RoleInventory,
  RolePocket,
  RoleStorehouse,
  MailGoods
} from './models';

// Actions individuais (para uso avançado/direto)
export { GetRoleBase } from './actions/get-role-base';
export { GetRoleStatus } from './actions/get-role-status';
export { GetRoleBaseStatus } from './actions/get-role-base-status';
export { GetRolePocket } from './actions/get-role-pocket';
export { GetRoleEquipment } from './actions/get-role-equipment';
export { GetRoleStorehouse } from './actions/get-role-storehouse';
export { SendMail } from './actions/send-mail';
