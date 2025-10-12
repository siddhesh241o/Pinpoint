
const USER_ID_KEY = 'pinpoint_user_id';
const USERNAME_KEY = 'pinpoint_username';


const ADJECTIVES = ['Swift', 'Silent', 'Brave', 'Clever', 'Witty', 'Curious', 'Gentle', 'Wise', 'Bold', 'Bright', 'Ancient', 'Silent', 'Dancing', 'Crimson'];
const NOUNS = ['Pigeon', 'Sparrow', 'Kite', 'Mongoose', 'Leopard', 'Tiger', 'Elephant', 'Peacock', 'Cobra', 'Langur', 'River', 'Star', 'Mountain', 'Forest'];


function generateUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}${num}`;
}


export function getUserIdentity() {
  let userId = localStorage.getItem(USER_ID_KEY);
  let username = localStorage.getItem(USERNAME_KEY);

  if (!userId || !username) {
    userId = crypto.randomUUID();
    username = generateUsername();
    
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(USERNAME_KEY, username);
  }

  return { userId, username };
}
