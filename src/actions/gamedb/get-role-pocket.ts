import { BaseRpc, BufferWriter, BufferReader, GameDBConnection, RpcAction } from '../../core';

/**
 * Namespace GetRolePocket
 */
export namespace GetRolePocket {
  export type Input = {
    roleId: number;
  };

  export type RoleInventory = {
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

  export type RolePocket = {
    capacity: number;
    timestamp: number;
    money: number;
    items: RoleInventory[];
    reserved1: number;
    reserved2: number;
  };

  export type Output = {
    retcode: number;
    pocket?: RolePocket;
  };
}

/**
 * RPC GetRolePocket - Type 0x0BED (3053 decimal)
 * Obtém apenas o inventário do personagem
 */
export class GetRolePocket extends BaseRpc<GetRolePocket.Input, GetRolePocket.Output> implements RpcAction<GetRolePocket.Input, GetRolePocket.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(0x0BED, {} as GetRolePocket.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: GetRolePocket.Input): void {
    writer.writeInt32BE(-1);
    writer.writeUInt32BE(input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.pocket = this.unmarshalRolePocket(reader);
    }
  }

  private unmarshalRolePocket(reader: BufferReader): GetRolePocket.RolePocket {
    return {
      capacity: reader.readInt32BE(),
      timestamp: reader.readInt32BE(),
      money: reader.readInt32BE(),
      items: this.unmarshalRoleInventoryArray(reader),
      reserved1: reader.readInt32BE(),
      reserved2: reader.readInt32BE(),
    };
  }

  private unmarshalRoleInventoryArray(reader: BufferReader): GetRolePocket.RoleInventory[] {
    const count = reader.readCompactUINT();
    const items: GetRolePocket.RoleInventory[] = [];
    
    for (let i = 0; i < count; i++) {
      items.push(this.unmarshalRoleInventory(reader));
    }
    
    return items;
  }

  private unmarshalRoleInventory(reader: BufferReader): GetRolePocket.RoleInventory {
    return {
      id: reader.readUInt32BE(),
      pos: reader.readInt32BE(),
      count: reader.readInt32BE(),
      max_count: reader.readInt32BE(),
      data: reader.readOctets(),
      proctype: reader.readInt32BE(),
      expire_date: reader.readInt32BE(),
      guid1: reader.readInt32BE(),
      guid2: reader.readInt32BE(),
      mask: reader.readInt32BE(),
    };
  }

  async execute(input: GetRolePocket.Input): Promise<GetRolePocket.Output> {
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
