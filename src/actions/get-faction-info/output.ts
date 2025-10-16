/**
 * GetFactionInfo - Output (Resultado)
 */

export type FactionMember = {
  memberid: number;
  memberrole: number;
};

export type FactionInfo = {
  fid: number;
  name: string;
  level: number;
  masterid: number;
  masterrole: number;
  count: number;
  members: FactionMember[];
  announce: string;
  sysinfo: string;
};

export type GetFactionInfoOutput = {
  retcode: number;
  faction?: FactionInfo;
};

