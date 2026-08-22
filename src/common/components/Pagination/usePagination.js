import { useState, useEffect, useMemo } from 'react';

// Hook quản lý state trang cho phân trang client-side. `resetKey` là 1 giá trị
// (thường ghép từ các điều kiện lọc) đổi mỗi khi bộ lọc thay đổi để tự đưa
// người dùng về trang 1, tránh trường hợp đứng ở 1 trang trống sau khi lọc lại.
const usePagination = (items, pageSize, resetKey) => {
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [resetKey]);

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    // Nếu dữ liệu thay đổi (vd. 1 dòng bị xoá/đổi trạng thái) khiến trang hiện tại
    // vượt quá số trang mới, lùi về trang cuối cùng còn hợp lệ.
    useEffect(() => {
        setPage(prev => Math.min(prev, totalPages));
    }, [totalPages]);

    const paginatedItems = useMemo(
        () => items.slice((page - 1) * pageSize, page * pageSize),
        [items, page, pageSize]
    );

    return { page, setPage, paginatedItems };
};

export default usePagination;
