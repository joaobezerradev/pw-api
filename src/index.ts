/**
 * API Client - Exportações principais
 * Estrutura DDD: Domain, Application, Infrastructure
 */

// ===== DOMAIN LAYER =====
// Interfaces e contratos do domínio
export * from './domain';

// ===== INFRASTRUCTURE LAYER =====
// Conexões
export { Connection, GameDBConnection, GDeliveryConnection, GProviderConnection } from './infra/connections';

// Protocolos
export { BaseRpc, FireAndForgetProtocol } from './infra/protocols';

// IO Utilities
export { BufferReader, BufferWriter } from './infra/io';

// Logger
export { Logger, LogLevel } from './infra/logger';

// Config
export { GameServerConfig, getServerConfig } from './infra/config';

// ===== INFRASTRUCTURE - API CLIENTS =====
// GameDB Client (porta 29400)
export {
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
} from './infra/clients/gamedb';

// GDelivery Client (porta 29100)
export {
  SendMail,
  GMBanRole,
  GMMuteRole,
  GMListOnlineUser,
} from './infra/clients/gdelivery';

// GProvider Client (porta 29300)
export { ChatBroadcast, ChatChannel } from './infra/clients/gprovider';

// ===== CLIENT TYPES (usando namespaces das actions) =====
// Tipos extraídos dos namespaces das actions
export type RoleBase = import('./infra/clients/gamedb/get-role-base').GetRoleBase.RoleBase;
export type RoleStatus = import('./infra/clients/gamedb/get-role-status').GetRoleStatus.RoleStatus;
export type RoleInventory = import('./infra/clients/gamedb/get-role-equipment').GetRoleEquipment.RoleInventory;
export type RolePocket = import('./infra/clients/gamedb/get-role-pocket').GetRolePocket.RolePocket;
export type RoleStorehouse = import('./infra/clients/gamedb/get-role-storehouse').GetRoleStorehouse.RoleStorehouse;
export type FactionInfo = import('./infra/clients/gamedb/get-faction-info').GetFactionInfo.FactionInfo;
export type FactionMember = import('./infra/clients/gamedb/get-faction-info').GetFactionInfo.FactionMember;
export type UserFaction = import('./infra/clients/gamedb/get-user-faction').GetUserFaction.UserFaction;

// ===== UTILITIES =====
export { ServerStatus } from './infra/clients/server-status';
export type { ServerInfo } from './infra/clients/server-status';

// ===== IoC FACTORIES =====
// Inversion of Control - Maneira simplificada de criar instâncias
export { GameDBFactory, GDeliveryFactory, GProviderFactory } from './infra/ioc';
