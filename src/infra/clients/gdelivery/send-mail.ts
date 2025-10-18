import { RpcAction } from '@domain/contracts';
import { BaseRpc } from '@infra/protocols';
import { BufferWriter, BufferReader } from '@infra/io';
import { GDeliveryConnection } from '@infra/connections';

/**
 * Namespace SendMail
 */
export namespace SendMail {
  export type MailAttachItem = {
    id: number;
    pos: number;
    count: number;
    max_count: number;
    data: Buffer;
    proctype: number;
    expire_date: number;
    guid1: number;
    guid2: number;
    mask: number;
  };

  export type Input = {
    tid: number;
    sysid: number;
    sys_type: number;
    receiver: number;
    title: string;
    context: string;
    attach_obj: MailAttachItem;
    attach_money: number;
  };

  export type Output = {
    retcode: number;
    tid: number;
  };
}

/**
 * Action SendMail - Type 0x1076 (4214 decimal)
 * Envia email do sistema para um personagem (SysSendMail)
 */
export class SendMail extends BaseRpc<SendMail.Input, SendMail.Output> implements RpcAction<SendMail.Input, SendMail.Output> {
  constructor(private readonly connection: GDeliveryConnection) {
    super(0x1076, {} as SendMail.Input, { retcode: 0xFFFF, tid: 0 });
  }

  marshalArgument(writer: BufferWriter, input: SendMail.Input): void {
    writer.writeUInt32BE(input.tid);
    writer.writeInt32BE(input.sysid);
    writer.writeUInt8(input.sys_type);
    writer.writeInt32BE(input.receiver);
    writer.writeOctetsString(input.title);
    writer.writeOctetsString(input.context);

    writer.writeUInt32BE(input.attach_obj.id);
    writer.writeInt32BE(input.attach_obj.pos);
    writer.writeInt32BE(input.attach_obj.count);
    writer.writeInt32BE(input.attach_obj.max_count);
    writer.writeOctets(input.attach_obj.data);
    writer.writeInt32BE(input.attach_obj.proctype);
    writer.writeInt32BE(input.attach_obj.expire_date);
    writer.writeInt32BE(input.attach_obj.guid1);
    writer.writeInt32BE(input.attach_obj.guid2);
    writer.writeInt32BE(input.attach_obj.mask);

    writer.writeUInt32BE(input.attach_money);
  }

  unmarshalResult(reader: BufferReader): void {
    this.output.tid = reader.readUInt32BE();
    this.output.retcode = reader.readUInt16BE();
  }

  async execute(input: SendMail.Input): Promise<SendMail.Output> {
    this.input = input;
    const dataWriter = new BufferWriter();
    this.marshalArgument(dataWriter, input);
    const data = dataWriter.toBuffer();
    
    return new Promise((resolve, reject) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(this.connection.timeout);
      socket.on('error', (err: Error) => reject(err));
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      let responseBuffer = Buffer.alloc(0);
      
      socket.on('data', (chunk: Buffer) => {
        responseBuffer = Buffer.concat([responseBuffer, chunk]);
        
        try {
          const reader = new BufferReader(responseBuffer);
          const responseType = reader.readCompactUINT();
          const size = reader.readCompactUINT();
          
          if (responseBuffer.length >= reader.getOffset() + size) {
            this.unmarshalResult(reader);
            socket.end();
            resolve(this.output);
          }
        } catch (error) {
          // Aguarda mais dados
        }
      });
      
      socket.on('connect', () => {
        const writer = new BufferWriter();
        writer.writeCompactUINT(this.getType());
        writer.writeCompactUINT(data.length);
        writer.writeBuffer(data);
        socket.write(writer.toBuffer());
      });
      
      socket.connect(this.connection.port, this.connection.host);
    });
  }
}
