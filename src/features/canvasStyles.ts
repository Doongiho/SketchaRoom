import styled, { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
  html, body, #root { height: 100%; margin: 0; overflow: hidden; }
  * { box-sizing: border-box; }
`

export const Wrapper = styled.div`
  display: flex;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  overscroll-behavior: none;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

export const CanvasWrapper = styled.div`
  flex: 1;
  background: #fff;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

export const CanvasEl = styled.canvas`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
  user-select: none;
  cursor: default;
`

export const ToolbarToggleButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 8px 16px;
    background-color: #594100;
    color: white;
    border: none;
    border-radius: 6px;
    z-index: 20;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

export const Toolbar = styled.div<{ $mobileVisible?: boolean }>`
  width: 180px;
  border-left: 1px solid #000;
  padding: 2rem;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 1px solid #ccc;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 1rem;
    position: fixed;
    bottom: 0;
    left: 0;
    background: #f9f9f9;
    z-index: 10;

    transform: translateY(
      ${({ $mobileVisible }) => ($mobileVisible ? "0" : "100%")}
    );
    opacity: ${({ $mobileVisible }) => ($mobileVisible ? 1 : 0)};
    pointer-events: ${({ $mobileVisible }) =>
      $mobileVisible ? "auto" : "none"};
    transition: transform 0.4s ease, opacity 0.4s ease;
  }
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  max-width: 160px;
  box-sizing: border-box;
`

export const ToolRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    width: 100%;
  }
`

export const Button = styled.button`
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;

  &.active {
    background-color: #d0e8ff;
    border-color: #3399ff;
  }
`

export const Title = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`

export const BackDiv = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  transform: translateX(-50%);
  z-index: 20;
`

export const ColorPicker = styled.input`
  appearance: none;
  -webkit-appearance: none;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  padding: 0;
  background: none;
  cursor: pointer;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);

  &::-webkit-color-swatch-wrapper {
    padding: 0;
    border-radius: 50%;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
`

export const JoinUser = styled.div``
export const JoinUserList = styled.li`
  list-style-type: none;
`
