import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resetBox: {
    padding: 10,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    borderBottomColor: '#6A9097',
    borderBottomWidth: 1,
  },
  button: {
    backgroundColor: '#6A9097',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  resetTest: {
    color: '#fff',
  },
  chattingBox: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {textAlign: 'center', marginTop: 200},
  scrollViewContentStyle: {flexGrow: 1, paddingBottom: 20},
  inputFocused: {
    borderWidth: 2,
  },
  speackButton: {
    borderRadius: '50%',
    backgroundColor: '#6A9097',
    textAlign: 'center',
    width: 48,
    height: 48,
    marginRight: 8,
    alignItems: 'center',
  },
  userChat: {
    padding: 10,
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 10,
    marginLeft: 32,
  },
  botChat: {
    padding: 10,
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 10,
    marginRight: 32,
  },
  messageText: {fontSize: 16},
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
