# Chatbot Voice Enabled Jquery Plugin
Chatbot Voice Enabled Jquery Plugin which has the features same as the Facebook Messanger Templates. 
API based Facebook Template inplementation for Chatbot Jquery Plugin.

### Chatbot Demo Link : 
https://www.youtube.com/watch?v=eAvfhFVIEqc

### Documnetation : 
  The payload for the templates are in the below documentation link : 
 ![alt Documnetation](https://github.com/anurupborah2001/chatbot/blob/main/docs/SPHChatPayload.pdf?raw=true)

### Chatbot Templates
The below are the templates supported by this chatbot Jquery Plugin:
1. Message Template
   <br/>![alt Message Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/message_template.png?raw=true)
2. Quick Reply Template
  <br/>![alt Quick Reply Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/quick_reply_template.png?raw=true)
3. Generic Template
  a. With Carousel
   <br/> ![alt Generic Template With Carousel](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/generic_template_with_carousel.png?raw=true)
  b. Without Carousel
    <br/>![alt Generic Template Without Carousel](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/generic_template_without_carousel.png?raw=true)
4. Button Template
    <br/>![alt Button Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/button_template.png?raw=true) 
5. Video Article Template
  a. With Carousel
   <br/>![alt Video Article Template With Carousel](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/video_article_with_carousel.png?raw=true) 
  b. Without Carousel
   <br/>![alt Video Article Template Without Carousel](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/video_article_without_carousel.png?raw=true) 
6. Audio Article Template
  <br/>![alt Audio Article Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/audio_article_template.png?raw=true) 
7. List Template
 a. list-header-view-more
    <br/>![alt List Template list-header-view-more](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/list_template_list-header-view-more.png?raw=true) 
 b.  list-header-view-readmore
    <br/>![alt List Template list-header-view-readmore](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/list_template_list-header-view-readmore.png?raw=true)
 c. list-view-readmore
    <br/>![alt List Template list-view-readmore](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/list_template_list-view-readmore.png?raw=true)
8. Date, Datetime, Time , Date Range, Datetime Range Picker Template
   a.Datetime Range Picker
     <br/>![alt Datetime Range Picker](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/datetime_range_picker.png?raw=true)
   b. Date Range Picker
    <br/> ![alt Date Range Picker](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/date_range_picker.png?raw=true)
   c. Time Picker
     <br/> ![alt Time Picker](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/time_picker.png?raw=true)
    d. Date Picker
     <br/> ![alt Date Picker](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/date_picker.png?raw=true)
9. Receipt Template
   <br/>![alt Receipt Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/receipt_template.png?raw=true)
10. Text Order Receipt Template
   <br/>![alt Text Order Receipt Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/text_order_reciept_order_template.png?raw=true)
11. Attach File Template
   <br/>![alt Attach File Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/attach_file_template.png?raw=true)
12. Image Attachment Template
  <br/> ![alt Image Attachment Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/image_attach_template.png?raw=true)
13. Form Template
   <br/>![alt Form Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/form_template.png?raw=true)
14. Persistent Menu Template
  <br/> ![alt Persistent Menu Template](https://github.com/anurupborah2001/chatbot/blob/main/docs/img/persistent_menu_template.png?raw=true)


### Backend Logic for the Chatbot
> Chatbot for Automated Advertisement Booking.

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

Automated Advertisement Booking.

