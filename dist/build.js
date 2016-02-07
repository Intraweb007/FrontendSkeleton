(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Vue // late bind
var map = Object.create(null)
var shimmed = false
var isBrowserify = false

/**
 * Determine compatibility and apply patch.
 *
 * @param {Function} vue
 * @param {Boolean} browserify
 */

exports.install = function (vue, browserify) {
  if (shimmed) return
  shimmed = true

  Vue = vue
  isBrowserify = browserify

  exports.compatible = !!Vue.internalDirectives
  if (!exports.compatible) {
    console.warn(
      '[HMR] vue-loader hot reload is only compatible with ' +
      'Vue.js 1.0.0+.'
    )
    return
  }

  // patch view directive
  patchView(Vue.internalDirectives.component)
  console.log('[HMR] Vue component hot reload shim applied.')
  // shim router-view if present
  var routerView = Vue.elementDirective('router-view')
  if (routerView) {
    patchView(routerView)
    console.log('[HMR] vue-router <router-view> hot reload shim applied.')
  }
}

/**
 * Shim the view directive (component or router-view).
 *
 * @param {Object} View
 */

function patchView (View) {
  var unbuild = View.unbuild
  View.unbuild = function (defer) {
    if (!this.hotUpdating) {
      var prevComponent = this.childVM && this.childVM.constructor
      removeView(prevComponent, this)
      // defer = true means we are transitioning to a new
      // Component. Register this new component to the list.
      if (defer) {
        addView(this.Component, this)
      }
    }
    // call original
    return unbuild.call(this, defer)
  }
}

/**
 * Add a component view to a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function addView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    if (!map[id]) {
      map[id] = {
        Component: Component,
        views: [],
        instances: []
      }
    }
    map[id].views.push(view)
  }
}

/**
 * Remove a component view from a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function removeView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    map[id].views.$remove(view)
  }
}

/**
 * Create a record for a hot module, which keeps track of its construcotr,
 * instnaces and views (component directives or router-views).
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if (typeof options === 'function') {
    options = options.options
  }
  if (typeof options.el !== 'string' && typeof options.data !== 'object') {
    makeOptionsHot(id, options)
    map[id] = {
      Component: null,
      views: [],
      instances: []
    }
  }
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot (id, options) {
  options.hotID = id
  injectHook(options, 'created', function () {
    var record = map[id]
    if (!record.Component) {
      record.Component = this.constructor
    }
    record.instances.push(this)
  })
  injectHook(options, 'beforeDestroy', function () {
    map[id].instances.$remove(this)
  })
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook (options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing)
      ? existing.concat(hook)
      : [existing, hook]
    : [hook]
}

/**
 * Update a hot component.
 *
 * @param {String} id
 * @param {Object|null} newOptions
 * @param {String|null} newTemplate
 */

exports.update = function (id, newOptions, newTemplate) {
  var record = map[id]
  // force full-reload if an instance of the component is active but is not
  // managed by a view
  if (!record || (record.instances.length && !record.views.length)) {
    console.log('[HMR] Root or manually-mounted instance modified. Full reload may be required.')
    if (!isBrowserify) {
      window.location.reload()
    } else {
      // browserify-hmr somehow sends incomplete bundle if we reload here
      return
    }
  }
  if (!isBrowserify) {
    // browserify-hmr already logs this
    console.log('[HMR] Updating component: ' + format(id))
  }
  var Component = record.Component
  // update constructor
  if (newOptions) {
    // in case the user exports a constructor
    Component = record.Component = typeof newOptions === 'function'
      ? newOptions
      : Vue.extend(newOptions)
    makeOptionsHot(id, Component.options)
  }
  if (newTemplate) {
    Component.options.template = newTemplate
  }
  // handle recursive lookup
  if (Component.options.name) {
    Component.options.components[Component.options.name] = Component
  }
  // reset constructor cached linker
  Component.linker = null
  // reload all views
  record.views.forEach(function (view) {
    updateView(view, Component)
  })
  // flush devtools
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('flush')
  }
}

/**
 * Update a component view instance
 *
 * @param {Directive} view
 * @param {Function} Component
 */

function updateView (view, Component) {
  if (!view._bound) {
    return
  }
  view.Component = Component
  view.hotUpdating = true
  // disable transitions
  view.vm._isCompiled = false
  // save state
  var state = extractState(view.childVM)
  // remount, make sure to disable keep-alive
  var keepAlive = view.keepAlive
  view.keepAlive = false
  view.mountComponent()
  view.keepAlive = keepAlive
  // restore state
  restoreState(view.childVM, state, true)
  // re-eanble transitions
  view.vm._isCompiled = true
  view.hotUpdating = false
}

/**
 * Extract state from a Vue instance.
 *
 * @param {Vue} vm
 * @return {Object}
 */

function extractState (vm) {
  return {
    cid: vm.constructor.cid,
    data: vm.$data,
    children: vm.$children.map(extractState)
  }
}

/**
 * Restore state to a reloaded Vue instance.
 *
 * @param {Vue} vm
 * @param {Object} state
 */

function restoreState (vm, state, isRoot) {
  var oldAsyncConfig
  if (isRoot) {
    // set Vue into sync mode during state rehydration
    oldAsyncConfig = Vue.config.async
    Vue.config.async = false
  }
  // actual restore
  if (isRoot || !vm._props) {
    vm.$data = state.data
  } else {
    Object.keys(state.data).forEach(function (key) {
      if (!vm._props[key]) {
        // for non-root, only restore non-props fields
        vm.$data[key] = state.data[key]
      }
    })
  }
  // verify child consistency
  var hasSameChildren = vm.$children.every(function (c, i) {
    return state.children[i] && state.children[i].cid === c.constructor.cid
  })
  if (hasSameChildren) {
    // rehydrate children
    vm.$children.forEach(function (c, i) {
      restoreState(c, state.children[i])
    })
  }
  if (isRoot) {
    Vue.config.async = oldAsyncConfig
  }
}

function format (id) {
  return id.match(/[^\/]+\.vue$/)[0]
}

},{}],2:[function(require,module,exports){
var inserted = exports.cache = {}

exports.insert = function (css) {
  if (inserted[css]) return
  inserted[css] = true

  var elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')

  if ('textContent' in elem) {
    elem.textContent = css
  } else {
    elem.styleSheet.cssText = css
  }

  document.getElementsByTagName('head')[0].appendChild(elem)
  return elem
}

},{}],3:[function(require,module,exports){
(function (global){
var __vueify_style__ = require("vueify-insert-css").insert(".hello {\n  display: block;\n  width: 100%;\n  background: #fafafa;\n  margin: 24px 0;\n  padding: 0;\n  text-align: center;\n}\n")
"use strict";

module.exports = {
    data: function data() {
        return {
            message: "Hello, I am Component!"
        };
    }
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n<p class=\"hello\">{{ message }}</p>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install((typeof window !== "undefined" ? window['Vue'] : typeof global !== "undefined" ? global['Vue'] : null), true)
  if (!hotAPI.compatible) return
  var id = "/Users/whaleshark/Desktop/Code/OpenSource/FrontendSkeleton/src/js/components/hello.vue"
  module.hot.dispose(function () {
    require("vueify-insert-css").cache[".hello {\n  display: block;\n  width: 100%;\n  background: #fafafa;\n  margin: 24px 0;\n  padding: 0;\n  text-align: center;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"vue-hot-reload-api":1,"vueify-insert-css":2}],4:[function(require,module,exports){
(function (global){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _module = require('./module');
var Vue = (typeof window !== "undefined" ? window['Vue'] : typeof global !== "undefined" ? global['Vue'] : null);
var Hello = require('./components/hello.vue');

$(function () {
    var App = function App() {
        _classCallCheck(this, App);

        console.log('Hello, ES6!');
    };

    new Vue({
        el: "#app",
        components: {
            hello: Hello
        }
    });

    var app = new App();
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/hello.vue":3,"./module":5}],5:[function(require,module,exports){
"use strict";

var hello = {
    hello: "world"
};

module.exports = hello;

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdnVlLWhvdC1yZWxvYWQtYXBpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZWlmeS1pbnNlcnQtY3NzL2luZGV4LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvaGVsbG8udnVlIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvbW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQzFCQSxJQUFJLFVBQVMsUUFBUSxVQUFSLENBQVQ7QUFDSixJQUFJLE1BQU0sUUFBUSxLQUFSLENBQU47QUFDSixJQUFJLFFBQVEsUUFBUSx3QkFBUixDQUFSOztBQUVKLEVBQUUsWUFBWTtRQUNKLE1BQ0YsU0FERSxHQUNGLEdBQWM7OEJBRFosS0FDWTs7QUFDVixnQkFBUSxHQUFSLENBQVksYUFBWixFQURVO0tBQWQsQ0FGTTs7QUFPVixRQUFJLEdBQUosQ0FBUTtBQUNKLFlBQUksTUFBSjtBQUNBLG9CQUFZO0FBQ1IsbUJBQU8sS0FBUDtTQURKO0tBRkosRUFQVTs7QUFjVixRQUFJLE1BQU0sSUFBSSxHQUFKLEVBQU4sQ0FkTTtDQUFaLENBQUY7Ozs7Ozs7QUNKQSxJQUFJLFFBQVE7QUFDUixXQUFPLE9BQVA7Q0FEQTs7QUFJSixPQUFPLE9BQVAsR0FBaUIsS0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFZ1ZSAvLyBsYXRlIGJpbmRcbnZhciBtYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpXG52YXIgc2hpbW1lZCA9IGZhbHNlXG52YXIgaXNCcm93c2VyaWZ5ID0gZmFsc2VcblxuLyoqXG4gKiBEZXRlcm1pbmUgY29tcGF0aWJpbGl0eSBhbmQgYXBwbHkgcGF0Y2guXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdnVlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGJyb3dzZXJpZnlcbiAqL1xuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbiAodnVlLCBicm93c2VyaWZ5KSB7XG4gIGlmIChzaGltbWVkKSByZXR1cm5cbiAgc2hpbW1lZCA9IHRydWVcblxuICBWdWUgPSB2dWVcbiAgaXNCcm93c2VyaWZ5ID0gYnJvd3NlcmlmeVxuXG4gIGV4cG9ydHMuY29tcGF0aWJsZSA9ICEhVnVlLmludGVybmFsRGlyZWN0aXZlc1xuICBpZiAoIWV4cG9ydHMuY29tcGF0aWJsZSkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdbSE1SXSB2dWUtbG9hZGVyIGhvdCByZWxvYWQgaXMgb25seSBjb21wYXRpYmxlIHdpdGggJyArXG4gICAgICAnVnVlLmpzIDEuMC4wKy4nXG4gICAgKVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gcGF0Y2ggdmlldyBkaXJlY3RpdmVcbiAgcGF0Y2hWaWV3KFZ1ZS5pbnRlcm5hbERpcmVjdGl2ZXMuY29tcG9uZW50KVxuICBjb25zb2xlLmxvZygnW0hNUl0gVnVlIGNvbXBvbmVudCBob3QgcmVsb2FkIHNoaW0gYXBwbGllZC4nKVxuICAvLyBzaGltIHJvdXRlci12aWV3IGlmIHByZXNlbnRcbiAgdmFyIHJvdXRlclZpZXcgPSBWdWUuZWxlbWVudERpcmVjdGl2ZSgncm91dGVyLXZpZXcnKVxuICBpZiAocm91dGVyVmlldykge1xuICAgIHBhdGNoVmlldyhyb3V0ZXJWaWV3KVxuICAgIGNvbnNvbGUubG9nKCdbSE1SXSB2dWUtcm91dGVyIDxyb3V0ZXItdmlldz4gaG90IHJlbG9hZCBzaGltIGFwcGxpZWQuJylcbiAgfVxufVxuXG4vKipcbiAqIFNoaW0gdGhlIHZpZXcgZGlyZWN0aXZlIChjb21wb25lbnQgb3Igcm91dGVyLXZpZXcpLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBWaWV3XG4gKi9cblxuZnVuY3Rpb24gcGF0Y2hWaWV3IChWaWV3KSB7XG4gIHZhciB1bmJ1aWxkID0gVmlldy51bmJ1aWxkXG4gIFZpZXcudW5idWlsZCA9IGZ1bmN0aW9uIChkZWZlcikge1xuICAgIGlmICghdGhpcy5ob3RVcGRhdGluZykge1xuICAgICAgdmFyIHByZXZDb21wb25lbnQgPSB0aGlzLmNoaWxkVk0gJiYgdGhpcy5jaGlsZFZNLmNvbnN0cnVjdG9yXG4gICAgICByZW1vdmVWaWV3KHByZXZDb21wb25lbnQsIHRoaXMpXG4gICAgICAvLyBkZWZlciA9IHRydWUgbWVhbnMgd2UgYXJlIHRyYW5zaXRpb25pbmcgdG8gYSBuZXdcbiAgICAgIC8vIENvbXBvbmVudC4gUmVnaXN0ZXIgdGhpcyBuZXcgY29tcG9uZW50IHRvIHRoZSBsaXN0LlxuICAgICAgaWYgKGRlZmVyKSB7XG4gICAgICAgIGFkZFZpZXcodGhpcy5Db21wb25lbnQsIHRoaXMpXG4gICAgICB9XG4gICAgfVxuICAgIC8vIGNhbGwgb3JpZ2luYWxcbiAgICByZXR1cm4gdW5idWlsZC5jYWxsKHRoaXMsIGRlZmVyKVxuICB9XG59XG5cbi8qKlxuICogQWRkIGEgY29tcG9uZW50IHZpZXcgdG8gYSBDb21wb25lbnQncyBob3QgbGlzdFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IENvbXBvbmVudFxuICogQHBhcmFtIHtEaXJlY3RpdmV9IHZpZXcgLSB2aWV3IGRpcmVjdGl2ZSBpbnN0YW5jZVxuICovXG5cbmZ1bmN0aW9uIGFkZFZpZXcgKENvbXBvbmVudCwgdmlldykge1xuICB2YXIgaWQgPSBDb21wb25lbnQgJiYgQ29tcG9uZW50Lm9wdGlvbnMuaG90SURcbiAgaWYgKGlkKSB7XG4gICAgaWYgKCFtYXBbaWRdKSB7XG4gICAgICBtYXBbaWRdID0ge1xuICAgICAgICBDb21wb25lbnQ6IENvbXBvbmVudCxcbiAgICAgICAgdmlld3M6IFtdLFxuICAgICAgICBpbnN0YW5jZXM6IFtdXG4gICAgICB9XG4gICAgfVxuICAgIG1hcFtpZF0udmlld3MucHVzaCh2aWV3KVxuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIGEgY29tcG9uZW50IHZpZXcgZnJvbSBhIENvbXBvbmVudCdzIGhvdCBsaXN0XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gQ29tcG9uZW50XG4gKiBAcGFyYW0ge0RpcmVjdGl2ZX0gdmlldyAtIHZpZXcgZGlyZWN0aXZlIGluc3RhbmNlXG4gKi9cblxuZnVuY3Rpb24gcmVtb3ZlVmlldyAoQ29tcG9uZW50LCB2aWV3KSB7XG4gIHZhciBpZCA9IENvbXBvbmVudCAmJiBDb21wb25lbnQub3B0aW9ucy5ob3RJRFxuICBpZiAoaWQpIHtcbiAgICBtYXBbaWRdLnZpZXdzLiRyZW1vdmUodmlldylcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIHJlY29yZCBmb3IgYSBob3QgbW9kdWxlLCB3aGljaCBrZWVwcyB0cmFjayBvZiBpdHMgY29uc3RydWNvdHIsXG4gKiBpbnN0bmFjZXMgYW5kIHZpZXdzIChjb21wb25lbnQgZGlyZWN0aXZlcyBvciByb3V0ZXItdmlld3MpLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5leHBvcnRzLmNyZWF0ZVJlY29yZCA9IGZ1bmN0aW9uIChpZCwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucy5vcHRpb25zXG4gIH1cbiAgaWYgKHR5cGVvZiBvcHRpb25zLmVsICE9PSAnc3RyaW5nJyAmJiB0eXBlb2Ygb3B0aW9ucy5kYXRhICE9PSAnb2JqZWN0Jykge1xuICAgIG1ha2VPcHRpb25zSG90KGlkLCBvcHRpb25zKVxuICAgIG1hcFtpZF0gPSB7XG4gICAgICBDb21wb25lbnQ6IG51bGwsXG4gICAgICB2aWV3czogW10sXG4gICAgICBpbnN0YW5jZXM6IFtdXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTWFrZSBhIENvbXBvbmVudCBvcHRpb25zIG9iamVjdCBob3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIG1ha2VPcHRpb25zSG90IChpZCwgb3B0aW9ucykge1xuICBvcHRpb25zLmhvdElEID0gaWRcbiAgaW5qZWN0SG9vayhvcHRpb25zLCAnY3JlYXRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVjb3JkID0gbWFwW2lkXVxuICAgIGlmICghcmVjb3JkLkNvbXBvbmVudCkge1xuICAgICAgcmVjb3JkLkNvbXBvbmVudCA9IHRoaXMuY29uc3RydWN0b3JcbiAgICB9XG4gICAgcmVjb3JkLmluc3RhbmNlcy5wdXNoKHRoaXMpXG4gIH0pXG4gIGluamVjdEhvb2sob3B0aW9ucywgJ2JlZm9yZURlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgbWFwW2lkXS5pbnN0YW5jZXMuJHJlbW92ZSh0aGlzKVxuICB9KVxufVxuXG4vKipcbiAqIEluamVjdCBhIGhvb2sgdG8gYSBob3QgcmVsb2FkYWJsZSBjb21wb25lbnQgc28gdGhhdFxuICogd2UgY2FuIGtlZXAgdHJhY2sgb2YgaXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBob29rXG4gKi9cblxuZnVuY3Rpb24gaW5qZWN0SG9vayAob3B0aW9ucywgbmFtZSwgaG9vaykge1xuICB2YXIgZXhpc3RpbmcgPSBvcHRpb25zW25hbWVdXG4gIG9wdGlvbnNbbmFtZV0gPSBleGlzdGluZ1xuICAgID8gQXJyYXkuaXNBcnJheShleGlzdGluZylcbiAgICAgID8gZXhpc3RpbmcuY29uY2F0KGhvb2spXG4gICAgICA6IFtleGlzdGluZywgaG9va11cbiAgICA6IFtob29rXVxufVxuXG4vKipcbiAqIFVwZGF0ZSBhIGhvdCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdHxudWxsfSBuZXdPcHRpb25zXG4gKiBAcGFyYW0ge1N0cmluZ3xudWxsfSBuZXdUZW1wbGF0ZVxuICovXG5cbmV4cG9ydHMudXBkYXRlID0gZnVuY3Rpb24gKGlkLCBuZXdPcHRpb25zLCBuZXdUZW1wbGF0ZSkge1xuICB2YXIgcmVjb3JkID0gbWFwW2lkXVxuICAvLyBmb3JjZSBmdWxsLXJlbG9hZCBpZiBhbiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IGlzIGFjdGl2ZSBidXQgaXMgbm90XG4gIC8vIG1hbmFnZWQgYnkgYSB2aWV3XG4gIGlmICghcmVjb3JkIHx8IChyZWNvcmQuaW5zdGFuY2VzLmxlbmd0aCAmJiAhcmVjb3JkLnZpZXdzLmxlbmd0aCkpIHtcbiAgICBjb25zb2xlLmxvZygnW0hNUl0gUm9vdCBvciBtYW51YWxseS1tb3VudGVkIGluc3RhbmNlIG1vZGlmaWVkLiBGdWxsIHJlbG9hZCBtYXkgYmUgcmVxdWlyZWQuJylcbiAgICBpZiAoIWlzQnJvd3NlcmlmeSkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGJyb3dzZXJpZnktaG1yIHNvbWVob3cgc2VuZHMgaW5jb21wbGV0ZSBidW5kbGUgaWYgd2UgcmVsb2FkIGhlcmVcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuICBpZiAoIWlzQnJvd3NlcmlmeSkge1xuICAgIC8vIGJyb3dzZXJpZnktaG1yIGFscmVhZHkgbG9ncyB0aGlzXG4gICAgY29uc29sZS5sb2coJ1tITVJdIFVwZGF0aW5nIGNvbXBvbmVudDogJyArIGZvcm1hdChpZCkpXG4gIH1cbiAgdmFyIENvbXBvbmVudCA9IHJlY29yZC5Db21wb25lbnRcbiAgLy8gdXBkYXRlIGNvbnN0cnVjdG9yXG4gIGlmIChuZXdPcHRpb25zKSB7XG4gICAgLy8gaW4gY2FzZSB0aGUgdXNlciBleHBvcnRzIGEgY29uc3RydWN0b3JcbiAgICBDb21wb25lbnQgPSByZWNvcmQuQ29tcG9uZW50ID0gdHlwZW9mIG5ld09wdGlvbnMgPT09ICdmdW5jdGlvbidcbiAgICAgID8gbmV3T3B0aW9uc1xuICAgICAgOiBWdWUuZXh0ZW5kKG5ld09wdGlvbnMpXG4gICAgbWFrZU9wdGlvbnNIb3QoaWQsIENvbXBvbmVudC5vcHRpb25zKVxuICB9XG4gIGlmIChuZXdUZW1wbGF0ZSkge1xuICAgIENvbXBvbmVudC5vcHRpb25zLnRlbXBsYXRlID0gbmV3VGVtcGxhdGVcbiAgfVxuICAvLyBoYW5kbGUgcmVjdXJzaXZlIGxvb2t1cFxuICBpZiAoQ29tcG9uZW50Lm9wdGlvbnMubmFtZSkge1xuICAgIENvbXBvbmVudC5vcHRpb25zLmNvbXBvbmVudHNbQ29tcG9uZW50Lm9wdGlvbnMubmFtZV0gPSBDb21wb25lbnRcbiAgfVxuICAvLyByZXNldCBjb25zdHJ1Y3RvciBjYWNoZWQgbGlua2VyXG4gIENvbXBvbmVudC5saW5rZXIgPSBudWxsXG4gIC8vIHJlbG9hZCBhbGwgdmlld3NcbiAgcmVjb3JkLnZpZXdzLmZvckVhY2goZnVuY3Rpb24gKHZpZXcpIHtcbiAgICB1cGRhdGVWaWV3KHZpZXcsIENvbXBvbmVudClcbiAgfSlcbiAgLy8gZmx1c2ggZGV2dG9vbHNcbiAgaWYgKHdpbmRvdy5fX1ZVRV9ERVZUT09MU19HTE9CQUxfSE9PS19fKSB7XG4gICAgd2luZG93Ll9fVlVFX0RFVlRPT0xTX0dMT0JBTF9IT09LX18uZW1pdCgnZmx1c2gnKVxuICB9XG59XG5cbi8qKlxuICogVXBkYXRlIGEgY29tcG9uZW50IHZpZXcgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0ge0RpcmVjdGl2ZX0gdmlld1xuICogQHBhcmFtIHtGdW5jdGlvbn0gQ29tcG9uZW50XG4gKi9cblxuZnVuY3Rpb24gdXBkYXRlVmlldyAodmlldywgQ29tcG9uZW50KSB7XG4gIGlmICghdmlldy5fYm91bmQpIHtcbiAgICByZXR1cm5cbiAgfVxuICB2aWV3LkNvbXBvbmVudCA9IENvbXBvbmVudFxuICB2aWV3LmhvdFVwZGF0aW5nID0gdHJ1ZVxuICAvLyBkaXNhYmxlIHRyYW5zaXRpb25zXG4gIHZpZXcudm0uX2lzQ29tcGlsZWQgPSBmYWxzZVxuICAvLyBzYXZlIHN0YXRlXG4gIHZhciBzdGF0ZSA9IGV4dHJhY3RTdGF0ZSh2aWV3LmNoaWxkVk0pXG4gIC8vIHJlbW91bnQsIG1ha2Ugc3VyZSB0byBkaXNhYmxlIGtlZXAtYWxpdmVcbiAgdmFyIGtlZXBBbGl2ZSA9IHZpZXcua2VlcEFsaXZlXG4gIHZpZXcua2VlcEFsaXZlID0gZmFsc2VcbiAgdmlldy5tb3VudENvbXBvbmVudCgpXG4gIHZpZXcua2VlcEFsaXZlID0ga2VlcEFsaXZlXG4gIC8vIHJlc3RvcmUgc3RhdGVcbiAgcmVzdG9yZVN0YXRlKHZpZXcuY2hpbGRWTSwgc3RhdGUsIHRydWUpXG4gIC8vIHJlLWVhbmJsZSB0cmFuc2l0aW9uc1xuICB2aWV3LnZtLl9pc0NvbXBpbGVkID0gdHJ1ZVxuICB2aWV3LmhvdFVwZGF0aW5nID0gZmFsc2Vcbn1cblxuLyoqXG4gKiBFeHRyYWN0IHN0YXRlIGZyb20gYSBWdWUgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gZXh0cmFjdFN0YXRlICh2bSkge1xuICByZXR1cm4ge1xuICAgIGNpZDogdm0uY29uc3RydWN0b3IuY2lkLFxuICAgIGRhdGE6IHZtLiRkYXRhLFxuICAgIGNoaWxkcmVuOiB2bS4kY2hpbGRyZW4ubWFwKGV4dHJhY3RTdGF0ZSlcbiAgfVxufVxuXG4vKipcbiAqIFJlc3RvcmUgc3RhdGUgdG8gYSByZWxvYWRlZCBWdWUgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhdGVcbiAqL1xuXG5mdW5jdGlvbiByZXN0b3JlU3RhdGUgKHZtLCBzdGF0ZSwgaXNSb290KSB7XG4gIHZhciBvbGRBc3luY0NvbmZpZ1xuICBpZiAoaXNSb290KSB7XG4gICAgLy8gc2V0IFZ1ZSBpbnRvIHN5bmMgbW9kZSBkdXJpbmcgc3RhdGUgcmVoeWRyYXRpb25cbiAgICBvbGRBc3luY0NvbmZpZyA9IFZ1ZS5jb25maWcuYXN5bmNcbiAgICBWdWUuY29uZmlnLmFzeW5jID0gZmFsc2VcbiAgfVxuICAvLyBhY3R1YWwgcmVzdG9yZVxuICBpZiAoaXNSb290IHx8ICF2bS5fcHJvcHMpIHtcbiAgICB2bS4kZGF0YSA9IHN0YXRlLmRhdGFcbiAgfSBlbHNlIHtcbiAgICBPYmplY3Qua2V5cyhzdGF0ZS5kYXRhKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICghdm0uX3Byb3BzW2tleV0pIHtcbiAgICAgICAgLy8gZm9yIG5vbi1yb290LCBvbmx5IHJlc3RvcmUgbm9uLXByb3BzIGZpZWxkc1xuICAgICAgICB2bS4kZGF0YVtrZXldID0gc3RhdGUuZGF0YVtrZXldXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICAvLyB2ZXJpZnkgY2hpbGQgY29uc2lzdGVuY3lcbiAgdmFyIGhhc1NhbWVDaGlsZHJlbiA9IHZtLiRjaGlsZHJlbi5ldmVyeShmdW5jdGlvbiAoYywgaSkge1xuICAgIHJldHVybiBzdGF0ZS5jaGlsZHJlbltpXSAmJiBzdGF0ZS5jaGlsZHJlbltpXS5jaWQgPT09IGMuY29uc3RydWN0b3IuY2lkXG4gIH0pXG4gIGlmIChoYXNTYW1lQ2hpbGRyZW4pIHtcbiAgICAvLyByZWh5ZHJhdGUgY2hpbGRyZW5cbiAgICB2bS4kY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoYywgaSkge1xuICAgICAgcmVzdG9yZVN0YXRlKGMsIHN0YXRlLmNoaWxkcmVuW2ldKVxuICAgIH0pXG4gIH1cbiAgaWYgKGlzUm9vdCkge1xuICAgIFZ1ZS5jb25maWcuYXN5bmMgPSBvbGRBc3luY0NvbmZpZ1xuICB9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdCAoaWQpIHtcbiAgcmV0dXJuIGlkLm1hdGNoKC9bXlxcL10rXFwudnVlJC8pWzBdXG59XG4iLCJ2YXIgaW5zZXJ0ZWQgPSBleHBvcnRzLmNhY2hlID0ge31cblxuZXhwb3J0cy5pbnNlcnQgPSBmdW5jdGlvbiAoY3NzKSB7XG4gIGlmIChpbnNlcnRlZFtjc3NdKSByZXR1cm5cbiAgaW5zZXJ0ZWRbY3NzXSA9IHRydWVcblxuICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgZWxlbS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKVxuXG4gIGlmICgndGV4dENvbnRlbnQnIGluIGVsZW0pIHtcbiAgICBlbGVtLnRleHRDb250ZW50ID0gY3NzXG4gIH0gZWxzZSB7XG4gICAgZWxlbS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3NcbiAgfVxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoZWxlbSlcbiAgcmV0dXJuIGVsZW1cbn1cbiIsInZhciBfX3Z1ZWlmeV9zdHlsZV9fID0gcmVxdWlyZShcInZ1ZWlmeS1pbnNlcnQtY3NzXCIpLmluc2VydChcIi5oZWxsbyB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYmFja2dyb3VuZDogI2ZhZmFmYTtcXG4gIG1hcmdpbjogMjRweCAwO1xcbiAgcGFkZGluZzogMDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXCIpXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZGF0YTogZnVuY3Rpb24gZGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiSGVsbG8sIEkgYW0gQ29tcG9uZW50IVwiXG4gICAgICAgIH07XG4gICAgfVxufTtcbmlmIChtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlKSBtb2R1bGUuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzLmRlZmF1bHRcbjsodHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcImZ1bmN0aW9uXCI/IG1vZHVsZS5leHBvcnRzLm9wdGlvbnM6IG1vZHVsZS5leHBvcnRzKS50ZW1wbGF0ZSA9IFwiXFxuPHAgY2xhc3M9XFxcImhlbGxvXFxcIj57eyBtZXNzYWdlIH19PC9wPlxcblwiXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7ICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKCh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydWdWUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ1Z1ZSddIDogbnVsbCksIHRydWUpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICB2YXIgaWQgPSBcIi9Vc2Vycy93aGFsZXNoYXJrL0Rlc2t0b3AvQ29kZS9PcGVuU291cmNlL0Zyb250ZW5kU2tlbGV0b24vc3JjL2pzL2NvbXBvbmVudHMvaGVsbG8udnVlXCJcbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uICgpIHtcbiAgICByZXF1aXJlKFwidnVlaWZ5LWluc2VydC1jc3NcIikuY2FjaGVbXCIuaGVsbG8ge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJhY2tncm91bmQ6ICNmYWZhZmE7XFxuICBtYXJnaW46IDI0cHggMDtcXG4gIHBhZGRpbmc6IDA7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblwiXSA9IGZhbHNlXG4gICAgZG9jdW1lbnQuaGVhZC5yZW1vdmVDaGlsZChfX3Z1ZWlmeV9zdHlsZV9fKVxuICB9KVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoaWQsIG1vZHVsZS5leHBvcnRzKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS51cGRhdGUoaWQsIG1vZHVsZS5leHBvcnRzLCAodHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcImZ1bmN0aW9uXCIgPyBtb2R1bGUuZXhwb3J0cy5vcHRpb25zIDogbW9kdWxlLmV4cG9ydHMpLnRlbXBsYXRlKVxuICB9XG59KSgpfSIsInZhciBtb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZScpO1xudmFyIFZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xudmFyIEhlbGxvID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbGxvLnZ1ZScpO1xuXG4kKGZ1bmN0aW9uICgpIHtcbiAgICBjbGFzcyBBcHAge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIZWxsbywgRVM2IScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmV3IFZ1ZSh7XG4gICAgICAgIGVsOiBcIiNhcHBcIixcbiAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgaGVsbG86IEhlbGxvXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBhcHAgPSBuZXcgQXBwKCk7XG59KTsiLCJ2YXIgaGVsbG8gPSB7XG4gICAgaGVsbG86IFwid29ybGRcIlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBoZWxsbzsiXX0=
