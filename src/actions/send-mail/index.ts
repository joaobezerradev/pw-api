import { Rpc, BufferWriter, BufferReader } from '../../core';
import { SendMailInput } from './input';
import { SendMailOutput } from './output';

/**
 * Action SendMail - Type 0x1076 (4214 decimal)
 * Envia email do sistema para um personagem (SysSendMail)
 */
export class SendMail extends Rpc {
  private input: SendMailInput;
  public output: SendMailOutput = { retcode: 0xFFFF, tid: 0 };

  constructor(input: SendMailInput) {
    super(0x1076); // 4214 decimal - SysSendMail
    this.input = input;
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
}
