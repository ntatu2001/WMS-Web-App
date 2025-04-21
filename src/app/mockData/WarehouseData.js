import Image from '../../assets/image.png'

export const listWarehouses = [
    'Kho Bao bì',
    'Kho Nguyên vật liệu',
    'Kho vật tư',
    'Kho Bán thành phẩm',
    'FinishedGood Warehouse'
];



export const warehouseData = [
  {
    wareHouse: "Kho Thành phẩm",
    zone: "Kho TP01",
    data: {
      T01_1: {
        columns: ["T01.1.1", "T01.1.2", "T01.1.3", "T01.1.4", "T01.1.5", "T01.1.6", "T01.1.7", "T01.1.8", "T01.1.9", "T01.1.10", "T01.1.11"],
        rows: [
          [
              { value: "TD01", status: "Đang phân bổ"}, 
              { value: "TD01", status: "Đang phân bổ"}, 
              { value: "TD02", status: "Đang phân bổ"}, 
              { value: "THP101", status: "Đang phân bổ"}, 
              { value: "THP102", status: "Đang phân bổ"}, 
              { value: "TD04", status: "Đang phân bổ"}, 
              { value: "TD04", status: "Đang phân bổ"}, 
              { value: "THP103", status: "Đang phân bổ"}, 
  
          ],
          [
              { value: "TD01", status: "Đang chứa hàng"}, 
              { value: "TD12", status: "Đang chứa hàng"}, 
              { value: "TD02", status: "Đang chứa hàng"}, 
              { value: "THP101", status: "Đang chứa hàng"}, 
              { value: "THP103", status: "Đang chứa hàng"}, 
              { value: "THP103", status: "Đã đầy"}, 
              { value: "THP104", status: "Đã đầy"}, 
          ],
  
          [
              { value: " ", status: "Trống"}, 
              { value: " ", status: "Trống"}, 
              { value: " ", status: "Trống"}, 
              { value: " ", status: "Trống"}, 
              { value: " ", status: "Trống"}, 
              { value: "THP103", status: "Đang chứa hàng"}, 
              { value: "THP104", status: "Đang chứa hàng"}, 
          ],
        ],
      },
      T01_2: {
        columns: ["T01.2.1", "T01.2.2", "T01.2.3", "T01.2.4", "T01.2.5", "T01.2.6", "T01.2.7", "T01.2.8", "T01.2.9"], // Thêm cột mới
        rows: [
          [
              { value: "SD3117", status: "Đã đầy"}, 
              { value: "CHA20", status: "Đang chứa hàng"}, 
              { value: "SD3118", status: "Đã đầy"}, 
              { value: "SKT10", status: "Đã đầy"}, 
              { value: "TD04&05", status: "Đang chứa hàng"}, 
              { value: "MTD31", status: "Đã đầy"}, 
              { value: "MTD31", status: "Đang chứa hàng"}, 
              { value: "THP102", status: "Đã đầy"}, 
              { value: "SD3119", status: "Đã đầy"}, 
  
          ], // Thêm dữ liệu cột mới
          [
              { value: "SD3117", status: "Đang chứa hàng"}, 
              { value: "MK402", status: "Đang chứa hàng"}, 
              { value: "SD3119", status: "Đang chứa hàng"}, 
              { value: "SKT10", status: "Đang chứa hàng"}, 
              { value: "THP102", status: "Đang chứa hàng"}, 
              { value: "MTD31", status: "Đang chứa hàng"}, 
              { value: "TD02", status: "Đang chứa hàng"}, 
              { value: "THP104", status: "Đang chứa hàng"}, 
              { value: "THP103", status: "Đã đầy"}, 
  
          ],
        ],
      },
      T01_3: {
        columns: ["T01.3.1", "T01.3.2", "T01.3.3", "T01.3.4", "T01.3.5", "T01.3.6", "T01.3.7"],
        rows: [
          [
              { value: "244201", status: "Đã đầy"}, 
              { value: "48300", status: "Đã đầy"}, 
              { value: "TD17", status: "Đã đầy"}, 
              { value: "TD15", status: "Đã đầy"}, 
              { value: "32439G", status: "Đã đầy"}, 
              { value: "TD08", status: "Đã đầy"}, 
              { value: "60647", status: "Đã đầy"}, 
              
          ],
          [
              { value: "244201", status: "Đang chứa hàng"}, 
              { value: "48300", status: "Đang chứa hàng"}, 
              { value: "TD17", status: "Đang chứa hàng"}, 
              { value: "TD15", status: "Đang chứa hàng"}, 
              { value: "32439G", 
                status: "Đang chứa hàng",
                details: {
                  equipment: "Ô chứa hàng",
                  position: "T01.3.5.2",
                  zone: "T01",
                  warehouse: "Kho Bao Bì",
                  dimensions: "2m x 0.1m x 0.5m",
                  status: "Đang chứa hàng",
                  lot: "32439G",
                  quantity: 100,
                  usedVolume: "0.70m³",
                  maxVolume: "1.3m³",
                  image: Image,
                  storageRate: "80%",
                  storageHistory: [
                    {
                      id: 1,
                      name: "Card Fanatic SM",
                      lot: "TD08",
                      importQty: 50,
                      exportQty: "--",
                      stockQty: 50,
                      importDate: "2025-03-01",
                      exportDate: "--"
                    },
                    {
                      id: 2,
                      name: "Master ISQUEAK Case",
                      lot: "MK125",
                      importQty: 100,
                      exportQty: 70,
                      stockQty: 30,
                      importDate: "2025-02-27",
                      exportDate: "2025-03-01"
                    },
                    {
                      id: 3,
                      name: "Fanatic LG Case",
                      lot: "MTD132",
                      importQty: 60,
                      exportQty: 60,
                      stockQty: 0,
                      importDate: "2025-02-26",
                      exportDate: "2025-03-01"
                    },
                    {
                      id: 4,
                      name: "80x120 Nylon Wrap",
                      lot: "AT195",
                      importQty: 20,
                      exportQty: 20,
                      stockQty: 0,
                      importDate: "2025-02-25",
                      exportDate: "2025-02-28"
                    },
                    {
                      id: 5,
                      name: "Speaker Ball Cover",
                      lot: "TD17",
                      importQty: 50,
                      exportQty: 50,
                      stockQty: 0,
                      importDate: "2025-02-25",
                      exportDate: "2025-02-27"
                    },
                    {
                      id: 6,
                      name:  "M318 Rubber Cord Extruder",
                      lot: "TD21",
                      importQty: 150,
                      exportQty: 150,
                      stockQty: 0,
                      importDate: "2025-02-24",
                      exportDate: "2025-02-27"
                    },
                  ]
                }
              }, 
                
              { value: "TD08", 
                status: "Đang chứa hàng",
                details: {
                  equipment: "Ô chứa hàng",
                  position: "T01.3.6.2",
                  zone: "T01",
                  warehouse: "Kho Bao Bì",
                  dimensions: "2m x 0.8m x 0.8m",
                  status: "Đang chứa hàng",
                  lot: "TD08",
                  quantity: 50,
                  usedVolume: "0.86m³",
                  maxVolume: "1.28m³",
                  image: Image,
                  storageRate: "68%",
  
                  storageHistory: [
                    {
                      id: 1,
                      name: "Card Fanatic SM",
                      lot: "TD08",
                      importQty: 50,
                      exportQty: "--",
                      stockQty: 50,
                      importDate: "2025-03-01",
                      exportDate: "--"
                    },
                    {
                      id: 2,
                      name: "Master ISQUEAK Case",
                      lot: "MK125",
                      importQty: 100,
                      exportQty: 70,
                      stockQty: 30,
                      importDate: "2025-02-27",
                      exportDate: "2025-03-01"
                    },
                    {
                      id: 3,
                      name: "Fanatic LG Case",
                      lot: "MTD132",
                      importQty: 60,
                      exportQty: 60,
                      stockQty: 0,
                      importDate: "2025-02-26",
                      exportDate: "2025-03-01"
                    },
                    {
                      id: 4,
                      name: "80x120 Nylon Wrap",
                      lot: "AT195",
                      importQty: 20,
                      exportQty: 20,
                      stockQty: 0,
                      importDate: "2025-02-25",
                      exportDate: "2025-02-28"
                    },
                    {
                      id: 5,
                      name: "Speaker Ball Cover",
                      lot: "TD17",
                      importQty: 50,
                      exportQty: 50,
                      stockQty: 0,
                      importDate: "2025-02-25",
                      exportDate: "2025-02-27"
                    },
                    {
                      id: 6,
                      name:  "M318 Rubber Cord Extruder",
                      lot: "TD21",
                      importQty: 150,
                      exportQty: 150,
                      stockQty: 0,
                      importDate: "2025-02-24",
                      exportDate: "2025-02-27"
                    },
                  ]
                }
              }, 
              { value: "60647", status: "Đang chứa hàng"}, 
          ],
        ],
      },
      T01_4: {
        columns: ["T01.4.1", "T01.4.2", "T01.4.3", "T01.4.4", "T01.4.5", "T01.4.6", "T01.4.7"],
        rows: [
          [
              { value: "TD13", status: "Đang chứa hàng"}, 
              { value: "18100", status: "Đang chứa hàng"},
              { value: "18100", status: "Đang chứa hàng"},
              { value: "YSK89", status: "Đang chứa hàng"},
              { value: "PT215", status: "Đang chứa hàng"}],
          [
              { value: " ", status: "Trống"},
              { value: " ", status: "Trống"},
              { value: " ", status: "Trống"},
              { value: " ", status: "Trống"},
              { value: " ", status: "Trống"},
          ],
        ],
      },
    
  },
  },

  {
    wareHouse: "Kho Bao bì",
    zone: "Kho T02",
    data: {
      T02_1: {
        columns: ["T02.1.1", "T02.1.2", "T02.1.3", "T02.1.4", "T02.1.5", "T02.1.6", "T02.1.7", "T02.1.8", "T02.1.9", "T02.1.10", "T02.1.11"],
        rows: [
          [
              { value: "TD01", status: "Đã đầy"}, 
              { value: "TD01", status: "Đã đầy"}, 
              { value: "TD02", status: "Đã đầy"}, 
              { value: "THP101", status: "Đã đầy"}, 
              { value: "THP102", status: "Đã đầy"}, 
              { value: "TD04", status: "Đã đầy"}, 
              { value: "TD04", status: "Đã đầy"}, 
              { value: "THP103", status: "Đã đầy"}, 
  
          ],
          [
              { value: "TD01", status: "Đang chứa hàng"}, 
              { value: "TD12", status: "Đang chứa hàng"}, 
              { value: "TD02", status: "Đang chứa hàng"}, 
              { value: "THP101", status: "Đang chứa hàng"}, 
              { value: "THP103", status: "Đang chứa hàng"}, 
              { value: "THP103", status: "Đã đầy"}, 
              { value: "THP104", status: "Đã đầy"}, 
          ],
  
          [
              { value: " ", status: "Trống"}, 
              { value: " ", status: "Trống"}, 
              { value: " ", status: "Trống"}, 
              { value: " ", status: "Trống"}, 
              { value: " ", status: "Trống"}, 
              { value: "THP103", status: "Đang chứa hàng"}, 
              { value: "THP104", status: "Đang chứa hàng"}, 
          ],
        ],
      },
      T02_2: {
        columns: ["T02.2.1", "T02.2.2", "T02.2.3", "T02.2.4", "T02.2.5", "T02.2.6", "T02.2.7", "T02.2.8", "T02.2.9"], // Thêm cột mới
        rows: [
          [
              { value: "SD3117", status: "Đã đầy"}, 
              { value: "CHA20", status: "Đang chứa hàng"}, 
              { value: "SD3118", status: "Đã đầy"}, 
              { value: "SKT10", status: "Đã đầy"}, 
              { value: "TD04&05", status: "Đang chứa hàng"}, 
              { value: "MTD31", status: "Đã đầy"}, 
              { value: "MTD31", status: "Đang chứa hàng"}, 
              { value: "THP102", status: "Đã đầy"}, 
              { value: "SD3119", status: "Đã đầy"}, 
  
          ], // Thêm dữ liệu cột mới
          [
              { value: "SD3117", status: "Đang chứa hàng"}, 
              { value: "MK402", status: "Đang chứa hàng"}, 
              { value: "SD3119", status: "Đang chứa hàng"}, 
              { value: "SKT10", status: "Đang chứa hàng"}, 
              { value: "THP102", status: "Đang chứa hàng"}, 
              { value: "MTD31", status: "Đang chứa hàng"}, 
              { value: "TD02", status: "Đang chứa hàng"}, 
              { value: "THP104", status: "Đang chứa hàng"}, 
              { value: "THP103", status: "Đã đầy"}, 
  
          ],
        ],
      },
      T02_3: {
        columns: ["T02.3.1", "T02.3.2", "T02.3.3", "T02.3.4", "T02.3.5", "T02.3.6", "T02.3.7"],
        rows: [
          [
              { value: "244201", status: "Đã đầy"}, 
              { value: "48300", status: "Đã đầy"}, 
              { value: "TD17", status: "Đã đầy"}, 
              { value: "TD15", status: "Đã đầy"}, 
              { value: "32439G", status: "Đã đầy"}, 
              { value: "TD08", status: "Đã đầy"}, 
              { value: "60647", status: "Đã đầy"}, 
              
          ],
          [
              { value: "244201", status: "Đang chứa hàng"}, 
              { value: "48300", status: "Đang chứa hàng"}, 
              { value: "TD17", status: "Đang chứa hàng"}, 
              { value: "TD15", status: "Đang chứa hàng"}, 
              { value: "32439G", 
                status: "Đang chứa hàng",
                details: {
                  equipment: "Ô chứa hàng",
                  position: "T02.3.5.2",
                  zone: "T02",
                  warehouse: "Kho Bao Bì",
                  dimensions: "2m x 0.1m x 0.5m",
                  status: "Đang chứa hàng",
                  lot: "32439G",
                  quantity: 100,
                  usedVolume: "0.70m³",
                  maxVolume: "1.3m³",
                  image: Image,
                  storageRate: "80%",
                  storageHistory: [
                    {
                      id: 1,
                      name: "Card Fanatic SM",
                      lot: "TD08",
                      importQty: 50,
                      exportQty: "--",
                      stockQty: 50,
                      importDate: "2025-03-01",
                      exportDate: "--"
                    },
                    {
                      id: 2,
                      name: "Master ISQUEAK Case",
                      lot: "MK125",
                      importQty: 100,
                      exportQty: 70,
                      stockQty: 30,
                      importDate: "2025-02-27",
                      exportDate: "2025-03-01"
                    },
                    {
                      id: 3,
                      name: "Fanatic LG Case",
                      lot: "MTD132",
                      importQty: 60,
                      exportQty: 60,
                      stockQty: 0,
                      importDate: "2025-02-26",
                      exportDate: "2025-03-01"
                    },
                    {
                      id: 4,
                      name: "80x120 Nylon Wrap",
                      lot: "AT195",
                      importQty: 20,
                      exportQty: 20,
                      stockQty: 0,
                      importDate: "2025-02-25",
                      exportDate: "2025-02-28"
                    },
                    {
                      id: 5,
                      name: "Speaker Ball Cover",
                      lot: "TD17",
                      importQty: 50,
                      exportQty: 50,
                      stockQty: 0,
                      importDate: "2025-02-25",
                      exportDate: "2025-02-27"
                    },
                    {
                      id: 6,
                      name:  "M318 Rubber Cord Extruder",
                      lot: "TD21",
                      importQty: 150,
                      exportQty: 150,
                      stockQty: 0,
                      importDate: "2025-02-24",
                      exportDate: "2025-02-27"
                    },
                  ]
                }
              }, 
                
              { value: "TD08", 
                status: "Đang chứa hàng",
                details: {
                  equipment: "Ô chứa hàng",
                  position: "T02.3.6.2",
                  zone: "T02",
                  warehouse: "Kho Bao Bì",
                  dimensions: "2m x 0.8m x 0.8m",
                  status: "Đang chứa hàng",
                  lot: "TD08",
                  quantity: 50,
                  usedVolume: "0.86m³",
                  maxVolume: "1.28m³",
                  image: Image,
                  storageRate: "68%",
  
                  storageHistory: [
                    {
                      id: 1,
                      name: "Card Fanatic SM",
                      lot: "TD08",
                      importQty: 50,
                      exportQty: "--",
                      stockQty: 50,
                      importDate: "2025-03-01",
                      exportDate: "--"
                    },
                    {
                      id: 2,
                      name: "Master ISQUEAK Case",
                      lot: "MK125",
                      importQty: 100,
                      exportQty: 70,
                      stockQty: 30,
                      importDate: "2025-02-27",
                      exportDate: "2025-03-01"
                    },
                    {
                      id: 3,
                      name: "Fanatic LG Case",
                      lot: "MTD132",
                      importQty: 60,
                      exportQty: 60,
                      stockQty: 0,
                      importDate: "2025-02-26",
                      exportDate: "2025-03-01"
                    },
                    {
                      id: 4,
                      name: "80x120 Nylon Wrap",
                      lot: "AT195",
                      importQty: 20,
                      exportQty: 20,
                      stockQty: 0,
                      importDate: "2025-02-25",
                      exportDate: "2025-02-28"
                    },
                    {
                      id: 5,
                      name: "Speaker Ball Cover",
                      lot: "TD17",
                      importQty: 50,
                      exportQty: 50,
                      stockQty: 0,
                      importDate: "2025-02-25",
                      exportDate: "2025-02-27"
                    },
                    {
                      id: 6,
                      name:  "M318 Rubber Cord Extruder",
                      lot: "TD21",
                      importQty: 150,
                      exportQty: 150,
                      stockQty: 0,
                      importDate: "2025-02-24",
                      exportDate: "2025-02-27"
                    },
                  ]
                }
              }, 
              { value: "60647", status: "Đang chứa hàng"}, 
          ],
        ],
      },
      T02_4: {
        columns: ["T02.4.1", "T02.4.2", "T02.4.3", "T02.4.4", "T02.4.5", "T02.4.6", "T02.4.7"],
        rows: [
          [
              { value: "TD13", status: "Đang chứa hàng"}, 
              { value: "18100", status: "Đang chứa hàng"},
              { value: "18100", status: "Đang chứa hàng"},
              { value: "YSK89", status: "Đang chứa hàng"},
              { value: "PT215", status: "Đang chứa hàng"}
          ],
          [
              { value: " ", status: "Trống"},
              { value: " ", status: "Trống"},
              { value: " ", status: "Trống"},
              { value: " ", status: "Trống"},
              { value: " ", status: "Trống"},
          ],
        ],
      },
    

  },
},
];




  