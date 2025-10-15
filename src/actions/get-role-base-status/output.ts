/**
 * Output para GetRoleBaseStatus RPC
 */

import { RoleBase } from '../../models/role-base.model';
import { RoleStatus } from '../../models/role-status.model';

export type GetRoleBaseStatusOutput = {
  retcode: number;
  base?: RoleBase;
  status?: RoleStatus;
};

export type { RoleBase, RoleStatus };

