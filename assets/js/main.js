/*
	Solid State by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$banner = $('#banner');

	// Breakpoints.
		breakpoints({
			xlarge:	'(max-width: 1680px)',
			large:	'(max-width: 1280px)',
			medium:	'(max-width: 980px)',
			small:	'(max-width: 736px)',
			xsmall:	'(max-width: 480px)'
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() { $window.trigger('scroll'); });

			$banner.scrollex({
				bottom:		$header.outerHeight(),
				terminate:	function() { $header.removeClass('alt'); },
				enter:		function() { $header.addClass('alt'); },
				leave:		function() { $header.removeClass('alt'); }
			});

		}

	// Menu.
		var $menu = $('#menu');

		$menu._locked = false;

		$menu._lock = function() {

			if ($menu._locked)
				return false;

			$menu._locked = true;

			window.setTimeout(function() {
				$menu._locked = false;
			}, 350);

			return true;

		};

		$menu._show = function() {

			if ($menu._lock())
				$body.addClass('is-menu-visible');

		};

		$menu._hide = function() {

			if ($menu._lock())
				$body.removeClass('is-menu-visible');

		};

		$menu._toggle = function() {

			if ($menu._lock())
				$body.toggleClass('is-menu-visible');

		};

		$menu
			.appendTo($body)
			.on('click', function(event) {

				event.stopPropagation();

				// Hide.
					$menu._hide();

			})
			.find('.inner')
				.on('click', '.close', function(event) {

					event.preventDefault();
					event.stopPropagation();
					event.stopImmediatePropagation();

					// Hide.
						$menu._hide();

				})
				.on('click', function(event) {
					event.stopPropagation();
				})
				.on('click', 'a', function(event) {

					var href = $(this).attr('href');

					event.preventDefault();
					event.stopPropagation();

					// Hide.
						$menu._hide();

					// Redirect.
						window.setTimeout(function() {
							window.location.href = href;
						}, 350);

				});

		$body
			.on('click', 'a[href="#menu"]', function(event) {

				event.stopPropagation();
				event.preventDefault();

				// Toggle.
					$menu._toggle();

			})
			.on('keydown', function(event) {

				// Hide on escape.
					if (event.keyCode == 27)
						$menu._hide();

			});


	// NYU Courses.
				var $nyucourses = $('#nyucourses');

				$nyucourses._locked = false;

				$nyucourses._lock = function() {

					if ($nyucourses._locked)
						return false;

					$nyucourses._locked = true;

					window.setTimeout(function() {
						$nyucourses._locked = false;
					}, 350);

					return true;

				};

				$nyucourses._show = function() {

					if ($nyucourses._lock())
						$body.addClass('is-nyucourses-visible');

				};

				$nyucourses._hide = function() {

					if ($nyucourses._lock())
						$body.removeClass('is-nyucourses-visible');

				};

				$nyucourses._toggle = function() {

					if ($nyucourses._lock())
						$body.toggleClass('is-nyucourses-visible');

				};

				$nyucourses
					.appendTo($body)
					.on('click', function(event) {

						event.stopPropagation();

						// Hide.
							$nyucourses._hide();

					})
					.find('.inner')
						.on('click', '.close', function(event) {

							event.preventDefault();
							event.stopPropagation();
							event.stopImmediatePropagation();

							// Hide.
								$nyucourses._hide();

						})
						.on('click', function(event) {
							event.stopPropagation();
						})
						.on('click', 'a', function(event) {

							var href = $(this).attr('href');

							event.preventDefault();
							event.stopPropagation();

							// Hide.
								$nyucourses._hide();

							// Redirect.
								window.setTimeout(function() {
									window.location.href = href;
								}, 350);

						});

				$body
					.on('click', 'a[href="#nyucourses"]', function(event) {

						event.stopPropagation();
						event.preventDefault();

						// Toggle.
							$nyucourses._toggle();

					})
					.on('keydown', function(event) {

						// Hide on escape.
							if (event.keyCode == 27)
								$nyucourses._hide();

					});





		// NP Courses.
								var $npcourses = $('#npcourses');

								$npcourses._locked = false;

								$npcourses._lock = function() {

									if ($npcourses._locked)
										return false;

									$npcourses._locked = true;

									window.setTimeout(function() {
										$npcourses._locked = false;
									}, 350);

									return true;

								};

								$npcourses._show = function() {

									if ($npcourses._lock())
										$body.addClass('is-npcourses-visible');

								};

								$npcourses._hide = function() {

									if ($npcourses._lock())
										$body.removeClass('is-npcourses-visible');

								};

								$npcourses._toggle = function() {

									if ($npcourses._lock())
										$body.toggleClass('is-npcourses-visible');

								};

								$npcourses
									.appendTo($body)
									.on('click', function(event) {

										event.stopPropagation();

										// Hide.
											$npcourses._hide();

									})
									.find('.inner')
										.on('click', '.close', function(event) {

											event.preventDefault();
											event.stopPropagation();
											event.stopImmediatePropagation();

											// Hide.
												$npcourses._hide();

										})
										.on('click', function(event) {
											event.stopPropagation();
										})
										.on('click', 'a', function(event) {

											var href = $(this).attr('href');

											event.preventDefault();
											event.stopPropagation();

											// Hide.
												$npcourses._hide();

											// Redirect.
												window.setTimeout(function() {
													window.location.href = href;
												}, 350);

										});

								$body
									.on('click', 'a[href="#npcourses"]', function(event) {

										event.stopPropagation();
										event.preventDefault();

										// Toggle.
											$npcourses._toggle();

									})
									.on('keydown', function(event) {

										// Hide on escape.
											if (event.keyCode == 27)
												$npcourses._hide();

									});




									// Actuary Update.
															var $actuary = $('#actuary');

															$actuary._locked = false;

															$actuary._lock = function() {

																if ($actuary._locked)
																	return false;

																$actuary._locked = true;

																window.setTimeout(function() {
																	$actuary._locked = false;
																}, 350);

																return true;

															};

															$actuary._show = function() {

																if ($actuary._lock())
																	$body.addClass('is-actuary-visible');

															};

															$actuary._hide = function() {

																if ($actuary._lock())
																	$body.removeClass('is-actuary-visible');

															};

															$actuary._toggle = function() {

																if ($actuary._lock())
																	$body.toggleClass('is-actuary-visible');

															};

															$actuary
																.appendTo($body)
																.on('click', function(event) {

																	event.stopPropagation();

																	// Hide.
																		$actuary._hide();

																})
																.find('.inner')
																	.on('click', '.close', function(event) {

																		event.preventDefault();
																		event.stopPropagation();
																		event.stopImmediatePropagation();

																		// Hide.
																			$actuary._hide();

																	})
																	.on('click', function(event) {
																		event.stopPropagation();
																	})
																	.on('click', 'a', function(event) {

																		var href = $(this).attr('href');

																		event.preventDefault();
																		event.stopPropagation();

																		// Hide.
																			$actuary._hide();

																		// Redirect.
																			window.setTimeout(function() {
																				window.location.href = href;
																			}, 350);

																	});

															$body
																.on('click', 'a[href="#actuary"]', function(event) {

																	event.stopPropagation();
																	event.preventDefault();

																	// Toggle.
																		$actuary._toggle();

																})
																.on('keydown', function(event) {

																	// Hide on escape.
																		if (event.keyCode == 27)
																			$actuary._hide();

																});



									// jQuery(document).ready(function(){
									// 	jQuery('.skillbar').each(function(){
									// 		jQuery(this).find('.skillbar-bar').animate({
									// 			width:jQuery(this).attr('data-percent')
									// 		},6000);
									// 	});
									// });
})(jQuery);



jQuery(document).ready(function(){
	jQuery('.skillbar').each(function(){
		jQuery(this).find('.skillbar-bar').animate({
			width:jQuery(this).attr('data-percent')
		},6000);
	});
});


var $window = $(window);
var $elem = $(".animation")

function isScrolledIntoView($elem, $window) {
    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
$(document).on("scroll", function () {
    if (isScrolledIntoView($elem, $window)) {
        $elem.addClass("animate")
    }
});
