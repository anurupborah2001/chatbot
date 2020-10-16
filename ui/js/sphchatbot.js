/**
Summary.  SPHChatbot is a SPH Chat product that interacts with backend to full the customer needs.
Description. SPHChatbot is a SPH Chat product that interacts with backend to full the customer needs. SPHChat bot
has several templating features that can help the users with various need of a chatbot functionality.
In this javascript, some implementation is solely depended on the implementation of where this chatbot is implemented.

Author : Anurup Borah
Version : 1.0.0
Date : 03.06.2020
*/
var globalVariable={};

$.fn.hasAttr = function(name) {
   return this.attr(name) !== undefined;
};

$(function(){
    var now = new Date();
    var APIDOMAIN = "http://alb-classified-chatbot-dev-947898346.ap-southeast-1.elb.amazonaws.com";
    var API = APIDOMAIN + "/message";
    var APIUPLOAD = APIDOMAIN + "/fileupload";
    var awesComplete = "";
    var cookieValue="";

    var errMsg = {
        error_connect : "Error Connecting to Chatbot<br/>Sorry for the inconvenience caused.",
        error_communicate :  "Error in communication to Chatbot<br/>Sorry for the inconvenience caused.",
        error_file_upload :  "Error in file upload",
        error_back_click : "Sorry, cannot click back.<br/>Please proceed further."
    };

    var successMsg = {
        success_upload : "<b>Successfully Uploaded.</b>"
    };

    var alertOptions = {
        headerText : "Error",
        contentText : errMsg.error_connect,
        templateLinkText : "",
        templateLink : ""
     };

     var chatElement = {
        chatIcon : '#chatIcon',
        chatWelcomeWindow : '.chattwoo',
        chatWindow : '.chatthree',
        chatContentWindow : 'div.jsm-chat-content',
        chatClose: '.closeChat',
        chatArea: 'div.chatareadiv',
        chatModal: '#chatModal',
        chatContent : '#screen-content',
        inputChatId : 'btn-input',
        inputChat : '#btn-input',
        attachForm : '#attachForm',
        panelFooter: '.panel-footer',
        micButton: 'span#chatMicBtn',
        attachForm : '#attachForm',
        inputAttach: 'input#fileElem',
        inputDateTimeRange: 'input#datetimerangepicker',
        inputDateRange: 'input[name="daterange"]',
        divDateRange: '#daterangepicker',
        backButton : '#chatBackBtn',
        chatButton: 'button#btn-chat',
        homeButton : '#chatHomeBtn',
        getStarted : 'div.jsm-get-started-button',
        formSubmitButton : 'button#submitBtn',
        formClearButton : 'button#clearBtn',
        messageArea : '.messagesendarea',
        uploadProgress : '#progress-bar',
        uploadDropArea : 'div#drop-area',
        uploadDiv : 'div.jsm-file-upload',
        inputDatePicker : 'div#datepicker',
        payNowButtonLink : '.pay-button-holder a',
        payNowButton: '.pay-button-holder',
        panelFooter : '.panel-footer',
        divTyping: 'div.typing-div',
        divAttachLink : 'div.jsm-share a',
        divAttachImage : 'div.jsm-image img',
        divOrderImage: 'span.jsm-order-img img',
        divQuickReply : 'button.jsm-quick-reply-option',
        divOrderSummaryDiv  : 'div.ordersummarybtn-div',
        divOrderSummaryBtn  : 'button.ordersummarybtn',
        divQuickReplyDiv : 'div.jsm-quick-reply-option-div',
        divGenericOption : 'button.jsm-button',
        divGenericTemplate : 'div.jsm-generic-template',
        divBotChatWrapper : 'div.bot'
     };


     var getRequestObj = {};
     var textOpt = {};
     var panelFooter = $(chatElement.panelFooter);
     var inputChat= $(chatElement.inputChat);
     var micButton = $(chatElement.micButton);
     var attachForm = $(chatElement.attachForm);
     var inputAttach = chatElement.inputAttach;
     var inputDateRange = chatElement.inputDateRange;
     var inputDatePicker = chatElement.inputDatePicker;
     var chatAreaDiv = $(chatElement.chatArea);
//     var inputDateTimePicker = chatElement.inputDateTimePicker;
//     var inputTimePicker =  chatElement.inputTimePicker;
     var templateId = "";


    var chatbot = $(chatElement.chatContent).sphChatbot({
        botName: 'SPH Chat Bot',
        botLogoUrl: 'img/sph-icon.png',
        botWelcomeMessage: 'How can we help you?',
        botCategory: 'SPH Chatbot Product',
        loop: false,
        stepCallback: function(index){
            $(this).sphChatbot('typingIndicator', { delay: 0 })
        }
    });


     //File Upload
    var uploadProgress = [];
    var updateProgress = function(fileNumber, percent) {
       uploadProgress[fileNumber] = percent
       let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length
       //console.log($(document).find("#progress-bar").length)
       $(document).find(chatElement.uploadProgress).val(total);
     };

     var panelFooterShow = () => {
          panelFooter.show();
     };


      var panelFooterHide = () => {
             panelFooter.hide();
     }

     var initialRequestTemplate = {
         id: "",
         textMessage : "",
         nextTemplate : "",
         previousTemplate : ""
     };

     var resetRequestTemplate = function(){
        $.each(initialRequestTemplate, function(index, element) {
            initialRequestTemplate[index] = "";
        });
     }

     String.prototype.toCamelCase = function() {
         return this
             .toLowerCase()
             .replace(/[^\w\s\-]/g, '')//remove anything thats not a word character, space or dash
             .replace(/[^a-z0-9]/g, ' ')//replace anything else with a space
             .replace(/^\s+|\s+$/g, '')//trim
             .replace(/\s(.)/g, function(match,group) {return group.toUpperCase()})
     };

     String.prototype.capitalize = function() {
         return this.charAt(0).toUpperCase() + this.slice(1);
     }


     var showPopUp = {
        success : function(alertOpt){
            alertOptions["alertOption"] = "alert-primary";
            return this.final(alertOpt);
        },
        error :  function(alertOpt){
             alertOptions["alertOption"] = "alert-danger";
             return this.final(alertOpt);
        },
        warning : function(alertOpt){
                alertOptions["alertOption"] = "alert-warning";
                return this.final(alertOpt);
        },
        final :function(alertOpt){
            alertOptions["headerText"] = (alertOpt.headerText!=undefined && alertOpt.headerText!="") ? alertOpt.headerText : alertOptions.headerText;
            alertOptions["contentText"] = (alertOpt.contentText!=undefined && alertOpt.contentText!="") ? alertOpt.contentText : alertOptions.contentText;
            alertOptions["templateLinkText"] = (alertOpt.templateLinkText!=undefined && alertOpt.templateLinkText!="") ? alertOpt.templateLinkText : alertOptions.templateLinkText;
            alertOptions["templateLink"] = (alertOpt.templateLink!=undefined && alertOpt.templateLink!="") ? alertOpt.templateLink : alertOptions.templateLink;
            return alertOptions;
        },
        show :function(opt,errMsg){
            alertOptions["contentText"] = errMsg;
            alertOptions["headerText"] = opt.capitalize();
            var alertTemp= this[opt](alertOptions);
            chatbot.sphChatbot('showAlertTemplate',alertTemp, { timestamp: now });
        }
    }


//    var dataURLtoBlob = function(dataurl) {
//            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//            while(n--){
//                u8arr[n] = bstr.charCodeAt(n);
//            }
//            return new Blob([u8arr], {type:mime});
//        };

    var dataUrlToBlob = function (strUrl) {
        var parts= strUrl.split(/[:;,]/),
        type= parts[1],
        indexDecoder = strUrl.indexOf("charset")>0 ? 3: 2,
        decoder= parts[indexDecoder] == "base64" ? atob : decodeURIComponent,
        binData= decoder( parts.pop() ),
        mx= binData.length,
        i= 0,
        uiArr= new Uint8Array(mx);
        for(i;i<mx;++i) uiArr[i]= binData.charCodeAt(i);
        return new myBlob([uiArr], {type: type});
    }

    //**blob to dataURL**
    var blobToDataURL = function(blob, callback) {
        var a = new FileReader();
        a.onload = function(e) {callback(e.target.result);}
        a.readAsDataURL(blob);
    };

    var blobToDataURLPromise = function(blob){
        return new Promise((fulfill, reject) => {
            let reader = new FileReader();
            reader.onerror = reject;
            reader.onload = (e) => fulfill(reader.result);
            reader.readAsDataURL(blob);
        });
    };


    var makeRequestObject = function(dataRequest){
        var makeRequestObj = initialRequestTemplate;
        makeRequestObj.textMessage = dataRequest;
        return makeRequestObj;
    };


    var triggerAjaxFromSelection = function(dataToSend){
        getRequestObj = makeRequestObject(dataToSend);
        ajaXRequest(getRequestObj,false,function(data) {
            return true;
        });
    };

    var makeJsonObjectFromFormData = function(formData){
        var  jsonData = {};
        for (var pair of formData.entries()) {
              jsonData[pair[0]] = pair[1];
        }
        return jsonData;
    };

    function isInt(value) {
      return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
    }


    var bytesToSize =  function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i == 0) return bytes + ' ' + sizes[i];
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    };

    $(document).on('click',chatElement.divAttachLink, function (e) {
        e.preventDefault();
        $("head").append('<script src="js/download.min.js"></script>');
        download($(this).attr("href"));
    });

    $(document).on('click', chatElement.divGenericOption + ',' + chatElement.divQuickReply + ',' + chatElement.divOrderSummaryBtn, function (e) {
        $(this).addClass("jsm-selected");
        var getData = "";
        if ($(this).parent().parent(chatElement.divGenericTemplate).length > 0){
            getData = chatbot.sphChatbot('selectGenericTemplate', $(this).data("id"),{ timestamp: now },function(selectData){
                  triggerAjaxFromSelection(selectData);
            });
        }

         if ($(this).parent(chatElement.divGenericOption).length > 0){
            getData = chatbot.sphChatbot('selectButtonTemplate', $(this).index() ,{ timestamp: now },function(selectData){
                 triggerAjaxFromSelection(selectData);
            });
         }


         if ($(this).parent(chatElement.divQuickReplyDiv).length > 0){
            getData = chatbot.sphChatbot('selectQuickReply', $(this).index() ,{ timestamp: now },function(selectData){
                 triggerAjaxFromSelection(selectData);
            });
         }

         if ($(this).parent(chatElement.divOrderSummaryDiv).length > 0){
            if($(this).hasClass("ok")){
                triggerAjaxFromSelection(selectData);
            }

            if($(this).hasClass("cancel")){
                triggerAjaxFromSelection(selectData);
            }

            if($(this).hasClass("pay-now-class")){
                triggerAjaxFromSelection("");
            }
         }

    });


    var textManipulate = function(textOptions){
        textOptions.enableText = (typeof textOptions.enableText=="string") ? (textOptions.enableText == 'true') : textOptions.enableText;
        let textDisabled = (textOptions.enableText!== undefined) ? !(textOptions.enableText)  : true;
        $(chatElement.inputChat + "," + chatElement.chatButton).attr("disabled",textDisabled);
        let maxLengthValue = (textOptions.maxTextLength!== undefined && isInt(textOptions.maxTextLength)) ? textOptions.maxTextLength : 30;
        $(chatElement.inputChat).attr("maxlength",maxLengthValue);
        let autoCompleteValue = (textOptions.autoComplete!== undefined && textOptions.autoComplete !="") ? textOptions.autoComplete : "off";
        $(chatElement.inputChat).attr("autocomplete",autoCompleteValue);
        if(textDisabled){
            $(chatElement.inputChat).removeAttr("maxlength");
        }
        if(autoCompleteValue=="on" && $.isArray(textOptions.autoOptions) && textOptions.autoOptions.length > 0){
            if($(chatElement.messageArea).find("div.awesomplete").length > 0){
                $(chatElement.inputChat).parent("div.awesomplete").contents().unwrap();
                $(chatElement.inputChat).next("ul").remove();
                $(chatElement.inputChat).next("span").remove();
            }

            $(chatElement.inputChat).attr("data-list",textOptions.autoOptions.join(", "));
            $(chatElement.inputChat).addClass("awesomplete");
            //inputAutoComplete(textOptions.autoOptions);
            inputAutoComplete.start(document.getElementById(chatElement.inputChatId));
        }
    }

    var closeOnError = function(errMsg){
        showPopUp.show("error",errMsg);
        $(chatElement.inputChat + "," + chatElement.chatButton).attr("disabled",true);
        chatbot.sphChatbot('typingIndicator', { delay: 0 });
    }

    var ajaXRequest = function(chatData,isFileUpload = false,statusCallback){

        jQuery.ajax({
            url: (isFileUpload) ? APIUPLOAD : API,
            type: 'POST',
            method: 'POST',
            dataType: 'json',
            enctype: 'multipart/form-data',
            data: (isFileUpload) ? chatData : JSON.stringify(chatData),
            crossDomain: true,
            cache: false,
            contentType: (isFileUpload) ? false :  "application/json;charset=utf-8",
            processData: (isFileUpload) ? false : true,
            headers : {
                  "accept": "application/json",
                  "Access-Control-Allow-Origin":"*",
                  "chat-cookie" : cookieValue
            },
            xhr: function(){
                var xhr = new window.XMLHttpRequest();
                //Upload progress
                 xhr.upload.addEventListener("progress", function(e) {
                    if(isFileUpload && chatData.get('uploadFileCounter') !== undefined){
                        updateProgress(chatData.get('uploadFileCounter'), (e.loaded * 100.0 / e.total) || 100)
                    }
                 })
                 //Download progress
                 xhr.addEventListener("progress", function(evt){
                   if (evt.lengthComputable) {
                     var percentComplete = evt.loaded / evt.total;
                     //Do something with download progress
                   }
                 }, false);

                 xhr.addEventListener('readystatechange', function(e) {
                   if (xhr.readyState == 4 && xhr.status == 200) {
                        if(isFileUpload && chatData.get('uploadFileCounter') !== undefined){
                            updateProgress(chatData.get('uploadFileCounter'), 100) // <- Add this
                        }
                   }
                   else if (xhr.readyState == 4 && xhr.status != 200) {
                        showPopUp.show("error",errMsg.error_file_upload);
                   }
                 });
                 return xhr;
            },
            beforeSend: function( xhr ) {
                chatbot.sphChatbot('typingIndicator', { timestamp: now });
            },
            success: function (parseChatData, status, xhr) {
                var parseChatData = JSON.parse(parseChatData);
                console.log(parseChatData);
                if(parseChatData.status=="200"){
                    cookieValue = (xhr.getResponseHeader("chat-cookie") != null) ? xhr.getResponseHeader("chat-cookie") : "";
                    var payload = parseChatData.payload;
                    initialRequestTemplate.nextTemplate = payload.nextTemplate;
                    var previousTemplateObject = payload.previousTemplate;
                    initialRequestTemplate.previousTemplate = previousTemplateObject.templateName;
                    let autoCompleteValue = (previousTemplateObject.isEnabled != undefined) ? !previousTemplateObject.isEnabled : false;
                    $(chatElement.backButton).attr("disabled", autoCompleteValue);
                    templateId = payload.templateElement.templateId;
                    if(payload.textOption != undefined){
                        textManipulate(payload.textOption);
                    }
                    if(payload.templateName=="sendmessage"){
                        chatbot.sphChatbot(payload.templateName,'bot',payload.templateElement.templateId,payload.templateElement.templateText, { timestamp: now});
                    }else{
                        chatbot.sphChatbot(payload.templateName,payload.templateElement, { timestamp: now});
                        inputChat.removeAttr("maxlength");
                    }
                    statusCallback(true)
                }else{
                    var errMsgChatBot = (parseChatData.errMsg !== undefined) ? parseChatData.errMsg : errMsg.error_communicate;
                    closeOnError(errMsgChatBot)
                    statusCallback(false)
                }
            },
            error: function (request, status, error) {
                  closeOnError(errMsg.error_connect)
                  statusCallback(false)
            }

        }).done(function (data, textStatus, xhr) {
             console.log("Done")
             statusCallback(true)
         });

    }

    //On Click Submit
    $(document).on('click',chatElement.chatButton, function(e) {
        if(!$(this).is(":disabled")){
             var chatMsg = $(chatElement.inputChat).val();
             chatbot.sphChatbot("message","user",chatMsg, { timestamp: now});
             triggerAjaxFromSelection(chatMsg)
             $(chatElement.inputChat).val('');
             inputAutoComplete.destroy(chatElement.inputChat);
        }
     });

    //On Key Press Input Text
    $(document).on('keypress',chatElement.inputChat,function (e) {
       if (e.which == 13) {
            var chatMsg = $(this).val();
            chatbot.sphChatbot("message","user",chatMsg, { timestamp: now});
            triggerAjaxFromSelection(chatMsg);
            $(this).val('');
            inputAutoComplete.destroy(chatElement.inputChat);
       }else{
            if($(this).hasAttr('maxlength')) {
              $(this).maxlength({
                   alwaysShow: true,
                   placement: 'centered-right',
                   warningClass: "badge badgeSuccess",
                   limitReachedClass: "badge badge-danger"
               });
            }
       }
    });

    //On Click the closeChat Chat Icon
    $(document).on('click', chatElement.chatIcon , function (e) {
        $(chatElement.chatWelcomeWindow).toggle();
        chatbot.sphChatbot('start', { delay: 0 });
        $(this).hide(300, function() {
            resetRequestTemplate();
        });
     });

    //On Click the Close Icon in Chat Window
    $(document).on('click', chatElement.chatClose , function (e) {
       $(chatElement.chatWelcomeWindow).hide(500);
       $(chatElement.chatWindow).hide(500);
       chatbot.sphChatbot('reset');
       $(chatElement.chatIcon).show(300);
    });

     //On Click Get Started
    $(document).on('click',chatElement.getStarted, function (e) {
        chatbot.sphChatbot('start');
        ajaXRequest(initialRequestTemplate,false,function(data) {
            setTimeout(function(){ $(chatElement.chatContent).find(chatElement.chatArea).scrollTop(0); }, 2000);
            return data;
        });
    });

    //On Click Home Button
     $(document).on('click',chatElement.homeButton, function (e) {
        $(chatElement.chatWelcomeWindow).show();
        $(chatElement.chatWindow).hide(500);
        resetRequestTemplate();
        inputAutoComplete.destroy(chatElement.inputChat);
        chatbot.sphChatbot('reset');
     });

     //On pay Now Clicked
     $(document).on('click',chatElement.payNowButton, function (e) {
         $(this).addClass("jsm-selected");
     });

      /* Modal Box */
      $(document).on('click',chatElement.divAttachImage + "," + chatElement.divOrderImage, function (e) {
          var imageParent = document.getElementById("modalContent");
          imageParent.innerHTML = "";
          if($(this).hasAttr("data-target")){
              var image = document.createElement("img");
              image.id = "charBotImgId";
              image.className = "char-bot-img";
              image.src = $(this).attr("src");
              imageParent.appendChild(image);
          }
          return false
      });


      $(document).on('click',chatElement.chatModalClose, function (e) {
          $(chatElement.chatModal).modal("hide");
          $('.modal-backdrop').remove();
      });


     //On click Back Button
     $(document).on('click',chatElement.backButton, function (e) {
        if(!$(this)[0].hasAttribute("disabled")){
            getRequestObj = makeRequestObject("");
             if(getRequestObj.previousTemplate==""){
                 getRequestObj.id = "";
             }
             //chatbot.sphChatbot("toggleQuickReplyOption",{ timestamp: now , value : false });
             getRequestObj.nextTemplate = getRequestObj.previousTemplate;
             var sendMessageTemplate = $(chatElement.chatContentWindow).find(".jsm-user-wrapper.user .jsm-chat-row .sendermessage");
             sendMessageTemplate.each(function() {
                $(this).removeAttr("style");
             });
             ajaXRequest(getRequestObj,false,function(data) {
                  var elemParent = $('.bot:last').find("div." + templateId);
                  if(elemParent.length > 0){
                     var checkIfQuickReplyEnabled = chatbot.sphChatbot("returnQuickReplyOption",{ timestamp: now },function(bool){
                      if(bool){
                            chatbot.sphChatbot("hideQuickReplies",{ timestamp: now });
                      }
                    });

                    if($(".bot:nth-last-child(2)").length > 0){
                        $(".bot:nth-last-child(2)").hide('slow', function(){ $(this).remove(); });
                    }
                  }else{
                      $('.jsm-user-wrapper.bot:last').prev().hide('slow', function(){ $(this).remove(); });
                  }
                  $(chatElement.inputChat).val("");
                 return true;
             });
        }else{
            showPopUp.show("error",errMsg.error_back_click);
        }
     });

     //Form Submit
      $(document).on('submit',"form", function(e) {
         e.preventDefault();
         var formData = new FormData(this);
         var isOk = true;
         var imgSize;
         var dataUriImg = {};

         const reader = new FileReader();
         $(this).find('input[type=file]').each(function(index,elem){
             if(typeof this.files[index] !== 'undefined'){
                 var maxSize = parseInt($(this).data('max-size'),10);
                 size = this.files[index].size;
                 imgSize = maxSize;
                 isOk = maxSize > size;
                 if(isOk){
                     dataUriImg[index] = blobToDataURLPromise(this.files[index]);
                 }
                 return isOk;
             }
         });

         if(!isOk){
          $(this).append('<div class="alert alert-danger" role="alert">File Size too big. Allowed file size is ' + bytesToSize(imgSize) + '</div>');
             console.log("File Size too big.");
             return false;
          }

          initialRequestTemplate.id = formData.get("mobile");
          //To use Data URI for image
          if(dataUriImg.length > 0){
              formData.append("uploadFile",dataUriImg);
          }

           var jsonFormData = makeJsonObjectFromFormData(formData);
           getRequestObj = makeRequestObject(jsonFormData);
           $(chatElement.formSubmitButton + "," + chatElement.formClearButton).attr("disabled",true);
           ajaXRequest(getRequestObj,false,function(status){
              if(status){
                 //$("div.jsm-form-template").parent("div.jsm-chat-row").slideUp("normal", function() { $(this).remove(); } );
                 $("div.jsm-form-template").parent("div.jsm-chat-row").parent().closest(".bot").slideUp("normal", function() { $(this).remove(); } );
              }
           });
      });


    var inputAutoComplete = {
        start : function(inputElem){
            awesComplete = new Awesomplete(inputElem, {
                minChars: 2,
                maxItems: 15,
            });
        },
        destroy : function(inputElem){
            if(awesComplete!="" && awesComplete instanceof Object){
               // $(chatElement.inputChat).removeAttr("data-list");
               $(inputElem).parent("div.awesomplete").contents().unwrap();
               $(inputElem).next("ul").remove();
               $(inputElem).next("span").remove();
               //awesComplete.destroy();
            }
        }
    }


    var setPicker = function(e,selectedFn,dateSelected){
        e.val(dateSelected);
        chatbot.sphChatbot(selectedFn, dateSelected, { timestamp: now},function(bool){
            triggerAjaxFromSelection(dateSelected);
        });
    }

    var sendPicker = function(e,selectedFn,extra_config = {}){
        extra_config = $.extend(extra_config, { onafterselect: function(calentim, startDate, endDate){
              var dateSelected = startDate.format(extra_config.format);
              var endDate = endDate.format(extra_config.format);
              if(!extra_config.singleDate){
                    dateSelected = dateSelected  + ' - ' + endDate;
              }
              setPicker(e,selectedFn, dateSelected);
        }});
        e.calentim(extra_config);
     }

    var bindCommonConfig = function(e,config = {}) {

       var dateDisabledBetween = e.data("disabledaterange");
       var isPastDisabled = e.data("ispastdisable");
       var isFutureDateDisable = e.data("isfurturedisable");
       var enableSelectedDates = e.data("selectdaterange");
       var disableSelectedDates = e.data("disabledates");
       var isTimePicker = e.data("timepicker");
       var timePickerFormat = e.data("timepickerformat");
       var timeMinuteStep = e.data("timeminutestep");
       var calendarCount = e.data("calendarcount");
       var isDateRange = e.data("isdaterange");
       var autoClose = e.data("autoclose");
       var calendarPosition = e.data("calendarposition");
       var dateFormat = e.data("dateformat");
       var showCalendar = e.data("showcalendar");
       var showHeader =  e.data("showheader");
       var showFooter =  e.data("showfooter");
       var startEmpty =  e.data("startempty");

         //Disable Past Date
       if(isPastDisabled !== undefined && isPastDisabled){
           config = $.extend(config, {"minDate": moment()});
       }

       //Disable Future Date
        if(isFutureDateDisable !== undefined && isFutureDateDisable){
             var date = new Date();
             date.setDate(date.getDate());
             config = $.extend(config, {"maxDate": date});
        }

        //Disable Date Between
        if(dateDisabledBetween !== undefined && dateDisabledBetween){
          dateDisabledBetween = dateDisabledBetween.replace(/\\"/g, '"')
          var splitDate = JSON.parse(dateDisabledBetween);
          var disableArr = [];
          for(let i=0;i<splitDate.length;i++){
            var disableDateObj = {};
            disableDateObj["start"] = moment(new Date(splitDate[i]["start"]),"DD/MM/YYYY");
            disableDateObj["end"] = moment(new Date(splitDate[i]["end"]),"DD/MM/YYYY");
            disableArr.push(disableDateObj)
          }
          config = $.extend(config, {"disabledRanges": disableArr});
        }

        //Disable selected Dates
         if(disableSelectedDates !== undefined && disableSelectedDates){
            var disableSelectedArr = [];
               for(let i=0;i < disableSelectedDates.length;i++){
                var disableDateObj = {};
                disableDateObj["start"] = disableDateObj["end"] = moment(new Date(disableSelectedDates[i]),"DD/MM/YYYY");
                disableSelectedArr.push(disableDateObj);
              }
              config = $.extend(config, {"disabledRanges": disableSelectedArr});
          }


       //Select in Between Date
        if(enableSelectedDates !== undefined && enableSelectedDates){
            var splitDate = enableSelectedDates.split("_");
            config = $.extend(config, {"minDate": moment(splitDate[0],"YYYY-MM-DD"),"maxDate" : moment(splitDate[1],"YYYY-MM-DD")});
        }

        //Check of Time Picker required
        config = $.extend(config, {"showTimePickers": (isTimePicker !== undefined && (isTimePicker=="true" || isTimePicker==true)) ? true : false});
        if(isTimePicker=="true" || isTimePicker==true){
            config = $.extend(config, {"hourFormat": (timePickerFormat !== undefined) ? timePickerFormat : 24 });
            config = $.extend(config, {"minuteSteps": (timeMinuteStep !== undefined) ? timeMinuteStep : 15 });
        }
        config = $.extend(config, {"calendarCount": (calendarCount !== undefined) ? calendarCount : 1 });
        config = $.extend(config, {"singleDate": (isDateRange !== undefined) ? !(isDateRange=="true" || isDateRange==true) : true });
        config = $.extend(config, {"showButtons": (autoClose !== undefined) ? !(autoClose=="true" || autoClose==true) : true});
        config = $.extend(config, {"autoCloseOnSelect": (autoClose !== undefined) ? (autoClose=="true" || autoClose==true) : false});
        config = $.extend(config, {"showOn": ( calendarPosition !== undefined && $.inArray(calendarPosition, ["top","bottom","left","right"]) ) ? calendarPosition : "bottom"});
        config = $.extend(config, {"format": ( dateFormat !== undefined && dateFormat!="") ? dateFormat : "YYYY-MM-DD HH:mm"});
        config = $.extend(config, {"showCalendars": (showCalendar !== undefined) ? (showCalendar=="true" || showCalendar==true) : true});
        config = $.extend(config, {"showHeader": (showHeader !== undefined) ? (showHeader=="true" || showHeader==true) : true});
        config = $.extend(config, {"showFooter": (showFooter !== undefined) ? (showFooter=="true" || showFooter==true) : true});
        config = $.extend(config, {"startEmpty": (startEmpty !== undefined) ? (startEmpty=="true" || startEmpty==true) : false});
        return config;
    };


    //show Date,Date Time and Date Range picker
    var bindDateTimeAndRangePicker = function() {
        $(document).on('focus',chatElement.inputDateTimeRange,function(e){
            var config = {
                enableKeyboard: true,
                hideOutOfRange: true,
                dateSeparator: " - ",
                continuous: true,
                showTimePickers: false,
                showOn: "top"
             };
            extra_config = bindCommonConfig($(this),config);
//            console.log(extra_config);
            sendPicker($(this),"selectDateTimeAndRangePicker",extra_config);
       });
    }


      var acc = document.getElementsByClassName("accordion");
      var accico = document.getElementsByClassName("accordion-ico");
        var i;
//
//        $(document).on('.accordion',"click", function(e) {
//             $(thius)
//        });
        for (i = 0; i < acc.length; i++) {
          acc[i].addEventListener("click", function () {
            [].forEach.call(acc, function (el) {
              el.classList.remove("active");
              el.childNodes[3].classList.remove("active");
              el.nextElementSibling.style.maxHeight = null;
            });
            this.classList.add("active");
            this.childNodes[3].classList.add("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
              panel.style.maxHeight = null;
            } else {
              panel.style.maxHeight = panel.scrollHeight + "px";
            }
          });
        }


      var coll = document.getElementsByClassName("collapsible");
      var i;

      for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
          this.classList.toggle("active");
          var content = this.nextElementSibling;
          if (content.style.display === "block") {
            content.style.display = "none";
          } else {
            content.style.display = "block";
          }
        });
      }

      window.onload = function () {
        var divToHide = document.getElementById("divToHide");
        document.onclick = function (e) {
          if (e.target.id !== "divToHide" && e.target.id !== "collapsible") {
            //element clicked wasn't the div; hide the div
            divToHide.style.display = "none";
          }
        };
      };

   bindDateTimeAndRangePicker();

      //Define globalVariable
      globalVariable["chatbot"] = chatbot;
      globalVariable["showPopUp"] = showPopUp;
      globalVariable["chatElement"] = chatElement;
      globalVariable["makeRequestObject"] = makeRequestObject;
      globalVariable["ajaXRequest"] = ajaXRequest;
      globalVariable["getRequestObj"] = getRequestObj;
      globalVariable["setPicker"] = setPicker;
      globalVariable["inputDateTimeRange"] = chatElement.inputDateTimeRange;
      globalVariable["errMsg"] = errMsg;
      globalVariable["successMsg"] = successMsg;
      globalVariable["bytesToSize"] = bytesToSize;
      globalVariable["selectPickerFn"] ="selectDateTimeAndRangePicker";
});