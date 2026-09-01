import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import RequestLotAdjustment from '../AdjustmentRequest/LotAdjustmentRequest.jsx';
import useTranslation from '../../../../common/hooks/useTranslation';

const LotAdjustment = () => {
    const { t } = useTranslation();

    return (
        <div style={{ padding: 0, backgroundColor: 'var(--color-bg)' }}>
            <HeaderContainer>
                <HeaderItem>{t('inventory.heading')}</HeaderItem>
                <Separator />
                <HeaderItem>{t('inventory.requestHeading')}</HeaderItem>
            </HeaderContainer>

            <RequestLotAdjustment />
        </div>
    );
};

export default LotAdjustment;