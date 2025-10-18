import { RpcAction } from '@domain/contracts';
import { BaseRpc } from '@infra/protocols';
import { BufferWriter, BufferReader } from '@infra/io';
import { GameDBConnection } from '@infra/connections';

/**
 * Namespace GetUserRoles
 */
export namespace GetUserRoles {
  export type Input = {
    userid: number;
  };

  export type RoleInfo = {
    roleid: number;
    rolename: string;
  };

  export type Output = {
    retcode: number;
    count: number;
    roles: RoleInfo[];
  };
}

/**
 * RPC GetUserRoles - Type 3401 (0xD49)
 * Lista todos os personagens (roles) de uma conta
 */
export class GetUserRoles extends BaseRpc<GetUserRoles.Input, GetUserRoles.Output> implements RpcAction<GetUserRoles.Input, GetUserRoles.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(3401, {} as GetUserRoles.Input, { retcode: -1, count: 0, roles: [] });
  }

  marshalArgument(writer: BufferWriter, input: GetUserRoles.Input): void {
    writer.writeInt32BE(-1);
    writer.writeInt32BE(input.userid);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();
    
    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.count = reader.readCompactUINT();
      this.output.roles = [];
      
      for (let i = 0; i < this.output.count; i++) {
        const roleid = reader.readUInt32BE();
        const rolename = reader.readOctetsAsString();
        
        this.output.roles.push({
          roleid,
          rolename
        });
      }
    }
  }

  async execute(input: GetUserRoles.Input): Promise<GetUserRoles.Output> {
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
