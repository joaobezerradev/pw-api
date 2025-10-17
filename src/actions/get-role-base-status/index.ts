import { BaseRpc, BufferWriter, BufferReader } from '../../core';
import { GetRoleBaseStatusInput } from './input';
import { GetRoleBaseStatusOutput, RoleBase, RoleStatus } from './output';

/**
 * RPC GetRoleBaseStatus - Type 0x0BD1 (3025 decimal)
 * Obtém base + status do personagem (mais eficiente que 2 chamadas separadas)
 */
export class GetRoleBaseStatus extends BaseRpc<GetRoleBaseStatusInput, GetRoleBaseStatusOutput> {
  constructor(input: GetRoleBaseStatusInput) {
    super(0x0BD1, input, { retcode: -1 }); // 3025
  }

  marshalArgument(writer: BufferWriter): void {
    writer.writeInt32BE(-1);  // localsid (sempre -1)
    writer.writeUInt32BE(this.input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.base = this.unmarshalRoleBase(reader);
      
      if (reader.hasMore()) {
        this.output.status = this.unmarshalRoleStatus(reader);
      }
    }
  }

  private unmarshalRoleBase(reader: BufferReader): RoleBase {
    const version = reader.readUInt8();
    const id = reader.readInt32BE();
    const name = reader.readOctetsAsString();
    const race = reader.readInt32BE();
    const cls = reader.readInt32BE();
    const gender = reader.readUInt8();
    const custom_data = reader.readOctets();
    const config_data = reader.readOctets();
    const custom_stamp = reader.readInt32BE();
    const status = reader.readUInt8();
    const delete_time = reader.readInt32BE();
    const create_time = reader.readInt32BE();
    const lastlogin_time = reader.readInt32BE();

    const forbidCount = reader.readCompactUINT();
    const forbid = [];
    for (let i = 0; i < forbidCount; i++) {
      forbid.push({
        type: reader.readUInt8(),
        time: reader.readInt32BE(),
        createtime: reader.readInt32BE(),
        reason: reader.readOctetsAsString(),
      });
    }

    const help_states = reader.readOctets();
    const spouse = reader.readInt32BE();
    const userid = reader.readInt32BE();
    const cross_data = reader.readOctets();

    reader.readUInt8(); // reserved2
    reader.readUInt8(); // reserved3
    reader.readUInt8(); // reserved4

    return { version, id, name, race, cls, gender, custom_data, config_data, custom_stamp, 
             status, delete_time, create_time, lastlogin_time, forbid, help_states, 
             spouse, userid, cross_data };
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

  /**
   * Busca base + status de um personagem (otimizado)
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: GetRoleBaseStatusInput): Promise<GetRoleBaseStatusOutput> {
    const rpc = new GetRoleBaseStatus(input);
    return this.executeRpc(host, port, rpc);
  }
};

export type { GetRoleBaseStatusInput, GetRoleBaseStatusOutput, RoleBase, RoleStatus };

