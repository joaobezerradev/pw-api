import { BaseRpc, BufferWriter, BufferReader } from '../../core';
import { SendMailInput } from './input';
import { SendMailOutput } from './output';

/**
 * Action SendMail - Type 0x1076 (4214 decimal)
 * Envia email do sistema para um personagem (SysSendMail)
 * Porta: 29100 (GDELIVERYD)
 * 
 * @example
 * ```typescript
 * import { SendMail } from './src';
 * 
 * const result = await SendMail.fetch('127.0.0.1', 29100, {
 *   tid: Date.now(),
 *   sysid: 32,
 *   sys_type: 3,
 *   receiver: 1073,
 *   title: 'Título do Email',
 *   context: 'Conteúdo do email',
 *   attach_obj: { id: 0, pos: 0, count: 0, ... },
 *   attach_money: 10000,
 * });
 * ```
 */
export class SendMail extends BaseRpc<SendMailInput, SendMailOutput> {
  constructor(input: SendMailInput) {
    super(0x1076, input, { retcode: 0xFFFF, tid: 0 }); // 4214 decimal - SysSendMail
  }

  marshalArgument(writer: BufferWriter): void {
    // SysSendMail (type 4214 / 0x1076)
    writer.writeUInt32BE(this.input.tid);
    writer.writeInt32BE(this.input.sysid);
    writer.writeUInt8(this.input.sys_type);
    writer.writeInt32BE(this.input.receiver);
    writer.writeOctetsString(this.input.title);
    writer.writeOctetsString(this.input.context);

    // GRoleInventory (attach_obj)
    writer.writeUInt32BE(this.input.attach_obj.id);
    writer.writeInt32BE(this.input.attach_obj.pos);
    writer.writeInt32BE(this.input.attach_obj.count);
    writer.writeInt32BE(this.input.attach_obj.max_count);
    writer.writeOctets(this.input.attach_obj.data);
    writer.writeInt32BE(this.input.attach_obj.proctype);
    writer.writeInt32BE(this.input.attach_obj.expire_date);
    writer.writeInt32BE(this.input.attach_obj.guid1);
    writer.writeInt32BE(this.input.attach_obj.guid2);
    writer.writeInt32BE(this.input.attach_obj.mask);

    // attach_money
    writer.writeUInt32BE(this.input.attach_money);
  }

  unmarshalResult(reader: BufferReader): void {
    // SysSendMail_Re (type 4215 / 0x1077)
    // Testando ordem inversa: tid primeiro, depois retcode
    this.output.tid = reader.readUInt32BE();
    this.output.retcode = reader.readUInt16BE();
  }

  /**
   * Envia email do sistema
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: SendMailInput): Promise<SendMailOutput> {
    const rpc = new SendMail(input);
    return this.executeRpc(host, port, rpc);
  }
}
