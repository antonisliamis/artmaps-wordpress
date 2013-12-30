jQuery(document).ready(function(){ 

  google.maps.visualRefresh = true;
  var config = {
        "map": {
            "center": new google.maps.LatLng(51.507854, -0.099462), /* Tate Britain */
            "mapTypeId": google.maps.MapTypeId.ROADMAP
        }
    };
    window.main_map = new ArtMaps.Map.MapObject(jQuery("#artmaps-map-themap"), config);
    var autocomplete = jQuery("#artmaps-map-autocomplete");
    main_map.bindAutocomplete(new google.maps.places.Autocomplete(autocomplete.get(0)));
    //map.addControl(autocomplete.get(0));  
    
    (function() {
        var con = jQuery("#artmaps-map-object-container").children().first();
        jQuery("#artmaps-map-object-container").detach();
        ArtMaps.Map.UI.formatMetadata = function(object, metadata) {
            var c = con.clone();
            c.find("a").attr("href", ArtMapsConfig.SiteUrl + "/object/" + object.ID);
            c.find("a.artwork-link").attr("data-fancybox-href", ArtMapsConfig.SiteUrl + "/object/" + object.ID);
            if(typeof metadata.imageurl != "undefined") {
                c.find("img").attr("src", "http://dev.artmaps.org.uk/artmaps/tate/dynimage/x/65/"+metadata.imageurl);
            }
            c.find(".artmaps-map-object-container-title").text(metadata.title);
            c.find(".artmaps-map-object-container-artist").text(metadata.artist);
            //c.find(".artmaps-map-object-container-suggestions").text(object.SuggestionCount);
            c.find(".artmaps-map-object-container-suggestions").html('<i class="fa-question"></i>');
            return c;
        };
    })();
    
    (function() {
        jQuery(window).bind("hashchange", function(e) {
            jQuery.ajax(ArtMapsConfig.AjaxUrl, {
                "type": "post",
                "data": {
                    "action": "artmaps.storeMapState",
                    "data": {
                        "state": e.fragment
                    }
                }
            });
        });
    })();
    
  
  jQuery(".artwork-link").fancybox({
    maxWidth	: 800,
		maxHeight	: 600,
		type      : 'ajax',
		fitToView	: false,
		width		  : '90%',
		height		: '90%',
    autoDimensions : true,
		closeClick	: false,
		showEarly   : false,
		openEffect	: 'fade',
		closeEffect	: 'fade',
		helpers: {
    	overlay : null
    },
    beforeShow : function() {
      jQuery("#overlay").fadeIn();
      jQuery("body").addClass("fancybox-lock");
    },
    beforeClose : function() {
      jQuery("body").removeClass("fancybox-lock");
      jQuery("#overlay").fadeOut();
    },
    tpl : {
    	error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
    	closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"><i class="fa-chevron-left"></i> Back to results</a>',
    }
  });
  
  jQuery(document).on('mousedown touchstart', function (e) {
    var target = e.target;

    if (!jQuery(target).is('.popover') && !jQuery(target).parents().is('.popover') && !jQuery(target).is('.toggle')) {
      jQuery('.popover').fadeOut(150);
    }
  });
  
  jQuery( "#search-form-toggle" ).click(function(event) {
    jQuery('#location-search-form, #keyword-search-form, #search-label-places, #search-label-art').toggle();
    event.preventDefault();
  });
  
  jQuery( "#log-in" ).click(function(event) {
    jQuery('.popover').fadeOut(150, function() {
      jQuery( "#log-in-popover" ).show();
      jQuery( "#user_login" ).focus();
    });
    event.preventDefault();
  });
  
  jQuery( "#map-settings .toggle" ).click(function(event) {
    jQuery('.popover').fadeOut(150, function() {
      jQuery( "#map-settings .settings" ).show();
    });
    event.preventDefault();
  });
  
  jQuery( "#explore-map, #welcome" ).click(function(event) {
    jQuery('#welcome').fadeOut(300);
    event.preventDefault();
  });
  
  jQuery( "#how-it-works" ).click(function(event) {
    jQuery('#welcome').fadeOut(300);
    event.preventDefault();
  });
  
  // Perform AJAX login on form submit
  jQuery('form#loginform').on('submit', function(e){
      jQuery('form#loginform .loader').fadeIn();

      jQuery.ajax({
          type: 'POST',
          dataType: 'json',
          url: ajax_login_object.ajaxurl,
          data: { 
              'action': 'ajaxlogin', //calls wp_ajax_nopriv_ajaxlogin
              'username': jQuery('form#loginform #user_login').val(), 
              'password': jQuery('form#loginform #user_pass').val(), 
              'security': jQuery('form#loginform #security').val() },
          success: function(data){
              if (data.loggedin == true){
                  document.location.href = ajax_login_object.redirecturl;
              } else {
                jQuery('form#loginform .loader').delay(750).fadeOut(function() {
                  jQuery('#log-in-popover p.status').text(data.message).slideDown();
                });
              }
          },
          error: function(data){
              jQuery('form#loginform .loader').fadeOut();
              jQuery('#log-in-popover p.status').text("Could not connect!").slideDown();
          }
      });
      e.preventDefault();
  });
          
        var searchInput = jQuery("#keyword-search-form input.query-field");
        var searchForm = jQuery("#keyword-search-form form");
        var artistResults = jQuery("#artmaps-search-results-artists");
        var artworkResults = jQuery("#artmaps-search-results-artworks");
        
        var sanitizeTerm = function(term) {
            return term.replace(/[-,";:\(\).!\[\]\t\n]/g, " ")
                    .replace(/(^')/gm, "")
                    .replace(/('$)/gm, " ")
                    .replace(/('\s)/g, " ")
                    .replace(/(\s')/g, " ")
                    .replace(/\s+/g, " ")
                    .replace(/\*+/g, "*");
        }
        
        var displayArtists = function(data) {
            var list = artistResults.find("ul");
            list.empty();
            if(typeof data.artistsData == "undefined") return;
            jQuery.each(data.artistsData, function(i, a) {
                var link = jQuery(document.createElement("a"))
                    .text(a.label + (a.info ? " (" + a.info + ")" : ""))
                    .click(function() {
                        jQuery.ajax({
                            "url": "http://www.tate.org.uk/art/artworks?term=" + searchInput.val() + "&aid=" + a.id,
                            "dataType": "xml",
                            "async": true,
                            "success": displayArtworks
                        });
                    });
                var li = jQuery(document.createElement("li"));
                li.append(link);
                list.append(li); 
            });
        }
        
        var displayArtworks = function(data) {

            var art_list = jQuery(document.createElement("ul"));
            art_list.addClass("artmaps-map-object-list-container-page-body");
            artworkResults.empty().append(art_list);

            var doc = jQuery(data);
            var noresults = doc.find(".noresults").length > 0;
            if(noresults) return;
            
            var showing = doc.find(".listData").first().text();
            var currentPage = 1;
            if(doc.find(".pager-current").length > 0)
                currentPage = parseInt(doc.find(".pager-current").first().text().replace(",", ""));
            var totalPages = 1;
            doc.find(".pager-item").each(function(i, e) {
                var v = parseInt(jQuery(e).text().replace(",", ""));
                if(v > totalPages)
                    totalPages = v;
            });
            
            var nav = jQuery(document.createElement("div"));
            nav.addClass("artmaps-map-object-list-container-page-nav");
            
            //nav.append(showing);
            nav.append('<span class="artmaps-map-object-list-container-page-current">Page ' + currentPage + " of " + totalPages + '</span>');
            
            var prevPage = jQuery(document.createElement("a"))
                    .addClass("artmaps-map-object-list-container-page-previous artmaps-button")
                    .text("Prev")
                    .one("click", function() {
                        jQuery.ajax({
                            "url": "http://www.tate.org.uk/art/artworks?term=" + searchInput.val() + "&wp=" + (currentPage - 1),
                            "dataType": "xml",
                            "async": true,
                            "success": displayArtworks
                        });
                    });
            if(currentPage > 1) nav.append(prevPage);
            
            var firstPage = jQuery(document.createElement("a"))
                    .addClass("search-page")
                    .text(" 1 ")
                    .one("click", function() {
                        jQuery.ajax({
                            "url": "http://www.tate.org.uk/art/artworks?term=" + searchInput.val() + "&wp=1",
                            "dataType": "xml",
                            "async": true,
                            "success": displayArtworks
                        });
                    });
            //pagenav.append(firstPage);
            
            var min = Math.max(currentPage - 3, 2);
            var max = Math.min(min + 6, totalPages);
            var vals = new Array();
            for(var i = min; i <= max; i++) {
                vals.push(i);
            }
            jQuery.each(vals, function(e, i) {
                var page = jQuery(document.createElement("a"))
                        .addClass("search-page")
                        .text(" " + i + " ")
                        .one("click", function() {
                            jQuery.ajax({
                                "url": "http://www.tate.org.uk/art/artworks?term=" + searchInput.val() + "&wp=" + i,
                                "dataType": "xml",
                                "async": true,
                                "success": displayArtworks
                            });
                        });
                //pagenav.append(page);
            });
            
            var lastPage = jQuery(document.createElement("a"))
                    .addClass("search-page")
                    .text(" " + totalPages + " ")
                    .one("click", function() {
                        jQuery.ajax({
                            "url": "http://www.tate.org.uk/art/artworks?term=" + searchInput.val() + "&wp=" + totalPages,
                            "dataType": "xml",
                            "async": true,
                            "success": displayArtworks
                        });
                    });
            //if(totalPages > 1) pagenav.append(lastPage);
            
            var nextPage = jQuery(document.createElement("a"))
                    .addClass("artmaps-map-object-list-container-page-next artmaps-button")
                    .text("Next")
                    .one("click", function() {
                        jQuery.ajax({
                            "url": "http://www.tate.org.uk/art/artworks?term=" + searchInput.val() + "&wp=" + (currentPage + 1),
                            "dataType": "xml",
                            "async": true,
                            "success": displayArtworks
                        });
                    });
            if(currentPage < totalPages) nav.append(nextPage);
            
            artworkResults.append(nav);
            
            
            var artworks = doc.find(".grid-work");
            artworks.each(function(i, e) {
            var oc = jQuery(e);
        		var na = jQuery(document.createElement("a"));
        		na.addClass("artwork-link").attr("href", "#");
                var nc = jQuery(document.createElement("li"));
                nc.addClass("artmaps-map-object-container");
                   var acno = oc.find(".acno").first().text();
                   jQuery.ajax({
                       "url": "http://devservice.artmaps.org.uk/service/tate/rest/v1/objectsofinterest/searchbyuri?URI=tatecollection://" + acno,
                       "dataType": "json",
                       "async": true,
                       "success": function(data) {
                          na.attr("href", ArtMapsConfig.SiteUrl + "/object/" + data.ID);
                      }
                   });
                
                var oi = oc.find(".grid-work-image img");
                if(oi.length > 0) {
                    oi = oi.first();
                    var ni = jQuery(document.createElement("img"));
                    ni.attr("src", "http://dev.artmaps.org.uk/artmaps/tate/dynimage/x/65/http://www.tate.org.uk" + oi.attr("src"));
                    na.append(ni);
                }
                
                nc.append(na);
                na.append(jQuery("<h2>" + oc.find(".grid-work-text .title-and-date").first().text() + "</h2>"));
                na.append(jQuery('<em>by <span class="artmaps-map-object-container-artist">' + oc.find(".grid-work-text .artist").first().text() + '</span></em>'));
                art_list.append(nc);  
            });
            
            jQuery(".ui-dialog-content").not("#artmaps-search-results-artworks").dialog("close");
            jQuery("#artmaps-search-results-artworks").dialog({
              "width": 260,
              "dialogClass": "artwork-results artwork-results-keyword",
              "height": jQuery(window).height() - 160,
              "position": "right bottom",
              "resizable": false,
              "closeText": "",
              "draggable": false,
              "open": function() {
                
              },
              "close": function() {
                jQuery("#keyword-search-form input.query-field").val("");
                jQuery.fancybox.close();
              },
              "title": ''
            });
            
        }
        
        /*searchInput.bind("keyup", function() {
            var term = sanitizeTerm(searchInput.val());
            if(term.length < 3) return;
            var tid = setTimeout(function() {
                    var rq = jQuery.ajax({
                        "url": "http://www.tate.org.uk/art/rulooking4-data?q=" + term.toLowerCase() + "&con=explorer&wv=",
                        "dataType": "json",
                        "async": true,
                        "success": displayArtists
                    });
                    searchInput.one("keydown", function() {
                        rq.abort();    
                    });                
                }, 60);
            searchInput.one("keydown", function() {
                clearTimeout(tid);    
            });
        });*/
        
        searchForm.submit(function() {
            jQuery('#welcome').fadeOut(300);
            jQuery.ajax({
                "url": "http://www.tate.org.uk/art/artworks?term=" + searchInput.val(),
                "dataType": "xml",
                "async": true,
                "success": displayArtworks
            });
            return false;
        });
        

});