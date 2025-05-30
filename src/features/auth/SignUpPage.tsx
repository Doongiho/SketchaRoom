import { FirebaseError } from "firebase/app"
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { useState } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import InputField from "../../components/InputField"
import { auth, db, googleProvider } from "../../libs/firebase"

const SignUpPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password, confirmPassword, displayName } = form

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )
      await updateProfile(userCredential.user, { displayName })

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        createdAt: serverTimestamp(),
      })

      navigate("/login")
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(err.message)
      } else {
        setError("회원가입에 실패했습니다.")
      }
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
      })

      navigate("/login")
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(err.message)
      } else {
        setError("구글 회원가입에 실패했습니다.")
      }
    }
  }

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <Title>이메일 회원가입</Title>

        <InputField
          label="닉네임"
          name="displayName"
          placeholder="닉네임"
          value={form.displayName}
          onChange={handleChange}
          required
        />

        <InputField
          label="이메일"
          name="email"
          type="email"
          placeholder="이메일 주소"
          value={form.email}
          onChange={handleChange}
          required
        />

        <PasswordWrapper>
          <InputField
            label="비밀번호"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Icon onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </Icon>
        </PasswordWrapper>

        <PasswordWrapper>
          <InputField
            label="비밀번호 확인"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="비밀번호 재입력"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <Icon onClick={() => setShowConfirm((prev) => !prev)}>
            {showConfirm ? <FiEyeOff /> : <FiEye />}
          </Icon>
        </PasswordWrapper>

        {error && <Error>{error}</Error>}
        <Button type="submit">회원가입</Button>
        <Button type="button" onClick={handleGoogleSignUp}>
          구글 회원가입
        </Button>
      </Form>
    </Wrapper>
  )
}

export default SignUpPage

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`
const Title = styled.p`
  font-size: 1.5rem;
`
const Form = styled.form`
  width: 360px;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
`

const Button = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background-color: #ffc6c6;
  color: rgb(51, 38, 1);
  border: 2px solid #594100;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 6px;
  transition: background-color 0.3s ease, color 0.3s ease,
    border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #594100;
    color: #ffffff;
  }
`

const Error = styled.p`
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`

const PasswordWrapper = styled.div`
  position: relative;
`

const Icon = styled.span`
  position: absolute;
  right: 10px;
  top: 75%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #555;
  font-size: 1.1rem;
`
