/**
 * API Client - Exportações principais
 */

// Core
export { Protocol, Rpc, BufferReader, BufferWriter, LogLevel, Logger } from './core';
export { FireAndForgetProtocol, BaseRpc, PaginatedProtocol } from './core';
export { Connection, GameDBConnection, GDeliveryConnection, GProviderConnection } from './core';
export * from './core/interfaces'; // RpcAction, FireAndForgetAction
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
export type { FactionInfo, FactionMember } from './actions/gamedb/get-faction-info';
export type { UserFaction } from './actions/gamedb/get-user-faction';

// Actions - GameDB (porta 29400)
export { GetRoleBase } from './actions/gamedb/get-role-base';
export { GetRoleStatus } from './actions/gamedb/get-role-status';
export { GetRoleBaseStatus } from './actions/gamedb/get-role-base-status';
export { GetRolePocket } from './actions/gamedb/get-role-pocket';
export { GetRoleEquipment } from './actions/gamedb/get-role-equipment';
export { GetRoleStorehouse } from './actions/gamedb/get-role-storehouse';
export { GetFactionInfo } from './actions/gamedb/get-faction-info';
export { GetUserFaction } from './actions/gamedb/get-user-faction';
export { ForbidUser } from './actions/gamedb/forbid-user';
export { RenameRole } from './actions/gamedb/rename-role';
export { GetUserRoles } from './actions/gamedb/get-user-roles';
export { ClearStorehousePasswd } from './actions/gamedb/clear-storehouse-passwd';

// Actions - GDelivery (porta 29100)
export { SendMail } from './actions/gdelivery/send-mail';
export { GMBanRole } from './actions/gdelivery/gm-ban-role';
export { GMMuteRole } from './actions/gdelivery/gm-mute-role';
export { GMListOnlineUser } from './actions/gdelivery/gm-list-online-user';

// Actions - GProvider (porta 29300)
export { ChatBroadcast, ChatChannel } from './actions/gprovider/chat-broadcast';

// Utilities
export { ServerStatus } from './actions/server-status';
export type { ServerInfo } from './actions/server-status';
