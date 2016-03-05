(function ($) {
  Drupal.behaviors.MMextra_front = { 
    attach: function(context,settings) {
      /*$('.views-row').click(function(){
        window.open($(this).find('.fb-user a').attr('href'));
      });*/
      var baseurl = window.location.protocol + '//' + window.location.hostname;

      function trackOutboundLink(link, category, action, nid) {
        //internal tracking:
        $.post(baseurl+'/adclick', 'nid='+nid);
        //google tracking:
        try {
          _gaq.push(['_trackEvent', category , action]);
        } catch(err){
          var dummyvar = 1;
        }        
        //open ad window:
        window.open(link);          
      }
      
      //track views of each nowad
      var nid_string = '';
      //var nid_array = new Array();
      var uid = '';
      var pathArray = window.location.href.split( '/' );
      var uidRegex = /^[1-9][0-9]*$/;
      if(uidRegex.test(pathArray[4])) {
        uid = pathArray[4];
      }     
      $('.views-row').each(function(index){
        //nid_array[index] = $(this).find('.views-field-nid .field-content').text();
        nid_string += $(this).find('.views-field-nid .field-content').text()+'-';
        //nid_string += $(this).find('.views-field-field-local-biz .field-content').text()+'-';
      });      
      if(nid_string != '' && uid != ''){
        $.post(baseurl+'/adview','adview-string='+uid+'_'+nid_string);
      }
      //the following sends an array, but I want to check the whole thing at once in my php regex.
      //$.post(baseurl+'/adview', { 'nids[]': nid_array });        
      
      //change styling for twitter embeds
      $('.views-row').each(function(){
        //I decided to add a class called facebook-row to each views-row so that if javascript was
        //broken and the twitter embed therefore wasn't coming, in, we would style the row like facebook.
        //When javascript works we remove the class from the twitter rows and hide the banner, biz name, posted time etc.
        if($(this).find('.twitter-embed-container').length){
          $(this).removeClass('facebook-row');
          $(this).find('.views-field-field-banner-pic').hide();
          $(this).find('.views-field-created').hide();
          //$(this).addClass('twitter-embed-row');
        }else{
          //this is my shitty way to make sure the twitter iframe comes in at the right width. See below for more bs.
          $(this).css('padding','8px');
          //load small facebook icon
          $(this).find('.views-field-created').before('<img class="facebook-icon-small" src="/sites/all/themes/simp/images/icon-facebook-small.png">');
        }
      });
      //below are some other attempts to get the right width on the twitter iframe.
      /*setTimeout(function(){
        //this is fucked up
        $('iframe.twitter-tweet').attr('width','99%');
      }, 1000);*/
      /*$('.views-row').on("DOMNodeInserted",'iframe.twitter-tweet', function(){
        $(this).find('iframe.twitter-tweet').removeAttr('width');
      });*/

      //handle clicks
      $('.views-row').on('click tap',function(event){
        var link = $(this).find('.views-field-field-fb-page a').attr('href');
        var nid = $(this).find('.views-field-nid .field-content').text();
        trackOutboundLink(link, 'Outbound Links', link, nid);
        return false;
      });
      $('.views-row a').on('click tap',function(event){
        var link = $(this).attr('href');
        //var link = $(this).closest('.views-row').find('.views-field-field-fb-page a').attr('href');
        var nid = $(this).closest('.views-row').find('.views-field-nid .field-content').text();
        trackOutboundLink(link, 'Outbound Links', link, nid);
        return false;
      });
      
      //send iframe height data using HTML5 cross document messaging.
      if(window.self !== window.top){
        //var siteRegex = /^http:\/\/carsonnow\.org/;
        //if(siteRegex.test(document.referrer)){
        //this function posts a message with the height of the document so that the iframe can
        function postHeight(){
          var iframeHeight = $(document).height();
          //ad-group-first and ad-group-last split the ad column into two streams to surround an external ad that we get paid for :)
          var firstRegex = /ad-group-first/;
          var lastRegex = /ad-group-last/;
          if (firstRegex.test(window.location.pathname)){
            window.parent.postMessage('1_'+iframeHeight.toString(), '*');
          }
          else if(lastRegex.test(window.location.pathname)){
            window.parent.postMessage('2_'+iframeHeight.toString(), '*');
          }
          else{
            window.parent.postMessage(iframeHeight.toString(), '*'); //for backwards compatibility with previous iframe code.
            var adGroupRegex = /^\/user\/\d+\/ad-group\/(\d+)/;
            if (adGroupRegex.test(window.location.pathname)){
              window.parent.postMessage(adGroupRegex.exec(window.location.pathname)[1]+'-'+iframeHeight.toString(), '*');
            }
          }
        }
        // modern browsers
        if (window.addEventListener) {
          window.addEventListener('load', function(){
            postHeight();
            //wait 2 seconds, then post the height again, after twitter embeds are rendered.
            setTimeout(function(){
              postHeight();
            },2000);
          }, false);   
        }
        // older versions of IE
        else if (window.attachEvent){
          window.attachEvent('onload', function(){
            postHeight();
            //wait 2 seconds, then post the height again, after twitter embeds are rendered.
            setTimeout(function(){
              postHeight();
            },2000);
          });          
        }
      }              
    }
  };
}) (jQuery);
;
