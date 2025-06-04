import { signOut } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import Modal from "../../components/Modal"
import useAuth from "../../hooks/useAuth"
import { auth, db } from "../../libs/firebase"
import InviteModalContent from "../Modal/InviteModal"

interface Room {
  id: string
  name: string
  createdBy: string
  description: string
  createdByName?: string
}

const HomePage = () => {
  const user = useAuth()
  const navigate = useNavigate()
  const [myRooms, setMyRooms] = useState<Room[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchRooms = async () => {
      try {
        const q = query(
          collection(db, "rooms"),
          where("createdBy", "==", user.uid),
        )
        const querySnapshot = await getDocs(q)
        const roomsData = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() as Room
            const userRef = doc(db, "users", data.createdBy)
            const userDoc = await getDoc(userRef)
            const nickname = userDoc.exists()
              ? userDoc.data().displayName
              : "알 수 없음"
            return {
              ...data,
              id: docSnap.id,
              createdByName: nickname,
            }
          }),
        )
        setMyRooms(roomsData)
      } catch (error) {
        console.error("방 목록 또는 닉네임 조회 실패", error)
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

  const handleGoToCreateRoom = () => {
    navigate("/createRoom")
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      alert("로그아웃 되었습니다.")
      navigate("/login") 
    } catch (error) {
      console.error("로그아웃 실패:", error)
      alert("로그아웃 중 오류가 발생했습니다.")
    }
  }

  const handleInviteClick = (room: Room) => {
    setSelectedRoom(room)
    setIsInviteModalOpen(true)
  }

  const closeInviteModal = () => {
    setIsInviteModalOpen(false)
    setSelectedRoom(null)
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
                <Whiteboard onClick={handleGoToCreateRoom}>
                  화이트보드 만들기
                </Whiteboard>
                <Enter>입장하기</Enter>
                <Logout onClick={handleLogout}>로그아웃</Logout>
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
              <RoomList>
                {myRooms.map((room) => (
                  <RoomCard key={room.id}>
                    <RoomInformation
                      onClick={() => navigate(`/room/${room.id}`)}
                    >
                      <RoomName>{room.name}</RoomName>
                      <RoomDescription>{room.description}</RoomDescription>
                    </RoomInformation>
                    <ButtonGnb>
                      <InviteBtn onClick={() => handleInviteClick(room)}>
                        초대
                      </InviteBtn>
                      {selectedRoom && (
                        <Modal
                          isOpen={isInviteModalOpen}
                          onClose={closeInviteModal}
                        >
                          <InviteModalContent
                            roomId={selectedRoom.id}
                            onClose={closeInviteModal}
                          />
                        </Modal>
                      )}
                      <ModifyBtn>수정</ModifyBtn>
                    </ButtonGnb>
                  </RoomCard>
                ))}
              </RoomList>
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

const RoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`
const RoomCard = styled.div`
  padding: 1rem;
  border-top: 1px solid #ccc;
  cursor: pointer;
  background-color: #fafafa;
  transition: background-color 0.2s;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: #f0f0f0;
  }
`
const RoomInformation = styled.div`
  width: 70%;
`

const RoomName = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

const RoomDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

const ButtonGnb = styled.div`
  display: flex;
  justify-content: space-between;
  width: 25%;
`
const InviteBtn = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  font-size: 0.95rem;
  padding: 0.2rem 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #45a049;
  }
`

const ModifyBtn = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  font-size: 0.95rem;
  padding: 0.2rem 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1976d2;
  }
`
