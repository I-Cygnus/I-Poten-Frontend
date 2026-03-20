import React, { useState } from 'react';
import styled from 'styled-components';
import { Bell, Lock, Globe, Moon, Sun, Shield, Smartphone } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const [notifications, setNotifications] = useState(true);
    const [emailNotif, setEmailNotif] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
        <Container>
            <Header>
                <Title>설정</Title>
                <Subtitle>계정 및 앱 설정을 관리하세요</Subtitle>
            </Header>

            <SettingsSection>
                <SectionTitle>
                    <Bell size={20} />
                    알림 설정
                </SectionTitle>
                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>푸시 알림</SettingLabel>
                        <SettingDescription>새로운 활동에 대한 알림을 받습니다</SettingDescription>
                    </SettingInfo>
                    <Toggle
                        active={notifications}
                        onClick={() => setNotifications(!notifications)}
                    >
                        <ToggleButton active={notifications} />
                    </Toggle>
                </SettingItem>
                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>이메일 알림</SettingLabel>
                        <SettingDescription>중요한 업데이트를 이메일로 받습니다</SettingDescription>
                    </SettingInfo>
                    <Toggle
                        active={emailNotif}
                        onClick={() => setEmailNotif(!emailNotif)}
                    >
                        <ToggleButton active={emailNotif} />
                    </Toggle>
                </SettingItem>
            </SettingsSection>

            <SettingsSection>
                <SectionTitle>
                    <Moon size={20} />
                    테마 설정
                </SectionTitle>
                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>다크 모드</SettingLabel>
                        <SettingDescription>어두운 테마를 사용합니다</SettingDescription>
                    </SettingInfo>
                    <Toggle
                        active={darkMode}
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        <ToggleButton active={darkMode} />
                    </Toggle>
                </SettingItem>
            </SettingsSection>

            <SettingsSection>
                <SectionTitle>
                    <Lock size={20} />
                    보안 및 개인정보
                </SectionTitle>
                <SettingItem clickable>
                    <SettingInfo>
                        <SettingLabel>비밀번호 변경</SettingLabel>
                        <SettingDescription>계정 비밀번호를 변경합니다</SettingDescription>
                    </SettingInfo>
                    <Arrow>→</Arrow>
                </SettingItem>
                <SettingItem clickable>
                    <SettingInfo>
                        <SettingLabel>2단계 인증</SettingLabel>
                        <SettingDescription>추가 보안 계층을 활성화합니다</SettingDescription>
                    </SettingInfo>
                    <Arrow>→</Arrow>
                </SettingItem>
                <SettingItem clickable>
                    <SettingInfo>
                        <SettingLabel>개인정보 설정</SettingLabel>
                        <SettingDescription>데이터 공유 및 개인정보 관리</SettingDescription>
                    </SettingInfo>
                    <Arrow>→</Arrow>
                </SettingItem>
            </SettingsSection>

            <SettingsSection>
                <SectionTitle>
                    <Globe size={20} />
                    언어 및 지역
                </SectionTitle>
                <SettingItem clickable>
                    <SettingInfo>
                        <SettingLabel>언어</SettingLabel>
                        <SettingDescription>한국어</SettingDescription>
                    </SettingInfo>
                    <Arrow>→</Arrow>
                </SettingItem>
                <SettingItem clickable>
                    <SettingInfo>
                        <SettingLabel>시간대</SettingLabel>
                        <SettingDescription>Asia/Seoul (GMT+9)</SettingDescription>
                    </SettingInfo>
                    <Arrow>→</Arrow>
                </SettingItem>
            </SettingsSection>

            <SettingsSection>
                <SectionTitle>
                    <Smartphone size={20} />
                    기기 관리
                </SectionTitle>
                <DeviceItem>
                    <DeviceIcon>💻</DeviceIcon>
                    <DeviceInfo>
                        <DeviceName>MacBook Pro</DeviceName>
                        <DeviceDetails>마지막 활동: 방금 전</DeviceDetails>
                    </DeviceInfo>
                    <DeviceStatus>현재 기기</DeviceStatus>
                </DeviceItem>
                <DeviceItem>
                    <DeviceIcon>📱</DeviceIcon>
                    <DeviceInfo>
                        <DeviceName>iPhone 14 Pro</DeviceName>
                        <DeviceDetails>마지막 활동: 2시간 전</DeviceDetails>
                    </DeviceInfo>
                    <LogoutButton>로그아웃</LogoutButton>
                </DeviceItem>
            </SettingsSection>

            <SettingsSection>
                <SectionTitle>
                    <Shield size={20} />
                    계정
                </SectionTitle>
                <SettingItem clickable>
                    <SettingInfo>
                        <SettingLabel>데이터 내보내기</SettingLabel>
                        <SettingDescription>내 데이터 사본을 다운로드합니다</SettingDescription>
                    </SettingInfo>
                    <Arrow>→</Arrow>
                </SettingItem>
                <SettingItem clickable danger>
                    <SettingInfo>
                        <SettingLabel danger>계정 삭제</SettingLabel>
                        <SettingDescription>계정을 영구적으로 삭제합니다</SettingDescription>
                    </SettingInfo>
                    <Arrow>→</Arrow>
                </SettingItem>
            </SettingsSection>
        </Container>
    );
};

export default SettingsPage;

const Container = styled.div`
  width: 100%;
  padding: 0;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.fg};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.muted};
  margin: 0;
`;

const SettingsSection = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.fg};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SettingItem = styled.div<{ clickable?: boolean; danger?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    ${({ clickable, theme }) =>
    clickable &&
    `
      background: ${theme.surfaceHover};
      margin: 0 -16px;
      padding: 16px;
      border-radius: 12px;
    `}
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div<{ danger?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme, danger }) => (danger ? theme.danger : theme.fg)};
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.muted};
`;

const Toggle = styled.div<{ active: boolean }>`
  width: 52px;
  height: 28px;
  border-radius: 14px;
  background: ${({ active, theme }) => (active ? theme.primary : theme.border)};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const ToggleButton = styled.div<{ active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  left: ${({ active }) => (active ? '26px' : '2px')};
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Arrow = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.muted};
`;

const DeviceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    border-bottom: none;
  }
`;

const DeviceIcon = styled.div`
  font-size: 32px;
`;

const DeviceInfo = styled.div`
  flex: 1;
`;

const DeviceName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.fg};
  margin-bottom: 4px;
`;

const DeviceDetails = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.muted};
`;

const DeviceStatus = styled.div`
  background: ${({ theme }) => theme.primary}20;
  color: ${({ theme }) => theme.primary};
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
`;

const LogoutButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.danger};
  border: 2px solid ${({ theme }) => theme.danger};
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.danger};
    color: white;
  }
`;

