$(function(){
    var ajaXRequest = globalVariable.ajaXRequest;
    var getRequestObj = globalVariable.getRequestObj;
    var attachForm = $(globalVariable.chatElement.attachForm);
    var inputAttach = globalVariable.chatElement.inputAttach;
    var divBotChatWrapper = globalVariable.chatElement.divBotChatWrapper;
    var uploadDropArea = globalVariable.chatElement.uploadDropArea;
    var uploadDiv = globalVariable.chatElement.uploadDiv;
    var progressBar = $(document).find(globalVariable.chatElement.uploadProgress);
    var makeRequestObject = globalVariable.makeRequestObject;
    var successMsg =  globalVariable.successMsg;
    var bytesToSize = globalVariable.bytesToSize;
    var uploadProgress = [];
    const validImageMimeTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/jpg', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/webp'];
    const validDocMimeType = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validPDFMimeType = ['application/pdf'];
    const validExcelMimeType = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

        var preventDefaults = function(e) {
          e.preventDefault();
          e.stopPropagation();
        };

        var highlight = function(e) {
           e.addClass('highlight')
        };

        var unhighlight = function(e) {
           e.removeClass('active')
        };

        var handleDrop = function(e) {
           var dt = e.dataTransfer;
           var files = dt.files;
           handleFiles(files);
        };

        var initializeProgress = function(numFiles) {
              progressBar.val(0);
              uploadProgress = [];

              for(let i = numFiles; i > 0; i--) {
                uploadProgress.push(0)
              }
        };

        var validateFiles = function(file, i){
             console.log(this);
             console.log(file.size);
        };

        var updateProgress = function(fileNumber, percent) {
          uploadProgress[fileNumber] = percent
          let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length
          //console.log($(document).find("#progress-bar").length)
          $(document).find(globalVariable.chatElement.uploadProgress).val(total);
        };

        var handleFiles = function(files,e) {
             files = [...files]
             var isValid = true;
             for (let i=0 ; i<files.length; i++) {
                  if(files[i].size > $(e).data("size")){
                     $(e).parent("form").append('<div class="alert alert-danger" role="alert">File Size too big. Allowed file size is ' + bytesToSize($(e).data("size")) + '</div>');
                     $(".alert-danger").fadeTo(1000, 0).slideUp(1050, function(){ $(this).remove();});
                     isValid = false;
                     break;
                  }
             }

             if(isValid) {
                 initializeProgress(files.length);
                 files.forEach(uploadFile);
                 files.forEach(previewFile);
                 attachForm.find(inputAttach).css({"top" : ""});
              }
       };

       var createPreviewElement = function(imgSrc){
          let img = document.createElement('img')
          img.src = imgSrc
          img.style.width = "50px";
          img.style.height = "50px";
          document.getElementById('gallery').appendChild(img);
       };

       var retrieveDataURI = function(fileType){
            var dataURI  = "data:image/png;base64,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";
            if(validPDFMimeType.includes(fileType)){
                dataURI  = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAACdlBMVEUAAADoTDn//////v7//v3//f3//Pz/+/v/+/r++vr++fn++fj++Pf+9/f+9/b+9vX+9fT+9PP+8vH98vD98fD98O/97+397uz97ez97ev97Or96+n96uj86Ob85+X85uT85OH84+D84t/74d774N3739z739v73tv73dr73dn73Nj729j72tf72tb72dX62NX62NT619P61tL61tH61dH61ND608/608760s760c350Mv5z8r5zsn5zMf5y8b5ysX5ysT4yML4xsD4xb/4xL74w734wbv4wbr4wLn4v7n3vrj3vrf3vLb3vLX3u7T3urP3uLH3t7D2tq/2ta72ta32tKz2s6z2sqv2sqr2san2sKj2rqb1rqX1rKT1q6P1q6L1qqL1qaH1qaD1qJ/1p571pp30pJv0o5r0oZf0oJf0n5X0npT0nZTznZPznJLzm5HzmpDzmY/zmY7zl43zlozzlovylIryk4jykofykYbykIXyj4Tyj4PyjoPyjYLyjYHxjIDxin/xin7xiX3xiHzxhnrxhnnxhXnxhHjxg3fwg3bwgnXwgXXwgXTwgHPwf3LwfnHwfXDwfG/we27vem3vemzveWvveGvveGrvd2nvdmjvdWjvdWfvdGbvc2Xvc2TucmTucWPucWLucGHub2HubmDubl/ubV7ubF7ubF3ualvtaVrtaFntZ1jtZ1ftZlftZVbtZVXtZFTtYlPtYlLsYVHsYFDsX0/sXk7sXk3sXU3sXEzsW0vsW0rsWknsWUnrWUjrWEfrV0brVkXrVUTrVEPrVELrU0LrUkHrUkDrUT/qUD/qUD7qTz3qTjzqTTzqTTvqTDpkLq/5AAAAAnRSTlMAUB34nMwAAAUsSURBVHja7Zr9WxRVFMdpFlgWFOQlAQEF7HXdEtPaisgk0IwCEjMjiiJSeyNTyTYrTTdSKIzAiKzVNF9RXnxBFIjYYEV33ZnzH/V0z7ztssrO7Hrv0/PM+WHnzmVmv5+9c+6559whBhhbjAFgABgABoABYAD8rwF8va2tQ+wA+irmchzHlZxgAyB8msCJlneNBcAmTrG8MfoAhzm1racP8EwAQCZ1gGETEU62ZyDBNG0AB5FN/wuuMAKoIrKNABdJwyLQBlhCdDsAjpDGQuo+kE50hwBaSeMp2gBeImvmAT4jrUraAKNENhsAGiRnoAuArpcPAC+SloM2wACRXQwAy0jrZ9oAF6QRENIkb6QLcI3IZgGMkMZcgTbATaIbz0MnadjoL8c48sPQFOks1AtgJcLdsJYct9IHWEOEt0MBOfbQB9iCQ+8mB9MkfYAfiXJhBx4YJKXjmAa8Rj6rWGTF+aqEzMEC4BUVQB8LgH2qjFRgATBukgHWsKmMlkXHBfQDvC8DXGYD0C/pF7Cqjh8RAWpZAWwXAbpYAbhFAB+zDQoR4G9WAB4R4C1WALtFgERG01DZIVjNBuCSEosPMQFoVFaj/BsMAHxZqvW4gQGAU71FFHecPsByolyC2wNcIfUtmj9QuA3KsbGRNgDqLvTD2L1I0E4XYDBWrohaECDjClUATElTSUHyEhKs8FEEGMJ96npyMrkoorxAF8B6XARG8OyYGQm+oQZwGQdgg3S+FQGS/qQFUE30EuR9GaEMCXKu0gHoiyNyNUrPJFbpnO06FQCMARb1vDs3DwlK/RQAfg/l9D+Ii/NG4a4DCFgSpQS9pflYLhNyM+dn5hYsLXm50dEzfhcA9qLOJqWHv9DyXlkBF9KyntvcfTOqAJ4c3Cb24HAM7ql9PIW7syWt/OKf6AG8i1+6C4A/+UnpfC48S6rujxLAAMYg65CjPJ3TYnGvuqMBIJRwui33SBQAnHcQyLZXrZLa3/Ufbd/5Tvn9ZvUFlv0RA7hDS6c+seFzF/Gz7kTsSfkVb/Ae31aWJl8X3x4ZgLt5prZleZ1zUBV8Doq/eU6H3OXvqU4Sr04+rx9AcFUkBrt28ZbfvMHXHYjHP5r3qTpH14mBsojXCeD9yhqkXljXGbocaREJuA/VUblLfMP6rS6AqabsAHHTiqbB2199QPK8SjVhbyrpe1YHwPRHGQHy1h2z/LvAQemR2y6qer9G3/BrBeB35wSO/Zezj9jhVGl6OJXOWwtI1yWNAKcfC3r2NeG4zFkZevVYUBpxUhOAtyEuSH+RJyynHbZJN6Q1i+m68BA5P6cFoPfBGRHdFeasna5QmHdM/BdE6tF/pzQA7Jkjf8kSbkYWMFvcaLYo3EVl0pO0hj8L+Dfl+22dxdiwa0n5Ti0OEbWbwwbwrZXuydjF1+qq/27UB3tQqF9wGwB/uXTPC+PiK3rO9JPW9O3Mk4H6j06EvRbUibfMcwK0YSnMbdaewQvtSxX52Nenw14N26SIPwDQIy5CpbyeyktwrcOgkFVzPvyEZEqM/XY3gEvMOR+Y0r0JMnqs++hVQUtOiK8luaevA/ySLObXke2HasuK/Ri275sEcEopzgmgCIDFV+xpuPW2lPgcApoA23ALDk5JLmz+HqgCYPHx8CppNzihDegCNAaGj5QuoAywM0A/7wzQBjir1n9+AqgDgF0pd/YKwABgpAjlF3zgAWABAPz+SnvxG51+AEYAFM0AMAAMAAPAADAADAADwACIuYexxRhmGGv7F/t1iZCsud5oAAAAAElFTkSuQmCC";
            }else if(validExcelMimeType.includes(fileType)){
                dataURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAACKFBMVEUAAAAAAAAAfwAAVVUAfz8AZjMAfyoAbUgAfz8AcTgAfzMAc0UAaj8AdToAdzMPbz8PeDwOcTgNeDUMcj8MeTwLbjcJdToJcTgJdjYIcj0IdzsIczkHdzcHcz0HcDwHdDoHcTgGdT4GcjwGdToGdjcGczwFdjsFczkFcTgFcTsKdDoKcjkKdT0JczkJdjgJczwJcTsIdDoIcjkIdDwIcjsIdToIczkIdTwHcjwHdDwHcjsHdDwGczsGdToGczkGdTwGcjoJcjwJdDsJczkIczsIcjwIdDsIcjoIdDoIczwIdDsIczsHdDoHdTsHczwHczoHdDoHczwHczsHdDoGczkGcjsJdDsIczsIczoIczsIczsIcjoIdDoIczsIczoIdDoHczsHdDsHdDoHczsHdDsHdDoHdDsHczoHdDsIdDoIdDsIczsIczoIczsIczoIdDoIcjsIdDkIczoIdDsIczsGdDoGczsHdDsHdDsHdDkHczoHczsHcjoIcjsIdDsIdDkIdDkIczoIcjsIcjoIdDoGczoGdDsGdDkGdDsHczsHdDsHczsHdDkHdDsHcjsIcjoIdDsIczkIdDkIdDsIcjsIdDkIcjoIcjsIdDkIczsGdDsGcjkGdDkGcjsGdDsGcjsGdDkGcjoGdDsGdDsGczkGdDkGcjsHdDsHcjkIcjsIdDsIdDkIdDkIcjsIdDsIcjkIdDkIcjsIdDsIcjkIdDkIcjsIdDsIdDuQOJINAAAAt3RSTlMAAQIDBAUGBwgJCgsMDQ8QERITFBUXGhscHR4fICEiIyQlJicpKissLS8wMTI1Njc4OTo7PD0+P0NERUhJSktMTlBRVFZZWltcXV5fYGJmaGlqbG1ub3BzdXd5ent8fn+AgYOEhYiKi46QkZKUlpiZmpydnp+io6SnqaqsrrCxsra3ubu8wMHDxcnKy8zOz9HS1NXX2Nna3N7f4OHi4+Tl5ufo6err7O3u8PHz9PX29/j5+vv8/f4e4QulAAADfUlEQVR42u2b91cTQRDH7xJiAhpEQLCggEaMoqhYQGNHFBFEBbuCFSt2UawoFkTAhl2iiApRmiEh/54P9EUC37vskd2Lvjfz486w38+72zIzFyRfmE0iAAIgAAIggH8KoGyVLnZUEcAh6WI5BEAABEAABEAABEAAWgCWuZAdANNO+YwiP6WG+gROoUTOnTYsznAfpnwbQ34FlkY0b61haFwx1D/DYQ1M70AzFw2JSu1CUfUWHoswH039PSEgxliLgtqT+OyCy2jy6wEhO+ELWMFpG1pfodlXD4qw9aCIQ9zOgTk/wfTNVr8/4hHSrzHyO4hKkMBJv3sPcjvjOZ6E8m2g0Jfxx2t3A2/vAq5HcawTaDwxDfhMDegBbOd8FyzxApHdA64ypF8l876MSoFKd7IkSem9wNNk5X4bGtFZXyNL5qdgvDNNwHWc+A3eNYfRC9ggJB9YCZS+LveA0QpBCclxtBfBWJ1ZEIC5nqnr0zZZWEqW8oNBv88hCQOQ1jMAHBSalF4Mqn/XKBRgdFMQ/eY4wWn5rB5Vffd84XXBVlWAYvGFiXxDRf+qrENlFPNeUf/FGF1Ks4UeBf2OGTrVhnsVAHL1Kk6N96D+af2q4xSk32rWDUCuGvkW5AKwS+EQmqcTwFKvwiL8EKsLQFKb4jlwx6ADQFSjykm4XzyAXKmajGQLByhRv41bEwUDZHmC5AMPTUIBJn4JmhEdEwlgqWPICdeIA5AvsGTlrmRhAEVsX4MbIwUBZKI+xFswdk4MQEIL0Do/yQVG80UAjEKdwOdRUi4Y7rILAKhAQv1tgCvA8dLKHaAQLbfCfk/0O40dmhEBZKBOYeVvlcXoet7GF2C8U+05H9GYnWgHMD0AEj2z/e7H2rIT7QAn0ALY8tc/rRP4qw3cAPKQ/rXBy2wzitjHCyC9G8z+JjrglrgJQrzZfADi0DZzzw0Mim/RkJ1oA4iAZdCOoWEODdmJNoByNPMtme3rWnnoAOtgATBueGDkM+bsRAuAHW0wTyZs3qDD0jU1NICY1z7FLv0wgx+uGiyhABirtdQ/Brhcz4YCADvhHxW/BU1o9zFlJ8wAa9F83izGW8afNMwcKYANdoZL1VKNSz6WryesAFkFwPJUO7FW9CcFNvoFBQEQAAEQAAEQwP8DkDNWF9tE/2NCAARAAARAAAEAi8JsEhlZuO0XP/gzfVjTJ9IAAAAASUVORK5CYII=";
            }
            else if(validDocMimeType.includes(fileType)){
                  dataURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAACZFBMVEUAAAAAAP8Af38AVao/f78zZswqf6okbbYff78cccYZZrIuc7kqar8ndbAkbbYid7sfb78eeLQoa7smcr8kbbYic7khbrwfdL8ecLcndbolcbwkdrYibrsgc70fb7clcLskdL0jcbgidbohcrsfcrgkc7wjcLcic7khcbohdLwlb7kkcrsjc7kicLohc7shcbglc7kkcbojcrgicrslc7kjc7sicrohcLshcrgkcLkjcrojcbsic7kicbohc7ohcrgjcrojcrgicbkic7ohcbskcroicbkicrohcbokcbkjcbsicLkicrkicbohcrgkcbkjcbojc7kicbkicLokcbkjcrkjcboicbkicroicbokc7kjcrkjcbojcroicrkicrsjcbkicbkicboicrojcbkjcrkjcbojcroicbgicrojcbkjcrkjcroicbkicrkicLoicbojcrkjcbgicrojcLkhcboicrkicbgicrojcbojcLojcrohcrkicrojcbojcrkhcLoicrkicrojcrkjcbkjcrohcboicLgicrojcLojcbkjcrgjcbohcrkicbgicrojcLojcrkjcLgjcbohcrohcbkicrgicbojcrojcrohcLohcrkicrgicbojcrojcrghcLgicrojcrojcbkjcrgjcbohcrohcLkicrgjcLojcLgjcbghcLkhcrgjcrojcLkhcLohcboicLgjcrojcLkjcrgjcLohcrohcLghcrgjcrojcLojcrgjcLghcrohcrgicLojcrojcrgjcLghcrohcLohcrghcLgjcrojcLojcrgjcrrHlhFwAAAAy3RSTlMAAQIDBAUGBwgJCgsMDQ4PEBETFBUWFxgZGhscHh8gIiMkJSYoKissLS4wMTM0NTY3ODo8PkBDREVGR0hJSktMTlBRUlNVWFlaXF5fYGFiY2VmZ2hqa2xub3BxcnN0dnh5fH5/gIGCg4WGh4iKi4yNjo+QlZaZmpucnZ+goaOkpaipqqytrq+xsrO0tba3uLm6u7y9vr/AwcLExcbHyMnLzs/Q0dLT1NXW19na3N3f4OLj5ebn6Onq6+zt7u/w8fP09fb3+Pn6+/z9/rh4FKcAAASASURBVHja7ZvlV5RBFMbnXURZRSxULOzAQrALMBBBEBVbVMTGLrAbO7EQu9dEsDtQ8p/yLLjs3Dt3lrcOq+fMfGPmuc/+Nt65d+4cWJWfB1MACkABKAAF8E8BrIitl7FKChDL6mWMUwAKQAEoAAWgABSAAlAACkAB1AEQOBuOJNpmLCcZTCq0NGiUqvcTeAjPLpWtKPcG7zjJNRKgNzoE5eoFWI0CJ1Huw4AkjJJkIJ/JegEGocCdlHs2kMygJNehza8QvQCOVzCyWBPNAz8AyRni9VtXQpuj+p+Cbegj6CO6j4KK0maiJAW5JOoHiEGhC0X3HUiSIEpyZYx1AwR9h7HnBfOGnxHAAUES9AMqThjZiA6jn09jYRPAfYZvQVgyBimmGAFIQsFjsPtuodMxFku2wvWyFkYAWlXA6M3IvNFXASAHb4NFcP20sVxwBUY/Ru5xYq/nbQCU9EPrU40BLEDhHaH7XqLbhPJBJlwtb2kMoAtynwbMnd8IgPUQ4BZcPWs0HT+C8YeA+Xiq3/Yc7JftfLwDXQAoIX1pwLvvJzt+EbxkOvoGQo0C4IQUzRk0+UECZPIAx+FanuGKyPEaOiznDOLpnucdTtK4BK6lGS/JYLqtus4tHZJ0XcOlz2lFG+MAKCFVeDey4BIJwDxvdA5cuWSiKMW5JL52JUHWd74s/QJnmamKUTbdXrtwRAZQUftTH4iqyjAzAFOgSZHnMQ/5JW29p3hiV8L5fFPnApyQev6dT5T3/o95Yu/C+TnmDiYoIc2nnvCyj6BuCK6RdERg7c0BpFdRdWfzUn7yJHxaJ9ZoZsHIApNHs67QpsRZPZsMJpNgcbqnJvIM/dkZPhuihDSyevIUP/W7GSwOPwe6JU1/+8zl+gFQQtrgnmtZxk8dwcXZCLdmAoy7Yfp0HAWNHrrnUvGhDW66W9yaXXUU9boB8H7WgTF2jp/4GcxYEChOih2MBbyXpgij/YFsoawLLecnDorFQSRj0TDqloUGRYxw+JghPnUwOWcxlgWjFlkAcMKE9CmAXQSHEaeYHB8LD08XKy0alJAGtQXb8z4qOfXoDGNuW+oRoYSUCbe4OCo5LJ4LYzIsAaCEVADSw5dG1OZ8Mw8CdLfWJcuHCb+SbJycggUw+OuexTZduo+L99EeUaoP0RKLAN3k1h8Ca7+ocrmqh9VGpUtqne0VXZCKHljulGZJvYd5RTOloqWWAaJk1m+5w1pYpUzVyzKA443EeguvuioRuWxoVudIvIfwovkS0QobAGJpa3fe9Y5OEoAIGwCc9FF4k892xN/xRLPjviCX9I6CosWkaJUtFxbJlHWhpmfD6msLAD4hVY+1WHWfED3T7LmyySe8+2PRMkK0xqY7o3Q9762PHkqTAN30/Lq0p4LohWbXrZlLz/MtJo11tl3bCd4u4r0NEAAibQOI0pPjtEIkeqnZBiAkJKrKYBuRaKONN6fDk8FIIEXhUJQcru6OFYACUAAKQAEogP8RID64XkbCv/svHgpAASgABaAA/AIw1M+DqaGGv8cfVEoHM4kNrzsAAAAASUVORK5CYII=";
            }
            return dataURI;
       };

      var previewFile  = function(file) {
         let reader = new FileReader();
         if (!validImageMimeTypes.includes(file.type)) {
                var getDataURI = retrieveDataURI(file.type);
                createPreviewElement(getDataURI);
         }else{
             reader.readAsDataURL(file);
             reader.onloadend = function() {
                createPreviewElement(reader.result);
             }
         }

      };

       var uploadFile = function(file, i) {
             var formData = new FormData();
             getRequestObj = makeRequestObject("Upload File");
             formData.append('uploadFile', file);
             formData.append('data', JSON.stringify(getRequestObj));
             formData.append('uploadFileCounter', i);
             ajaXRequest(formData,true,function(status){
                  if(status){
                    //$(uploadDiv + ":last").closest("div.jsm-user-wrapper.bot").remove();
                    //$(uploadDiv + ":last").closest(divBotChatWrapper).remove();

                     if($(divBotChatWrapper + ":last").find(".jsm-chat-row").length==1){
                        $(uploadDiv + ":last").parent().prev(".jsm-user-icon:first").remove();
                     }
                     $(uploadDiv + ":last").parent().remove();
                     if ($(divBotChatWrapper).last().prev().html().length == 0) {
                     	$(divBotChatWrapper).last().prev().remove();
                     }

//                    $(uploadDiv + ":last").parent().prev().remove();
//                    $(uploadDiv + ":last").parent().remove();
                    //$(uploadDiv + ":last").parent().remove();
                  }
             });
        };



        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(eventName => {
             $(document).on(eventName,uploadDropArea,function(e){
                preventDefaults(e);
                return false;
             });

             $(document).on(eventName,"body",function(e){
                 preventDefaults(e);
                 return false;
             });
         });


         // Highlight drop area when item is dragged over it
         ['dragenter', 'dragover'].forEach(eventName => {
              $(document).on(eventName,uploadDropArea,function(e){
                  highlight($(this));
                  return false;
               });
         });

        ['dragleave', 'drop'].forEach(eventName => {
              $(document).on(eventName,uploadDropArea,function(e){
                unhighlight($(this));
                return false;
             });
        });

        // Handle dropped files
       $(document).on('drop',uploadDropArea,function(e){
            handleDrop(e.originalEvent);
            return false;
       });

       $(document).on('change',inputAttach, function(e){ handleFiles(this.files,this) });

});