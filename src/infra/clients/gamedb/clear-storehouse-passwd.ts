import { RpcAction } from '@domain/contracts';
import { BaseRpc } from '@infra/protocols';
import { BufferWriter, BufferReader } from '@infra/io';
import { GameDBConnection } from '@infra/connections';

/**
 * Namespace ClearStorehousePasswd
 */
export namespace ClearStorehousePasswd {
  export type Input = {
    roleid: number;
    rolename?: string;
  };

  export type Output = {
    retcode: number;
  };
}

/**
 * RPC ClearStorehousePasswd - Type 3402 (0xD4A)
 * Remove o lock/senha do armazém da conta
 * 
 * ⚠️ IMPORTANTE: O personagem PRECISA estar OFFLINE/deslogado para funcionar!
 */
export class ClearStorehousePasswd extends BaseRpc<ClearStorehousePasswd.Input, ClearStorehousePasswd.Output> implements RpcAction<ClearStorehousePasswd.Input, ClearStorehousePasswd.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(3402, {} as ClearStorehousePasswd.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: ClearStorehousePasswd.Input): void {
    writer.writeInt32BE(-1);
    writer.writeInt32BE(input.roleid);
    writer.writeOctetsString(input.rolename || '');
    writer.writeOctetsString('');
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();
  }

  async execute(input: ClearStorehousePasswd.Input): Promise<ClearStorehousePasswd.Output> {
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
