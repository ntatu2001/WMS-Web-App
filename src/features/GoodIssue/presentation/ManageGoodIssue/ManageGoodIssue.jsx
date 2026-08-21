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
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton';
import { lotStatusChangeData } from '../../../../app/mockData/LotStatusData.js';
import inventoryIssueEntryApi from '../../../../api/inventoryIssueEntryApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { ClipLoader} from 'react-spinners';
import IssueProgress from '../Progress/IssueProgress';
import issueLotApi from '../../../../api/issueLotApi.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'year', label: 'Năm' },
  { value: 'all', label: 'Tất cả' },
];

// Khoảng thời gian (fromDate -> toDate) tương ứng với lựa chọn period, gửi lên
// backend để lọc dữ liệu ngay tại nguồn thay vì tải hết rồi lọc ở client.
// "all" lấy mốc bắt đầu rất xa trong quá khứ để lấy toàn bộ dữ liệu.
const getDateRange = (period) => {
  const toDate = new Date();
  toDate.setHours(23, 59, 59, 999);
  const fromDate = new Date();
  fromDate.setHours(0, 0, 0, 0);
  if (period === 'all') fromDate.setFullYear(2000, 0, 1);
  if (period === 'week') fromDate.setDate(fromDate.getDate() - 6);
  if (period === 'month') fromDate.setDate(fromDate.getDate() - 29);
  if (period === 'year') fromDate.setDate(fromDate.getDate() - 364);
  return { fromDate, toDate };
};

const periodButtonStyle = { margin: 0, width: 'auto', padding: '8px 24px', fontSize: '14px' };

const ManageGoodIssue = () => {
  const [issueEntries, setIssueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  // Một số kho hàng trùng tên (do mở rộng thêm kho mới), nên chỉ hiển thị mỗi tên 1 lần trên bộ lọc
  const uniqueWarehouseNames = useMemo(
    () => Array.from(new Set(warehouses.map(w => w.warehouseName))),
    [warehouses]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    const GetApi = async() => {
      try {
        setLoading(true);
        const { fromDate, toDate } = getDateRange(period);
        const issueEntryList = await inventoryIssueEntryApi.getIssueEntriesByDate(fromDate.toISOString(), toDate.toISOString(), warehouseFilter || undefined);
        const missingIssueLot = issueEntryList.filter(entry => !entry.issueLot);
        if (missingIssueLot.length > 0) {
          console.warn(
            `GetAllIssueEntries: ${missingIssueLot.length}/${issueEntryList.length} entries thiếu issueLot (bị loại khỏi "Quản lý xuất kho"):`,
            missingIssueLot.map(entry => ({ inventoryIssueEntryId: entry.inventoryIssueEntryId, lotNumber: entry.lotNumber }))
          );
        }
        const issueEntryNotPending = issueEntryList.filter(entry => entry.issueLot && entry.issueLot.issueLotStatus !== "Pending");
        setIssueEntries(issueEntryNotPending);
      } catch (error) {
        console.error("Error fetching issue entries:", error);
      } finally {
        setLoading(false);
      }
    };

    GetApi();
  },[period, warehouseFilter])

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const wareHouseList = await wareHouseApi.getAllWarehouseNameId();
        setWarehouses(wareHouseList);
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
      }
    };

    fetchWarehouses();
  }, []);

  const matchesFilter = (entry) => {
    const term = searchTerm.trim().toLowerCase();
    return !term
      || entry.lotNumber?.toLowerCase().includes(term)
      || entry.materialName?.toLowerCase().includes(term);
  };

  const displayedEntries = useMemo(() => {
    return issueEntries
      .filter(matchesFilter)
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  }, [issueEntries, searchTerm]);

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

      // Find the reverse mapping for the new status (from UI display status to backend status)
      const reversedStatus = Object.keys(lotStatusChangeData).find(
          key => lotStatusChangeData[key] === newStatus
      );

      if (!reversedStatus) {
            console.error("Invalid status mapping");
      return false;
      }
      // Find the issue entry to check its current status
      const entryToUpdate = issueEntries.find(entry => entry.issueLot.issueLotId === itemId);
      // If the status is already Done, don't allow changing it
      if (entryToUpdate && entryToUpdate.issueLot.issueLotStatus === "Done") {
        console.log("Cannot modify completed issue lots");
        return false;
      }

      const updateIssueLotStatus = {
        issueLotId: itemId,
        issueLotStatus: reversedStatus
      }
      // Make API call to update the status
      const success = await issueLotApi.updateIssueLotStatus(updateIssueLotStatus);

      // Backend có thể trả về false (từ chối do vi phạm điều kiện nghiệp vụ) mà không ném lỗi HTTP,
      // nên phải kiểm tra giá trị trả về trước khi coi là thành công.
      if (success === false) {
        toast.error("Không thể cập nhật trạng thái lô này. Có thể lô chưa đủ điều kiện để hoàn thành.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return false;
      }

      // Update local state
      setIssueEntries(entries => entries.map(entry => {
        if (entry.issueLot.issueLotId === itemId) {
          return {
            ...entry,
            issueLot: {
              ...entry.issueLot,
              issueLotStatus: reversedStatus
            }
          };
        }
        return entry;
      }));
      toast.success("Cập nhật trạng thái lô thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return true;
    } catch (error) {
      console.error("Error updating issue lot status:", error);
      toast.error("Cập nhật trạng thái lô thất bại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return false;
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
                {uniqueWarehouseNames.map((warehouseName, index) => (
                  <option key={`filter-warehouse-${index}`} value={warehouseName}>
                    {warehouseName}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <HeaderItem>Lô xuất kho</HeaderItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {PERIOD_OPTIONS.map((opt) => (
                    <ActionButton
                      key={opt.value}
                      active={period === opt.value}
                      variant={period === opt.value ? undefined : 'secondary'}
                      onClick={() => setPeriod(opt.value)}
                      style={periodButtonStyle}
                    >
                      {opt.label}
                    </ActionButton>
                  ))}
                </div>
                <Tag variant="accent">{displayedEntries.length} lô</Tag>
              </div>
            </div>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "420px"}}>
              {loading ? (
                <LoadingSpinner />
              ) : displayedEntries.length > 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader style={{width: "6%"}}>STT</TableHeader>
                      <TableHeader style={{width: "15%"}}>Tên sản phẩm</TableHeader>
                      <TableHeader style={{width: "8%"}}>Mã sản phẩm</TableHeader>
                      <TableHeader style={{width: "10%"}}>Mã lô/Số PO</TableHeader>
                      <TableHeader style={{width: "8%"}}>Số lượng xuất</TableHeader>
                      <TableHeader style={{width: "12%"}}>Ngày xuất kho</TableHeader>
                      <TableHeader style={{width: "10%"}}>Kho hàng</TableHeader>
                      <TableHeader style={{width: "12%"}}>Tiến độ</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedEntries.map((item, index) => (
                      <tr key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.materialId}</TableCell>
                        <TableCell>{item.lotNumber}</TableCell>
                        <TableCell>{item.issueLot.requestedQuantity}</TableCell>
                        <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.warehouseName}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <IssueProgress
                            item={{
                              id: item.issueLot.issueLotId,
                              status: lotStatusChangeData[item.issueLot.issueLotStatus]
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
                  {warehouseFilter || searchTerm ? "Không có lô xuất kho phù hợp." : "Không có dữ liệu trong khoảng thời gian đã chọn"}
                </div>
              )}
            </div>
          </ListSection>
        </div>
      </ContentContainer>
    </>
  );
};

export default ManageGoodIssue;
