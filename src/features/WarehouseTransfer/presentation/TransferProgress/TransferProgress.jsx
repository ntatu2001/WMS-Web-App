import React from 'react';
import { WORKFLOW_STATUS, STATUS_COLOR } from '../../../../common/constants/statusColors.js';
import useTranslation from '../../../../common/hooks/useTranslation';

// Tag trạng thái CHỈ ĐỌC — khác ReceiptProgress.jsx (dropdown tự do đổi trạng thái):
// trạng thái phiếu điều chuyển chỉ đổi qua các hành động có tác dụng phụ lên tồn kho
// (Xác nhận xuất kho / Xác nhận nhận hàng / Hủy), không phải chọn tự do.
const TransferProgress = ({ status, style }) => {
  const { t } = useTranslation();
  const entry = WORKFLOW_STATUS[status];

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: '999px',
        backgroundColor: entry?.color || STATUS_COLOR.neutral,
        padding: '4px 12px',
        color: 'white',
        fontWeight: 700,
        fontSize: '12px',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {entry ? t(entry.labelKey) : status}
    </span>
  );
};

export default TransferProgress;
