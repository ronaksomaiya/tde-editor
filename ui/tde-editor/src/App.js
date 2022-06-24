import logo from './logo.png';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Editor from './components/Editor';

function App() {
  return (
    <div className="App">
      <Container>
        <Row>
          <Col>
            <img src={logo} className="App-logo" alt="logo" />
          </Col>
          <Col>TDE Template Editor</Col>
          <Col>Built by 4V Services</Col>
        </Row>
        <Editor />
      </Container>
    </div>
  );
}

export default App;
