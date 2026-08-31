import {
    HubConnectionBuilder,
    HttpTransportType,
    LogLevel,
} from "@microsoft/signalr";
import store from "../store/store";

// Cùng origin với axiosClient (http://localhost:5037/WarehouseAPI/). Hub được backend map tại
// "/WarehouseAPI/hubs/overview" — xem UserGuide/Realtime_Overview_SignalR_Guide.md mục 3.3.
const API_BASE_URL = "http://localhost:5037/WarehouseAPI/";
export const OVERVIEW_HUB_URL = `${API_BASE_URL}hubs/overview`;

// Tên event server -> client (một chiều). FE nhận được thì refetch 2 REST endpoint của Tổng quan.
export const OVERVIEW_CHANGED_EVENT = "overviewChanged";

/**
 * Tạo 1 HubConnection tới OverviewHub.
 * - accessTokenFactory được SignalR gọi lại ở mỗi lần (re)negotiate => tự lấy access token mới
 *   sau khi Redux dispatch tokensRefreshed, không cần tự xử lý rotation.
 * - Token đi qua query string ?access_token=... (WebSocket không gắn được header Authorization).
 */
export function createOverviewConnection() {
    return new HubConnectionBuilder()
        .withUrl(OVERVIEW_HUB_URL, {
            accessTokenFactory: () => store.getState().auth.accessToken || "",
            transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();
}
