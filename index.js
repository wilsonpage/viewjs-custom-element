umd(function(define) {
define(function(require, exports, module) {
'use strict';

/**
 * Locals
 */

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
 * TODO:
 * Need to think about how instantiation would work for elements
 * that are already in the DOM,
 *
 *   var myview = new MyView({ el: element });
 *
 *
 * @param  {Object} viewjs
 */
exports.install = function(viewjs) {
  var defineView = viewjs.define;

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
    var View = defineView(props);
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
    var proto = View.prototype;
    var createdCallback = proto.createdCallback;
    var isHTMLElement = proto instanceof HTMLElement;
    var ignoreCreated = false;
    var Element;

    // Make sure the proto is
    // based on HTMLELement.
    //
    // TODO: Reconstruct the prototype
    // chain more accurately ontop of
    // HTMLElement like:
    //
    // Class2 -> Class2 -> Base -> HTMLElement
    //
    // So we can be sure that everything works
    // as it did before it was based on HTMLElement.
    //
    // This is because of a bug (github.com/Polymer/CustomElements/issues/93)
    // in Polymer's Custom Element polyfill.
    if (!isHTMLElement) {
      var newProto = Object.create(HTMLElement.prototype);
      proto = mixin(newProto, proto);
    }

    proto.createdCallback = function(options) {
      if (ignoreCreated) return;
      options = options || {};
      options.el = this;
      this.className = this.name;
      View.call(this, options);
      if (createdCallback) createdCallback.apply(this, arguments);
    };

    Element = document.registerElement(proto.name, { prototype: proto });

    function Constructor(options) {
      ignoreCreated = true;
      var element = new Element();
      ignoreCreated = false;
      element.createdCallback(options);
      return element;
    }

    Constructor.prototype = proto;
    return Constructor;
  };
};

function mixin(a, b) {
  for (var key in b) a[key] = b[key];
  return a;
}

});},'viewjs-custom-element');function umd(fn,n){
if(typeof define=='function')return fn(define);
if(typeof module=='object')return fn(function(c){c(require,exports,module);});
var m={exports:{}},r=function(n){return window[n];};fn(function(c){window[n]=c(r,m.exports,m)||m.exports;});}