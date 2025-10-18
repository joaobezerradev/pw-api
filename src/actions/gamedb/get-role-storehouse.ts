import { BaseRpc, BufferWriter, BufferReader, GameDBConnection, RpcAction } from '../../core';

/**
 * Namespace GetRoleStorehouse
 */
export namespace GetRoleStorehouse {
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

  export type RoleStorehouse = {
    capacity: number;
    money: number;
    items: RoleInventory[];
    size1: number;
    size2: number;
    dress: RoleInventory[];
    material: RoleInventory[];
    size3: number;
    generalcard: RoleInventory[];
    reserved: number;
  };

  export type Output = {
    retcode: number;
    storehouse?: RoleStorehouse;
  };
}

/**
 * RPC GetRoleStorehouse - Type 0x0BD3 (3027 decimal)
 * Obtém apenas o armazém do personagem
 */
export class GetRoleStorehouse extends BaseRpc<GetRoleStorehouse.Input, GetRoleStorehouse.Output> implements RpcAction<GetRoleStorehouse.Input, GetRoleStorehouse.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(0x0BD3, {} as GetRoleStorehouse.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: GetRoleStorehouse.Input): void {
    writer.writeInt32BE(-1);
    writer.writeUInt32BE(input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.storehouse = this.unmarshalRoleStorehouse(reader);
    }
  }

  private unmarshalRoleStorehouse(reader: BufferReader): GetRoleStorehouse.RoleStorehouse {
    return {
      capacity: reader.readUInt32BE(),
      money: reader.readUInt32BE(),
      items: this.unmarshalRoleInventoryArray(reader),
      size1: reader.readUInt8(),
      size2: reader.readUInt8(),
      dress: this.unmarshalRoleInventoryArray(reader),
      material: this.unmarshalRoleInventoryArray(reader),
      size3: reader.readUInt8(),
      generalcard: this.unmarshalRoleInventoryArray(reader),
      reserved: reader.readInt16BE(),
    };
  }

  private unmarshalRoleInventoryArray(reader: BufferReader): GetRoleStorehouse.RoleInventory[] {
    const count = reader.readCompactUINT();
    const items: GetRoleStorehouse.RoleInventory[] = [];
    
    for (let i = 0; i < count; i++) {
      items.push(this.unmarshalRoleInventory(reader));
    }
    
    return items;
  }

  private unmarshalRoleInventory(reader: BufferReader): GetRoleStorehouse.RoleInventory {
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

  async execute(input: GetRoleStorehouse.Input): Promise<GetRoleStorehouse.Output> {
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
