export function createUuid(): string {
    const s: any[] = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
        const m = Math.floor(Math.random() * 0x10)
        s[i] = hexDigits.slice(m, m + 1);
    }
    s[14] = '4';
    const n = (s[19] & 0x3) | 0x8
    s[19] = hexDigits.slice(n, n + 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    const uuid = s.join('');
    return uuid;
}
