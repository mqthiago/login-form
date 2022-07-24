import { Login } from './Login';
import 'antd/dist/antd.css';
import { AuthProvider } from './hooks/auth';

function App() {
  return <AuthProvider><Login /></AuthProvider>;
}

export default App;
