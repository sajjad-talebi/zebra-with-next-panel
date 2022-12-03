import axios from 'axios';
import { createResourceId } from '../utils/create-resource-id';
import { decode, JWT_EXPIRES_IN, JWT_SECRET, sign } from '../utils/jwt';
import { wait } from '../utils/wait';

const users = [];

class AuthApi {
  async login(request) {
    const { email, password } = request;

    await axios.post('https://betadev.zebravpn.com/api/login', {
      username:email,
      password
    }).then((response) => {
      if(response.data.status){
        users.push(response.data);
      }
     
    }).catch((error) => {
      console.log(error);
    });

    return new Promise((resolve, reject) => {
      try {
        // Find the user
        const user = users.find((_user) => _user.user.email === email);

        if (!user || (user.user.password !== password)) {
          reject(new Error('Please check your email and password'));
          return;
        }
  
        // Create the access token
        const accessToken = sign({ userId: user.user.id, userToken: user.token, }, JWT_SECRET, {expiresIn: user.accessTokenExpiry });

        resolve({ accessToken });
      } catch (err) {
        console.error('[Auth Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  async register(request) {
    const { email, name, password } = request;

    await axios.post('https://betadev.zebravpn.com/api/register', {
      email,
      password,
      password_confirmation:password
    }).then((response) => {
      if(response.data.status){
        users.push(response.data);
      };
    }).catch((error) => {
      console.log(error);
    });


    return new Promise((resolve, reject) => {
      try {
        // Check if a user already exists
        let user = users.find((_user) => _user);

        if (!user) {
          reject(new Error('User Cannot be created'));
          return;
        }



        users.push(user);

        const accessToken = sign({ userId: user.user.id, userToken: user.token, }, JWT_SECRET, {expiresIn: user.accessTokenExpiry });

        resolve({ accessToken });
      } catch (err) {
        console.error('[Auth Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  async me(request) {
    const { accessToken } = request;
           // Decode access token
           const { userId,userToken } = decode(accessToken);
           await axios.get('https://betadev.zebravpn.com/api/user', {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }).then((response) => {
            if(response.data.status){
              console.log(response.data);
              users.push(response.data);
            };
          }).catch((error) => {
            console.log(error);
          });

    return new Promise((resolve, reject) => {
      try {
 
        // Find the user
        const user = users.find((_user) => _user.user.id === userId);

        if (!user) {
          reject(new Error('Invalid authorization token'));
          return;
        }

        resolve({
          id: user.id,
          avatar: user.profile_photo_url,
          email: user.email,
          name: user.name,
          plan: user.plan
        });
      } catch (err) {
        console.error('[Auth Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }
}

export const authApi = new AuthApi();
