import ActionButton from '../Button/ActionButton/ActionButton.jsx';
import styles from './Pagination.module.scss';
import clsx from 'clsx';

const pageButtonStyle = { margin: 0, width: 'auto', minWidth: '36px', padding: '8px 12px', fontSize: '14px' };
const navButtonStyle = { margin: 0, width: 'auto', padding: '8px 16px', fontSize: '14px' };

// Trả về danh sách trang cần hiển thị, chèn '...' khi có quá nhiều trang,
// luôn giữ trang đầu, trang cuối và vùng lân cận trang hiện tại.
const getPageWindow = (currentPage, totalPages, maxPageButtons) => {
    if (totalPages <= maxPageButtons) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const sorted = Array.from(pages).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);

    const result = [];
    sorted.forEach((p, index) => {
        if (index > 0 && p - sorted[index - 1] > 1) {
            result.push('...');
        }
        result.push(p);
    });
    return result;
};

const Pagination = ({ currentPage, totalItems, pageSize, onPageChange, itemLabel = 'lô', maxPageButtons = 7, className, style }) => {
    if (!totalItems) return null;

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    const pageWindow = getPageWindow(currentPage, totalPages, maxPageButtons);

    return (
        <div className={clsx(styles.paginationBar, className)} style={style}>
            <span className={styles.rangeLabel}>
                Hiển thị {startItem}-{endItem} trên {totalItems} {itemLabel}
            </span>
            <div className={styles.controls}>
                <ActionButton
                    variant="secondary"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    style={navButtonStyle}
                >
                    Trước
                </ActionButton>

                {pageWindow.map((p, index) => (
                    p === '...' ? (
                        <span key={`ellipsis-${index}`} className={styles.ellipsis}>…</span>
                    ) : (
                        <ActionButton
                            key={p}
                            active={p === currentPage}
                            variant={p === currentPage ? undefined : 'secondary'}
                            onClick={() => onPageChange(p)}
                            style={pageButtonStyle}
                        >
                            {p}
                        </ActionButton>
                    )
                ))}

                <ActionButton
                    variant="secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    style={navButtonStyle}
                >
                    Sau
                </ActionButton>
            </div>
        </div>
    );
};

export default Pagination;
