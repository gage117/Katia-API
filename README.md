## Endpoints
### This is an JSON API server, it both expects JSON and returns JSON.
/auth/token
* POST Creates an auth token. Requires valid ```email``` and ```password``` (created when you make a user account). Returns a JWT token named ```authToken```.

/swipe/:userId
* GET Get the queue of possible matches. Requires the ```userId```. Returns an JSON object with the key ```queue``` and the value is an array of all possible matches for the user to swipe on. 
* POST When a user "approves" of a match it will add them to their matches table. Requires ```userId``` in params which is the Id of the current logged in user and ```id``` in the body which is the id of the user who was approved. Returns nothing but a status 201 when successful.

/user/
* GET
* POST

/user/:userId
* GET
* PATCH

/user/:userId/matches
* GET
* POST


# Express Boilerplate!

This is a boilerplate project used for starting new projects!

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone https://github.com/gage117/express-app-boilerplate.git NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
