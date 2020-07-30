# Classy Chatbot
Chatbot for Automated Advertisement Booking.

The repository is configured with the AWS Pipeline.

**Localhost execution**

1. To run the project in local, run the command as below :<br/>
```
node -r dotenv/config chat-app.js dotenv_config_path=config/.env
```

**Docker installation** 
1. Build docker image, go to the base directory of chatbot.
   docker build -t chatbot . 

2. To run the project in local in docker environment , run the command as below :<br/>
```
  docker run -itd -p 3000:3000 --env-file config/.env chatbot
```


