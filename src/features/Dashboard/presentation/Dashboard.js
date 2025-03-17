import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';


const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.25rem;
`;

const CardContent = styled.div`
  color: #666;
`;

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="p-8">
      <h1 className="mb-8 text-[#333]">Dashboard</h1>
      <Card>
        <CardTitle>Chào mừng trở lại</CardTitle>
        <CardContent>
          {user ? (
            <p>Xin chào, {user.name}!</p>
          ) : (
            <p>Xin chào!</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardTitle>Thống kê</CardTitle>
        <CardContent>
          <p>Đây là nơi hiển thị các thống kê quan trọng.</p>
        </CardContent>
      </Card>
      <Card>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardContent>
          <p>Đây là nơi hiển thị các hoạt động gần đây.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 