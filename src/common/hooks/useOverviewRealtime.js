import { useEffect, useRef, useState } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import {
    createOverviewConnection,
    OVERVIEW_CHANGED_EVENT,
} from "../../realtime/overviewHub";

// Backoff cho việc tự start lại sau khi onclose (auto-reconnect của SignalR đã bỏ cuộc,
// hoặc handshake đầu tiên fail vì access token hết hạn).
const RESTART_DELAYS_MS = [3000, 5000, 10000, 20000, 30000];

/**
 * Quản lý vòng đời 1 kết nối tới OverviewHub trong suốt thời gian component còn mount.
 *
 * @param {object}   opts
 * @param {(payload: any) => void} opts.onChange  Chạy mỗi khi nhận event "overviewChanged".
 * @param {boolean} [opts.enabled=true]           Tắt để không mở kết nối (vd. chưa đăng nhập).
 * @returns {{ status: 'connecting'|'connected'|'reconnecting'|'disconnected' }}
 */
export function useOverviewRealtime({ onChange, enabled = true }) {
    const [status, setStatus] = useState(enabled ? "connecting" : "disconnected");

    // Giữ onChange trong ref: callback luôn "mới" mà không phải dựng lại kết nối mỗi render.
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!enabled) {
            setStatus("disconnected");
            return;
        }

        let disposed = false;
        let restartAttempt = 0;
        let restartTimer = null;

        const connection = createOverviewConnection();

        connection.on(OVERVIEW_CHANGED_EVENT, (payload) => {
            if (!disposed) onChangeRef.current?.(payload);
        });

        connection.onreconnecting(() => {
            if (!disposed) setStatus("reconnecting");
        });
        connection.onreconnected(() => {
            if (disposed) return;
            restartAttempt = 0;
            setStatus("connected");
            // Bỏ lỡ event trong lúc mất kết nối -> ép đồng bộ lại 1 lần.
            onChangeRef.current?.({ reason: "Reconnected" });
        });
        connection.onclose(() => {
            if (disposed) return;
            setStatus("disconnected");
            scheduleRestart();
        });

        const scheduleRestart = () => {
            if (disposed || restartTimer) return;
            const delay =
                RESTART_DELAYS_MS[Math.min(restartAttempt, RESTART_DELAYS_MS.length - 1)];
            restartAttempt += 1;
            restartTimer = setTimeout(() => {
                restartTimer = null;
                start();
            }, delay);
        };

        const start = async () => {
            if (disposed || connection.state !== HubConnectionState.Disconnected) return;
            setStatus((prev) => (prev === "disconnected" ? "connecting" : prev));
            try {
                await connection.start();
                if (disposed) {
                    connection.stop();
                    return;
                }
                restartAttempt = 0;
                setStatus("connected");
                // Kéo dữ liệu mới ngay khi (re)kết nối, phòng khi có thay đổi lúc offline.
                onChangeRef.current?.({ reason: "Connected" });
            } catch {
                if (!disposed) {
                    setStatus("disconnected");
                    scheduleRestart();
                }
            }
        };

        start();

        return () => {
            disposed = true;
            if (restartTimer) clearTimeout(restartTimer);
            connection.off(OVERVIEW_CHANGED_EVENT);
            // stop() an toàn ở mọi state; nuốt lỗi nếu đang trong lúc start (StrictMode dev).
            connection.stop().catch(() => {});
        };
    }, [enabled]);

    return { status };
}

export default useOverviewRealtime;
