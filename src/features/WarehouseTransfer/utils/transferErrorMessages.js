// Diễn giải lỗi trả về từ các API Transfer (Transfer/CreateTransfer, ConfirmDeparture,
// ConfirmArrival, CancelTransfer) theo đúng bảng mã lỗi ở
// UserGuide/Warehouse_Transfer_API_Guide.md mục 6.
export const getTransferErrorMessage = (error, t) => {
    const data = error?.response?.data;
    if (!data) return t('transfer.genericFail');

    switch (data.code) {
        case 'SameWarehouseTransfer':
            return t('transfer.sameWarehouseError');

        case 'InsufficientQuantity': {
            const d = data.detail || {};
            return t('transfer.insufficientQuantity', { requested: d.requested, available: d.available });
        }

        case 'InvalidTransferStatus': {
            const d = data.detail || {};
            return t('transfer.invalidStatus', { current: d.currentStatus, expected: d.expectedStatus });
        }

        case 'LocationCapacityExceeded': {
            // Tái dùng đúng key/format đã dùng cho lỗi vượt sức chứa ở Sơ đồ kho (MoveMaterialSubLot)
            // vì cấu trúc detail giống hệt nhau (mục 5.5 bước 3 trong guide).
            const d = data.detail || {};
            const fmt = (n) => (typeof n === 'number' ? n.toFixed(2) : n);
            return t('storage.capacityExceeded', {
                loc: d.locationId,
                used: fmt(d.currentUsedVolume),
                max: fmt(d.maxVolume),
                incoming: fmt(d.incomingVolume),
                rate: fmt(d.resultingRate),
            });
        }

        case 'IncompleteArrivalPlacement':
            return t('transfer.incompleteArrivalPlacement');

        case 'NotFound.Transfer':
            return t('transfer.notFoundTransfer');

        case 'NotFound.MaterialSubLot':
            return t('transfer.notFoundSubLot');

        default: {
            const message = data.message || '';
            if (message.includes('pending StockTake')) return t('storage.pendingStockTake');
            return message || t('transfer.genericFail');
        }
    }
};
