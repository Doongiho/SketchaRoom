import { collection, getDocs, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import useAuth from "../../hooks/useAuth"
import { db } from "../../libs/firebase"
interface Room {
  id: string
  title: string
  ownerUid: string
}

const HomePage = () => {
  const user = useAuth()
  const navigate = useNavigate()
  const [myRooms, setMyRooms] = useState<Room[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchRooms = async () => {
      try {
        const q = query(
          collection(db, "rooms"),
          where("ownerUid", "==", user.uid),
        )
        const querySnapshot = await getDocs(q)
        const rooms = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Room),
        )
        setMyRooms(rooms)
      } catch (error) {
        console.error("방 목록 조회 실패", error)
      }
    }

    fetchRooms()
  }, [user])

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const handleGoToProfile = () => {
    navigate("/profile")
  }

  return (
    <Container>
      <Header>
        <Greeting>
          {user ? `${user.displayName}님 안녕하세요` : "로그인 해주세요"}
        </Greeting>
        <UserIDText>{user?.uid && `UID: ${user.uid}`}</UserIDText>
        <MenuDiv onClick={toggleMenu}>
          <MenuButton>
            <Bar />
            <Bar />
            <Bar />
          </MenuButton>
          {isMenuOpen && (
            <MenuModal>
              <MenuContnet>
                <Profile onClick={handleGoToProfile}>프로필</Profile>
                <Whiteboard>화이트보드 만들기</Whiteboard>
                <Enter>입장하기</Enter>
                <Logout>로그아웃</Logout>
              </MenuContnet>
            </MenuModal>
          )}
        </MenuDiv>
      </Header>

      <Divider />

      <SectionWrapper>
        <Section>
          <SectionTitle>내 방 리스트</SectionTitle>
          <Box>
            {myRooms.length > 0 ? (
              <ul>
                {myRooms.map((room) => (
                  <li key={room.id}>{room.title}</li>
                ))}
              </ul>
            ) : (
              <Message>
                방이 없습니다
                <br />
                만들어보세요!
              </Message>
            )}
          </Box>
        </Section>

        <Section>
          <SectionTitle>친구방 리스트</SectionTitle>
          <Box>
            <Message>
              방이 없습니다
              <br />
              만들어보세요!
            </Message>
          </Box>
        </Section>
      </SectionWrapper>
    </Container>
  )
}

export default HomePage

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
`

const Header = styled.header`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  align-items: center;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`

const Greeting = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`

const UserIDText = styled.p`
  font-size: 0.75rem;
  color: #777;
  margin-top: 0.25rem;
`

const MenuButton = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const MenuDiv = styled.div`
  position: relative;
`

const MenuModal = styled.div`
  position: absolute;
  top: 36px;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 180px;
  z-index: 1000;
`

const MenuContnet = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
`

const MenuItem = styled.li`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f4f4f4;
  }
`

const Profile = styled(MenuItem)``
const Whiteboard = styled(MenuItem)``
const Enter = styled(MenuItem)``
const Logout = styled(MenuItem)``

const Bar = styled.div`
  width: 24px;
  height: 2px;
  background-color: #000;
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #ccc;
  margin-bottom: 2rem;
`

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`

const Section = styled.section`
  flex: 1 1 100%;
  min-width: 280px;

  @media (min-width: 768px) {
    flex: 1 1 45%;
  }
`

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
`

const Box = styled.div`
  border: 1px solid #000;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow-y: auto;
`

const Message = styled.p`
  color: #bbb;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.6;
`
