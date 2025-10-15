/**
 * Output para GetRoleStatus RPC
 */

export type RoleStatus = {
  version: number;
  level: number;
  level2: number;
  exp: number;
  sp: number;
  pp: number;
  hp: number;
  mp: number;
  posx: number;
  posy: number;
  posz: number;
  worldtag: number;
  invader_state: number;
  invader_time: number;
  pariah_time: number;
  reputation: number;
};

export type GetRoleStatusOutput = {
  retcode: number;
  status?: RoleStatus;
};

