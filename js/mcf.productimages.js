/*!
 * File: mcf.productimage.js
 * Part of MyCashFlow's default theme.
 * Please don't edit this file unless necessary!
 */

/*jshint browser: true, jquery: true, laxbreak: true, curly: false, expr: true */

$(function() {
	'use strict';

	// Minimum variation image
	// filter length.
	var filterLengthLimit = 4;

	var $productCurrentImage = $('#CurrentProductImage'),
		$productThumbnails = $('#ProductThumbnails'),
		$productBuyForm = $('.BuyForm');

	// Create the spinning image loader.
	var $imageLoader = $('<span id="ImgLoader">' + mcf.Lang.Loading + '</span>');
	$imageLoader.prependTo($productCurrentImage);
	$imageLoader.hide();

	// Change the preview image when a thumbnail is clicked.
	$productThumbnails.on('click', 'li a', function(evt, triggered) {
		var $self = $(this);

		var $oldImage = $('img', $productCurrentImage),
			$newImage = $('img', $self),
			imageText = $.trim($newImage.attr('alt')),
			imageSize = $oldImage.attr('src').split('/')[2];

		// Show the image loader.
		$imageLoader.fadeIn(150);

		// Hide the product image.
		$oldImage.fadeOut(300, function() {
			// Hide the image loader and
			// show the new product image.
			$imageLoader.fadeOut(300, function() {
				$oldImage.attr('alt', $newImage.attr('alt'));
				$oldImage.attr('src', $newImage.attr('src').replace(/[0-9]+x[0-9]+/, imageSize));
				$oldImage.fadeIn(300);
			});
		});

		$productCurrentImage
			.attr('title', $(this).attr('title'))
			.attr('href', $(this).attr('href'))
			.data('eq', $(this).parent().index())
			.next('#ProductImageCaption').text($self.attr('title'));

		if (!triggered && imageText.length >= filterLengthLimit) {
			var $bestMatch = null;
			var $inputs = $('option, :radio', $productBuyForm).sort(function(a, b) {
				var labelA = $(a).is(':radio')
					? $(a).parent('label').text()
					: $(a).find(':selected').text();

				var labelB = $(b).is(':radio')
					? $(b).parent('label').text()
					: $(b).find(':selected').text();

				return labelA.length > labelB.length;
			});

			$inputs.each(function() {
				var inputValue = $(this).is(':radio')
					? $.trim($(this).parent('label').text())
					: $.trim($(this).text());

				var priceRegex = /\, .?\d+\W\d+.+$/;
				inputValue = inputValue.replace(priceRegex, '');

				var matchA = inputValue.toLowerCase(),
					matchB = imageText.toLowerCase(),
					matches = matchA.length > matchB.length
						? matchA.indexOf(matchB)
						: matchB.indexOf(matchA);

				if (matchA === matchB) {
					$bestMatch = $(this);
					return false;
				}

				if (matches > -1) {
					$bestMatch = $(this);
				}
			});

			if ($bestMatch) {
				var $parent = $bestMatch.closest('.FormItem');
				if ($bestMatch.is(':radio')) {
					$(':radio', $parent).attr('checked', false);
					$bestMatch.attr('checked', true);
				} else if ($parent.hasClass('BuyFormQuantity') === false) {
					$('option', $parent).attr('selected', false);
					$bestMatch.attr('selected', true).parent("select").trigger("change", [true]);
				}
			}
		}

		evt.preventDefault();
	});

	// Change the preview image when a different product
	// variant is selected. Matching is done by comparing
	// the variant's name against the image titles.
	$productBuyForm.on('change', function (evt, triggered) {
		if (!triggered) {
			var $changedEl = $(evt.target),
				$bestMatch = null,
				$parent = $changedEl.closest('.FormItem'),
				inputValue = $changedEl.is(':radio')
					? $.trim($changedEl.parent('label').text())
					: $.trim($changedEl.find(':selected').text());

			if (inputValue.length >= filterLengthLimit) {
				var $thumbnails = $('li a', $productThumbnails).sort(function(a, b) {
					var labelA = $(a).attr('title'),
						labelB = $(b).attr('title');
					return labelA.length > labelB.length;
				});

				$thumbnails.each(function() {
					var matchA = $.trim($(this).attr('title').toLowerCase()),
						matchB = inputValue.toLowerCase(),
						matches = matchA.length > matchB.length
							? matchA.indexOf(matchB)
							: matchB.indexOf(matchA);

					if (matchA === matchB) {
						$bestMatch = $(this);
						return false;
					}

					if (matches > -1) {
						$bestMatch = $(this);
					}
				});

				if ($bestMatch && $parent.hasClass('BuyFormQuantity') === false) {
					$bestMatch.trigger('click', [true]);
				}
			}
		}
	});

	// Open the current preview image into a modal window
	// when clicked.
	$productCurrentImage.on('click', function(evt) {
		if ($productThumbnails.length) {
			var $self = $(this);

			// Get the index of the currently active image.
			var index = $self.data('eq')
				? $self.data('eq')
				: 0;

			// Initialize the ColorBox for product images.
			$('li a', $productThumbnails).colorbox($.extend({}, { open: false }, mcf.colorboxOpts));

			// Open the currently active product image.
			$('li:eq(' + index + ') a', $productThumbnails).colorbox($.extend({}, { open: true }, mcf.colorboxOpts));

		} else {
			$(this).colorbox($.extend({}, { open: true }, mcf.colorboxOpts));
		}

		evt.preventDefault();
	});

	// Prevent Colorbox from opening when clicking thumbs.
	$productThumbnails.on('click', function(evt) {
		return false;
	});
});
