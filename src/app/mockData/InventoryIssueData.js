//#region Mock data for Create Good Issue
export const listIssueMaterials = [
    { id: 1, name: 'Tấm bọc cao su Crematic', code: 'Z75SRCF1', unit: 'Tâm', lotPo: '42699', quantity: 500 },
    { id: 2, name: 'U-Blade Belt Cleaner', code: 'UFRAS0600', unit: 'Cái', lotPo: '16122', quantity: 100 },
    { id: 3, name: 'ACE Rubber Lagging FRAS', code: 'ACEELARL', unit: 'Mét', lotPo: '76511', quantity: 100 },
    { id: 4, name: 'Elastotec NEOPRENE FDA', code: 'ELASRC12K', unit: 'Tấm', lotPo: '56512', quantity: 300 }
];

//#endregion

//#region Mock data for Infor Issue Modal

export const listIssueStorageMaterials = [
    { id: 1, poNumber: "TD45", location: "VT01.3.5.1", storeQuantity: 300, issueQuantity: 300 },
    { id: 2, poNumber: "TD47", location: "VT01.3.6.1", storeQuantity: 300, issueQuantity: 200 }
];

//#endregion

//#region  Mock data for Manage Good Issue
export const listTodayIssues = [
    { id: 1, name: 'Tấm bọc cao su Crematic', code: 'Z75SRCF1', unit: 'Tấm', poNumber: '42699', quantity: 500, receiver: 'Phát Huy', note: '--', status: 'Đang kiểm tra' },
    { id: 2, name: 'U-Blade Belt Cleaner', code: 'UFRAS0600', unit: 'Cái', poNumber: '16122', quantity: 100, receiver: 'Phát Huy', note: '--', status: 'Đang lấy hàng' },
];

export const listRecentIssues = [
    { id: 1, name: 'ACE Rubber Lagging FRAS', code: 'ACEELARL', unit: 'Mét', poNumber: '76511', quantity: 100, receiver: 'Anh Tú', date: '28/02/2025', type: 'Thành phẩm' },
    { id: 2, name: 'Elastotec NEOPRENE FDA', code: 'ELASRC12K', unit: 'Tấm', poNumber: '56521', quantity: 300, receiver: 'Phát Huy', date: '28/02/2025', type: 'Thành phẩm' },
    { id: 3, name: 'Nhựa ABS 14A', code: 'PL10201', unit: 'PCS', poNumber: 'PL5719', quantity: 200, receiver: 'Hùng Vạn', date: '27/02/2025', type: 'Nguyên vật liệu' },
    { id: 4, name: 'Viền cao su ZIPLIGHT', code: 'TYPM04RZLS', unit: 'PCS', poNumber: 'NFD23', quantity: 350, receiver: 'Phát Huy', date: '26/02/2025', type: 'Bán thành phẩm' },
    { id: 5, name: 'Nhãn ép nhiệt Para Light', code: 'LA01001', unit: 'PCS', poNumber: 'MD6062', quantity: 180, receiver: 'Phát Huy', date: '25/02/2025', type: 'Bao Bì' },
];

//#endregion