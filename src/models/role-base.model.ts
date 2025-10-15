/**
 * Model - Dados básicos do personagem
 */
export type RoleBase = {
  version: number;
  id: number;
  name: string;
  race: number;
  cls: number;
  gender: number;
  custom_data: Buffer;
  config_data: Buffer;
  custom_stamp: number;
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
  help_states: Buffer;
  spouse: number;
  userid: number;
  cross_data: Buffer;
};

