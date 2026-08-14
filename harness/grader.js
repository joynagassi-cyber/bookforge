export function gradeResult(result, expected) {
  const pass = [];
  const fail = [];
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actual = result[key];
    if (typeof expectedValue === 'number' && String(expectedValue).includes('>=')) {
      const min = parseInt(String(expectedValue).replace('>=', ''));
      if (actual >= min) {
        pass.push({ key, expected: `>=${min}`, actual });
      } else {
        fail.push({ key, expected: `>=${min}`, actual });
      }
    } else if (typeof expectedValue === 'string' && String(expectedValue).includes('>=')) {
      const min = parseInt(String(expectedValue).replace('>=', ''));
      if (actual >= min) {
        pass.push({ key, expected: `>=${min}`, actual });
      } else {
        fail.push({ key, expected: `>=${min}`, actual });
      }
    } else if (typeof expectedValue === 'string') {
      if (actual === expectedValue) {
        pass.push({ key, expected, actual });
      } else {
        fail.push({ key, expected, actual });
      }
    } else if (Array.isArray(expectedValue)) {
      const actualArr = Array.isArray(actual) ? actual : [actual];
      const allPresent = expectedValue.every(v => actualArr.includes(v));
      if (allPresent) {
        pass.push({ key, expected: expectedValue, actual });
      } else {
        fail.push({ key, expected: expectedValue, actual });
      }
    } else {
      if (actual === expectedValue) {
        pass.push({ key, expected, actual });
      } else {
        fail.push({ key, expected, actual });
      }
    }
  }
  return {
    passed: pass,
    failed: fail,
    total: pass.length + fail.length,
    pass_rate: fail.length === 0 ? 1.0 : pass.length / (pass.length + fail.length)
  };
}
