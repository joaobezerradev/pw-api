import { GameConnection, LogLevel, Rpc, BufferWriter, BufferReader } from './src';

class GetUserFaction extends Rpc {
  private roleId: number;
  public output: any = { retcode: -1 };

  constructor(roleId: number) {
    super(0x11FF); // 4607
    this.roleId = roleId;
  }

  marshalArgument(writer: BufferWriter): void {
    writer.writeInt32BE(-1);  // reason
    writer.writeUInt32BE(this.roleId);  // rid
  }

  unmarshalResult(reader: BufferReader): void {
    this.output.retcode = reader.readInt32BE();
    
    if (this.output.retcode === 0 && reader.hasMore()) {
      // GUserFaction
      this.output.rid = reader.readUInt32BE();
      this.output.name = reader.readOctetsAsString();
      this.output.fid = reader.readUInt32BE();
      this.output.cls = reader.readInt8();
      this.output.role = reader.readInt8();
      this.output.delayexpel = reader.readOctets();
      this.output.extend = reader.readOctets();
      this.output.nickname = reader.readOctetsAsString();
      this.output.level = reader.readInt32BE();
      this.output.contrib = reader.readInt32BE();
      this.output.reputation = reader.readInt32BE();
      this.output.reincarn_times = reader.readUInt8();
      this.output.gender = reader.readUInt8();
    }
  }
}

async function test() {
  console.log('=== Testando GetUserFaction na porta 29100 (GDELIVERYD) ===\n');
  
  const connection = new GameConnection('127.0.0.1', 29100, LogLevel.DEBUG);
  
  try {
    const rpc = await connection.call(new GetUserFaction(1073));
    
    console.log('\n📊 Resultado - Retcode:', rpc.output.retcode);
    
    if (rpc.output.retcode === 0) {
      console.log('\n✅ SUCESSO! Dados da facção:');
      console.log(JSON.stringify(rpc.output, null, 2));
    }
  } catch (err: any) {
    console.error('\n❌ Erro:', err.message);
  }
}

test();
