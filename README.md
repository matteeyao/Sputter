


</br>

---

</br>

## React Setup

Start by setting up the frontend of the application:

* In your terminal, run the command below, which will install React globally. Update `npm` if prompted to do so.

    ```
    npm install -g create-react-app
    ```

* In the root directory of your project, run the command below - this will install a new React application in a new folder called `frontend`.

    ```
    create-react-app frontend
    ```

* If you look in the `frontend` directory, you will notice that it has its own `node_modules` folder. Make sure to `.gitignore` this folder.

* When setting up routes for our React app, we don't want to be required to type the full path; we would rather just write something like `'/api/users/:id'`. To do this we will need to add a key-value pair to the `package.json` **in our frontend folder**: `"proxy": "http://localhost:5000"`

* React runs on its own development server - localhost:3000. While we could write separate commands to run each server, this would quickly become rote. We will use an npm package called 'concurrently' to run both servers at once.

    + As a sidenote, making an axios request with a proxy will first run an API request to localhost:3000 and then redirect the request to localhost:5000. You may get a console error saying that the route, localhost:3000/api/users/ does not exist. This error is okay, as axios is making a request to both servers at this point.

* Navigate to the root directory of your project

* Run

    ```
    npm install concurrently
    ```

* Add three new scripts to your `package.json`:

    + The first script will allow users who download your project from GitHub to easily install dependencies from both folders

    ```
    "frontend-install": "npm install --prefix fronted"

    "frontend": "npm start --prefix frontend"

    "dev": "concurrently \"npm run server\" \"npm run frontend\""
    ```
* Now, if we type `npm run dev` in the terminal, both of our servers will start running. You can view the frontend on `localhost:3000`

* You may find the Chrome React Developer Tools and Redux DevTools useful for your project. If you installed the 'ES7 React/Redux/GraphQL/React-Native snippets' extension in VS Code, you can run 'rfc → tab' to create a functional component or 'rcc → tab' to create a class component. (make sure to review the documentation for this extension).

</br>

---

</br>

## Frontend Auth

### Axios and jwt-decode

Let's add `axios` and `jwt-decode` to our frontend so that we can fetch information from our server and parse the user's token:

* Navigate to your frontend folder

* Run

    ```
    npm install axios jwt-decode
    ```

Project startup:

```
npm run dev
```

### Setting Axios Headers

Let's start out by ensuring that we send our authorization token w/ every request. In the last section, you installed `axios` so that you could make requests to your server from the frontend. We will be using `axios` to make our requests instead of `AJAX` like you did in the full stack project. 

Conveniently, `axios` allows us to set a common header for requests. We only have to do this once upon login (or when the user refreshes the page when we check to make sure the token has not expired). Let's create a new file in our `util` directory called `session_api_util.js`. We'll create a `setAuthToken`` method to either set or delete the common header dependent on whether the token is passed into our method:

```js
// frontend/src/util/session_api_util.js

import axios from 'axios';

export const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = token;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
```

We can pass in a falsy value to our function to ensure that the token will be removed from memory once our user is logged out or when the token has expired.

### User Logout

We will store a boolean value in our state to indicate that the user is authenticated. We can map this slice of state to our components to selectively render information depending on whether our user is logged in. It may seem a bit counterintuitive to set up logout before login, but we want to start building our app from the entry file and will need to handle logout there. In this example, we've attempted to make the redux pattern as similar as possible to the one you are familiar with previous project examples. Delete the preconfigured component files from `create-react-app` and create a new file in `src` called `index.js`.

</br>

---

</br>

## Testing the Frontend to Backend Connection on our MERN Stack App

To test that the frontend is connected to the backend, in Chrome Developer Tools, enter

```js
axios.get("/api/users/test").then(res => console.log(res))

// → {data: {…}, status: 200, statusText: "OK", headers: {…}, config: {…}, …}
```