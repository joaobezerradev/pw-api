import { BaseRpc, BufferWriter, BufferReader, GameDBConnection, RpcAction } from '../../core';

/**
 * Namespace ForbidUser
 */
export namespace ForbidUser {
  export type Input = {
    operation: number;
    gmuserid?: number;
    source?: number;
    userid: number;
    time: number;
    reason: string;
  };

  export type Output = {
    retcode: number;
    forbid?: {
      type: number;
      time: number;
      createtime: number;
      reason: string;
    };
  };
}

/**
 * RPC ForbidUser - Type 0x1F44 (8004 decimal)
 * Ban/Unban de conta (user)
 */
export class ForbidUser extends BaseRpc<ForbidUser.Input, ForbidUser.Output> implements RpcAction<ForbidUser.Input, ForbidUser.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(0x1F44, {} as ForbidUser.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: ForbidUser.Input): void {
    writer.writeInt32BE(-1);
    writer.writeUInt8(input.operation);
    writer.writeInt32BE(input.gmuserid ?? -1);
    writer.writeInt32BE(input.source ?? -1);
    writer.writeUInt32BE(input.userid);
    writer.writeUInt32BE(input.time);
    writer.writeOctetsString(input.reason);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.forbid = {
        type: reader.readUInt8(),
        time: reader.readInt32BE(),
        createtime: reader.readInt32BE(),
        reason: reader.readOctetsAsString(),
      };
    }
  }

  async execute(input: ForbidUser.Input): Promise<ForbidUser.Output> {
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
