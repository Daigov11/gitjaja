import zlib from "node:zlib";

function chunk(tag, data) {
  var len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  var crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([tag, data])), 0);
  return Buffer.concat([len, tag, data, crc]);
}

// PNG 1x1 válido generado en memoria, sin depender de archivos externos.
export function tinyPng() {
  var sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  var ihdr = chunk(Buffer.from("IHDR"), Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]));
  var idat = chunk(Buffer.from("IDAT"), zlib.deflateSync(Buffer.from([0, 255, 0, 0])));
  var iend = chunk(Buffer.from("IEND"), Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}
