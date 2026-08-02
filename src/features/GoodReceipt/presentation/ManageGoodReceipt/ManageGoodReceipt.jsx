import React, { useEffect, useState, useMemo } from 'react';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer';
import ListSection from '../../../../common/components/Section/ListSection';
import HeaderItem from '../../../../common/components/Header/HeaderItem';
import Table from '../../../../common/components/Table/Table';
import TableHeader from '../../../../common/components/Table/TableHeader';
import TableCell from '../../../../common/components/Table/TableCell';
import SelectContainer from '../../../../common/components/Selection/SelectContainer';
import Select from '../../../../common/components/Selection/Select';
import SearchInput from '../../../../common/components/Input/SearchInput';
import Tag from '../../../../common/components/Tag/Tag';
import { lotStatusChangeData } from '../../../../app/mockData/LotStatusData.js';
import inventoryReceiptEntryApi from '../../../../api/inventoryReceiptEntryApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { ClipLoader} from 'react-spinners';
import ReceiptProgress from '../Progress/ReceiptProgress';
import receiptLotApi from '../../../../api/receiptLotApi.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";

const ManageGoodReceipt = () => {

  const [receiptEntries, setReceiptEntries] = useState([]);
  const [todayReceiptEntries, setTodayReceiptEntries] = useState([]);
  const [lastWeekReceiptEntries, setLastWeekReceiptEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const GetApi = async() => {
      try {
        setLoading(true);
        const receiptEntryList = await inventoryReceiptEntryApi.getAllReceiptEntries();
        const receiptEntryNotPending = receiptEntryList.filter(entry => entry.receiptLot.receiptLotStatus !== "Pending");
        setReceiptEntries(receiptEntryNotPending);

        // Filter entries for today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day

        const todayEntries = receiptEntryNotPending.filter(entry => {
          const entryDate = new Date(entry.receiptDate);
          entryDate.setHours(0, 0, 0, 0); // Set to beginning of day
          return entryDate.getTime() === today.getTime();
        });

        // Sort last week entries by date in descending order
        const sortedTodayEntries = [...todayEntries].sort((a, b) =>
          new Date(b.receiptDate) - new Date(a.receiptDate)
          );

        setTodayReceiptEntries(sortedTodayEntries);

        // Filter entries for last week (keeping existing code structure)
        const lastWeekEntries = receiptEntryNotPending.filter(entry => {
          const entryDate = new Date(entry.receiptDate);
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return entryDate >= lastWeek && entryDate < today;
        });

        // Sort last week entries by date in descending order
        const sortedLastWeekEntries = [...lastWeekEntries].sort((a, b) =>
          new Date(b.receiptDate) - new Date(a.receiptDate)
        );

        setLastWeekReceiptEntries(sortedLastWeekEntries);
      } catch (error) {
        console.error("Error fetching receipt entries:", error);
      } finally {
        setLoading(false);
      }
    };

    GetApi();
  },[])

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const wareHouseList = await wareHouseApi.getAllWareHouses();
        setWarehouses(wareHouseList);
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
      }
    };

    fetchWarehouses();
  }, []);

  const matchesFilter = (entry) => {
    const matchesWarehouse = !warehouseFilter || entry.warehouseName === warehouseFilter;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term
      || entry.lotNumber?.toLowerCase().includes(term)
      || entry.materialName?.toLowerCase().includes(term);
    return matchesWarehouse && matchesSearch;
  };

  const filteredTodayEntries = useMemo(
    () => todayReceiptEntries.filter(matchesFilter),
    [todayReceiptEntries, warehouseFilter, searchTerm]
  );
  const filteredLastWeekEntries = useMemo(
    () => lastWeekReceiptEntries.filter(matchesFilter),
    [lastWeekReceiptEntries, warehouseFilter, searchTerm]
  );

  const LoadingSpinner = () => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
      <ClipLoader color="#3498db" size={60} speedMultiplier={0.8} />
      <div style={{ marginTop: '15px', fontSize: '20px', color: '#666', fontWeight: 'bold' }}>
        Đang tải dữ liệu...
      </div>
    </div>
  );

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      // Find the receipt entry to check its current status
      const entryToUpdate = [...receiptEntries, ...todayReceiptEntries, ...lastWeekReceiptEntries]
        .find(entry => entry.receiptLot.receiptLotId === itemId);

      // If the status is already Done, don't allow changing it
      if (entryToUpdate && entryToUpdate.receiptLot.receiptLotStatus === "Done") {
        console.log("Cannot modify completed receipt lots");
        return;
      }

      // Find the reverse mapping for the new status (from UI display status to backend status)
      const reversedStatus = Object.keys(lotStatusChangeData).find(
        key => lotStatusChangeData[key] === newStatus
      );

      if (!reversedStatus) {
        console.error("Invalid status mapping");
        return;
      }

      const updateReceiptLotStatus = {
        receiptLotId: itemId,
        receiptLotStatus: reversedStatus
      }
      console.log(updateReceiptLotStatus)
      // Make API call to update the status
      await receiptLotApi.updateReceiptLotStatus(updateReceiptLotStatus);

      // Update local state
      const updateEntries = entries => {
        return entries.map(entry => {
          if (entry.receiptLot.receiptLotId === itemId) {
            return {
              ...entry,
              receiptLot: {
                ...entry.receiptLot,
                receiptLotStatus: reversedStatus
              }
            };
          }
          return entry;
        });
      };

      setReceiptEntries(updateEntries(receiptEntries));
      setTodayReceiptEntries(updateEntries(todayReceiptEntries));
      setLastWeekReceiptEntries(updateEntries(lastWeekReceiptEntries));
      toast.success("Cập nhật trạng thái lô thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error updating receipt lot status:", error);
      toast.error("Cập nhật trạng thái lô thất bại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <>
      <ContentContainer>
        <div style={{ width: '100%', height: "50%"}}>
          <ListSection style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '1.5rem' }}>
            <SelectContainer style={{ maxWidth: '260px' }}>
              <Select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                placeholder="Tất cả kho hàng"
              >
                <option value="">Tất cả kho hàng</option>
                {warehouses.map((warehouse, index) => (
                  <option key={`filter-warehouse-${index}`} value={warehouse.warehouseName}>
                    {warehouse.warehouseName}
                  </option>
                ))}
              </Select>
            </SelectContainer>
            <SearchInput
              placeholder="Tìm mã lô / tên sản phẩm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 0, marginLeft: 0, flex: 1 }}
            />
          </ListSection>

          <ListSection elevated>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <HeaderItem>Lô nhập kho trong ngày</HeaderItem>
              <Tag variant="accent">{filteredTodayEntries.length} lô</Tag>
            </div>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "300px"}}>
              {loading ? (
                <LoadingSpinner />
              ) : filteredTodayEntries.length > 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>STT</TableHeader>
                      <TableHeader>Tên sản phẩm</TableHeader>
                      <TableHeader>Mã sản phẩm</TableHeader>
                      <TableHeader>ĐVT</TableHeader>
                      <TableHeader>Mã lô/Số PO</TableHeader>
                      <TableHeader>Số lượng nhập</TableHeader>
                      <TableHeader>Nhân viên</TableHeader>
                      <TableHeader>Ghi chú</TableHeader>
                      <TableHeader style={{width: "15%"}}>Tiến độ</TableHeader>
                      <TableHeader></TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTodayEntries.map((item, index) => (
                      <tr key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.materialId}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.lotNumber}</TableCell>
                        <TableCell>{item.receiptLot.importedQuantity}</TableCell>
                        <TableCell>{item.personName}</TableCell>
                        <TableCell>{item.note === "None" ? "--" : item.note}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <ReceiptProgress
                            item={{
                              id: item.receiptLot.receiptLotId,
                              status: lotStatusChangeData[item.receiptLot.receiptLotStatus]
                            }}
                            handleStatusChange={handleStatusChange}
                          />
                        </TableCell>

                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>
                  Không có dữ liệu trong ngày
                </div>
              )}
            </div>
          </ListSection>
          <ListSection style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <HeaderItem>Lô nhập kho gần đây</HeaderItem>
              <Tag variant="neutral">{filteredLastWeekEntries.length} lô</Tag>
            </div>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "300px"}}>
              {loading ? (
                <LoadingSpinner />
              ) : filteredLastWeekEntries.length > 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>STT</TableHeader>
                      <TableHeader style={{width: "15%"}}>Tên sản phẩm</TableHeader>
                      <TableHeader style={{width: "5%"}}>Mã sản phẩm</TableHeader>
                      <TableHeader>ĐVT</TableHeader>
                      <TableHeader style={{width: "10%"}}>Mã lô/Số PO</TableHeader>
                      <TableHeader style={{width: "10%"}}>Số lượng nhập</TableHeader>
                      <TableHeader style={{width: "10%"}}>Nhân viên</TableHeader>
                      <TableHeader style={{width: "10%"}}>Ngày nhập kho</TableHeader>
                      <TableHeader style={{width: "10%"}}>Kho hàng</TableHeader>
                      <TableHeader style={{width: "15%"}}>Tiến độ</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLastWeekEntries.map((item, index) => (
                      <tr key={item.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.materialId}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.lotNumber}</TableCell>
                        <TableCell>{item.receiptLot.importedQuantity}</TableCell>
                        <TableCell>{item.personName}</TableCell>
                        <TableCell>{new Date(item.receiptDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.warehouseName}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <ReceiptProgress
                            item={{
                              id: item.receiptLot.receiptLotId,
                              status: lotStatusChangeData[item.receiptLot.receiptLotStatus]
                            }}
                            handleStatusChange={handleStatusChange}
                          />
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>
                  {warehouseFilter || searchTerm ? "Không có lô nhập kho gần đây phù hợp." : "Không có dữ liệu kho gần đây"}
                </div>
              )}
            </div>
          </ListSection>
        </div>
      </ContentContainer>
    </>
  );
};

export default ManageGoodReceipt;
