var _ewa_google_key = window._ewa_google_key || "AIzaSyDF2i_2bppCyUdkpEqm2iaoW6eIKyNjkdI";//gdx1231gdx
// document.write("<scr" + "ipt
// src='http://maps.googleapis.com/maps/api/js?key="
// + _ewa_google_key + "&sensor=true'></scr" + "ipt>");
document.body.appendChild(document.createElement('script')).src = window.location.protocol + '//maps.googleapis.com/maps/api/js?key='
	+ _ewa_google_key;
// document.write("<scr" + "ipt src='http://maps.googleapis.com/maps/api/js?key=" +
// _ewa_google_key + "&sensor=true'></scr" + "ipt>");
// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url
// http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3.js
// ==/ClosureCompiler==

/**
 * @name CSS3 InfoBubble with tabs for Google Maps API V3
 * @version 0.8
 * @author Luke Mahe
 * @fileoverview This library is a CSS Infobubble with tabs. It uses css3
 *               rounded corners and drop shadows and animations. It also allows
 *               tabs
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * A CSS3 InfoBubble v0.8
 * 
 * @param {Object.
 *            <string, *>=} opt_options Optional properties to set.
 * @extends {google.maps.OverlayView}
 * @constructor
 */
function InfoBubble(opt_options) {
	this.extend(InfoBubble, google.maps.OverlayView);
	this.tabs_ = [];
	this.activeTab_ = null;
	this.baseZIndex_ = 100;
	this.isOpen_ = false;

	var options = opt_options || {};

	if (options['backgroundColor'] == undefined) {
		options['backgroundColor'] = this.BACKGROUND_COLOR_;
	}

	if (options['borderColor'] == undefined) {
		options['borderColor'] = this.BORDER_COLOR_;
	}

	if (options['borderRadius'] == undefined) {
		options['borderRadius'] = this.BORDER_RADIUS_;
	}

	if (options['borderWidth'] == undefined) {
		options['borderWidth'] = this.BORDER_WIDTH_;
	}

	if (options['padding'] == undefined) {
		options['padding'] = this.PADDING_;
	}

	if (options['arrowPosition'] == undefined) {
		options['arrowPosition'] = this.ARROW_POSITION_;
	}

	if (options['disableAutoPan'] == undefined) {
		options['disableAutoPan'] = false;
	}

	if (options['disableAnimation'] == undefined) {
		options['disableAnimation'] = false;
	}

	if (options['minWidth'] == undefined) {
		options['minWidth'] = this.MIN_WIDTH_;
	}

	if (options['shadowStyle'] == undefined) {
		options['shadowStyle'] = this.SHADOW_STYLE_;
	}

	if (options['arrowSize'] == undefined) {
		options['arrowSize'] = this.ARROW_SIZE_;
	}

	if (options['arrowStyle'] == undefined) {
		options['arrowStyle'] = this.ARROW_STYLE_;
	}

	this.buildDom_();

	this.setValues(options);
}
window['InfoBubble'] = InfoBubble;

/**
 * Default arrow size
 * 
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_SIZE_ = 15;

/**
 * Default arrow style
 * 
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_STYLE_ = 0;

/**
 * Default shadow style
 * 
 * @const
 * @private
 */
InfoBubble.prototype.SHADOW_STYLE_ = 1;

/**
 * Default min width
 * 
 * @const
 * @private
 */
InfoBubble.prototype.MIN_WIDTH_ = 50;

/**
 * Default arrow position
 * 
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_POSITION_ = 50;

/**
 * Default padding
 * 
 * @const
 * @private
 */
InfoBubble.prototype.PADDING_ = 10;

/**
 * Default border width
 * 
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_WIDTH_ = 1;

/**
 * Default border color
 * 
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_COLOR_ = '#ccc';

/**
 * Default border radius
 * 
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_RADIUS_ = 10;

/**
 * Default background color
 * 
 * @const
 * @private
 */
InfoBubble.prototype.BACKGROUND_COLOR_ = '#fff';

/**
 * Extends a objects prototype by anothers.
 * 
 * @param {Object}
 *            obj1 The object to be extended.
 * @param {Object}
 *            obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
InfoBubble.prototype.extend = function(obj1, obj2) {
	return (function(object) {
		for ( var property in object.prototype) {
			this.prototype[property] = object.prototype[property];
		}
		return this;
	}).apply(obj1, [ obj2 ]);
};

/**
 * Builds the InfoBubble dom
 * 
 * @private
 */
InfoBubble.prototype.buildDom_ = function() {
	var bubble = this.bubble_ = document.createElement('DIV');
	bubble.style['position'] = 'absolute';
	bubble.style['zIndex'] = this.baseZIndex_;

	var tabsContainer = this.tabsContainer_ = document.createElement('DIV');
	tabsContainer.style['position'] = 'relative';

	// Close button
	var close = this.close_ = document.createElement('IMG');
	close.style['position'] = 'absolute';
	close.style['width'] = this.px(12);
	close.style['height'] = this.px(12);
	close.style['border'] = 0;
	close.style['zIndex'] = this.baseZIndex_ + 1;
	close.style['cursor'] = 'pointer';
	close.src = '//maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif';

	var that = this;
	google.maps.event.addDomListener(close, 'click', function() {
		that.close();
		google.maps.event.trigger(that, 'closeclick');
	});

	// Content area
	var contentContainer = this.contentContainer_ = document.createElement('DIV');
	contentContainer.style['overflowX'] = 'auto';
	contentContainer.style['overflowY'] = 'auto';
	contentContainer.style['cursor'] = 'default';
	contentContainer.style['clear'] = 'both';
	contentContainer.style['position'] = 'relative';

	var content = this.content_ = document.createElement('DIV');
	contentContainer.appendChild(content);

	// Arrow
	var arrow = this.arrow_ = document.createElement('DIV');
	arrow.style['position'] = 'relative';

	var arrowOuter = this.arrowOuter_ = document.createElement('DIV');
	var arrowInner = this.arrowInner_ = document.createElement('DIV');

	var arrowSize = this.getArrowSize_();

	arrowOuter.style['position'] = arrowInner.style['position'] = 'absolute';
	arrowOuter.style['left'] = arrowInner.style['left'] = '50%';
	arrowOuter.style['height'] = arrowInner.style['height'] = '0';
	arrowOuter.style['width'] = arrowInner.style['width'] = '0';
	arrowOuter.style['marginLeft'] = this.px(-arrowSize);
	arrowOuter.style['borderWidth'] = this.px(arrowSize);
	arrowOuter.style['borderBottomWidth'] = 0;

	// Shadow
	var bubbleShadow = this.bubbleShadow_ = document.createElement('DIV');
	bubbleShadow.style['position'] = 'absolute';

	// Hide the InfoBubble by default
	bubble.style['display'] = bubbleShadow.style['display'] = 'none';

	bubble.appendChild(this.tabsContainer_);
	bubble.appendChild(close);
	bubble.appendChild(contentContainer);
	arrow.appendChild(arrowOuter);
	arrow.appendChild(arrowInner);
	bubble.appendChild(arrow);

	var stylesheet = document.createElement('style');
	stylesheet.setAttribute('type', 'text/css');

	/**
	 * The animation for the infobubble
	 * 
	 * @type {string}
	 */
	this.animationName_ = '_ibani_' + Math.round(Math.random() * 10000);

	var css = '.' + this.animationName_ + '{-webkit-animation-name:' + this.animationName_ + ';-webkit-animation-duration:0.5s;'
		+ '-webkit-animation-iteration-count:1;}' + '@-webkit-keyframes ' + this.animationName_ + ' {from {'
		+ '-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% '
		+ '{-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}';

	stylesheet.textContent = css;
	document.getElementsByTagName('head')[0].appendChild(stylesheet);
};

/**
 * Sets the background class name
 * 
 * @param {string}
 *            className The class name to set.
 */
InfoBubble.prototype.setBackgroundClassName = function(className) {
	this.set('backgroundClassName', className);
};
InfoBubble.prototype['setBackgroundClassName'] = InfoBubble.prototype.setBackgroundClassName;

/**
 * changed MVC callback
 */
InfoBubble.prototype.backgroundClassName_changed = function() {
	this.content_.className = this.get('backgroundClassName');
};
InfoBubble.prototype['backgroundClassName_changed'] = InfoBubble.prototype.backgroundClassName_changed;

/**
 * Sets the class of the tab
 * 
 * @param {string}
 *            className the class name to set.
 */
InfoBubble.prototype.setTabClassName = function(className) {
	this.set('tabClassName', className);
};
InfoBubble.prototype['setTabClassName'] = InfoBubble.prototype.setTabClassName;

/**
 * tabClassName changed MVC callback
 */
InfoBubble.prototype.tabClassName_changed = function() {
	this.updateTabStyles_();
};
InfoBubble.prototype['tabClassName_changed'] = InfoBubble.prototype.tabClassName_changed;

/**
 * Gets the style of the arrow
 * 
 * @private
 * @return {number} The style of the arrow.
 */
InfoBubble.prototype.getArrowStyle_ = function() {
	return parseInt(this.get('arrowStyle'), 10) || 0;
};

/**
 * Sets the style of the arrow
 * 
 * @param {number}
 *            style The style of the arrow.
 */
InfoBubble.prototype.setArrowStyle = function(style) {
	this.set('arrowStyle', style);
};
InfoBubble.prototype['setArrowStyle'] = InfoBubble.prototype.setArrowStyle;

/**
 * Arrow style changed MVC callback
 */
InfoBubble.prototype.arrowStyle_changed = function() {
	this.arrowSize_changed();
};
InfoBubble.prototype['arrowStyle_changed'] = InfoBubble.prototype.arrowStyle_changed;

/**
 * Gets the size of the arrow
 * 
 * @private
 * @return {number} The size of the arrow.
 */
InfoBubble.prototype.getArrowSize_ = function() {
	return parseInt(this.get('arrowSize'), 10) || 0;
};

/**
 * Sets the size of the arrow
 * 
 * @param {number}
 *            size The size of the arrow.
 */
InfoBubble.prototype.setArrowSize = function(size) {
	this.set('arrowSize', size);
};
InfoBubble.prototype['setArrowSize'] = InfoBubble.prototype.setArrowSize;

/**
 * Arrow size changed MVC callback
 */
InfoBubble.prototype.arrowSize_changed = function() {
	this.borderWidth_changed();
};
InfoBubble.prototype['arrowSize_changed'] = InfoBubble.prototype.arrowSize_changed;

/**
 * Set the position of the InfoBubble arrow
 * 
 * @param {number}
 *            pos The position to set.
 */
InfoBubble.prototype.setArrowPosition = function(pos) {
	this.set('arrowPosition', pos);
};
InfoBubble.prototype['setArrowPosition'] = InfoBubble.prototype.setArrowPosition;

/**
 * Get the position of the InfoBubble arrow
 * 
 * @private
 * @return {number} The position..
 */
InfoBubble.prototype.getArrowPosition_ = function() {
	return parseInt(this.get('arrowPosition'), 10) || 0;
};

/**
 * arrowPosition changed MVC callback
 */
InfoBubble.prototype.arrowPosition_changed = function() {
	var pos = this.getArrowPosition_();
	this.arrowOuter_.style['left'] = this.arrowInner_.style['left'] = pos + '%';

	this.redraw_();
};
InfoBubble.prototype['arrowPosition_changed'] = InfoBubble.prototype.arrowPosition_changed;

/**
 * Set the zIndex of the InfoBubble
 * 
 * @param {number}
 *            zIndex The zIndex to set.
 */
InfoBubble.prototype.setZIndex = function(zIndex) {
	this.set('zIndex', zIndex);
};
InfoBubble.prototype['setZIndex'] = InfoBubble.prototype.setZIndex;

/**
 * Get the zIndex of the InfoBubble
 * 
 * @return {number} The zIndex to set.
 */
InfoBubble.prototype.getZIndex = function() {
	return parseInt(this.get('zIndex'), 10) || this.baseZIndex_;
};

/**
 * zIndex changed MVC callback
 */
InfoBubble.prototype.zIndex_changed = function() {
	var zIndex = this.getZIndex();

	this.bubble_.style['zIndex'] = this.baseZIndex_ = zIndex;
	this.close_.style['zIndex'] = zIndex + 1;
};
InfoBubble.prototype['zIndex_changed'] = InfoBubble.prototype.zIndex_changed;

/**
 * Set the style of the shadow
 * 
 * @param {number}
 *            shadowStyle The style of the shadow.
 */
InfoBubble.prototype.setShadowStyle = function(shadowStyle) {
	this.set('shadowStyle', shadowStyle);
};
InfoBubble.prototype['setShadowStyle'] = InfoBubble.prototype.setShadowStyle;

/**
 * Get the style of the shadow
 * 
 * @private
 * @return {number} The style of the shadow.
 */
InfoBubble.prototype.getShadowStyle_ = function() {
	return parseInt(this.get('shadowStyle'), 10) || 0;
};

/**
 * shadowStyle changed MVC callback
 */
InfoBubble.prototype.shadowStyle_changed = function() {
	var shadowStyle = this.getShadowStyle_();

	var display = '';
	var shadow = '';
	var backgroundColor = '';
	switch (shadowStyle) {
	case 0:
		display = 'none';
		break;
	case 1:
		shadow = '40px 15px 10px rgba(33,33,33,0.3)';
		backgroundColor = 'transparent';
		break;
	case 2:
		shadow = '0 0 2px rgba(33,33,33,0.3)';
		backgroundColor = 'rgba(33,33,33,0.35)';
		break;
	}
	this.bubbleShadow_.style['boxShadow'] = this.bubbleShadow_.style['webkitBoxShadow'] = this.bubbleShadow_.style['MozBoxShadow'] = shadow;
	this.bubbleShadow_.style['backgroundColor'] = backgroundColor;
	if (this.isOpen_) {
		this.bubbleShadow_.style['display'] = display;
		this.draw();
	}
};
InfoBubble.prototype['shadowStyle_changed'] = InfoBubble.prototype.shadowStyle_changed;

/**
 * Show the close button
 */
InfoBubble.prototype.showCloseButton = function() {
	this.set('hideCloseButton', false);
};
InfoBubble.prototype['showCloseButton'] = InfoBubble.prototype.showCloseButton;

/**
 * Hide the close button
 */
InfoBubble.prototype.hideCloseButton = function() {
	this.set('hideCloseButton', true);
};
InfoBubble.prototype['hideCloseButton'] = InfoBubble.prototype.hideCloseButton;

/**
 * hideCloseButton changed MVC callback
 */
InfoBubble.prototype.hideCloseButton_changed = function() {
	this.close_.style['display'] = this.get('hideCloseButton') ? 'none' : '';
};
InfoBubble.prototype['hideCloseButton_changed'] = InfoBubble.prototype.hideCloseButton_changed;

/**
 * Set the background color
 * 
 * @param {string}
 *            color The color to set.
 */
InfoBubble.prototype.setBackgroundColor = function(color) {
	if (color) {
		this.set('backgroundColor', color);
	}
};
InfoBubble.prototype['setBackgroundColor'] = InfoBubble.prototype.setBackgroundColor;

/**
 * backgroundColor changed MVC callback
 */
InfoBubble.prototype.backgroundColor_changed = function() {
	var backgroundColor = this.get('backgroundColor');
	this.contentContainer_.style['backgroundColor'] = backgroundColor;

	this.arrowInner_.style['borderColor'] = backgroundColor + ' transparent transparent';
	this.updateTabStyles_();
};
InfoBubble.prototype['backgroundColor_changed'] = InfoBubble.prototype.backgroundColor_changed;

/**
 * Set the border color
 * 
 * @param {string}
 *            color The border color.
 */
InfoBubble.prototype.setBorderColor = function(color) {
	if (color) {
		this.set('borderColor', color);
	}
};
InfoBubble.prototype['setBorderColor'] = InfoBubble.prototype.setBorderColor;

/**
 * borderColor changed MVC callback
 */
InfoBubble.prototype.borderColor_changed = function() {
	var borderColor = this.get('borderColor');

	var contentContainer = this.contentContainer_;
	var arrowOuter = this.arrowOuter_;
	contentContainer.style['borderColor'] = borderColor;

	arrowOuter.style['borderColor'] = borderColor + ' transparent transparent';

	contentContainer.style['borderStyle'] = arrowOuter.style['borderStyle'] = this.arrowInner_.style['borderStyle'] = 'solid';

	this.updateTabStyles_();
};
InfoBubble.prototype['borderColor_changed'] = InfoBubble.prototype.borderColor_changed;

/**
 * Set the radius of the border
 * 
 * @param {number}
 *            radius The radius of the border.
 */
InfoBubble.prototype.setBorderRadius = function(radius) {
	this.set('borderRadius', radius);
};
InfoBubble.prototype['setBorderRadius'] = InfoBubble.prototype.setBorderRadius;

/**
 * Get the radius of the border
 * 
 * @private
 * @return {number} The radius of the border.
 */
InfoBubble.prototype.getBorderRadius_ = function() {
	return parseInt(this.get('borderRadius'), 10) || 0;
};

/**
 * borderRadius changed MVC callback
 */
InfoBubble.prototype.borderRadius_changed = function() {
	var borderRadius = this.getBorderRadius_();
	var borderWidth = this.getBorderWidth_();

	this.contentContainer_.style['borderRadius'] = this.contentContainer_.style['MozBorderRadius'] = this.contentContainer_.style['webkitBorderRadius'] = this.bubbleShadow_.style['borderRadius'] = this.bubbleShadow_.style['MozBorderRadius'] = this.bubbleShadow_.style['webkitBorderRadius'] = this
		.px(borderRadius);

	this.tabsContainer_.style['paddingLeft'] = this.tabsContainer_.style['paddingRight'] = this.px(borderRadius + borderWidth);

	this.redraw_();
};
InfoBubble.prototype['borderRadius_changed'] = InfoBubble.prototype.borderRadius_changed;

/**
 * Get the width of the border
 * 
 * @private
 * @return {number} width The width of the border.
 */
InfoBubble.prototype.getBorderWidth_ = function() {
	return parseInt(this.get('borderWidth'), 10) || 0;
};

/**
 * Set the width of the border
 * 
 * @param {number}
 *            width The width of the border.
 */
InfoBubble.prototype.setBorderWidth = function(width) {
	this.set('borderWidth', width);
};
InfoBubble.prototype['setBorderWidth'] = InfoBubble.prototype.setBorderWidth;

/**
 * borderWidth change MVC callback
 */
InfoBubble.prototype.borderWidth_changed = function() {
	var borderWidth = this.getBorderWidth_();

	this.contentContainer_.style['borderWidth'] = this.px(borderWidth);
	this.tabsContainer_.style['top'] = this.px(borderWidth);

	this.updateArrowStyle_();
	this.updateTabStyles_();
	this.borderRadius_changed();
	this.redraw_();
};
InfoBubble.prototype['borderWidth_changed'] = InfoBubble.prototype.borderWidth_changed;

/**
 * Update the arrow style
 * 
 * @private
 */
InfoBubble.prototype.updateArrowStyle_ = function() {
	var borderWidth = this.getBorderWidth_();
	var arrowSize = this.getArrowSize_();
	var arrowStyle = this.getArrowStyle_();
	var arrowOuterSizePx = this.px(arrowSize);
	var arrowInnerSizePx = this.px(Math.max(0, arrowSize - borderWidth));

	var outer = this.arrowOuter_;
	var inner = this.arrowInner_;

	this.arrow_.style['marginTop'] = this.px(-borderWidth);
	outer.style['borderTopWidth'] = arrowOuterSizePx;
	inner.style['borderTopWidth'] = arrowInnerSizePx;

	// Full arrow or arrow pointing to the left
	if (arrowStyle == 0 || arrowStyle == 1) {
		outer.style['borderLeftWidth'] = arrowOuterSizePx;
		inner.style['borderLeftWidth'] = arrowInnerSizePx;
	} else {
		outer.style['borderLeftWidth'] = inner.style['borderLeftWidth'] = 0;
	}

	// Full arrow or arrow pointing to the right
	if (arrowStyle == 0 || arrowStyle == 2) {
		outer.style['borderRightWidth'] = arrowOuterSizePx;
		inner.style['borderRightWidth'] = arrowInnerSizePx;
	} else {
		outer.style['borderRightWidth'] = inner.style['borderRightWidth'] = 0;
	}

	if (arrowStyle < 2) {
		outer.style['marginLeft'] = this.px(-(arrowSize));
		inner.style['marginLeft'] = this.px(-(arrowSize - borderWidth));
	} else {
		outer.style['marginLeft'] = inner.style['marginLeft'] = 0;
	}

	// If there is no border then don't show thw outer arrow
	if (borderWidth == 0) {
		outer.style['display'] = 'none';
	} else {
		outer.style['display'] = '';
	}
};

/**
 * Set the padding of the InfoBubble
 * 
 * @param {number}
 *            padding The padding to apply.
 */
InfoBubble.prototype.setPadding = function(padding) {
	this.set('padding', padding);
};
InfoBubble.prototype['setPadding'] = InfoBubble.prototype.setPadding;

/**
 * Set the padding of the InfoBubble
 * 
 * @private
 * @return {number} padding The padding to apply.
 */
InfoBubble.prototype.getPadding_ = function() {
	return parseInt(this.get('padding'), 10) || 0;
};

/**
 * padding changed MVC callback
 */
InfoBubble.prototype.padding_changed = function() {
	var padding = this.getPadding_();
	this.contentContainer_.style['padding'] = this.px(padding);
	this.updateTabStyles_();

	this.redraw_();
};
InfoBubble.prototype['padding_changed'] = InfoBubble.prototype.padding_changed;

/**
 * Add px extention to the number
 * 
 * @param {number}
 *            num The number to wrap.
 * @return {string|number} A wrapped number.
 */
InfoBubble.prototype.px = function(num) {
	if (num) {
		// 0 doesn't need to be wrapped
		return num + 'px';
	}
	return num;
};

/**
 * Add events to stop propagation
 * 
 * @private
 */
InfoBubble.prototype.addEvents_ = function() {
	// We want to cancel all the events so they do not go to the map
	var events = [ 'mousedown', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'mousewheel', 'DOMMouseScroll', 'touchstart',
			'touchend', 'touchmove', 'dblclick', 'contextmenu', 'click' ];

	var bubble = this.bubble_;
	this.listeners_ = [];
	for (var i = 0, event; event = events[i]; i++) {
		this.listeners_.push(google.maps.event.addDomListener(bubble, event, function(e) {
			e.cancelBubble = true;
			if (e.stopPropagation) {
				e.stopPropagation();
			}
		}));
	}
};

/**
 * On Adding the InfoBubble to a map Implementing the OverlayView interface
 */
InfoBubble.prototype.onAdd = function() {
	if (!this.bubble_) {
		this.buildDom_();
	}

	this.addEvents_();

	var panes = this.getPanes();
	if (panes) {
		panes.floatPane.appendChild(this.bubble_);
		panes.floatShadow.appendChild(this.bubbleShadow_);
	}
};
InfoBubble.prototype['onAdd'] = InfoBubble.prototype.onAdd;

/**
 * Draw the InfoBubble Implementing the OverlayView interface
 */
InfoBubble.prototype.draw = function() {
	var projection = this.getProjection();

	if (!projection) {
		// The map projection is not ready yet so do nothing
		return;
	}

	var latLng = /** @type {google.maps.LatLng} */
	(this.get('position'));

	if (!latLng) {
		this.close();
		return;
	}

	var tabHeight = 0;

	if (this.activeTab_) {
		tabHeight = this.activeTab_.offsetHeight;
	}

	var anchorHeight = this.getAnchorHeight_();
	var arrowSize = this.getArrowSize_();
	var arrowPosition = this.getArrowPosition_();

	arrowPosition = arrowPosition / 100;

	var pos = projection.fromLatLngToDivPixel(latLng);
	var width = this.contentContainer_.offsetWidth;
	var height = this.bubble_.offsetHeight;

	if (!width) {
		return;
	}

	// Adjust for the height of the info bubble
	var top = pos.y - (height + arrowSize);

	if (anchorHeight) {
		// If there is an anchor then include the height
		top -= anchorHeight;
	}

	var left = pos.x - (width * arrowPosition);

	this.bubble_.style['top'] = this.px(top);
	this.bubble_.style['left'] = this.px(left);

	var shadowStyle = parseInt(this.get('shadowStyle'), 10);

	switch (shadowStyle) {
	case 1:
		// Shadow is behind
		this.bubbleShadow_.style['top'] = this.px(top + tabHeight - 1);
		this.bubbleShadow_.style['left'] = this.px(left);
		this.bubbleShadow_.style['width'] = this.px(width);
		this.bubbleShadow_.style['height'] = this.px(this.contentContainer_.offsetHeight - arrowSize);
		break;
	case 2:
		// Shadow is below
		width = width * 0.8;
		if (anchorHeight) {
			this.bubbleShadow_.style['top'] = this.px(pos.y);
		} else {
			this.bubbleShadow_.style['top'] = this.px(pos.y + arrowSize);
		}
		this.bubbleShadow_.style['left'] = this.px(pos.x - width * arrowPosition);

		this.bubbleShadow_.style['width'] = this.px(width);
		this.bubbleShadow_.style['height'] = this.px(2);
		break;
	}
};
InfoBubble.prototype['draw'] = InfoBubble.prototype.draw;

/**
 * Removing the InfoBubble from a map
 */
InfoBubble.prototype.onRemove = function() {
	if (this.bubble_ && this.bubble_.parentNode) {
		this.bubble_.parentNode.removeChild(this.bubble_);
	}
	if (this.bubbleShadow_ && this.bubbleShadow_.parentNode) {
		this.bubbleShadow_.parentNode.removeChild(this.bubbleShadow_);
	}

	for (var i = 0, listener; listener = this.listeners_[i]; i++) {
		google.maps.event.removeListener(listener);
	}
};
InfoBubble.prototype['onRemove'] = InfoBubble.prototype.onRemove;

/**
 * Is the InfoBubble open
 * 
 * @return {boolean} If the InfoBubble is open.
 */
InfoBubble.prototype.isOpen = function() {
	return this.isOpen_;
};
InfoBubble.prototype['isOpen'] = InfoBubble.prototype.isOpen;

/**
 * Close the InfoBubble
 */
InfoBubble.prototype.close = function() {
	if (this.bubble_) {
		this.bubble_.style['display'] = 'none';
		// Remove the animation so we next time it opens it will animate again
		this.bubble_.className = this.bubble_.className.replace(this.animationName_, '');
	}

	if (this.bubbleShadow_) {
		this.bubbleShadow_.style['display'] = 'none';
		this.bubbleShadow_.className = this.bubbleShadow_.className.replace(this.animationName_, '');
	}
	this.isOpen_ = false;
};
InfoBubble.prototype['close'] = InfoBubble.prototype.close;

/**
 * Open the InfoBubble (asynchronous).
 * 
 * @param {google.maps.Map=}
 *            opt_map Optional map to open on.
 * @param {google.maps.MVCObject=}
 *            opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open = function(opt_map, opt_anchor) {
	var that = this;
	window.setTimeout(function() {
		that.open_(opt_map, opt_anchor);
	}, 0);
};

/**
 * Open the InfoBubble
 * 
 * @private
 * @param {google.maps.Map=}
 *            opt_map Optional map to open on.
 * @param {google.maps.MVCObject=}
 *            opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open_ = function(opt_map, opt_anchor) {
	this.updateContent_();

	if (opt_map) {
		this.setMap(opt_map);
	}

	if (opt_anchor) {
		this.set('anchor', opt_anchor);
		this.bindTo('anchorPoint', opt_anchor);
		this.bindTo('position', opt_anchor);
	}

	// Show the bubble and the show
	this.bubble_.style['display'] = this.bubbleShadow_.style['display'] = '';
	var animation = !this.get('disableAnimation');

	if (animation) {
		// Add the animation
		this.bubble_.className += ' ' + this.animationName_;
		this.bubbleShadow_.className += ' ' + this.animationName_;
	}

	this.redraw_();
	this.isOpen_ = true;

	var pan = !this.get('disableAutoPan');
	if (pan) {
		var that = this;
		window.setTimeout(function() {
			// Pan into view, done in a time out to make it feel nicer :)
			that.panToView();
		}, 200);
	}
};
InfoBubble.prototype['open'] = InfoBubble.prototype.open;

/**
 * Set the position of the InfoBubble
 * 
 * @param {google.maps.LatLng}
 *            position The position to set.
 */
InfoBubble.prototype.setPosition = function(position) {
	if (position) {
		this.set('position', position);
	}
};
InfoBubble.prototype['setPosition'] = InfoBubble.prototype.setPosition;

/**
 * Returns the position of the InfoBubble
 * 
 * @return {google.maps.LatLng} the position.
 */
InfoBubble.prototype.getPosition = function() {
	return /** @type {google.maps.LatLng} */
	(this.get('position'));
};
InfoBubble.prototype['getPosition'] = InfoBubble.prototype.getPosition;

/**
 * position changed MVC callback
 */
InfoBubble.prototype.position_changed = function() {
	this.draw();
};
InfoBubble.prototype['position_changed'] = InfoBubble.prototype.position_changed;

/**
 * Pan the InfoBubble into view
 */
InfoBubble.prototype.panToView = function() {
	var projection = this.getProjection();

	if (!projection) {
		// The map projection is not ready yet so do nothing
		return;
	}

	if (!this.bubble_) {
		// No Bubble yet so do nothing
		return;
	}

	var anchorHeight = this.getAnchorHeight_();
	var height = this.bubble_.offsetHeight + anchorHeight;
	var map = this.get('map');
	var mapDiv = map.getDiv();
	var mapHeight = mapDiv.offsetHeight;

	var latLng = this.getPosition();
	var centerPos = projection.fromLatLngToContainerPixel(map.getCenter());
	var pos = projection.fromLatLngToContainerPixel(latLng);

	// Find out how much space at the top is free
	var spaceTop = centerPos.y - height;

	// Fine out how much space at the bottom is free
	var spaceBottom = mapHeight - centerPos.y;

	var needsTop = spaceTop < 0;
	var deltaY = 0;

	if (needsTop) {
		spaceTop *= -1;
		deltaY = (spaceTop + spaceBottom) / 2;
	}

	pos.y -= deltaY;
	latLng = projection.fromContainerPixelToLatLng(pos);

	if (map.getCenter() != latLng) {
		map.panTo(latLng);
	}
};
InfoBubble.prototype['panToView'] = InfoBubble.prototype.panToView;

/**
 * Converts a HTML string to a document fragment.
 * 
 * @param {string}
 *            htmlString The HTML string to convert.
 * @return {Node} A HTML document fragment.
 * @private
 */
InfoBubble.prototype.htmlToDocumentFragment_ = function(htmlString) {
	htmlString = htmlString.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
	var tempDiv = document.createElement('DIV');
	tempDiv.innerHTML = htmlString;
	if (tempDiv.childNodes.length == 1) {
		return /** @type {!Node} */
		(tempDiv.removeChild(tempDiv.firstChild));
	} else {
		var fragment = document.createDocumentFragment();
		while (tempDiv.firstChild) {
			fragment.appendChild(tempDiv.firstChild);
		}
		return fragment;
	}
};

/**
 * Removes all children from the node.
 * 
 * @param {Node}
 *            node The node to remove all children from.
 * @private
 */
InfoBubble.prototype.removeChildren_ = function(node) {
	if (!node) {
		return;
	}

	var child;
	while (child = node.firstChild) {
		node.removeChild(child);
	}
};

/**
 * Sets the content of the infobubble.
 * 
 * @param {string|Node}
 *            content The content to set.
 */
InfoBubble.prototype.setContent = function(content) {
	this.set('content', content);
};
InfoBubble.prototype['setContent'] = InfoBubble.prototype.setContent;

/**
 * Get the content of the infobubble.
 * 
 * @return {string|Node} The marker content.
 */
InfoBubble.prototype.getContent = function() {
	return /** @type {Node|string} */
	(this.get('content'));
};
InfoBubble.prototype['getContent'] = InfoBubble.prototype.getContent;

/**
 * Sets the marker content and adds loading events to images
 */
InfoBubble.prototype.updateContent_ = function() {
	if (!this.content_) {
		// The Content area doesnt exist.
		return;
	}

	this.removeChildren_(this.content_);
	var content = this.getContent();
	if (content) {
		if (typeof content == 'string') {
			content = this.htmlToDocumentFragment_(content);
		}
		this.content_.appendChild(content);

		var that = this;
		var images = this.content_.getElementsByTagName('IMG');
		for (var i = 0, image; image = images[i]; i++) {
			// Because we don't know the size of an image till it loads, add a
			// listener to the image load so the marker can resize and
			// reposition
			// itself to be the correct height.
			google.maps.event.addDomListener(image, 'load', function() {
				that.imageLoaded_();
			});
		}
		google.maps.event.trigger(this, 'domready');
	}
	this.redraw_();
};

/**
 * Image loaded
 * 
 * @private
 */
InfoBubble.prototype.imageLoaded_ = function() {
	var pan = !this.get('disableAutoPan');
	this.redraw_();
	if (pan && (this.tabs_.length == 0 || this.activeTab_.index == 0)) {
		this.panToView();
	}
};

/**
 * Updates the styles of the tabs
 * 
 * @private
 */
InfoBubble.prototype.updateTabStyles_ = function() {
	if (this.tabs_ && this.tabs_.length) {
		for (var i = 0, tab; tab = this.tabs_[i]; i++) {
			this.setTabStyle_(tab.tab);
		}
		this.activeTab_.style['zIndex'] = this.baseZIndex_;
		var borderWidth = this.getBorderWidth_();
		var padding = this.getPadding_() / 2;
		this.activeTab_.style['borderBottomWidth'] = 0;
		this.activeTab_.style['paddingBottom'] = this.px(padding + borderWidth);
	}
};

/**
 * Sets the style of a tab
 * 
 * @private
 * @param {Element}
 *            tab The tab to style.
 */
InfoBubble.prototype.setTabStyle_ = function(tab) {
	var backgroundColor = this.get('backgroundColor');
	var borderColor = this.get('borderColor');
	var borderRadius = this.getBorderRadius_();
	var borderWidth = this.getBorderWidth_();
	var padding = this.getPadding_();

	var marginRight = this.px(-(Math.max(padding, borderRadius)));
	var borderRadiusPx = this.px(borderRadius);

	var index = this.baseZIndex_;
	if (tab.index) {
		index -= tab.index;
	}

	// The styles for the tab
	var styles = {
		'cssFloat' : 'left',
		'position' : 'relative',
		'cursor' : 'pointer',
		'backgroundColor' : backgroundColor,
		'border' : this.px(borderWidth) + ' solid ' + borderColor,
		'padding' : this.px(padding / 2) + ' ' + this.px(padding),
		'marginRight' : marginRight,
		'whiteSpace' : 'nowrap',
		'borderRadiusTopLeft' : borderRadiusPx,
		'MozBorderRadiusTopleft' : borderRadiusPx,
		'webkitBorderTopLeftRadius' : borderRadiusPx,
		'borderRadiusTopRight' : borderRadiusPx,
		'MozBorderRadiusTopright' : borderRadiusPx,
		'webkitBorderTopRightRadius' : borderRadiusPx,
		'zIndex' : index,
		'display' : 'inline'
	};

	for ( var style in styles) {
		tab.style[style] = styles[style];
	}

	var className = this.get('tabClassName');
	if (className != undefined) {
		tab.className += ' ' + className;
	}
};

/**
 * Add user actions to a tab
 * 
 * @private
 * @param {Object}
 *            tab The tab to add the actions to.
 */
InfoBubble.prototype.addTabActions_ = function(tab) {
	var that = this;
	tab.listener_ = google.maps.event.addDomListener(tab, 'click', function() {
		that.setTabActive_(this);
	});
};

/**
 * Set a tab at a index to be active
 * 
 * @param {number}
 *            index The index of the tab.
 */
InfoBubble.prototype.setTabActive = function(index) {
	var tab = this.tabs_[index - 1];

	if (tab) {
		this.setTabActive_(tab.tab);
	}
};
InfoBubble.prototype['setTabActive'] = InfoBubble.prototype.setTabActive;

/**
 * Set a tab to be active
 * 
 * @private
 * @param {Object}
 *            tab The tab to set active.
 */
InfoBubble.prototype.setTabActive_ = function(tab) {
	if (!tab) {
		this.setContent('');
		this.updateContent_();
		return;
	}

	var padding = this.getPadding_() / 2;
	var borderWidth = this.getBorderWidth_();

	if (this.activeTab_) {
		var activeTab = this.activeTab_;
		activeTab.style['zIndex'] = this.baseZIndex_ - activeTab.index;
		activeTab.style['paddingBottom'] = this.px(padding);
		activeTab.style['borderBottomWidth'] = this.px(borderWidth);
	}

	tab.style['zIndex'] = this.baseZIndex_;
	tab.style['borderBottomWidth'] = 0;
	tab.style['marginBottomWidth'] = '-10px';
	tab.style['paddingBottom'] = this.px(padding + borderWidth);

	this.setContent(this.tabs_[tab.index].content);
	this.updateContent_();

	this.activeTab_ = tab;

	this.redraw_();
};

/**
 * Set the max width of the InfoBubble
 * 
 * @param {number}
 *            width The max width.
 */
InfoBubble.prototype.setMaxWidth = function(width) {
	this.set('maxWidth', width);
};
InfoBubble.prototype['setMaxWidth'] = InfoBubble.prototype.setMaxWidth;

/**
 * maxWidth changed MVC callback
 */
InfoBubble.prototype.maxWidth_changed = function() {
	this.redraw_();
};
InfoBubble.prototype['maxWidth_changed'] = InfoBubble.prototype.maxWidth_changed;

/**
 * Set the max height of the InfoBubble
 * 
 * @param {number}
 *            height The max height.
 */
InfoBubble.prototype.setMaxHeight = function(height) {
	this.set('maxHeight', height);
};
InfoBubble.prototype['setMaxHeight'] = InfoBubble.prototype.setMaxHeight;

/**
 * maxHeight changed MVC callback
 */
InfoBubble.prototype.maxHeight_changed = function() {
	this.redraw_();
};
InfoBubble.prototype['maxHeight_changed'] = InfoBubble.prototype.maxHeight_changed;

/**
 * Set the min width of the InfoBubble
 * 
 * @param {number}
 *            width The min width.
 */
InfoBubble.prototype.setMinWidth = function(width) {
	this.set('minWidth', width);
};
InfoBubble.prototype['setMinWidth'] = InfoBubble.prototype.setMinWidth;

/**
 * minWidth changed MVC callback
 */
InfoBubble.prototype.minWidth_changed = function() {
	this.redraw_();
};
InfoBubble.prototype['minWidth_changed'] = InfoBubble.prototype.minWidth_changed;

/**
 * Set the min height of the InfoBubble
 * 
 * @param {number}
 *            height The min height.
 */
InfoBubble.prototype.setMinHeight = function(height) {
	this.set('minHeight', height);
};
InfoBubble.prototype['setMinHeight'] = InfoBubble.prototype.setMinHeight;

/**
 * minHeight changed MVC callback
 */
InfoBubble.prototype.minHeight_changed = function() {
	this.redraw_();
};
InfoBubble.prototype['minHeight_changed'] = InfoBubble.prototype.minHeight_changed;

/**
 * Add a tab
 * 
 * @param {string}
 *            label The label of the tab.
 * @param {string|Element}
 *            content The content of the tab.
 */
InfoBubble.prototype.addTab = function(label, content) {
	var tab = document.createElement('DIV');
	tab.innerHTML = label;

	this.setTabStyle_(tab);
	this.addTabActions_(tab);

	this.tabsContainer_.appendChild(tab);

	this.tabs_.push({
		label : label,
		content : content,
		tab : tab
	});

	tab.index = this.tabs_.length - 1;
	tab.style['zIndex'] = this.baseZIndex_ - tab.index;

	if (!this.activeTab_) {
		this.setTabActive_(tab);
	}

	tab.className = tab.className + ' ' + this.animationName_;

	this.redraw_();
};
InfoBubble.prototype['addTab'] = InfoBubble.prototype.addTab;

/**
 * Update a tab at a speicifc index
 * 
 * @param {number}
 *            index The index of the tab.
 * @param {?string}
 *            opt_label The label to change to.
 * @param {?string}
 *            opt_content The content to update to.
 */
InfoBubble.prototype.updateTab = function(index, opt_label, opt_content) {
	if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
		return;
	}

	var tab = this.tabs_[index];
	if (opt_label != undefined) {
		tab.tab.innerHTML = tab.label = opt_label;
	}

	if (opt_content != undefined) {
		tab.content = opt_content;
	}

	if (this.activeTab_ == tab.tab) {
		this.setContent(tab.content);
		this.updateContent_();
	}
	this.redraw_();
};
InfoBubble.prototype['updateTab'] = InfoBubble.prototype.updateTab;

/**
 * Remove a tab at a specific index
 * 
 * @param {number}
 *            index The index of the tab to remove.
 */
InfoBubble.prototype.removeTab = function(index) {
	if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
		return;
	}

	var tab = this.tabs_[index];
	tab.tab.parentNode.removeChild(tab.tab);

	google.maps.event.removeListener(tab.tab.listener_);

	this.tabs_.splice(index, 1);

	delete tab;

	for (var i = 0, t; t = this.tabs_[i]; i++) {
		t.tab.index = i;
	}

	if (tab.tab == this.activeTab_) {
		// Removing the current active tab
		if (this.tabs_[index]) {
			// Show the tab to the right
			this.activeTab_ = this.tabs_[index].tab;
		} else if (this.tabs_[index - 1]) {
			// Show a tab to the left
			this.activeTab_ = this.tabs_[index - 1].tab;
		} else {
			// No tabs left to sho
			this.activeTab_ = undefined;
		}

		this.setTabActive_(this.activeTab_);
	}

	this.redraw_();
};
InfoBubble.prototype['removeTab'] = InfoBubble.prototype.removeTab;

/**
 * Get the size of an element
 * 
 * @private
 * @param {Node|string}
 *            element The element to size.
 * @param {number=}
 *            opt_maxWidth Optional max width of the element.
 * @param {number=}
 *            opt_maxHeight Optional max height of the element.
 * @return {google.maps.Size} The size of the element.
 */
InfoBubble.prototype.getElementSize_ = function(element, opt_maxWidth, opt_maxHeight) {
	var sizer = document.createElement('DIV');
	sizer.style['display'] = 'inline';
	sizer.style['position'] = 'absolute';
	sizer.style['visibility'] = 'hidden';

	if (typeof element == 'string') {
		sizer.innerHTML = element;
	} else {
		sizer.appendChild(element.cloneNode(true));
	}

	document.body.appendChild(sizer);
	var size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);

	// If the width is bigger than the max width then set the width and size
	// again
	if (opt_maxWidth && size.width > opt_maxWidth) {
		sizer.style['width'] = this.px(opt_maxWidth);
		size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
	}

	// If the height is bigger than the max height then set the height and size
	// again
	if (opt_maxHeight && size.height > opt_maxHeight) {
		sizer.style['height'] = this.px(opt_maxHeight);
		size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
	}

	document.body.removeChild(sizer);
	delete sizer;
	return size;
};

/**
 * Redraw the InfoBubble
 * 
 * @private
 */
InfoBubble.prototype.redraw_ = function() {
	this.figureOutSize_();
	this.positionCloseButton_();
	this.draw();
};

/**
 * Figure out the optimum size of the InfoBubble
 * 
 * @private
 */
InfoBubble.prototype.figureOutSize_ = function() {
	var map = this.get('map');

	if (!map) {
		return;
	}

	var padding = this.getPadding_();
	var borderWidth = this.getBorderWidth_();
	var borderRadius = this.getBorderRadius_();
	var arrowSize = this.getArrowSize_();

	var mapDiv = map.getDiv();
	var gutter = arrowSize * 2;
	var mapWidth = mapDiv.offsetWidth - gutter;
	var mapHeight = mapDiv.offsetHeight - gutter - this.getAnchorHeight_();
	var tabHeight = 0;
	var width = /** @type {number} */
	(this.get('minWidth') || 0);
	var height = /** @type {number} */
	(this.get('minHeight') || 0);
	var maxWidth = /** @type {number} */
	(this.get('maxWidth') || 0);
	var maxHeight = /** @type {number} */
	(this.get('maxHeight') || 0);

	maxWidth = Math.min(mapWidth, maxWidth);
	maxHeight = Math.min(mapHeight, maxHeight);

	var tabWidth = 0;
	if (this.tabs_.length) {
		// If there are tabs then you need to check the size of each tab's
		// content
		for (var i = 0, tab; tab = this.tabs_[i]; i++) {
			var tabSize = this.getElementSize_(tab.tab, maxWidth, maxHeight);
			var contentSize = this.getElementSize_(tab.content, maxWidth, maxHeight);

			if (width < tabSize.width) {
				width = tabSize.width;
			}

			// Add up all the tab widths because they might end up being wider
			// than
			// the content
			tabWidth += tabSize.width;

			if (height < tabSize.height) {
				height = tabSize.height;
			}

			if (tabSize.height > tabHeight) {
				tabHeight = tabSize.height;
			}

			if (width < contentSize.width) {
				width = contentSize.width;
			}

			if (height < contentSize.height) {
				height = contentSize.height;
			}
		}
	} else {
		var content = /** @type {string|Node} */
		(this.get('content'));
		if (typeof content == 'string') {
			content = this.htmlToDocumentFragment_(content);
		}
		if (content) {
			var contentSize = this.getElementSize_(content, maxWidth, maxHeight);

			if (width < contentSize.width) {
				width = contentSize.width;
			}

			if (height < contentSize.height) {
				height = contentSize.height;
			}
		}
	}

	if (maxWidth) {
		width = Math.min(width, maxWidth);
	}

	if (maxHeight) {
		height = Math.min(height, maxHeight);
	}

	width = Math.max(width, tabWidth);

	if (width == tabWidth) {
		width = width + 2 * padding;
	}

	arrowSize = arrowSize * 2;
	width = Math.max(width, arrowSize);

	// Maybe add this as a option so they can go bigger than the map if the user
	// wants
	if (width > mapWidth) {
		width = mapWidth;
	}

	if (height > mapHeight) {
		height = mapHeight - tabHeight;
	}

	if (this.tabsContainer_) {
		this.tabHeight_ = tabHeight;
		this.tabsContainer_.style['width'] = this.px(tabWidth);
	}

	this.contentContainer_.style['width'] = this.px(width);
	this.contentContainer_.style['height'] = this.px(height);
};

/**
 * Get the height of the anchor
 * 
 * This function is a hack for now and doesn't really work that good, need to
 * wait for pixelBounds to be correctly exposed.
 * 
 * @private
 * @return {number} The height of the anchor.
 */
InfoBubble.prototype.getAnchorHeight_ = function() {
	var anchor = this.get('anchor');
	if (anchor) {
		var anchorPoint = /** @type google.maps.Point */
		(this.get('anchorPoint'));

		if (anchorPoint) {
			return -1 * anchorPoint.y;
		}
	}
	return 0;
};

InfoBubble.prototype.anchorPoint_changed = function() {
	this.draw();
};
InfoBubble.prototype['anchorPoint_changed'] = InfoBubble.prototype.anchorPoint_changed;

/**
 * Position the close button in the right spot.
 * 
 * @private
 */
InfoBubble.prototype.positionCloseButton_ = function() {
	var br = this.getBorderRadius_();
	var bw = this.getBorderWidth_();

	var right = 2;
	var top = 2;

	if (this.tabs_.length && this.tabHeight_) {
		top += this.tabHeight_;
	}

	top += bw;
	right += bw;

	var c = this.contentContainer_;
	if (c && c.clientHeight < c.scrollHeight) {
		// If there are scrollbars then move the cross in so it is not over
		// scrollbar
		right += 15;
	}

	this.close_.style['right'] = this.px(right);
	this.close_.style['top'] = this.px(top);
};

var EWA_GMapClass = function() {
	this.geocoder;
	this.map;
	this.option; // 地图属性
	this.center; // 中心点
	this.zoom = 14;
	this.markers = {};
	this.zIndex = 1001;
	/**
	 * 
	 */
	this.init = function(zoom) {
		this.geocoder = new google.maps.Geocoder();
		if (zoom) {
			this.zoom = zoom;
		}
	};
	this.clearMarkers = function() {
		for ( var n in this.markers) {
			this.markers[n].setMap(null);
			this.markers[n] = null;
		}
		this.markers = {};

	}

	/**
	 * 显示多个Marker
	 * 
	 * @param parentId
	 *            地图容器ID
	 * @param datas
	 *            JSON数据
	 * @param lon_name
	 *            纬度字段名称
	 * @param lat_name
	 *            经度字段名称
	 * @param title_name
	 *            标题字段名称
	 * @param id_name
	 *            主编号字段名称
	 * @param icon
	 *            图标
	 * 
	 */
	this.showMaps = function(parentId, datas, lon_name, lat_name, title_name, id_name, icon) {
		if (id_name == null || id_name == '') {
			alert('需要参数id_name');
			return;
		}
		if (parentId == null || parentId == '') {
			alert('需要参数 parentId');
			return;
		}
		if (datas == null || datas == '') {
			alert('需要参数 datas');
			return;
		}
		if (lon_name == null || lon_name == '') {
			alert('需要参数 lon_name');
			return;
		}
		if (lat_name == null || lat_name == '') {
			alert('需要参数 lat_name');
			return;
		}
		if (title_name == null || title_name == '') {
			alert('需要参数 title_name');
			return;
		}
		var datas1 = [];
		for ( var n in datas) {
			var d = datas[n];
			if (isNaN(d[lat_name]) || isNaN(d[lon_name])) {
				console.log(d);
				continue;
			}
			if (d[lat_name] == null || d[lon_name] == null) {
				console.log(d);
				continue;
			}
			if (d[lat_name] == 0 || d[lon_name] == 0) {
				console.log(d);
				continue;
			}
			datas1.push(d);
		}
		if (datas1.length == 0) {
			return;
		}

		if (this.map) {
			this.map.setOptions(mapOptions);
		} else {
			var obj = $X(parentId);
			var haightAshbury = new google.maps.LatLng(datas1[0][lat_name] * 1, datas1[0][lon_name] * 1);

			var mapOptions = {
				zoom : this.zoom,
				center : haightAshbury,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};
			this.options = mapOptions;
			this.center = haightAshbury;

			this.map = new google.maps.Map(obj, mapOptions);
		}
		var c = this;
		for (var i = 0; i < datas1.length; i++) {
			var d = datas1[i];
			var poistion = new google.maps.LatLng(d[lat_name] * 1, d[lon_name] * 1);
			var opt;
			if (icon) {
				opt = {
					position : poistion,
					title : d[title_name],
					icon : icon,// image of http url
					map : this.map
				};
			} else {
				opt = {
					position : poistion,
					title : d[title_name],
					map : this.map
				};
			}
			var marker = this.markers[d[id_name]];
			if (marker) {
				marker.setMap(null);
			}
			marker = new google.maps.Marker(opt);
			var marker_id = 'ewa_' + d[id_name];

			marker.__ewaid = marker_id; // id
			marker.__ewadata = d; // 数据

			this.markers[d[id_name]] = marker;
			this.showinfomessage(marker, "<div id='" + marker_id + "'>" + d[title_name] + "</div>");
		}
	};
	/**
	 * 在自己的网页中嵌入google
	 * map，可以添加多个marker，但是在通过点击操作显示infowindow时，由于添加marker是用的是循环，所以每次都是在最后一个
	 * marker上显示infowindow。
	 * 
	 * 2、问题分析：
	 * 刚开始把添加marker和infowindow放在一个函数中去了，没有使用函数功能。结果marker它会认为是一个图标，所以总是显示最后一个，而不是对应每一个。
	 */
	this.showinfomessage = function(marker, content) {
		var infowindow = new google.maps.InfoWindow({
			content : content
		});
		var c = this;
		google.maps.event.addListener(marker, 'click', function(event) {
			infowindow.open(c.map, marker);
			c.showMarker(marker.__ewaid.replace('ewa_', ''));

			if (c.markerClickEvent) {
				c.markerClickEvent(marker);
			}
		});
	};
	this.fitBounds = function() {
		var bounds = new google.maps.LatLngBounds();
		for ( var n in this.markers) {
			var marker = this.markers[n];
			var icon = "//maps.googleapis.com/mapfiles/marker_green.png";
			var p = marker.getPosition();
			bounds.extend(p);
		}
		this.map.fitBounds(bounds);
	};
	this.showMarkers = function(mark_ids) {
		if (this.lastShowMarker) {
			this.lastShowMarker.setIcon();
			this.lastShowMarker.setAnimation();
			this.lastShowMarker = null;
		}
		var cnt = 0;
		var bounds = new google.maps.LatLngBounds();
		for ( var n in mark_ids) {
			var mark_id = mark_ids[n];
			if (!this.markers[mark_id]) {
				continue;
			}
			var marker = this.markers[mark_id];
			var icon = "//maps.googleapis.com/mapfiles/marker_green.png";
			marker.setAnimation(google.maps.Animation.BOUNCE);
			marker.setIcon(icon);
			cnt++;
			marker.setZIndex(this.zIndex);
			this.zIndex++;
			var p = marker.getPosition();
			bounds.extend(p);
		}

		if (cnt == 0) {
			return;
		}
		this.map.fitBounds(bounds);
	};
	this.showMarker = function(mark_id) {
		if (this.lastShowMarker) {
			this.lastShowMarker.setIcon();
			this.lastShowMarker.setAnimation();
			this.lastShowMarker = null;
		}
		if (!this.markers[mark_id]) {
			return;
		}

		var marker = this.markers[mark_id];
		if (marker.map.getZoom() < 18) {
			marker.map.setZoom(18);
		}
		var icon = "//maps.googleapis.com/mapfiles/marker_green.png";
		marker.map.setCenter(marker.getPosition());
		marker.setIcon(icon);
		
		marker.setZIndex(this.zIndex);
		this.zIndex++;
		
		marker.setAnimation(google.maps.Animation.BOUNCE);
		this.lastShowMarker = marker;
		setTimeout(function(){
			marker.setAnimation(null);
		},1110);
	};
	this.hilightMarker = function(mark_id) {
		if (this.lastShowMarker) {
			this.lastShowMarker.setIcon();
			this.lastShowMarker.setAnimation();
			this.lastShowMarker = null;
		}
		if (!this.markers[mark_id]) {
			return;
		}

		var marker = this.markers[mark_id];
		var icon = "//maps.googleapis.com/mapfiles/marker_green.png";
		marker.map.setCenter(marker.getPosition());
		marker.setIcon(icon);

		this.zIndex++;
		marker.setZIndex(this.zIndex);
		
		this.lastShowMarker = marker;
	};
	this.showPath = function(p0, p1, func) {
		var map = this.map;
		var directionsService = new google.maps.DirectionsService(); // 实例构造
		var directionsDisplay = new google.maps.DirectionsRenderer({
			markerOptions : {
				'map' : map
			}
		// 行车路线
		});
		directionsDisplay.setMap(map);
		var request = {
			origin : p0, // 起点
			destination : p1, // 终点
			optimizeWaypoints : false, // 为true，重新排列中间路标顺序，最大程度降低路线整体成本
			travelMode : google.maps.TravelMode.DRIVING, // 驾车路线
			unitSystem : google.maps.UnitSystem.METRIC
		// 单位为米
		};
		directionsService.route(request, function(response, status) {
			console.log(response);
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response); // 将返回的路线信息赋给directionsDisplay，显示在地图上

				if (func) {
					func(response);
				}
			} else {
			}
		});
	};
	this.showPathInfo = function(response) {
		if (response.routes.length == 0) {
			return "No";
		}
		var r1 = response.routes[0];
		var distance = r1.legs[0].distance.value;
		var ss = [];
		for (var i = 0; i < r1.legs[0].steps.length; i++) {
			var step = r1.legs[0].steps[i];
			var info = step.instructions;
			var dis = step.distiance;
			ss.push(info);
			ss.push(dis);
		}
		return [ distance, ss ];
	};
	this.getPath = function(p0, p1, func) {
		var directionsService = new google.maps.DirectionsService(); // 实例构造
		var request = {
			origin : p0, // 起点
			destination : p1, // 终点
			optimizeWaypoints : false, // 为true，重新排列中间路标顺序，最大程度降低路线整体成本
			travelMode : google.maps.TravelMode.DRIVING, // 驾车路线
			unitSystem : google.maps.UnitSystem.METRIC
		// 单位为米
		};
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				if (func) {
					func(response);
				}
			} else {
			}
		});
	};
	this.showMap = function(parentId, lon, lat, title, icon) {
		var haightAshbury = new google.maps.LatLng(lat * 1, lon * 1);

		if (this.map) {
			this.map.setOptions(mapOptions);
		} else {
			var obj = document.getElementById(parentId);
			var mapOptions = {
				zoom : this.zoom,
				center : haightAshbury,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			this.map = new google.maps.Map(obj, mapOptions);
		}
		var marker;
		if (icon) {
			marker = new google.maps.Marker({
				position : haightAshbury,
				title : title,
				icon : icon,// image of http url
				map : this.map
			});
		} else {
			marker = new google.maps.Marker({
				position : haightAshbury,
				title : title,
				map : this.map
			});
		}
		var c = this;
		var infoWindow = new google.maps.InfoWindow({
			content : title
		});
		google.maps.event.addListener(marker, 'click', function(e) {
			infoWindow.open(c.map, marker);
		});
		return haightAshbury;
	}
	/**
	 * 根据地址获取GPS信息
	 * 
	 * @param {Object}
	 *            address 地址信息
	 * @param {Object}
	 *            func 查询结果出来的调用方法
	 * @param {Object}
	 *            onerror 查询结果错误的调用方法
	 */
	this.getGpsFromAddress = function(address, func, onerror) {
		this.geocoder.geocode({
			'address' : address
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var o = EWA_GMapAddr(address, results);
				EWA.LAST_MAP_INFO = o;
				if (func != null) {
					func(address, results, o);
				}
			} else {

				EWA.LAST_MAP_INFO = null;
				if (onerror) {
					onerror(address, status);
				} else {
					console.log(address, status);
				}

			}
		});
	};

	/**
	 * 标记点击事件，需覆盖
	 */
	this.markerClickEvent = function(marker) {
		console.log(marker);
	}
	this.init();
}

function EWA_GMapAddr(address, results) {
	var rst = results[0];
	var names = rst.address_components;
	var o = {};
	for (var i = 0; i < names.length; i++) {
		var name = names[i];
		if (name.types[0] == 'establishment') {
			o.Q_NAME = name['long_name'];
		} else if (name.types[0] == 'administrative_area_level_1') { // 州/省
			o.Q_STATE = name['long_name'];
			o.Q_STATE_S = name['short_name'];
		} else if (name.types[0] == 'postal_code') { // 邮政编码
			o.Q_ZIP = name['short_name'];
		} else if (name.types[0] == 'administrative_area_level_2' || name.types[0] == 'locality') { // 城市
			o.Q_CITY = name['long_name'];
			o.Q_CITY_S = name['short_name'];
		} else if (name.types[0] == 'country') { // 国家
			o.Q_COUNTRY = name['long_name'];
			o.Q_COUNTRY_S = name['short_name'];
		}
	}
	o.Q_ADDR = rst.formatted_address;
	var lbs = rst.geometry.location;
	o.Q_LAT = lbs.lat();
	o.Q_LNG = lbs.lng();
	o.Q_GOOGLE = EWA.JSON.stringify(results);
	o.Q_SEARCH = address;
	return o;
}
/*
 * var gps=new EWA_GMapClass(); gps.init();
 * gps.getGpsFromAddress("北京",function(addr,result){ console.log(addr);
 * console.log(result) }) ;
 */
