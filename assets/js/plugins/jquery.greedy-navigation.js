/*
* Greedy Navigation
*
* http://codepen.io/lukejacksonn/pen/PwmwWV
*
*/

var $nav = $('#site-nav');
var $btn = $('#site-nav button');
var $vlinks = $('#site-nav .visible-links');
var $hlinks = $('#site-nav .hidden-links');

var breaks = [];

function getPersistTail() {
  return $vlinks.children('.persist.tail').last();
}

function updateNav() {
  if (!$nav.length || !$btn.length || !$vlinks.length || !$hlinks.length) {
    return;
  }

  var availableSpace = $btn.hasClass('hidden')
    ? $nav.width()
    : $nav.width() - $btn.outerWidth(true) - 30;

  // The visible list is overflowing the nav
  if ($vlinks.width() > availableSpace) {
    while ($vlinks.width() > availableSpace && $vlinks.children('*:not(.persist)').length > 0) {
      // Record the width of the list
      breaks.push($vlinks.width());

      // Move item to the hidden list
      $vlinks.children('*:not(.persist)').last().prependTo($hlinks);

      availableSpace = $btn.hasClass('hidden')
        ? $nav.width()
        : $nav.width() - $btn.outerWidth(true) - 30;

      // Show the dropdown btn
      $btn.removeClass('hidden');
    }

  // The visible list is not overflowing
  } else {

    // There is space for another item in the nav
    while (breaks.length > 0 && $hlinks.children().length > 0 && availableSpace > breaks[breaks.length - 1]) {
      var $persistTail = getPersistTail();

      if ($persistTail.length > 0) {
        $hlinks.children().first().insertBefore($persistTail);
      } else {
        $hlinks.children().first().appendTo($vlinks);
      }

      breaks.pop();

      availableSpace = $btn.hasClass('hidden')
        ? $nav.width()
        : $nav.width() - $btn.outerWidth(true) - 30;
    }

    // Hide the dropdown btn if hidden list is empty
    if ($hlinks.children().length === 0) {
      $btn.addClass('hidden');
      $btn.removeClass('close');
      $hlinks.addClass('hidden');
      breaks = [];
    }
  }

  // Keep counter updated
  $btn.attr('count', breaks.length);

  // update masthead height and the body/sidebar top padding
  var mastheadHeight = $('.masthead').height();
  $('body').css('padding-top', mastheadHeight + 'px');

  if ($('.author__urls-wrapper button').is(':visible')) {
    $('.sidebar').css('padding-top', '');
  } else {
    $('.sidebar').css('padding-top', mastheadHeight + 'px');
  }
}

// Window listeners
$(window).on('resize', function () {
  updateNav();
});

if (window.screen && screen.orientation && screen.orientation.addEventListener) {
  screen.orientation.addEventListener('change', function () {
    updateNav();
  });
}

$btn.on('click', function () {
  $hlinks.toggleClass('hidden');
  $(this).toggleClass('close');
});

updateNav();