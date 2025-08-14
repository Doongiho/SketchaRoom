import { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    font-family: "Do Hyeon", sans-serif;
    font-style: normal;
  }

  body {
    margin: 0;
    font-family: 'Pretendard', sans-serif;
    background-color: #f9fafb;
    height: 100%;
    margin: 0;
    overflow: hidden;         
    overscroll-behavior: none;   
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`
