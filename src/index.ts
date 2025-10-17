/**
 * API Client - Exportações principais
 */

// Core
export { Protocol, Rpc, BufferReader, BufferWriter, LogLevel, Logger } from './core';
export { FireAndForgetProtocol, BaseRpc, PaginatedProtocol } from './core';
export { GameServerConfig, getServerConfig } from './config';

// Models (DTOs)
export type {
  RoleBase,
  RoleStatus,
  RoleInventory,
  RolePocket,
  RoleStorehouse,
  MailGoods
} from './models';

// Faction types
export type { FactionInfo, FactionMember } from './actions/get-faction-info/output';
export type { UserFaction } from './actions/get-user-faction/output';

// Actions individuais (para uso avançado/direto)
export { GetRoleBase } from './actions/get-role-base';
export { GetRoleStatus } from './actions/get-role-status';
export { GetRoleBaseStatus } from './actions/get-role-base-status';
export { GetRolePocket } from './actions/get-role-pocket';
export { GetRoleEquipment } from './actions/get-role-equipment';
export { GetRoleStorehouse } from './actions/get-role-storehouse';
export { GetFactionInfo } from './actions/get-faction-info';
export { GetUserFaction } from './actions/get-user-faction';
export { ForbidUser } from './actions/forbid-user';
export { SendMail } from './actions/send-mail';
export { RenameRole } from './actions/rename-role';
export { GetUserRoles } from './actions/get-user-roles';
export { ClearStorehousePasswd } from './actions/clear-storehouse-passwd';

// GM Actions (Protocolos de Gerenciamento)
export { GMBanRole } from './actions/gm-ban-role';
export { GMMuteRole } from './actions/gm-mute-role';
export { ChatBroadcast, ChatChannel } from './actions/chat-broadcast';
export { GMListOnlineUser } from './actions/gm-list-online-user';

// Utilities
export { ServerStatus } from './actions/server-status';
export type { ServerInfo } from './actions/server-status';
