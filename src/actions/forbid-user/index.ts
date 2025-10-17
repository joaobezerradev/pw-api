import { BaseRpc, BufferWriter, BufferReader } from '../../core';
import { ForbidUserInput } from './input';
import { ForbidUserOutput } from './output';

/**
 * RPC ForbidUser - Type 0x1F44 (8004 decimal)
 * Ban/Unban de conta (user)
 * Porta: 29400 (GAMEDBD)
 * 
 * @example
 * ```typescript
 * import { ForbidUser } from './src';
 * 
 * // Banir conta
 * const result = await ForbidUser.fetch('127.0.0.1', 29400, {
 *   operation: 1, // 1 = ban, 0 = unban
 *   userid: 1090,
 *   time: 3600, // 1 hora
 *   reason: 'Violação de regras',
 * });
 * ```
 */
export class ForbidUser extends BaseRpc<ForbidUserInput, ForbidUserOutput> {
  constructor(input: ForbidUserInput) {
    super(0x1F44, input, { retcode: -1 }); // 8004
  }

  marshalArgument(writer: BufferWriter): void {
    // Seguindo o código PHP:
    // WriteUInt32(-1); // always
    // WriteUByte(operation);
    // WriteUInt32(-1); // gmuserid
    // WriteUInt32(-1); // source
    // WriteUInt32(userid);
    // WriteUInt32(time);
    // WriteUString(reason);
    
    writer.writeInt32BE(-1);  // always
    writer.writeUInt8(this.input.operation);
    writer.writeInt32BE(this.input.gmuserid ?? -1);
    writer.writeInt32BE(this.input.source ?? -1);
    writer.writeUInt32BE(this.input.userid);
    writer.writeUInt32BE(this.input.time);
    writer.writeOctetsString(this.input.reason);
  }

  unmarshalResult(reader: BufferReader): void {
    // Lê localsid primeiro (como outros RPCs)
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      // GRoleForbid structure
      this.output.forbid = {
        type: reader.readUInt8(),
        time: reader.readInt32BE(),
        createtime: reader.readInt32BE(),
        reason: reader.readOctetsAsString(),
      };
    }
  }

  /**
   * Ban/Unban de conta
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: ForbidUserInput): Promise<ForbidUserOutput> {
    const rpc = new ForbidUser(input);
    return this.executeRpc(host, port, rpc);
  }
}

export type { ForbidUserInput, ForbidUserOutput };

