import { GameConnection, LogLevel, Rpc, BufferWriter, BufferReader } from './src';

// GetFactionInfo - Type 4606 (0x11FE)
class GetFactionInfo extends Rpc {
  private factionId: number;
  public output: any = { retcode: -1 };

  constructor(factionId: number) {
    super(0x11FE); // 4606
    this.factionId = factionId;
  }

  marshalArgument(writer: BufferWriter): void {
    writer.writeInt32BE(-1);  // Primeiro parâmetro (como no PHP)
    writer.writeUInt32BE(this.factionId);  // factionid
  }

  unmarshalResult(reader: BufferReader): void {
    // Ler e descartar os dois primeiros UInt32 (como no PHP)
    const discard1 = reader.readUInt32BE();
    const discard2 = reader.readUInt32BE();
    
    console.log('Descartados:', discard1, discard2);
    
    // Agora ler a estrutura GFactionInfo
    this.output.fid = reader.readUInt32BE();
    this.output.name = reader.readOctetsAsString();
    this.output.level = reader.readUInt8();
    
    // Master (GMember)
    this.output.masterid = reader.readUInt32BE();
    this.output.masterrole = reader.readUInt8();
    
    // Members count
    this.output.count = reader.readCompactUINT();
    this.output.members = [];
    
    for (let i = 0; i < this.output.count; i++) {
      this.output.members.push({
        memberid: reader.readUInt32BE(),
        memberrole: reader.readUInt8(),
      });
    }
    
    this.output.announce = reader.readOctetsAsString();
    this.output.sysinfo = reader.readOctetsAsString();
  }
}

async function test() {
  console.log('=== Testando GetFactionInfo (como no PHP) ===\n');
  
  const connection = new GameConnection('127.0.0.1', 29400, LogLevel.INFO);
  
  try {
    // Testar com um factionId conhecido (você precisa saber o ID da facção)
    const factionId = 1;
    console.log(`Consultando factionId: ${factionId}...\n`);
    
    const rpc = await connection.call(new GetFactionInfo(factionId));
    
    console.log('\n✅ Resultado:');
    console.log(JSON.stringify(rpc.output, null, 2));
    
  } catch (err: any) {
    console.error('\n❌ Erro:', err.message);
  }
}

test();
