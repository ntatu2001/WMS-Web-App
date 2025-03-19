import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { login } from '../../store/slices/authSlice';
import ActionButton from '../../common/components/Button/ActionButton/ActionButton';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  width: 100%;
`;

const LoginForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  margin-top: 1rem;
`;

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('LoginScreen rendered'); // Debug log

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Login attempt with:', { username }); // Debug log

    try {
      // Tạm thời mock response để test
      const mockResponse = {
        user: { username },
        token: 'mock-token'
      };

      // Lưu token vào localStorage
      localStorage.setItem('token', mockResponse.token);

      // Dispatch action login
      dispatch(login(mockResponse));
      console.log('Login successful, navigating to dashboard'); // Debug log

      // Chuyển hướng đến trang chính
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error); // Debug log
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Đăng nhập</Title>
        <FormGroup>
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <ActionButton type="submit">Đăng nhập</ActionButton>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginScreen; 