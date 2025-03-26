import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import RequestLotAdjustment from '../AdjustmentRequest/LotAdjustmentRequest.jsx';

const LotAdjustment = () => {
    const headerText = 'Tạo phiếu kiểm kê';

    return (
        <div style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
            <HeaderContainer>
                <HeaderItem>Kiểm kê</HeaderItem>
                <Separator />
                <HeaderItem>{headerText}</HeaderItem>
            </HeaderContainer>

            <RequestLotAdjustment />
        </div>
    );
};

export default LotAdjustment;