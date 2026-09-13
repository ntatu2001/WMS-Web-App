import { describe, it, expect } from 'vitest';
import { decodeRoles, decodeEmployeeId } from './authApi';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function buildFakeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('decodeRoles', () => {
  it('trả về mảng 1 phần tử khi claim role là string', () => {
    const token = buildFakeJwt({ [ROLE_CLAIM]: 'Admin' });
    expect(decodeRoles(token)).toEqual(['Admin']);
  });

  it('trả về nguyên mảng khi claim role đã là array', () => {
    const token = buildFakeJwt({ [ROLE_CLAIM]: ['Manager', 'Admin'] });
    expect(decodeRoles(token)).toEqual(['Manager', 'Admin']);
  });

  it('trả về mảng rỗng khi token không có claim role', () => {
    const token = buildFakeJwt({ sub: 'user1' });
    expect(decodeRoles(token)).toEqual([]);
  });

  it('trả về mảng rỗng khi token sai định dạng (không đủ 3 phần)', () => {
    expect(decodeRoles('not-a-jwt')).toEqual([]);
  });

  it('trả về mảng rỗng khi accessToken null/undefined', () => {
    expect(decodeRoles(null)).toEqual([]);
    expect(decodeRoles(undefined)).toEqual([]);
  });

  it('trả về mảng rỗng khi payload không phải JSON hợp lệ', () => {
    const token = 'header.!!!not-base64-json!!!.signature';
    expect(decodeRoles(token)).toEqual([]);
  });
});

describe('decodeEmployeeId', () => {
  it('trả về employeeId khi có trong payload', () => {
    const token = buildFakeJwt({ employeeId: 'EMP001' });
    expect(decodeEmployeeId(token)).toBe('EMP001');
  });

  it('trả về null khi payload không có employeeId', () => {
    const token = buildFakeJwt({ sub: 'user1' });
    expect(decodeEmployeeId(token)).toBeNull();
  });

  it('trả về null khi accessToken null/undefined', () => {
    expect(decodeEmployeeId(null)).toBeNull();
    expect(decodeEmployeeId(undefined)).toBeNull();
  });

  it('trả về null khi token sai định dạng', () => {
    expect(decodeEmployeeId('not-a-jwt')).toBeNull();
  });
});
