/**
Summary.     SPHChatbot is a SPH Chat product that interacts with backend to full the customer needs.
Description. SPHChatbot is a SPH Chat product that interacts with backend to full the customer needs. SPHChat bot
has several templating features that can help the users with various need of a chatbot functionality.

Author : Anurup Borah
Version : 1.0.0
Date : 03.06.2020
*/

(function($) {
    var SPH_DATA = 'sph.chatbot';
    var listDefaultImg = "img/SPHIconDefault.png";
    var templateIconTemplate = "";
    var DEFAULTS = {
        botLogoUrl: 'img/SPHIconDefault.png',
        downloadIconUrl: "img/download_grey.png",
        botName: 'sphChatBot',
        botCategory: 'Helpdesk',
        botWelcomeMessage: 'SPH Chatbot  to help the customers',
        leftUser: 'bot',
        rightUser: 'user',
        displayedCarrier: 'o2-de',
        displayedTime: '22:00',
        scrollTimeMs: 500,
        timeScale: 1.0,
        templateFontSize: 9,
        formHeader: "Contact Form",
        formName: "contact-form",
        formNeedLabel: false,
        loop: true,
        locale: 'en',
        targetId: '',
        annotationClass: 'jsm-annotation-default',
        dateFormat: function(date) {
            var pad = function(val) {
                var str = '00' + val;
                return str.substring(str.length - 2);
            }
            var month = ['JAN.', 'FEB.', 'MAR.', 'APR.', 'MAY', 'JUN.', 'JUL.', 'AUG.', 'SEP.', 'OCT.', 'NOV.', 'DEC.'];
            return date.getDate() + '. ' + month[date.getMonth()] + ', ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
        },
        script: [],
        state: {
            welcomeMessageDisplayed: true,
            lastTimestamp: null,
            quickRepliesDisplayed: false
        }
    };
    var TRANSLATIONS = {
        en: {
            navBack: 'Home',
            navOptions: 'Manage',
            thousands: 'k',
            millions: 'M',
            responseTime: 'Replies instantly',
            likes: '$LIKES people like this',
            likesWithFriend: '$LIKES people like this including $FRIENDNAME',
            likesWithFriendAndCount: '$LIKES people like this including $FRIENDNAME and $FRIENDCOUNT friends',
            likesWithCount: '$LIKES people like this including $FRIENDCOUNT friends',
            getStartedWarning: 'When you tap Get Started, $BOTNAME will start.',
            getStartedButton: 'Get Started',
            inputPlaceholder: 'Send a message&hellip;'
        },
        de: {
            navBack: 'Startseite',
            navOptions: 'Verwalten',
            thousands: 'K',
            millions: 'M',
            responseTime: 'Antwortet sofort',
            likes: '$LIKES Personen gefällt das',
            likesWithFriend: '$LIKES Personen und $FRIENDNAME gefällt das',
            likesWithFriendAndCount: '$LIKES Personen und $FRIENDNAME und $FRIENDCOUNT weiteren Freunden gefällt das',
            likesWithCount: '$LIKES Personen und $FRIENDCOUNT weiteren Freunden gefällt das',
            getStartedWarning: 'Wenn du auf „Los geht\'s” tippst, sieht $BOTNAME deine öffentlichen Informationen.',
            getStartedButton: 'Los geht\'s',
            inputPlaceholder: 'Sende eine Nachricht&hellip;'
        },
        tr: {
            navBack: 'Ana Sayfa',
            navOptions: 'Yönet',
            thousands: 'k',
            millions: 'M',
            responseTime: 'Hemen yanıt',
            likes: '$LIKES kişi bunu beğendi',
            likesWithFriend: '$FRIENDNAME dahil $LIKES kişi bunu beğendi',
            likesWithFriendAndCount: '$FRIENDNAME ve $FRIENDCOUNT arkadaşin dahil $LIKES kişi bunu beğendi',
            likesWithCount: '$FRIENDCOUNT arkadaşin dahil $LIKES kişi bunu beğendi',
            getStartedWarning: 'Başla\'e dokunduğunda, $BOTNAME senin herkese açık bilgilerini görecektir',
            getStartedButton: 'Başla',
            inputPlaceholder: 'Bir ileti oluşturun&hellip;'
        },
        dk: {
            navBack: 'Startside',
            navOptions: 'Administrer',
            thousands: 'k',
            millions: 'M',
            responseTime: 'Reagere umiddelbart',
            likes: '$LIKES personer synes godt om dette',
            likesWithFriend: '$LIKES personer synes godt om dette, herunder $FRIENDNAME',
            likesWithFriendAndCount: '$LIKES personer synes godt om dette, herunder $FRIENDNAME og $FRIENDCOUNT andre venner',
            likesWithCount: '$LIKES personer synes godt om dette, herunder $FRIENDCOUNT venner',
            getStartedWarning: 'Når du trykker på Kom i gang, kan $BOTNAME se dine offentlige oplysninger.',
            getStartedButton: 'Kom i gang',
            inputPlaceholder: 'Skriv en besked&hellip;'
        }
    };

    function SPHPlugin(element, options) {
        this.element = element;
        this.$element = $(element);
        this.options = $.extend(true, {}, DEFAULTS, options);
        this.init();
    }


    SPHPlugin.prototype._likeCount = function() {
        var totalCount = this.options.likes ? this.options.likes.totalCount : undefined;
        var text;
        if (totalCount === undefined) {
            text = '25' + this._localize('thousands');
        } else {
            if (totalCount > 999999) {
                text = (totalCount / 1000000).toFixed(1) + this._localize('millions');
            } else if (totalCount > 999) {
                text = (totalCount / 1000).toFixed(1) + this._localize('thousands');
            } else {
                text = String(totalCount);
            }
        }
        return text;
    }

    SPHPlugin.prototype._likeText = function(short) {
        if (typeof this.options.likeTextFn === 'function') {
            return this.options.likeTextFn(short);
        } else {
            var key = 'likes';
            if (!short && this.options.likes) {
                if (this.options.likes.friendName && this.options.likes.otherFriendsCount) {
                    key = 'likesWithFriendAndCount';
                } else if (this.options.likes.friendName) {
                    key = 'likesWithFriend';
                } else if (this.options.likes.otherFriendsCount) {
                    key = 'likesWithCount';
                }
            }
            return this._localize(key);
        }
    }

    SPHPlugin.prototype._localize = function(key) {
        if (key === 'likeTextShort') {
            return this._likeText(true);
        } else if (key === 'likeTextLong') {
            return this._likeText(false);
        }
        var text = TRANSLATIONS[this.options.locale][key];
        if (text.indexOf('$') > -1) {
            text = text.replace(/\$LIKES/g, this._likeCount());
            text = text.replace(/\$FRIENDNAME/g, this.options.likes && this.options.likes.friendName ? this.options.likes.friendName : '');
            text = text.replace(/\$FRIENDCOUNT/g, this.options.likes && this.options.likes.otherFriendsCount ? this.options.likes.otherFriendsCount : '0');
            text = text.replace(/\$BOTNAME/g, this.options.botName);
        }
        return text;
    }


    SPHPlugin.prototype._checkWelcomeMessage = function() {
        if (this.options.state.welcomeMessageDisplayed) {
            $.error('Must call start before sending messages');
        }
    }

    SPHPlugin.prototype._checkUser = function(user) {
        if (!user in [this.options.leftUser, this.options.rightUser]) {
            $.error('Unknown user ' + user);
        }
    }

    SPHPlugin.prototype._checkQuickReply = function(expected) {
        if (expected === true && !this.options.state.quickRepliesDisplayed) {
            $.error('Quick replies are currently not displayed');
        } else if (expected === false && this.options.state.quickRepliesDisplayed) {
            $.error('Quick replies are already displayed');
        }
    }

     SPHPlugin.prototype.toggleQuickReplyOption = function(options) {
        if(typeof Boolean(options.value)) {
             this.options.state.quickRepliesDisplayed = options.value;
        }
     }

     SPHPlugin.prototype._toggleQuickReply = function() {
         this.$element.find('.jsm-quick-replies-container').toggleClass(function() {
           if ($( this ).hasClass(".jsm-hide") ) {
             return ".jsm-show";
           } else {
             return "jsm-hide";
           }
         })
     }


     SPHPlugin.prototype.init = function() {
         var html = '\
             <div id="headform" class="headerforchatscreen">\
                 <strong> <span class="textforform">' + this.options.botWelcomeMessage +'</span></strong>\
                  <span id="collapsible" class="collapsible moreIcon"></span>\
                         <div id="divToHide" class="content">\
                           <ul type="none">\
                             <li class="listStyle">\
                               <span data-toggle="modal" data-target="#faqModal">Frequently asked questions</span>\
                             </li>\
                             <li class="listStyle"><span data-toggle="modal" data-target="#contactModal">Contact Details</span></li>\
                           </ul>\
                         </div>\
                         <span class="dividerIcon"></span>\
                 <span class="crossforform hvr-grow closeChat"></span>\
             </div>\
             <div class="topheader2">\
                 <div class="primaryheading3">\
                     <hr class="hr4"/>\
                     <span class="todaytxt"><span class="todaytext">Today</span></span>\
                 </div>\
             </div>\
             <div class="chatareadiv jsm-chat-content">\
                 <div class="jsm-quick-replies-container quick_template animate__animated animate__fadeInUp jsm-hide">\
                 </div>\
                 <div class="jsm-annotation-container"></div>\
                 <div class="jsm-alert-container"></div>\
             </div>\
              <div class="messagesendarea d-flex animate__animated  animate__flash panel-footer">\
                 <input id="btn-input" type="text" autofocus="" class="typearea" placeholder="Send your message here..." />\
                 <button id="btn-chat" class="sendbutton"><img src="img/SendIcon.png"/></button>\
             </div>\
             <div class="floaterbuttons slideInRight">\
                 <span id="chatHomeBtn" class="floaterstyle"><img src="img/HomeBtn.png" /></span>\
                 <span id="chatBackBtn" class="floaterstyle"><img src="img/PreviousBtn.png" /></span>\
             </div>\
         ';
         //<span id="chatMicBtn" class="floaterstyle"><img src="img/Mic_default.png" /></span>\
         //this.templateIconTemplate = '<img src="' + this.options.botLogoUrl + '" class="receivericon mr-3">';
         this.$element.prepend(html);
         // Detect iOS devices
         var agent = navigator.userAgent;
         if (agent.indexOf('iPhone') > 0 || agent.indexOf('iPod') > 0) {
             this.$element.find('.jsm-chat-content').addClass('ios');
         }

         // Bind resize handler and trigger it once
         $(window).resize(this._handleResize.bind(this));
         this._handleResize();
     }

     SPHPlugin.prototype.start = function(options) {
         if (options === undefined || options.delay === undefined) {
             if (this.options.state.welcomeMessageDisplayed) {
                 this.$element.prev().find('.chattwo').addClass('jsm-hide');
                 this.$element.removeClass('jsm-hide').show();
                 this.options.state.welcomeMessageDisplayed = false;
             }
         } else {
             this.options.script.push({
                 method: 'start',
                 args: [],
                 delay: options.delay
             })
         }
         return this;
     }

     SPHPlugin.prototype.returnQuickReplyOption = function(options,callback) {
          callback(this.options.state.quickRepliesDisplayed)
      }

    SPHPlugin.prototype._scrollDown = function() {
        var scrollHeight = this.$element.find('.jsm-chat-content').prop('scrollHeight');
        this.$element.find('.jsm-chat-content').animate({
            scrollTop: scrollHeight
        }, this.options.scrollTimeMs);
    }

    SPHPlugin.prototype._scrollUp = function() {
        var scrollHeight = this.$element.find('.jsm-chat-content .jsm-chat-row:last-child').prop('scrollHeight');
        this.$element.find('.jsm-chat-content').animate({
            scrollTop: $('.jsm-chat-content .jsm-chat-row:last-child').offset().top
        }, this.options.scrollTimeMs);
    }

    SPHPlugin.prototype._adjustIcon = function($this) {
        let icon = $this.$element.find('.bot > .jsm-user-icon:last');
        if(icon.length > 0){
           let wrapperHeight = $this.$element.find('.jsm-user-wrapper:last').outerHeight();
           let iconTop = icon.css('top').replace(/[^-\d\.]/g, '');
           let top = iconTop - wrapperHeight;
           setTimeout(function() {
                icon.animate({
                  top: top
              }, 250 * $this.options.timeScale);
           }, 1);
       }
    }

    SPHPlugin.prototype._clearOptions = function(options) {
        var result = $.extend({}, options);
        delete result.delay;
        return result;
    }

    SPHPlugin.prototype._clearOptionsScript = function() {
        var result = $.extend({}, this);
        //delete result.options.script;
        //console.log(result.options.script);
        if(result.options.script.length > 2){
            result.options.script.splice(0, result.options.script.length - 1);
        }
        return result;
    }

    SPHPlugin.prototype._formValue = function(item) {
        if(item !==undefined){
            return item
        }
        return "null";
    }

    SPHPlugin.prototype._checkValidUrl = function validURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return !!pattern.test(str);
    }


    SPHPlugin.prototype._isValidDate = function(dateString) {
          var regEx = /^\d{4}-\d{2}-\d{2}$/;
          if(!dateString.match(regEx)) return false;  // Invalid format
          var d = new Date(dateString);
          var dNum = d.getTime();
          if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
          return d.toISOString().slice(0,10) === dateString;
    }


    SPHPlugin.prototype._handleResize = function() {
        var width = this.$element.width() || this.$element.height() * 0.5622;
        // Update font size
        var fontSize = (width !== 0) ? Math.floor(width / 750 * 24) : this.options.templateFontSize;
        //this.$element.css('font-size', fontSize + 'px');
        // Force redraw
        this.$element.parent().toggleClass('jsm-force-redraw');
        // Adjust generic template items
        var that = this;
        this.$element.find('.title').css('height', 'auto'); // reset previously set heights
        setTimeout(function() {
            // Adjust generic template items
            var $templates = that.$element.find('.jsm-generic-template');
            //$templates.css('width', 'calc(' + width + 'px - 6em - 4px)');
            $templates.each(function(index) {
                var $titles = $(this).find('.title');
                $titles.css('height', Math.max.apply(Math, $titles.map(function() { return $(this).outerHeight(); })) + 'px');
            });
            // Adjust user icon positions
            var $leftUserWrappers = that.$element.find('.jsm-user-wrapper.' + that.options.leftUser);
            $leftUserWrappers.each(function(index) {
                var top = $(this).height() - 3.5 * fontSize; // 3.5 = image size 3 + 0.5 margin bottom
                var $icon = $(this).find('.jsm-user-icon');
                $icon.css('bottom', top + 'px');
            });
            // Adjust scrolling
            that._scrollDown();
        }, 1);
    }

    SPHPlugin.prototype._datePickerAttributeTemplate = function(items) {
        var extraConfig = "";
        //Date Disable Between
        if(items.dateDisableBetween!==undefined && Object.keys(items.dateDisableBetween).length > 0){
             extraConfig+=' data-disabledaterange=';
             extraConfig+=JSON.stringify(items.dateDisableBetween).replace(/[\""]/g, '\\"');
        }
       //Select Date Range to Appear for Date Picker
       if(items.selectDateRangeBetween!==undefined && Object.keys(items.selectDateRangeBetween).length > 0){
             extraConfig+=' data-selectdaterange=';
             if(items.selectDateRangeBetween.startDate ==undefined || !this._isValidDate(items.selectDateRangeBetween.startDate)){
                  $.error('Start Date is Invalid. Valid Format YYYY-MM-DD');
             }
             if(items.selectDateRangeBetween.endDate ==undefined || !this._isValidDate(items.selectDateRangeBetween.endDate)){
                  $.error('End Date is Invalid. Valid Format YYYY-MM-DD');
             }
             if(moment(items.selectDateRangeBetween.endDate).isBefore(items.selectDateRangeBetween.startDate)){
                   $.error('End Date is before Start Date');
             }
             extraConfig+=items.selectDateRangeBetween.startDate + "_" + items.selectDateRangeBetween.endDate
      }

       extraConfig+=' data-ispastdisable=';
       extraConfig+= (items.pastDateDisable !== undefined) ? items.pastDateDisable  : false;
       extraConfig+=' data-isfurturedisable=';
       extraConfig+= (items.futureDateDisable !== undefined) ? items.futureDateDisable  : false;
       extraConfig+=' data-disabledates=';
       extraConfig+= (items.disableDates !== undefined && !$.isEmptyObject(items.disableDates)) ? JSON.stringify(items.disableDates)  : false;
       extraConfig+=' data-timepicker=';
       extraConfig+= (items.timePickerConfig!==undefined && items.timePickerConfig.timePicker!==undefined) ? (items.timePickerConfig.timePicker === 'true' || items.timePickerConfig.timePicker === true) : false;
       extraConfig+=' data-timepickerformat=';
       extraConfig+= (items.timePickerConfig!==undefined && items.timePickerConfig.timePickerFormat!==undefined && items.timePickerConfig.timePickerFormat!="") ?  items.timePickerConfig.timePickerFormat : 24;
       extraConfig+=' data-timeminutestep=';
       extraConfig+= (items.timePickerConfig!==undefined && items.timePickerConfig.timeMinuteStep!==undefined && items.timePickerConfig.timeMinuteStep!="") ?  items.timePickerConfig.timeMinuteStep : 15;
       extraConfig+=' data-isdaterange=';
       extraConfig+= (items.isRange!==undefined) ?  (items.isRange === 'true' || items.isRange === true) : false;
       extraConfig+=' data-calendarcount=';
       extraConfig+= (items.calendarCount!==undefined) ? items.calendarCount : 1;
       extraConfig+=' data-autoclose=';
       extraConfig+= (items.autoClose!==undefined) ? (items.autoClose === 'true' || items.autoClose === true) : false;
       extraConfig+=' data-calendarposition=';
       extraConfig+= (items.calendarPosition!==undefined && items.calendarPosition!="") ? items.calendarPosition : "bottom";
       extraConfig+=' data-dateformat=';
       extraConfig+= (items.dateFormat!==undefined && items.dateFormat!="") ? items.dateFormat : "YYYY-MM-DD HH:mm";
       extraConfig+=' data-showcalendar=';
       extraConfig+= (items.showCalendars!==undefined) ? (items.showCalendars === 'true' || items.showCalendars === true) : true;
       extraConfig+=' data-showheader=';
       extraConfig+= (items.showHeader !== undefined) ? items.showHeader : true;
       extraConfig+=' data-showfooter=';
       extraConfig+= (items.showFooter !== undefined) ? items.showFooter : true;
       extraConfig+=' data-startempty=';
       extraConfig+= (items.startEmpty !== undefined) ? items.startEmpty : false;
       return extraConfig;
    }


    //Add New Content
    SPHPlugin.prototype._addNewContent = function(user, $payload, timestamp,$options = "") {
        var that = this;
        var fontSize = parseInt($(this.element).css('font-size'));
        var $content = this.$element.find('.jsm-chat-content');
//        // Remove any user message status displays if a new bot message appears
//        if (user === this.options.leftUser) {
//            $content.find('.jsm-status').remove();
//        }

        // Remove existing typing indicators
        $content.find('.jsm-chat-row:has(.jsm-typing-indicator)').parent().remove();
        $content.find('.jsm-chat-row:has(.jsm-typing-indicator)').remove();


        // Create a user-specific wrapper and create/get the user icon in case of left side
        var $user = $content.find('.jsm-user-wrapper:last');

        var $icon = null;
        var newWrapper = $user.length === 0 || !$user.hasClass(user) || ($options.template=="typing") ;
        var templateClass = (this.options.targetId !== undefined && this.options.targetId!="") ? this.options.targetId : "";

        /*Newly Added Start */
        var addTemplateCss = ($content.find(".jsm-chat-message").length==0) ? "d-flex templatewithicon position-relative " : "";
        if( user==this.options.leftUser && addTemplateCss==""){
                addTemplateCss = "d-flex templatewithicon position-relative ";
        }
        addTemplateCss = ($options.template=="message" && user=="user") ? "" : addTemplateCss;
        var typingCss = ($options.template=="typing") ? " typing-div" : "";
        $user = $('<div class="jsm-user-wrapper ' + addTemplateCss  + user + typingCss + '"></div>');
        if (user === this.options.leftUser) {
            $icon = $('<div class="jsm-user-icon animate__animated animate__fadeInUp"><img class="receivericon mr-3" src="' + this.options.botLogoUrl + '"></div>');
            $user.append($icon);
        }
       $content.append($user);
        /*Newly Added End */

        /* Old Implementation Start */
//        if (newWrapper) {
//            var addTemplateCss = ($content.find(".jsm-chat-message").length==0) ? "d-flex templatewithicon position-relative " : "";
//            if( user==this.options.leftUser && addTemplateCss==""){
//                    addTemplateCss = "d-flex templatewithicon position-relative ";
//            }
//            addTemplateCss = ($options.template=="message" && user=="user") ? "" : addTemplateCss;
//            var typingCss = ($options.template=="typing") ? " typing-div" : "";
//            $user = $('<div class="jsm-user-wrapper ' + addTemplateCss  + user + typingCss + '"></div>');
//            if (user === this.options.leftUser) {
//                $icon = $('<div class="jsm-user-icon animate__animated animate__fadeInUp"><img class="receivericon mr-3" src="' + this.options.botLogoUrl + '"></div>');
//                $user.append($icon);
//            }
//           $content.append($user);
//        } else if ($user.hasClass(this.options.leftUser)) {
//            $user.addClass("d-flex templatewithicon position-relative ");
//            $icon = $user.find('.jsm-user-icon');
//        }
 /* Old Implementation End */

        var $wrapper = $('<div class="jsm-chat-row'+ templateClass +'"></div>');
        // Check if a new timestamp has to be inserted
        if (timestamp !== false) {
            var ts = this.options.dateFormat(timestamp ? timestamp : new Date());
//            if (ts !== this.options.state.lastTimestamp) {
                if($options.template!=="message" && $options.template!=="typing"){
                    $wrapper.append('<div class="jsm-chat-timestamp">' + ts + '</div>');
                }
                this.options.state.lastTimestamp = ts;
//            }
        }

        // Insert the actual content
        $wrapper.append($payload);
        // Now throw the whole row into the user-wrapper

        $user.append($wrapper);

        // If the user icon needs to be maintained, position it correctly or animate it down to the newest message
        if ($icon) {
            setTimeout(function() {
                var top = $user.height() - 3.5 * fontSize; // 3.5 = image size 3 + 0.5 margin bottom
                if (newWrapper) {
                    $icon.css('bottom', top + 'px').css('z-index',2);
                } else {
                    $icon.animate({
                        bottom: top,
                        'z-index': 2
                    }, 250 * that.options.timeScale);
                }
            }, 1);
        }
        // Setup corners
        var $messages = $user.find('.jsm-chat-message');
        $messages.each(function(index) {
            if (index > 0) {
                $(this).addClass('jsm-has-previous');
            }
            if (index < $messages.length - 1) {
                $(this).addClass('jsm-has-next');
            }
        });
        // Scroll the entire view down
        this._scrollDown();
    }


    //Show Input Text
    SPHPlugin.prototype.showInputText = function(text, options) {
        var inputTemplate = '<div class="panel-footer"><div class="input-group">';
        var inputOptions = "";
        if(options.elemOption !== undefined){
            inputOptions += (options.elemOption.maxTextLength!== undefined) ? "maxlength="+options.elemOption.maxTextLength : "";
        }
        inputTemplate += '<input id="btn-input" type="text" ' + inputOptions + ' class="form-control input-sm chat_input" placeholder="Write your message here..." />';
        inputTemplate += '<span class="input-group-btn"><button class="btn btn-primary btn-sm" id="btn-chat">Send</button>';
        inputTemplate += '</span></div></div>';
        $(options.elem).after(inputTemplate);
    }

    SPHPlugin.prototype.sendmessage = function(user,id,text, options) {
         this.options.targetId = (id != undefined)  ? " " + id : "";
         options = $.extend(options, { "template" : "message"});
         this.message(user, text,options);
    }

    //Message Template
    SPHPlugin.prototype.message = function(user,text, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            this._checkUser(user);
            //var sideClass = user === this.options.leftUser ? 'receivermessagetext' : user === this.options.rightUser ? 'sendermessage' : '';
            var sideClass = (user === this.options.leftUser) ? 'receivermessagetext' : 'sendermessage';
            var dFlex = (user === this.options.leftUser) ? 'd-inline ' : "";
            var msgTemplate =  (user === this.options.leftUser) ? '<div class="receivermessage animate__animated animate__fadeInUp">' : '';
            msgTemplate += '<div class="' + dFlex + 'animate__animated animate__fadeInUp ' + sideClass + ' '+ (options.className || '') + '">' + text;
            if (options.timestamp!=undefined &&  options.timestamp!== false) {
                var ts = this.options.dateFormat(options.timestamp ? options.timestamp : new Date());
                var timeTextCss = (user === this.options.leftUser) ? 'timetext ' : "timetext2";
                msgTemplate+='<span class="' + timeTextCss + '">' + ts + '</span>';
                this.options.state.lastTimestamp = ts;
            }
            msgTemplate+= '</div>';
            msgTemplate += (user === this.options.leftUser) ? '</div>' : '';

            var $content = $(msgTemplate);

            this._addNewContent(user, $content, options.timestamp,{ template : "message" });
        } else {
            this.options.script.push({
                method: 'message',
                args: [ user, text, this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }

    SPHPlugin.prototype.typingIndicator = function(options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
            this._addNewContent(this.options.leftUser, $('<div class="jsm-chat-message jsm-left jsm-typing-indicator"><span></span><span></span><span></span></div>'), timeStamp,{ "template" : "typing"});
        } else {
            this.options.script.push({
                method: 'typingIndicator',
                args: [],
                delay: options.delay
            });
        }
        return this;
    }

    //Audio Article
    SPHPlugin.prototype.showAudioArticleTemplate = function(items, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
            var audioCarouselId = 'videoCarousel' +  Date.now();
             var carouseIndicator = (items.carousel) ? '<ol class="carousel-indicators">' : '';
             var template = '';
             template += (items.carousel) ? '<div class="outercarouseldiv audioWrapper">' : '';
             template += (items.carousel) ? '<div id="' + audioCarouselId +'" class="carousel slide" data-ride="carousel">' :
                        '<div id="' + audioCarouselId +'" class="jsm-generic-template-wrapper button_template animate__animated animate__fadeInUp">';
             if(items.templateText !== undefined && items.templateText !== ""){
                 template += (items.carousel) ? '<div class="jsm-chat-row"><p class="textabovetemplate">' + items.templateText + '</p></div>' :
                     '<div class="jsm-chat-row generic_template quick_template2"><p class="buttontextheader">' + items.templateText + '</p><hr class="hr5"/><div class="d-flex jsm-generic-template">';
             }
             if(items.carousel){
                 template+='<div id="' + audioCarouselId +'" class="carousel slide" data-ride="carousel"><div class="carousel-inner">';
              }
             var audioBlock = function(item){
                 var setControl = "";
                 setControl += "controls";
                 setControl += (item.loop) ? " loop"  : "";
                 setControl += (item.autoPlay) ? " autoplay" : "";
                 setControl += (item.muted) ? " muted" : "";
                 template += '<audio crossorigin ' + setControl +'><source src="' + item.audioUrl + '" title="' + item.audioTitle + '"/>';
                 template += '<p>Your user agent does not support the HTML5 Audio element.</p></audio>';

             };
             $.each(items.templateItems, function(index, item) {
                  if(items.carousel){
                       template+= '<div class="jsm-generic-template carousel-item ' + (index == 0 ? 'active' : '') +'">';
                       audioBlock(item);
                       template+= '<div class="carousel-caption carouselCaption d-md-block">';
                       if(item.audioTitle!= undefined && item.audioTitle!=""){
                             template += '<p><span>' + item.audioTitle + '</span></p>';
                        }
                       $.each(item.buttons, function(index2, button) {
                         template+= '<button class="hoverforallbuttons buttonforgenerictemplate jsm-button" data-id="' + index +'" style="vertical-align:middle"><span>' + button + '</span></button>';
                       });
                       template += '</div></div>';
                       carouseIndicator+= '<li data-target="#' + audioCarouselId + '" data-slide-to="' + index + '"' + (index == 0 ? ' class="active"' : '') + '></li>';
                   }else{
                     template+= '<div class="jsm-generic-template withoutcarouseldiv">';
                     audioBlock(item);
                     template+= '<div class="d-md-block">';
                     if(item.audioTitle!= undefined && item.audioTitle!=""){
                        template+= '<h6 class="mt-3">' + item.audioTitle + '</h6>';
                     }
                     template+= (item.subtitle!=undefined && item.subtitle!="") ? '<p class="textbelowimg">' + item.subtitle + '</p>' : '';
                      $.each(item.buttons, function(index2, button) {
                         template+= '<button class="buttonforgenerictemplate hoverforallbuttons jsm-button" data-id="' + index +'" style="vertical-align:middle"><span>' + button + '</span></button>';
                     });
                     template+= '</div></div>';
                 }
             });

             if(items.carousel){
                 template+='</div>';
                 carouseIndicator+= '</ol>';
                 //  Left and right controls
                 template+='<a class="carousel-control-prev" href="#' + audioCarouselId + '" role="button" data-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Previous</span></a>';
                 template+='<a class="carousel-control-next" href="#' + audioCarouselId + '" role="button" data-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span></a>';
                 template+=carouseIndicator;
                 template+='</div>';
             }else{
                 template+='</div>';
             }


//            var template = '<div class="jsm-chat-message jsm-left jsm-generic-template-wrapper jsm-has-previous">';
//            var audioClass = 'jsm-audio';
//            $.each(items, function(index, item) {
//                var setControl = "";
//                setControl += "controls";
//                setControl += (item.loop) ? " loop"  : "";
//                setControl += (item.autoPlay) ? " autoplay" : "";
//                setControl += (item.muted) ? " muted" : "";
//                template += '<div class="jsm-audio-template ' + audioClass+ ' ' + (index === 0 ? 'jsm-selected' : '') + '"><ul><li>';
//                template += '<div class="audioWrapper embed-responsive embed-responsive-16by9">';
//                template += '<audio crossorigin ' + setControl +'><source src="' + item.audioUrl + '" title="' + item.audioTitle + '"/>';
//                template += '<p>Your user agent does not support the HTML5 Audio element.</p></audio>';
//                if(item.audioTitle!= undefined && item.audioTitle!=""){
//                     template += '<p class="marquee"><span>' + item.audioTitle + '</span></p>';
//                }
//                template += '</div></li><li><a href="' + item.audioLink + '" target="_blank"><div class="view-more-audio-btn">View More</div></a>';
//                template += '</li></ul></div>';
//            });
             this._addNewContent(this.options.leftUser, $(template), options.timestamp);
             var $templates = this.$element.find('.jsm-generic-template-wrapper:last .jsm-generic-template');
             // Adjust width of items
             var width = this.$element.width();
             $templates.css('width', 'calc(' + width + 'px - 6em - 4px)');
             // Adjust height of titles
             var $titles = $templates.find('.jsm-title');
             $titles.css('height', Math.max.apply(Math, $titles.map(function() { return $(this).outerHeight(); })) + 'px');
        } else {
             this.options.script.push({
                 method: 'showAudioArticleTemplate',
                 args: [ items, this._clearOptions(options) ],
                 delay: options.delay
             });
         }
         return this;
    }


    //Video Article
     SPHPlugin.prototype.showVideoArticleTemplate = function(items, options) {
        if (options === undefined || options.delay === undefined) {
             this._checkWelcomeMessage();
             this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
             var videoCarouselId = 'videoCarousel' +  Date.now();
             var carouseIndicator = (items.carousel) ? '<ol class="carousel-indicators">' : '';
             var template = '';
             template += (items.carousel) ? '<div class="outercarouseldiv videoWrapper">' : '';
             template += (items.carousel) ? '<div id="' + videoCarouselId +'" class="carousel slide" data-ride="carousel">' :
                        '<div id="' + videoCarouselId +'" class="jsm-generic-template-wrapper button_template animate__animated animate__fadeInUp">';
             if(items.templateText !== undefined && items.templateText !== ""){
                 template += (items.carousel) ? '<div class="jsm-chat-row"><p class="textabovetemplate">' + items.templateText + '</p></div>' :
                     '<div class="jsm-chat-row generic_template quick_template2"><h6 class="buttontextheader">' + items.templateText + '</h6><hr class="hr5"/><div class="d-flex jsm-generic-template">';
             }
             if(items.carousel){
                 template+='<div id="' + videoCarouselId +'" class="carousel slide" data-ride="carousel"><div class="carousel-inner">';
              }
             var videoBlock = function(item){
                 if(!item.isIframe){
                    var setControl = "";
                    setControl += "controls";
                    setControl += (item.loop) ? " loop"  : "";
                    setControl += (item.autoPlay) ? " autoplay" : "";
                    var setPosterUrl = (item.videoPosterUrl != undefined && item.videoPosterUrl !="") ? 'poster="' + item.videoPosterUrl + '"' : "";
                    template += '<video class="d-block w-100 video-background" '+ setControl +'  src="' + item.videoUrl + '" ' + setPosterUrl + '></video>';
                }else{
                    var url = item.videoUrl;
                    var size = (items.carousel) ? ' style="border-radius: 5px 30px 5px 5px"' : '';
                    url = (item.loop) ? url + "?loop=1"  : url + "?loop=0";
                    url = (item.autoPlay) ? url + "&autoplay=1"  : url + "&autoplay=0";
                    url =  url + "&autopause=0";
                    template += '<iframe class="d-block w-100 embed-responsive-item" ';
                    template += ' src="' + url + '"';
                    template += ' frameborder="0"' +  size + ' allowfullscreen></iframe>';
                }
             };
             $.each(items.templateItems, function(index, item) {
                  if(items.carousel){
                       template+= '<div class="jsm-generic-template carousel-item ' + (index == 0 ? 'active' : '') +'">';
                       videoBlock(item);
                       template+= '<div class="carousel-caption carouselCaption d-md-block">';
                       template+= '<p><b>' + item.title + '</b></p>';
                       template+= (item.subtitle!=undefined && item.subtitle!="") ? '<p>' + item.subtitle + '</p>' : "";
                       $.each(item.buttons, function(index2, button) {
                         template+= '<button class="hoverforallbuttons buttonforgenerictemplate jsm-button" data-id="' + index +'" style="vertical-align:middle"><span>' + button + '</span></button>';
                       });
                       template += '</div></div>';
                       carouseIndicator+= '<li data-target="#' + videoCarouselId + '" data-slide-to="' + index + '"' + (index == 0 ? ' class="active"' : '') + '></li>';
                   }else{
                     template+= '<div class="jsm-generic-template withoutcarouseldiv">';
                     videoBlock(item);
                     template+= '<div class="d-md-block"><h6 class="mt-3">' + item.title + '</h6>';
                     template+= (item.subtitle!=undefined && item.subtitle!="") ? '<p class="textbelowimg">' + item.subtitle + '</p>' : '';
                      $.each(item.buttons, function(index2, button) {
                         template+= '<button class="buttonforgenerictemplate hoverforallbuttons jsm-button" data-id="' + index +'" style="vertical-align:middle"><span>' + button + '</span></button>';
                     });
                     template+= '</div></div>';
                 }
             });

             if(items.carousel){
                 template+='</div>';
                 carouseIndicator+= '</ol>';
                 //  Left and right controls
                 template+='<a class="carousel-control-prev" href="#' + videoCarouselId + '" role="button" data-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Previous</span></a>';
                 template+='<a class="carousel-control-next" href="#' + videoCarouselId + '" role="button" data-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span></a>';
                 template+=carouseIndicator;
                 template+='</div>';
             }else{
                 template+='</div>';
             }
            this._addNewContent(this.options.leftUser, $(template), options.timestamp);
             var $templates = this.$element.find('.jsm-generic-template-wrapper:last .jsm-generic-template');
             // Adjust width of items
             var width = this.$element.width();
             $templates.css('width', 'calc(' + width + 'px - 6em - 4px)');
             // Adjust height of titles
             var $titles = $templates.find('.jsm-title');
             $titles.css('height', Math.max.apply(Math, $titles.map(function() { return $(this).outerHeight(); })) + 'px');
         } else {
             this.options.script.push({
                 method: 'showVideoArticleTemplate',
                 args: [ items, this._clearOptions(options) ],
                 delay: options.delay
             });
         }
         return this;
     }

     //Send Payment
     SPHPlugin.prototype.sendPayment = function(text, options) {
         if (options === undefined || options.delay === undefined) {
             this._checkWelcomeMessage();
             var timeScale = this.options.timeScale;
             var $content = this.$element.find('.jsm-chat-content');
             $(text.templateText).appendTo('.jsm-chat-row:last');
             setTimeout(function() {
              console.log($content.find("typing-div:last").length);
               // Remove existing typing indicators
              $content.find('.jsm-chat-row:has(.jsm-typing-indicator)').parent().remove();
              $content.find('.jsm-chat-row:has(.jsm-typing-indicator)').remove();
             }, 500 * timeScale);
         }else {
             this.options.script.push({
                 method: 'sendPayment',
                 args: [ text, this._clearOptions(options) ],
                 delay: options.delay
             });
         }
          return this;
     }


    //Attach Files
    SPHPlugin.prototype.showAttachFileTemplate = function(items,options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var template = '<div class="outercarouseldiv jsm-file-upload">';
            this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
            var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
            if(items.templateText !== undefined && items.templateText !== ""){
                 template += '<div class="jsm-chat-message jsm-left textabovetemplate">' + items.templateText + '</div><div style="clear:both"></div>';
             }
             template += '<div id="drop-area"><div id="img-container">' +
                         '<form class="upload-form" id="attachForm"  enctype="multipart/form-data" >' +
                         '<input type="file" name="' + ( items.name!== undefined ? items.name : "uploadFile") + '" ' + (items.dataSizeToUpload !==undefined ? 'data-size="' + items.dataSizeToUpload + '"' : "")  + 'id="fileElem" ' + (items.isMultiple!=undefined && items.isMultiple  ? "multiple" : "") + ' ' + (items.mimeType!== undefined ? 'accept="' + items.mimeType + '"' : "") + '  />' +
                         '<label class="upload-button rounded-pill shadow grow" id="imgUpload" for="fileElem"><i class="fa fa-cloud-upload"></i></label>' +
                         '</form><progress id="progress-bar" max=100 class="" value=0></progress><div id="gallery" /></div></div>';
              template+='</div>';
            this._addNewContent(this.options.leftUser,
            $(template), timeStamp);
        } else {
            this.options.script.push({
                method: 'showAttachFileTemplate',
                args: [],
                delay: options.delay
            });
        }
        return this;
    }

//    //TimePicker
//    SPHPlugin.prototype.showTimePickerTemplate = function(items,options) {
//        if (options === undefined || options.delay === undefined) {
//            this._checkWelcomeMessage();
//            this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
//             var timeScale = this.options.timeScale;
//             var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
//             var template = "";
//             if(items.templateText !== undefined && items.templateText !== ""){
//                  template += '<div class="jsm-chat-row"><div class="jsm-chat-message jsm-left template-header">' + items.templateText + '</div></div>';
//              }
//              template += '<div id="timepicker" data-date-format="hh:ii" class="datepickernrangeholder input-group time jsm-time" style="transition-delay: ' + (0.5 * timeScale).toFixed(1) + 's" data-date-format="mm-dd-yyyy">' +
//                                             '<input class="form-control custom-input" readonly="readonly" name="time-input" type="text" />' +
//                                             '<span class="input-group-addon  bg-white"><img src="img/sph_calendar.png" height="20" width="20"></span>' +
//                                             '</div>';
//             this._addNewContent(this.options.leftUser,$(template),timeStamp);
//        }else {
//              this.options.script.push({
//                  method: 'showTimePickerTemplate',
//                  args: [],
//                  delay: options.delay
//              });
//         }
//        return this;
//    }
//
//
//    SPHPlugin.prototype.selectTimePicker = function(selectedTime, options) {
//            if (options === undefined || options.delay === undefined) {
//                this._checkWelcomeMessage();
//                var $element = this.$element;
//                var that = this;
//                var timeScale = this.options.timeScale;
//                var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
//                 setTimeout(function() {
//                    that.message(that.options.rightUser, selectedTime, { timestamp: timeStamp, className: 'jsm-date' });
//                    var $message = $element.find('.jsm-chat-message:last');
//                    $message.removeClass('jsm-times');
//                }, 100 * timeScale);
//                // Hide Date
//                setTimeout(function() {
//                    $element.find('.time').animate({
//                        height: 0
//                    }, function() {
//                        $(this).addClass('time-hide').css('height', '');
//                    });
//                }, 200 * timeScale);
//            } else {
//                this.options.script.push({
//                    method: 'selectTimePicker',
//                    args: [ selectedTime, this._clearOptions(options) ],
//                    delay: options.delay
//                });
//            }
//            return this;
//        }

//    //Date Time Picker
//    SPHPlugin.prototype.showDateTimePickerTemplate = function(items,options) {
//        if (options === undefined || options.delay === undefined) {
//            this._checkWelcomeMessage();
//            this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
//            var timeScale = this.options.timeScale;
//            var template = "";
//            var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
//            if(items.templateText !== undefined && items.templateText !== ""){
//                 template += '<div class="jsm-chat-row"><div class="jsm-chat-message jsm-left template-header">' + items.templateText + '</div></div>';
//             }
//             template+='<div id="datetimepicker" data-date-format="yyyy-mm-dd hh:ii:ss" class="datepickernrangeholder input-group datetime jsm-date-time" style="transition-delay: ' + (0.5 * timeScale).toFixed(1) + 's" data-date-format="mm-dd-yyyy">' +
//                                          '<input class="form-control custom-input" readonly="readonly" name="date-time-input" type="text" />' +
//                                          '<span class="input-group-addon  bg-white"><img src="img/sph_calendar.png" height="20" width="20"></span>' +
//                                          '</div>';
//            this._addNewContent(this.options.leftUser,$(template), timeStamp);
//        }else {
//              this.options.script.push({
//                  method: 'showDateTimePickerTemplate',
//                  args: [],
//                  delay: options.delay
//              });
//          }
//        return this;
//    }
//
//    SPHPlugin.prototype.selectDateTimePicker = function(selectedDateTime, options) {
//        if (options === undefined || options.delay === undefined) {
//            this._checkWelcomeMessage();
//            var $element = this.$element;
//            var that = this;
//            var timeScale = this.options.timeScale;
//            var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
//             setTimeout(function() {
//                    that.message(that.options.rightUser, selectedDateTime, { timestamp: timeStamp, className: 'jsm-date' });
//                    var $message = $element.find('.jsm-chat-message:last');
//                    $message.removeClass('jsm-date');
//                }, 100 * timeScale);
//            // Hide Date
//            setTimeout(function() {
//                $element.find('.datetime').animate({
//                    height: 0
//                }, function() {
//                    $(this).addClass('date-time-hide').css('height', '');
//                });
//            }, 200 * timeScale);
//        } else {
//            this.options.script.push({
//                method: 'selectDateTimePicker',
//                args: [ selectedDateTime, this._clearOptions(options) ],
//                delay: options.delay
//            });
//        }
//        return this;
//    }


    //Date Picker
//        SPHPlugin.prototype.showDatePickerTemplate = function(items, options) {
//            if (options === undefined || options.delay === undefined) {
//                 this._checkWelcomeMessage();
//                 var timeScale = this.options.timeScale;
//                 var template = "";
//                 var extraConfig = "";
//                 this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
//
//                 extraConfig += this._datePickerAttributeTemplate(items);
//                 if(items.templateText !== undefined && items.templateText !== ""){
//                     template += '<div class="jsm-chat-row"><div class="animate__animated animate__fadeInUp jsm-chat-message jsm-left template-header">' + items.templateText + '</div></div>';
//                 }
//                 template+='<div id="datepicker" ' + extraConfig + ' data-date-format="yyyy-mm-dd" data-format="yyyy-MM-dd" class="input-group date jsm-date" style="transition-delay: ' + (0.5 * timeScale).toFixed(1) + 's" data-date-format="mm-dd-yyyy">' +
//                      '<input class="form-control custom-input"  readonly="readonly" name="date-input" type="text" />' +
//                      '<span class="input-group-addon calendar-dateselectDatePicker bg-white"><img src="img/sph_calendar.png" height="20" width="20"></span>' +
//                      '</div>';
//                 this._addNewContent(this.options.leftUser,
//                    $(template), false);
//            } else {
//                 this.options.script.push({
//                     method: 'showDatePickerTemplate',
//                     args: [],
//                     delay: options.delay
//                 });
//             }
//             return this;
//        }
//
//
//        SPHPlugin.prototype.selectDatePicker = function(selectedDate, options) {
//            if (options === undefined || options.delay === undefined) {
//                this._checkWelcomeMessage();
//                var $element = this.$element;
//                var that = this;
//                var timeScale = this.options.timeScale;
//               // $element.find('.date').removeClass('date-show');
//                setTimeout(function() {
//                    that.message(that.options.rightUser, selectedDate, { timestamp: false, className: 'jsm-date' });
//                    var $message = $element.find('.jsm-chat-message:last');
//                    $message.removeClass('jsm-date');
//                }, 100 * timeScale);
//                // Hide Date
//                 setTimeout(function() {
//                    $(this).addClass('animate__fadeOut').css('height', '');
//                    $element.parent().find('.date').animate({
//                        height: 0
//                    }, function() {
//                       $(this).slideUp("slow", function() {
//                            $(this).remove();
//                        });
//
//                    });
//                 }, 300 * timeScale);
//            } else {
//                this.options.script.push({
//                    method: 'selectDatePicker',
//                    args: [ selectedDate, this._clearOptions(options) ],
//                    delay: options.delay
//                });
//            }
//            return this;
//        }



    //Date Time Range Picker
    SPHPlugin.prototype.showDateTimeAndRangePickerTemplate = function(items, options) {
        if (options === undefined || options.delay === undefined) {
             this._checkWelcomeMessage();
             var timeScale = this.options.timeScale;
             var extraConfig = "";
             this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
             var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
             extraConfig += this._datePickerAttributeTemplate(items);
             var template = '';
             if(items.templateText !== undefined && items.templateText !== ""){
                 template += '<div class="animate__animated animate__fadeInUp jsm-chat-message jsm-left template-header">' + items.templateText + '</div></div>';
             }
             template+='<div data-date-format="yyyy-mm-dd" data-format="yyyy-MM-dd" class="datepickernrangeholder input-group date jsm-date datepickerholder" style="transition-delay: ' + (0.5 * timeScale).toFixed(1) + 's" data-date-format="mm-dd-yyyy">' +
                  '<input id="datetimerangepicker" ' + extraConfig + ' class="form-control custom-input"  readonly="readonly" name="date-input" type="text" />' +
                  '<span class="input-group-addon calendar-date bg-white"><img src="img/sph_calendar.png" height="20" width="20"></span>' +
                  '</div>';
             this._addNewContent(this.options.leftUser,$(template), timeStamp);
        } else {
             this.options.script.push({
                 method: 'showDateTimeAndRangePickerTemplate',
                 args: [],
                 delay: options.delay
             });
         }
         return this;
    }


    SPHPlugin.prototype.selectDateTimeAndRangePicker = function(selectedDate, options,callback) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var $element = this.$element;
            var that = this;
            var timeScale = this.options.timeScale;
            var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
           // $element.find('.date').removeClass('date-show');
            setTimeout(function() {
                that.message(that.options.rightUser, selectedDate, { timestamp: timeStamp, className: 'jsm-date' });
                var $message = $element.find('.jsm-chat-message:last');
                $message.removeClass('jsm-date');
            }, 100 * timeScale);
            // Hide Date
            setTimeout(function() {
                $(this).addClass('animate__fadeOut').css('height', '');
                $element.parent().find('.date').animate({
                    height: 0
                }, function() {
                   $(this).slideUp("slow", function() {
                     $(this).remove();
                    });
                    callback(true);
                });
            }, 300 * timeScale);
        } else {
            this.options.script.push({
                method: 'selectDateTimeAndRangePicker',
                args: [ selectedDate, this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }

//    //DateRangePicker and DateRang Picker with Time Picker
//    SPHPlugin.prototype.showDateRangePickerTemplate = function(items, options) {
//         console.log(options);
//         if (options === undefined || options.delay === undefined) {
//            this._checkWelcomeMessage();
//             var timeScale = this.options.timeScale;
//
//             var extraConfig = "";
//             extraConfig += this._datePickerAttributeTemplate(items);
//             this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
//             var template = "";
//             if(items.templateText !== undefined && items.templateText !== ""){
//                  template += '<div class="animate__animated animate__fadeInUp jsm-chat-message jsm-left template-header">' + items.templateText + '</div>';
//             }
//             template+='<div id="daterangepicker" class="datepickernrangeholder input-group date jsm-date" style="transition-delay: ' + (0.5 * timeScale).toFixed(1) + 's">' +
//               '<input class="form-control custom-input"  ' + extraConfig + ' readonly="readonly" name="daterange" type="value" />' +
//               '<span class="input-group-addon  bg-white"><img src="img/sph_calendar.png" height="20" width="20"></span>' +
//               '</div>';
//
//             this._addNewContent(this.options.leftUser,
//               $(template), options.timestamp);
//         }else {
//           this.options.script.push({
//               method: 'showDateRangePickerTemplate',
//                args: [ items, this._clearOptions(options) ],
//               delay: options.delay
//           });
//         }
//         return this;
//    }
//
//    SPHPlugin.prototype.selectDateRangePicker = function(selectedDateRange, options) {
//            if (options === undefined || options.delay === undefined) {
//                this._checkWelcomeMessage();
//                var $element = this.$element;
//                var that = this;
//                var timeScale = this.options.timeScale;
//                var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
//                setTimeout(function() {
//                  that.message(that.options.rightUser, selectedDateRange, options);
//                  var $message = $element.find('.jsm-chat-message:last');
//                  $message.removeClass('jsm-date');
//                }, 100 * timeScale);
//                // Hide Date
//
//                setTimeout(function() {
//                    $(this).addClass('animate__fadeOut').css('height', '');
//                    $element.parent().find('.date').animate({
//                        height: 0
//                    }, function() {
//                       $(this).slideUp("slow", function() {
//                         $(this).remove();
//                        });
//
//                    });
//                }, 300 * timeScale);
//
//            } else {
//                this.options.script.push({
//                    method: 'selectDateRangePicker',
//                    args: [ selectedDate, this._clearOptions(options) ],
//                    delay: options.delay
//                });
//            }
//            return this;
//        }

    //List Template
    SPHPlugin.prototype.showListTemplate = function(items, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var $element = this.$element;
            var that = this;
            var timeScale = this.options.timeScale;
            var queryTemplate = '<div class="jsm-list-template" style="transition-delay: ' + (6 * 0.1 * timeScale).toFixed(1) + 's">';
            queryTemplate += '<ul class="jsm-article-list-basic-top-header"><li class="header-li">';
            if(items.mode !== undefined){
                if(items.mode=="list-header-view-more" || items.mode=="list-header-view-readmore"){
                    if(items.headerItem.length==1){
                        var articleLink = (items.headerItem[0].articleLink!= undefined && items.headerItem[0].articleLink!="") ? items.headerItem[0].articleLink : "#";
                        queryTemplate += '<a href="' + articleLink + '" target="_blank"><div class="bottom-left"><h2><b>' +
                        items.headerItem[0].articleHeader + '</b></h2><p>' + items.headerItem[0].articleSubheader  + '</p></div>';
                        var imgUrl = (items.headerItem[0].imgUrl != undefined && items.headerItem[0].imgUrl!="") ? items.headerItem[0].imgUrl : this.listDefaultImg;
                        queryTemplate += '<img src="' + imgUrl + '" alt="'+ items.headerItem[0].imgAlt + '" /></a>';
                    }
                }
                var classNohead = (items.mode=="list-view-readmore") ?  " jsm-article-list-no-head" : "";
                queryTemplate += '<div class="jsm-list-articles"><ul class="jsm-article-list-vertical' + classNohead + '">';
                 var listChildTemplate = "";
                $.each(items.listItems, function(index, listItem) {
                    listChildTemplate += '<li><div class="jsm-article-placeholder"><div class="jsm-img-placeholder">';
                    var listChildLink =  (listItem.articleLink!= undefined && listItem.articleLink!="") ? listItem.articleLink : "#";
                    var listChildImgUrl = (listItem.imgUrl != undefined && listItem.imgUrl!="") ? listItem.imgUrl : this.listDefaultImg;
                    listChildTemplate+=  (items.mode !="list-header-view-more") ? '<a href="' + listChildLink + '" target="_blank">' : "";
                    listChildTemplate+= '<img src="' + listChildImgUrl + '" alt="'+ listItem.imgAlt + '" />';
                    listChildTemplate+=  (items.mode !="list-header-view-more") ? "</a>" : "";
                    listChildTemplate+= '</div><div class="jsm-content-placeholder">';
                    listChildTemplate+=  (items.mode !="list-header-view-more") ? '<a href="' + listChildLink + '" target="_blank">' : "";
                    listChildTemplate+= '<h2>' + listItem.articleHeader + '</h2><p>' + listItem.articleSubheader + '</p>';
                    listChildTemplate+= (items.mode !="list-header-view-more") ? '</a>' : "";

                    if(items.mode=="list-header-view-more"){
                        listChildTemplate+='<a href="' + listChildLink + '" target="_blank"><div class="view-more-btn">View More</div></a>';
                    }
                    listChildTemplate+= '</div></div></li>';
                });
                queryTemplate+=listChildTemplate;
                 if(items.mode=="list-header-view-readmore" || items.mode=="list-view-readmore"){
                    var readMoreLink = (items.readmoreLink!= undefined && items.readmoreLink!="") ? items.readmoreLink : "#";
                    queryTemplate+='<li><a href="' + readMoreLink + '" class="read-more" target="_blank">Read More</a></li>';
                 }
                  queryTemplate+='</ul></div>'
            }
            queryTemplate += '</li></ul></div>';

            this._addNewContent(this.options.leftUser, $(queryTemplate), false);
        }else {
             this.options.script.push({
                 method: 'showListTemplate',
                  args: [ items, this._clearOptions(options) ],
                  delay: options.delay
             })
         }
         return this;
    }


    //Receipt Template
    SPHPlugin.prototype.showReceiptTemplate = function(items, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var $element = this.$element;
            var that = this;
            var timeScale = this.options.timeScale;
            var queryTemplate = '<div class="jsm-order-template" style="transition-delay: ' + (6 * 0.1 * timeScale).toFixed(1) + 's">';
            queryTemplate += '<ul class="jsm-order-list-basic-top-header">';
            if(items.listItems.length > 0){
                var listChildTemplate = "";
                queryTemplate += '<li class="jsm-order-header-li"><div class="jsm-header-order-info"><b>' + items.headerTitle + '</b></div><hr/>';
                queryTemplate += '<div class="jsm-order-list"><ul class="jsm-order-list-vertical jsm-order-list-no-head">';
                $.each(items.listItems, function(index, listItem) {
                    queryTemplate += '<li><div class="jsm-order-placeholder"><div class="jsm-order-img-placeholder">';
                    queryTemplate += (items.imageModal) ? '<a href="' + listItem.imgUrl + '"  data-toggle="modal" data-target="#imageModal">' : '';
                    queryTemplate += '<img src="' + listItem.imgUrl + '" alt="' + listItem.imgAlt + '" ' + (items.imageModal ? 'class="showModal"' : '') + ' />';
                    queryTemplate += (items.imageModal) ? '</a>' : '';
                    queryTemplate += '</div><div class="jsm-order-content-placeholder"><h2>' + listItem.orderHeader + '</h2>';
                    queryTemplate += '<p>' + listItem.orderSubheader +'</p><p><b>Quantity : </b>' + listItem.quantity +'</p><p><b>Price : </b>' + listItem.price + '</p>';
                    queryTemplate += '</div></div></li>';
                });
                queryTemplate += '</ul></div></li>';
                queryTemplate += '<li class="jsm-order-info"><table><tbody>';
                if(items.payBy !==undefined && items.payBy!=""){
                    queryTemplate += '<tr><td><h5 class="jsm-order-header">Paid By : </h5></td><td><label>' + items.payBy + '</label></td></tr>';
                }
                if(items.payWith !==undefined && items.payWith!=""){
                    queryTemplate += '<tr><td><h5 class="jsm-order-header">Paid With : </h5></td><td><label>' + items.payWith + '</label></td></tr>';
                }
                if(items.shipToAddress !==undefined && items.shipToAddress!=""){
                    queryTemplate += '<tr><td><h5 class="jsm-order-header">Ship To : </h5></td><td><label>' + items.shipToAddress + '</label></td></tr>';
                }
                queryTemplate += '</tbody></table>';
                queryTemplate += '<hr/"><table><tbody><tr><td><span class="jsm-order-header">GST : </span></td>';
                queryTemplate += '<td><b>' + items.gst + '</b></td></tr>';
                queryTemplate += '<td><span class="jsm-order-header">Total : </span></td>';
                queryTemplate += '<td><b>' + items.total + '</b></td></tr>';
                queryTemplate += '</tbody></table></li>';
                queryTemplate +='</ul></div>';
                this._addNewContent(this.options.leftUser, $(queryTemplate), options.timestamp);
            }
        }else {
             this.options.script.push({
                 method: 'showReceiptTemplate',
                 args: [ items, this._clearOptions(options) ],
                 delay: options.delay
             });
         }
         return this;
    }

    //Text Order ReceiptTemplate
     SPHPlugin.prototype.showTextOrderReceiptTemplate= function(items, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var $element = this.$element;
            var that = this;
            var timeScale = this.options.timeScale;
            //<div class="animate__animated animate__fadeInUp order_template2">
            var queryTemplate = '';
            queryTemplate += '<div class="animate__animated animate__fadeInUp order_template2">';
            queryTemplate += '<h6 class="buttontextheader">';
            queryTemplate += (items.orderHeader !==undefined && items.orderHeader!="") ? items.orderHeader : "Order Information";
            queryTemplate += '</h6>';
            queryTemplate += '<hr class="hr5"/>';
            if(items.headerText !==undefined && items.headerText!=""){
                queryTemplate += items.headerText;
            }
            queryTemplate += '<br />';
            if(items.orderElement.length > 0){
                queryTemplate += '<span class="boldblue mt-4">';
                queryTemplate += (items.summaryHeader !==undefined && items.summaryHeader!="") ? items.summaryHeader : "Summary";
                queryTemplate += '</span>';
                //Order the element by ascending order
                items.orderElement = items.orderElement.sort((a, b) => (a.id > b.id) ? 1 : -1);
                for(let i=0; i< items.orderElement.length; i++){
                     let listElemItem = items.orderElement[i];
                     queryTemplate += '<div id="ordersummary_' + listElemItem.id + '" class="ordersummary d-flex">';
                     let orderVal = listElemItem.orderValue;
                     let divimg = "";
                     queryTemplate += '<span class="left">' + listElemItem.orderKey + ' : </span>';
                     if(listElemItem.orderType=="image"){
                        let modalParam = (orderVal.isShowModal !== undefined && orderVal.isShowModal) ? 'data-target="#chatModal" data-toggle="modal"' : "";
                        divimg = (modalParam!=="") ? " jsm-order-img" : "";
                        orderVal = (orderVal.imageLink!== undefined && orderVal.imageLink!="") ? '<img ' + modalParam +  ' src="' + orderVal.imageLink + '" alt="' + (orderVal.imageAlt!== undefined && orderVal.imageAlt!="" ? orderVal.imageAlt : listElemItem.orderKey ) + '" />': "";
                      }

                     queryTemplate += '<span class="right' + divimg + '">' + orderVal + '</span>';
                     queryTemplate += '</div>';
                }
                 queryTemplate += (items.bottomText !==undefined && items.bottomText!="") ? '<p class="greytextforinfo mt-3">' + items.bottomText + '</p>': "";
                 queryTemplate +='<div class="d-flex ordersummarybtn-div">';
                 for(let i=0; i < items.buttonElement.length; i++){
                     let buttonItem = items.buttonElement[i];
                     let cssBtn = (items.buttonElement.length==1) ? 'buttonforbuttontemplate w-100' : "buttonforordertemplate";
                     cssBtn+= (i%2!=0) ? ' bg-light text-dark border' : '';
                     cssBtn+= (i > 1) ? ' hoverforallbuttons' : '';
                     let btnCls = (buttonItem.buttonClass!=undefined && buttonItem.buttonClass!=="") ? buttonItem.buttonClass  : "";
                     let styleCss = (items.buttonElement.length==1) ? ' style="vertical-align:middle"' : "";
                     let btnId = (buttonItem.buttonId !==undefined && buttonItem.buttonId!="") ? buttonItem.buttonId : buttonItem.buttonText.toLowerCase().replace(" ","-") + "-id";
                     queryTemplate += '<button id="' + btnId + '" class="pay-button-holder ordersummarybtn ' + btnCls + ' mt-2 ' + cssBtn +'"' + styleCss + '><span>';
                     queryTemplate += (buttonItem.buttonLink !==undefined && buttonItem.buttonLink!="") ? '<a href="' + buttonItem.buttonLink + '" target="_blank">' : "";
                     queryTemplate +=  (buttonItem.buttonText !==undefined && buttonItem.buttonText!="") ? buttonItem.buttonText : "Click Here";
                     queryTemplate += (buttonItem.buttonLink !==undefined && buttonItem.buttonLink!="") ? '</a>' : "";
                     queryTemplate += '</span></button>';
                 }
                  queryTemplate +='</div>';

             }
            queryTemplate += '</div>';
            this._addNewContent(this.options.leftUser, $(queryTemplate), options.timestamp);
        }else {
              this.options.script.push({
                  method: 'showTextOrderReceiptTemplate',
                  args: [ items, this._clearOptions(options) ],
                  delay: options.delay
              });
          }
        return this;
     }

      //Alert template
     SPHPlugin.prototype.showAlertTemplate = function(items, options) {
         if (options === undefined || options.delay === undefined) {
              this._checkWelcomeMessage();
              var that = this;
              var $element = this.$element;
              var timeScale = this.options.timeScale;
              var alertElem = $element.find('.jsm-alert-container');
              var $errorTemplate = $element.find('.jsm-alert-container').empty();
              $errorTemplate.css('z-index',3);
              var alertOpt = (items.alertOption!=undefined && items.alertOption!="") ? items.alertOption : "alert-primary";
              var errorInsideTemplate = "";
              errorInsideTemplate +='<div class="alert ' + alertOpt + ' ml-4 mr-4 mt-4" role="alert">';
              errorInsideTemplate += '<h4 class="alert-heading">' + items.headerText + '</h4>';
              errorInsideTemplate += '<p>' + items.contentText + '</p>';
              if(items.templateLinkText!=undefined && items.templateLinkText!=""){
                    errorInsideTemplate += '<hr><p class="mb-0 alertLinkText"><a href="' + items.templateLink + '" target="_blank">' + items.templateLinkText + '</a></p>';
              }
              errorInsideTemplate += '</div>';
              $errorTemplate.append(errorInsideTemplate);
               setTimeout(function() {
                    alertElem.addClass("animate__animated animate__slideInUp");
               }, (100 + 100) * timeScale);

               setTimeout(function() {
                    alertElem.removeClass("animate__slideInUp").addClass("animate__animated   animate__fadeOutDown").slideToggle("slow", function(e) {
                        alertElem.empty();
                    });
                },(1000 + 1000 + 100) * timeScale);
         }else {
              this.options.script.push({
                  method: 'showAlertTemplate',
                  args: [ items, this._clearOptions(options) ],
                  delay: options.delay
              });
         }
         return this;
     }

    //Quick Reply Picker
    SPHPlugin.prototype.showQuickRepliesTemplate = function(quickReplies, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            this._checkQuickReply(false);
            var $element = this.$element;
            var timeScale = this.options.timeScale;
//            setTimeout(function(){
//                //do something special
//             }, 100 * timeScale);
            var messageElem = $element.find(".jsm-user-wrapper.user:last .jsm-chat-row:last .sendermessage");
           this.options.targetId = (quickReplies.templateId!=undefined)  ? " " + quickReplies.templateId : "";
            this._toggleQuickReply();
            var $quickReplies = $element.find('.jsm-quick-replies-container').empty();
            $element.find('.jsm-quick-replies-container').removeAttr("style");
            var queryOptions='<div class="jsm-quick-replies-query quick_template2 animate__animated animate__fadeInUp" style="transition-delay: ' + (6 * 0.1 * timeScale).toFixed(1) + 's">';
            queryOptions+='<p class="buttontextheader">' + quickReplies.templateText + '</p>';
            queryOptions+='<div class="jsm-quick-reply-option-div">';
            $.each(quickReplies.replies, function(index, quickReply) {
                queryOptions+='<button class="jsm-quick-reply-option hoverforallbuttons buttonforquick_template" style="vertical-align:middle;transition-delay: ' + (index * 0.1 * timeScale).toFixed(1) + 's"><span>' + quickReply + '</span></button>';
            });
            queryOptions+='</div>';
            setTimeout(function(){
                messageElem.css({"margin-bottom" : 200 + 'px'});
                 $quickReplies.append(queryOptions);
                $element.find('.jsm-quick-replies-query').removeClass('jsm-hide').prop('scrollLeft', 0);
            },500 * timeScale);
            // Trigger transition to let the options appear
            var that = this;
            setTimeout(function() {
                that._scrollDown();
                if(!messageElem[0].hasAttribute("style")){
                    messageElem.css({"margin-bottom" : 200 + 'px'});
                }
                $element.find('.jsm-quick-reply-option').addClass('jsm-show');
                $element.find('.jsm-chat-row:has(.jsm-typing-indicator)').parent().remove();
                $element.find('.jsm-chat-row:has(.jsm-typing-indicator)').remove();

                //that._addNewContent(that.options.leftUser, $(queryTemplate), false);
            }, 800 * timeScale);
            this.options.state.quickRepliesDisplayed = true;
        } else {
            this.options.script.push({
                method: 'showQuickRepliesTemplate',
                args: [ quickReplies, this._clearOptions(options) ],
                delay: options.delay
            })
        }
        return this;
    }

    SPHPlugin.prototype.scrollQuickReplies = function(quickReplyIndex, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            this._checkQuickReply(true);
            var $scroller = this.$element.find('.jsm-quick-replies-query');
            var $container = $scroller.find('.jsm-quick-replies-container');
            var $option = this.$element.find('.jsm-quick-reply-option:nth-child(' + (quickReplyIndex + 1) + ')');
            var scrollLeft = $scroller.prop('scrollLeft');
            var optionPosX = scrollLeft + $option.position().left;
            var target = -1;
            // Scroll only if quick reply is out of sight
            if (optionPosX + $option.outerWidth() > $scroller.width()) {
                target = optionPosX - parseInt($option.css('marginRight'));
            } else if (optionPosX < scrollLeft) {
                var padding = ($container.outerWidth() - $container.width()) / 2;
                target = Math.max(0, optionPosX - padding);
            }
            if (target > -1) {
                $scroller.animate({
                    scrollLeft: target
                }, Math.abs(scrollLeft - target));
            }
        } else {
            this.options.script.push({
                method: 'scrollQuickReplies',
                args: [ quickReplyIndex, this._clearOptions(options) ],
                delay: options.delay
            })
        }
    }

    SPHPlugin.prototype.selectQuickReply = function(quickReplyIndex, options,callback) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            this._checkQuickReply(true);
            var $element = this.$element;
            var that = this;
            var timeStamp = (options.timestamp !== undefined) ? options.timestamp : false;
            var last_sender_element = $element.find(".jsm-user-wrapper.user:last .jsm-chat-row:last .sendermessage");
            var $option = $element.find('.jsm-quick-reply-option:nth-child(' + (quickReplyIndex + 1) + ')').addClass('jsm-selected');
            var timeScale = this.options.timeScale;
            var now = new Date();
            setTimeout(function() {
                $element.find('.jsm-quick-reply-option').removeClass('jsm-show');
                setTimeout(function() {
                    that.message(that.options.rightUser, $option.text(), { timestamp: timeStamp, className: 'jsm-quickreply' });
                    //that.message(that.options.rightUser, $option.text(), { timestamp: now, delay: 0, className: 'jsm-quickreply' });
                    var $message = $element.find('.jsm-chat-message:last');
                    setTimeout(function() {
                        $message.removeClass('jsm-quickreply');
                    }, 100 * timeScale);
                }, 100 * timeScale);
            }, 500 * timeScale);
            // Hide quick reply options
            setTimeout(function() {
                $element.find('.jsm-quick-replies-container').animate({
                    height: 0
                }, function() {
                    $(this).empty();
                    that.options.state.quickRepliesDisplayed = false;
                    //$(this).addClass('jsm-hide').css('height', '');
                    that._toggleQuickReply();
                    last_sender_element.removeAttr('style');
                    $element.find('.jsm-chat-row:has(.jsm-typing-indicator)').parent().remove();
                    $element.find('.jsm-chat-row:has(.jsm-typing-indicator)').remove();

                    //$(this).remove();
                    //Adjust the Icon after select
                    callback($option.text());
                    //that._adjustIcon(that);

                });
            }, (500 + 100 + 100) * timeScale);

        } else {
            this.options.script.push({
                method: 'selectQuickReply',
                args: [ quickReplyIndex, this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }

    SPHPlugin.prototype.hideQuickReplies = function(options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            this._checkQuickReply(true);
            var $element = this.$element;
            var numOptions = $element.find('.jsm-quick-reply-option').length;
            var that = this;
            var timeScale = this.options.timeScale;
            // Hide options
            $element.find('.jsm-quick-reply-option').removeClass('jsm-show');
            // Hide container
            setTimeout(function() {
                $element.find('.jsm-quick-replies-container').animate({
                    height: 0
                }, 100 * timeScale, function() {
                    that.options.state.quickRepliesDisplayed = false;
                    $(this).addClass('jsm-hide').css('height', '');
                    $(this).empty();
                });
            }, numOptions * 100 * timeScale);
        } else {
            this.options.script.push({
                method: 'hideQuickReplies',
                args: [ this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }



   //Form Template
       SPHPlugin.prototype.showFormTemplate = function(items, options) {
           if (options === undefined || options.delay === undefined) {
               this._checkWelcomeMessage();
               var that = this;
               var $element = this.$element;
               //$element.addClass("formtemplate");
               //$element.find(".chatareadiv").removeClass("chatareadiv").addClass("chatareadivforform");
               var timeScale = this.options.timeScale;
               var numOptions = $element.find('.jsm-form-template').length;
               this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
               //var queryTemplate = this.templateIconTemplate;
               var queryTemplate = '<div class="jsm-form-template jsm-show formtemplate formfull">';
               if(items.formElement.length > 0){
                   var formName = (this._formValue(items.formName)!== "null") ? items.formName : this.options.formName;
                   var formId = formName + "-" +  Date.now();
                   queryTemplate += '<form autocomplete="off" name="' + formName + '" method="post" id="' + formId + '" data-toggle="validator" enctype="multipart/form-data">';
                   queryTemplate += '<div class="sphheading2">';
                   queryTemplate += '<div class="primaryheading2 animate__animated animate__fadeInUp">' + (this._formValue(items.formHeader)!== "null" ? items.formHeader : this.options.formHeader) + '</div>';
                   queryTemplate += '</div>';
                   var isLabelNeeded = (this._formValue(items.formNeedLabel) !== "null") ? items.formNeedLabel : this.options.formLabel;
                   $.each(items.formElement, function(index, listItem) {
                       if(that._formValue(listItem.formType) == "null"){
                          $.error('Form Type not defined');
                       }
                       if(that._formValue(listItem.formElemName) == "null"){
                           $.error('Form name not defined');
                       }
                       listItem.isInline = (that._formValue(listItem.isInline) !== "null") ? listItem.isInline : false;
                       listItem.isRequired = (that._formValue(listItem.isRequired) !== "null") ? listItem.isRequired : false;
                       listItem.isReadonly = (that._formValue(listItem.isReadonly) !== "null") ? listItem.isReadonly : false;
                       listItem.isDisabled = (that._formValue(listItem.isDisabled) !== "null") ? listItem.isDisabled : false;
                       listItem.formPlaceholder = (that._formValue(listItem.formPlaceholder) !== "null") ? listItem.formPlaceholder : "";
                       listItem.formId = (that._formValue(listItem.formId) !== "null") ? listItem.formId : listItem.formElemName.toLowerCase() + "-id";
                       listItem.patternValidation = (that._formValue(listItem.patternValidation) !== "null") ? listItem.patternValidation : "";
                       //queryTemplate += (!listItem.isInline) ? '<div class="form-group">' : '';
                        switch(listItem.formType) {
                          case "checkbox":
                          case "radio":
                            var cssName = "customradiobuttons";
                            var containerName = (listItem.formType=="checkbox") ? "container1" : "container2";
                            var checkMark = (listItem.formType=="checkbox") ? "checkmark1" : "checkmark";
                            if(listItem.formType=="checkbox"){
                                cssName = (listItem.isInline) ? "customcheckboxvertical" : "customcheckbox";
                             }
                            queryTemplate += '<div class="' + cssName + '">';
                            queryTemplate += '<p data-placeholder="' + listItem.formLabel + '" class="pWhite">' + listItem.formLabel +'</p>';
                            queryTemplate += (listItem.isInline) ? '<div class="d-flex">' : '';
                            for(let i=0; i< listItem.formElement.length; i++){
                                   let listElemItem = listItem.formElement[i];
                                   let templCss = (i !== listItem.formElement.length -1) ? " mr-1" : "";
                                   queryTemplate += '<label class="' + containerName + templCss + '">' + listElemItem.elemValue;
                                   listElemItem.isReadonly = (that._formValue(listElemItem.isReadonly) !== "null") ? listElemItem.isReadonly : false;
                                   listElemItem.isDisabled = (that._formValue(listElemItem.isDisabled) !== "null") ? listElemItem.isDisabled : false;
                                   listElemItem.isChecked = (that._formValue(listElemItem.isChecked) !== "null") ? listElemItem.isChecked : false;
                                   listElemItem.elemValue = (that._formValue(listElemItem.elemValue) !== "null") ? listElemItem.elemValue : "";
                                   listItem.formElemName = (listItem.formType=="checkbox") ? listItem.formElemName + '[]' : listItem.formElemName;
                                   queryTemplate +='<input type="' + listItem.formType + '"  name="' + listItem.formElemName + '" value="' + listElemItem.elemValue + '" id="' + listItem.formId + "-" + listElemItem.elemValue.toLowerCase()  + '" ';
                                   queryTemplate += (listElemItem.isRequired) ? "required " : '';
                                   queryTemplate += (listElemItem.isReadonly) ? "readonly " : '';
                                   queryTemplate += (listElemItem.isDisabled) ? "disabled " : '';
                                   queryTemplate += (listElemItem.isChecked) ? "checked " : '';
                                   queryTemplate += '/> ';
                                   let styleCheckbox = !(listItem.isInline) ? ' style="height: 22px;width:22px;"' : '';
                                   queryTemplate += '<span class="' + checkMark + styleCheckbox + '"></span>';
                                   queryTemplate +='</label>';
                            }
                           queryTemplate += (listItem.isInline) ? '</div>' : '';
                           queryTemplate += '</div>';
                         break;
                         case "range":
                            listItem.formSize= (that._formValue(listItem.formSize) !== "null") ? listItem.formSize : "";
                            listItem.formMax= (that._formValue(listItem.formMax) !== "null") ? listItem.formMax : "";
                            listItem.formMin= (that._formValue(listItem.formMin) !== "null") ? listItem.formMin : "";
                            queryTemplate += '<div class="customrangeindicator"><div class="form-group">';
                            queryTemplate += '<label for="formControlRange">' + listItem.formLabel + '</label>';
                            queryTemplate +='<input data-placeholder="' + listItem.formPlaceholder + '" class="form-control-range" type="' + listItem.formType + '" name="' + listItem.formElemName + '" id="' + listItem.formId + '" ';
                            queryTemplate += (listItem.formSize !== "") ? 'size="' + listItem.formSize + '" ' : '';
                            queryTemplate += (listItem.formMax !== "") ? 'max="' + listItem.formMax + '" ' : '';
                            queryTemplate += (listItem.formMin !== "") ? 'min="' + listItem.formMin + '" ' : '';
                            queryTemplate += (listItem.isRequired) ? "required " : '';
                            queryTemplate += (listItem.isReadonly) ? "readonly " : '';
                            queryTemplate += (listItem.isDisabled) ? "disabled " : '';
                            queryTemplate += '>';
                            queryTemplate += '</div></div>';
                         break;
                         case "select":
                           queryTemplate += '<div class="form mt-4">';
                           listItem.isMultipleSelect = (that._formValue(listItem.isMultipleSelect) !== "null") ? listItem.isMultipleSelect : false;
                           queryTemplate +='<p class="pWhite">' + listItem.formLabel + '</p>';
                           queryTemplate +='<select data-placeholder="' + listItem.formLabel + '" name="' + listItem.formElemName + '" id="' + listItem.formId + '" ';
                           queryTemplate += (listItem.isMultipleSelect) ? "multiple " : '';
                           queryTemplate += (listItem.isRequired) ? "required " : '';
                           queryTemplate += (listItem.isDisabled) ? "disabled " : '';
                           queryTemplate += ">";
                           listItem.initialElementText = (that._formValue(listItem.initialElementText) !== "null") ? listItem.initialElementText : false;
                           if(listItem.initialElementText){
                               queryTemplate += '<option value="">' + listItem.initialElementText + '</option>';
                           }
                           for(let i=0; i< listItem.formElement.length; i++){
                                let selectItem = listItem.formElement[i];
                                queryTemplate +='<option value="' + selectItem.selectKey + '">' +  selectItem.selectValue +'</option>';
                           }
                            queryTemplate += "</select>";
                            queryTemplate += '</div>';
                         break;
                         case "textarea":
                          queryTemplate += '<div class="formTextArea">';
                          queryTemplate +='<p class="pWhite">' + listItem.formLabel + '</p>';
                          queryTemplate +='<textarea class="form_textarea" data-placeholder="' + listItem.formPlaceholder + '" name="' + listItem.formElemName + '" id="' + listItem.formId + '" rows="'+ listItem.row +'" cols="' + listItem.column + '" ';
                          queryTemplate += (listItem.isReadonly) ? "readonly " : '';
                          queryTemplate += (listItem.isDisabled) ? "disabled " : '';
                          queryTemplate += (listItem.isRequired) ? "required " : '';
                          queryTemplate += '>';
                          queryTemplate +='</textarea>';
                          queryTemplate += '</div>';
                         break;
                         case "file" :
                         listItem.isMultipleFile= (that._formValue(listItem.isMultipleFile) !== "null") ? listItem.isMultipleFile : false;
                         listItem.fileMimeType= (that._formValue(listItem.fileMimeType) !== "null") ? listItem.fileMimeType : "";
                         listItem.errorMsgs = (that._formValue(listItem.errorMsgs) !== "null") ? listItem.errorMsgs : "";
                         listItem.fileMaxSize = (that._formValue(listItem.fileMaxSize) !== "null") ? listItem.fileMaxSize : "";
                         queryTemplate += '<div class="ml-4 mt-3"><label class="formFileUpload">' + listItem.formLabel + '</label>';
                         queryTemplate +='<input type="' + listItem.formType + '" data-placeholder="' + listItem.formPlaceholder + '" name="' + listItem.formElemName + '" id="' + listItem.formId + '" ';
                         queryTemplate += (listItem.fileMimeType !== "") ? 'accept="' + listItem.fileMimeType + '" ' : '';
                         queryTemplate += (listItem.isMultipleFile) ? "multiple " : '';
                         queryTemplate += (listItem.fileMaxSize !== "") ? 'data-max-size="' + listItem.fileMaxSize + '" ' : '';
                         queryTemplate += (listItem.errorMsgs !== "") ? 'data-error="' + listItem.errorMsgs + '" ' : '';
                         queryTemplate += (listItem.isRequired) ? "required " : '';
                         queryTemplate += (listItem.isReadonly) ? "readonly " : '';
                         queryTemplate += (listItem.isDisabled) ? "disabled " : '';
                         queryTemplate += '/>';
                         queryTemplate += '</div>'
                         break;
                         case "hidden" :
                             queryTemplate +='<input type="' + listItem.formType + '" data-placeholder="' + listItem.formPlaceholder + '" name="' + listItem.formElemName + '" id="' + listItem.formId + '" value="' + listItem.formValue +'"/>';
                         break;
                         default:
                           queryTemplate += '<div class="form">';
                           listItem.formMinLength = (that._formValue(listItem.formMinLength) !== "null") ? listItem.formMinLength : "";
                           listItem.formMaxLength = (that._formValue(listItem.formMaxLength) !== "null") ? listItem.formMaxLength : "";
                           listItem.formValue = (that._formValue(listItem.formValue) !== "null") ? listItem.formValue : "";
                           listItem.errorMsgs = (that._formValue(listItem.errorMsgs) !== "null") ? listItem.errorMsgs : "";

                           queryTemplate +='<input type="' + listItem.formType + '" data-placeholder="' + listItem.formPlaceholder + '" name="' + listItem.formElemName + '" id="' + listItem.formId + '" autocomplete="off"  ';
                           queryTemplate += (listItem.isRequired) ? "required " : '';
                           queryTemplate += (listItem.isReadonly) ? "readonly " : '';
                           queryTemplate += (listItem.isDisabled) ? "disabled " : '';

                           queryTemplate += (listItem.patternValidation !== "") ? 'pattern="' + listItem.patternValidation + '" ' : '';
                           queryTemplate += (listItem.formMinLength !== "") ? 'minlength="' + listItem.formMinLength + '" ' : '';
                           queryTemplate += (listItem.formMaxLength !== "") ? 'maxlength="' + listItem.formMaxLength + '" ' : '';
                           queryTemplate += (listItem.formValue !== "") ? 'value="' + listItem.formValue + '" ' : '';
                           queryTemplate += (listItem.errorMsgs !== "") ? 'title="' + listItem.errorMsgs.common + '" ' : '';
                           queryTemplate += (listItem.isDisabled) ? "disabled " : '';
                           queryTemplate += '/>';
                           queryTemplate += '<label for="' + listItem.formElemName + '" class="label-name">';
                           queryTemplate += '<span class="content-name">' + listItem.formPlaceholder + '</span>';
                           queryTemplate += '</label>';
                           queryTemplate += '</div>';
                         break;
                       }

                   });
                   queryTemplate += '<div id="bottom2"><button type="reset" id="clearBtn" class="button3 hvr-hollow" value="Clear" style="vertical-align:middle"><span>Clear</span></button>';
                   queryTemplate += '<button type="submit" id="submitBtn" class="button2 hvr-hollow" value="Submit" style="vertical-align:middle"><span>Submit</span></button>';
                   queryTemplate += '</form></div>';
                   this._addNewContent(this.options.leftUser, $(queryTemplate), false);
                   this._scrollUp();
//                   setTimeout(function() {
//                      $element.animate({
//                         scrollTop: $(".jsm-form-template input").first().offset().top
//                      }, 3000);
//                    },numOptions * 100 * timeScale);
               }else{
                    $.error('Form Element does not exist');
               }
           }else {
                this.options.script.push({
                    method: 'showFormTemplate',
                    args: [ items, this._clearOptions(options) ],
                    delay: options.delay
                });
           }
            return this;
       }

       SPHPlugin.prototype.hideFormTemplate = function(options) {
           if (options === undefined || options.delay === undefined) {
               this._checkWelcomeMessage();
               var $element = this.$element;
               var numOptions = $element.find('.jsm-form-template').length;
               var that = this;
               var timeScale = this.options.timeScale;
               $element.find('.jsm-form-template').removeClass('jsm-show');
               // Hide Form
               setTimeout(function() {
                   $element.find('.jsm-form-template').animate({
                       height: 0
                   }, 100 * timeScale, function() {
                      $(this).addClass('jsm-hide').css('height', '');
                      //$(this).remove();
                      //that._scrollUp();
                   });
               }, numOptions * 100 * timeScale);
           } else {
               this.options.script.push({
                   method: 'hideFormTemplate',
                   args: [ this._clearOptions(options) ],
                   delay: options.delay
               });
           }
           return this;
       }

    SPHPlugin.prototype.hideFormTemplate = function(options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var $element = this.$element;
            var numOptions = $element.find('.jsm-form-template').length;
            var that = this;
            var timeScale = this.options.timeScale;
            $element.find('.jsm-form-template').removeClass('jsm-show');
            // Hide Form
            setTimeout(function() {
                $element.find('.jsm-form-template').animate({
                    height: 0
                }, 100 * timeScale, function() {
                   $(this).addClass('jsm-hide').css('height', '');
                   //$(this).remove();
                   //that._scrollUp();
                });
            }, numOptions * 100 * timeScale);
        } else {
            this.options.script.push({
                method: 'hideFormTemplate',
                args: [ this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }


    //Button template
    SPHPlugin.prototype.showButtonTemplate = function(items, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
            var template = '<div class="animate__animated animate__fadeInUp jsm-chat-message jsm-button-template button_template animate__animated animate__fadeInUp"><div class="button_template2"><div class="jsm-header"><h6 class="buttontextheader">' + items.label + '</h6><hr class="hr5"><div class="jsm-buttons">';
            $.each(items.value, function(index, button) {
                var cssBtn = (index==0) ? 'activebutton ' : 'hoverforallbuttons';
                template += '<button class="jsm-button buttonforbuttontemplate ' + cssBtn + '" style="vertical-align:middle"><span>' + button + '</span></button>';
            });
            template += '</div></div>';
            this._addNewContent(this.options.leftUser, $(template), options.timestamp);
        } else {
            this.options.script.push({
                method: 'showButtonTemplate',
                args: [ text, buttons, this._clearOptions(options) ],
                delay: options.delay
            });
        }
    }

    SPHPlugin.prototype.selectButtonTemplate = function(buttonIndex, options,callback) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var $button = this.$element.find('.jsm-chat-content .jsm-button-template:last .jsm-buttons .jsm-button:nth-child(' + (buttonIndex + 1) + ')').addClass('jsm-selected');
            setTimeout(function() {
                $button.removeClass('jsm-selected');
            }, 1500 * this.options.timeScale);
            var now = new Date();
            this.message(this.options.rightUser, $button.text(), { timestamp: now });
            callback($button.text());
        } else {
            this.options.script.push({
                method: 'selectButtonTemplate',
                args: [ buttonIndex, this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }

    //Generic Template
    SPHPlugin.prototype.showGenericTemplate = function(items, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var scriptTemplate = '';
            this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
            var carouselId = 'chatCarousel' +  Date.now();
            var carouseIndicator = (items.carousel) ? '<ol class="carousel-indicators">' : '';
            var dFlex = (items.carousel)? 'd-flex' : '';
            var template = '';
            template += (items.carousel) ? '<div class="outercarouseldiv jsm-generic-template-wrapper">' : '';
            template += (items.carousel) ? '<div id="' + carouselId +'" class="carousel slide" data-ride="carousel">' :
                       '<div id="' + carouselId +'" class="jsm-generic-template-wrapper button_template animate__animated animate__fadeInUp">';
            if(items.templateText !== undefined && items.templateText !== ""){
                template += (items.carousel) ? '<div class="jsm-chat-row"><p class="textabovetemplate">' + items.templateText + '</p></div>' :
                    '<div class="jsm-chat-row generic_template quick_template2"><h6 class="buttontextheader">' + items.templateText + '</h6><hr class="hr5"/><div class="d-flex jsm-generic-template">';
            }
            if(items.carousel){
                template+='<div id="' + carouselId +'" class="carousel slide" data-ride="carousel"><div class="carousel-inner">';
             }
            $.each(items.templateItems, function(index, item) {
                 if(items.carousel){
                      template+= '<div class="jsm-generic-template carousel-item ' + (index == 0 ? 'active' : '') +'">';
                      template+= '<img src="' + item.imageUrl + '" class="d-block w-100" alt="' + item.title + '">';
                      template+= '<div class="carousel-caption carouselCaption d-md-block">';
                      template+= '<p><b>' + item.title + '</b></p>';
                      template+= (item.subtitle!=undefined && item.subtitle!="") ? '<p>' + item.subtitle + '</p>' : "";
                      $.each(item.buttons, function(index2, button) {
                        template+= '<button class="hoverforallbuttons buttonforgenerictemplate jsm-button" data-id="' + index +'" style="vertical-align:middle"><span>' + button + '</span></button>';
                      });
                      template += '</div></div>';
                      carouseIndicator+= '<li data-target="#' + carouselId + '" data-slide-to="' + index + '"' + (index == 0 ? ' class="active"' : '') + '></li>';
                  }else{
                    template+= '<div class="jsm-generic-template withoutcarouseldiv"><img src="' + item.imageUrl + '" class="d-block withoutcarousel-image w-100" alt="' + item.title + '">';
                    template+= '<div class="d-md-block"><h6 class="mt-3">' + item.title + '</h6>';
                    template+= (item.subtitle!=undefined && item.subtitle!="") ? '<p class="textbelowimg">' + item.subtitle + '</p>' : '';
                     $.each(item.buttons, function(index2, button) {
                        template+= '<button class="buttonforgenerictemplate hoverforallbuttons jsm-button" data-id="' + index +'" style="vertical-align:middle"><span>' + button + '</span></button>';
                    });
                    template+= '</div></div>';
                }
            });

            if(items.carousel){
                template+='</div>';
                carouseIndicator+= '</ol>';
                //  Left and right controls
                template+='<a class="carousel-control-prev" href="#' + carouselId + '" role="button" data-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Previous</span></a>';
                template+='<a class="carousel-control-next" href="#' + carouselId + '" role="button" data-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span></a>';
                template+=carouseIndicator;
                template+='</div>';
            }else{
            template+='</div>';
            }
            this._addNewContent(this.options.leftUser, $(template), options.timestamp);
            var $templates = this.$element.find('.jsm-generic-template-wrapper:last .jsm-generic-template');
            // Adjust width of items
            //var width = this.$element.width();
            //$templates.css('width', 'calc(' + width + 'px - 6em - 4px)');

            // Adjust height of titles
            var $titles = $templates.find('.jsm-title');
            $titles.css('height', Math.max.apply(Math, $titles.map(function() { return $(this).outerHeight(); })) + 'px');
        } else {
            this.options.script.push({
                method: 'showGenericTemplate',
                args: [ items, this._clearOptions(options) ],
                delay: options.delay
            });
        }
    }

    SPHPlugin.prototype.scrollGenericTemplate = function(itemIndex, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var $scroller = this.$element.find('.jsm-generic-template-wrapper:last');
            var width = $scroller.find('.jsm-generic-template:first').outerWidth(true) + 2;
            $scroller.find('.jsm-generic-template').removeClass('jsm-selected');
            $scroller.find('.jsm-generic-template:nth-child(' + (itemIndex + 1) + ')').addClass('jsm-selected');
            $scroller.animate({
                scrollLeft: itemIndex * width
            }, 250 * this.options.timeScale);
        } else {
            this.options.script.push({
                method: 'scrollGenericTemplate',
                args: [ itemIndex ],
                delay: options.delay
            })
        }
    }

    SPHPlugin.prototype.selectGenericTemplate = function(buttonIndex, options,callback) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            var $button = this.$element.find('.jsm-generic-template-wrapper:last .jsm-generic-template .jsm-button:eq(' + buttonIndex + ')').addClass('jsm-selected');
            var buttonText = ($button.text()!="") ? $button.text() :  this.$element.find('.jsm-generic-template-wrapper:last .jsm-generic-template .jsm-button:eq(' + buttonIndex + ')').text();
//            setTimeout(function() {
//                $button.removeClass('jsm-selected');
//            }, 1500 * this.options.timeScale);
            //this.message(this.options.rightUser, buttonText, { timestamp: false });
            var now = new Date();
            this.message(this.options.rightUser, buttonText, { timestamp: now });
            callback(buttonText);
        } else {
            this.options.script.push({
                method: 'selectGenericTemplate',
                args: [ buttonIndex, this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }

    SPHPlugin.prototype.showAttachmentTemplate = function(user, items, options) {
        if (options === undefined || options.delay === undefined) {
            this._checkWelcomeMessage();
            this._checkUser(user);
            this.options.targetId = (items.templateId != undefined)  ? " " + items.templateId : "";
            var sideClass = user === this.options.leftUser ? 'jsm-left' : user === this.options.rightUser ? 'jsm-right' : '';
            var externalLink = (items.externalLink!="" && this._checkValidUrl(items.externalLink)) ? items.externalLink : "";
            var attachTemplate ="";
            attachTemplate+= '<div class="jsm-chat-message jsm-image-attachment outercarouseldivimg ' +
             sideClass +
             ' '+
             (options.className || '') +
             '">';
             if(items.templateText !== undefined && items.templateText !== ""){
                   attachTemplate+= '<p class="textabovetemplate">' + items.templateText + '</p>';
               }
             attachTemplate+= '<div class="jsm-image">';
             let modalParam = (items.isShowModal !== undefined && items.isShowModal) ? 'data-target="#chatModal" data-toggle="modal"' : "";
             attachTemplate+= '<img ' +  modalParam + ' src="' + items.attachUrl +'" alt="' +  (items.modalText !== undefined && items.modalText!="" ? items.modalText : '') + '" />';
             if(items.isDownloadable !== undefined && items.isDownloadable){
                var fileName = items.attachUrl.split("/").pop();
                 attachTemplate+= '<div class="jsm-share"><a href="' + items.attachUrl +'" target="_blank" download="' + fileName + '"><span class="downloadImg"><img src="' + this.options.downloadIconUrl + '" /></span></a></div>';
              }
             attachTemplate+= '</div>';
             if(externalLink!="" && items.externalLinkText !== undefined && items.externalLinkText !=""){
                attachTemplate+= '<br/><a href="' + externalLink + '" target="_blank">';
                attachTemplate+= items.externalLinkText;
                attachTemplate+= "</a>";
             }
             attachTemplate+= '</div>';

            var $content = $(attachTemplate);
            this._addNewContent(user, $content, options.timestamp);
        } else {
            this.options.script.push({
                method: 'showAttachmentTemplate',
                args: [ user, items, this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }

    SPHPlugin.prototype.annotateTemplate = function(annotation, options, index) {
        if (options === undefined || options.delay === undefined) {
            var $last = this.$element.find('.jsm-chat-row:last .jsm-chat-message');
            var posY = $last.offset().top - this.$element.offset().top;
            var posX = $last.offset().left - this.$element.offset().left;
            var $annotation = $('<div class="jsm-annotation ' +
                    this.options.annotationClass + ' ' +
                    ($last.hasClass('jsm-left') ? 'jsm-annotation-left' : 'jsm-annotation-right') +
                    '">' + annotation + '</div>'
                );
            this.$element.find('.jsm-annotation-container').empty().append($annotation);
                        $annotation.css('top', posY - $annotation.outerHeight() - 20);
            $annotation.addClass('jsm-annotation-top'); // TODO is there a case where the annotation does not fit above?
            $annotation.css('left', Math.max(0, posX - $annotation.outerWidth()));

            var next = this.options.script[(index + 1) % this.options.script.length];
            var displayTime = 2000;
            if (next && next.delay) {
                displayTime = Math.max(0, next.delay - 200);
            }
            setTimeout(function() {
                var $newAnnotation = $annotation.clone(true);
                $newAnnotation.addClass('fade-out');
                $annotation.before($newAnnotation);
                $annotation.remove();
            }, displayTime);
        } else {
            this.options.script.push({
                method: 'annotateTemplate',
                args: [ annotation, this._clearOptions(options) ],
                delay: options.delay
            });
        }
        return this;
    }

    SPHPlugin.prototype.selectPersistentMenu = function(menuItem, options) {
        if (options === undefined || options.delay === undefined) {
            var $container = this.$element.find('.jsm-persistent-menu');
            var level = $container.data('level') || [];
            var currentLevel = level.length;
            var currentMenu = this.options.persistentMenu;
            if (level[0] !== undefined) {
                currentMenu = currentMenu[level[0]].children;
                if (level[1] !== undefined) {
                    currentMenu = currentMenu[level[1]].children;
                }
            }
            $container.find('.jsm-persistent-menu-page').removeClass('jsm-has-overlay');
            var direction = 0, $page;
            if (currentLevel > 0 && menuItem === -1) {
                direction = -1;
                $page = $container.find('.jsm-persistent-menu-page:nth-child(' + currentLevel + ')');
                $page.find('.jsm-persistent-menu-entry').removeClass('jsm-selected');
                level.pop();
            } else {
                var $menuItem = $container.find('.jsm-persistent-menu-page:nth-child(' + (currentLevel + 1) + ') .jsm-persistent-menu-entry:eq(' + menuItem + ')').addClass('jsm-selected');
                if ($.isArray(currentMenu[menuItem].children) && currentLevel < 2) {
                    direction = 1;
                    $page = $container.find('.jsm-persistent-menu-page:nth-child(' + (currentLevel + 2) + ')').empty();
                    $page.append('<div class="jsm-persistent-menu-title">' + currentMenu[menuItem].label + '</div>');
                    for (var i = 0, max = Math.min(5, currentMenu[menuItem].children.length); i < max; ++i) {
                        $page.append('<div class="jsm-persistent-menu-entry"><div class="jsm-persistent-menu-text">' + currentMenu[menuItem].children[i].label + '</div></div>');
                    }
                    level.push(menuItem);
                } else {
                    setTimeout(function() {
                        $container.find('.jsm-persistent-menu-entry').removeClass('jsm-selected');
                    }, 500 * this.options.timeScale);
                    this.message(this.options.rightUser, currentMenu[menuItem].label, { timestamp: false });
                    if (currentLevel > 0) {
                        $page = $container.find('.jsm-persistent-menu-page:first');
                        direction = -currentLevel;
                        level = [];
                    }
                }
            }
            $container.data('level', level);
            if (direction !== 0) {
                var that = this;
                setTimeout(function() {
                    if (direction > 0) {
                        $container.find('.jsm-persistent-menu-page').not($page).addClass('jsm-has-overlay');
                    }
                    $container.animate({
                        scrollLeft: $container.width() * (currentLevel + direction) ,
                        height: $page.height()
                    }, 500 * that.options.timeScale);
                }, 250);
            }
        } else {
            this.options.script.push({
                method: 'selectPersistentMenu',
                args: [ menuItem, this._clearOptions(options) ],
                delay: options.delay
            });
        }
    }

    SPHPlugin.prototype.setLocale = function(locale) {
        this.options.locale = locale;
        var that = this;
        this.$element.find('[data-jsm-loc]').each(function() {
            $(this).html(that._localize($(this).attr('data-jsm-loc')));
        });
    }

    SPHPlugin.prototype.run = function() {
        if (this.options.script.length === 0) {
            $.error('script is empty');
        }
        var that = this;
        var schedule = function(index) {
            if (index > that.options.script.length - 1) {
                if (typeof that.options.endCallback === 'function') {
                    that.options.endCallback();
                }
                if (that.options.loop) {
                    that.reset();
                    index = 0;
                }
            }
            that = that._clearOptionsScript();
            var item = that.options.script[index];

            if (item) {
                setTimeout(function() {
                    var args = item.args.concat([index]);
                    SPHPlugin.prototype[item.method].apply(that, args);
                    if (typeof that.options.stepCallback === 'function') {
                        that.options.stepCallback(index);
                    }
                    schedule(index + 1);

                }, item.delay * that.options.timeScale);
            }
        };
       schedule(0);
    }

    SPHPlugin.prototype.reset = function() {
        this.$element.find('.jsm-quick-replies-container').addClass("jsm-hide").empty();
        this.$element.find('.jsm-alert-container').empty();
        this.$element.find('.jsm-chat-content > :not(".jsm-annotation-container,.messagesendarea,.floaterbuttons,.jsm-quick-replies-container")').remove();
        this.$element.find('.jsm-bot-welcome-message,.jsm-get-started').removeClass('jsm-hide');
        this.$element.find('.jsm-input-message').addClass('jsm-hide');
        this.$element.find('.jsm-chat-content')[0].scrollTop = 0;
        this.options.state.welcomeMessageDisplayed = true;
        this.options.state.quickRepliesDisplayed = false;
    }

    $.fn.sphChatbot = function(options) {
        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                if (!$(this).data(SPH_DATA)) {
                    $(this).data(SPH_DATA, new SPHPlugin(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.each(function() {
                var plugin = $(this).data(SPH_DATA);
                if (plugin instanceof SPHPlugin && typeof plugin[options] === 'function') {
                    plugin[options].apply(plugin, args);
                }
                return $(this);
            });
        }
    }
}(jQuery));