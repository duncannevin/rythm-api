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

## RUN
CMD [ "npm", "start" ]
