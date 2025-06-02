import React from 'react';
import ChatPage from './src/pages/ChatPage';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ChatPage />
    </SafeAreaProvider>
  );
}

export default App;
