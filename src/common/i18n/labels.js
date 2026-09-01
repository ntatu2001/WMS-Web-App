// Maps canonical (Vietnamese) data values — the ones stored in mock data and sent
// to the API — to i18n keys, so the UI can display a localized label while the
// underlying <option value> / API payload stays unchanged.

// Stock-take reason (see src/app/mockData/reasonData.js)
export const reasonLabelKey = {
  'Hư hỏng': 'reasons.damaged',
  'Hết hạn': 'reasons.expired',
  'Thất lạc': 'reasons.missing',
  'Dư thừa': 'reasons.overstock',
  'Thiếu hụt': 'reasons.understock',
  'Kiểm đếm lại': 'reasons.recount',
  'Đánh giá lại chất lượng': 'reasons.qualityReassessment',
};

// Stock-take type (see src/app/mockData/AdjustmentType.js)
export const adjustmentTypeLabelKey = {
  'Kiểm kê định kỳ': 'adjustmentTypes.periodic',
  'Kiểm kê thường xuyên': 'adjustmentTypes.continuous',
  'Kiểm kê chu kỳ': 'adjustmentTypes.cycle',
  'Kiểm kê ngẫu nhiên': 'adjustmentTypes.random',
};

// Lot workflow status — canonical Vietnamese display strings from
// lotStatusChangeData (see src/app/mockData/LotStatusData.js), also used as
// keys into the color map and for `=== "Hoàn thành"` checks, so unchanged.
export const lotStatusLabelKey = {
  'Đang thực hiện': 'status.inProgress',
  'Chờ xử lý': 'status.pending',
  'Hoàn thành': 'status.done',
  'Đã hủy': 'status.cancelled',
  'Tạm hoãn': 'status.holdOn',
  'Bị chặn': 'status.blocked',
};

// Warehouse-map cell status — canonical Vietnamese strings produced by the
// distribution/layout processing code, also compared with `===`, so unchanged.
export const cellStatusLabelKey = {
  'Đang chứa hàng': 'storage.distInUse',
  'Được phân bổ': 'storage.distAllocated',
  'Đã đầy': 'storage.distFull',
  'Trống': 'storage.statusEmpty',
};

// Stock-take variance status (see src/app/mockData/StockTakeStatusData.js)
export const varianceStatusLabelKey = {
  'Khớp': 'status.match',
  'Thiếu': 'status.short',
  'Dư': 'status.over',
};

// Warehouse-type names — canonical Vietnamese strings that double as data values
// in some hardcoded create forms; display localized, keep the underlying value.
export const warehouseTypeLabelKey = {
  'Kho thành phẩm': 'dashboard.whFinished',
  'Kho bán thành phẩm': 'dashboard.whSemiFinished',
  'Kho nguyên vật liệu': 'dashboard.whRawMaterial',
  'Kho vật tư': 'dashboard.whSupplies',
  'Kho bao bì': 'dashboard.whPackaging',
};

// Resolve helper: returns t(key) when a mapping exists, else the raw value.
export const resolveLabel = (map, value, t) => {
  const key = map[value];
  return key ? t(key) : (value ?? '');
};
