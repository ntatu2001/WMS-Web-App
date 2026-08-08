import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { loginSuccess } from '../../store/slices/authSlice';
import ActionButton from '../../common/components/Button/ActionButton/ActionButton';
import authApi, { decodeRoles, decodeEmployeeId } from '../../api/authApi';
import { getApiErrorMessage } from '../../api/apiError';
import { getDefaultRouteForRoles } from '../../common/config/menuConfig.js';
import bkLogo from '../../assets/bk_logo.png';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const BG = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: #14213d;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LoginForm = styled.form`
  background: transparent;
  padding: 0;
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  margin-top: 24px;
`;

const LogoImg = styled.img`
  height: 64px;
  margin-bottom: 16px;
`;

const MainTitle = styled.div`
  color: #fff;
  font-size: 2.1rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  white-space: nowrap;
`;

const SubTitle = styled.div`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 400;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 32px;
`;

const InputGroup = styled.div`
  width: 100%;
  margin-bottom: 18px;
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: none;
  border-radius: 12px;
  background: #f5f7fa;
  font-size: 1rem;
  color: #222;
  outline: none;
  box-sizing: border-box;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1.1rem;
`;

const PasswordToggleIcon = styled.div`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    color: #374151;
  }
`;

const CheckboxRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const StyledCheckbox = styled.input`
  margin-right: 8px;
  accent-color: #14213d;
`;

const CheckboxLabel = styled.label`
  color: #e5e7eb;
  font-size: 1rem;
  user-select: none;
`;

const StyledButton = styled(ActionButton)`
  width: 100%;
  padding: 14px 0;
  font-size: 1.15rem;
  font-weight: bold;
  border-radius: 12px;
  background: #2563eb;
  color: #fff;
  margin-bottom: 24px;
  margin-top: 8px;
  border: none;
  transition: background 0.2s;
  &:hover {
    background: #1d4ed8;
  }
`;

const ErrorMessage = styled.p`
  color: #f87171;
  text-align: center;
  margin: 12px 0 0 0;
  font-size: 1rem;
`;

const Footer = styled.div`
  color: #9ca3af;
  font-size: 1rem;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 10px;
`;

const LoginScreen = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(userName, password);
      const roles = decodeRoles(data.accessToken);
      const employeeId = decodeEmployeeId(data.accessToken);
      dispatch(loginSuccess({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        roles,
        userName,
        employeeId,
      }));
      navigate(getDefaultRouteForRoles(roles));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Tên đăng nhập hoặc mật khẩu không đúng'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BG>
      <LoginForm onSubmit={handleSubmit}>
        <LogoBox>
          <LogoImg style={{height: "100px"}} src={bkLogo} alt="BK Logo" />
          <MainTitle>Warehouse Management System</MainTitle>
          
        </LogoBox>
        <div style={{ width: '100%', marginBottom: 18 }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.35rem', textAlign: 'center', letterSpacing: 1, marginBottom: 18 }}>
            ĐĂNG NHẬP HỆ THỐNG
          </div>
          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <StyledInput
              type="text"
              placeholder="Tên đăng nhập"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              autoFocus
            />
          </InputGroup>
          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <StyledInput
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: 44 }}
            />
            <PasswordToggleIcon
              onClick={() => setShowPassword((prev) => !prev)}
              role="button"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggleIcon>
          </InputGroup>
          <CheckboxRow>
            <StyledCheckbox
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <CheckboxLabel htmlFor="remember">Ghi nhớ đăng nhập</CheckboxLabel>
          </CheckboxRow>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <StyledButton type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
          </StyledButton>
        </div>
      </LoginForm>
      <Footer>© 2025 WMS-Web-App</Footer>
    </BG>
  );
};

export default LoginScreen;