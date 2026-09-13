import React, { useState } from 'react';
import Table from '../../Table/Table.jsx';
import TableHeader from '../../Table/TableHeader.jsx';
import TableCell from '../../Table/TableCell.jsx';
import FormGroup from '../../FormGroup/FormGroup.jsx';
import Label from '../../Label/Label.jsx';
import ActionButton from '../../Button/ActionButton/ActionButton.jsx';
import { ClipLoader } from 'react-spinners';
import { SPINNER_ON_ACCENT } from '../../../constants/statusColors.js';
import useTranslation from '../../../hooks/useTranslation';
import styles from './PdfExportFieldsModal.module.scss';

const todayInputValue = () => new Date().toISOString().slice(0, 10);

const MODAL_TITLE_KEY = {
  receipt: 'history.pdfModalTitleReceipt',
  issue: 'history.pdfModalTitleIssue',
  stocktake: 'history.pdfModalTitleStockTake',
};

// Modal dùng chung để nhập các trường CHỈ phục vụ in PDF (đơn giá, TK Nợ/Có, người
// giao/nhận, ban kiểm kê...) — hệ thống hiện không lưu các trường này, và modal cũng
// KHÔNG gửi chúng lên backend, chỉ truyền cho callback `onExport` để dựng file PDF.
const PdfExportFieldsModal = ({ docType, isOpen, onClose, items, initialPreparerName, onExport }) => {
  const { t } = useTranslation();
  const [debitAccount, setDebitAccount] = useState('');
  const [creditAccount, setCreditAccount] = useState('');
  const [preparerName, setPreparerName] = useState(initialPreparerName || '');
  const [documentDate, setDocumentDate] = useState(todayInputValue());
  const [unitPrices, setUnitPrices] = useState({});
  const [deliveredBy, setDeliveredBy] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [reason, setReason] = useState('');
  const [docRef, setDocRef] = useState('');
  const [committeeMembers, setCommitteeMembers] = useState([{ name: '', role: '' }]);
  const [proposal, setProposal] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePriceChange = (id, value) => {
    setUnitPrices((prev) => ({ ...prev, [id]: value }));
  };

  const totalAmount = items.reduce((sum, item) => {
    const price = Number(unitPrices[item.id]) || 0;
    return sum + price * (Number(item.quantity) || 0);
  }, 0);

  const updateMember = (index, field, value) => {
    setCommitteeMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMember = () => setCommitteeMembers((prev) => [...prev, { name: '', role: '' }]);
  const removeMember = (index) => setCommitteeMembers((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const missingPrice = items.some((item) => !(Number(unitPrices[item.id]) > 0));
    if (missingPrice) {
      setError(t('history.pdfMissingPriceWarn'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onExport({
        debitAccount,
        creditAccount,
        preparerName,
        documentDate,
        unitPrices,
        totalAmount,
        deliveredBy,
        receivedBy,
        reason,
        docRef,
        committeeMembers: committeeMembers.filter((m) => m.name.trim()),
        proposal,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>{t(MODAL_TITLE_KEY[docType])}</h3>
        <p className={styles.hint}>{t('history.pdfModalHint')}</p>

        <div className={styles.formGrid}>
          {docType !== 'stocktake' && (
            <>
              <FormGroup style={{ margin: 0 }}>
                <Label>{t('history.pdfDebitAccount')}</Label>
                <input className={styles.textInput} value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} />
              </FormGroup>
              <FormGroup style={{ margin: 0 }}>
                <Label>{t('history.pdfCreditAccount')}</Label>
                <input className={styles.textInput} value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} />
              </FormGroup>
            </>
          )}
          <FormGroup style={{ margin: 0 }}>
            <Label>{t('history.pdfPreparer')}</Label>
            <input className={styles.textInput} value={preparerName} onChange={(e) => setPreparerName(e.target.value)} />
          </FormGroup>
          <FormGroup style={{ margin: 0 }}>
            <Label>{t('history.pdfDocumentDate')}</Label>
            <input type="date" className={styles.textInput} value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} />
          </FormGroup>

          {docType === 'receipt' && (
            <>
              <FormGroup style={{ margin: 0 }}>
                <Label>{t('history.pdfDeliveredBy')}</Label>
                <input className={styles.textInput} value={deliveredBy} onChange={(e) => setDeliveredBy(e.target.value)} />
              </FormGroup>
              <FormGroup style={{ margin: 0 }}>
                <Label>{t('history.pdfDocRef')}</Label>
                <input className={styles.textInput} value={docRef} onChange={(e) => setDocRef(e.target.value)} />
              </FormGroup>
            </>
          )}

          {docType === 'issue' && (
            <>
              <FormGroup style={{ margin: 0 }}>
                <Label>{t('history.pdfReceivedBy')}</Label>
                <input className={styles.textInput} value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
              </FormGroup>
              <FormGroup style={{ margin: 0 }}>
                <Label>{t('history.pdfReason')}</Label>
                <input className={styles.textInput} value={reason} onChange={(e) => setReason(e.target.value)} />
              </FormGroup>
            </>
          )}
        </div>

        {docType === 'stocktake' && (
          <div className={styles.section}>
            <Label>{t('history.pdfCommitteeMembers')}</Label>
            {committeeMembers.map((member, index) => (
              <div key={index} className={styles.memberRow}>
                <input
                  className={styles.textInput}
                  placeholder={t('history.pdfCommitteeName')}
                  value={member.name}
                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                />
                <input
                  className={styles.textInput}
                  placeholder={t('history.pdfCommitteeRole')}
                  value={member.role}
                  onChange={(e) => updateMember(index, 'role', e.target.value)}
                />
                {committeeMembers.length > 1 && (
                  <button type="button" className={styles.removeBtn} onClick={() => removeMember(index)}>
                    {t('history.pdfRemoveMember')}
                  </button>
                )}
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={addMember}>
              {t('history.pdfAddMember')}
            </button>

            <FormGroup style={{ marginTop: '12px' }}>
              <Label>{t('history.pdfProposal')}</Label>
              <textarea
                className={styles.textArea}
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                rows={2}
              />
            </FormGroup>
          </div>
        )}

        <div className={styles.tableWrap}>
          <Table>
            <thead>
              <tr>
                <TableHeader style={{ width: '6%' }}>{t('history.colNo')}</TableHeader>
                <TableHeader>{t('history.colProductName')}</TableHeader>
                <TableHeader style={{ width: '8%' }}>{t('history.colUom')}</TableHeader>
                <TableHeader style={{ width: '12%' }}>SL</TableHeader>
                <TableHeader style={{ width: '18%' }}>{t('history.pdfUnitPrice')}</TableHeader>
                <TableHeader style={{ width: '18%' }}>{t('history.pdfAmount')}</TableHeader>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const price = Number(unitPrices[item.id]) || 0;
                const amount = price * (Number(item.quantity) || 0);
                return (
                  <tr key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell>{item.unitOfMeasure}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={styles.priceInput}
                        value={unitPrices[item.id] ?? ''}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>{amount.toLocaleString('vi-VN')}</TableCell>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <div className={styles.totalRow}>
            <span>{t('history.pdfTotal')}</span>
            <span>{totalAmount.toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            {t('history.pdfCancel')}
          </button>
          <ActionButton onClick={handleSubmit} disabled={submitting} style={{ margin: 0, width: 'auto', padding: '10px 20px' }}>
            {submitting ? <ClipLoader size={18} color={SPINNER_ON_ACCENT} /> : t('history.pdfConfirmExport')}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default PdfExportFieldsModal;
