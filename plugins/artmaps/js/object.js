/* Namespace: ArtMaps.Object */
ArtMaps.Object = ArtMaps.Object || {};

ArtMaps.Object.MapObject = function(container, config) {

    var self = this;
    
    var mapconf = {
            "scrollwheel": true,
            "center": new google.maps.LatLng(0, 0),
            "streetViewControl": true,
            "zoom": 15,
            "mapTypeId": google.maps.MapTypeId.SATELLITE,
            "zoomControlOptions": {
                "position": google.maps.ControlPosition.LEFT_CENTER
            },
            "panControl": false
    };
    
    var clusterconf = {
            "gridSize": 150,
            "minimumClusterSize": 2,
            "zoomOnClick": true,
            "maxZoom": 18,
            "imageSizes": [56],
            "styles": [{
                "url": ArtMapsConfig.ClusterIconUrl,
                "height": 56,
                "width": 56
            }] 
    };
    
    jQuery.extend(true, mapconf, config.map);
    var mapType = jQuery.bbq.getState("maptype");
    if(mapType) mapconf.mapTypeId = mapType;
    var map = new google.maps.Map(container.get(0), mapconf);
    var clusterer = new MarkerClusterer(map, [], jQuery.extend(true, clusterconf, config.cluster));
    
    var streetview = map.getStreetView();
    google.maps.event.addListener(streetview, 'visible_changed', function(e) {
        jQuery.each(clusterer.getMarkers(), function(i, m) {
            if(streetview.getVisible()) {
                if(m.bigIcon == true)
                    return;
                m.bigIcon = true;
                var color = m.styleIcon.color.replace("#", "");
                m.defaultIcon = m.getIcon();
                m.setIcon("https://chart.googleapis.com/chart?chst=d_map_spin&chld=3|0|" + color + "|10|_|");
            } else if(m.defaultIcon) {
                m.bigIcon = false;
                m.setIcon(m.defaultIcon);
            }
        });
    });
    
    var svSuggest = jQuery("<button type=\"button\">Suggest A Location</button>");
    if(ArtMapsConfig.IsUserLoggedIn)
        streetview.controls[google.maps.ControlPosition.TOP_RIGHT].push(svSuggest.get(0));    
    
    var suggestionRequested = false;
        
    jQuery.getJSON(ArtMapsConfig.CoreServerPrefix + "objectsofinterest/" + ArtMapsConfig.ObjectID,
		function(object) {
        
            var obj = new ArtMaps.ObjectOfInterest(object);
        
            var markers = new Array();
			jQuery.each(obj.Locations, function(i, loc) {
			    if(loc.IsDeleted) return;
                markers.push(new ArtMaps.Object.UI.Marker(loc, map, clusterer));
			});			
			clusterer.addMarkers(markers);
			self.reset();
			
			var suggestionMarker = new ArtMaps.Object.UI.SuggestionMarker(map, obj, clusterer); 
            self.suggest = function() {
                jQuery.each(markers, function(i, m) { m.close(); });
                suggestionMarker.show();
            };
			if(suggestionRequested) self.suggest();
			
			svSuggest.click(function() {
	            var pos = streetview.getPosition();
	            streetview.setVisible(false);
	            self.suggest();
	            suggestionMarker.setPosition(pos);
	        });	
		}
	);

    this.setMapType = map.setMapTypeId;
    
    this.getMapType = map.getMapTypeId;
    
    this.getCenter = map.getCenter;
    
    this.suggest = function() { 
        suggestionRequested = true;
    };
        
    this.reset = function() {
        var markers = clusterer.getMarkers(); 
        if(markers.length == 0) {
            map.setCenter(mapconf.center); 
            map.setZoom(mapconf.zoom);
        } else if(markers.length == 1) {
            map.setCenter(markers[0].getPosition()); 
            map.setZoom(mapconf.zoom);
        } else
            clusterer.fitMapToMarkers();
        clusterer.repaint();
    };
    
    this.bindAutocomplete = function(autoComplete) {
        autoComplete.bindTo("bounds", map);
        google.maps.event.addListener(autoComplete, "place_changed", function() {
            var place = autoComplete.getPlace();
            if(place.id) {
                if(place.geometry.viewport)
                    map.fitBounds(place.geometry.viewport);
                else{
                    map.setCenter(place.geometry.location);
                    map.setZoom(12);
                }
            }
        });
    };
    
    this.addControl = function(control, position) {
        map.controls[position].push(control);
    };
};
