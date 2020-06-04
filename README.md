# Rythm_api

TodoMdl list collaboration. 

# Pre-reqs
- Install [Node.js](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/)

# Swagger
> To access Swagger UI for available endpoints
```
http://localhost:3000/api-docs/#/
```
> Pass token from `/auth/login` when using protected endpoints (for example: getting all `/users`) like `Bearer <token>`

# Import mock users
```
mongoimport --db heroes-db --collection users --file users.json --jsonArray
```

# Environment Variables

> Enironment variables are passed through the `docker-compose.yml` file

```
- SESSION_SECRET=${SESSION_SECRET} // this is the ONLY required variable
- LINKEDIN_CLIENT_ID=${LINKEDIN_CLIENT_ID}
- LINKEDIN_CLIENT_SECRET=${LINKEDIN_CLIENT_SECRET}
- GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
- GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
- TWITTER_CLIENT_ID=${TWITTER_CLIENT_ID}
- TWITTER_CLIENT_SECRET=${TWITTER_CLIENT_SECRET}
- GOOGLE_CLIENT_ID=${GITHUB_CLIENT_ID}
- GOOGLE_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}

```
