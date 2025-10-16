import { GameConnection, LogLevel, Rpc, BufferWriter, BufferReader } from './src';

// GetUserFaction - Type 4607
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
      console.log('✓ Resposta recebida! Bytes disponíveis:', reader.size() - reader.getOffset());
      
      // GUserFaction
      this.output.rid = reader.readUInt32BE();
      this.output.name = reader.readOctetsAsString();
      this.output.fid = reader.readUInt32BE();
      this.output.cls = reader.readInt8();
      this.output.role = reader.readInt8();
      this.output.delayexpel = reader.readOctets();
      this.output.extend = reader.readOctets();
      this.output.nickname = reader.readOctetsAsString();
      
      // Additional fields
      this.output.level = reader.readInt32BE();
      this.output.contrib = reader.readInt32BE();
      this.output.reputation = reader.readInt32BE();
      this.output.reincarn_times = reader.readUInt8();
      this.output.gender = reader.readUInt8();
      
      console.log('Bytes restantes:', reader.size() - reader.getOffset());
    }
  }
}

async function test() {
  console.log('=== Testando GetUserFaction na porta 29300 (GFACTIOND) ===\n');
  
  const connection = new GameConnection('127.0.0.1', 29300, LogLevel.DEBUG);
  
  try {
    const roleId = 1073;
    console.log(`Consultando roleId: ${roleId}...\n`);
    
    const rpc = await connection.call(new GetUserFaction(roleId));
    
    console.log('\n📊 Resultado:');
    console.log('Retcode:', rpc.output.retcode);
    
    if (rpc.output.retcode === 0) {
      console.log('\n✅ SUCESSO! Dados da facção:');
      console.log({
        roleId: rpc.output.rid,
        personagem: rpc.output.name,
        factionId: rpc.output.fid,
        classe: rpc.output.cls,
        cargo: rpc.output.role,
        apelido: rpc.output.nickname,
        level: rpc.output.level,
        contribuição: rpc.output.contrib,
        reputação: rpc.output.reputation,
        reencarnações: rpc.output.reincarn_times,
        gênero: rpc.output.gender,
      });
    } else {
      console.log('❌ Erro - Retcode:', rpc.output.retcode);
    }
    
  } catch (err: any) {
    console.error('\n❌ Erro na comunicação:', err.message);
  }
}

test();
