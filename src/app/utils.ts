export class Utils {
  static noop() {}

  static isFn(value: any): boolean {
    return typeof value === 'function';
  }

  static isArray(value: any): boolean {
    return Array.isArray(value);
  }

  static const(value: any): Function {
    return function() {
      return value;
    };
  }

  static toFactory(value: any, fallback: any): Function {
    value = value === undefined ? fallback : value;
    return Utils.isFn(value) ? value : Utils.const(value);
  }

  static generateID(): string {
    return (
      '_' +
      Math.random()
        .toString(36)
        .substr(2, 9)
    );
  }
}
