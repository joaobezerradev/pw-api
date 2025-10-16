import { Rpc, BufferWriter, BufferReader } from '../../core';
import { GetUserFactionInput } from './input';
import { GetUserFactionOutput, UserFaction } from './output';

/**
 * RPC GetUserFaction - Type 0x11FF (4607 decimal)
 * Obtém informações da facção do personagem pelo roleId
 * 
 * IMPORTANTE: Envia 3 parâmetros conforme código PHP
 */
export class GetUserFaction extends Rpc {
  private input: GetUserFactionInput;
  public output: GetUserFactionOutput = { retcode: -1 };

  constructor(input: GetUserFactionInput) {
    super(0x11FF); // 4607
    this.input = input;
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
}

export type { GetUserFactionInput, GetUserFactionOutput, UserFaction };

