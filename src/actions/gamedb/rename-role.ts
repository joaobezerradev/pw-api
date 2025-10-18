import { BaseRpc, BufferWriter, BufferReader, GameDBConnection, RpcAction } from '../../core';

/**
 * Namespace RenameRole
 */
export namespace RenameRole {
  export type Input = {
    roleId: number;
    oldName: string;
    newName: string;
  };

  export type Output = {
    retcode: number;
  };
}

/**
 * RPC RenameRole - Type 3404 (0xD4C)
 * Renomeia um personagem (role)
 * 
 * ⚠️ RECOMENDADO: Personagem deve estar OFFLINE para evitar problemas
 */
export class RenameRole extends BaseRpc<RenameRole.Input, RenameRole.Output> implements RpcAction<RenameRole.Input, RenameRole.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(3404, {} as RenameRole.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: RenameRole.Input): void {
    writer.writeInt32BE(-1);
    writer.writeInt32BE(input.roleId);
    writer.writeOctetsString(input.oldName);
    writer.writeOctetsString(input.newName);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();
  }

  async execute(input: RenameRole.Input): Promise<RenameRole.Output> {
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
