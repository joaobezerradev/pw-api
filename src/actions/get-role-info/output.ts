/**
 * GetRoleInfo - Output (Resultado)
 */

export type RoleInfo = {
  version: number;
  id: number;
  name: string;
  race: number;
  cls: number;
  gender: number;
  level: number;
  level2: number;
  posx: number;
  posy: number;
  posz: number;
  worldtag: number;
  custom_data: Buffer;
  custom_stamp: number;
  custom_status: Buffer;
  charactermode: Buffer;
  equipment: Array<any>;  // GRoleInventoryVector
  status: number;
  delete_time: number;
  create_time: number;
  lastlogin_time: number;
  forbid: Array<{
    type: number;
    time: number;
    createtime: number;
    reason: string;
  }>;
  referrer_role: number;
  cash_add: number;
  cross_data: Buffer;
  reincarnation_data: Buffer;
  realm_data: Buffer;
};

export type GetRoleInfoOutput = {
  retcode: number;
  info?: RoleInfo;
};

