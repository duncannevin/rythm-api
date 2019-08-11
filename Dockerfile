## BUILD
FROM node:alpine

# Create app dir
WORKDIR /app

# Install app dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install

# Bundle app source
COPY . . 
RUN npm run build
RUN npm run kill:3000

## RUN
CMD [ "npm", "start" ]
