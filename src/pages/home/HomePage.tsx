import { signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import Modal from "../../components/Modal"
import useAuth from "../../hooks/useAuth"
import type { FriendRoom } from "../../hooks/useFriendRooms"
import { leaveFriendRoom, useFriendRooms } from "../../hooks/useFriendRooms"
import { useMyRooms } from "../../hooks/useMyRooms"
import { auth } from "../../libs/firebase"
import type { Room } from "../../stores/useRoomStore"
import { useRoomStore } from "../../stores/useRoomStore"
import InviteModalContent from "../Modal/InviteModal"
import RoomEditModal from "../Modal/RoomEditModal"

const HomePage = () => {
  const user = useAuth()
  const navigate = useNavigate()
  const { loading, error, refetch } = useMyRooms(user?.uid)
  const rooms = useRoomStore((state) => state.rooms)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTargetRoom, setEditTargetRoom] = useState<Room | null>(null)
  const {
    rooms: friendRooms,
    loading: friendLoading,
    error: friendError,
  } = useFriendRooms()

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const handleGoToProfile = () => navigate("/profile")
  const handleGoToCreateRoom = () => navigate("/createRoom")
  const handleEnterRoom = () => navigate("/enterRoomPage")

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

  const handleModifyClick = (room: Room) => {
    setEditTargetRoom(room)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditTargetRoom(null)
  }

  const handleLeaveRoom = async (roomId: string) => {
    const confirmLeave = window.confirm("정말로 이 방에서 나가시겠습니까?")
    if (!confirmLeave) return

    try {
      await leaveFriendRoom(roomId)
      alert("방에서 나갔습니다.")
      window.location.reload()
    } catch (err) {
      console.error("나가기 실패:", err)
      alert("방 나가기 중 오류가 발생했습니다.")
    }
  }

  useEffect(() => {
    if (user === undefined) return
    if (user === null) {
      navigate("/login")
    }
  }, [user, navigate])

  return (
    <Container>
      <Header>
        <Greeting>
          {user ? `${user.displayName}님 안녕하세요` : "로그인 해주세요"}
        </Greeting>
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
                <Enter onClick={handleEnterRoom}>입장하기</Enter>
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
            {loading ? (
              <p>불러오는 중...</p>
            ) : error ? (
              <p>에러 발생: {error.message}</p>
            ) : rooms.length > 0 ? (
              <RoomList>
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    <RoomInformation>
                      <RoomName>{room.name}</RoomName>
                      <RoomDescription>{room.description}</RoomDescription>
                    </RoomInformation>
                    <ButtonGnb onClick={(e) => e.stopPropagation()}>
                      <InviteBtn onClick={() => handleInviteClick(room)}>
                        초대
                      </InviteBtn>
                      <ModifyBtn onClick={() => handleModifyClick(room)}>
                        수정
                      </ModifyBtn>
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
            {friendLoading ? (
              <p>불러오는 중...</p>
            ) : friendError ? (
              <p>에러 발생: {friendError.message}</p>
            ) : friendRooms.length > 0 ? (
              <RoomList>
                {friendRooms.map((room: FriendRoom) => (
                  <RoomCard
                    key={room.roomId}
                    onClick={() => navigate(`/room/${room.roomId}`)}
                  >
                    <RoomInformation>
                      <RoomName>{room.name}</RoomName>
                      <RoomDescription>
                        {room.ownerName} 님의 방
                      </RoomDescription>
                    </RoomInformation>
                    <ButtonGnb onClick={(e) => e.stopPropagation()}>
                      <LeaveBtn onClick={() => handleLeaveRoom(room.roomId)}>
                        나가기
                      </LeaveBtn>
                    </ButtonGnb>
                  </RoomCard>
                ))}
              </RoomList>
            ) : (
              <Message>친구방이 없습니다</Message>
            )}
          </Box>
        </Section>
      </SectionWrapper>

      {selectedRoom && isInviteModalOpen && (
        <Modal isOpen={true} onClose={closeInviteModal}>
          <InviteModalContent
            roomId={selectedRoom.id}
            onClose={closeInviteModal}
          />
        </Modal>
      )}

      {editTargetRoom && isEditModalOpen && (
        <Modal isOpen={true} onClose={closeEditModal}>
          <RoomEditModal
            roomId={editTargetRoom.id}
            initialName={editTargetRoom.name}
            initialDescription={editTargetRoom.description}
            onClose={closeEditModal}
            onUpdate={refetch}
          />
        </Modal>
      )}
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
  justify-content: space-between;

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
const RoomInformation = styled.div``

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
  gap: 10px;
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
const LeaveBtn = styled.button`
  background-color: #ff4d4f;
  color: white;
  border: none;
  font-size: 0.95rem;
  padding: 0.2rem 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d9363e;
  }
`
