# Blog Rendering using React
 A react front end UI which renders a blog page. The blog page data is fetched from a node backend created in node.js training. 
 
## Features

- fetches blogs from an node backend and displays all blogs on home page
- shows blog detail on clicking any blog card
- dynamically rendering blogs on detail page
- dynamic navigation based on logged in user
- react app is hosted on **Vercel**
- all auth login is implemented on node auth server running on heroku

## Drawbacks

- Local state management is used
- needs a global state management
- because of state management app is buggy - logout works only on home page
- app reloads on each requets

## Extented Features

Worked on all the Drawbacks previously mentioned

- Used Redux For Global State Management
- bugs fixed :- logout working from each routes, checking auth and Dynamic Navigation
- App reloads fixed using History object
- maintained and re-performs auth and display blogs after page relods ( as redux looses its state ob page reloads)
- Used Redux-Thunk as a Middleware
- Used Reactstrap and Bootstrap for layouting the Blog List (Blog Home)

### Default User Login Credentials To See Blogs

Email : altafshaikh@me.com

Password : R#1aasdf


## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Downloading and Running this Project Locally

1. clone the repository
```
git clone https://github.com/ialtafshaikh/react-blog-frontend.git
```

2. change directory to `cd react-blog-frontend`

3. run command `npm i` to install all dependencies

4. now to run the app run the below command:

  ```
  npm run start
  ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

- You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

- To learn React, check out the [React documentation](https://reactjs.org/).

- [Learn react router](https://reactrouter.com/web/guides/quick-start)

- [Learn react router video tutorial](https://www.youtube.com/watch?v=Law7wfdg_ls)

- [Redux Thunk video](https://www.youtube.com/watch?v=z2XCUu2wIl0)

- [Redux thunk Blog](https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60)

- [Redux thub video](https://www.youtube.com/watch?v=Sqkm39rqmEg)

- [Bootstrap and Reactstrap cards](https://reactstrap.github.io/components/card/)

- [Redux Officail Tutorial](https://redux.js.org/tutorials/essentials/part-1-overview-concepts)

- [Redux Tutorial playlist](https://www.youtube.com/watch?v=9boMnm5X9ak&list=PLC3y8-rFHvwheJHvseC3I0HuYI2f46oAK)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

## Live Demo of this Project

[Live Working](https://react-blog-frontend.vercel.app/)

## Author

* **Altaf Shaikh** - *work by* - [ialtafshaikh](https://github.com/ialtafshaikh)

![altaf shaikh](https://raw.githubusercontent.com/ialtafshaikh/static-files/master/coollogo_com-327551664.png)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

