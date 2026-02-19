type Fn = (...args: any[]) => any;
export declare const useStableCallback: <T extends Fn>(value: T) => (...args: Parameters<T>) => ReturnType<T>;
export {};
//# sourceMappingURL=useStableCallback.d.ts.map