import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--color-bg);
    color: var(--color-text);
    line-height: 1.6;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  html, body {
    height: 100%;
  }

  #root {
    height: 100%;
  }

  a {
    text-decoration: none;
    color: var(--color-link);
  }

  button {
    cursor: pointer;
  }
`;

export default GlobalStyle; 