/**
 * GetUserFaction - Output (Resultado)
 */

export type UserFaction = {
  unk1: number;           // Primeiro campo desconhecido
  unk2: number;           // Segundo campo desconhecido
  roleid: number;         // ID do personagem
  name: string;           // Nome do personagem
  factionid: number;      // ID da facção
  cls: number;            // Classe
  role: number;           // Cargo na facção
  delayexpel: Buffer;     // Dados de expulsão
  extend: Buffer;         // Dados estendidos
  nickname: string;       // Apelido na facção
};

export type GetUserFactionOutput = {
  retcode: number;
  faction?: UserFaction;
};

