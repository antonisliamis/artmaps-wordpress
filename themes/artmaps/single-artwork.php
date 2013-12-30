<?php //get_header(); ?>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
<div class="artwork-page">
<script type="text/javascript">
google.maps.visualRefresh = true;
jQuery(function($) {

    jQuery( "#artmaps-object-tabs" ).tabs();
    
    ArtMapsConfig = ArtMapsConfig || {};
    ArtMapsConfig.ObjectID = "<?php echo get_post_meta(get_the_ID(),"object_id",true); ?>";
    
    var config = {
        "map": {
            "center": new google.maps.LatLng(51.507854, -0.099462), /* Tate Britain */
            "mapTypeControl": false
        }
    };
    var map = new ArtMaps.Object.MapObject($("#artmaps-object-map"), config);
    
    (function() {
        var autocomplete = $("#artmaps-object-map-autocomplete");
        map.bindAutocomplete(new google.maps.places.Autocomplete(autocomplete.get(0)));
        map.addControl(autocomplete.get(0), google.maps.ControlPosition.RIGHT_TOP);
        
        var suggest = $("#artmaps-object-map-suggest");
        if(ArtMapsConfig.IsUserLoggedIn) {
            suggest.click(function() {
               map.suggest(); 
            });
        } else {
            suggest.hide();
        }
        
        var showall = $("#artmaps-object-map-showall");
        showall.click(function() {
           map.reset(); 
        });
        map.addControl(showall.get(0), google.maps.ControlPosition.RIGHT_TOP);
        
        $("a").filter(function() {
            var e = $(this);
            return e.text() == "The Map";
        }).text("Back To The Map");
    })();
});
</script>
<div id="artmaps-object-metadata">
  <div class="content">
    
    <div class="artmaps-object-image">
      <?php if(get_post_meta(get_the_ID(),"imageurl",true)) { ?>
        <a href="<?php echo get_post_meta(get_the_ID(),"imageurl",true); ?>" class="fancybox"><img src="http://dev.artmaps.org.uk/artmaps/tate/dynimage/y/250/<?php echo get_post_meta(get_the_ID(),"imageurl",true); ?>" alt="<?php the_title(); ?>" class="artwork-img" /></a>
      <?php } else { ?>
        <img src="{'/content/unavailable.jpg'|artmapsUri}" alt="{$metadata->title}" />
      <?php } ?>
    </div>
    
    <h1><?php if(get_post_meta(get_the_ID(),"title",true)) { echo get_post_meta(get_the_ID(),"title",true);} else { the_title(); } ?></h1>
    <dl>
      <dt>Artist</dt>
        <dd><?php echo get_post_meta(get_the_ID(),"artist",true); ?> <?php echo get_post_meta(get_the_ID(),"artistdate",true); ?></dd>
      <dt>Date</dt>
        <dd><?php echo get_post_meta(get_the_ID(),"artworkdate",true); ?></dd>
      <dt></dt>
        <dd><a href="http://www.tate.org.uk/art/artworks/<?php echo get_post_meta(get_the_ID(),"reference",true); ?>" target="_blank" class="artwork-external">View on Tate Online</a></dd>
    </dl>
    
    <button id="artmaps-object-map-suggest" type="button">Suggest a location</button>

    <div id="artmaps-object-suggestion-message">
      <h2><i class="fa-check"></i> Got it.</h2>
      <p>We've saved your suggested location. If other users agree with your choice, the coordinates will become part of Tate collection data.</p>
    </div>
    
    <div id="artmaps-object-comments">
      <?php comments_template(); ?>
    </div>
    
  </div>
</div>

  <div id="artmaps-object-detail">
  
    <div id="artmaps-object-map" style="width:400px; height:300px;"></div>
  
    <button id="artmaps-object-map-showall" type="button">Reset map</button>
    <input id="artmaps-object-map-autocomplete" type="text" />
    
</div>
</div>
<?php endwhile; endif; ?>

<?php // get_footer(); ?>