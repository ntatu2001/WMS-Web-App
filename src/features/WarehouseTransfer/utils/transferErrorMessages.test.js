import { describe, it, expect } from 'vitest';
import { getTransferErrorMessage } from './transferErrorMessages.js';
import { lookup, interpolate } from '../../../common/i18n/index.js';

// t() thuần, không cần Redux/React — dùng đúng dictionary 'vi' như production mặc định.
const t = (key, vars) => interpolate(lookup('vi', key), vars);

const errorWithCode = (code, detail) => ({ response: { data: { code, detail } } });

describe('getTransferErrorMessage', () => {
    it('trả về thông báo chung khi không có response.data', () => {
        expect(getTransferErrorMessage({}, t)).toBe(t('transfer.genericFail'));
        expect(getTransferErrorMessage(new Error('network'), t)).toBe(t('transfer.genericFail'));
    });

    it('map SameWarehouseTransfer', () => {
        const msg = getTransferErrorMessage(errorWithCode('SameWarehouseTransfer'), t);
        expect(msg).toBe(t('transfer.sameWarehouseError'));
    });

    it('map InsufficientQuantity kèm placeholder requested/available', () => {
        const msg = getTransferErrorMessage(
            errorWithCode('InsufficientQuantity', { requested: 100, available: 40 }),
            t
        );
        expect(msg).toBe(t('transfer.insufficientQuantity', { requested: 100, available: 40 }));
        expect(msg).toContain('100');
        expect(msg).toContain('40');
    });

    it('map InvalidTransferStatus kèm placeholder current/expected', () => {
        const msg = getTransferErrorMessage(
            errorWithCode('InvalidTransferStatus', { currentStatus: 'Done', expectedStatus: 'InTransit' }),
            t
        );
        expect(msg).toBe(t('transfer.invalidStatus', { current: 'Done', expected: 'InTransit' }));
    });

    it('map LocationCapacityExceeded dùng chung key storage.capacityExceeded', () => {
        const detail = {
            locationId: 'HN01.1.1.1.1',
            currentUsedVolume: 2.1,
            maxVolume: 3.234,
            incomingVolume: 1.5,
            resultingRate: 112.5,
        };
        const msg = getTransferErrorMessage(errorWithCode('LocationCapacityExceeded', detail), t);
        expect(msg).toBe(
            t('storage.capacityExceeded', {
                loc: detail.locationId,
                used: '2.10',
                max: '3.23',
                incoming: '1.50',
                rate: '112.50',
            })
        );
    });

    it('map IncompleteArrivalPlacement', () => {
        expect(getTransferErrorMessage(errorWithCode('IncompleteArrivalPlacement'), t))
            .toBe(t('transfer.incompleteArrivalPlacement'));
    });

    it('map NotFound.Transfer và NotFound.MaterialSubLot', () => {
        expect(getTransferErrorMessage(errorWithCode('NotFound.Transfer'), t)).toBe(t('transfer.notFoundTransfer'));
        expect(getTransferErrorMessage(errorWithCode('NotFound.MaterialSubLot'), t)).toBe(t('transfer.notFoundSubLot'));
    });

    it('nhận diện thông điệp "pending StockTake" trong lỗi Unexpected', () => {
        const error = { response: { data: { code: 'Unexpected', message: 'Lot X has a pending StockTake.' } } };
        expect(getTransferErrorMessage(error, t)).toBe(t('storage.pendingStockTake'));
    });

    it('fallback về message gốc rồi genericFail khi code không xác định', () => {
        const withMessage = { response: { data: { code: 'Unexpected', message: 'Boom' } } };
        expect(getTransferErrorMessage(withMessage, t)).toBe('Boom');

        const withoutMessage = { response: { data: { code: 'Unexpected' } } };
        expect(getTransferErrorMessage(withoutMessage, t)).toBe(t('transfer.genericFail'));
    });
});
