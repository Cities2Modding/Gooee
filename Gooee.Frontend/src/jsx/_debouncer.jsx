import "react";

// This is from MIT licensed https://github.com/xnimorz/use-debounce and modified
// to be compatible with this environment.
/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked, or until the next browser frame is drawn.
 *
 * The debounced function comes with a `cancel` method to cancel delayed `func`
 * invocations and a `flush` method to immediately invoke them.
 *
 * Provide `options` to indicate whether `func` should be invoked on the leading
 * and/or trailing edge of the `wait` timeout. The `func` is invoked with the
 * last arguments provided to the debounced function.
 *
 * Subsequent calls to the debounced function return the result of the last
 * `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * If `wait` is omitted in an environment with `requestAnimationFrame`, `func`
 * invocation will be deferred until the next frame is drawn (typically about
 * 16ms).
 *
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0]
 *  The number of milliseconds to delay; if omitted, `requestAnimationFrame` is
 *  used (if available, otherwise it will be setTimeout(...,0)).
 * @param {Object} [options={}] The options object.
 * @returns {Function} Returns the new debounced function.
 */
export default function useDebouncedCallback(func, wait, options) {
    const react = window.$_gooee.react;
    const lastCallTime = react.useRef(null);
    const lastInvokeTime = react.useRef(0);
    const timerId = react.useRef(null);
    const lastArgs = react.useRef([]);
    const lastThis = react.useRef();
    const result = react.useRef();
    const funcRef = react.useRef(func);
    const mounted = react.useRef(true);
  funcRef.current = func;

  const isClientSize = typeof window !== 'undefined';
  const useRAF = !wait && wait !== 0 && isClientSize;

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  wait = +wait || 0;
  options = options || {};

  const leading = !!options.leading;
  const trailing = 'trailing' in options ? !!options.trailing : true;
  const maxing = 'maxWait' in options;
  const debounceOnServer = 'debounceOnServer' in options ? !!options.debounceOnServer : false;
  const maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : null;

  react.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const debounced = react.useMemo(() => {
    const invokeFunc = (time) => {
      const args = lastArgs.current;
      const thisArg = lastThis.current;

      lastArgs.current = lastThis.current = null;
      lastInvokeTime.current = time;
      return (result.current = funcRef.current.apply(thisArg, args));
    };

    const startTimer = (pendingFunc, wait) => {
      if (useRAF) cancelAnimationFrame(timerId.current);
      timerId.current = useRAF ? requestAnimationFrame(pendingFunc) : setTimeout(pendingFunc, wait);
    };

    const shouldInvoke = (time) => {
      if (!mounted.current) return false;

      const timeSinceLastCall = time - lastCallTime.current;
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      return (
        !lastCallTime.current ||
        timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= maxWait)
      );
    };

    const trailingEdge = (time) => {
      timerId.current = null;

      if (trailing && lastArgs.current) {
        return invokeFunc(time);
      }
      lastArgs.current = lastThis.current = null;
      return result.current;
    };

    const timerExpired = () => {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }

      if (!mounted.current) {
        return;
      }

      const timeSinceLastCall = time - lastCallTime.current;
      const timeSinceLastInvoke = time - lastInvokeTime.current;
      const timeWaiting = wait

 - timeSinceLastCall;
      const remainingWait = maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;

      startTimer(timerExpired, remainingWait);
    };

    const func = (...args) => {
      if (!isClientSize && !debounceOnServer) {
        return;
      }
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgs.current = args;
      lastThis.current = this;
      lastCallTime.current = time;

      if (isInvoking) {
        if (!timerId.current && mounted.current) {
          lastInvokeTime.current = lastCallTime.current;
          startTimer(timerExpired, wait);
          return leading ? invokeFunc(lastCallTime.current) : result.current;
        }
        if (maxing) {
          startTimer(timerExpired, wait);
          return invokeFunc(lastCallTime.current);
        }
      }
      if (!timerId.current) {
        startTimer(timerExpired, wait);
      }
      return result.current;
    };

    func.cancel = () => {
      if (timerId.current) {
        useRAF ? cancelAnimationFrame(timerId.current) : clearTimeout(timerId.current);
      }
      lastInvokeTime.current = 0;
      lastArgs.current = lastCallTime.current = lastThis.current = timerId.current = null;
    };

    func.isPending = () => {
      return !!timerId.current;
    };

    func.flush = () => {
      return !timerId.current ? result.current : trailingEdge(Date.now());
    };

    return func;
  }, [leading, maxing, wait, maxWait, trailing, useRAF, isClientSize, debounceOnServer]);

  return debounced;
}