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
    color: #333;
    line-height: 1.6;
  }

  html, body {
    height: 100%;
  }

  #root {
    height: 100%;
  }

  a {
    text-decoration: none;
    color: #0066cc;
  }

  button {
    cursor: pointer;
  }
`;

export default GlobalStyle; 