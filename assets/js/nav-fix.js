const $ = window.jQuery || window.$;

function setupNavFix() {
  if (!$) return;

  const $nav = $('#site-nav');
  const $btn = $('#site-nav > button');
  const $vlinks = $('#site-nav .visible-links');
  const $hlinks = $('#site-nav .hidden-links');
  const $themeToggle = $('#theme-toggle');
  const $themeLink = $('#theme-toggle a');

  if (!$nav.length || !$btn.length || !$vlinks.length || !$hlinks.length) return;

  let breaks = [];

  const updateLayoutOffsets = () => {
    const mastheadHeight = $('.masthead').height();
    $('body').css('padding-top', mastheadHeight + 'px');
    if ($('.author__urls-wrapper button').is(':visible')) {
      $('.sidebar').css('padding-top', '');
    } else {
      $('.sidebar').css('padding-top', mastheadHeight + 'px');
    }
  };

  const resetMenu = () => {
    const $tail = $vlinks.children('*.persist.tail').first();
    while ($hlinks.children().length) {
      if ($tail.length) {
        $hlinks.children().first().insertBefore($tail);
      } else {
        $hlinks.children().first().appendTo($vlinks);
      }
    }
    breaks = [];
    $btn.addClass('hidden').removeClass('close').attr('count', 0);
    $hlinks.addClass('hidden');
  };

  const updateNav = () => {
    resetMenu();

    let availableSpace = $nav.width();
    let needsButton = false;

    while ($vlinks.width() > availableSpace && $vlinks.children('*:not(.persist)').length > 0) {
      if (!needsButton) {
        needsButton = true;
        $btn.removeClass('hidden');
      }
      availableSpace = $nav.width() - $btn.outerWidth(true) - 30;
      breaks.push($vlinks.width());
      $vlinks.children('*:not(.persist)').last().prependTo($hlinks);
    }

    if (!needsButton) {
      $btn.addClass('hidden').removeClass('close');
      $hlinks.addClass('hidden');
    }

    $btn.attr('count', breaks.length);
    updateLayoutOffsets();
  };

  $btn.off('click.navfix').on('click.navfix', function (event) {
    event.preventDefault();
    event.stopPropagation();
    $hlinks.toggleClass('hidden');
    $(this).toggleClass('close');
  });

  $(document).off('click.navfix').on('click.navfix', function (event) {
    if (!$(event.target).closest('#site-nav').length) {
      $hlinks.addClass('hidden');
      $btn.removeClass('close');
    }
  });

  $themeToggle.off('click.navfix').on('click.navfix', function (event) {
    event.preventDefault();
    event.stopPropagation();
    $themeLink.trigger('focus');
    const currentTheme = $('html').attr('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      $('html').attr('data-theme', 'dark');
      $('#theme-icon').removeClass('fa-sun').addClass('fa-moon');
    } else {
      $('html').removeAttr('data-theme');
      $('#theme-icon').removeClass('fa-moon').addClass('fa-sun');
    }
  });

  $(window).off('resize.navfix').on('resize.navfix', updateNav);
  if (screen.orientation && typeof screen.orientation.addEventListener === 'function') {
    screen.orientation.addEventListener('change', updateNav);
  } else {
    window.addEventListener('orientationchange', updateNav);
  }

  window.addEventListener('load', updateNav);
  document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    requestAnimationFrame(updateNav);
    setTimeout(updateNav, 150);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateNav).catch(() => {});
    }
  });
}

setupNavFix();