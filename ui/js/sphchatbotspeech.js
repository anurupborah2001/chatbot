$(function(){
var inputChat=  globalVariable.chatElement.inputChat;
//var notesList = $('ul#notes');
//var noteContent = '';
var chatbot = globalVariable.chatbot;
var micPermission = false;
var now = new Date();
var classy = "";
var synthesisVoice = "";
var showPopUp= globalVariable.showPopUp;
var micButton = globalVariable.chatElement.micButton
var inputDateTimeRange = globalVariable.chatElement.inputDateTimeRange;
var inputChat = $(globalVariable.chatElement.inputChat);
var inputAttach = globalVariable.chatElement.inputAttach;
var homeButton = $(globalVariable.chatElement.homeButton);
var backchatBtn = $(globalVariable.chatElement.backButton);
var formClearBtn = $(globalVariable.chatElement.formClearButton);
var formSubmitBtn = $(globalVariable.chatElement.formSubmitButton);
var inputDateTimeRange = globalVariable.inputDateTimeRange;
var setPicker = globalVariable.setPicker;
var selectPickerFn = globalVariable.selectPickerFn;
var chatButton =  globalVariable.chatElement.chatButton;
var payNowButtonLink = globalVariable.chatElement.payNowButtonLink;
var divQuickReply = globalVariable.chatElement.divQuickReply;
var divQuickReplyDiv = globalVariable.chatElement.divQuickReplyDiv;


var browserDetect = JSON.stringify({
      isAndroid: /Android/.test(navigator.userAgent),
      isCordova: !!window.cordova,
      isEdge: /Edge/.test(navigator.userAgent),
      isFirefox: /Firefox/.test(navigator.userAgent),
      isChrome: /Google Inc/.test(navigator.vendor),
      isChromeIOS: /CriOS/.test(navigator.userAgent),
      isChromiumBased: !!window.chrome && !/Edge/.test(navigator.userAgent),
      isIE: /Trident/.test(navigator.userAgent),
      isIOS: /(iPhone|iPad|iPod)/.test(navigator.platform),
      isOpera: /OPR/.test(navigator.userAgent),
      isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
      isTouchScreen: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
      isWebComponentsSupported: 'registerElement' in document && 'import' in document.createElement('link') && 'content' in document.createElement('template')
    }, null, '  ');

var speechMsg = {
    error_mic_access : "An error occurred, it seems the access to your microphone is denied",
    error_mic_wo_work : "An error occurred, classy cannot work without a microphone",
    error_internet_connect : "An error occurred, classy cannot work without internet connection !",

    error_chat_not_listening : "Classy is not listening to you.Sorry for the inconvenience caused.Please say 'Wake up classy!!'",
    error_chat_invalid_command : "Classy cannot understand you.Sorry for the inconvenience caused.",
    error_mic_cannot_initialize: "Classy couldn't be initialized.Sorry for the inconvenience caused.",
    error_mic_not_supported: "Mic is not supported by your browser",

    success_mic_welcome : "Welcome to Classy",
    success_mic_paused : "Classy successfully paused",
    success_mic_stopped : "Classy successfully stopped",
    success_mic_restart : "Classy successfully restarted",
    success_stop_message : "Bye Bye.Its my pleasure to help you",

    error_command_invalid_date: "Invalid Dates Selected",
    error_command_repeat_dates: "Please repeat the dates",
    error_command_date_between : function(start_date,end_date){
        return "Invalid Dates Selected.Date must be between " + start_date  + " and " + end_date;
    }
};

$("head").append('<script type="text/javascript" src="js/jaro-winker.js"></script>');

if(window.hasOwnProperty("webkitSpeechRecognition")){
    classy = new Artyom();
}else{
    $(micButton).remove();
}


if(window.hasOwnProperty("SpeechSynthesisUtterance")){
     synthesisVoice= new SpeechSynthesisUtterance();
}





//Using different voice
// A. To prefer your voices (push to the beginning of the array)
//classy.ArtyomVoicesIdentifiers["en-US"].unshift('Google US English', 'Alex');
// And the identifiers of en-US should look now like:
// ['Google US English', 'Alex', "Google US English","en-US","en_US"]

// B. Or if you want to delete the default voices of Artyom
//classy.ArtyomVoicesIdentifiers["en-US"] = ['Google US English', 'Alex'];

function checkEmailInput(input, words) {
 return words.some(word => input.toLowerCase().includes(word.toLowerCase()));
}

var util = {
   isNumeric : function(value) {
        return /^-{0,1}\d+$/.test(value);
   },
   textSimilarity : function(actualValue,valueToTest){
         return JaroWrinker(actualValue, valueToTest);
   },
   formatDate : function(date = "",format = "yymmdd",separator = "-"){
        const d = (date!="") ? new Date(date) : new Date();
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
        //const ye2digits = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(d)
        const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
        const monumeric = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(d)
        const mon2digit = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d)
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
        const danumeric = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(d)
        const moName = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
        switch(format) {
          case "dmyy":
            return `${danumeric}${separator}${monumeric}${separator}${ye}`;
          break;
          case "dmmyy":
              return `${danumeric}${separator}${mon2digit}${separator}${ye}`;
          break;
          case "dMyy":
            return `${danumeric}${separator}${mo}${separator}${ye}`;
          break;
          case "ddmyy":
            return `${da}${separator}${monumeric}${separator}${ye}`;
          break;
          case "ddmmyy":
            return `${da}${separator}${mon2digit}${separator}${ye}`;
          break;
          case "ddMyy":
            return `${da}${separator}${mo}${separator}${ye}`;
          break;

          case "mdyy":
            return `${monumeric}${separator}${danumeric}${separator}${ye}`;
          break;
          case "mddyy":
              return `${monumeric}${separator}${da}${separator}${ye}`;
           break;
          case "Mdyy":
              return `${mo}${separator}${danumeric}${separator}${ye}`;
          break;
          case "mmdyy":
            return `${mon2digit}${separator}${danumeric}${separator}${ye}`;
          break;
          case "mmdyy":
              return `${mon2digit}${separator}${danumeric}${separator}${ye}`;
           break;
          case "mmddyy":
                return `${mon2digit}${separator}${da}${separator}${ye}`;
          break;
          case "Mddyy":
             return `${mo}${separator}${da}${separator}${ye}`;
          break;
          case "yymd":
            return `${ye}${separator}${monumeric}${separator}${danumeric}`;
          break;
          case "yymmd":
              return `${ye}${separator}${mon2digit}${separator}${danumeric}`;
          break;
          case "yymdd":
             return `${ye}${separator}${monumeric}${separator}${da}`;
          break;
          case "yyMd":
               return `${ye}${separator}${mo}${separator}${danumeric}`;
          break;
          case "yyMdd":
             return `${ye}${separator}${mo}${separator}${da}`;
          break;
          case "yymmdd":
          default:
                return `${ye}${separator}${mon2digit}${separator}${da}`;
          break;
        }
    },
   getOrdinalNum: function(n){
     return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
   },
   removeOrdinalNum:  function(str){
        return str.replace(/(\d+)(st|nd|rd|th)/ig, "$1");
   },
    extractDate : function(d){
       var day, month, year;
       var myArray, returnArr = [];
       d = this.removeOrdinalNum(d);
       var regExArr = [
            /[0-9]{2}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{4}/ig,
            /[0-9]{4}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{2}/ig,
            /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/ig,
            /[0-9]{1,2}([\-/ \.])(Jan(uary)?|Feb(ruary)?|Ma(r(ch)?|y)|Apr(il)?|Jun(e)?|Jul(y)?|Aug(ust)?|(Sep(t)?|Nov|Dec)(ember)?|Oct(ober)?)[\-/ \.][0-9]{4}/ig,
//            /[0-9]{2}([\-/ \.])(jan(uary)|feb(ruary)|march|april|may|june|july|august|september|october|november|december)[\-/ \.][0-9]{4}/ig
        ];

        regExArr.forEach(function(regex){
            var matchAll = d.matchAll(regex);
                matchAll = Array.from(matchAll); // array now
                matchAll.forEach(function(result){
                    if(null != result) {
                       dateSplitted = result[0].split(result[1]);
                       day = dateSplitted[2];
                       month = dateSplitted[1];
                       year = dateSplitted[0];
                       if(month>12) {
                              aux = day;
                              day = month;
                              month = aux;
                        }
                       returnArr.push(year+"/"+month+"/"+day);
                   }
            });
        });
       return returnArr;
   },
   dateCompare: function(d1,d2){
         //Date Format yyyy-mm-dd accepted
         //d1 - date to compare to , d2 - date to be compared with
        if(!moment(d1, 'YYYY-MM-DD',true).isValid()){
            return "Invalid First Date Format";
        }
        if(!moment(d2, 'YYYY-MM-DD',true).isValid()){
            return "Invalid Second Date Format";
        }
        var dateToCompare = moment(d1),dateToCompareWith = moment(d2);
        return (dateToCompare.isBefore(dateToCompareWith)) ? 0 : 1;
   },
   dateCompareBetween : function(d1,d2,d3){
         if(!moment(d1, 'YYYY-MM-DD',true).isValid()){
            return "Invalid Date Format of the date to be compared";
         }
        if(!moment(d2, 'YYYY-MM-DD',true).isValid()){
            return "Invalid Start Date Format to compare.";
        }
        if(!moment(d3, 'YYYY-MM-DD',true).isValid()){
            return "Invalid Second Date Format to compare";
        }
        return moment(d1).isBetween(d2,d3);
   }
}


//console.log(util.extractDate("date from 25th Feb 2015 to 26th Jan 2016"))
//console.log(util.extractDate("date 1st january 2020"))
//console.log(util.formatDate('2/Feb/2015'));

var formatChat = {
    email : function(val){
        var emailAtRateOptions = ['at the rate of','at rate of','at','in'];
        val = val.replace(/ /g,'')
        for(let i =0; i< emailAtRateOptions.length; i++){
            var optionsVal = emailAtRateOptions[i].replace(/ /g,'');
            if(val.indexOf(optionsVal) > 0){
                val =  val.replace(/ /g,'').replace(optionsVal,"@")
                break;
            }
        }
        return val;
    },
    mobile : function(val){
        var wordNumbers = {
             "zero" : 0,
             "one" : 1,
             "two" : 2,
             "three" : 3,
             "four" : 4,
             "five" : 5,
             "six" : 6,
             "seven" : 7,
             "eight": 8,
             "nine" : 9,
             "ten" : 10,
             "eleven" : 11,
             "twelve" : 12,
             "thirteen" : 13,
             "fourteen" : 14,
             "fifteen" : 15,
             "sixteen" : 16,
             "seventeen" : 17,
             "eighteen" : 18,
             "nineteen" : 19,
             "twenty" : 20,
             "thirty" : 30,
             "forty" : 40,
             "fifty" : 50,
             "sixty" : 60,
             "seventy" : 70,
             "eighty" : 80,
             "ninety" :  90
        }
        var mobileNumbers = val.toLowerCase().split(" ");
        var mobileNo = "";
        for(let i=0; i < mobileNumbers.length; i++){
            if(!util.isNumeric(mobileNumbers[i])){
              mobileNo+=(wordNumbers[mobileNumbers[i]] != undefined)  ? wordNumbers[mobileNumbers[i]] : "";
              mobileNo+= (mobileNumbers[i]=="double") ? (wordNumbers[mobileNumbers[i+1]] != undefined) ? wordNumbers[mobileNumbers[i+1]]  : "" : "";
              mobileNo+= (mobileNumbers[i]=="triple") ? (wordNumbers[mobileNumbers[i+1]] != undefined) ? wordNumbers[mobileNumbers[i+1]] + '' + wordNumbers[mobileNumbers[i+1]]  : "" : "";
            }else{
                mobileNo+=mobileNumbers[i+1];
            }
        }
        return mobileNo;
    },
    daterange: function(value) {
         console.log(value)
    }
}



var mic  = {
    on : function(){
        $(micButton).attr("class", "active");
    },
    off : function(){
         $(micButton).attr("class", "");
    },
    pause: function(){
        $(micButton).attr("class", "");
   },
   isActive : function(){
        return $(micButton).is(".active");
   },
   hasGetUserMedia : function() {
     return !!(navigator.mediaDevices &&
       navigator.mediaDevices.getUserMedia);
   },
   requestPermissions: function requestPermissions() {
        function onResponse(response) {
           if (response) {
             console.log("Permission was granted");
           } else {
             console.log("Permission was refused");
           }
           return browser.permissions.getAll();
         }

         window.navigator.browser.permissions.request(permissionsToRequest)
           .then(onResponse)
           .then((currentPermissions) => {
           console.log(`Current permissions:`, currentPermissions);
         });
   },
   checkPermission : function(){
        if (this.hasGetUserMedia()) {
           // Notification.requestPermission().then(function(permission) { console.log('permiss', permission)});
           if(classy != ""){
               if(browserDetect.isChrome){
                     navigator.permissions.query({name: 'microphone'}).then(function (result) {
                         //console.log(result.state);
                         micPermission = (result.state == 'denied') ? false : true;
                         result.onchange = function(){
                             micPermission = (this.state == 'denied') ? false : true;
                             console.log("Permission changed to " + this.state);
                         }
                    });
                }else{
                 navigator.mediaDevices.getUserMedia( { audio: true, video: false } )
                       .then( ( stream ) => {
                           micPermission = true;
                        },
                       e => {
                           micPermission = false;
                    } );
                }
            }
       } else {
            if(synthesisVoice!==""){
                synthesisVoice.text = speechMsg.error_mic_not_supported;
                speechSynthesis.speak(synthesisVoice);
                showPopUp.show("error",speechMsg.error_mic_not_supported);
            }
       }
   }
}

//console.log(formatChat.mobile('eight triple three eight one five six five'));


var commandsChatBot = {
    select: function (text) {
          var getBotSelection = $("div.jsm-chat-content .bot:last > .jsm-chat-row:last-child");
          var quickReplyOption  = $(divQuickReply);
          var toSelectOption = "";
          if(getBotSelection.length > 0){
                //Check if Generic template
                if(getBotSelection.find(".jsm-generic-template").length > 0){
                    getBotSelection.find(".jsm-button").each(function() {
                       // util.textSimilarity()
                       var percentageMatch = util.textSimilarity($(this).text().toLowerCase(),text.toLowerCase());
                       console.log(percentageMatch);
                       if(percentageMatch > 0.7){
                            toSelectOption = $(this).data("id");
                            return false;
                       }
                    });
                    if(toSelectOption !== ""){
                       var selectOLLi =  getBotSelection.find("ol.carousel-indicators li[data-slide-to="+ toSelectOption  + "]")
                       if(selectOLLi.length > 0){
                          selectOLLi.trigger("click");
                       }
                       var carouselDiv = getBotSelection.find("div.carousel-inner div.jsm-generic-template:eq(" + toSelectOption + ")");
                       console.log(carouselDiv.length);
                       if(carouselDiv.length > 0){
                           carouselDiv.find(".jsm-button").trigger("click");
                       }
                    }else{
                        sphChatMic.say(speechMsg.error_chat_invalid_command);
                         showPopUp.show("error",speechMsg.error_chat_invalid_command);

                    }
                }

                //Check if template is daterange or date picker
                if(getBotSelection.find(inputDateTimeRange).length > 0){
                    let date_range_arr = util.extractDate(text);
                    console.log(date_range_arr);
                    if(date_range_arr.length==1 && getBotSelection.find(inputDateTimeRange).length > 0){
                        let selectedDate = util.formatDate(date_range_arr[0]);
                         var pastDateDisable = ($(inputDateTimeRange).data('ispastdisable')!= undefined && $(inputDateTimeRange).data('ispastdisable')) ? util.formatDate() : "";
                         var futureDateDisable = ($(inputDateTimeRange).data('isfurturedisable')!= undefined && $(inputDateTimeRange).data('isfurturedisable')) ? util.formatDate() : "";
                         var dateDisabled = ($(inputDateTimeRange).data('disabledates')!= undefined && $(inputDateTimeRange).data('disabledates')) ? $(inputDateTimeRange).data("disabledates") : "";
                         var disableSelectDateRange = ($(inputDateTimeRange).data('selectdaterange')!= undefined && $(inputDateTimeRange).data('selectdaterange')) ? $(inputDateTimeRange).data("selectdaterange") : "";
                         var disableDateToCompare =  moment(new Date()).format("YYYY-MM-DD");
                         var statusChosenDate = false;

                        //If past date or future date are not allowed to be chosen
                         if(pastDateDisable!="" || futureDateDisable!=""){
                            statusChosenDate = util.dateCompare(selectedDate,disableDateToCompare);
                            if( (pastDateDisable && statusChosenDate==1) || (futureDateDisable && statusChosenDate==0)){
                                    setPicker($(inputDateTimeRange),selectPickerFn,selectedDate);
                             }else{
                                    sphChatMic.say(speechMsg.error_command_invalid_date);
                                    showPopUp.show("error",speechMsg.error_command_invalid_date);
                             }
                         }
                        //If date chosen aside from the date need to be selected
                         if(disableSelectDateRange!=""){
                              statusChosenDate =  util.dateCompareBetween(selectedDate,disableSelectDateRange.startDate,disableSelectDateRange.endDate);
                              if(statusChosenDate){
                                    setPicker($(inputDateTimeRange),selectPickerFn,selectedDate);
                              }else{
                                   sphChatMic.say(speechMsg.error_command_date_between);
                                   showPopUp.show("error",speechMsg.error_command_date_between);
                              }
                         }

                    }else if(date_range_arr.length==2){
                        let startDate = util.formatDate(date_range_arr[0]);
                        let endDate = util.formatDate(date_range_arr[1]);
//                        console.log("Start date :" + startDate);
//                        console.log("End date :" + endDate);
                        //in Between dates
                        var getDisabledDate = ($(inputDateTimeRange).data('disabledaterange') != undefined && $(inputDateTimeRange).data('disabledaterange')!="") ? $(inputDateTimeRange).data('disabledaterange').split("_") : "";
                        var isTimePicker =  ($(inputDateTimeRange).data('timepicker') != undefined) ? $(inputDateTimeRange).data('timepicker') : false;
                        var pastDateDisable = ($(inputDateTimeRange).data('ispastdisable')!= undefined && $(inputDateTimeRange).data('ispastdisable')) ? util.formatDate() : "";
                        var dateFormat = ($(inputDateTimeRange).data('format')!= undefined) ? $(inputDateTimeRange).data('format') : "YYYY-MM-DD";
                        var isNeedDisable = false
                        var disableDateToCompareStart = "1970-01-01";
                        var disableDateToCompareEnd = moment(new Date()).format(dateFormat);
                        var select_date_range = "";

                        if(getDisabledDate!=""){
                            var dateDisabledBetween = getDisabledDate[0].replace(/\\"/g, '"')
                            var splitDate = JSON.parse(dateDisabledBetween);
                             if(pastDateDisable!=""){
                                   disableDateToCompareEnd = pastDateDisable;
                                   isNeedDisable = true;
                             }

                            if(splitDate[0].start != undefined && splitDate[0].end != undefined){
                                    disableDateToCompareStart = splitDate[0].start;
                                    disableDateToCompareStart = splitDate[0].end;
                                    isNeedDisable = true;
                            }

                        }
//                        console.log("Date Compare Start : " + disableDateToCompareStart);
//                        console.log("Date Compare End : " + disableDateToCompareEnd);
                        var isOKStartDate =  util.dateCompareBetween(startDate,disableDateToCompareStart,disableDateToCompareEnd);
                        var isOkEndDate =  util.dateCompareBetween(endDate,disableDateToCompareStart,disableDateToCompareEnd);
                        if(!isOKStartDate && !isOkEndDate && isNeedDisable){
                             select_date_range = moment(new Date(startDate)).format(dateFormat) + " - " + moment(new Date(endDate)).format(dateFormat);
                             setPicker($(inputDateTimeRange),selectPickerFn,select_date_range);
                        }else{
                              sphChatMic.say(speechMsg.error_command_invalid_date);
                               showPopUp.show("error",speechMsg.error_command_invalid_date);
                        }

                    }else{
                            sphChatMic.say(speechMsg.error_command_repeat_dates);
                            showPopUp.show("error",speechMsg.error_command_repeat_dates);
                    }
                }

          }

          //Check if Quick Reply is available
          var checkIfQuickReplyEnabled = chatbot.sphChatbot("returnQuickReplyOption",{ timestamp: now },function(bool){
              if(bool){
                    //Check if Quick Reply is Chosen
                    if($(divQuickReplyDiv).length > 0) {
                        $(divQuickReplyDiv).find(".jsm-quick-reply-option").each(function(index,elem) {
                            var percentageMatch = util.textSimilarity($(this).text().toLowerCase(),text.toLowerCase());
                            if(percentageMatch > 0.7){
                                $(this).trigger("click");
                                return false;
                           }
                        });
                    }
              }
          });
    },
    click: function(option){
        let chatContentBot = $(".jsm-chat-content .bot:last-child");
        if(option=="submit"){
            if($(globalVariable.chatElement.formSubmitButton).length > 0){
                $(globalVariable.chatElement.formSubmitButton).trigger("click");
            }
        }

        if(option=="clear"){
            if($(globalVariable.chatElement.formClearButton).length > 0){
                $(globalVariable.chatElement.formClearButton).trigger("click");
            }
        }

        if(option=="back"){
            if(backchatBtn.length > 0 && !backchatBtn.is(":disabled")){
                backchatBtn.trigger("click");
            }
        }

        if(option=="upload"){
          if(chatContentBot.find(inputAttach).length > 0){
                chatContentBot.find(inputAttach).click();
          }
        }

        if(option=="home"){
            if(homeButton.length > 0 && !homeButton.is(":disabled")){
                  homeButton.trigger("click");
                  sphChatMic.disconnect();
            }
        }

        if(option=="pay now" || option=="paynow" || option=="pay"){
            if(chatContentBot.find(payNowButtonLink).length > 0){
                chatContentBot.find(payNowButtonLink)[0].click();
            }
        }
    },
    input: function(text){
        let chatContentBot = $(".jsm-chat-content .bot:last-child");
        //Check for Form template
        if(chatContentBot.find("div.formtemplate").length > 0){
            chatContentBot.find("div.formtemplate input").each(function(index,elem) {
                var placeholder = $(this).attr("data-placeholder");
                if(placeholder != undefined){
                    var regexMatch = new RegExp(placeholder, "i");
                    if(regexMatch.test(text)){
                        var getPredictedText = text.replace(new RegExp('.*' + placeholder,'i'), '');
                        getPredictedText = (placeholder.toLowerCase()=="email") ? formatChat.email(getPredictedText) : getPredictedText;
                        getPredictedText = (placeholder.toLowerCase()=="mobile") ? formatChat.mobile(getPredictedText) : getPredictedText;
                        if(getPredictedText != undefined && getPredictedText!=""){
                            $(this).val(getPredictedText.replace(/^./, getPredictedText[0].toUpperCase()) );
                        }
                    }
                }
            });
        }

        //Check for Messages Template
        if(chatContentBot.find(".receivermessage").length > 0 && !$(inputChat).is(":disabled")){
            var autoCompleteList = $(inputChat).data("list");
            var inputText = text.trim().toLowerCase();
            if(autoCompleteList!=undefined){
                autoCompleteList.split(",").forEach((element) => {
                     var percentageMatch = util.textSimilarity(element.trim().toLowerCase(),text.toLowerCase());
                     if(percentageMatch > 0.7){
                         inputText = text.trim().toLowerCase();
                         $(inputChat).val(text.trim().toLowerCase())
                         return false;
                    }
                });
            }
            $(inputChat).val(text.trim().toLowerCase());
            $(chatButton).trigger("click");
        }
    }
}



var sphChatMic = {
    _detectBrowserLang : function () {
    var lang = window.navigator.languages ? window.navigator.languages[0] : null;
             lang = lang || window.navigator.language || window.navigator.browserLanguage || window.navigator.userLanguage;
 //            if (lang.indexOf('-') !== -1)
 //                lang = lang.split('-')[0];
 //            if (lang.indexOf('_') !== -1)
 //                lang = lang.split('_')[0];
         return lang;
     },
    connect : function(){
          // Start the commands !
           classy.initialize({
                lang: this._detectBrowserLang(), // GreatBritain english "en-GB"
                continuous: true, // Listen forever
                soundex: true,// Use the soundex algorithm to increase accuracy
                debug: false, // Show messages in the console
                executionKeyword: "and do it now",
                listen: true, // Start to listen commands !
                obeyKeyword: "wake up classy"
          //      // If providen, you can only trigger a command if you say its name
          //      // e.g to trigger Good Morning, you need to say "Jarvis Good Morning"
          //      name: "Jarvis"
            }).then(() => {
               sphChatMic.say(speechMsg.success_mic_welcome);
               showPopUp.show("success",speechMsg.success_mic_welcome);
               mic.on();
               console.log("Classy has been succesfully initialized");
            }).catch((err) => {
                 showPopUp.show("error",speechMsg.error_mic_cannot_initialize);
//                console.error("Classy couldn't be initialized: ", err);
            });

          //List of browser Voices
          //    var voices = classy.getVoices();
          //    for(var i = 0;i < voices.length;i++){
          //        var voice = voices[i];
          //        console.log(voice.name);
          //    }


            // Add command (Short code artisan way)
         if(classy.isObeying()){
              classy.addCommands([
                    {
                        indexes: ['classy rest','classy pause','rest classy','pause classy','sleep classy','classy sleep','pause','sleep','rest'],
                        action: (i) => {
                            console.log(i);
                            this.pause(i);
                        }
                    },
                     {
                          indexes: ['classy restart','restart classy','restart *','wake up classy','wake up *'],
                          action: (i,wildcard) => {
                              this.restart(i);
                          }
                     },
                    {
                        indexes: ['Select *','Input *','Click *'],
                        smart:true,
                        action: (i,wildcard) => {
                              console.log(wildcard);
                            if(i==0){
                                 commandsChatBot.select(wildcard);
                            }else if(i==1){
                                  commandsChatBot.input(wildcard);
                            }else if(i==2){
                                  commandsChatBot.click(wildcard);
                           }else{
                                  sphChatMic.say(speechMsg.error_chat_invalid_command);
                                   showPopUp.show("error",speechMsg.error_chat_invalid_command)
                           }
                        }
                    },
                    {
                        indexes: ['shut down classy','shut down classy','shut down','stop classy','stop'],
                        action: (i,wildcard) => {
                           this.disconnect(wildcard);
                        }
                    },
                ]);
      //          classy.simulateInstruction("Welcome");
         }else{
              sphChatMic.say(speechMsg.error_chat_not_listening);
               showPopUp.show("error",speechMsg.error_chat_not_listening);
         }
    },
    disconnect : function(wildcard = ""){
        if(classy.isObeying()){
             classy.emptyCommands();
             classy.fatality().then(() => {
                   mic.off();
                   showPopUp.show("success",speechMsg.success_mic_stopped);
                   sphChatMic.say(speechMsg.success_stop_message,{
                       onEnd: function(){
                           var totalObjectsInCollection = classy.getGarbageCollection().length;
                           // Clear now that there are no more text to say.
                           classy.clearGarbageCollection();
                           console.log("The garbage collection has been cleaned. "+totalObjectsInCollection+" Items found. Now there are " + classy.getGarbageCollection().length);
                       }
                   });

             });
        }
    },
    pause : function(wildcard = ""){
        if(classy.isObeying()){
             mic.pause();
             sphChatMic.say(speechMsg.success_mic_paused);
             classy.dontObey();
              showPopUp.show("success",speechMsg.success_mic_paused);
        }
    },
    restart : function(wildcard){
        if(classy.isObeying()){
          classy.restart().then(() => {
              mic.on();
              classy.obey();
              sphChatMic.say(speechMsg.success_mic_restart);
               showPopUp.show("success",speechMsg.success_mic_restart);
          });
        }
    },
    error: function(){
        //All catchable artyom errors will be catched with this
        classy.when("ERROR",function(error){

            if(error.code == "network"){
                 showPopUp.show("error",speechMsg.error_internet_connect)
            }

            if(error.code == "audio-capture"){
                 showPopUp.show("error",speechMsg.error_mic_wo_work)
            }

            if(error.code == "not-allowed"){
                 showPopUp.show("error",speechMsg.error_mic_access)
            }
        });
    },
    say : function(text){
        classy.say(text, {
            onStart() {
               // window.classy.dontObey();
            },
            onEnd() {
                //window.classy.obey();
            }
        });
    }
};

/*-----------------------------
      App buttons and input 
------------------------------*/
$(document).on('click',micButton, function(e) {
    mic.checkPermission();
    micPermission =  (mic.isActive()) ? false :  micPermission;
    (micPermission) ? sphChatMic.connect() :  sphChatMic.disconnect();
    sphChatMic.error();
});


$('#pause-record-btn').on('click', function(e) {
  //recognition.stop();
  sphChatMic.pause();
  sphChatMic.say(speechMsg.success_mic_paused);
   showPopUp.show("success",speechMsg.success_mic_paused);
});

window.onload = mic.checkPermission();

});

