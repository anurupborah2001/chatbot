FROM node:12

LABEL maintainer="Anurup Borah<anuborah@sph.com.sg> and Shankar Saran Singh <sssingh@sph.com.sg>"
LABEL version="0;1"
LABEL description="Classy is a chatbot used by SPH classifieds"

RUN mkdir -p /usr/src/app

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN npm install

EXPOSE 8080

CMD [ "node", "chat-app.js" ]