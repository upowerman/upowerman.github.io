import CryptoJS from 'crypto-js'

export type AesMode = 'CBC' | 'ECB' | 'CTR' | 'OFB' | 'CFB'
export type AesPadding = 'Pkcs7' | 'ZeroPadding' | 'NoPadding' | 'AnsiX923' | 'Iso10126'
export type AesEncoding = 'Base64' | 'Hex'
export type AesKeyFormat = 'Utf8' | 'Hex'

const MODE_MAP: Record<AesMode, any> = {
  CBC: CryptoJS.mode.CBC,
  ECB: CryptoJS.mode.ECB,
  CTR: CryptoJS.mode.CTR,
  OFB: CryptoJS.mode.OFB,
  CFB: CryptoJS.mode.CFB
}

const PAD_MAP: Record<AesPadding, any> = {
  Pkcs7: CryptoJS.pad.Pkcs7,
  ZeroPadding: CryptoJS.pad.ZeroPadding,
  NoPadding: CryptoJS.pad.NoPadding,
  AnsiX923: CryptoJS.pad.AnsiX923,
  Iso10126: CryptoJS.pad.Iso10126
}

function parseInputData(data: string, format: AesKeyFormat | AesEncoding) {
  if (format === 'Hex') {
    return CryptoJS.enc.Hex.parse(data.trim())
  }
  return CryptoJS.enc.Utf8.parse(data)
}

export function aesEncrypt(options: {
  text: string
  key: string
  keyFormat?: AesKeyFormat
  iv?: string
  ivFormat?: AesKeyFormat
  mode?: AesMode
  padding?: AesPadding
  outputEncoding?: AesEncoding
}): { success: boolean; result: string; error?: string } {
  try {
    if (!options.text) return { success: true, result: '' }
    if (!options.key) return { success: false, result: '', error: '请输入加密密钥 (Key)' }

    const mode = options.mode || 'CBC'
    const padding = options.padding || 'Pkcs7'
    const outputEncoding = options.outputEncoding || 'Base64'

    const keyWordArray = parseInputData(options.key, options.keyFormat || 'Utf8')
    const cfg: any = {
      mode: MODE_MAP[mode] || CryptoJS.mode.CBC,
      padding: PAD_MAP[padding] || CryptoJS.pad.Pkcs7
    }

    if (mode !== 'ECB') {
      if (!options.iv) {
        return { success: false, result: '', error: `${mode} 模式必须提供初始向量 (IV)` }
      }
      cfg.iv = parseInputData(options.iv, options.ivFormat || 'Utf8')
    }

    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(options.text), keyWordArray, cfg)

    let result = ''
    if (outputEncoding === 'Hex') {
      result = encrypted.ciphertext.toString(CryptoJS.enc.Hex)
    } else {
      result = encrypted.toString() // 默认为标准 Base64 格式
    }

    return { success: true, result }
  } catch (err: any) {
    return { success: false, result: '', error: err?.message || 'AES 加密失败，请检查输入与参数' }
  }
}

export function aesDecrypt(options: {
  ciphertext: string
  key: string
  keyFormat?: AesKeyFormat
  iv?: string
  ivFormat?: AesKeyFormat
  mode?: AesMode
  padding?: AesPadding
  inputEncoding?: AesEncoding
}): { success: boolean; result: string; error?: string } {
  try {
    if (!options.ciphertext) return { success: true, result: '' }
    if (!options.key) return { success: false, result: '', error: '请输入解密密钥 (Key)' }

    const mode = options.mode || 'CBC'
    const padding = options.padding || 'Pkcs7'
    const inputEncoding = options.inputEncoding || 'Base64'

    const keyWordArray = parseInputData(options.key, options.keyFormat || 'Utf8')
    const cfg: any = {
      mode: MODE_MAP[mode] || CryptoJS.mode.CBC,
      padding: PAD_MAP[padding] || CryptoJS.pad.Pkcs7
    }

    if (mode !== 'ECB') {
      if (!options.iv) {
        return { success: false, result: '', error: `${mode} 模式解密必须提供初始向量 (IV)` }
      }
      cfg.iv = parseInputData(options.iv, options.ivFormat || 'Utf8')
    }

    let cipherParams: any
    if (inputEncoding === 'Hex') {
      const hexCipher = options.ciphertext.trim().replace(/\s+/g, '')
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(hexCipher)
      })
    } else {
      cipherParams = options.ciphertext.trim()
    }

    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWordArray, cfg)
    const result = decrypted.toString(CryptoJS.enc.Utf8)

    if (!result && options.ciphertext.length > 0) {
      return { success: false, result: '', error: '解密失败：可能密钥、IV、模式或填充不匹配' }
    }

    return { success: true, result }
  } catch (err: any) {
    return { success: false, result: '', error: err?.message || 'AES 解密异常，密文或参数非法' }
  }
}

export function generateRandomAesKey(bitLength: 128 | 192 | 256 = 128, format: 'Hex' | 'Utf8' = 'Hex'): string {
  const byteLength = bitLength / 8
  const randomWords = CryptoJS.lib.WordArray.random(byteLength)
  if (format === 'Hex') {
    return randomWords.toString(CryptoJS.enc.Hex)
  }
  // 生成 ASCII 安全可打印字符
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let res = ''
  const bytes = new Uint8Array(byteLength)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < byteLength; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < byteLength; i++) {
    res += chars[bytes[i] % chars.length]
  }
  return res
}

export function generateRandomIv(format: 'Hex' | 'Utf8' = 'Hex'): string {
  return generateRandomAesKey(128, format)
}

export function getAesCodeSnippet(language: 'java' | 'python' | 'nodejs' | 'go', mode: AesMode, padding: AesPadding): string {
  const padName = padding === 'Pkcs7' ? 'PKCS5Padding' : padding
  if (language === 'java') {
    return `// Java AES 加密示例 (${mode}/${padName})
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

public class AesDemo {
    public static String encrypt(String content, String key, String iv) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/${mode}/${padName}");
        SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "AES");
        ${mode === 'ECB' ? 'cipher.init(Cipher.ENCRYPT_MODE, keySpec);' : 'IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes(StandardCharsets.UTF_8));\n        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);'}
        byte[] encrypted = cipher.doFinal(content.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encrypted);
    }
}`
  }

  if (language === 'python') {
    return `# Python 示例 (基于 pycryptodome 库: pip install pycryptodome)
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64

def aes_encrypt(content: str, key: str, iv: str) -> str:
    key_bytes = key.encode('utf-8')
    ${mode === 'ECB' ? 'cipher = AES.new(key_bytes, AES.MODE_ECB)' : 'cipher = AES.new(key_bytes, AES.MODE_CBC, iv.encode("utf-8"))'}
    raw = pad(content.encode('utf-8'), AES.block_size)
    encrypted = cipher.encrypt(raw)
    return base64.b64encode(encrypted).decode('utf-8')`
  }

  if (language === 'nodejs') {
    return `// Node.js 原生 crypto 模块示例
const crypto = require('crypto');

function aesEncrypt(text, key, iv) {
    const algorithm = 'aes-128-${mode.toLowerCase()}';
    ${mode === 'ECB' ? 'const cipher = crypto.createCipheriv(algorithm, key, null);' : 'const cipher = crypto.createCipheriv(algorithm, key, iv);'}
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}`
  }

  return `// Go 语言标准库示例 (crypto/aes, crypto/cipher)
package main

import (
    "bytes"
    "crypto/aes"
    "crypto/cipher"
    "encoding/base64"
)

func AesEncrypt(plainText, key, iv []byte) (string, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return "", err
    }
    // PKCS7 填充
    blockSize := block.BlockSize()
    padding := blockSize - len(plainText)%blockSize
    padtext := bytes.Repeat([]byte{byte(padding)}, padding)
    orig := append(plainText, padtext...)

    mode := cipher.NewCBCEncrypter(block, iv)
    crypted := make([]byte, len(orig))
    mode.CryptBlocks(crypted, orig)
    return base64.StdEncoding.EncodeToString(crypted), nil
}`
}
