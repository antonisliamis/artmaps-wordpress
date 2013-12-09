<!DOCTYPE html>
<html <?php language_attributes(); ?>>
  <head>
      <meta charset="<?php bloginfo( 'charset' ); ?>" />
      <meta name="viewport" content="user-scalable=0, initial-scale=1, maximum-scale=1, minimum-scale=1" />
      <title><?php bloginfo('name'); ?> &middot; <?php is_front_page() ? bloginfo('description') : wp_title(''); ?></title>
      <meta name="description" content="<?php bloginfo( 'description' ); ?>">
      <?php wp_head(); ?>
  </head>

  <body <?php body_class(); ?>>
  <header>
  <a href="<?php bloginfo('url'); ?>" class="logo">
    <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/artmaps-logo.png" alt="<?php bloginfo('title'); ?>" />
  </a>
  <ul class="menu">
    <li class="about">
      <a href="about" class="toggle fancybox fancybox.ajax">How it works</a>
    </li>
    <?php if ( !is_user_logged_in() ) { ?>
    <li class="log-in">
      <a href="<?php echo wp_login_url( get_bloginfo('url') ); ?>" id="log-in" class="toggle">Log in</a>
      <div class="log-in-popover popover" id="log-in-popover">
        <p class="status"></p>
        <?php wp_login_form(array('label_username' => 'Email address', 'label_log_in' => 'Log in', 'label_remember' => 'Remember me')); ?>
      </div>
    </li>
    <?php } else { ?>
    <li class="log-out">
      <?php
        global $current_user;
        get_currentuserinfo();
      ?>
      <a href="#" id="log-in" class="toggle"><?php echo get_avatar( $current_user->ID, 32 ); ?><?php echo ucwords($current_user->display_name); ?></a>
      <div class="log-in-popover popover" id="log-in-popover">
        <div class="wrap">
          <a href="<?php echo wp_logout_url( get_bloginfo('url') ); ?>">Log out</a>
        </div>
      </div>
    </li>
    <?php } ?>
    <li>
      <div id="map-settings">
        <a class="toggle">Settings</a>
        <div class="settings popover">
          <div class="settings-inner">
          
          </div>
        </div>
      </div>
    </li>
  </ul>
  <div class="search-form">
    <a class="switch" href="#" id="search-form-toggle"><i class="fa-search"></i><i class="fa-chevron-down"></i></a>
    <div id="location-search-form">
      <input id="artmaps-map-autocomplete" type="text" placeholder="Find a place" class="query-field" />
    </div>
    <div id="keyword-search-form">
      <form>
        <input placeholder="Search by keyword" name="term" value="" type="text" size="30" autocomplete="off" class="query-field">
        <input type="submit" style="display:none;">
      </form>
    </div>
  </header>
  <span class="loading-indicator gmnoprint">Searching this area for art&hellip;</span>
