import Modal from 'react-modal';
import clsx from 'clsx';
import styles from './InforModal.module.scss';

const InforModal = ({isModalOpen, closeModal}) => {
    return (
        <Modal isOpen = {isModalOpen} onRequestClose={closeModal} className={clsx(styles.modal)} > 
            <h2>Thông tin thêm</h2>
            {/* Thêm nội dung modal ở đây */}
            <button onClick={closeModal}>Đóng</button>
        </Modal>
    );
};

export default InforModal;