# Rythm_api

TodoMdl list collaboration. 

# Pre-reqs
- Install [Node.js](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/)
- Configure your SMTP service and enter your SMTP settings inside `.env.example`

# Swagger
To access Swagger UI for available endpoints
```
http://localhost:3000/api-docs/#/
```
Pass token from `/auth/login` when using protected endpoints (for example: getting all `/users`) like `Bearer <token>`

# Import mock users
```
mongoimport --db heroes-db --collection users --file users.json --jsonArray
```
