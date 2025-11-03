export function getChangedFields(
  updateData: Record<string, any>,
  existing: any,
): string[] {
  const changed: string[] = [];
  if (!updateData) return changed;
  for (const key of Object.keys(updateData)) {
    const newValue = updateData[key];
    if (typeof newValue === 'undefined') continue;
    const oldValue = (existing as any)?.[key];
    if (isDifferentValue(oldValue, newValue)) changed.push(key);
  }
  return changed;
}

export function isDifferentValue(a: any, b: any): boolean {
  const normalize = (v: any) => {
    if (v === null || v === undefined) return undefined;
    if (v instanceof Date) return v.getTime();
    if (typeof v === 'string') return v.trim();
    if (typeof v === 'number' || typeof v === 'boolean') return v;
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };
  return normalize(a) !== normalize(b);
}

export function hasObjectChanges(
  newObj: Record<string, any>,
  oldObj: Record<string, any>,
): boolean {
  if (!newObj) return false;
  const keys = Object.keys(newObj);
  for (const key of keys) {
    if (typeof newObj[key] === 'undefined') continue;
    if (isDifferentValue(oldObj?.[key], newObj[key])) return true;
  }
  return false;
}

export function hasArrayOfObjectsChanges(newArr: any[], oldArr: any[]): boolean {
  if (!Array.isArray(newArr)) return false;
  const normalizeObject = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    const sortedKeys = Object.keys(obj).sort();
    const result: any = {};
    for (const k of sortedKeys) {
      const v = obj[k];
      result[k] = typeof v === 'object' && v !== null ? normalizeObject(v) : v;
    }
    return result;
  };
  const normalizeArray = (arr: any[]) =>
    (arr || [])
      .map((i) => normalizeObject(i))
      .map((i) => JSON.stringify(i))
      .sort();

  const a = normalizeArray(newArr || []);
  const b = normalizeArray(oldArr || []);
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return true;
  }
  return false;
}

export function hasSetChanges(newIds: string[], oldIds: string[]): boolean {
  const a = new Set(newIds || []);
  const b = new Set(oldIds || []);
  if (a.size !== b.size) return true;
  for (const id of a) {
    if (!b.has(id)) return true;
  }
  return false;
}


