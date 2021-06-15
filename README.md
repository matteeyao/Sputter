# Online Store App (Frontend)

For today's project, we are going to continue to build the Online Store we started yesterday. Our focus for today will be completing our authentication cycle by adding frontend authentication. Once we have finished user authentication (`register`, `login` and `logout`) our users will be able to view and create products in our store.

## Phase D: React Setup

We are going to speed up the React set for this project by using `create-react-app`. The last time we built the frontend for the Greek Gods project, we installed React at the project root. This time, we will decouple the frontend from the backend so that they could be hosted separately.

1. Run `npm install -g create-react-app` to install `create-react-app` globally.

    * Update `npm` if prompted to do so.

    * If you currently have `webpack` in the `package.json` for your project remove it, delete both your `package.json.lock` and your `node_modules` and run `npm install` again.

2. In the root directory of the project, run `create-react-app client`

    * When the script is finished running, you'll see a new `client` folder in your root directory which contains a simple, standalone react application.

    * If you look in the `client` directory, you will notice that it has its own `node_modules` folder. Make sure to `.gitignore` this folder.

3. React will be running on its own development server, `localhost:3000`. While we could write separate commands to run each server, wouldn't it be nice to run both at the same time? We will use an npm package called `concurrently` in order to run both servers at once.

    * Navigate to the root directory of your project

    * Run `npm install concurrently`

4. Add four new scripts to your `package.json` in the root of your project:

    * `"client-install": "npm install --prefix client"` (This will allow users who download your project from GitHub to easily install dependencies from both folders)

    * `"client": "npm start --prefix client"`

    * `"server": "nodemon index.js"`

    * `"dev": "concurrently \"npm run server\" \"npm run client\""` (replace your old dev script with this one)

Now, if we run `npm run dev` in the terminal, both of our servers will start running. You can view the frontend on `localhost:3000`. If you run into a compatibility error, make sure that the version of webpack in your root `package.json` matches with the version installed with `create-react-app`. Update the version number in the root `package.json`, delete the `node_modules` folder and `package-lock.json`, and run `npm install` again.

