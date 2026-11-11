/**
 * BorderP45 TON Testnet Address & Security Validation Engine
 * Enforces strict TON testnet address validation, CRC16 checksum verification,
 * and rejection of mainnet addresses (requiring test-only flag 0x80).
 */

// CRC16-XMODEM lookup table (polynomial 0x1021)
const CRC16_TABLE = new Uint16Array(256);
for (let i = 0; i < 256; i++) {
  let curr = i << 8;
  for (let j = 0; j < 8; j++) {
    if ((curr & 0x8000) !== 0) {
      curr = ((curr << 1) ^ 0x1021) & 0xffff;
    } else {
      curr = (curr << 1) & 0xffff;
    }
  }
  CRC16_TABLE[i] = curr;
}

export function crc16XModem(data: Uint8Array): number {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    crc = ((crc << 8) ^ CRC16_TABLE[((crc >> 8) ^ byte) & 0xff]) & 0xffff;
  }
  return crc;
}

export interface TonAddressValidationResult {
  valid: boolean;
  network: 'testnet' | 'mainnet' | 'unknown';
  chainId: number; // -3 for TON testnet, -239 for mainnet
  format: 'friendly-bounceable' | 'friendly-non-bounceable' | 'raw' | 'invalid';
  workchain: number;
  hashHex?: string;
  rawAddress?: string;
  bounceableAddress?: string;
  nonBounceableAddress?: string;
  testOnlyFlag: boolean;
  crcMatch?: boolean;
  errorMessage?: string;
}

/**
 * Normalizes base64url to base64
 */
function normalizeBase64(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return base64;
}

function toBase64Url(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function validateTonAddress(input: string): TonAddressValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      valid: false,
      network: 'unknown',
      chainId: 0,
      format: 'invalid',
      workchain: 0,
      testOnlyFlag: false,
      errorMessage: 'Address cannot be empty.',
    };
  }

  // Check Raw format: (-1|0):[64-hex chars]
  const rawMatch = trimmed.match(/^(-?1|0):([0-9a-fA-F]{64})$/);
  if (rawMatch) {
    const workchain = parseInt(rawMatch[1], 10);
    const hashHex = rawMatch[2].toLowerCase();
    const hashBuf = Buffer.from(hashHex, 'hex');

    // Create testnet bounceable (tag: 0x91 for bounceable + testnet, or 0x94)
    // Testnet tag: bit 7 is set (0x80). Bounceable is 0x11 | 0x80 = 0x91. Non-bounceable is 0x51 | 0x80 = 0xd1
    const testBounceableTag = 0x91;
    const testNonBounceableTag = 0xd1;

    const bPayload = Buffer.concat([Buffer.from([testBounceableTag, workchain === -1 ? 0xff : 0x00]), hashBuf]);
    const bCrc = crc16XModem(bPayload);
    const bFull = Buffer.concat([bPayload, Buffer.from([(bCrc >> 8) & 0xff, bCrc & 0xff])]);

    const nbPayload = Buffer.concat([Buffer.from([testNonBounceableTag, workchain === -1 ? 0xff : 0x00]), hashBuf]);
    const nbCrc = crc16XModem(nbPayload);
    const nbFull = Buffer.concat([nbPayload, Buffer.from([(nbCrc >> 8) & 0xff, nbCrc & 0xff])]);

    return {
      valid: true,
      network: 'testnet',
      chainId: -3,
      format: 'raw',
      workchain,
      hashHex,
      rawAddress: `${workchain}:${hashHex}`,
      bounceableAddress: toBase64Url(bFull),
      nonBounceableAddress: toBase64Url(nbFull),
      testOnlyFlag: true,
      crcMatch: true,
    };
  }

  // Friendly address validation (48 chars standard)
  if (trimmed.length !== 48) {
    return {
      valid: false,
      network: 'unknown',
      chainId: 0,
      format: 'invalid',
      workchain: 0,
      testOnlyFlag: false,
      errorMessage: `Invalid address length (${trimmed.length} chars). Friendly TON addresses must be 48 characters.`,
    };
  }

  let decoded: Buffer;
  try {
    const normalized = normalizeBase64(trimmed);
    decoded = Buffer.from(normalized, 'base64');
  } catch (err) {
    return {
      valid: false,
      network: 'unknown',
      chainId: 0,
      format: 'invalid',
      workchain: 0,
      testOnlyFlag: false,
      errorMessage: 'Invalid base64/base64url encoding in address string.',
    };
  }

  if (decoded.length !== 36) {
    return {
      valid: false,
      network: 'unknown',
      chainId: 0,
      format: 'invalid',
      workchain: 0,
      testOnlyFlag: false,
      errorMessage: `Invalid binary byte count (${decoded.length} bytes, expected 36 bytes).`,
    };
  }

  const payload = decoded.subarray(0, 34);
  const expectedCrc = (decoded[34] << 8) | decoded[35];
  const computedCrc = crc16XModem(payload);

  if (expectedCrc !== computedCrc) {
    return {
      valid: false,
      network: 'unknown',
      chainId: 0,
      format: 'invalid',
      workchain: 0,
      testOnlyFlag: false,
      crcMatch: false,
      errorMessage: `CRC16 checksum mismatch (calculated 0x${computedCrc.toString(16).padStart(4, '0')}, received 0x${expectedCrc.toString(16).padStart(4, '0')}).`,
    };
  }

  const tag = decoded[0];
  const workchainByte = decoded[1];
  const workchain = workchainByte === 0xff ? -1 : workchainByte;
  const hashBuf = decoded.subarray(2, 34);
  const hashHex = hashBuf.toString('hex');
  const rawAddress = `${workchain}:${hashHex}`;

  // Check test-only flag: Bit 7 (0x80)
  const isTestnet = (tag & 0x80) !== 0;
  const isBounceable = (tag & 0x40) === 0; // standard bounceable flag check (0x11 has bit 6 off, 0x51 has bit 6 on)

  if (!isTestnet) {
    return {
      valid: false,
      network: 'mainnet',
      chainId: -239,
      format: isBounceable ? 'friendly-bounceable' : 'friendly-non-bounceable',
      workchain,
      hashHex,
      rawAddress,
      testOnlyFlag: false,
      crcMatch: true,
      errorMessage: 'REJECTED: Mainnet address detected! BorderP45 security policy mandates testnet address with test-only flag (starts with "kQ" or "0Q", tag bit 0x80). Mainnet addresses (EQ... / UQ...) are strictly blocked to prevent fund loss.',
    };
  }

  // Derive bounceable and non-bounceable testnet variations
  const bPayload = Buffer.concat([Buffer.from([0x91, workchainByte]), hashBuf]);
  const bCrc = crc16XModem(bPayload);
  const bFull = Buffer.concat([bPayload, Buffer.from([(bCrc >> 8) & 0xff, bCrc & 0xff])]);

  const nbPayload = Buffer.concat([Buffer.from([0xd1, workchainByte]), hashBuf]);
  const nbCrc = crc16XModem(nbPayload);
  const nbFull = Buffer.concat([nbPayload, Buffer.from([(nbCrc >> 8) & 0xff, nbCrc & 0xff])]);

  return {
    valid: true,
    network: 'testnet',
    chainId: -3,
    format: isBounceable ? 'friendly-bounceable' : 'friendly-non-bounceable',
    workchain,
    hashHex,
    rawAddress,
    bounceableAddress: toBase64Url(bFull),
    nonBounceableAddress: toBase64Url(nbFull),
    testOnlyFlag: true,
    crcMatch: true,
  };
}
