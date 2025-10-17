import { BaseRpc, BufferWriter, BufferReader } from '../../core';
import { GetFactionInfoInput } from './input';
import { GetFactionInfoOutput, FactionInfo, FactionMember } from './output';

/**
 * RPC GetFactionInfo - Type 0x11FE (4606 decimal)
 * Obtém informações completas da facção pelo factionId
 * Porta: 29400 (GAMEDBD)
 * 
 * @example
 * ```typescript
 * import { GetFactionInfo } from './src';
 * 
 * const result = await GetFactionInfo.fetch('127.0.0.1', 29400, {
 *   factionId: 1,
 * });
 * ```
 */
export class GetFactionInfo extends BaseRpc<GetFactionInfoInput, GetFactionInfoOutput> {
  constructor(input: GetFactionInfoInput) {
    super(0x11FE, input, { retcode: -1 }); // 4606
  }

  marshalArgument(writer: BufferWriter): void {
    writer.writeInt32BE(-1);  // Primeiro parâmetro
    writer.writeUInt32BE(this.input.factionId);
  }

  unmarshalResult(reader: BufferReader): void {
    // Descartar os dois primeiros UInt32 (seguindo o padrão do PHP)
    reader.readUInt32BE();
    reader.readUInt32BE();

    // Ler GFactionInfo
    const fid = reader.readUInt32BE();
    const name = reader.readOctetsAsString();
    const level = reader.readUInt8();
    
    // Master (GMember)
    const masterid = reader.readUInt32BE();
    const masterrole = reader.readUInt8();
    
    // Members
    const count = reader.readCompactUINT();
    const members: FactionMember[] = [];
    
    for (let i = 0; i < count; i++) {
      members.push({
        memberid: reader.readUInt32BE(),
        memberrole: reader.readUInt8(),
      });
    }
    
    const announce = reader.readOctetsAsString();
    const sysinfo = reader.readOctetsAsString();

    this.output.retcode = 0;  // Se chegou aqui, sucesso
    this.output.faction = {
      fid,
      name,
      level,
      masterid,
      masterrole,
      count,
      members,
      announce,
      sysinfo,
    };
  }

  /**
   * Busca informações da facção
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: GetFactionInfoInput): Promise<GetFactionInfoOutput> {
    const rpc = new GetFactionInfo(input);
    return this.executeRpc(host, port, rpc);
  }
}

export type { GetFactionInfoInput, GetFactionInfoOutput, FactionInfo, FactionMember };

