// Backend luôn trả HTTP 400 cho mọi lỗi kèm { code, message, detail } (xem UserGuide/API_Guide_For_Frontend.md mục 2.2).
export function getApiErrorMessage(error, fallback = 'Đã có lỗi xảy ra.') {
    return error?.response?.data?.message || error?.response?.data?.code || error?.message || fallback;
}
