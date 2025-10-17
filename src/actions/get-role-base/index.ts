import { BaseRpc, BufferWriter, BufferReader } from '../../core';
import { GetRoleBaseInput } from './input';
import { GetRoleBaseOutput, RoleBase } from './output';

/**
 * RPC GetRoleBase - Type 0x0BC5 (3013 decimal)
 * Obtém apenas os dados básicos do personagem
 * Porta: 29400 (GAMEDBD)
 * 
 * @example
 * ```typescript
 * import { GetRoleBase } from './src';
 * 
 * // Buscar dados básicos de um personagem
 * const result = await GetRoleBase.fetch('127.0.0.1', 29400, {
 *   roleId: 1024,
 * });
 * 
 * if (result.retcode === 0) {
 *   console.log(`Nome: ${result.base?.name}`);
 *   console.log(`Nível: ${result.base?.cls}`);
 * }
 * ```
 */
export class GetRoleBase extends BaseRpc<GetRoleBaseInput, GetRoleBaseOutput> {
  constructor(input: GetRoleBaseInput) {
    super(0x0BC5, input, { retcode: -1 }); // 3013
  }

  marshalArgument(writer: BufferWriter): void {
    writer.writeInt32BE(-1);  // localsid (sempre -1)
    writer.writeUInt32BE(this.input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.base = this.unmarshalRoleBase(reader);
    }
  }

  private unmarshalRoleBase(reader: BufferReader): RoleBase {
    const version = reader.readUInt8();
    const id = reader.readInt32BE();
    const name = reader.readOctetsAsString();
    const race = reader.readInt32BE();
    const cls = reader.readInt32BE();
    const gender = reader.readUInt8();
    const custom_data = reader.readOctets();
    const config_data = reader.readOctets();
    const custom_stamp = reader.readInt32BE();
    const status = reader.readUInt8();
    const delete_time = reader.readInt32BE();
    const create_time = reader.readInt32BE();
    const lastlogin_time = reader.readInt32BE();

    const forbidCount = reader.readCompactUINT();
    const forbid = [];
    for (let i = 0; i < forbidCount; i++) {
      forbid.push({
        type: reader.readUInt8(),
        time: reader.readInt32BE(),
        createtime: reader.readInt32BE(),
        reason: reader.readOctetsAsString(),
      });
    }

    const help_states = reader.readOctets();
    const spouse = reader.readInt32BE();
    const userid = reader.readInt32BE();
    const cross_data = reader.readOctets();

    // reserved2, reserved3, reserved4
    reader.readUInt8();
    reader.readUInt8();
    reader.readUInt8();

    return { version, id, name, race, cls, gender, custom_data, config_data, custom_stamp, 
             status, delete_time, create_time, lastlogin_time, forbid, help_states, 
             spouse, userid, cross_data };
  }

  /**
   * Busca dados básicos de um personagem
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: GetRoleBaseInput): Promise<GetRoleBaseOutput> {
    const rpc = new GetRoleBase(input);
    return this.executeRpc(host, port, rpc);
  }
};

export type { GetRoleBaseInput, GetRoleBaseOutput, RoleBase };

