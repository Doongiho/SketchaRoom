import { FirebaseError } from "firebase/app"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import BackButton from "../../components/ackButton"
import InputField from "../../components/InputField"
import { auth, db } from "../../libs/firebase"
import { deleteAccount } from "./AuthService"

interface UserProfile {
  displayName: string
  email: string
  password: string
  currentPassword?: string
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [form, setForm] = useState<UserProfile>({
    displayName: "",
    email: "",
    password: "",
    currentPassword: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setError("로그인된 사용자가 없습니다.")
          setLoading(false)
          return
        }

        const ref = doc(db, "users", currentUser.uid)
        const snapshot = await getDoc(ref)
        if (snapshot.exists()) {
          const data = snapshot.data()
          const userData = {
            displayName: data.displayName || "",
            email: data.email || "",
            password: "",
            currentPassword: "",
          }
          setUser(userData)
          setForm(userData)
        } else {
          setError("사용자 정보가 없습니다.")
        }
      } catch (err) {
        console.error("프로필 정보 조회 실패", err)
        setError("사용자 정보를 불러오지 못했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      alert("로그인 정보가 없습니다. 다시 로그인 후 시도해주세요.")
      return
    }

    if (!currentUser.email) {
      alert("이메일 정보를 찾을 수 없습니다. 다시 로그인 후 시도해주세요.")
      return
    }

    try {
      if (form.password) {
        if (!form.currentPassword) {
          alert("현재 비밀번호를 입력해주세요.")
          return
        }

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          form.currentPassword,
        )
        await reauthenticateWithCredential(currentUser, credential)
        await updatePassword(currentUser, form.password)
      }

      const ref = doc(db, "users", currentUser.uid)
      await updateDoc(ref, {
        displayName: form.displayName,
        email: form.email,
      })

      setUser({ ...form, password: "", currentPassword: "" })
      setIsEditing(false)
      alert("프로필이 업데이트되었습니다.")
      navigate("/")
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error("Firebase 오류 발생", err.code, err.message)

        switch (err.code) {
          case "auth/invalid-credential":
            alert("현재 비밀번호가 올바르지 않거나 세션이 만료되었습니다.")
            break
          case "auth/user-not-found":
            alert("해당 사용자가 존재하지 않습니다.")
            break
          case "auth/wrong-password":
            alert("비밀번호가 틀렸습니다.")
            break
          default:
            alert(`Firebase 오류: ${err.message}`)
        }

        setError(err.message)
      } else if (err instanceof Error) {
        console.error("일반 오류 발생", err.message)
        setError(err.message)
        alert("오류가 발생했습니다: " + err.message)
      } else {
        console.error("알 수 없는 오류", err)
        setError("알 수 없는 오류가 발생했습니다.")
        alert("알 수 없는 오류입니다.")
      }
    }
  }

  const handleClickDelete = async () => {
    const confirm = window.confirm("정말로 탈퇴하시겠습니까?")
    if (!confirm) return

    try {
      await deleteAccount()
      alert("정상적으로 탈퇴되었습니다.")
      window.location.href = "/login"
    } catch (err) {
      console.error(err)
      alert("탈퇴 중 오류가 발생했습니다.")
    }
  }

  if (loading)
    return (
      <Wrapper>
        <Value>불러오는 중...</Value>
      </Wrapper>
    )
  if (error)
    return (
      <Wrapper>
        <Value>{error}</Value>
      </Wrapper>
    )

  return (
    <Wrapper>
      <BackButton />
      <Title>프로필</Title>

      {isEditing ? (
        <>
          <InputField
            label="이름"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            required
          />
          <InputField
            label="이메일"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <InputField
            label="현재 비밀번호"
            name="currentPassword"
            type="password"
            value={form.currentPassword || ""}
            onChange={handleChange}
          />
          <InputField
            label="새 비밀번호"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </>
      ) : (
        <>
          <InfoRow>
            <Label>이름</Label>
            <Value>{user?.displayName}</Value>
          </InfoRow>
          <InfoRow>
            <Label>이메일</Label>
            <Value>{user?.email}</Value>
          </InfoRow>
          <InfoRow>
            <Label>비밀번호</Label>
            <Value>●●●●●●</Value>
          </InfoRow>
        </>
      )}

      <ButtonArea>
        {isEditing ? (
          <Button onClick={handleSave}>저장하기</Button>
        ) : (
          <Button onClick={() => setIsEditing(true)}>수정하기</Button>
        )}
      </ButtonArea>
      <Button onClick={handleClickDelete}>탈퇴하기</Button>
    </Wrapper>
  )
}

export default ProfilePage

const Wrapper = styled.div`
  position: relative;
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
