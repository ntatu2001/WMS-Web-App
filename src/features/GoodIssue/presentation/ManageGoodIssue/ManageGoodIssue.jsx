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
import Pagination from '../../../../common/components/Pagination/Pagination.jsx';
import { AiOutlineDownload } from 'react-icons/ai';
import { exportIssueEntriesToExcel } from '../../utils/exportIssueEntriesExcel.js';

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
const searchButtonStyle = { margin: 0, width: 'auto', padding: '8px 20px', fontSize: '14px' };
const PAGE_SIZE = 5;

const ManageGoodIssue = () => {
  const [issueEntries, setIssueEntries] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  // Một số kho hàng trùng tên (do mở rộng thêm kho mới), nên chỉ hiển thị mỗi tên 1 lần trên bộ lọc
  const uniqueWarehouseNames = useMemo(
    () => Array.from(new Set(warehouses.map(w => w.warehouseName))),
    [warehouses]
  );
  const [searchTerm, setSearchTerm] = useState('');
  // Từ khóa thực sự dùng để gọi API — chỉ cập nhật khi người dùng bấm nút "Tìm kiếm"
  // (hoặc Enter), tránh gọi API GetIssueEntriesByLotNumber liên tục theo từng ký tự gõ.
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [period, setPeriod] = useState('today');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const handleSearch = () => setAppliedSearchTerm(searchTerm.trim());
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Xuất TOÀN BỘ lô hàng khớp bộ lọc hiện tại (không chỉ trang đang xem) ra file .xlsx.
  const handleExportExcel = async () => {
    if (totalItems === 0 || loading) return;
    setExporting(true);
    try {
      let rows;
      if (appliedSearchTerm) {
        // Nhánh tìm kiếm: 2 API không phân trang, gộp + dedupe như logic tải bảng
        const [byLotNumber, byMaterialName] = await Promise.all([
          inventoryIssueEntryApi.getIssueEntriesByLotNumber(appliedSearchTerm, undefined, warehouseFilter || undefined),
          inventoryIssueEntryApi.getIssueEntriesByLotNumber(undefined, appliedSearchTerm, warehouseFilter || undefined),
        ]);
        const merged = [...(byLotNumber.results || []), ...(byMaterialName.results || [])];
        rows = Array.from(new Map(merged.map(item => [item.inventoryIssueEntryId, item])).values());
      } else {
        // Nhánh khoảng thời gian: gọi KHÔNG kèm pageNumber/pageSize -> backend trả full
        const { fromDate, toDate } = getDateRange(period);
        const response = await inventoryIssueEntryApi.getIssueEntriesNotPendingByDate(
          fromDate.toISOString(), toDate.toISOString(), warehouseFilter || undefined, undefined, undefined
        );
        rows = response.results || [];
        // Phòng hờ: nếu backend vẫn cắt trang -> gom nốt các trang còn lại
        if (rows.length < (response.totalItems || 0)) {
          const totalPages = Math.ceil((response.totalItems || 0) / PAGE_SIZE);
          const pages = await Promise.all(
            Array.from({ length: totalPages }, (_, i) =>
              inventoryIssueEntryApi.getIssueEntriesNotPendingByDate(
                fromDate.toISOString(), toDate.toISOString(), warehouseFilter || undefined, i + 1, PAGE_SIZE
              )
            )
          );
          rows = pages.flatMap(r => r.results || []);
        }
      }

      if (!rows.length) {
        toast.info('Không có lô hàng nào để xuất.', { position: 'top-right', autoClose: 3000 });
        return;
      }

      const p2 = (x) => String(x).padStart(2, '0');
      const n = new Date();
      const stamp = `${n.getFullYear()}${p2(n.getMonth() + 1)}${p2(n.getDate())}_${p2(n.getHours())}${p2(n.getMinutes())}`;
      const scope = appliedSearchTerm
        ? 'tim_kiem'
        : (PERIOD_OPTIONS.find(o => o.value === period)?.label || period);
      const whPart = warehouseFilter ? `_${warehouseFilter}` : '';
      const filename = `Lo_xuat_kho_${scope}${whPart}_${stamp}.xlsx`.replace(/\s+/g, '_');

      await exportIssueEntriesToExcel(rows, filename);
      toast.success(`Đã xuất ${rows.length} lô ra file Excel.`, { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Export excel error:', error);
      toast.error('Xuất file Excel thất bại. Vui lòng thử lại.', { position: 'top-right', autoClose: 3000 });
    } finally {
      setExporting(false);
    }
  };

  // Đổi bộ lọc (kho hàng/khoảng thời gian/từ khóa đã áp dụng) -> quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [period, warehouseFilter, appliedSearchTerm]);

  useEffect(() => {
    const GetApi = async() => {
      try {
        setLoading(true);

        if (appliedSearchTerm) {
          // 2 API GetIssueEntriesByLotNumber không có fromDate/toDate, và lotNumber/materialName
          // kết hợp là AND — nên gọi song song 2 lượt (khớp lotNumber HOẶC materialName) rồi gộp lại
          // để giữ đúng hành vi "Tìm mã lô / tên sản phẩm" (khớp 1 trong 2 trường) như trước đây.
          // Vì không có pageNumber/pageSize ở đây, tải toàn bộ 2 tập kết quả rồi tự phân trang ở client.
          const [byLotNumber, byMaterialName] = await Promise.all([
            inventoryIssueEntryApi.getIssueEntriesByLotNumber(appliedSearchTerm, undefined, warehouseFilter || undefined),
            inventoryIssueEntryApi.getIssueEntriesByLotNumber(undefined, appliedSearchTerm, warehouseFilter || undefined),
          ]);
          const merged = [...(byLotNumber.results || []), ...(byMaterialName.results || [])];
          const deduped = Array.from(new Map(merged.map(item => [item.inventoryIssueEntryId, item])).values());
          setTotalItems(deduped.length);
          setIssueEntries(deduped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
        } else {
          const { fromDate, toDate } = getDateRange(period);
          const response = await inventoryIssueEntryApi.getIssueEntriesNotPendingByDate(
            fromDate.toISOString(), toDate.toISOString(), warehouseFilter || undefined, page, PAGE_SIZE
          );
          setTotalItems(response.totalItems || 0);
          setIssueEntries(response.results || []);
        }
      } catch (error) {
        console.error("Error fetching issue entries:", error);
      } finally {
        setLoading(false);
      }
    };

    GetApi();
  },[period, warehouseFilter, appliedSearchTerm, page])

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
      const entryToUpdate = issueEntries.find(entry => entry.issueLot?.issueLotId === itemId);
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
        if (entry.issueLot?.issueLotId === itemId) {
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
              onKeyDown={handleSearchKeyDown}
              style={{ marginBottom: 0, marginLeft: 0, flex: 1 }}
            />
            <ActionButton onClick={handleSearch} style={searchButtonStyle}>
              Tìm kiếm
            </ActionButton>
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
                <Tag variant="accent">{totalItems} lô</Tag>
                <ActionButton
                  variant="secondary"
                  onClick={handleExportExcel}
                  disabled={exporting || loading || totalItems === 0}
                  style={{ margin: 0, width: 'auto', padding: '8px 16px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <AiOutlineDownload size={16} /> {exporting ? 'Đang xuất...' : 'Xuất file Excel'}
                </ActionButton>
              </div>
            </div>
            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              {loading ? (
                <LoadingSpinner />
              ) : issueEntries.length > 0 ? (
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
                    {issueEntries.map((item, index) => (
                      <tr key={item.inventoryIssueEntryId || index}>
                        <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.materialId}</TableCell>
                        <TableCell>{item.lotNumber}</TableCell>
                        <TableCell>{item.issueLot?.requestedQuantity}</TableCell>
                        <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.warehouseName}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          {item.issueLot && (
                            <IssueProgress
                              item={{
                                id: item.issueLot.issueLotId,
                                status: lotStatusChangeData[item.issueLot.issueLotStatus]
                              }}
                              handleStatusChange={handleStatusChange}
                            />
                          )}
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>
                  {warehouseFilter || appliedSearchTerm ? "Không có lô xuất kho phù hợp." : "Không có dữ liệu trong khoảng thời gian đã chọn"}
                </div>
              )}
            </div>
            {!loading && (
              <Pagination
                currentPage={page}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                itemLabel="lô"
              />
            )}
          </ListSection>
        </div>
      </ContentContainer>
    </>
  );
};

export default ManageGoodIssue;
