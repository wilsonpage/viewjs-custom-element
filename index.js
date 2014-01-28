umd(function(define) {
define(function(require, exports, module) {
'use strict';

/**
 * Locals
 */

var has = Object.prototype.hasOwnProperty;
var registerElement = document.registerElement || document.register;

/**
 * Exports
 */

/**
 * Installs `.register()` method to register
 * view components as custom-elements.
 *
 * Usage:
 *
 *   viewjs.register({ name: 'my-view' });
 *
 *   // ...or
 *
 *   var MyView = view.define({ name: 'my-view' });
 *   viewjs.register(MyView);
 *
 *   // ..or
 *
 *   var MyView = view.define({ name: 'my-view' });
 *   var MyViewElement = MyView.register();
 *
 *   var myview = new MyView({ el: element });
 *
 *
 * @param  {Object} viewjs
 */
exports.install = function(viewjs) {
  var viewjsDefine = viewjs.define;
  var viewjsGet = viewjs.get;

  viewjs.definedElements = {};

  /**
   * Overwrite viewjs.get, preferring
   * the custom element if it has
   * been registered.
   *
   * @param  {String} name
   * @return {View|undefined}
   */
  viewjs.get = function(name) {
    return viewjs.definedElements[name] || viewjsGet(name);
  };

  /**
   * Redefine a wrapped version
   * of .define that bolts on .register()
   * method for convenience.
   *
   * @param  {Object} props
   * @return {View}
   */
  viewjs.define = function(props) {
    props.tag = props.name;
    var View = viewjsDefine(props);
    View.register = function(){ return viewjs.register(this); };
    return View;
  };

  /**
   * Registers a View class
   * as a custom-element.
   *
   * @param  {View|Object} View
   * @return {Constructor}
   */
  viewjs.register = function(View) {
    View = (typeof View === 'object') ? viewjs.define(View) : View;
    var proto = View.prototype || View;
    var createdCallback = proto.createdCallback || function(){};
    var isHTMLElement = proto instanceof HTMLElement;
    var ignoreCreated = false;
    var Element;

    // If the prototype isn't based on HTMLElement, we
    // re-layer the given prototype chain ontop of HTMlElement.
    if (!isHTMLElement) proto = extendProto(proto, HTMLElement.prototype);

    /**
     * Runs when the view instance is created.
     *
     * @param  {Object} options
     */
    proto.createdCallback = function(options) {
      if (ignoreCreated) return;
      var fromDOM = !options;
      var self = this;

      options = options || {};
      options.el = this;

      // We delay initialization if the DOM
      // triggered the callback, as we can't
      // be sure if any nested views will have
      // been registered yet.
      if (fromDOM) queue(initialize, this.name);
      else initialize();

      function initialize() {
        self.className = self.name;
        View.call(self, options);
      }
    };

    Element = registerElement.call(document, proto.name, { prototype: proto });

    /**
     * A faux constructor to wrap
     * the Element constructor.
     *
     * We prevent the default `createdCallback`
     * firing so that we can fire it ourselves
     * and pass in the options object given.
     *
     * If an element has been provided it means
     * this custom element has already been
     * instantiated, so we just pass it back.
     *
     * @param {Object} options
     */
    function Constructor(options) {
      ignoreCreated = true;
      var el = options.el || new Element();
      ignoreCreated = false;
      if (!options.el) proto.createdCallback.call(el, options || {});
      return el;
    }

    // We have to bolt on the prototype so that
    // other views can successfully extend from this
    Constructor.prototype = proto;
    viewjs.definedElements[proto.name] = Constructor;
    return Constructor;
  };
};

function extendProto(proto, head) {
  var chain = [];
  while(proto !== Object.prototype) {
    chain.push(proto);
    proto = Object.getPrototypeOf(proto);
  }
  while(chain.length) {
    head = Object.create(head);
    mixin(head, chain.pop());
  }
  return head;
}

// TODO: Tidy this crap
var q = [], timer;
function queue(fn, name) {
  q.push(fn);
  timer = timer || setTimeout(flush);
  function flush() {
    while (q.length) q.pop().call();
    timer = null;
  }
}

function mixin(a, b) {
  for (var key in b) if (has.call(b, key)) a[key] = b[key];
  return a;
}

});},'viewjs-custom-element');function umd(fn,n){
if(typeof define=='function')return fn(define);
if(typeof module=='object')return fn(function(c){c(require,exports,module);});
var m={exports:{}},r=function(n){return window[n];};fn(function(c){window[n]=c(r,m.exports,m)||m.exports;});}