'use strict';

/**
 * MasonryMixin
 */
var isBrowser = (typeof window !== 'undefined');
var Masonry = isBrowser ? window.Masonry : null;
var imagesloaded = isBrowser ? window.imagesLoaded : null;
var MasonryMixin = function(reference, options) {
    return {
        masonry: false,

        domChildren: [],

        initializeMasonry: function(force) {
            if (!this.masonry || force) {
                this.masonry = new Masonry(this.refs[reference].getDOMNode(), options);
                this.domChildren = this.getNewDomChildren();
            }
        },

        getNewDomChildren: function () {
            var node = this.refs[reference].getDOMNode();
            var children = options.itemSelector ? node.querySelectorAll(options.itemSelector) : node.children;

            return Array.prototype.slice.call(children);
        },

        diffDomChildren: function() {
            var oldChildren = this.domChildren;
            var newChildren = this.getNewDomChildren();

            var removed = oldChildren.filter(function(oldChild) {
                return !~newChildren.indexOf(oldChild);
            });

            var added = newChildren.filter(function(newChild) {
                return !~oldChildren.indexOf(newChild);
            });

            var moved = [];

            if (removed.length === 0) {
                moved = oldChildren.filter(function(child, index) {
                    return index !== newChildren.indexOf(child);
                });
            }

            this.domChildren = newChildren;

            return {
                old: oldChildren,
                'new': newChildren, // fix for ie8
                removed: removed,
                added: added,
                moved: moved
            };
        },

        performLayout: function() {
            var diff = this.diffDomChildren();

            if (diff.removed.length > 0) {
                this.masonry.remove(diff.removed);
                this.masonry.reloadItems();
            }

            if (diff.added.length > 0) {
                this.masonry.appended(diff.added);
            }

            if (diff.moved.length > 0) {
                this.masonry.reloadItems();
            }

            this.masonry.layout();
        },

        imagesLoaded: function() {
            imagesloaded(this.refs[reference].getDOMNode(), function(instance) {
                this.masonry.layout();
            }.bind(this));
        },

        componentDidMount: function() {
            if (!isBrowser) return;

            this.initializeMasonry();
            this.performLayout();
            this.imagesLoaded();
        },

        componentDidUpdate: function() {
            if (!isBrowser) return;

            this.performLayout();
            this.imagesLoaded();
        },

        componentWillReceiveProps: function() {
            this._timer = setTimeout(function() {
                this.masonry.reloadItems();
                this.forceUpdate();
            }.bind(this), 0);
        },

        componentWillUnmount: function() {
            clearTimeout(this._timer);
        }
    };
};

var Photo = React.createClass({displayName: "Photo",

	propType: {
		image: React.PropTypes.object.isRquired,
		show: React.PropTypes.bool.isRquired
	},

	render: function() {
		var link = (this.props.show) ? this.props.image.sizes.Medium.source : '';
		return React.createElement("div", {className: "photo", onClick: this.props.onClick}, React.createElement("img", {src: link}));
	}

});

var PhotoSet = React.createClass({displayName: "PhotoSet",

	propType: {
		photoset: React.PropTypes.object.isRquired,
		isCurrent: React.PropTypes.bool.isRequired
	},

	mixins: [
		MasonryMixin('photos', {})
	],

	getInitialState: function () {
	    return {
	        showPhotoBox: false  
	    };
	},

	handleClick: function(e) {
		e.preventDefault();
		this.displayPhotoBox(e.target.src);
	},

	displayPhotoBox: function(link) {
		var img,
				display = this.refs.photoBox.getDOMNode();
		img = document.createElement('img');
		img.src = link;
		display.appendChild(img);
		this.setState({showPhotoBox: !this.state.showPhotoBox});
	},

	removePhotoBox: function() {
		this.refs.photoBox.getDOMNode().childNodes[1].remove();
		this.setState({showPhotoBox: !this.state.showPhotoBox});
	},

	render: function() {
		var self = this,
				cx = React.addons.classSet;

		var photos = $.map(this.props.photoset.images, function(img,k) {
			if (!img.rearSide) {
				return React.createElement(Photo, {key: k, show: self.props.isCurrent, image: img, onClick: self.handleClick});
			}
		});

		var setClasses = cx({
			'photoset': true,
			'visible': this.props.isCurrent
		});

		var photoBoxStyles = {
			'display': this.state.showPhotoBox ? 'block' : 'none',
			'boxSizing': 'border-box',
			'position': 'absolute',
			'width': '100%',
			'height': '100vh',
			'padding': '2%',
			'zIndex': 10
		};
		
		return (
			React.createElement("div", {className: setClasses, styles: "position:relative"}, 
				React.createElement("div", {class: "description"}, 
					React.createElement("p", null, this.props.photoset.unitdate), 
					React.createElement("p", null, this.props.photoset.unittitle)
				), 
				React.createElement("div", {className: "photoBox", ref: "photoBox", style: photoBoxStyles}, 
					React.createElement("a", {className: "close", onClick: this.removePhotoBox}, "Close")
				), 
				React.createElement("div", {className: "photos", ref: "photos"}, 
					photos
				)
			)
		);

	}

});

var Slider = React.createClass({displayName: "Slider",

	propType: {
		photosets: React.PropTypes.array.isRequired
	},

	getInitialState: function() {
		return {
			currSetId: 0
		};
	},

	componentDidMount: function() {
    window.addEventListener('keydown', this.onKeydown, true);
    subscribe('/photoset/select', this.selectPhotoset);
  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this.onKeydown, true);
  },

	onKeydown: function(e) {
		if (e.keyCode === 39) {  // Right
			this.slide('right');
		}
		if (e.keyCode === 37) {  // Left.
			this.slide('left');
		}
	},

	slide: function(direction) {
		var vector = (direction === 'right') ? 1 : -1,
				nextId = this.state.currSetId+vector;
		if ( !this.inBound(nextId) ) return;
		this.setState({'currSetId': this.state.currSetId+vector});
	},

	inBound: function(newId) {
		return newId >= 0 && newId < this.props.photosets.length;
	},

	selectPhotoset: function(setId) {
		console.log('Slider::selectPhotoset() called with:', setId);
		var id; 
		if (typeof setId !== 'string') {
			alert('Id provided not a string.');
			return;
		}
		id = parseInt(setId.split('_')[1]);
		if (!this.inBound(id)) {
			alert('Index is out of bound.');
			return;
		}
		this.setState({currSetId: id-1});
	},

	render: function() {
		var self = this;

		var sets = $.map(this.props.photosets, function(v,k) {
			var current = (self.state.currSetId === k) ? true : false;
			if (v.images) 
				return React.createElement(PhotoSet, {key: k, photoset: v, isCurrent: current});
		});

		return (
			React.createElement("div", {className: "slider", onScroll: this.onScroll}, 
				React.createElement("div", {className: "sliderWrap"}, 
					sets
				)
			)
		);
	}

});

var PictureViewport = React.createClass({displayName: "PictureViewport",

	propType: {
		photosets: React.PropTypes.object.isRequired,
	},

	render: function() {
		return React.createElement(Slider, {photosets: this.props.photosets});
	}

});