import Modal from 'react-modal';
import clsx from 'clsx';
import styles from './InforModal.module.scss';
import { AiOutlineClose } from 'react-icons/ai';

const InforModal = ({isModalOpen, closeModal}) => {
    return (
        <Modal isOpen = {isModalOpen} onRequestClose={closeModal} className={clsx(styles.modal)} > 
            <h1 className={clsx(styles.title)}>Thông tin nhập kho chi tiết</h1>
            {/* Thêm nội dung modal ở đây */}
            <button className ={clsx(styles.modalClose)} onClick={closeModal}>
                <AiOutlineClose style={{fontWeight: "bold"}}/>
            </button>
        </Modal>
    );
};

export default InforModal;