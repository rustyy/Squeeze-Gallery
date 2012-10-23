/**
 * Squeeze Gallery - jQuery plugin showing up a image-gallery in accordion style.
 * @requires jQuery v1.4 or later
 *
 * Copyright (c) 2011 Felix Hofmann
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Version: 0.2a
 *
 * @ToDo: - looping by time
 *        - ie-test
 *        - scale images inside slides
 *        - chaining for teaser
 *        - find a better solution for mouseover/-enter code?
 *        - show gallery vertical
 *
 */

;
(function ($) {
    jQuery.fn.squeezeGallery = function (options) {
        // Create some defaults, extending them with any options that were provided
        var o = $.extend({
            slidesMaxRatio:0.618, // Range from 0.1 to 0.9
            sliderEasing:'swing',
            duration:500,
            teaser:null,
            galleryWidth:null,
            galleryHeight:null
        }, options);

        return this.each(function () {
            var gallery = $(this);
            var initCount = 0;
            // Initialization.
            var init;
            init = function () {
                // Just init the gallery once,
                // we need this due to possibility of multiple images.
                if (initCount) {
                    return false;
                }

                var galCss = {};
                var galHeight, galWidth;
                var slides = $('.slide', gallery);
                var slidesAmount = slides.length;

                var smallestSlide = function () {
                    var h = 5000;

                    $('img', slides).each(function () {
                        if ($(this).height() <= h) {
                            h = $(this).height();
                        }
                    });
                    return h;
                }

                // Set gallery's width.
                if (o.galleryWidth) {
                    galWidth = o.galleryWidth;
                }
                else {
                    galWidth = gallery.width();
                }
                // Set gallery's height.
                if (o.galleryHeight) {
                    galHeight = o.galleryHeight;
                }
                // If not set by options, we calculate height by the smallest image.
                else {
                    galHeight = smallestSlide();
                }

                galCss = $.extend(galCss, {'width':galWidth + 'px', 'height':galHeight + 'px', 'overflow':'hidden', 'position':'relative'});

                var slideMed = galWidth / slidesAmount;
                var slideMax = galWidth * o.slidesMaxRatio;
                var slideMin = (galWidth - slideMax) / (slidesAmount - 1);

                // General css definitions to be added to each slide.
                var slideCss = {'position':'absolute', 'width':slideMed + 'px', 'overflow':'hidden', 'height':galHeight + 'px'};
                // Add CSS to the slides an show them collapsed.
                slides.each(function (i) {
                    var $this = $(this);
                    // Specific slide css.
                    var thisCss = {'z-index':i + 1, 'left':i * slideMed + 'px'};
                    // Merge general and specific css definitions.
                    $.extend(thisCss, slideCss);
                    // Add a unique class and css to each slide.
                    $this.addClass('slide-' + i).css(thisCss);
                });

                // Init teaser.
                var teaserCss = {'position' : 'absolute', 'display' : 'none'};
                if (o.teaser) {
                    $(o.teaser, gallery).each(function() {
                        $(this).css(teaserCss);
                    });
                }

                // Mouseenter.
                slides.stop(true, true).mouseenter(function () {
                    slideCurrentIndex = $(this).index();
                    // Add css-class 'active' and push active Slide to maximum and reduce
                    // the left-attribute to the width of elements before.
                    // eg. currentIndex = 2, minWidth=42 -> left=84px

                    $(this)
                        .animate({
                            width:slideMax + 'px',
                            left:slideMin * slideCurrentIndex + 'px'
                        }, {
                            queue:false,
                            duration:o.duration,
                            easing:o.sliderEasing,
                            complete:animateTeaser($(this), "mouseenter")
                        })
                        .toggleClass('active');
                    // Morph the siblings.
                    $(this).siblings().each(function (i) {
                        // Is sibling before active slide?
                        if (i < slideCurrentIndex) {
                            left = i * slideMin;
                        }
                        // If not, add maxWidth.
                        else {
                            left = slideMax + (i * slideMin);
                        }
                        // Animate siblings.
                        $(this).animate({
                            width:slideMin + 'px',
                            left:left + 'px'
                        }, {
                            queue:false,
                            duration:o.duration,
                            easing:o.sliderEasing
                        });
                    });
                });

                // Mouseleave
                slides.stop(true, true).mouseleave(function () {
                    // Remove 'active'-class and shrink former active slide
                    // to its ancestral size and position.
                    $(this)
                        .animate({
                            width:slideMed + 'px',
                            left:slideMed * slideCurrentIndex + 'px'
                        }, {
                            queue:false,
                            duration:o.duration,
                            easing:o.sliderEasing,
                            complete:animateTeaser($(this), "mouseleave")
                        })
                        .toggleClass('active');
                    // Move all siblings to their ancestral size and postion.
                    $(this).siblings().each(function (i) {
                        // Check if former active slide is reached.
                        if (i < slideCurrentIndex) {
                            left = i * slideMed;
                        }
                        // If former active slide is passed, we have to 'jump' one slide ahead.
                        else {
                            left = (i + 1) * slideMed;
                        }
                        // Animate siblings with proper values.
                        $(this).animate({
                            width:slideMed + 'px',
                            left:left + 'px'
                        }, {
                            queue:false,
                            duration:o.duration,
                            easing:o.sliderEasing
                        });
                    });
                });

                function animateTeaser(obj, e) {
                    var teaserCSS = {};
                    if (o.teaser) {
                        if (e === "mouseenter") {
                            $(o.teaser, obj).stop(true, true).fadeIn('slow');
                        }
                        if (e === "mouseleave") {
                            $(o.teaser, obj).stop(true, true).fadeOut('slow');
                        }
                    }
                }

                // Add css to gallery-container.
                gallery.css(galCss);
                // Gallery has been initialized, so initCount set to 1.
                initCount = 1;
            };
            // If gallery contains images, we are waiting until they are fully loaded.
            if (gallery.find('img')) {
                $('img', gallery).load(init());
            }
            // Otherwise we go ahead.
            else {
                init();
            }
        });
    };
})(jQuery);