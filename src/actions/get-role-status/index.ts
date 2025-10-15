import { Rpc, BufferWriter, BufferReader } from '../../core';
import { GetRoleStatusInput } from './input';
import { GetRoleStatusOutput, RoleStatus } from './output';

/**
 * RPC GetRoleStatus - Type 0x0BC7 (3015 decimal)
 * Obtém apenas o status do personagem (level, HP, MP, posição, etc)
 */
export class GetRoleStatus extends Rpc {
  private input: GetRoleStatusInput;
  public output: GetRoleStatusOutput = { retcode: -1 };

  constructor(input: GetRoleStatusInput) {
    super(0x0BC7); // 3015
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
      this.output.status = this.unmarshalRoleStatus(reader);
    }
  }

  private unmarshalRoleStatus(reader: BufferReader): RoleStatus {
    const status: RoleStatus = {
      version: reader.readUInt8(),
      level: reader.readInt32BE(),
      level2: reader.readInt32BE(),
      exp: reader.readInt32BE(),
      sp: reader.readInt32BE(),
      pp: reader.readInt32BE(),
      hp: reader.readInt32BE(),
      mp: reader.readInt32BE(),
      posx: reader.readFloatBE(),
      posy: reader.readFloatBE(),
      posz: reader.readFloatBE(),
      worldtag: reader.readUInt32BE(),
      invader_state: reader.readInt32BE(),
      invader_time: reader.readInt32BE(),
      pariah_time: reader.readInt32BE(),
      reputation: reader.readInt32BE(),
    };

    // Resto dos campos (todos obrigatórios mas não expostos no output)
    reader.readOctets(); // custom_status
    reader.readOctets(); // filter_data
    reader.readOctets(); // charactermode
    reader.readOctets(); // instancekeylist
    reader.readInt32BE(); // dbltime_expire
    reader.readInt32BE(); // dbltime_mode
    reader.readInt32BE(); // dbltime_begin
    reader.readInt32BE(); // dbltime_used
    reader.readInt32BE(); // dbltime_max
    reader.readInt32BE(); // time_used
    reader.readOctets(); // dbltime_data
    reader.readUInt16BE(); // storesize
    reader.readOctets(); // petcorral
    reader.readOctets(); // property
    reader.readOctets(); // var_data
    reader.readOctets(); // skills
    reader.readOctets(); // storehousepasswd
    reader.readOctets(); // waypointlist
    reader.readOctets(); // coolingtime
    reader.readOctets(); // npc_relation
    reader.readOctets(); // multi_exp_ctrl
    reader.readOctets(); // storage_task
    reader.readOctets(); // faction_contrib
    reader.readOctets(); // force_data
    reader.readOctets(); // online_award
    reader.readOctets(); // profit_time_data
    reader.readOctets(); // country_data
    reader.readOctets(); // king_data
    reader.readOctets(); // meridian_data
    reader.readOctets(); // extraprop
    reader.readOctets(); // title_data
    reader.readInt32BE(); // reserved5

    return status;
  }
};

export type { GetRoleStatusInput, GetRoleStatusOutput, RoleStatus };

