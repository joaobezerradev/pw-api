import { BaseRpc, BufferWriter, BufferReader } from '../../core';
import { GetUserFactionInput } from './input';
import { GetUserFactionOutput, UserFaction } from './output';

/**
 * RPC GetUserFaction - Type 0x11FF (4607 decimal)
 * Obtém informações da facção do personagem pelo roleId
 * Porta: 29400 (GAMEDBD)
 * 
 * @example
 * ```typescript
 * import { GetUserFaction } from './src';
 * 
 * const result = await GetUserFaction.fetch('127.0.0.1', 29400, {
 *   roleId: 1073,
 * });
 * ```
 */
export class GetUserFaction extends BaseRpc<GetUserFactionInput, GetUserFactionOutput> {
  constructor(input: GetUserFactionInput) {
    super(0x11FF, input, { retcode: -1 }); // 4607
  }

  marshalArgument(writer: BufferWriter): void {
    // Seguindo exatamente o código PHP:
    // $getfaction->WriteUInt32(-1);
    // $getfaction->WriteUInt32(1);
    // $getfaction->WriteUInt32($roleid);
    writer.writeInt32BE(-1);
    writer.writeUInt32BE(1);
    writer.writeUInt32BE(this.input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    // Seguindo a leitura do PHP
    const unk1 = reader.readUInt32BE();
    const unk2 = reader.readUInt32BE();
    const roleid = reader.readUInt32BE();
    const name = reader.readOctetsAsString();
    const factionid = reader.readUInt32BE();
    const cls = reader.readUInt8();
    const role = reader.readUInt8();
    const delayexpel = reader.readOctets();
    const extend = reader.readOctets();
    const nickname = reader.readOctetsAsString();

    this.output.retcode = 0;  // Se chegou aqui, sucesso
    this.output.faction = {
      unk1,
      unk2,
      roleid,
      name,
      factionid,
      cls,
      role,
      delayexpel,
      extend,
      nickname,
    };
  }

  /**
   * Busca facção do personagem
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: GetUserFactionInput): Promise<GetUserFactionOutput> {
    const rpc = new GetUserFaction(input);
    return this.executeRpc(host, port, rpc);
  }
}

export type { GetUserFactionInput, GetUserFactionOutput, UserFaction };

