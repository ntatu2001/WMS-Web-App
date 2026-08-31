import { useEffect, useRef } from "react";

/**
 * Gọi lại `callback` theo chu kỳ `intervalMs`. Dùng làm fallback khi kết nối realtime bị mất.
 * - Bỏ qua tick khi tab đang ẩn (document.hidden) để đỡ tốn request/pin.
 * - callback được giữ trong ref nên đổi callback không làm reset interval.
 *
 * @param {() => void} callback
 * @param {number} intervalMs
 * @param {boolean} [enabled=true]
 */
export function usePolling(callback, intervalMs, enabled = true) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled || !intervalMs) return;

        const tick = () => {
            if (!document.hidden) savedCallback.current();
        };

        const id = setInterval(tick, intervalMs);
        document.addEventListener("visibilitychange", tick);

        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", tick);
        };
    }, [intervalMs, enabled]);
}

export default usePolling;
