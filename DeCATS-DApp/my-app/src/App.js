// import logo from './logo.svg';
import './App.scss';
import "./style/variables.module.scss";
import Main from './main';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { StyledEngineProvider } from '@mui/material/styles';

function App() {
  return (
      <Router>
          <StyledEngineProvider injectFirst>
        <div className="App">
          <Main />
        </div>
        </StyledEngineProvider>
      </Router>
  );
}

export default App;
