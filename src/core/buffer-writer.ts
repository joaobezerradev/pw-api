import { Buffer } from 'node:buffer';
/**
 * BufferWriter - Classe para escrever dados em little-endian
 */
export class BufferWriter {
  private buffers: Buffer[] = [];
  private _size: number = 0;

  /**
   * Escreve um byte (int8)
   */
  writeInt8(value: number): this {
    const buf = Buffer.allocUnsafe(1);
    buf.writeInt8(value, 0);
    this.buffers.push(buf);
    this._size += 1;
    return this;
  }

  /**
   * Escreve um unsigned byte (uint8)
   */
  writeUInt8(value: number): this {
    const buf = Buffer.allocUnsafe(1);
    buf.writeUInt8(value, 0);
    this.buffers.push(buf);
    this._size += 1;
    return this;
  }

  /**
   * Escreve um short (int16) em big-endian
   */
  writeInt16BE(value: number): this {
    const buf = Buffer.allocUnsafe(2);
    buf.writeInt16BE(value, 0);
    this.buffers.push(buf);
    this._size += 2;
    return this;
  }

  /**
   * Escreve um unsigned short (uint16) em big-endian
   */
  writeUInt16BE(value: number): this {
    const buf = Buffer.allocUnsafe(2);
    if (value < 0) value = 0xffff - 1 - value;
    buf.writeUInt16BE(value, 0);
    this.buffers.push(buf);
    this._size += 2;
    return this;
  }

  /**
   * Escreve um int (int32) em big-endian
   */
  writeInt32BE(value: number): this {
    const buf = Buffer.allocUnsafe(4);
    buf.writeInt32BE(value, 0);
    this.buffers.push(buf);
    this._size += 4;
    return this;
  }

  /**
   * Escreve um unsigned int (uint32) em big-endian
   */
  writeUInt32BE(value: number): this {
    const buf = Buffer.allocUnsafe(4);
    if (value < 0) value = 0xffffffff - 1 - value;
    buf.writeUInt32BE(value, 0);
    this.buffers.push(buf);
    this._size += 4;
    return this;
  }

  /**
   * Escreve um float em big-endian
   */
  writeFloatBE(value: number): this {
    const buf = Buffer.allocUnsafe(4);
    buf.writeFloatBE(value, 0);
    this.buffers.push(buf);
    this._size += 4;
    return this;
  }

  /**
   * Escreve um double em big-endian
   */
  writeDoubleBE(value: number): this {
    const buf = Buffer.allocUnsafe(8);
    buf.writeDoubleBE(value, 0);
    this.buffers.push(buf);
    this._size += 8;
    return this;
  }

  /**
   * Escreve um CompactUINT (formato especial usado pelo servidor)
   * Tamanho vari��vel: 1-5 bytes (Big-Endian)
   */
  writeCompactUINT(value: number): this {
    if (value <= 0x7F) {
      // 1 byte: 0xxxxxxx
      this.writeUInt8(value);
    } else if (value <= 0x3FFF) {
      // 2 bytes: 10xxxxxx xxxxxxxx
      this.writeUInt16BE(value + 0x8000);
    } else if (value <= 0x1FFFFFFF) {
      // 4 bytes: 110xxxxx xxxxxxxx xxxxxxxx xxxxxxxx
      this.writeUInt32BE(value + 0xC0000000);
    } else {
      // 5 bytes: 111xxxxx + uint32
      this.writeUInt8(0xE0);
      this.writeUInt32BE(value);
    }
    return this;
  }

  /**
   * Escreve um array de bytes (Octets)
   */
  writeOctets(data: Buffer): this {
    this.writeCompactUINT(data.length);
    this.buffers.push(data);
    this._size += data.length;
    return this;
  }

  /**
   * Escreve uma string UTF-16LE (formato usado pelo servidor)
   */
  writeString(str: string): this {
    if (!str) {
      this.writeUInt8(0);
      return this;
    }
    const buf = Buffer.from(str, 'utf16le');
    this.writeCompactUINT(buf.length);
    this.writeBuffer(buf);
    return this;
  }

  /**
   * Escreve um buffer diretamente
   */
  writeBuffer(buf: Buffer): this {
    this.buffers.push(buf);
    this._size += buf.length;
    return this;
  }

  /**
   * Retorna o tamanho total dos dados escritos
   */
  get size(): number {
    return this._size;
  }

  /**
   * Converte todos os buffers em um ��nico buffer
   */
  toBuffer(): Buffer {
    return Buffer.concat(this.buffers);
  }

  /**
   * Limpa o buffer
   */
  clear(): void {
    this.buffers = [];
    this._size = 0;
  }

  /**
   * Escreve int64 (8 bytes, Big-Endian)
   */
  writeInt64BE(value: bigint | number): this {
    const bigintValue = typeof value === 'bigint' ? value : BigInt(value);
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigInt64BE(bigintValue);
    this.buffers.push(buf);
    this._size += 8;
    return this;
  }

  /**
   * Escreve string como Octets (UTF-16LE)
   */
  writeOctetsString(str: string): this {
    if (!str || str.length === 0) {
      this.writeCompactUINT(0);
      return this;
    }
    const buffer = Buffer.from(str, 'utf16le');
    this.writeOctets(buffer);
    return this;
  }
}

