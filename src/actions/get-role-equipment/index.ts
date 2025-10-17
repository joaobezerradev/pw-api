import { Rpc, BufferWriter, BufferReader } from '../../core';
import { GetRoleEquipmentInput } from './input';
import { GetRoleEquipmentOutput, RoleInventory } from './output';

/**
 * RPC GetRoleEquipment - Type 0x0BC9 (3017 decimal)
 * Obtém apenas os equipamentos do personagem
 */
export class GetRoleEquipment extends Rpc {
  private input: GetRoleEquipmentInput;
  public output: GetRoleEquipmentOutput = { retcode: -1, equipment: [] };

  constructor(input: GetRoleEquipmentInput) {
    super(0x0BC9); // 3017
    this.input = input;
  }

  marshalArgument(writer: BufferWriter): void {
    writer.writeInt32BE(-1);  // localsid (sempre -1)
    writer.writeUInt32BE(this.input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.equipment = this.unmarshalRoleInventoryArray(reader);
    }
  }

  private unmarshalRoleInventoryArray(reader: BufferReader): RoleInventory[] {
    const count = reader.readCompactUINT();
    const items: RoleInventory[] = [];
    
    for (let i = 0; i < count; i++) {
      items.push(this.unmarshalRoleInventory(reader));
    }
    
    return items;
  }

  private unmarshalRoleInventory(reader: BufferReader): RoleInventory {
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

  /**
   * Busca equipamentos de um personagem
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: GetRoleEquipmentInput): Promise<GetRoleEquipmentOutput> {
    return new Promise((resolve, reject) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(20000);
      
      socket.on('error', (err: Error) => reject(err));
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      let responseBuffer = Buffer.alloc(0);
      let foundResponse = false;
      
      socket.on('data', (data: Buffer) => {
        responseBuffer = Buffer.concat([responseBuffer, data]);
        if (foundResponse) return;
        
        try {
          const reader = new BufferReader(responseBuffer);
          const responseType = reader.readCompactUINT();
          const size = reader.readCompactUINT();
          
          if (responseBuffer.length >= reader.getOffset() + size) {
            foundResponse = true;
            const rpc = new GetRoleEquipment(input);
            rpc.unmarshalResult(reader);
            socket.end();
            resolve(rpc.output);
          }
        } catch (error) {
          // Aguarda mais dados
        }
      });
      
      socket.on('connect', () => {
        try {
          const rpc = new GetRoleEquipment(input);
          const dataWriter = new BufferWriter();
          rpc.marshalArgument(dataWriter);
          const data = dataWriter.toBuffer();
          
          const writer = new BufferWriter();
          writer.writeCompactUINT(rpc.getType());
          writer.writeCompactUINT(data.length);
          writer.writeBuffer(data);
          
          socket.write(writer.toBuffer());
        } catch (error) {
          socket.destroy();
          reject(error);
        }
      });
      
      socket.connect(port, host);
    });
  }
};

export type { GetRoleEquipmentInput, GetRoleEquipmentOutput, RoleInventory };

