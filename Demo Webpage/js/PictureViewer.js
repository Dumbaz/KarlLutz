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
		link: React.PropTypes.string.isRquired,
		show: React.PropTypes.bool.isRquired
	},

	render: function() {
		var link = (this.props.show) ? this.props.link : '';
		return React.createElement("div", {className: "photo"}, React.createElement("img", {src: link}));
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

	render: function() {
		var self = this,
				cx = React.addons.classSet;

		var photos = $.map(this.props.photoset.links, function(v,k) {
			return React.createElement(Photo, {key: k, show: self.props.isCurrent, link: v});
		});

		var setClasses = cx({
			'photoset': true,
			'visible': this.props.isCurrent
		});
		
		return (
			React.createElement("div", {className: setClasses}, 
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

	render: function() {
		var self = this;

		var sets = $.map(this.props.photosets, function(v,k) {
			// if (k < 4) {
				var current = (self.state.currSetId === k) ? true : false;
				return React.createElement(PhotoSet, {key: k, photoset: v, isCurrent: current});
			// }
		});

		return (
			React.createElement("div", {className: "slider"}, 
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