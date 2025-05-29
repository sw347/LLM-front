import React from 'react';
import ChatPage from './src/pages/ChatPage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ChatPage />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
