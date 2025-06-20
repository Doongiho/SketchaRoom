import { FirebaseError } from "firebase/app"
import { signInWithPopup } from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { useState } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import InputField from "../../components/InputField"
import { auth, db, googleProvider } from "../../libs/firebase"
import { loginWithEmail } from "./AuthService"

const firebaseErrorMessages: Record<string, string> = {
  "auth/user-not-found": "등록되지 않은 이메일입니다.",
  "auth/wrong-password": "비밀번호가 일치하지 않습니다.",
  "auth/invalid-email": "유효하지 않은 이메일 주소입니다.",
  "auth/popup-closed-by-user": "로그인 창이 닫혔습니다. 다시 시도해주세요.",
  "auth/cancelled-popup-request": "이미 로그인 창이 열려 있습니다.",
  "auth/popup-blocked": "팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.",
  "auth/invalid-credential": "아이디나 비밀번호가 틀렸습니다.",
  "auth/network-request-failed":
    "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
}

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      return
    }

    try {
      await loginWithEmail(form.email, form.password)
      navigate("/homepage")
    } catch (err) {
      if (err instanceof FirebaseError) {
        const message = firebaseErrorMessages[err.code] || err.message
        setError(message)
      } else {
        setError("로그인 중 알 수 없는 오류가 발생했습니다.")
      }
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )

      navigate("/homepage") 
    } catch (err) {
      if (err instanceof FirebaseError) {
        const message = firebaseErrorMessages[err.code] || err.message
        setError(message)
      } else {
        setError("구글 로그인 중 알 수 없는 오류가 발생했습니다.")
      }
    }
  }

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <h2>로그인</h2>

        <InputField
          label="이메일"
          name="email"
          type="email"
          placeholder="이메일"
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

        <Signup onClick={() => navigate("/signup")}>회원가입</Signup>
        {error && <Error>{error}</Error>}

        <Button type="submit">로그인</Button>
        <Button type="button" onClick={handleGoogleLogin}>
          구글 로그인
        </Button>
      </Form>
    </Wrapper>
  )
}

export default LoginPage

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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

const Signup = styled.p`
  text-align: right;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 8px;
  color: #594100;
  text-decoration: underline;
`

const Error = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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
