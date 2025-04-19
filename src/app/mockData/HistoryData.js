//#region  Mock data for Receipt History
export const listReceiptHistory = [
    {warehouse: 'Nguyên vật liệu', zone: 'NL02', receiver: 'Văn Bảo', quantity: 100, lotPo: 'NAM104', supplier: 'Công ty Nhựa Hùng Anh', date: '27/02/2025 8:45:30 AM', status: 'Đang thực hiện'},
    {warehouse: 'Nguyên vật liệu', zone: 'NL03', receiver: 'Anh Tú', quantity: 200, lotPo: 'NVL205', supplier: 'Công ty Keo dán Tân Phước', date: '27/02/2025 10:30:00 AM', status: 'Chờ xử lý'},
    {warehouse: 'Nguyên vật liệu', zone: 'NL03', receiver: 'Anh Tú', quantity: 200, lotPo: 'NVL205', supplier: 'Công ty Keo dán Tân Phước', date: '27/02/2025 10:30:00 AM', status: 'Bị chặn'},

    {warehouse: 'Nguyên vật liệu', zone: 'NL03', receiver: 'Anh Tú', quantity: 200, lotPo: 'NVL205', supplier: 'Công ty Keo dán Tân Phước', date: '27/02/2025 10:30:00 AM', status: 'Tạm hoãn'}

];

export const listReceiptStorage = [
    { id: 1, name: 'Hạt nhựa PP AV161', code: 'PLPP001', unit: 'Kg', location: 'VT01.1.5.1', quantity: 70, note: '--'},
    { id: 2, name: 'Hạt nhựa PP AV161', code: 'PLPP001', unit: 'Kg', location: 'VT01.1.5.2', quantity: 30, note: '--'},
];

//#endregion

//#region Mock data for Issue History 
export const listIssueHistory = [
    {warehouse: 'Thành phẩm', zone: 'TP01', receiver: 'Phát Huy', quantity: 500, lotNumber: 42699, supplier: 'Công ty CP Tân Tạo', date: '01/03/2025 11:00:00 AM', status: 'Đang thực hiện'},
    {warehouse: 'Thành phẩm', zone: 'TP02', receiver: 'Phát Huy', quantity: 900, lotNumber: 56521, supplier: 'Công ty Sứ Viglacera', date: '28/02/2025 09:30:00 AM', status: 'Hoàn thành'}
]

export const listIssueStorage = [
    { id: 1, name: 'Tấm cao su bọc Ceramic', code: 'Z75SRCF1', unit: 'Tấm', location: 'TP01.3.2.1', quantity: 300, note: '--'},
    { id: 2, name: 'Tấm cao su bọc Ceramic', code: 'Z75SRCF1', unit: 'Tấm', location: 'TP01.3.2.2', quantity: 200, note: '--'},
];  

//#endregion

//#region Mock data for Inventory History
export const listInventoryHistory = [
    {warehouse: 'Thành phẩm', zone: 'TP01', receiver: 'Hùng Vạn', quantity: 500, lotNumber: 42699, supplier: 'Công ty CP Tân Tạo', date: '28/02/2025 14:00:00 AM', status: 'Đang thực hiện'},
    {warehouse: 'Thành phẩm', zone: 'TP02', receiver: 'Hùng Vạn', quantity: 600, lotNumber: 56521, supplier: 'Công ty Sứ Viglacera', date: '28/02/2025 10:00:00 AM', status: 'Hoàn thành'}
];

export const listInventoryStorage = [
    {id: 1, location: 'TP01.3.2.1', name: 'Tấm cao su bọc Ceramic', code: 'Z75SRCF1', unit: 'Tấm', inStockQuantity: 300, actualQuantity: 300, variance: 0},
    {id: 2, location: 'TP01.3.2.2', name: 'Tấm cao su bọc Ceramic', code: 'Z75SRCF1', unit: 'Tấm', inStockQuantity: 200, actualQuantity: 200, variance: 0},
    {id: 3, location: 'TP01.3.2.2', name: 'Tấm cao su bọc Ceramic', code: 'Z75SRCF1', unit: 'Tấm', inStockQuantity: 200, actualQuantity: 200, variance: 0},
    
]   
//#endregion
