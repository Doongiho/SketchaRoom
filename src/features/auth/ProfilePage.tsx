import styled from "styled-components"

const ProfilePage = () => {
  return (
    <Wrapper>
      <Title>내 프로필</Title>

      <InfoRow>
        <Label>이름</Label>
        <Value>홍길동</Value>
      </InfoRow>

      <InfoRow>
        <Label>이메일</Label>
        <Value>hong@example.com</Value>
      </InfoRow>

      <InfoRow>
        <Label>비밀번호</Label>
        <Value>●●●●●●</Value>
      </InfoRow>

      <ButtonArea>
        <Button>수정하기</Button>
      </ButtonArea>
    </Wrapper>
  )
}

export default ProfilePage
const Wrapper = styled.div`
  max-width: 480px;
  margin: 60px auto;
  padding: 2rem;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
`

const Title = styled.h2`
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 2rem;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const Label = styled.span`
  font-weight: bold;
  color: #333;
`

const Value = styled.span`
  color: #555;
`

const ButtonArea = styled.div`
  margin-top: 2rem;
  text-align: center;
`

const Button = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background-color: #ffc6c6;
  color: #594100;
  border: 2px solid #594100;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
  transition: background-color 0.3s ease, color 0.3s ease,
    border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #594100;
    color: #ffffff;
  }
`
