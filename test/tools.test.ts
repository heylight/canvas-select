import { describe, it, expect } from 'vitest';
import { createUuid } from '../src/tools';

describe('createUuid', () => {
  it('应生成符合 UUID v4 格式的字符串', () => {
    const uuid = createUuid();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('长度固定为 36 且分隔符位置正确', () => {
    const uuid = createUuid();
    expect(uuid).toHaveLength(36);
    expect(uuid[8]).toBe('-');
    expect(uuid[13]).toBe('-');
    expect(uuid[18]).toBe('-');
    expect(uuid[23]).toBe('-');
  });

  it('第 15 位固定为版本号 4', () => {
    expect(createUuid()[14]).toBe('4');
  });

  it('多次调用不应重复', () => {
    const set = new Set(Array.from({ length: 2000 }, () => createUuid()));
    expect(set.size).toBe(2000);
  });
});
