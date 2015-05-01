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

var Photo = React.createClass({

	propType: {
		link: React.PropTypes.string.isRquired,
		show: React.PropTypes.bool.isRquired
	},

	render: function() {
		var link = (this.props.show) ? this.props.link : '';
		return <div className="photo"><img src={link} /></div>;
	}

});

var PhotoSet = React.createClass({

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
			return <Photo key={k} show={self.props.isCurrent} link={v} />;
		});

		var setClasses = cx({
			'photoset': true,
			'visible': this.props.isCurrent
		});
		
		return (
			<div className={setClasses}>
				<div className="photos" ref="photos">
					{photos}
				</div>
			</div>
		);

	}

});

var Slider = React.createClass({

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
		var vector = (direction === 'right') ? 1 : -1;
		if ( this.inBound(vector) ) {
			this.setState({'currSetId': this.state.currSetId+vector});
		}
	},

	inBound: function(vector) {
		return this.state.currSetId+vector >= 0 && this.state.currSetId+vector < this.props.photosets.length;
	},

	render: function() {
		var self = this;

		console.log('current photoset Id: ', this.state.currSetId);

		var sets = $.map(this.props.photosets, function(v,k) {
			var current = (self.state.currSetId === k) ? true : false;
			return <PhotoSet key={k} photoset={v} isCurrent={current} />;
		});

		return (
			<div className="slider" onScroll={this.onScroll}>
				<div className="sliderWrap">
					{sets}
				</div>
			</div>
		);
	}

});

var PictureViewport = React.createClass({

	propType: {
		photosets: React.PropTypes.object.isRequired,
	},

	render: function() {
		return <Slider photosets={this.props.photosets} />;
	}

});