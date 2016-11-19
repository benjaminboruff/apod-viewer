(function () {
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

(function(){"use strict";/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * A component handler interface using the revealing module design pattern.
 * More details on this design pattern here:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @author Jason Mayes.
 *//* exported componentHandler */// Pre-defining the componentHandler interface, for closure documentation and
// static verification.
var componentHandler={/**
   * Searches existing DOM for elements of our component type and upgrades them
   * if they have not already been upgraded.
   *
   * @param {string=} optJsClass the programatic name of the element class we
   * need to create a new instance of.
   * @param {string=} optCssClass the name of the CSS class elements of this
   * type will have.
   */upgradeDom:function upgradeDom(optJsClass,optCssClass){},/**
   * Upgrades a specific element rather than all in the DOM.
   *
   * @param {!Element} element The element we wish to upgrade.
   * @param {string=} optJsClass Optional name of the class we want to upgrade
   * the element to.
   */upgradeElement:function upgradeElement(element,optJsClass){},/**
   * Upgrades a specific list of elements rather than all in the DOM.
   *
   * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
   * The elements we wish to upgrade.
   */upgradeElements:function upgradeElements(elements){},/**
   * Upgrades all registered components found in the current DOM. This is
   * automatically called on window load.
   */upgradeAllRegistered:function upgradeAllRegistered(){},/**
   * Allows user to be alerted to any upgrades that are performed for a given
   * component type
   *
   * @param {string} jsClass The class name of the MDL component we wish
   * to hook into for any upgrades performed.
   * @param {function(!HTMLElement)} callback The function to call upon an
   * upgrade. This function should expect 1 parameter - the HTMLElement which
   * got upgraded.
   */registerUpgradedCallback:function registerUpgradedCallback(jsClass,callback){},/**
   * Registers a class for future use and attempts to upgrade existing DOM.
   *
   * @param {componentHandler.ComponentConfigPublic} config the registration configuration
   */register:function register(config){},/**
   * Downgrade either a given node, an array of nodes, or a NodeList.
   *
   * @param {!Node|!Array<!Node>|!NodeList} nodes
   */downgradeElements:function downgradeElements(nodes){}};componentHandler=function(){'use strict';/** @type {!Array<componentHandler.ComponentConfig>} */var registeredComponents_=[];/** @type {!Array<componentHandler.Component>} */var createdComponents_=[];var componentConfigProperty_='mdlComponentConfigInternal_';/**
   * Searches registered components for a class we are interested in using.
   * Optionally replaces a match with passed object if specified.
   *
   * @param {string} name The name of a class we want to use.
   * @param {componentHandler.ComponentConfig=} optReplace Optional object to replace match with.
   * @return {!Object|boolean}
   * @private
   */function findRegisteredClass_(name,optReplace){for(var i=0;i<registeredComponents_.length;i++){if(registeredComponents_[i].className===name){if(typeof optReplace!=='undefined'){registeredComponents_[i]=optReplace;}return registeredComponents_[i];}}return false;}/**
   * Returns an array of the classNames of the upgraded classes on the element.
   *
   * @param {!Element} element The element to fetch data from.
   * @return {!Array<string>}
   * @private
   */function getUpgradedListOfElement_(element){var dataUpgraded=element.getAttribute('data-upgraded');// Use `['']` as default value to conform the `,name,name...` style.
return dataUpgraded===null?['']:dataUpgraded.split(',');}/**
   * Returns true if the given element has already been upgraded for the given
   * class.
   *
   * @param {!Element} element The element we want to check.
   * @param {string} jsClass The class to check for.
   * @returns {boolean}
   * @private
   */function isElementUpgraded_(element,jsClass){var upgradedList=getUpgradedListOfElement_(element);return upgradedList.indexOf(jsClass)!==-1;}/**
   * Searches existing DOM for elements of our component type and upgrades them
   * if they have not already been upgraded.
   *
   * @param {string=} optJsClass the programatic name of the element class we
   * need to create a new instance of.
   * @param {string=} optCssClass the name of the CSS class elements of this
   * type will have.
   */function upgradeDomInternal(optJsClass,optCssClass){if(typeof optJsClass==='undefined'&&typeof optCssClass==='undefined'){for(var i=0;i<registeredComponents_.length;i++){upgradeDomInternal(registeredComponents_[i].className,registeredComponents_[i].cssClass);}}else{var jsClass=/** @type {string} */optJsClass;if(typeof optCssClass==='undefined'){var registeredClass=findRegisteredClass_(jsClass);if(registeredClass){optCssClass=registeredClass.cssClass;}}var elements=document.querySelectorAll('.'+optCssClass);for(var n=0;n<elements.length;n++){upgradeElementInternal(elements[n],jsClass);}}}/**
   * Upgrades a specific element rather than all in the DOM.
   *
   * @param {!Element} element The element we wish to upgrade.
   * @param {string=} optJsClass Optional name of the class we want to upgrade
   * the element to.
   */function upgradeElementInternal(element,optJsClass){// Verify argument type.
if(!((typeof element==='undefined'?'undefined':_typeof(element))==='object'&&element instanceof Element)){throw new Error('Invalid argument provided to upgrade MDL element.');}var upgradedList=getUpgradedListOfElement_(element);var classesToUpgrade=[];// If jsClass is not provided scan the registered components to find the
// ones matching the element's CSS classList.
if(!optJsClass){var classList=element.classList;registeredComponents_.forEach(function(component){// Match CSS & Not to be upgraded & Not upgraded.
if(classList.contains(component.cssClass)&&classesToUpgrade.indexOf(component)===-1&&!isElementUpgraded_(element,component.className)){classesToUpgrade.push(component);}});}else if(!isElementUpgraded_(element,optJsClass)){classesToUpgrade.push(findRegisteredClass_(optJsClass));}// Upgrade the element for each classes.
for(var i=0,n=classesToUpgrade.length,registeredClass;i<n;i++){registeredClass=classesToUpgrade[i];if(registeredClass){// Mark element as upgraded.
upgradedList.push(registeredClass.className);element.setAttribute('data-upgraded',upgradedList.join(','));var instance=new registeredClass.classConstructor(element);instance[componentConfigProperty_]=registeredClass;createdComponents_.push(instance);// Call any callbacks the user has registered with this component type.
for(var j=0,m=registeredClass.callbacks.length;j<m;j++){registeredClass.callbacks[j](element);}if(registeredClass.widget){// Assign per element instance for control over API
element[registeredClass.className]=instance;}}else{throw new Error('Unable to find a registered component for the given class.');}var ev;if('CustomEvent'in window&&typeof window.CustomEvent==='function'){ev=new CustomEvent('mdl-componentupgraded',{bubbles:true,cancelable:false});}else{ev=document.createEvent('Events');ev.initEvent('mdl-componentupgraded',true,true);}element.dispatchEvent(ev);}}/**
   * Upgrades a specific list of elements rather than all in the DOM.
   *
   * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
   * The elements we wish to upgrade.
   */function upgradeElementsInternal(elements){if(!Array.isArray(elements)){if(elements instanceof Element){elements=[elements];}else{elements=Array.prototype.slice.call(elements);}}for(var i=0,n=elements.length,element;i<n;i++){element=elements[i];if(element instanceof HTMLElement){upgradeElementInternal(element);if(element.children.length>0){upgradeElementsInternal(element.children);}}}}/**
   * Registers a class for future use and attempts to upgrade existing DOM.
   *
   * @param {componentHandler.ComponentConfigPublic} config
   */function registerInternal(config){// In order to support both Closure-compiled and uncompiled code accessing
// this method, we need to allow for both the dot and array syntax for
// property access. You'll therefore see the `foo.bar || foo['bar']`
// pattern repeated across this method.
var widgetMissing=typeof config.widget==='undefined'&&typeof config['widget']==='undefined';var widget=true;if(!widgetMissing){widget=config.widget||config['widget'];}var newConfig=/** @type {componentHandler.ComponentConfig} */{classConstructor:config.constructor||config['constructor'],className:config.classAsString||config['classAsString'],cssClass:config.cssClass||config['cssClass'],widget:widget,callbacks:[]};registeredComponents_.forEach(function(item){if(item.cssClass===newConfig.cssClass){throw new Error('The provided cssClass has already been registered: '+item.cssClass);}if(item.className===newConfig.className){throw new Error('The provided className has already been registered');}});if(config.constructor.prototype.hasOwnProperty(componentConfigProperty_)){throw new Error('MDL component classes must not have '+componentConfigProperty_+' defined as a property.');}var found=findRegisteredClass_(config.classAsString,newConfig);if(!found){registeredComponents_.push(newConfig);}}/**
   * Allows user to be alerted to any upgrades that are performed for a given
   * component type
   *
   * @param {string} jsClass The class name of the MDL component we wish
   * to hook into for any upgrades performed.
   * @param {function(!HTMLElement)} callback The function to call upon an
   * upgrade. This function should expect 1 parameter - the HTMLElement which
   * got upgraded.
   */function registerUpgradedCallbackInternal(jsClass,callback){var regClass=findRegisteredClass_(jsClass);if(regClass){regClass.callbacks.push(callback);}}/**
   * Upgrades all registered components found in the current DOM. This is
   * automatically called on window load.
   */function upgradeAllRegisteredInternal(){for(var n=0;n<registeredComponents_.length;n++){upgradeDomInternal(registeredComponents_[n].className);}}/**
   * Check the component for the downgrade method.
   * Execute if found.
   * Remove component from createdComponents list.
   *
   * @param {?componentHandler.Component} component
   */function deconstructComponentInternal(component){if(component){var componentIndex=createdComponents_.indexOf(component);createdComponents_.splice(componentIndex,1);var upgrades=component.element_.getAttribute('data-upgraded').split(',');var componentPlace=upgrades.indexOf(component[componentConfigProperty_].classAsString);upgrades.splice(componentPlace,1);component.element_.setAttribute('data-upgraded',upgrades.join(','));var ev;if('CustomEvent'in window&&typeof window.CustomEvent==='function'){ev=new CustomEvent('mdl-componentdowngraded',{bubbles:true,cancelable:false});}else{ev=document.createEvent('Events');ev.initEvent('mdl-componentdowngraded',true,true);}component.element_.dispatchEvent(ev);}}/**
   * Downgrade either a given node, an array of nodes, or a NodeList.
   *
   * @param {!Node|!Array<!Node>|!NodeList} nodes
   */function downgradeNodesInternal(nodes){/**
     * Auxiliary function to downgrade a single node.
     * @param  {!Node} node the node to be downgraded
     */var downgradeNode=function downgradeNode(node){createdComponents_.filter(function(item){return item.element_===node;}).forEach(deconstructComponentInternal);};if(nodes instanceof Array||nodes instanceof NodeList){for(var n=0;n<nodes.length;n++){downgradeNode(nodes[n]);}}else if(nodes instanceof Node){downgradeNode(nodes);}else{throw new Error('Invalid argument provided to downgrade MDL nodes.');}}// Now return the functions that should be made public with their publicly
// facing names...
return{upgradeDom:upgradeDomInternal,upgradeElement:upgradeElementInternal,upgradeElements:upgradeElementsInternal,upgradeAllRegistered:upgradeAllRegisteredInternal,registerUpgradedCallback:registerUpgradedCallbackInternal,register:registerInternal,downgradeElements:downgradeNodesInternal};}();/**
 * Describes the type of a registered component type managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   constructor: Function,
 *   classAsString: string,
 *   cssClass: string,
 *   widget: (string|boolean|undefined)
 * }}
 */componentHandler.ComponentConfigPublic;// jshint ignore:line
/**
 * Describes the type of a registered component type managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   constructor: !Function,
 *   className: string,
 *   cssClass: string,
 *   widget: (string|boolean),
 *   callbacks: !Array<function(!HTMLElement)>
 * }}
 */componentHandler.ComponentConfig;// jshint ignore:line
/**
 * Created component (i.e., upgraded element) type as managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   element_: !HTMLElement,
 *   className: string,
 *   classAsString: string,
 *   cssClass: string,
 *   widget: string
 * }}
 */componentHandler.Component;// jshint ignore:line
// Export all symbols, for the benefit of Closure compiler.
// No effect on uncompiled code.
componentHandler['upgradeDom']=componentHandler.upgradeDom;componentHandler['upgradeElement']=componentHandler.upgradeElement;componentHandler['upgradeElements']=componentHandler.upgradeElements;componentHandler['upgradeAllRegistered']=componentHandler.upgradeAllRegistered;componentHandler['registerUpgradedCallback']=componentHandler.registerUpgradedCallback;componentHandler['register']=componentHandler.register;componentHandler['downgradeElements']=componentHandler.downgradeElements;window.componentHandler=componentHandler;window['componentHandler']=componentHandler;window.addEventListener('load',function(){'use strict';/**
   * Performs a "Cutting the mustard" test. If the browser supports the features
   * tested, adds a mdl-js class to the <html> element. It then upgrades all MDL
   * components requiring JavaScript.
   */if('classList'in document.createElement('div')&&'querySelector'in document&&'addEventListener'in window&&Array.prototype.forEach){document.documentElement.classList.add('mdl-js');componentHandler.upgradeAllRegistered();}else{/**
     * Dummy function to avoid JS errors.
     */componentHandler.upgradeElement=function(){};/**
     * Dummy function to avoid JS errors.
     */componentHandler.register=function(){};}});// Source: https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js
// Adapted from https://gist.github.com/paulirish/1579671 which derived from
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
// MIT license
if(!Date.now){/**
   * Date.now polyfill.
   * @return {number} the current Date
   */Date.now=function(){return new Date().getTime();};Date['now']=Date.now;}var vendors=['webkit','moz'];for(var i=0;i<vendors.length&&!window.requestAnimationFrame;++i){var vp=vendors[i];window.requestAnimationFrame=window[vp+'RequestAnimationFrame'];window.cancelAnimationFrame=window[vp+'CancelAnimationFrame']||window[vp+'CancelRequestAnimationFrame'];window['requestAnimationFrame']=window.requestAnimationFrame;window['cancelAnimationFrame']=window.cancelAnimationFrame;}if(/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)||!window.requestAnimationFrame||!window.cancelAnimationFrame){var lastTime=0;/**
   * requestAnimationFrame polyfill.
   * @param  {!Function} callback the callback function.
   */window.requestAnimationFrame=function(callback){var now=Date.now();var nextTime=Math.max(lastTime+16,now);return setTimeout(function(){callback(lastTime=nextTime);},nextTime-now);};window.cancelAnimationFrame=clearTimeout;window['requestAnimationFrame']=window.requestAnimationFrame;window['cancelAnimationFrame']=window.cancelAnimationFrame;}/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Button MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialButton=function MaterialButton(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialButton']=MaterialButton;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialButton.prototype.Constant_={};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialButton.prototype.CssClasses_={RIPPLE_EFFECT:'mdl-js-ripple-effect',RIPPLE_CONTAINER:'mdl-button__ripple-container',RIPPLE:'mdl-ripple'};/**
   * Handle blur of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialButton.prototype.blurHandler_=function(event){if(event){this.element_.blur();}};// Public methods.
/**
   * Disable button.
   *
   * @public
   */MaterialButton.prototype.disable=function(){this.element_.disabled=true;};MaterialButton.prototype['disable']=MaterialButton.prototype.disable;/**
   * Enable button.
   *
   * @public
   */MaterialButton.prototype.enable=function(){this.element_.disabled=false;};MaterialButton.prototype['enable']=MaterialButton.prototype.enable;/**
   * Initialize element.
   */MaterialButton.prototype.init=function(){if(this.element_){if(this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){var rippleContainer=document.createElement('span');rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);this.rippleElement_=document.createElement('span');this.rippleElement_.classList.add(this.CssClasses_.RIPPLE);rippleContainer.appendChild(this.rippleElement_);this.boundRippleBlurHandler=this.blurHandler_.bind(this);this.rippleElement_.addEventListener('mouseup',this.boundRippleBlurHandler);this.element_.appendChild(rippleContainer);}this.boundButtonBlurHandler=this.blurHandler_.bind(this);this.element_.addEventListener('mouseup',this.boundButtonBlurHandler);this.element_.addEventListener('mouseleave',this.boundButtonBlurHandler);}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialButton,classAsString:'MaterialButton',cssClass:'mdl-js-button',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Checkbox MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialCheckbox=function MaterialCheckbox(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialCheckbox']=MaterialCheckbox;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialCheckbox.prototype.Constant_={TINY_TIMEOUT:0.001};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialCheckbox.prototype.CssClasses_={INPUT:'mdl-checkbox__input',BOX_OUTLINE:'mdl-checkbox__box-outline',FOCUS_HELPER:'mdl-checkbox__focus-helper',TICK_OUTLINE:'mdl-checkbox__tick-outline',RIPPLE_EFFECT:'mdl-js-ripple-effect',RIPPLE_IGNORE_EVENTS:'mdl-js-ripple-effect--ignore-events',RIPPLE_CONTAINER:'mdl-checkbox__ripple-container',RIPPLE_CENTER:'mdl-ripple--center',RIPPLE:'mdl-ripple',IS_FOCUSED:'is-focused',IS_DISABLED:'is-disabled',IS_CHECKED:'is-checked',IS_UPGRADED:'is-upgraded'};/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialCheckbox.prototype.onChange_=function(event){this.updateClasses_();};/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialCheckbox.prototype.onFocus_=function(event){this.element_.classList.add(this.CssClasses_.IS_FOCUSED);};/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialCheckbox.prototype.onBlur_=function(event){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);};/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialCheckbox.prototype.onMouseUp_=function(event){this.blur_();};/**
   * Handle class updates.
   *
   * @private
   */MaterialCheckbox.prototype.updateClasses_=function(){this.checkDisabled();this.checkToggleState();};/**
   * Add blur.
   *
   * @private
   */MaterialCheckbox.prototype.blur_=function(){// TODO: figure out why there's a focus event being fired after our blur,
// so that we can avoid this hack.
window.setTimeout(function(){this.inputElement_.blur();}.bind(this),this.Constant_.TINY_TIMEOUT);};// Public methods.
/**
   * Check the inputs toggle state and update display.
   *
   * @public
   */MaterialCheckbox.prototype.checkToggleState=function(){if(this.inputElement_.checked){this.element_.classList.add(this.CssClasses_.IS_CHECKED);}else{this.element_.classList.remove(this.CssClasses_.IS_CHECKED);}};MaterialCheckbox.prototype['checkToggleState']=MaterialCheckbox.prototype.checkToggleState;/**
   * Check the inputs disabled state and update display.
   *
   * @public
   */MaterialCheckbox.prototype.checkDisabled=function(){if(this.inputElement_.disabled){this.element_.classList.add(this.CssClasses_.IS_DISABLED);}else{this.element_.classList.remove(this.CssClasses_.IS_DISABLED);}};MaterialCheckbox.prototype['checkDisabled']=MaterialCheckbox.prototype.checkDisabled;/**
   * Disable checkbox.
   *
   * @public
   */MaterialCheckbox.prototype.disable=function(){this.inputElement_.disabled=true;this.updateClasses_();};MaterialCheckbox.prototype['disable']=MaterialCheckbox.prototype.disable;/**
   * Enable checkbox.
   *
   * @public
   */MaterialCheckbox.prototype.enable=function(){this.inputElement_.disabled=false;this.updateClasses_();};MaterialCheckbox.prototype['enable']=MaterialCheckbox.prototype.enable;/**
   * Check checkbox.
   *
   * @public
   */MaterialCheckbox.prototype.check=function(){this.inputElement_.checked=true;this.updateClasses_();};MaterialCheckbox.prototype['check']=MaterialCheckbox.prototype.check;/**
   * Uncheck checkbox.
   *
   * @public
   */MaterialCheckbox.prototype.uncheck=function(){this.inputElement_.checked=false;this.updateClasses_();};MaterialCheckbox.prototype['uncheck']=MaterialCheckbox.prototype.uncheck;/**
   * Initialize element.
   */MaterialCheckbox.prototype.init=function(){if(this.element_){this.inputElement_=this.element_.querySelector('.'+this.CssClasses_.INPUT);var boxOutline=document.createElement('span');boxOutline.classList.add(this.CssClasses_.BOX_OUTLINE);var tickContainer=document.createElement('span');tickContainer.classList.add(this.CssClasses_.FOCUS_HELPER);var tickOutline=document.createElement('span');tickOutline.classList.add(this.CssClasses_.TICK_OUTLINE);boxOutline.appendChild(tickOutline);this.element_.appendChild(tickContainer);this.element_.appendChild(boxOutline);if(this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);this.rippleContainerElement_=document.createElement('span');this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);this.boundRippleMouseUp=this.onMouseUp_.bind(this);this.rippleContainerElement_.addEventListener('mouseup',this.boundRippleMouseUp);var ripple=document.createElement('span');ripple.classList.add(this.CssClasses_.RIPPLE);this.rippleContainerElement_.appendChild(ripple);this.element_.appendChild(this.rippleContainerElement_);}this.boundInputOnChange=this.onChange_.bind(this);this.boundInputOnFocus=this.onFocus_.bind(this);this.boundInputOnBlur=this.onBlur_.bind(this);this.boundElementMouseUp=this.onMouseUp_.bind(this);this.inputElement_.addEventListener('change',this.boundInputOnChange);this.inputElement_.addEventListener('focus',this.boundInputOnFocus);this.inputElement_.addEventListener('blur',this.boundInputOnBlur);this.element_.addEventListener('mouseup',this.boundElementMouseUp);this.updateClasses_();this.element_.classList.add(this.CssClasses_.IS_UPGRADED);}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialCheckbox,classAsString:'MaterialCheckbox',cssClass:'mdl-js-checkbox',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for icon toggle MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialIconToggle=function MaterialIconToggle(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialIconToggle']=MaterialIconToggle;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialIconToggle.prototype.Constant_={TINY_TIMEOUT:0.001};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialIconToggle.prototype.CssClasses_={INPUT:'mdl-icon-toggle__input',JS_RIPPLE_EFFECT:'mdl-js-ripple-effect',RIPPLE_IGNORE_EVENTS:'mdl-js-ripple-effect--ignore-events',RIPPLE_CONTAINER:'mdl-icon-toggle__ripple-container',RIPPLE_CENTER:'mdl-ripple--center',RIPPLE:'mdl-ripple',IS_FOCUSED:'is-focused',IS_DISABLED:'is-disabled',IS_CHECKED:'is-checked'};/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialIconToggle.prototype.onChange_=function(event){this.updateClasses_();};/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialIconToggle.prototype.onFocus_=function(event){this.element_.classList.add(this.CssClasses_.IS_FOCUSED);};/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialIconToggle.prototype.onBlur_=function(event){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);};/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialIconToggle.prototype.onMouseUp_=function(event){this.blur_();};/**
   * Handle class updates.
   *
   * @private
   */MaterialIconToggle.prototype.updateClasses_=function(){this.checkDisabled();this.checkToggleState();};/**
   * Add blur.
   *
   * @private
   */MaterialIconToggle.prototype.blur_=function(){// TODO: figure out why there's a focus event being fired after our blur,
// so that we can avoid this hack.
window.setTimeout(function(){this.inputElement_.blur();}.bind(this),this.Constant_.TINY_TIMEOUT);};// Public methods.
/**
   * Check the inputs toggle state and update display.
   *
   * @public
   */MaterialIconToggle.prototype.checkToggleState=function(){if(this.inputElement_.checked){this.element_.classList.add(this.CssClasses_.IS_CHECKED);}else{this.element_.classList.remove(this.CssClasses_.IS_CHECKED);}};MaterialIconToggle.prototype['checkToggleState']=MaterialIconToggle.prototype.checkToggleState;/**
   * Check the inputs disabled state and update display.
   *
   * @public
   */MaterialIconToggle.prototype.checkDisabled=function(){if(this.inputElement_.disabled){this.element_.classList.add(this.CssClasses_.IS_DISABLED);}else{this.element_.classList.remove(this.CssClasses_.IS_DISABLED);}};MaterialIconToggle.prototype['checkDisabled']=MaterialIconToggle.prototype.checkDisabled;/**
   * Disable icon toggle.
   *
   * @public
   */MaterialIconToggle.prototype.disable=function(){this.inputElement_.disabled=true;this.updateClasses_();};MaterialIconToggle.prototype['disable']=MaterialIconToggle.prototype.disable;/**
   * Enable icon toggle.
   *
   * @public
   */MaterialIconToggle.prototype.enable=function(){this.inputElement_.disabled=false;this.updateClasses_();};MaterialIconToggle.prototype['enable']=MaterialIconToggle.prototype.enable;/**
   * Check icon toggle.
   *
   * @public
   */MaterialIconToggle.prototype.check=function(){this.inputElement_.checked=true;this.updateClasses_();};MaterialIconToggle.prototype['check']=MaterialIconToggle.prototype.check;/**
   * Uncheck icon toggle.
   *
   * @public
   */MaterialIconToggle.prototype.uncheck=function(){this.inputElement_.checked=false;this.updateClasses_();};MaterialIconToggle.prototype['uncheck']=MaterialIconToggle.prototype.uncheck;/**
   * Initialize element.
   */MaterialIconToggle.prototype.init=function(){if(this.element_){this.inputElement_=this.element_.querySelector('.'+this.CssClasses_.INPUT);if(this.element_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)){this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);this.rippleContainerElement_=document.createElement('span');this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);this.rippleContainerElement_.classList.add(this.CssClasses_.JS_RIPPLE_EFFECT);this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);this.boundRippleMouseUp=this.onMouseUp_.bind(this);this.rippleContainerElement_.addEventListener('mouseup',this.boundRippleMouseUp);var ripple=document.createElement('span');ripple.classList.add(this.CssClasses_.RIPPLE);this.rippleContainerElement_.appendChild(ripple);this.element_.appendChild(this.rippleContainerElement_);}this.boundInputOnChange=this.onChange_.bind(this);this.boundInputOnFocus=this.onFocus_.bind(this);this.boundInputOnBlur=this.onBlur_.bind(this);this.boundElementOnMouseUp=this.onMouseUp_.bind(this);this.inputElement_.addEventListener('change',this.boundInputOnChange);this.inputElement_.addEventListener('focus',this.boundInputOnFocus);this.inputElement_.addEventListener('blur',this.boundInputOnBlur);this.element_.addEventListener('mouseup',this.boundElementOnMouseUp);this.updateClasses_();this.element_.classList.add('is-upgraded');}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialIconToggle,classAsString:'MaterialIconToggle',cssClass:'mdl-js-icon-toggle',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for dropdown MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialMenu=function MaterialMenu(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialMenu']=MaterialMenu;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialMenu.prototype.Constant_={// Total duration of the menu animation.
TRANSITION_DURATION_SECONDS:0.3,// The fraction of the total duration we want to use for menu item animations.
TRANSITION_DURATION_FRACTION:0.8,// How long the menu stays open after choosing an option (so the user can see
// the ripple).
CLOSE_TIMEOUT:150};/**
   * Keycodes, for code readability.
   *
   * @enum {number}
   * @private
   */MaterialMenu.prototype.Keycodes_={ENTER:13,ESCAPE:27,SPACE:32,UP_ARROW:38,DOWN_ARROW:40};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialMenu.prototype.CssClasses_={CONTAINER:'mdl-menu__container',OUTLINE:'mdl-menu__outline',ITEM:'mdl-menu__item',ITEM_RIPPLE_CONTAINER:'mdl-menu__item-ripple-container',RIPPLE_EFFECT:'mdl-js-ripple-effect',RIPPLE_IGNORE_EVENTS:'mdl-js-ripple-effect--ignore-events',RIPPLE:'mdl-ripple',// Statuses
IS_UPGRADED:'is-upgraded',IS_VISIBLE:'is-visible',IS_ANIMATING:'is-animating',// Alignment options
BOTTOM_LEFT:'mdl-menu--bottom-left',// This is the default.
BOTTOM_RIGHT:'mdl-menu--bottom-right',TOP_LEFT:'mdl-menu--top-left',TOP_RIGHT:'mdl-menu--top-right',UNALIGNED:'mdl-menu--unaligned'};/**
   * Initialize element.
   */MaterialMenu.prototype.init=function(){if(this.element_){// Create container for the menu.
var container=document.createElement('div');container.classList.add(this.CssClasses_.CONTAINER);this.element_.parentElement.insertBefore(container,this.element_);this.element_.parentElement.removeChild(this.element_);container.appendChild(this.element_);this.container_=container;// Create outline for the menu (shadow and background).
var outline=document.createElement('div');outline.classList.add(this.CssClasses_.OUTLINE);this.outline_=outline;container.insertBefore(outline,this.element_);// Find the "for" element and bind events to it.
var forElId=this.element_.getAttribute('for')||this.element_.getAttribute('data-mdl-for');var forEl=null;if(forElId){forEl=document.getElementById(forElId);if(forEl){this.forElement_=forEl;forEl.addEventListener('click',this.handleForClick_.bind(this));forEl.addEventListener('keydown',this.handleForKeyboardEvent_.bind(this));}}var items=this.element_.querySelectorAll('.'+this.CssClasses_.ITEM);this.boundItemKeydown_=this.handleItemKeyboardEvent_.bind(this);this.boundItemClick_=this.handleItemClick_.bind(this);for(var i=0;i<items.length;i++){// Add a listener to each menu item.
items[i].addEventListener('click',this.boundItemClick_);// Add a tab index to each menu item.
items[i].tabIndex='-1';// Add a keyboard listener to each menu item.
items[i].addEventListener('keydown',this.boundItemKeydown_);}// Add ripple classes to each item, if the user has enabled ripples.
if(this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);for(i=0;i<items.length;i++){var item=items[i];var rippleContainer=document.createElement('span');rippleContainer.classList.add(this.CssClasses_.ITEM_RIPPLE_CONTAINER);var ripple=document.createElement('span');ripple.classList.add(this.CssClasses_.RIPPLE);rippleContainer.appendChild(ripple);item.appendChild(rippleContainer);item.classList.add(this.CssClasses_.RIPPLE_EFFECT);}}// Copy alignment classes to the container, so the outline can use them.
if(this.element_.classList.contains(this.CssClasses_.BOTTOM_LEFT)){this.outline_.classList.add(this.CssClasses_.BOTTOM_LEFT);}if(this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)){this.outline_.classList.add(this.CssClasses_.BOTTOM_RIGHT);}if(this.element_.classList.contains(this.CssClasses_.TOP_LEFT)){this.outline_.classList.add(this.CssClasses_.TOP_LEFT);}if(this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)){this.outline_.classList.add(this.CssClasses_.TOP_RIGHT);}if(this.element_.classList.contains(this.CssClasses_.UNALIGNED)){this.outline_.classList.add(this.CssClasses_.UNALIGNED);}container.classList.add(this.CssClasses_.IS_UPGRADED);}};/**
   * Handles a click on the "for" element, by positioning the menu and then
   * toggling it.
   *
   * @param {Event} evt The event that fired.
   * @private
   */MaterialMenu.prototype.handleForClick_=function(evt){if(this.element_&&this.forElement_){var rect=this.forElement_.getBoundingClientRect();var forRect=this.forElement_.parentElement.getBoundingClientRect();if(this.element_.classList.contains(this.CssClasses_.UNALIGNED)){}else if(this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)){// Position below the "for" element, aligned to its right.
this.container_.style.right=forRect.right-rect.right+'px';this.container_.style.top=this.forElement_.offsetTop+this.forElement_.offsetHeight+'px';}else if(this.element_.classList.contains(this.CssClasses_.TOP_LEFT)){// Position above the "for" element, aligned to its left.
this.container_.style.left=this.forElement_.offsetLeft+'px';this.container_.style.bottom=forRect.bottom-rect.top+'px';}else if(this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)){// Position above the "for" element, aligned to its right.
this.container_.style.right=forRect.right-rect.right+'px';this.container_.style.bottom=forRect.bottom-rect.top+'px';}else{// Default: position below the "for" element, aligned to its left.
this.container_.style.left=this.forElement_.offsetLeft+'px';this.container_.style.top=this.forElement_.offsetTop+this.forElement_.offsetHeight+'px';}}this.toggle(evt);};/**
   * Handles a keyboard event on the "for" element.
   *
   * @param {Event} evt The event that fired.
   * @private
   */MaterialMenu.prototype.handleForKeyboardEvent_=function(evt){if(this.element_&&this.container_&&this.forElement_){var items=this.element_.querySelectorAll('.'+this.CssClasses_.ITEM+':not([disabled])');if(items&&items.length>0&&this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)){if(evt.keyCode===this.Keycodes_.UP_ARROW){evt.preventDefault();items[items.length-1].focus();}else if(evt.keyCode===this.Keycodes_.DOWN_ARROW){evt.preventDefault();items[0].focus();}}}};/**
   * Handles a keyboard event on an item.
   *
   * @param {Event} evt The event that fired.
   * @private
   */MaterialMenu.prototype.handleItemKeyboardEvent_=function(evt){if(this.element_&&this.container_){var items=this.element_.querySelectorAll('.'+this.CssClasses_.ITEM+':not([disabled])');if(items&&items.length>0&&this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)){var currentIndex=Array.prototype.slice.call(items).indexOf(evt.target);if(evt.keyCode===this.Keycodes_.UP_ARROW){evt.preventDefault();if(currentIndex>0){items[currentIndex-1].focus();}else{items[items.length-1].focus();}}else if(evt.keyCode===this.Keycodes_.DOWN_ARROW){evt.preventDefault();if(items.length>currentIndex+1){items[currentIndex+1].focus();}else{items[0].focus();}}else if(evt.keyCode===this.Keycodes_.SPACE||evt.keyCode===this.Keycodes_.ENTER){evt.preventDefault();// Send mousedown and mouseup to trigger ripple.
var e=new MouseEvent('mousedown');evt.target.dispatchEvent(e);e=new MouseEvent('mouseup');evt.target.dispatchEvent(e);// Send click.
evt.target.click();}else if(evt.keyCode===this.Keycodes_.ESCAPE){evt.preventDefault();this.hide();}}}};/**
   * Handles a click event on an item.
   *
   * @param {Event} evt The event that fired.
   * @private
   */MaterialMenu.prototype.handleItemClick_=function(evt){if(evt.target.hasAttribute('disabled')){evt.stopPropagation();}else{// Wait some time before closing menu, so the user can see the ripple.
this.closing_=true;window.setTimeout(function(evt){this.hide();this.closing_=false;}.bind(this),this.Constant_.CLOSE_TIMEOUT);}};/**
   * Calculates the initial clip (for opening the menu) or final clip (for closing
   * it), and applies it. This allows us to animate from or to the correct point,
   * that is, the point it's aligned to in the "for" element.
   *
   * @param {number} height Height of the clip rectangle
   * @param {number} width Width of the clip rectangle
   * @private
   */MaterialMenu.prototype.applyClip_=function(height,width){if(this.element_.classList.contains(this.CssClasses_.UNALIGNED)){// Do not clip.
this.element_.style.clip='';}else if(this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)){// Clip to the top right corner of the menu.
this.element_.style.clip='rect(0 '+width+'px '+'0 '+width+'px)';}else if(this.element_.classList.contains(this.CssClasses_.TOP_LEFT)){// Clip to the bottom left corner of the menu.
this.element_.style.clip='rect('+height+'px 0 '+height+'px 0)';}else if(this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)){// Clip to the bottom right corner of the menu.
this.element_.style.clip='rect('+height+'px '+width+'px '+height+'px '+width+'px)';}else{// Default: do not clip (same as clipping to the top left corner).
this.element_.style.clip='';}};/**
   * Cleanup function to remove animation listeners.
   *
   * @param {Event} evt
   * @private
   */MaterialMenu.prototype.removeAnimationEndListener_=function(evt){evt.target.classList.remove(MaterialMenu.prototype.CssClasses_.IS_ANIMATING);};/**
   * Adds an event listener to clean up after the animation ends.
   *
   * @private
   */MaterialMenu.prototype.addAnimationEndListener_=function(){this.element_.addEventListener('transitionend',this.removeAnimationEndListener_);this.element_.addEventListener('webkitTransitionEnd',this.removeAnimationEndListener_);};/**
   * Displays the menu.
   *
   * @public
   */MaterialMenu.prototype.show=function(evt){if(this.element_&&this.container_&&this.outline_){// Measure the inner element.
var height=this.element_.getBoundingClientRect().height;var width=this.element_.getBoundingClientRect().width;// Apply the inner element's size to the container and outline.
this.container_.style.width=width+'px';this.container_.style.height=height+'px';this.outline_.style.width=width+'px';this.outline_.style.height=height+'px';var transitionDuration=this.Constant_.TRANSITION_DURATION_SECONDS*this.Constant_.TRANSITION_DURATION_FRACTION;// Calculate transition delays for individual menu items, so that they fade
// in one at a time.
var items=this.element_.querySelectorAll('.'+this.CssClasses_.ITEM);for(var i=0;i<items.length;i++){var itemDelay=null;if(this.element_.classList.contains(this.CssClasses_.TOP_LEFT)||this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)){itemDelay=(height-items[i].offsetTop-items[i].offsetHeight)/height*transitionDuration+'s';}else{itemDelay=items[i].offsetTop/height*transitionDuration+'s';}items[i].style.transitionDelay=itemDelay;}// Apply the initial clip to the text before we start animating.
this.applyClip_(height,width);// Wait for the next frame, turn on animation, and apply the final clip.
// Also make it visible. This triggers the transitions.
window.requestAnimationFrame(function(){this.element_.classList.add(this.CssClasses_.IS_ANIMATING);this.element_.style.clip='rect(0 '+width+'px '+height+'px 0)';this.container_.classList.add(this.CssClasses_.IS_VISIBLE);}.bind(this));// Clean up after the animation is complete.
this.addAnimationEndListener_();// Add a click listener to the document, to close the menu.
var callback=function(e){// Check to see if the document is processing the same event that
// displayed the menu in the first place. If so, do nothing.
// Also check to see if the menu is in the process of closing itself, and
// do nothing in that case.
// Also check if the clicked element is a menu item
// if so, do nothing.
if(e!==evt&&!this.closing_&&e.target.parentNode!==this.element_){document.removeEventListener('click',callback);this.hide();}}.bind(this);document.addEventListener('click',callback);}};MaterialMenu.prototype['show']=MaterialMenu.prototype.show;/**
   * Hides the menu.
   *
   * @public
   */MaterialMenu.prototype.hide=function(){if(this.element_&&this.container_&&this.outline_){var items=this.element_.querySelectorAll('.'+this.CssClasses_.ITEM);// Remove all transition delays; menu items fade out concurrently.
for(var i=0;i<items.length;i++){items[i].style.removeProperty('transition-delay');}// Measure the inner element.
var rect=this.element_.getBoundingClientRect();var height=rect.height;var width=rect.width;// Turn on animation, and apply the final clip. Also make invisible.
// This triggers the transitions.
this.element_.classList.add(this.CssClasses_.IS_ANIMATING);this.applyClip_(height,width);this.container_.classList.remove(this.CssClasses_.IS_VISIBLE);// Clean up after the animation is complete.
this.addAnimationEndListener_();}};MaterialMenu.prototype['hide']=MaterialMenu.prototype.hide;/**
   * Displays or hides the menu, depending on current state.
   *
   * @public
   */MaterialMenu.prototype.toggle=function(evt){if(this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)){this.hide();}else{this.show(evt);}};MaterialMenu.prototype['toggle']=MaterialMenu.prototype.toggle;// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialMenu,classAsString:'MaterialMenu',cssClass:'mdl-js-menu',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Progress MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialProgress=function MaterialProgress(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialProgress']=MaterialProgress;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialProgress.prototype.Constant_={};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialProgress.prototype.CssClasses_={INDETERMINATE_CLASS:'mdl-progress__indeterminate'};/**
   * Set the current progress of the progressbar.
   *
   * @param {number} p Percentage of the progress (0-100)
   * @public
   */MaterialProgress.prototype.setProgress=function(p){if(this.element_.classList.contains(this.CssClasses_.INDETERMINATE_CLASS)){return;}this.progressbar_.style.width=p+'%';};MaterialProgress.prototype['setProgress']=MaterialProgress.prototype.setProgress;/**
   * Set the current progress of the buffer.
   *
   * @param {number} p Percentage of the buffer (0-100)
   * @public
   */MaterialProgress.prototype.setBuffer=function(p){this.bufferbar_.style.width=p+'%';this.auxbar_.style.width=100-p+'%';};MaterialProgress.prototype['setBuffer']=MaterialProgress.prototype.setBuffer;/**
   * Initialize element.
   */MaterialProgress.prototype.init=function(){if(this.element_){var el=document.createElement('div');el.className='progressbar bar bar1';this.element_.appendChild(el);this.progressbar_=el;el=document.createElement('div');el.className='bufferbar bar bar2';this.element_.appendChild(el);this.bufferbar_=el;el=document.createElement('div');el.className='auxbar bar bar3';this.element_.appendChild(el);this.auxbar_=el;this.progressbar_.style.width='0%';this.bufferbar_.style.width='100%';this.auxbar_.style.width='0%';this.element_.classList.add('is-upgraded');}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialProgress,classAsString:'MaterialProgress',cssClass:'mdl-js-progress',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Radio MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialRadio=function MaterialRadio(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialRadio']=MaterialRadio;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialRadio.prototype.Constant_={TINY_TIMEOUT:0.001};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialRadio.prototype.CssClasses_={IS_FOCUSED:'is-focused',IS_DISABLED:'is-disabled',IS_CHECKED:'is-checked',IS_UPGRADED:'is-upgraded',JS_RADIO:'mdl-js-radio',RADIO_BTN:'mdl-radio__button',RADIO_OUTER_CIRCLE:'mdl-radio__outer-circle',RADIO_INNER_CIRCLE:'mdl-radio__inner-circle',RIPPLE_EFFECT:'mdl-js-ripple-effect',RIPPLE_IGNORE_EVENTS:'mdl-js-ripple-effect--ignore-events',RIPPLE_CONTAINER:'mdl-radio__ripple-container',RIPPLE_CENTER:'mdl-ripple--center',RIPPLE:'mdl-ripple'};/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialRadio.prototype.onChange_=function(event){// Since other radio buttons don't get change events, we need to look for
// them to update their classes.
var radios=document.getElementsByClassName(this.CssClasses_.JS_RADIO);for(var i=0;i<radios.length;i++){var button=radios[i].querySelector('.'+this.CssClasses_.RADIO_BTN);// Different name == different group, so no point updating those.
if(button.getAttribute('name')===this.btnElement_.getAttribute('name')){radios[i]['MaterialRadio'].updateClasses_();}}};/**
   * Handle focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialRadio.prototype.onFocus_=function(event){this.element_.classList.add(this.CssClasses_.IS_FOCUSED);};/**
   * Handle lost focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialRadio.prototype.onBlur_=function(event){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);};/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialRadio.prototype.onMouseup_=function(event){this.blur_();};/**
   * Update classes.
   *
   * @private
   */MaterialRadio.prototype.updateClasses_=function(){this.checkDisabled();this.checkToggleState();};/**
   * Add blur.
   *
   * @private
   */MaterialRadio.prototype.blur_=function(){// TODO: figure out why there's a focus event being fired after our blur,
// so that we can avoid this hack.
window.setTimeout(function(){this.btnElement_.blur();}.bind(this),this.Constant_.TINY_TIMEOUT);};// Public methods.
/**
   * Check the components disabled state.
   *
   * @public
   */MaterialRadio.prototype.checkDisabled=function(){if(this.btnElement_.disabled){this.element_.classList.add(this.CssClasses_.IS_DISABLED);}else{this.element_.classList.remove(this.CssClasses_.IS_DISABLED);}};MaterialRadio.prototype['checkDisabled']=MaterialRadio.prototype.checkDisabled;/**
   * Check the components toggled state.
   *
   * @public
   */MaterialRadio.prototype.checkToggleState=function(){if(this.btnElement_.checked){this.element_.classList.add(this.CssClasses_.IS_CHECKED);}else{this.element_.classList.remove(this.CssClasses_.IS_CHECKED);}};MaterialRadio.prototype['checkToggleState']=MaterialRadio.prototype.checkToggleState;/**
   * Disable radio.
   *
   * @public
   */MaterialRadio.prototype.disable=function(){this.btnElement_.disabled=true;this.updateClasses_();};MaterialRadio.prototype['disable']=MaterialRadio.prototype.disable;/**
   * Enable radio.
   *
   * @public
   */MaterialRadio.prototype.enable=function(){this.btnElement_.disabled=false;this.updateClasses_();};MaterialRadio.prototype['enable']=MaterialRadio.prototype.enable;/**
   * Check radio.
   *
   * @public
   */MaterialRadio.prototype.check=function(){this.btnElement_.checked=true;this.onChange_(null);};MaterialRadio.prototype['check']=MaterialRadio.prototype.check;/**
   * Uncheck radio.
   *
   * @public
   */MaterialRadio.prototype.uncheck=function(){this.btnElement_.checked=false;this.onChange_(null);};MaterialRadio.prototype['uncheck']=MaterialRadio.prototype.uncheck;/**
   * Initialize element.
   */MaterialRadio.prototype.init=function(){if(this.element_){this.btnElement_=this.element_.querySelector('.'+this.CssClasses_.RADIO_BTN);this.boundChangeHandler_=this.onChange_.bind(this);this.boundFocusHandler_=this.onChange_.bind(this);this.boundBlurHandler_=this.onBlur_.bind(this);this.boundMouseUpHandler_=this.onMouseup_.bind(this);var outerCircle=document.createElement('span');outerCircle.classList.add(this.CssClasses_.RADIO_OUTER_CIRCLE);var innerCircle=document.createElement('span');innerCircle.classList.add(this.CssClasses_.RADIO_INNER_CIRCLE);this.element_.appendChild(outerCircle);this.element_.appendChild(innerCircle);var rippleContainer;if(this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);rippleContainer=document.createElement('span');rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);rippleContainer.classList.add(this.CssClasses_.RIPPLE_EFFECT);rippleContainer.classList.add(this.CssClasses_.RIPPLE_CENTER);rippleContainer.addEventListener('mouseup',this.boundMouseUpHandler_);var ripple=document.createElement('span');ripple.classList.add(this.CssClasses_.RIPPLE);rippleContainer.appendChild(ripple);this.element_.appendChild(rippleContainer);}this.btnElement_.addEventListener('change',this.boundChangeHandler_);this.btnElement_.addEventListener('focus',this.boundFocusHandler_);this.btnElement_.addEventListener('blur',this.boundBlurHandler_);this.element_.addEventListener('mouseup',this.boundMouseUpHandler_);this.updateClasses_();this.element_.classList.add(this.CssClasses_.IS_UPGRADED);}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialRadio,classAsString:'MaterialRadio',cssClass:'mdl-js-radio',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Slider MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialSlider=function MaterialSlider(element){this.element_=element;// Browser feature detection.
this.isIE_=window.navigator.msPointerEnabled;// Initialize instance.
this.init();};window['MaterialSlider']=MaterialSlider;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialSlider.prototype.Constant_={};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialSlider.prototype.CssClasses_={IE_CONTAINER:'mdl-slider__ie-container',SLIDER_CONTAINER:'mdl-slider__container',BACKGROUND_FLEX:'mdl-slider__background-flex',BACKGROUND_LOWER:'mdl-slider__background-lower',BACKGROUND_UPPER:'mdl-slider__background-upper',IS_LOWEST_VALUE:'is-lowest-value',IS_UPGRADED:'is-upgraded'};/**
   * Handle input on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialSlider.prototype.onInput_=function(event){this.updateValueStyles_();};/**
   * Handle change on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialSlider.prototype.onChange_=function(event){this.updateValueStyles_();};/**
   * Handle mouseup on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialSlider.prototype.onMouseUp_=function(event){event.target.blur();};/**
   * Handle mousedown on container element.
   * This handler is purpose is to not require the use to click
   * exactly on the 2px slider element, as FireFox seems to be very
   * strict about this.
   *
   * @param {Event} event The event that fired.
   * @private
   * @suppress {missingProperties}
   */MaterialSlider.prototype.onContainerMouseDown_=function(event){// If this click is not on the parent element (but rather some child)
// ignore. It may still bubble up.
if(event.target!==this.element_.parentElement){return;}// Discard the original event and create a new event that
// is on the slider element.
event.preventDefault();var newEvent=new MouseEvent('mousedown',{target:event.target,buttons:event.buttons,clientX:event.clientX,clientY:this.element_.getBoundingClientRect().y});this.element_.dispatchEvent(newEvent);};/**
   * Handle updating of values.
   *
   * @private
   */MaterialSlider.prototype.updateValueStyles_=function(){// Calculate and apply percentages to div structure behind slider.
var fraction=(this.element_.value-this.element_.min)/(this.element_.max-this.element_.min);if(fraction===0){this.element_.classList.add(this.CssClasses_.IS_LOWEST_VALUE);}else{this.element_.classList.remove(this.CssClasses_.IS_LOWEST_VALUE);}if(!this.isIE_){this.backgroundLower_.style.flex=fraction;this.backgroundLower_.style.webkitFlex=fraction;this.backgroundUpper_.style.flex=1-fraction;this.backgroundUpper_.style.webkitFlex=1-fraction;}};// Public methods.
/**
   * Disable slider.
   *
   * @public
   */MaterialSlider.prototype.disable=function(){this.element_.disabled=true;};MaterialSlider.prototype['disable']=MaterialSlider.prototype.disable;/**
   * Enable slider.
   *
   * @public
   */MaterialSlider.prototype.enable=function(){this.element_.disabled=false;};MaterialSlider.prototype['enable']=MaterialSlider.prototype.enable;/**
   * Update slider value.
   *
   * @param {number} value The value to which to set the control (optional).
   * @public
   */MaterialSlider.prototype.change=function(value){if(typeof value!=='undefined'){this.element_.value=value;}this.updateValueStyles_();};MaterialSlider.prototype['change']=MaterialSlider.prototype.change;/**
   * Initialize element.
   */MaterialSlider.prototype.init=function(){if(this.element_){if(this.isIE_){// Since we need to specify a very large height in IE due to
// implementation limitations, we add a parent here that trims it down to
// a reasonable size.
var containerIE=document.createElement('div');containerIE.classList.add(this.CssClasses_.IE_CONTAINER);this.element_.parentElement.insertBefore(containerIE,this.element_);this.element_.parentElement.removeChild(this.element_);containerIE.appendChild(this.element_);}else{// For non-IE browsers, we need a div structure that sits behind the
// slider and allows us to style the left and right sides of it with
// different colors.
var container=document.createElement('div');container.classList.add(this.CssClasses_.SLIDER_CONTAINER);this.element_.parentElement.insertBefore(container,this.element_);this.element_.parentElement.removeChild(this.element_);container.appendChild(this.element_);var backgroundFlex=document.createElement('div');backgroundFlex.classList.add(this.CssClasses_.BACKGROUND_FLEX);container.appendChild(backgroundFlex);this.backgroundLower_=document.createElement('div');this.backgroundLower_.classList.add(this.CssClasses_.BACKGROUND_LOWER);backgroundFlex.appendChild(this.backgroundLower_);this.backgroundUpper_=document.createElement('div');this.backgroundUpper_.classList.add(this.CssClasses_.BACKGROUND_UPPER);backgroundFlex.appendChild(this.backgroundUpper_);}this.boundInputHandler=this.onInput_.bind(this);this.boundChangeHandler=this.onChange_.bind(this);this.boundMouseUpHandler=this.onMouseUp_.bind(this);this.boundContainerMouseDownHandler=this.onContainerMouseDown_.bind(this);this.element_.addEventListener('input',this.boundInputHandler);this.element_.addEventListener('change',this.boundChangeHandler);this.element_.addEventListener('mouseup',this.boundMouseUpHandler);this.element_.parentElement.addEventListener('mousedown',this.boundContainerMouseDownHandler);this.updateValueStyles_();this.element_.classList.add(this.CssClasses_.IS_UPGRADED);}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialSlider,classAsString:'MaterialSlider',cssClass:'mdl-js-slider',widget:true});/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Snackbar MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialSnackbar=function MaterialSnackbar(element){this.element_=element;this.textElement_=this.element_.querySelector('.'+this.cssClasses_.MESSAGE);this.actionElement_=this.element_.querySelector('.'+this.cssClasses_.ACTION);if(!this.textElement_){throw new Error('There must be a message element for a snackbar.');}if(!this.actionElement_){throw new Error('There must be an action element for a snackbar.');}this.active=false;this.actionHandler_=undefined;this.message_=undefined;this.actionText_=undefined;this.queuedNotifications_=[];this.setActionHidden_(true);};window['MaterialSnackbar']=MaterialSnackbar;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialSnackbar.prototype.Constant_={// The duration of the snackbar show/hide animation, in ms.
ANIMATION_LENGTH:250};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialSnackbar.prototype.cssClasses_={SNACKBAR:'mdl-snackbar',MESSAGE:'mdl-snackbar__text',ACTION:'mdl-snackbar__action',ACTIVE:'mdl-snackbar--active'};/**
   * Display the snackbar.
   *
   * @private
   */MaterialSnackbar.prototype.displaySnackbar_=function(){this.element_.setAttribute('aria-hidden','true');if(this.actionHandler_){this.actionElement_.textContent=this.actionText_;this.actionElement_.addEventListener('click',this.actionHandler_);this.setActionHidden_(false);}this.textElement_.textContent=this.message_;this.element_.classList.add(this.cssClasses_.ACTIVE);this.element_.setAttribute('aria-hidden','false');setTimeout(this.cleanup_.bind(this),this.timeout_);};/**
   * Show the snackbar.
   *
   * @param {Object} data The data for the notification.
   * @public
   */MaterialSnackbar.prototype.showSnackbar=function(data){if(data===undefined){throw new Error('Please provide a data object with at least a message to display.');}if(data['message']===undefined){throw new Error('Please provide a message to be displayed.');}if(data['actionHandler']&&!data['actionText']){throw new Error('Please provide action text with the handler.');}if(this.active){this.queuedNotifications_.push(data);}else{this.active=true;this.message_=data['message'];if(data['timeout']){this.timeout_=data['timeout'];}else{this.timeout_=2750;}if(data['actionHandler']){this.actionHandler_=data['actionHandler'];}if(data['actionText']){this.actionText_=data['actionText'];}this.displaySnackbar_();}};MaterialSnackbar.prototype['showSnackbar']=MaterialSnackbar.prototype.showSnackbar;/**
   * Check if the queue has items within it.
   * If it does, display the next entry.
   *
   * @private
   */MaterialSnackbar.prototype.checkQueue_=function(){if(this.queuedNotifications_.length>0){this.showSnackbar(this.queuedNotifications_.shift());}};/**
   * Cleanup the snackbar event listeners and accessiblity attributes.
   *
   * @private
   */MaterialSnackbar.prototype.cleanup_=function(){this.element_.classList.remove(this.cssClasses_.ACTIVE);setTimeout(function(){this.element_.setAttribute('aria-hidden','true');this.textElement_.textContent='';if(!Boolean(this.actionElement_.getAttribute('aria-hidden'))){this.setActionHidden_(true);this.actionElement_.textContent='';this.actionElement_.removeEventListener('click',this.actionHandler_);}this.actionHandler_=undefined;this.message_=undefined;this.actionText_=undefined;this.active=false;this.checkQueue_();}.bind(this),this.Constant_.ANIMATION_LENGTH);};/**
   * Set the action handler hidden state.
   *
   * @param {boolean} value
   * @private
   */MaterialSnackbar.prototype.setActionHidden_=function(value){if(value){this.actionElement_.setAttribute('aria-hidden','true');}else{this.actionElement_.removeAttribute('aria-hidden');}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialSnackbar,classAsString:'MaterialSnackbar',cssClass:'mdl-js-snackbar',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Spinner MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @param {HTMLElement} element The element that will be upgraded.
   * @constructor
   */var MaterialSpinner=function MaterialSpinner(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialSpinner']=MaterialSpinner;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialSpinner.prototype.Constant_={MDL_SPINNER_LAYER_COUNT:4};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialSpinner.prototype.CssClasses_={MDL_SPINNER_LAYER:'mdl-spinner__layer',MDL_SPINNER_CIRCLE_CLIPPER:'mdl-spinner__circle-clipper',MDL_SPINNER_CIRCLE:'mdl-spinner__circle',MDL_SPINNER_GAP_PATCH:'mdl-spinner__gap-patch',MDL_SPINNER_LEFT:'mdl-spinner__left',MDL_SPINNER_RIGHT:'mdl-spinner__right'};/**
   * Auxiliary method to create a spinner layer.
   *
   * @param {number} index Index of the layer to be created.
   * @public
   */MaterialSpinner.prototype.createLayer=function(index){var layer=document.createElement('div');layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER);layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER+'-'+index);var leftClipper=document.createElement('div');leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_LEFT);var gapPatch=document.createElement('div');gapPatch.classList.add(this.CssClasses_.MDL_SPINNER_GAP_PATCH);var rightClipper=document.createElement('div');rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_RIGHT);var circleOwners=[leftClipper,gapPatch,rightClipper];for(var i=0;i<circleOwners.length;i++){var circle=document.createElement('div');circle.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE);circleOwners[i].appendChild(circle);}layer.appendChild(leftClipper);layer.appendChild(gapPatch);layer.appendChild(rightClipper);this.element_.appendChild(layer);};MaterialSpinner.prototype['createLayer']=MaterialSpinner.prototype.createLayer;/**
   * Stops the spinner animation.
   * Public method for users who need to stop the spinner for any reason.
   *
   * @public
   */MaterialSpinner.prototype.stop=function(){this.element_.classList.remove('is-active');};MaterialSpinner.prototype['stop']=MaterialSpinner.prototype.stop;/**
   * Starts the spinner animation.
   * Public method for users who need to manually start the spinner for any reason
   * (instead of just adding the 'is-active' class to their markup).
   *
   * @public
   */MaterialSpinner.prototype.start=function(){this.element_.classList.add('is-active');};MaterialSpinner.prototype['start']=MaterialSpinner.prototype.start;/**
   * Initialize element.
   */MaterialSpinner.prototype.init=function(){if(this.element_){for(var i=1;i<=this.Constant_.MDL_SPINNER_LAYER_COUNT;i++){this.createLayer(i);}this.element_.classList.add('is-upgraded');}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialSpinner,classAsString:'MaterialSpinner',cssClass:'mdl-js-spinner',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Checkbox MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialSwitch=function MaterialSwitch(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialSwitch']=MaterialSwitch;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialSwitch.prototype.Constant_={TINY_TIMEOUT:0.001};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialSwitch.prototype.CssClasses_={INPUT:'mdl-switch__input',TRACK:'mdl-switch__track',THUMB:'mdl-switch__thumb',FOCUS_HELPER:'mdl-switch__focus-helper',RIPPLE_EFFECT:'mdl-js-ripple-effect',RIPPLE_IGNORE_EVENTS:'mdl-js-ripple-effect--ignore-events',RIPPLE_CONTAINER:'mdl-switch__ripple-container',RIPPLE_CENTER:'mdl-ripple--center',RIPPLE:'mdl-ripple',IS_FOCUSED:'is-focused',IS_DISABLED:'is-disabled',IS_CHECKED:'is-checked'};/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialSwitch.prototype.onChange_=function(event){this.updateClasses_();};/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialSwitch.prototype.onFocus_=function(event){this.element_.classList.add(this.CssClasses_.IS_FOCUSED);};/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialSwitch.prototype.onBlur_=function(event){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);};/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialSwitch.prototype.onMouseUp_=function(event){this.blur_();};/**
   * Handle class updates.
   *
   * @private
   */MaterialSwitch.prototype.updateClasses_=function(){this.checkDisabled();this.checkToggleState();};/**
   * Add blur.
   *
   * @private
   */MaterialSwitch.prototype.blur_=function(){// TODO: figure out why there's a focus event being fired after our blur,
// so that we can avoid this hack.
window.setTimeout(function(){this.inputElement_.blur();}.bind(this),this.Constant_.TINY_TIMEOUT);};// Public methods.
/**
   * Check the components disabled state.
   *
   * @public
   */MaterialSwitch.prototype.checkDisabled=function(){if(this.inputElement_.disabled){this.element_.classList.add(this.CssClasses_.IS_DISABLED);}else{this.element_.classList.remove(this.CssClasses_.IS_DISABLED);}};MaterialSwitch.prototype['checkDisabled']=MaterialSwitch.prototype.checkDisabled;/**
   * Check the components toggled state.
   *
   * @public
   */MaterialSwitch.prototype.checkToggleState=function(){if(this.inputElement_.checked){this.element_.classList.add(this.CssClasses_.IS_CHECKED);}else{this.element_.classList.remove(this.CssClasses_.IS_CHECKED);}};MaterialSwitch.prototype['checkToggleState']=MaterialSwitch.prototype.checkToggleState;/**
   * Disable switch.
   *
   * @public
   */MaterialSwitch.prototype.disable=function(){this.inputElement_.disabled=true;this.updateClasses_();};MaterialSwitch.prototype['disable']=MaterialSwitch.prototype.disable;/**
   * Enable switch.
   *
   * @public
   */MaterialSwitch.prototype.enable=function(){this.inputElement_.disabled=false;this.updateClasses_();};MaterialSwitch.prototype['enable']=MaterialSwitch.prototype.enable;/**
   * Activate switch.
   *
   * @public
   */MaterialSwitch.prototype.on=function(){this.inputElement_.checked=true;this.updateClasses_();};MaterialSwitch.prototype['on']=MaterialSwitch.prototype.on;/**
   * Deactivate switch.
   *
   * @public
   */MaterialSwitch.prototype.off=function(){this.inputElement_.checked=false;this.updateClasses_();};MaterialSwitch.prototype['off']=MaterialSwitch.prototype.off;/**
   * Initialize element.
   */MaterialSwitch.prototype.init=function(){if(this.element_){this.inputElement_=this.element_.querySelector('.'+this.CssClasses_.INPUT);var track=document.createElement('div');track.classList.add(this.CssClasses_.TRACK);var thumb=document.createElement('div');thumb.classList.add(this.CssClasses_.THUMB);var focusHelper=document.createElement('span');focusHelper.classList.add(this.CssClasses_.FOCUS_HELPER);thumb.appendChild(focusHelper);this.element_.appendChild(track);this.element_.appendChild(thumb);this.boundMouseUpHandler=this.onMouseUp_.bind(this);if(this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);this.rippleContainerElement_=document.createElement('span');this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);this.rippleContainerElement_.addEventListener('mouseup',this.boundMouseUpHandler);var ripple=document.createElement('span');ripple.classList.add(this.CssClasses_.RIPPLE);this.rippleContainerElement_.appendChild(ripple);this.element_.appendChild(this.rippleContainerElement_);}this.boundChangeHandler=this.onChange_.bind(this);this.boundFocusHandler=this.onFocus_.bind(this);this.boundBlurHandler=this.onBlur_.bind(this);this.inputElement_.addEventListener('change',this.boundChangeHandler);this.inputElement_.addEventListener('focus',this.boundFocusHandler);this.inputElement_.addEventListener('blur',this.boundBlurHandler);this.element_.addEventListener('mouseup',this.boundMouseUpHandler);this.updateClasses_();this.element_.classList.add('is-upgraded');}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialSwitch,classAsString:'MaterialSwitch',cssClass:'mdl-js-switch',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Tabs MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */var MaterialTabs=function MaterialTabs(element){// Stores the HTML element.
this.element_=element;// Initialize instance.
this.init();};window['MaterialTabs']=MaterialTabs;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string}
   * @private
   */MaterialTabs.prototype.Constant_={};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialTabs.prototype.CssClasses_={TAB_CLASS:'mdl-tabs__tab',PANEL_CLASS:'mdl-tabs__panel',ACTIVE_CLASS:'is-active',UPGRADED_CLASS:'is-upgraded',MDL_JS_RIPPLE_EFFECT:'mdl-js-ripple-effect',MDL_RIPPLE_CONTAINER:'mdl-tabs__ripple-container',MDL_RIPPLE:'mdl-ripple',MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS:'mdl-js-ripple-effect--ignore-events'};/**
   * Handle clicks to a tabs component
   *
   * @private
   */MaterialTabs.prototype.initTabs_=function(){if(this.element_.classList.contains(this.CssClasses_.MDL_JS_RIPPLE_EFFECT)){this.element_.classList.add(this.CssClasses_.MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS);}// Select element tabs, document panels
this.tabs_=this.element_.querySelectorAll('.'+this.CssClasses_.TAB_CLASS);this.panels_=this.element_.querySelectorAll('.'+this.CssClasses_.PANEL_CLASS);// Create new tabs for each tab element
for(var i=0;i<this.tabs_.length;i++){new MaterialTab(this.tabs_[i],this);}this.element_.classList.add(this.CssClasses_.UPGRADED_CLASS);};/**
   * Reset tab state, dropping active classes
   *
   * @private
   */MaterialTabs.prototype.resetTabState_=function(){for(var k=0;k<this.tabs_.length;k++){this.tabs_[k].classList.remove(this.CssClasses_.ACTIVE_CLASS);}};/**
   * Reset panel state, droping active classes
   *
   * @private
   */MaterialTabs.prototype.resetPanelState_=function(){for(var j=0;j<this.panels_.length;j++){this.panels_[j].classList.remove(this.CssClasses_.ACTIVE_CLASS);}};/**
   * Initialize element.
   */MaterialTabs.prototype.init=function(){if(this.element_){this.initTabs_();}};/**
   * Constructor for an individual tab.
   *
   * @constructor
   * @param {Element} tab The HTML element for the tab.
   * @param {MaterialTabs} ctx The MaterialTabs object that owns the tab.
   */function MaterialTab(tab,ctx){if(tab){if(ctx.element_.classList.contains(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT)){var rippleContainer=document.createElement('span');rippleContainer.classList.add(ctx.CssClasses_.MDL_RIPPLE_CONTAINER);rippleContainer.classList.add(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT);var ripple=document.createElement('span');ripple.classList.add(ctx.CssClasses_.MDL_RIPPLE);rippleContainer.appendChild(ripple);tab.appendChild(rippleContainer);}tab.addEventListener('click',function(e){e.preventDefault();var href=tab.href.split('#')[1];var panel=ctx.element_.querySelector('#'+href);ctx.resetTabState_();ctx.resetPanelState_();tab.classList.add(ctx.CssClasses_.ACTIVE_CLASS);panel.classList.add(ctx.CssClasses_.ACTIVE_CLASS);});}}// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialTabs,classAsString:'MaterialTabs',cssClass:'mdl-js-tabs'});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Textfield MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialTextfield=function MaterialTextfield(element){this.element_=element;this.maxRows=this.Constant_.NO_MAX_ROWS;// Initialize instance.
this.init();};window['MaterialTextfield']=MaterialTextfield;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialTextfield.prototype.Constant_={NO_MAX_ROWS:-1,MAX_ROWS_ATTRIBUTE:'maxrows'};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialTextfield.prototype.CssClasses_={LABEL:'mdl-textfield__label',INPUT:'mdl-textfield__input',IS_DIRTY:'is-dirty',IS_FOCUSED:'is-focused',IS_DISABLED:'is-disabled',IS_INVALID:'is-invalid',IS_UPGRADED:'is-upgraded',HAS_PLACEHOLDER:'has-placeholder'};/**
   * Handle input being entered.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialTextfield.prototype.onKeyDown_=function(event){var currentRowCount=event.target.value.split('\n').length;if(event.keyCode===13){if(currentRowCount>=this.maxRows){event.preventDefault();}}};/**
   * Handle focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialTextfield.prototype.onFocus_=function(event){this.element_.classList.add(this.CssClasses_.IS_FOCUSED);};/**
   * Handle lost focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialTextfield.prototype.onBlur_=function(event){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);};/**
   * Handle reset event from out side.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialTextfield.prototype.onReset_=function(event){this.updateClasses_();};/**
   * Handle class updates.
   *
   * @private
   */MaterialTextfield.prototype.updateClasses_=function(){this.checkDisabled();this.checkValidity();this.checkDirty();this.checkFocus();};// Public methods.
/**
   * Check the disabled state and update field accordingly.
   *
   * @public
   */MaterialTextfield.prototype.checkDisabled=function(){if(this.input_.disabled){this.element_.classList.add(this.CssClasses_.IS_DISABLED);}else{this.element_.classList.remove(this.CssClasses_.IS_DISABLED);}};MaterialTextfield.prototype['checkDisabled']=MaterialTextfield.prototype.checkDisabled;/**
  * Check the focus state and update field accordingly.
  *
  * @public
  */MaterialTextfield.prototype.checkFocus=function(){if(Boolean(this.element_.querySelector(':focus'))){this.element_.classList.add(this.CssClasses_.IS_FOCUSED);}else{this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);}};MaterialTextfield.prototype['checkFocus']=MaterialTextfield.prototype.checkFocus;/**
   * Check the validity state and update field accordingly.
   *
   * @public
   */MaterialTextfield.prototype.checkValidity=function(){if(this.input_.validity){if(this.input_.validity.valid){this.element_.classList.remove(this.CssClasses_.IS_INVALID);}else{this.element_.classList.add(this.CssClasses_.IS_INVALID);}}};MaterialTextfield.prototype['checkValidity']=MaterialTextfield.prototype.checkValidity;/**
   * Check the dirty state and update field accordingly.
   *
   * @public
   */MaterialTextfield.prototype.checkDirty=function(){if(this.input_.value&&this.input_.value.length>0){this.element_.classList.add(this.CssClasses_.IS_DIRTY);}else{this.element_.classList.remove(this.CssClasses_.IS_DIRTY);}};MaterialTextfield.prototype['checkDirty']=MaterialTextfield.prototype.checkDirty;/**
   * Disable text field.
   *
   * @public
   */MaterialTextfield.prototype.disable=function(){this.input_.disabled=true;this.updateClasses_();};MaterialTextfield.prototype['disable']=MaterialTextfield.prototype.disable;/**
   * Enable text field.
   *
   * @public
   */MaterialTextfield.prototype.enable=function(){this.input_.disabled=false;this.updateClasses_();};MaterialTextfield.prototype['enable']=MaterialTextfield.prototype.enable;/**
   * Update text field value.
   *
   * @param {string} value The value to which to set the control (optional).
   * @public
   */MaterialTextfield.prototype.change=function(value){this.input_.value=value||'';this.updateClasses_();};MaterialTextfield.prototype['change']=MaterialTextfield.prototype.change;/**
   * Initialize element.
   */MaterialTextfield.prototype.init=function(){if(this.element_){this.label_=this.element_.querySelector('.'+this.CssClasses_.LABEL);this.input_=this.element_.querySelector('.'+this.CssClasses_.INPUT);if(this.input_){if(this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)){this.maxRows=parseInt(this.input_.getAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE),10);if(isNaN(this.maxRows)){this.maxRows=this.Constant_.NO_MAX_ROWS;}}if(this.input_.hasAttribute('placeholder')){this.element_.classList.add(this.CssClasses_.HAS_PLACEHOLDER);}this.boundUpdateClassesHandler=this.updateClasses_.bind(this);this.boundFocusHandler=this.onFocus_.bind(this);this.boundBlurHandler=this.onBlur_.bind(this);this.boundResetHandler=this.onReset_.bind(this);this.input_.addEventListener('input',this.boundUpdateClassesHandler);this.input_.addEventListener('focus',this.boundFocusHandler);this.input_.addEventListener('blur',this.boundBlurHandler);this.input_.addEventListener('reset',this.boundResetHandler);if(this.maxRows!==this.Constant_.NO_MAX_ROWS){// TODO: This should handle pasting multi line text.
// Currently doesn't.
this.boundKeyDownHandler=this.onKeyDown_.bind(this);this.input_.addEventListener('keydown',this.boundKeyDownHandler);}var invalid=this.element_.classList.contains(this.CssClasses_.IS_INVALID);this.updateClasses_();this.element_.classList.add(this.CssClasses_.IS_UPGRADED);if(invalid){this.element_.classList.add(this.CssClasses_.IS_INVALID);}if(this.input_.hasAttribute('autofocus')){this.element_.focus();this.checkFocus();}}}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialTextfield,classAsString:'MaterialTextfield',cssClass:'mdl-js-textfield',widget:true});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Tooltip MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialTooltip=function MaterialTooltip(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialTooltip']=MaterialTooltip;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialTooltip.prototype.Constant_={};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialTooltip.prototype.CssClasses_={IS_ACTIVE:'is-active',BOTTOM:'mdl-tooltip--bottom',LEFT:'mdl-tooltip--left',RIGHT:'mdl-tooltip--right',TOP:'mdl-tooltip--top'};/**
   * Handle mouseenter for tooltip.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialTooltip.prototype.handleMouseEnter_=function(event){var props=event.target.getBoundingClientRect();var left=props.left+props.width/2;var top=props.top+props.height/2;var marginLeft=-1*(this.element_.offsetWidth/2);var marginTop=-1*(this.element_.offsetHeight/2);if(this.element_.classList.contains(this.CssClasses_.LEFT)||this.element_.classList.contains(this.CssClasses_.RIGHT)){left=props.width/2;if(top+marginTop<0){this.element_.style.top='0';this.element_.style.marginTop='0';}else{this.element_.style.top=top+'px';this.element_.style.marginTop=marginTop+'px';}}else{if(left+marginLeft<0){this.element_.style.left='0';this.element_.style.marginLeft='0';}else{this.element_.style.left=left+'px';this.element_.style.marginLeft=marginLeft+'px';}}if(this.element_.classList.contains(this.CssClasses_.TOP)){this.element_.style.top=props.top-this.element_.offsetHeight-10+'px';}else if(this.element_.classList.contains(this.CssClasses_.RIGHT)){this.element_.style.left=props.left+props.width+10+'px';}else if(this.element_.classList.contains(this.CssClasses_.LEFT)){this.element_.style.left=props.left-this.element_.offsetWidth-10+'px';}else{this.element_.style.top=props.top+props.height+10+'px';}this.element_.classList.add(this.CssClasses_.IS_ACTIVE);};/**
   * Hide tooltip on mouseleave or scroll
   *
   * @private
   */MaterialTooltip.prototype.hideTooltip_=function(){this.element_.classList.remove(this.CssClasses_.IS_ACTIVE);};/**
   * Initialize element.
   */MaterialTooltip.prototype.init=function(){if(this.element_){var forElId=this.element_.getAttribute('for')||this.element_.getAttribute('data-mdl-for');if(forElId){this.forElement_=document.getElementById(forElId);}if(this.forElement_){// It's left here because it prevents accidental text selection on Android
if(!this.forElement_.hasAttribute('tabindex')){this.forElement_.setAttribute('tabindex','0');}this.boundMouseEnterHandler=this.handleMouseEnter_.bind(this);this.boundMouseLeaveAndScrollHandler=this.hideTooltip_.bind(this);this.forElement_.addEventListener('mouseenter',this.boundMouseEnterHandler,false);this.forElement_.addEventListener('touchend',this.boundMouseEnterHandler,false);this.forElement_.addEventListener('mouseleave',this.boundMouseLeaveAndScrollHandler,false);window.addEventListener('scroll',this.boundMouseLeaveAndScrollHandler,true);window.addEventListener('touchstart',this.boundMouseLeaveAndScrollHandler);}}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialTooltip,classAsString:'MaterialTooltip',cssClass:'mdl-tooltip'});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Layout MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialLayout=function MaterialLayout(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialLayout']=MaterialLayout;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialLayout.prototype.Constant_={MAX_WIDTH:'(max-width: 1024px)',TAB_SCROLL_PIXELS:100,RESIZE_TIMEOUT:100,MENU_ICON:'&#xE5D2;',CHEVRON_LEFT:'chevron_left',CHEVRON_RIGHT:'chevron_right'};/**
   * Keycodes, for code readability.
   *
   * @enum {number}
   * @private
   */MaterialLayout.prototype.Keycodes_={ENTER:13,ESCAPE:27,SPACE:32};/**
   * Modes.
   *
   * @enum {number}
   * @private
   */MaterialLayout.prototype.Mode_={STANDARD:0,SEAMED:1,WATERFALL:2,SCROLL:3};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialLayout.prototype.CssClasses_={CONTAINER:'mdl-layout__container',HEADER:'mdl-layout__header',DRAWER:'mdl-layout__drawer',CONTENT:'mdl-layout__content',DRAWER_BTN:'mdl-layout__drawer-button',ICON:'material-icons',JS_RIPPLE_EFFECT:'mdl-js-ripple-effect',RIPPLE_CONTAINER:'mdl-layout__tab-ripple-container',RIPPLE:'mdl-ripple',RIPPLE_IGNORE_EVENTS:'mdl-js-ripple-effect--ignore-events',HEADER_SEAMED:'mdl-layout__header--seamed',HEADER_WATERFALL:'mdl-layout__header--waterfall',HEADER_SCROLL:'mdl-layout__header--scroll',FIXED_HEADER:'mdl-layout--fixed-header',OBFUSCATOR:'mdl-layout__obfuscator',TAB_BAR:'mdl-layout__tab-bar',TAB_CONTAINER:'mdl-layout__tab-bar-container',TAB:'mdl-layout__tab',TAB_BAR_BUTTON:'mdl-layout__tab-bar-button',TAB_BAR_LEFT_BUTTON:'mdl-layout__tab-bar-left-button',TAB_BAR_RIGHT_BUTTON:'mdl-layout__tab-bar-right-button',PANEL:'mdl-layout__tab-panel',HAS_DRAWER:'has-drawer',HAS_TABS:'has-tabs',HAS_SCROLLING_HEADER:'has-scrolling-header',CASTING_SHADOW:'is-casting-shadow',IS_COMPACT:'is-compact',IS_SMALL_SCREEN:'is-small-screen',IS_DRAWER_OPEN:'is-visible',IS_ACTIVE:'is-active',IS_UPGRADED:'is-upgraded',IS_ANIMATING:'is-animating',ON_LARGE_SCREEN:'mdl-layout--large-screen-only',ON_SMALL_SCREEN:'mdl-layout--small-screen-only'};/**
   * Handles scrolling on the content.
   *
   * @private
   */MaterialLayout.prototype.contentScrollHandler_=function(){if(this.header_.classList.contains(this.CssClasses_.IS_ANIMATING)){return;}var headerVisible=!this.element_.classList.contains(this.CssClasses_.IS_SMALL_SCREEN)||this.element_.classList.contains(this.CssClasses_.FIXED_HEADER);if(this.content_.scrollTop>0&&!this.header_.classList.contains(this.CssClasses_.IS_COMPACT)){this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);this.header_.classList.add(this.CssClasses_.IS_COMPACT);if(headerVisible){this.header_.classList.add(this.CssClasses_.IS_ANIMATING);}}else if(this.content_.scrollTop<=0&&this.header_.classList.contains(this.CssClasses_.IS_COMPACT)){this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);this.header_.classList.remove(this.CssClasses_.IS_COMPACT);if(headerVisible){this.header_.classList.add(this.CssClasses_.IS_ANIMATING);}}};/**
   * Handles a keyboard event on the drawer.
   *
   * @param {Event} evt The event that fired.
   * @private
   */MaterialLayout.prototype.keyboardEventHandler_=function(evt){// Only react when the drawer is open.
if(evt.keyCode===this.Keycodes_.ESCAPE&&this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)){this.toggleDrawer();}};/**
   * Handles changes in screen size.
   *
   * @private
   */MaterialLayout.prototype.screenSizeHandler_=function(){if(this.screenSizeMediaQuery_.matches){this.element_.classList.add(this.CssClasses_.IS_SMALL_SCREEN);}else{this.element_.classList.remove(this.CssClasses_.IS_SMALL_SCREEN);// Collapse drawer (if any) when moving to a large screen size.
if(this.drawer_){this.drawer_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);this.obfuscator_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);}}};/**
   * Handles events of drawer button.
   *
   * @param {Event} evt The event that fired.
   * @private
   */MaterialLayout.prototype.drawerToggleHandler_=function(evt){if(evt&&evt.type==='keydown'){if(evt.keyCode===this.Keycodes_.SPACE||evt.keyCode===this.Keycodes_.ENTER){// prevent scrolling in drawer nav
evt.preventDefault();}else{// prevent other keys
return;}}this.toggleDrawer();};/**
   * Handles (un)setting the `is-animating` class
   *
   * @private
   */MaterialLayout.prototype.headerTransitionEndHandler_=function(){this.header_.classList.remove(this.CssClasses_.IS_ANIMATING);};/**
   * Handles expanding the header on click
   *
   * @private
   */MaterialLayout.prototype.headerClickHandler_=function(){if(this.header_.classList.contains(this.CssClasses_.IS_COMPACT)){this.header_.classList.remove(this.CssClasses_.IS_COMPACT);this.header_.classList.add(this.CssClasses_.IS_ANIMATING);}};/**
   * Reset tab state, dropping active classes
   *
   * @private
   */MaterialLayout.prototype.resetTabState_=function(tabBar){for(var k=0;k<tabBar.length;k++){tabBar[k].classList.remove(this.CssClasses_.IS_ACTIVE);}};/**
   * Reset panel state, droping active classes
   *
   * @private
   */MaterialLayout.prototype.resetPanelState_=function(panels){for(var j=0;j<panels.length;j++){panels[j].classList.remove(this.CssClasses_.IS_ACTIVE);}};/**
  * Toggle drawer state
  *
  * @public
  */MaterialLayout.prototype.toggleDrawer=function(){var drawerButton=this.element_.querySelector('.'+this.CssClasses_.DRAWER_BTN);this.drawer_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);this.obfuscator_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);// Set accessibility properties.
if(this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)){this.drawer_.setAttribute('aria-hidden','false');drawerButton.setAttribute('aria-expanded','true');}else{this.drawer_.setAttribute('aria-hidden','true');drawerButton.setAttribute('aria-expanded','false');}};MaterialLayout.prototype['toggleDrawer']=MaterialLayout.prototype.toggleDrawer;/**
   * Initialize element.
   */MaterialLayout.prototype.init=function(){if(this.element_){var container=document.createElement('div');container.classList.add(this.CssClasses_.CONTAINER);var focusedElement=this.element_.querySelector(':focus');this.element_.parentElement.insertBefore(container,this.element_);this.element_.parentElement.removeChild(this.element_);container.appendChild(this.element_);if(focusedElement){focusedElement.focus();}var directChildren=this.element_.childNodes;var numChildren=directChildren.length;for(var c=0;c<numChildren;c++){var child=directChildren[c];if(child.classList&&child.classList.contains(this.CssClasses_.HEADER)){this.header_=child;}if(child.classList&&child.classList.contains(this.CssClasses_.DRAWER)){this.drawer_=child;}if(child.classList&&child.classList.contains(this.CssClasses_.CONTENT)){this.content_=child;}}window.addEventListener('pageshow',function(e){if(e.persisted){// when page is loaded from back/forward cache
// trigger repaint to let layout scroll in safari
this.element_.style.overflowY='hidden';requestAnimationFrame(function(){this.element_.style.overflowY='';}.bind(this));}}.bind(this),false);if(this.header_){this.tabBar_=this.header_.querySelector('.'+this.CssClasses_.TAB_BAR);}var mode=this.Mode_.STANDARD;if(this.header_){if(this.header_.classList.contains(this.CssClasses_.HEADER_SEAMED)){mode=this.Mode_.SEAMED;}else if(this.header_.classList.contains(this.CssClasses_.HEADER_WATERFALL)){mode=this.Mode_.WATERFALL;this.header_.addEventListener('transitionend',this.headerTransitionEndHandler_.bind(this));this.header_.addEventListener('click',this.headerClickHandler_.bind(this));}else if(this.header_.classList.contains(this.CssClasses_.HEADER_SCROLL)){mode=this.Mode_.SCROLL;container.classList.add(this.CssClasses_.HAS_SCROLLING_HEADER);}if(mode===this.Mode_.STANDARD){this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);if(this.tabBar_){this.tabBar_.classList.add(this.CssClasses_.CASTING_SHADOW);}}else if(mode===this.Mode_.SEAMED||mode===this.Mode_.SCROLL){this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);if(this.tabBar_){this.tabBar_.classList.remove(this.CssClasses_.CASTING_SHADOW);}}else if(mode===this.Mode_.WATERFALL){// Add and remove shadows depending on scroll position.
// Also add/remove auxiliary class for styling of the compact version of
// the header.
this.content_.addEventListener('scroll',this.contentScrollHandler_.bind(this));this.contentScrollHandler_();}}// Add drawer toggling button to our layout, if we have an openable drawer.
if(this.drawer_){var drawerButton=this.element_.querySelector('.'+this.CssClasses_.DRAWER_BTN);if(!drawerButton){drawerButton=document.createElement('div');drawerButton.setAttribute('aria-expanded','false');drawerButton.setAttribute('role','button');drawerButton.setAttribute('tabindex','0');drawerButton.classList.add(this.CssClasses_.DRAWER_BTN);var drawerButtonIcon=document.createElement('i');drawerButtonIcon.classList.add(this.CssClasses_.ICON);drawerButtonIcon.innerHTML=this.Constant_.MENU_ICON;drawerButton.appendChild(drawerButtonIcon);}if(this.drawer_.classList.contains(this.CssClasses_.ON_LARGE_SCREEN)){//If drawer has ON_LARGE_SCREEN class then add it to the drawer toggle button as well.
drawerButton.classList.add(this.CssClasses_.ON_LARGE_SCREEN);}else if(this.drawer_.classList.contains(this.CssClasses_.ON_SMALL_SCREEN)){//If drawer has ON_SMALL_SCREEN class then add it to the drawer toggle button as well.
drawerButton.classList.add(this.CssClasses_.ON_SMALL_SCREEN);}drawerButton.addEventListener('click',this.drawerToggleHandler_.bind(this));drawerButton.addEventListener('keydown',this.drawerToggleHandler_.bind(this));// Add a class if the layout has a drawer, for altering the left padding.
// Adds the HAS_DRAWER to the elements since this.header_ may or may
// not be present.
this.element_.classList.add(this.CssClasses_.HAS_DRAWER);// If we have a fixed header, add the button to the header rather than
// the layout.
if(this.element_.classList.contains(this.CssClasses_.FIXED_HEADER)){this.header_.insertBefore(drawerButton,this.header_.firstChild);}else{this.element_.insertBefore(drawerButton,this.content_);}var obfuscator=document.createElement('div');obfuscator.classList.add(this.CssClasses_.OBFUSCATOR);this.element_.appendChild(obfuscator);obfuscator.addEventListener('click',this.drawerToggleHandler_.bind(this));this.obfuscator_=obfuscator;this.drawer_.addEventListener('keydown',this.keyboardEventHandler_.bind(this));this.drawer_.setAttribute('aria-hidden','true');}// Keep an eye on screen size, and add/remove auxiliary class for styling
// of small screens.
this.screenSizeMediaQuery_=window.matchMedia(this.Constant_.MAX_WIDTH);this.screenSizeMediaQuery_.addListener(this.screenSizeHandler_.bind(this));this.screenSizeHandler_();// Initialize tabs, if any.
if(this.header_&&this.tabBar_){this.element_.classList.add(this.CssClasses_.HAS_TABS);var tabContainer=document.createElement('div');tabContainer.classList.add(this.CssClasses_.TAB_CONTAINER);this.header_.insertBefore(tabContainer,this.tabBar_);this.header_.removeChild(this.tabBar_);var leftButton=document.createElement('div');leftButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);leftButton.classList.add(this.CssClasses_.TAB_BAR_LEFT_BUTTON);var leftButtonIcon=document.createElement('i');leftButtonIcon.classList.add(this.CssClasses_.ICON);leftButtonIcon.textContent=this.Constant_.CHEVRON_LEFT;leftButton.appendChild(leftButtonIcon);leftButton.addEventListener('click',function(){this.tabBar_.scrollLeft-=this.Constant_.TAB_SCROLL_PIXELS;}.bind(this));var rightButton=document.createElement('div');rightButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);rightButton.classList.add(this.CssClasses_.TAB_BAR_RIGHT_BUTTON);var rightButtonIcon=document.createElement('i');rightButtonIcon.classList.add(this.CssClasses_.ICON);rightButtonIcon.textContent=this.Constant_.CHEVRON_RIGHT;rightButton.appendChild(rightButtonIcon);rightButton.addEventListener('click',function(){this.tabBar_.scrollLeft+=this.Constant_.TAB_SCROLL_PIXELS;}.bind(this));tabContainer.appendChild(leftButton);tabContainer.appendChild(this.tabBar_);tabContainer.appendChild(rightButton);// Add and remove tab buttons depending on scroll position and total
// window size.
var tabUpdateHandler=function(){if(this.tabBar_.scrollLeft>0){leftButton.classList.add(this.CssClasses_.IS_ACTIVE);}else{leftButton.classList.remove(this.CssClasses_.IS_ACTIVE);}if(this.tabBar_.scrollLeft<this.tabBar_.scrollWidth-this.tabBar_.offsetWidth){rightButton.classList.add(this.CssClasses_.IS_ACTIVE);}else{rightButton.classList.remove(this.CssClasses_.IS_ACTIVE);}}.bind(this);this.tabBar_.addEventListener('scroll',tabUpdateHandler);tabUpdateHandler();// Update tabs when the window resizes.
var windowResizeHandler=function(){// Use timeouts to make sure it doesn't happen too often.
if(this.resizeTimeoutId_){clearTimeout(this.resizeTimeoutId_);}this.resizeTimeoutId_=setTimeout(function(){tabUpdateHandler();this.resizeTimeoutId_=null;}.bind(this),this.Constant_.RESIZE_TIMEOUT);}.bind(this);window.addEventListener('resize',windowResizeHandler);if(this.tabBar_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)){this.tabBar_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);}// Select element tabs, document panels
var tabs=this.tabBar_.querySelectorAll('.'+this.CssClasses_.TAB);var panels=this.content_.querySelectorAll('.'+this.CssClasses_.PANEL);// Create new tabs for each tab element
for(var i=0;i<tabs.length;i++){new MaterialLayoutTab(tabs[i],tabs,panels,this);}}this.element_.classList.add(this.CssClasses_.IS_UPGRADED);}};/**
   * Constructor for an individual tab.
   *
   * @constructor
   * @param {HTMLElement} tab The HTML element for the tab.
   * @param {!Array<HTMLElement>} tabs Array with HTML elements for all tabs.
   * @param {!Array<HTMLElement>} panels Array with HTML elements for all panels.
   * @param {MaterialLayout} layout The MaterialLayout object that owns the tab.
   */function MaterialLayoutTab(tab,tabs,panels,layout){/**
     * Auxiliary method to programmatically select a tab in the UI.
     */function selectTab(){var href=tab.href.split('#')[1];var panel=layout.content_.querySelector('#'+href);layout.resetTabState_(tabs);layout.resetPanelState_(panels);tab.classList.add(layout.CssClasses_.IS_ACTIVE);panel.classList.add(layout.CssClasses_.IS_ACTIVE);}if(layout.tabBar_.classList.contains(layout.CssClasses_.JS_RIPPLE_EFFECT)){var rippleContainer=document.createElement('span');rippleContainer.classList.add(layout.CssClasses_.RIPPLE_CONTAINER);rippleContainer.classList.add(layout.CssClasses_.JS_RIPPLE_EFFECT);var ripple=document.createElement('span');ripple.classList.add(layout.CssClasses_.RIPPLE);rippleContainer.appendChild(ripple);tab.appendChild(rippleContainer);}tab.addEventListener('click',function(e){if(tab.getAttribute('href').charAt(0)==='#'){e.preventDefault();selectTab();}});tab.show=selectTab;}window['MaterialLayoutTab']=MaterialLayoutTab;// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialLayout,classAsString:'MaterialLayout',cssClass:'mdl-js-layout'});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Data Table Card MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */var MaterialDataTable=function MaterialDataTable(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialDataTable']=MaterialDataTable;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialDataTable.prototype.Constant_={};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialDataTable.prototype.CssClasses_={DATA_TABLE:'mdl-data-table',SELECTABLE:'mdl-data-table--selectable',SELECT_ELEMENT:'mdl-data-table__select',IS_SELECTED:'is-selected',IS_UPGRADED:'is-upgraded'};/**
   * Generates and returns a function that toggles the selection state of a
   * single row (or multiple rows).
   *
   * @param {Element} checkbox Checkbox that toggles the selection state.
   * @param {Element} row Row to toggle when checkbox changes.
   * @param {(Array<Object>|NodeList)=} opt_rows Rows to toggle when checkbox changes.
   * @private
   */MaterialDataTable.prototype.selectRow_=function(checkbox,row,opt_rows){if(row){return function(){if(checkbox.checked){row.classList.add(this.CssClasses_.IS_SELECTED);}else{row.classList.remove(this.CssClasses_.IS_SELECTED);}}.bind(this);}if(opt_rows){return function(){var i;var el;if(checkbox.checked){for(i=0;i<opt_rows.length;i++){el=opt_rows[i].querySelector('td').querySelector('.mdl-checkbox');el['MaterialCheckbox'].check();opt_rows[i].classList.add(this.CssClasses_.IS_SELECTED);}}else{for(i=0;i<opt_rows.length;i++){el=opt_rows[i].querySelector('td').querySelector('.mdl-checkbox');el['MaterialCheckbox'].uncheck();opt_rows[i].classList.remove(this.CssClasses_.IS_SELECTED);}}}.bind(this);}};/**
   * Creates a checkbox for a single or or multiple rows and hooks up the
   * event handling.
   *
   * @param {Element} row Row to toggle when checkbox changes.
   * @param {(Array<Object>|NodeList)=} opt_rows Rows to toggle when checkbox changes.
   * @private
   */MaterialDataTable.prototype.createCheckbox_=function(row,opt_rows){var label=document.createElement('label');var labelClasses=['mdl-checkbox','mdl-js-checkbox','mdl-js-ripple-effect',this.CssClasses_.SELECT_ELEMENT];label.className=labelClasses.join(' ');var checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.classList.add('mdl-checkbox__input');if(row){checkbox.checked=row.classList.contains(this.CssClasses_.IS_SELECTED);checkbox.addEventListener('change',this.selectRow_(checkbox,row));}else if(opt_rows){checkbox.addEventListener('change',this.selectRow_(checkbox,null,opt_rows));}label.appendChild(checkbox);componentHandler.upgradeElement(label,'MaterialCheckbox');return label;};/**
   * Initialize element.
   */MaterialDataTable.prototype.init=function(){if(this.element_){var firstHeader=this.element_.querySelector('th');var bodyRows=Array.prototype.slice.call(this.element_.querySelectorAll('tbody tr'));var footRows=Array.prototype.slice.call(this.element_.querySelectorAll('tfoot tr'));var rows=bodyRows.concat(footRows);if(this.element_.classList.contains(this.CssClasses_.SELECTABLE)){var th=document.createElement('th');var headerCheckbox=this.createCheckbox_(null,rows);th.appendChild(headerCheckbox);firstHeader.parentElement.insertBefore(th,firstHeader);for(var i=0;i<rows.length;i++){var firstCell=rows[i].querySelector('td');if(firstCell){var td=document.createElement('td');if(rows[i].parentNode.nodeName.toUpperCase()==='TBODY'){var rowCheckbox=this.createCheckbox_(rows[i]);td.appendChild(rowCheckbox);}rows[i].insertBefore(td,firstCell);}}this.element_.classList.add(this.CssClasses_.IS_UPGRADED);}}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialDataTable,classAsString:'MaterialDataTable',cssClass:'mdl-js-data-table'});/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
   * Class constructor for Ripple MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */var MaterialRipple=function MaterialRipple(element){this.element_=element;// Initialize instance.
this.init();};window['MaterialRipple']=MaterialRipple;/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */MaterialRipple.prototype.Constant_={INITIAL_SCALE:'scale(0.0001, 0.0001)',INITIAL_SIZE:'1px',INITIAL_OPACITY:'0.4',FINAL_OPACITY:'0',FINAL_SCALE:''};/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */MaterialRipple.prototype.CssClasses_={RIPPLE_CENTER:'mdl-ripple--center',RIPPLE_EFFECT_IGNORE_EVENTS:'mdl-js-ripple-effect--ignore-events',RIPPLE:'mdl-ripple',IS_ANIMATING:'is-animating',IS_VISIBLE:'is-visible'};/**
   * Handle mouse / finger down on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialRipple.prototype.downHandler_=function(event){if(!this.rippleElement_.style.width&&!this.rippleElement_.style.height){var rect=this.element_.getBoundingClientRect();this.boundHeight=rect.height;this.boundWidth=rect.width;this.rippleSize_=Math.sqrt(rect.width*rect.width+rect.height*rect.height)*2+2;this.rippleElement_.style.width=this.rippleSize_+'px';this.rippleElement_.style.height=this.rippleSize_+'px';}this.rippleElement_.classList.add(this.CssClasses_.IS_VISIBLE);if(event.type==='mousedown'&&this.ignoringMouseDown_){this.ignoringMouseDown_=false;}else{if(event.type==='touchstart'){this.ignoringMouseDown_=true;}var frameCount=this.getFrameCount();if(frameCount>0){return;}this.setFrameCount(1);var bound=event.currentTarget.getBoundingClientRect();var x;var y;// Check if we are handling a keyboard click.
if(event.clientX===0&&event.clientY===0){x=Math.round(bound.width/2);y=Math.round(bound.height/2);}else{var clientX=event.clientX?event.clientX:event.touches[0].clientX;var clientY=event.clientY?event.clientY:event.touches[0].clientY;x=Math.round(clientX-bound.left);y=Math.round(clientY-bound.top);}this.setRippleXY(x,y);this.setRippleStyles(true);window.requestAnimationFrame(this.animFrameHandler.bind(this));}};/**
   * Handle mouse / finger up on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */MaterialRipple.prototype.upHandler_=function(event){// Don't fire for the artificial "mouseup" generated by a double-click.
if(event&&event.detail!==2){// Allow a repaint to occur before removing this class, so the animation
// shows for tap events, which seem to trigger a mouseup too soon after
// mousedown.
window.setTimeout(function(){this.rippleElement_.classList.remove(this.CssClasses_.IS_VISIBLE);}.bind(this),0);}};/**
   * Initialize element.
   */MaterialRipple.prototype.init=function(){if(this.element_){var recentering=this.element_.classList.contains(this.CssClasses_.RIPPLE_CENTER);if(!this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT_IGNORE_EVENTS)){this.rippleElement_=this.element_.querySelector('.'+this.CssClasses_.RIPPLE);this.frameCount_=0;this.rippleSize_=0;this.x_=0;this.y_=0;// Touch start produces a compat mouse down event, which would cause a
// second ripples. To avoid that, we use this property to ignore the first
// mouse down after a touch start.
this.ignoringMouseDown_=false;this.boundDownHandler=this.downHandler_.bind(this);this.element_.addEventListener('mousedown',this.boundDownHandler);this.element_.addEventListener('touchstart',this.boundDownHandler);this.boundUpHandler=this.upHandler_.bind(this);this.element_.addEventListener('mouseup',this.boundUpHandler);this.element_.addEventListener('mouseleave',this.boundUpHandler);this.element_.addEventListener('touchend',this.boundUpHandler);this.element_.addEventListener('blur',this.boundUpHandler);/**
         * Getter for frameCount_.
         * @return {number} the frame count.
         */this.getFrameCount=function(){return this.frameCount_;};/**
         * Setter for frameCount_.
         * @param {number} fC the frame count.
         */this.setFrameCount=function(fC){this.frameCount_=fC;};/**
         * Getter for rippleElement_.
         * @return {Element} the ripple element.
         */this.getRippleElement=function(){return this.rippleElement_;};/**
         * Sets the ripple X and Y coordinates.
         * @param  {number} newX the new X coordinate
         * @param  {number} newY the new Y coordinate
         */this.setRippleXY=function(newX,newY){this.x_=newX;this.y_=newY;};/**
         * Sets the ripple styles.
         * @param  {boolean} start whether or not this is the start frame.
         */this.setRippleStyles=function(start){if(this.rippleElement_!==null){var transformString;var scale;var size;var offset='translate('+this.x_+'px, '+this.y_+'px)';if(start){scale=this.Constant_.INITIAL_SCALE;size=this.Constant_.INITIAL_SIZE;}else{scale=this.Constant_.FINAL_SCALE;size=this.rippleSize_+'px';if(recentering){offset='translate('+this.boundWidth/2+'px, '+this.boundHeight/2+'px)';}}transformString='translate(-50%, -50%) '+offset+scale;this.rippleElement_.style.webkitTransform=transformString;this.rippleElement_.style.msTransform=transformString;this.rippleElement_.style.transform=transformString;if(start){this.rippleElement_.classList.remove(this.CssClasses_.IS_ANIMATING);}else{this.rippleElement_.classList.add(this.CssClasses_.IS_ANIMATING);}}};/**
         * Handles an animation frame.
         */this.animFrameHandler=function(){if(this.frameCount_-->0){window.requestAnimationFrame(this.animFrameHandler.bind(this));}else{this.setRippleStyles(false);}};}}};// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({constructor:MaterialRipple,classAsString:'MaterialRipple',cssClass:'mdl-js-ripple-effect',widget:false});})();

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}



function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var moment = createCommonjsModule(function (module, exports) {
//! moment.js
//! version : 2.16.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?module.exports=factory():typeof define==='function'&&define.amd?define(factory):global.moment=factory();})(commonjsGlobal,function(){'use strict';var hookCallback;function hooks(){return hookCallback.apply(null,arguments);}// This is done to register the method called with moment()
// without creating circular dependencies.
function setHookCallback(callback){hookCallback=callback;}function isArray(input){return input instanceof Array||Object.prototype.toString.call(input)==='[object Array]';}function isObject(input){// IE8 will treat undefined and null as object if it wasn't for
// input != null
return input!=null&&Object.prototype.toString.call(input)==='[object Object]';}function isObjectEmpty(obj){var k;for(k in obj){// even if its not own property I'd still call it non-empty
return false;}return true;}function isNumber(input){return typeof value==='number'||Object.prototype.toString.call(input)==='[object Number]';}function isDate(input){return input instanceof Date||Object.prototype.toString.call(input)==='[object Date]';}function map(arr,fn){var res=[],i;for(i=0;i<arr.length;++i){res.push(fn(arr[i],i));}return res;}function hasOwnProp(a,b){return Object.prototype.hasOwnProperty.call(a,b);}function extend(a,b){for(var i in b){if(hasOwnProp(b,i)){a[i]=b[i];}}if(hasOwnProp(b,'toString')){a.toString=b.toString;}if(hasOwnProp(b,'valueOf')){a.valueOf=b.valueOf;}return a;}function createUTC(input,format,locale,strict){return createLocalOrUTC(input,format,locale,strict,true).utc();}function defaultParsingFlags(){// We need to deep clone this object.
return{empty:false,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:false,invalidMonth:null,invalidFormat:false,userInvalidated:false,iso:false,parsedDateParts:[],meridiem:null};}function getParsingFlags(m){if(m._pf==null){m._pf=defaultParsingFlags();}return m._pf;}var some;if(Array.prototype.some){some=Array.prototype.some;}else{some=function(fun){var t=Object(this);var len=t.length>>>0;for(var i=0;i<len;i++){if(i in t&&fun.call(this,t[i],i,t)){return true;}}return false;};}var some$1=some;function isValid(m){if(m._isValid==null){var flags=getParsingFlags(m);var parsedParts=some$1.call(flags.parsedDateParts,function(i){return i!=null;});var isNowValid=!isNaN(m._d.getTime())&&flags.overflow<0&&!flags.empty&&!flags.invalidMonth&&!flags.invalidWeekday&&!flags.nullInput&&!flags.invalidFormat&&!flags.userInvalidated&&(!flags.meridiem||flags.meridiem&&parsedParts);if(m._strict){isNowValid=isNowValid&&flags.charsLeftOver===0&&flags.unusedTokens.length===0&&flags.bigHour===undefined;}if(Object.isFrozen==null||!Object.isFrozen(m)){m._isValid=isNowValid;}else{return isNowValid;}}return m._isValid;}function createInvalid(flags){var m=createUTC(NaN);if(flags!=null){extend(getParsingFlags(m),flags);}else{getParsingFlags(m).userInvalidated=true;}return m;}function isUndefined(input){return input===void 0;}// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
var momentProperties=hooks.momentProperties=[];function copyConfig(to,from){var i,prop,val;if(!isUndefined(from._isAMomentObject)){to._isAMomentObject=from._isAMomentObject;}if(!isUndefined(from._i)){to._i=from._i;}if(!isUndefined(from._f)){to._f=from._f;}if(!isUndefined(from._l)){to._l=from._l;}if(!isUndefined(from._strict)){to._strict=from._strict;}if(!isUndefined(from._tzm)){to._tzm=from._tzm;}if(!isUndefined(from._isUTC)){to._isUTC=from._isUTC;}if(!isUndefined(from._offset)){to._offset=from._offset;}if(!isUndefined(from._pf)){to._pf=getParsingFlags(from);}if(!isUndefined(from._locale)){to._locale=from._locale;}if(momentProperties.length>0){for(i in momentProperties){prop=momentProperties[i];val=from[prop];if(!isUndefined(val)){to[prop]=val;}}}return to;}var updateInProgress=false;// Moment prototype object
function Moment(config){copyConfig(this,config);this._d=new Date(config._d!=null?config._d.getTime():NaN);// Prevent infinite loop in case updateOffset creates new moment
// objects.
if(updateInProgress===false){updateInProgress=true;hooks.updateOffset(this);updateInProgress=false;}}function isMoment(obj){return obj instanceof Moment||obj!=null&&obj._isAMomentObject!=null;}function absFloor(number){if(number<0){// -0 -> 0
return Math.ceil(number)||0;}else{return Math.floor(number);}}function toInt(argumentForCoercion){var coercedNumber=+argumentForCoercion,value=0;if(coercedNumber!==0&&isFinite(coercedNumber)){value=absFloor(coercedNumber);}return value;}// compare two arrays, return the number of differences
function compareArrays(array1,array2,dontConvert){var len=Math.min(array1.length,array2.length),lengthDiff=Math.abs(array1.length-array2.length),diffs=0,i;for(i=0;i<len;i++){if(dontConvert&&array1[i]!==array2[i]||!dontConvert&&toInt(array1[i])!==toInt(array2[i])){diffs++;}}return diffs+lengthDiff;}function warn(msg){if(hooks.suppressDeprecationWarnings===false&&typeof console!=='undefined'&&console.warn){console.warn('Deprecation warning: '+msg);}}function deprecate(msg,fn){var firstTime=true;return extend(function(){if(hooks.deprecationHandler!=null){hooks.deprecationHandler(null,msg);}if(firstTime){var args=[];var arg;for(var i=0;i<arguments.length;i++){arg='';if(typeof arguments[i]==='object'){arg+='\n['+i+'] ';for(var key in arguments[0]){arg+=key+': '+arguments[0][key]+', ';}arg=arg.slice(0,-2);// Remove trailing comma and space
}else{arg=arguments[i];}args.push(arg);}warn(msg+'\nArguments: '+Array.prototype.slice.call(args).join('')+'\n'+new Error().stack);firstTime=false;}return fn.apply(this,arguments);},fn);}var deprecations={};function deprecateSimple(name,msg){if(hooks.deprecationHandler!=null){hooks.deprecationHandler(name,msg);}if(!deprecations[name]){warn(msg);deprecations[name]=true;}}hooks.suppressDeprecationWarnings=false;hooks.deprecationHandler=null;function isFunction(input){return input instanceof Function||Object.prototype.toString.call(input)==='[object Function]';}function set(config){var prop,i;for(i in config){prop=config[i];if(isFunction(prop)){this[i]=prop;}else{this['_'+i]=prop;}}this._config=config;// Lenient ordinal parsing accepts just a number in addition to
// number + (possibly) stuff coming from _ordinalParseLenient.
this._ordinalParseLenient=new RegExp(this._ordinalParse.source+'|'+/\d{1,2}/.source);}function mergeConfigs(parentConfig,childConfig){var res=extend({},parentConfig),prop;for(prop in childConfig){if(hasOwnProp(childConfig,prop)){if(isObject(parentConfig[prop])&&isObject(childConfig[prop])){res[prop]={};extend(res[prop],parentConfig[prop]);extend(res[prop],childConfig[prop]);}else if(childConfig[prop]!=null){res[prop]=childConfig[prop];}else{delete res[prop];}}}for(prop in parentConfig){if(hasOwnProp(parentConfig,prop)&&!hasOwnProp(childConfig,prop)&&isObject(parentConfig[prop])){// make sure changes to properties don't modify parent config
res[prop]=extend({},res[prop]);}}return res;}function Locale(config){if(config!=null){this.set(config);}}var keys;if(Object.keys){keys=Object.keys;}else{keys=function(obj){var i,res=[];for(i in obj){if(hasOwnProp(obj,i)){res.push(i);}}return res;};}var keys$1=keys;var defaultCalendar={sameDay:'[Today at] LT',nextDay:'[Tomorrow at] LT',nextWeek:'dddd [at] LT',lastDay:'[Yesterday at] LT',lastWeek:'[Last] dddd [at] LT',sameElse:'L'};function calendar(key,mom,now){var output=this._calendar[key]||this._calendar['sameElse'];return isFunction(output)?output.call(mom,now):output;}var defaultLongDateFormat={LTS:'h:mm:ss A',LT:'h:mm A',L:'MM/DD/YYYY',LL:'MMMM D, YYYY',LLL:'MMMM D, YYYY h:mm A',LLLL:'dddd, MMMM D, YYYY h:mm A'};function longDateFormat(key){var format=this._longDateFormat[key],formatUpper=this._longDateFormat[key.toUpperCase()];if(format||!formatUpper){return format;}this._longDateFormat[key]=formatUpper.replace(/MMMM|MM|DD|dddd/g,function(val){return val.slice(1);});return this._longDateFormat[key];}var defaultInvalidDate='Invalid date';function invalidDate(){return this._invalidDate;}var defaultOrdinal='%d';var defaultOrdinalParse=/\d{1,2}/;function ordinal(number){return this._ordinal.replace('%d',number);}var defaultRelativeTime={future:'in %s',past:'%s ago',s:'a few seconds',m:'a minute',mm:'%d minutes',h:'an hour',hh:'%d hours',d:'a day',dd:'%d days',M:'a month',MM:'%d months',y:'a year',yy:'%d years'};function relativeTime(number,withoutSuffix,string,isFuture){var output=this._relativeTime[string];return isFunction(output)?output(number,withoutSuffix,string,isFuture):output.replace(/%d/i,number);}function pastFuture(diff,output){var format=this._relativeTime[diff>0?'future':'past'];return isFunction(format)?format(output):format.replace(/%s/i,output);}var aliases={};function addUnitAlias(unit,shorthand){var lowerCase=unit.toLowerCase();aliases[lowerCase]=aliases[lowerCase+'s']=aliases[shorthand]=unit;}function normalizeUnits(units){return typeof units==='string'?aliases[units]||aliases[units.toLowerCase()]:undefined;}function normalizeObjectUnits(inputObject){var normalizedInput={},normalizedProp,prop;for(prop in inputObject){if(hasOwnProp(inputObject,prop)){normalizedProp=normalizeUnits(prop);if(normalizedProp){normalizedInput[normalizedProp]=inputObject[prop];}}}return normalizedInput;}var priorities={};function addUnitPriority(unit,priority){priorities[unit]=priority;}function getPrioritizedUnits(unitsObj){var units=[];for(var u in unitsObj){units.push({unit:u,priority:priorities[u]});}units.sort(function(a,b){return a.priority-b.priority;});return units;}function makeGetSet(unit,keepTime){return function(value){if(value!=null){set$1(this,unit,value);hooks.updateOffset(this,keepTime);return this;}else{return get(this,unit);}};}function get(mom,unit){return mom.isValid()?mom._d['get'+(mom._isUTC?'UTC':'')+unit]():NaN;}function set$1(mom,unit,value){if(mom.isValid()){mom._d['set'+(mom._isUTC?'UTC':'')+unit](value);}}// MOMENTS
function stringGet(units){units=normalizeUnits(units);if(isFunction(this[units])){return this[units]();}return this;}function stringSet(units,value){if(typeof units==='object'){units=normalizeObjectUnits(units);var prioritized=getPrioritizedUnits(units);for(var i=0;i<prioritized.length;i++){this[prioritized[i].unit](units[prioritized[i].unit]);}}else{units=normalizeUnits(units);if(isFunction(this[units])){return this[units](value);}}return this;}function zeroFill(number,targetLength,forceSign){var absNumber=''+Math.abs(number),zerosToFill=targetLength-absNumber.length,sign=number>=0;return(sign?forceSign?'+':'':'-')+Math.pow(10,Math.max(0,zerosToFill)).toString().substr(1)+absNumber;}var formattingTokens=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;var localFormattingTokens=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;var formatFunctions={};var formatTokenFunctions={};// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function addFormatToken(token,padded,ordinal,callback){var func=callback;if(typeof callback==='string'){func=function(){return this[callback]();};}if(token){formatTokenFunctions[token]=func;}if(padded){formatTokenFunctions[padded[0]]=function(){return zeroFill(func.apply(this,arguments),padded[1],padded[2]);};}if(ordinal){formatTokenFunctions[ordinal]=function(){return this.localeData().ordinal(func.apply(this,arguments),token);};}}function removeFormattingTokens(input){if(input.match(/\[[\s\S]/)){return input.replace(/^\[|\]$/g,'');}return input.replace(/\\/g,'');}function makeFormatFunction(format){var array=format.match(formattingTokens),i,length;for(i=0,length=array.length;i<length;i++){if(formatTokenFunctions[array[i]]){array[i]=formatTokenFunctions[array[i]];}else{array[i]=removeFormattingTokens(array[i]);}}return function(mom){var output='',i;for(i=0;i<length;i++){output+=array[i]instanceof Function?array[i].call(mom,format):array[i];}return output;};}// format date using native date object
function formatMoment(m,format){if(!m.isValid()){return m.localeData().invalidDate();}format=expandFormat(format,m.localeData());formatFunctions[format]=formatFunctions[format]||makeFormatFunction(format);return formatFunctions[format](m);}function expandFormat(format,locale){var i=5;function replaceLongDateFormatTokens(input){return locale.longDateFormat(input)||input;}localFormattingTokens.lastIndex=0;while(i>=0&&localFormattingTokens.test(format)){format=format.replace(localFormattingTokens,replaceLongDateFormatTokens);localFormattingTokens.lastIndex=0;i-=1;}return format;}var match1=/\d/;//       0 - 9
var match2=/\d\d/;//      00 - 99
var match3=/\d{3}/;//     000 - 999
var match4=/\d{4}/;//    0000 - 9999
var match6=/[+-]?\d{6}/;// -999999 - 999999
var match1to2=/\d\d?/;//       0 - 99
var match3to4=/\d\d\d\d?/;//     999 - 9999
var match5to6=/\d\d\d\d\d\d?/;//   99999 - 999999
var match1to3=/\d{1,3}/;//       0 - 999
var match1to4=/\d{1,4}/;//       0 - 9999
var match1to6=/[+-]?\d{1,6}/;// -999999 - 999999
var matchUnsigned=/\d+/;//       0 - inf
var matchSigned=/[+-]?\d+/;//    -inf - inf
var matchOffset=/Z|[+-]\d\d:?\d\d/gi;// +00:00 -00:00 +0000 -0000 or Z
var matchShortOffset=/Z|[+-]\d\d(?::?\d\d)?/gi;// +00 -00 +00:00 -00:00 +0000 -0000 or Z
var matchTimestamp=/[+-]?\d+(\.\d{1,3})?/;// 123456789 123456789.123
// any word (or two) characters or numbers including two/three word month in arabic.
// includes scottish gaelic two word and hyphenated months
var matchWord=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;var regexes={};function addRegexToken(token,regex,strictRegex){regexes[token]=isFunction(regex)?regex:function(isStrict,localeData){return isStrict&&strictRegex?strictRegex:regex;};}function getParseRegexForToken(token,config){if(!hasOwnProp(regexes,token)){return new RegExp(unescapeFormat(token));}return regexes[token](config._strict,config._locale);}// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function unescapeFormat(s){return regexEscape(s.replace('\\','').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(matched,p1,p2,p3,p4){return p1||p2||p3||p4;}));}function regexEscape(s){return s.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');}var tokens={};function addParseToken(token,callback){var i,func=callback;if(typeof token==='string'){token=[token];}if(isNumber(callback)){func=function(input,array){array[callback]=toInt(input);};}for(i=0;i<token.length;i++){tokens[token[i]]=func;}}function addWeekParseToken(token,callback){addParseToken(token,function(input,array,config,token){config._w=config._w||{};callback(input,config._w,config,token);});}function addTimeToArrayFromToken(token,input,config){if(input!=null&&hasOwnProp(tokens,token)){tokens[token](input,config._a,config,token);}}var YEAR=0;var MONTH=1;var DATE=2;var HOUR=3;var MINUTE=4;var SECOND=5;var MILLISECOND=6;var WEEK=7;var WEEKDAY=8;var indexOf;if(Array.prototype.indexOf){indexOf=Array.prototype.indexOf;}else{indexOf=function(o){// I know
var i;for(i=0;i<this.length;++i){if(this[i]===o){return i;}}return-1;};}var indexOf$1=indexOf;function daysInMonth(year,month){return new Date(Date.UTC(year,month+1,0)).getUTCDate();}// FORMATTING
addFormatToken('M',['MM',2],'Mo',function(){return this.month()+1;});addFormatToken('MMM',0,0,function(format){return this.localeData().monthsShort(this,format);});addFormatToken('MMMM',0,0,function(format){return this.localeData().months(this,format);});// ALIASES
addUnitAlias('month','M');// PRIORITY
addUnitPriority('month',8);// PARSING
addRegexToken('M',match1to2);addRegexToken('MM',match1to2,match2);addRegexToken('MMM',function(isStrict,locale){return locale.monthsShortRegex(isStrict);});addRegexToken('MMMM',function(isStrict,locale){return locale.monthsRegex(isStrict);});addParseToken(['M','MM'],function(input,array){array[MONTH]=toInt(input)-1;});addParseToken(['MMM','MMMM'],function(input,array,config,token){var month=config._locale.monthsParse(input,token,config._strict);// if we didn't find a month name, mark the date as invalid.
if(month!=null){array[MONTH]=month;}else{getParsingFlags(config).invalidMonth=input;}});// LOCALES
var MONTHS_IN_FORMAT=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;var defaultLocaleMonths='January_February_March_April_May_June_July_August_September_October_November_December'.split('_');function localeMonths(m,format){if(!m){return this._months;}return isArray(this._months)?this._months[m.month()]:this._months[(this._months.isFormat||MONTHS_IN_FORMAT).test(format)?'format':'standalone'][m.month()];}var defaultLocaleMonthsShort='Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');function localeMonthsShort(m,format){if(!m){return this._monthsShort;}return isArray(this._monthsShort)?this._monthsShort[m.month()]:this._monthsShort[MONTHS_IN_FORMAT.test(format)?'format':'standalone'][m.month()];}function handleStrictParse(monthName,format,strict){var i,ii,mom,llc=monthName.toLocaleLowerCase();if(!this._monthsParse){// this is not used
this._monthsParse=[];this._longMonthsParse=[];this._shortMonthsParse=[];for(i=0;i<12;++i){mom=createUTC([2000,i]);this._shortMonthsParse[i]=this.monthsShort(mom,'').toLocaleLowerCase();this._longMonthsParse[i]=this.months(mom,'').toLocaleLowerCase();}}if(strict){if(format==='MMM'){ii=indexOf$1.call(this._shortMonthsParse,llc);return ii!==-1?ii:null;}else{ii=indexOf$1.call(this._longMonthsParse,llc);return ii!==-1?ii:null;}}else{if(format==='MMM'){ii=indexOf$1.call(this._shortMonthsParse,llc);if(ii!==-1){return ii;}ii=indexOf$1.call(this._longMonthsParse,llc);return ii!==-1?ii:null;}else{ii=indexOf$1.call(this._longMonthsParse,llc);if(ii!==-1){return ii;}ii=indexOf$1.call(this._shortMonthsParse,llc);return ii!==-1?ii:null;}}}function localeMonthsParse(monthName,format,strict){var i,mom,regex;if(this._monthsParseExact){return handleStrictParse.call(this,monthName,format,strict);}if(!this._monthsParse){this._monthsParse=[];this._longMonthsParse=[];this._shortMonthsParse=[];}// TODO: add sorting
// Sorting makes sure if one month (or abbr) is a prefix of another
// see sorting in computeMonthsParse
for(i=0;i<12;i++){// make the regex if we don't have it already
mom=createUTC([2000,i]);if(strict&&!this._longMonthsParse[i]){this._longMonthsParse[i]=new RegExp('^'+this.months(mom,'').replace('.','')+'$','i');this._shortMonthsParse[i]=new RegExp('^'+this.monthsShort(mom,'').replace('.','')+'$','i');}if(!strict&&!this._monthsParse[i]){regex='^'+this.months(mom,'')+'|^'+this.monthsShort(mom,'');this._monthsParse[i]=new RegExp(regex.replace('.',''),'i');}// test the regex
if(strict&&format==='MMMM'&&this._longMonthsParse[i].test(monthName)){return i;}else if(strict&&format==='MMM'&&this._shortMonthsParse[i].test(monthName)){return i;}else if(!strict&&this._monthsParse[i].test(monthName)){return i;}}}// MOMENTS
function setMonth(mom,value){var dayOfMonth;if(!mom.isValid()){// No op
return mom;}if(typeof value==='string'){if(/^\d+$/.test(value)){value=toInt(value);}else{value=mom.localeData().monthsParse(value);// TODO: Another silent failure?
if(!isNumber(value)){return mom;}}}dayOfMonth=Math.min(mom.date(),daysInMonth(mom.year(),value));mom._d['set'+(mom._isUTC?'UTC':'')+'Month'](value,dayOfMonth);return mom;}function getSetMonth(value){if(value!=null){setMonth(this,value);hooks.updateOffset(this,true);return this;}else{return get(this,'Month');}}function getDaysInMonth(){return daysInMonth(this.year(),this.month());}var defaultMonthsShortRegex=matchWord;function monthsShortRegex(isStrict){if(this._monthsParseExact){if(!hasOwnProp(this,'_monthsRegex')){computeMonthsParse.call(this);}if(isStrict){return this._monthsShortStrictRegex;}else{return this._monthsShortRegex;}}else{if(!hasOwnProp(this,'_monthsShortRegex')){this._monthsShortRegex=defaultMonthsShortRegex;}return this._monthsShortStrictRegex&&isStrict?this._monthsShortStrictRegex:this._monthsShortRegex;}}var defaultMonthsRegex=matchWord;function monthsRegex(isStrict){if(this._monthsParseExact){if(!hasOwnProp(this,'_monthsRegex')){computeMonthsParse.call(this);}if(isStrict){return this._monthsStrictRegex;}else{return this._monthsRegex;}}else{if(!hasOwnProp(this,'_monthsRegex')){this._monthsRegex=defaultMonthsRegex;}return this._monthsStrictRegex&&isStrict?this._monthsStrictRegex:this._monthsRegex;}}function computeMonthsParse(){function cmpLenRev(a,b){return b.length-a.length;}var shortPieces=[],longPieces=[],mixedPieces=[],i,mom;for(i=0;i<12;i++){// make the regex if we don't have it already
mom=createUTC([2000,i]);shortPieces.push(this.monthsShort(mom,''));longPieces.push(this.months(mom,''));mixedPieces.push(this.months(mom,''));mixedPieces.push(this.monthsShort(mom,''));}// Sorting makes sure if one month (or abbr) is a prefix of another it
// will match the longer piece.
shortPieces.sort(cmpLenRev);longPieces.sort(cmpLenRev);mixedPieces.sort(cmpLenRev);for(i=0;i<12;i++){shortPieces[i]=regexEscape(shortPieces[i]);longPieces[i]=regexEscape(longPieces[i]);}for(i=0;i<24;i++){mixedPieces[i]=regexEscape(mixedPieces[i]);}this._monthsRegex=new RegExp('^('+mixedPieces.join('|')+')','i');this._monthsShortRegex=this._monthsRegex;this._monthsStrictRegex=new RegExp('^('+longPieces.join('|')+')','i');this._monthsShortStrictRegex=new RegExp('^('+shortPieces.join('|')+')','i');}// FORMATTING
addFormatToken('Y',0,0,function(){var y=this.year();return y<=9999?''+y:'+'+y;});addFormatToken(0,['YY',2],0,function(){return this.year()%100;});addFormatToken(0,['YYYY',4],0,'year');addFormatToken(0,['YYYYY',5],0,'year');addFormatToken(0,['YYYYYY',6,true],0,'year');// ALIASES
addUnitAlias('year','y');// PRIORITIES
addUnitPriority('year',1);// PARSING
addRegexToken('Y',matchSigned);addRegexToken('YY',match1to2,match2);addRegexToken('YYYY',match1to4,match4);addRegexToken('YYYYY',match1to6,match6);addRegexToken('YYYYYY',match1to6,match6);addParseToken(['YYYYY','YYYYYY'],YEAR);addParseToken('YYYY',function(input,array){array[YEAR]=input.length===2?hooks.parseTwoDigitYear(input):toInt(input);});addParseToken('YY',function(input,array){array[YEAR]=hooks.parseTwoDigitYear(input);});addParseToken('Y',function(input,array){array[YEAR]=parseInt(input,10);});// HELPERS
function daysInYear(year){return isLeapYear(year)?366:365;}function isLeapYear(year){return year%4===0&&year%100!==0||year%400===0;}// HOOKS
hooks.parseTwoDigitYear=function(input){return toInt(input)+(toInt(input)>68?1900:2000);};// MOMENTS
var getSetYear=makeGetSet('FullYear',true);function getIsLeapYear(){return isLeapYear(this.year());}function createDate(y,m,d,h,M,s,ms){//can't just apply() to create a date:
//http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
var date=new Date(y,m,d,h,M,s,ms);//the date constructor remaps years 0-99 to 1900-1999
if(y<100&&y>=0&&isFinite(date.getFullYear())){date.setFullYear(y);}return date;}function createUTCDate(y){var date=new Date(Date.UTC.apply(null,arguments));//the Date.UTC function remaps years 0-99 to 1900-1999
if(y<100&&y>=0&&isFinite(date.getUTCFullYear())){date.setUTCFullYear(y);}return date;}// start-of-first-week - start-of-year
function firstWeekOffset(year,dow,doy){var// first-week day -- which january is always in the first week (4 for iso, 1 for other)
fwd=7+dow-doy,// first-week day local weekday -- which local weekday is fwd
fwdlw=(7+createUTCDate(year,0,fwd).getUTCDay()-dow)%7;return-fwdlw+fwd-1;}//http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function dayOfYearFromWeeks(year,week,weekday,dow,doy){var localWeekday=(7+weekday-dow)%7,weekOffset=firstWeekOffset(year,dow,doy),dayOfYear=1+7*(week-1)+localWeekday+weekOffset,resYear,resDayOfYear;if(dayOfYear<=0){resYear=year-1;resDayOfYear=daysInYear(resYear)+dayOfYear;}else if(dayOfYear>daysInYear(year)){resYear=year+1;resDayOfYear=dayOfYear-daysInYear(year);}else{resYear=year;resDayOfYear=dayOfYear;}return{year:resYear,dayOfYear:resDayOfYear};}function weekOfYear(mom,dow,doy){var weekOffset=firstWeekOffset(mom.year(),dow,doy),week=Math.floor((mom.dayOfYear()-weekOffset-1)/7)+1,resWeek,resYear;if(week<1){resYear=mom.year()-1;resWeek=week+weeksInYear(resYear,dow,doy);}else if(week>weeksInYear(mom.year(),dow,doy)){resWeek=week-weeksInYear(mom.year(),dow,doy);resYear=mom.year()+1;}else{resYear=mom.year();resWeek=week;}return{week:resWeek,year:resYear};}function weeksInYear(year,dow,doy){var weekOffset=firstWeekOffset(year,dow,doy),weekOffsetNext=firstWeekOffset(year+1,dow,doy);return(daysInYear(year)-weekOffset+weekOffsetNext)/7;}// FORMATTING
addFormatToken('w',['ww',2],'wo','week');addFormatToken('W',['WW',2],'Wo','isoWeek');// ALIASES
addUnitAlias('week','w');addUnitAlias('isoWeek','W');// PRIORITIES
addUnitPriority('week',5);addUnitPriority('isoWeek',5);// PARSING
addRegexToken('w',match1to2);addRegexToken('ww',match1to2,match2);addRegexToken('W',match1to2);addRegexToken('WW',match1to2,match2);addWeekParseToken(['w','ww','W','WW'],function(input,week,config,token){week[token.substr(0,1)]=toInt(input);});// HELPERS
// LOCALES
function localeWeek(mom){return weekOfYear(mom,this._week.dow,this._week.doy).week;}var defaultLocaleWeek={dow:0,// Sunday is the first day of the week.
doy:6// The week that contains Jan 1st is the first week of the year.
};function localeFirstDayOfWeek(){return this._week.dow;}function localeFirstDayOfYear(){return this._week.doy;}// MOMENTS
function getSetWeek(input){var week=this.localeData().week(this);return input==null?week:this.add((input-week)*7,'d');}function getSetISOWeek(input){var week=weekOfYear(this,1,4).week;return input==null?week:this.add((input-week)*7,'d');}// FORMATTING
addFormatToken('d',0,'do','day');addFormatToken('dd',0,0,function(format){return this.localeData().weekdaysMin(this,format);});addFormatToken('ddd',0,0,function(format){return this.localeData().weekdaysShort(this,format);});addFormatToken('dddd',0,0,function(format){return this.localeData().weekdays(this,format);});addFormatToken('e',0,0,'weekday');addFormatToken('E',0,0,'isoWeekday');// ALIASES
addUnitAlias('day','d');addUnitAlias('weekday','e');addUnitAlias('isoWeekday','E');// PRIORITY
addUnitPriority('day',11);addUnitPriority('weekday',11);addUnitPriority('isoWeekday',11);// PARSING
addRegexToken('d',match1to2);addRegexToken('e',match1to2);addRegexToken('E',match1to2);addRegexToken('dd',function(isStrict,locale){return locale.weekdaysMinRegex(isStrict);});addRegexToken('ddd',function(isStrict,locale){return locale.weekdaysShortRegex(isStrict);});addRegexToken('dddd',function(isStrict,locale){return locale.weekdaysRegex(isStrict);});addWeekParseToken(['dd','ddd','dddd'],function(input,week,config,token){var weekday=config._locale.weekdaysParse(input,token,config._strict);// if we didn't get a weekday name, mark the date as invalid
if(weekday!=null){week.d=weekday;}else{getParsingFlags(config).invalidWeekday=input;}});addWeekParseToken(['d','e','E'],function(input,week,config,token){week[token]=toInt(input);});// HELPERS
function parseWeekday(input,locale){if(typeof input!=='string'){return input;}if(!isNaN(input)){return parseInt(input,10);}input=locale.weekdaysParse(input);if(typeof input==='number'){return input;}return null;}function parseIsoWeekday(input,locale){if(typeof input==='string'){return locale.weekdaysParse(input)%7||7;}return isNaN(input)?null:input;}// LOCALES
var defaultLocaleWeekdays='Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');function localeWeekdays(m,format){if(!m){return this._weekdays;}return isArray(this._weekdays)?this._weekdays[m.day()]:this._weekdays[this._weekdays.isFormat.test(format)?'format':'standalone'][m.day()];}var defaultLocaleWeekdaysShort='Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');function localeWeekdaysShort(m){return m?this._weekdaysShort[m.day()]:this._weekdaysShort;}var defaultLocaleWeekdaysMin='Su_Mo_Tu_We_Th_Fr_Sa'.split('_');function localeWeekdaysMin(m){return m?this._weekdaysMin[m.day()]:this._weekdaysMin;}function handleStrictParse$1(weekdayName,format,strict){var i,ii,mom,llc=weekdayName.toLocaleLowerCase();if(!this._weekdaysParse){this._weekdaysParse=[];this._shortWeekdaysParse=[];this._minWeekdaysParse=[];for(i=0;i<7;++i){mom=createUTC([2000,1]).day(i);this._minWeekdaysParse[i]=this.weekdaysMin(mom,'').toLocaleLowerCase();this._shortWeekdaysParse[i]=this.weekdaysShort(mom,'').toLocaleLowerCase();this._weekdaysParse[i]=this.weekdays(mom,'').toLocaleLowerCase();}}if(strict){if(format==='dddd'){ii=indexOf$1.call(this._weekdaysParse,llc);return ii!==-1?ii:null;}else if(format==='ddd'){ii=indexOf$1.call(this._shortWeekdaysParse,llc);return ii!==-1?ii:null;}else{ii=indexOf$1.call(this._minWeekdaysParse,llc);return ii!==-1?ii:null;}}else{if(format==='dddd'){ii=indexOf$1.call(this._weekdaysParse,llc);if(ii!==-1){return ii;}ii=indexOf$1.call(this._shortWeekdaysParse,llc);if(ii!==-1){return ii;}ii=indexOf$1.call(this._minWeekdaysParse,llc);return ii!==-1?ii:null;}else if(format==='ddd'){ii=indexOf$1.call(this._shortWeekdaysParse,llc);if(ii!==-1){return ii;}ii=indexOf$1.call(this._weekdaysParse,llc);if(ii!==-1){return ii;}ii=indexOf$1.call(this._minWeekdaysParse,llc);return ii!==-1?ii:null;}else{ii=indexOf$1.call(this._minWeekdaysParse,llc);if(ii!==-1){return ii;}ii=indexOf$1.call(this._weekdaysParse,llc);if(ii!==-1){return ii;}ii=indexOf$1.call(this._shortWeekdaysParse,llc);return ii!==-1?ii:null;}}}function localeWeekdaysParse(weekdayName,format,strict){var i,mom,regex;if(this._weekdaysParseExact){return handleStrictParse$1.call(this,weekdayName,format,strict);}if(!this._weekdaysParse){this._weekdaysParse=[];this._minWeekdaysParse=[];this._shortWeekdaysParse=[];this._fullWeekdaysParse=[];}for(i=0;i<7;i++){// make the regex if we don't have it already
mom=createUTC([2000,1]).day(i);if(strict&&!this._fullWeekdaysParse[i]){this._fullWeekdaysParse[i]=new RegExp('^'+this.weekdays(mom,'').replace('.','\.?')+'$','i');this._shortWeekdaysParse[i]=new RegExp('^'+this.weekdaysShort(mom,'').replace('.','\.?')+'$','i');this._minWeekdaysParse[i]=new RegExp('^'+this.weekdaysMin(mom,'').replace('.','\.?')+'$','i');}if(!this._weekdaysParse[i]){regex='^'+this.weekdays(mom,'')+'|^'+this.weekdaysShort(mom,'')+'|^'+this.weekdaysMin(mom,'');this._weekdaysParse[i]=new RegExp(regex.replace('.',''),'i');}// test the regex
if(strict&&format==='dddd'&&this._fullWeekdaysParse[i].test(weekdayName)){return i;}else if(strict&&format==='ddd'&&this._shortWeekdaysParse[i].test(weekdayName)){return i;}else if(strict&&format==='dd'&&this._minWeekdaysParse[i].test(weekdayName)){return i;}else if(!strict&&this._weekdaysParse[i].test(weekdayName)){return i;}}}// MOMENTS
function getSetDayOfWeek(input){if(!this.isValid()){return input!=null?this:NaN;}var day=this._isUTC?this._d.getUTCDay():this._d.getDay();if(input!=null){input=parseWeekday(input,this.localeData());return this.add(input-day,'d');}else{return day;}}function getSetLocaleDayOfWeek(input){if(!this.isValid()){return input!=null?this:NaN;}var weekday=(this.day()+7-this.localeData()._week.dow)%7;return input==null?weekday:this.add(input-weekday,'d');}function getSetISODayOfWeek(input){if(!this.isValid()){return input!=null?this:NaN;}// behaves the same as moment#day except
// as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
// as a setter, sunday should belong to the previous week.
if(input!=null){var weekday=parseIsoWeekday(input,this.localeData());return this.day(this.day()%7?weekday:weekday-7);}else{return this.day()||7;}}var defaultWeekdaysRegex=matchWord;function weekdaysRegex(isStrict){if(this._weekdaysParseExact){if(!hasOwnProp(this,'_weekdaysRegex')){computeWeekdaysParse.call(this);}if(isStrict){return this._weekdaysStrictRegex;}else{return this._weekdaysRegex;}}else{if(!hasOwnProp(this,'_weekdaysRegex')){this._weekdaysRegex=defaultWeekdaysRegex;}return this._weekdaysStrictRegex&&isStrict?this._weekdaysStrictRegex:this._weekdaysRegex;}}var defaultWeekdaysShortRegex=matchWord;function weekdaysShortRegex(isStrict){if(this._weekdaysParseExact){if(!hasOwnProp(this,'_weekdaysRegex')){computeWeekdaysParse.call(this);}if(isStrict){return this._weekdaysShortStrictRegex;}else{return this._weekdaysShortRegex;}}else{if(!hasOwnProp(this,'_weekdaysShortRegex')){this._weekdaysShortRegex=defaultWeekdaysShortRegex;}return this._weekdaysShortStrictRegex&&isStrict?this._weekdaysShortStrictRegex:this._weekdaysShortRegex;}}var defaultWeekdaysMinRegex=matchWord;function weekdaysMinRegex(isStrict){if(this._weekdaysParseExact){if(!hasOwnProp(this,'_weekdaysRegex')){computeWeekdaysParse.call(this);}if(isStrict){return this._weekdaysMinStrictRegex;}else{return this._weekdaysMinRegex;}}else{if(!hasOwnProp(this,'_weekdaysMinRegex')){this._weekdaysMinRegex=defaultWeekdaysMinRegex;}return this._weekdaysMinStrictRegex&&isStrict?this._weekdaysMinStrictRegex:this._weekdaysMinRegex;}}function computeWeekdaysParse(){function cmpLenRev(a,b){return b.length-a.length;}var minPieces=[],shortPieces=[],longPieces=[],mixedPieces=[],i,mom,minp,shortp,longp;for(i=0;i<7;i++){// make the regex if we don't have it already
mom=createUTC([2000,1]).day(i);minp=this.weekdaysMin(mom,'');shortp=this.weekdaysShort(mom,'');longp=this.weekdays(mom,'');minPieces.push(minp);shortPieces.push(shortp);longPieces.push(longp);mixedPieces.push(minp);mixedPieces.push(shortp);mixedPieces.push(longp);}// Sorting makes sure if one weekday (or abbr) is a prefix of another it
// will match the longer piece.
minPieces.sort(cmpLenRev);shortPieces.sort(cmpLenRev);longPieces.sort(cmpLenRev);mixedPieces.sort(cmpLenRev);for(i=0;i<7;i++){shortPieces[i]=regexEscape(shortPieces[i]);longPieces[i]=regexEscape(longPieces[i]);mixedPieces[i]=regexEscape(mixedPieces[i]);}this._weekdaysRegex=new RegExp('^('+mixedPieces.join('|')+')','i');this._weekdaysShortRegex=this._weekdaysRegex;this._weekdaysMinRegex=this._weekdaysRegex;this._weekdaysStrictRegex=new RegExp('^('+longPieces.join('|')+')','i');this._weekdaysShortStrictRegex=new RegExp('^('+shortPieces.join('|')+')','i');this._weekdaysMinStrictRegex=new RegExp('^('+minPieces.join('|')+')','i');}// FORMATTING
function hFormat(){return this.hours()%12||12;}function kFormat(){return this.hours()||24;}addFormatToken('H',['HH',2],0,'hour');addFormatToken('h',['hh',2],0,hFormat);addFormatToken('k',['kk',2],0,kFormat);addFormatToken('hmm',0,0,function(){return''+hFormat.apply(this)+zeroFill(this.minutes(),2);});addFormatToken('hmmss',0,0,function(){return''+hFormat.apply(this)+zeroFill(this.minutes(),2)+zeroFill(this.seconds(),2);});addFormatToken('Hmm',0,0,function(){return''+this.hours()+zeroFill(this.minutes(),2);});addFormatToken('Hmmss',0,0,function(){return''+this.hours()+zeroFill(this.minutes(),2)+zeroFill(this.seconds(),2);});function meridiem(token,lowercase){addFormatToken(token,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),lowercase);});}meridiem('a',true);meridiem('A',false);// ALIASES
addUnitAlias('hour','h');// PRIORITY
addUnitPriority('hour',13);// PARSING
function matchMeridiem(isStrict,locale){return locale._meridiemParse;}addRegexToken('a',matchMeridiem);addRegexToken('A',matchMeridiem);addRegexToken('H',match1to2);addRegexToken('h',match1to2);addRegexToken('HH',match1to2,match2);addRegexToken('hh',match1to2,match2);addRegexToken('hmm',match3to4);addRegexToken('hmmss',match5to6);addRegexToken('Hmm',match3to4);addRegexToken('Hmmss',match5to6);addParseToken(['H','HH'],HOUR);addParseToken(['a','A'],function(input,array,config){config._isPm=config._locale.isPM(input);config._meridiem=input;});addParseToken(['h','hh'],function(input,array,config){array[HOUR]=toInt(input);getParsingFlags(config).bigHour=true;});addParseToken('hmm',function(input,array,config){var pos=input.length-2;array[HOUR]=toInt(input.substr(0,pos));array[MINUTE]=toInt(input.substr(pos));getParsingFlags(config).bigHour=true;});addParseToken('hmmss',function(input,array,config){var pos1=input.length-4;var pos2=input.length-2;array[HOUR]=toInt(input.substr(0,pos1));array[MINUTE]=toInt(input.substr(pos1,2));array[SECOND]=toInt(input.substr(pos2));getParsingFlags(config).bigHour=true;});addParseToken('Hmm',function(input,array,config){var pos=input.length-2;array[HOUR]=toInt(input.substr(0,pos));array[MINUTE]=toInt(input.substr(pos));});addParseToken('Hmmss',function(input,array,config){var pos1=input.length-4;var pos2=input.length-2;array[HOUR]=toInt(input.substr(0,pos1));array[MINUTE]=toInt(input.substr(pos1,2));array[SECOND]=toInt(input.substr(pos2));});// LOCALES
function localeIsPM(input){// IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
// Using charAt should be more compatible.
return(input+'').toLowerCase().charAt(0)==='p';}var defaultLocaleMeridiemParse=/[ap]\.?m?\.?/i;function localeMeridiem(hours,minutes,isLower){if(hours>11){return isLower?'pm':'PM';}else{return isLower?'am':'AM';}}// MOMENTS
// Setting the hour should keep the time, because the user explicitly
// specified which hour he wants. So trying to maintain the same hour (in
// a new timezone) makes sense. Adding/subtracting hours does not follow
// this rule.
var getSetHour=makeGetSet('Hours',true);// months
// week
// weekdays
// meridiem
var baseConfig={calendar:defaultCalendar,longDateFormat:defaultLongDateFormat,invalidDate:defaultInvalidDate,ordinal:defaultOrdinal,ordinalParse:defaultOrdinalParse,relativeTime:defaultRelativeTime,months:defaultLocaleMonths,monthsShort:defaultLocaleMonthsShort,week:defaultLocaleWeek,weekdays:defaultLocaleWeekdays,weekdaysMin:defaultLocaleWeekdaysMin,weekdaysShort:defaultLocaleWeekdaysShort,meridiemParse:defaultLocaleMeridiemParse};// internal storage for locale config files
var locales={};var localeFamilies={};var globalLocale;function normalizeLocale(key){return key?key.toLowerCase().replace('_','-'):key;}// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function chooseLocale(names){var i=0,j,next,locale,split;while(i<names.length){split=normalizeLocale(names[i]).split('-');j=split.length;next=normalizeLocale(names[i+1]);next=next?next.split('-'):null;while(j>0){locale=loadLocale(split.slice(0,j).join('-'));if(locale){return locale;}if(next&&next.length>=j&&compareArrays(split,next,true)>=j-1){//the next array item is better than a shallower substring of this one
break;}j--;}i++;}return null;}function loadLocale(name){var oldLocale=null;// TODO: Find a better way to register and load all the locales in Node
if(!locales[name]&&typeof module!=='undefined'&&module&&module.exports){try{oldLocale=globalLocale._abbr;commonjsRequire('./locale/'+name);// because defineLocale currently also sets the global locale, we
// want to undo that for lazy loaded locales
getSetGlobalLocale(oldLocale);}catch(e){}}return locales[name];}// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function getSetGlobalLocale(key,values){var data;if(key){if(isUndefined(values)){data=getLocale(key);}else{data=defineLocale(key,values);}if(data){// moment.duration._locale = moment._locale = data;
globalLocale=data;}}return globalLocale._abbr;}function defineLocale(name,config){if(config!==null){var parentConfig=baseConfig;config.abbr=name;if(locales[name]!=null){deprecateSimple('defineLocaleOverride','use moment.updateLocale(localeName, config) to change '+'an existing locale. moment.defineLocale(localeName, '+'config) should only be used for creating a new locale '+'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');parentConfig=locales[name]._config;}else if(config.parentLocale!=null){if(locales[config.parentLocale]!=null){parentConfig=locales[config.parentLocale]._config;}else{if(!localeFamilies[config.parentLocale]){localeFamilies[config.parentLocale]=[];}localeFamilies[config.parentLocale].push({name:name,config:config});return null;}}locales[name]=new Locale(mergeConfigs(parentConfig,config));if(localeFamilies[name]){localeFamilies[name].forEach(function(x){defineLocale(x.name,x.config);});}// backwards compat for now: also set the locale
// make sure we set the locale AFTER all child locales have been
// created, so we won't end up with the child locale set.
getSetGlobalLocale(name);return locales[name];}else{// useful for testing
delete locales[name];return null;}}function updateLocale(name,config){if(config!=null){var locale,parentConfig=baseConfig;// MERGE
if(locales[name]!=null){parentConfig=locales[name]._config;}config=mergeConfigs(parentConfig,config);locale=new Locale(config);locale.parentLocale=locales[name];locales[name]=locale;// backwards compat for now: also set the locale
getSetGlobalLocale(name);}else{// pass null for config to unupdate, useful for tests
if(locales[name]!=null){if(locales[name].parentLocale!=null){locales[name]=locales[name].parentLocale;}else if(locales[name]!=null){delete locales[name];}}}return locales[name];}// returns locale data
function getLocale(key){var locale;if(key&&key._locale&&key._locale._abbr){key=key._locale._abbr;}if(!key){return globalLocale;}if(!isArray(key)){//short-circuit everything else
locale=loadLocale(key);if(locale){return locale;}key=[key];}return chooseLocale(key);}function listLocales(){return keys$1(locales);}function checkOverflow(m){var overflow;var a=m._a;if(a&&getParsingFlags(m).overflow===-2){overflow=a[MONTH]<0||a[MONTH]>11?MONTH:a[DATE]<1||a[DATE]>daysInMonth(a[YEAR],a[MONTH])?DATE:a[HOUR]<0||a[HOUR]>24||a[HOUR]===24&&(a[MINUTE]!==0||a[SECOND]!==0||a[MILLISECOND]!==0)?HOUR:a[MINUTE]<0||a[MINUTE]>59?MINUTE:a[SECOND]<0||a[SECOND]>59?SECOND:a[MILLISECOND]<0||a[MILLISECOND]>999?MILLISECOND:-1;if(getParsingFlags(m)._overflowDayOfYear&&(overflow<YEAR||overflow>DATE)){overflow=DATE;}if(getParsingFlags(m)._overflowWeeks&&overflow===-1){overflow=WEEK;}if(getParsingFlags(m)._overflowWeekday&&overflow===-1){overflow=WEEKDAY;}getParsingFlags(m).overflow=overflow;}return m;}// iso 8601 regex
// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
var extendedIsoRegex=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;var basicIsoRegex=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;var tzRegex=/Z|[+-]\d\d(?::?\d\d)?/;var isoDates=[['YYYYYY-MM-DD',/[+-]\d{6}-\d\d-\d\d/],['YYYY-MM-DD',/\d{4}-\d\d-\d\d/],['GGGG-[W]WW-E',/\d{4}-W\d\d-\d/],['GGGG-[W]WW',/\d{4}-W\d\d/,false],['YYYY-DDD',/\d{4}-\d{3}/],['YYYY-MM',/\d{4}-\d\d/,false],['YYYYYYMMDD',/[+-]\d{10}/],['YYYYMMDD',/\d{8}/],// YYYYMM is NOT allowed by the standard
['GGGG[W]WWE',/\d{4}W\d{3}/],['GGGG[W]WW',/\d{4}W\d{2}/,false],['YYYYDDD',/\d{7}/]];// iso time formats and regexes
var isoTimes=[['HH:mm:ss.SSSS',/\d\d:\d\d:\d\d\.\d+/],['HH:mm:ss,SSSS',/\d\d:\d\d:\d\d,\d+/],['HH:mm:ss',/\d\d:\d\d:\d\d/],['HH:mm',/\d\d:\d\d/],['HHmmss.SSSS',/\d\d\d\d\d\d\.\d+/],['HHmmss,SSSS',/\d\d\d\d\d\d,\d+/],['HHmmss',/\d\d\d\d\d\d/],['HHmm',/\d\d\d\d/],['HH',/\d\d/]];var aspNetJsonRegex=/^\/?Date\((\-?\d+)/i;// date from iso format
function configFromISO(config){var i,l,string=config._i,match=extendedIsoRegex.exec(string)||basicIsoRegex.exec(string),allowTime,dateFormat,timeFormat,tzFormat;if(match){getParsingFlags(config).iso=true;for(i=0,l=isoDates.length;i<l;i++){if(isoDates[i][1].exec(match[1])){dateFormat=isoDates[i][0];allowTime=isoDates[i][2]!==false;break;}}if(dateFormat==null){config._isValid=false;return;}if(match[3]){for(i=0,l=isoTimes.length;i<l;i++){if(isoTimes[i][1].exec(match[3])){// match[2] should be 'T' or space
timeFormat=(match[2]||' ')+isoTimes[i][0];break;}}if(timeFormat==null){config._isValid=false;return;}}if(!allowTime&&timeFormat!=null){config._isValid=false;return;}if(match[4]){if(tzRegex.exec(match[4])){tzFormat='Z';}else{config._isValid=false;return;}}config._f=dateFormat+(timeFormat||'')+(tzFormat||'');configFromStringAndFormat(config);}else{config._isValid=false;}}// date from iso format or fallback
function configFromString(config){var matched=aspNetJsonRegex.exec(config._i);if(matched!==null){config._d=new Date(+matched[1]);return;}configFromISO(config);if(config._isValid===false){delete config._isValid;hooks.createFromInputFallback(config);}}hooks.createFromInputFallback=deprecate('value provided is not in a recognized ISO format. moment construction falls back to js Date(), '+'which is not reliable across all browsers and versions. Non ISO date formats are '+'discouraged and will be removed in an upcoming major release. Please refer to '+'http://momentjs.com/guides/#/warnings/js-date/ for more info.',function(config){config._d=new Date(config._i+(config._useUTC?' UTC':''));});// Pick the first defined of two or three arguments.
function defaults(a,b,c){if(a!=null){return a;}if(b!=null){return b;}return c;}function currentDateArray(config){// hooks is actually the exported moment object
var nowValue=new Date(hooks.now());if(config._useUTC){return[nowValue.getUTCFullYear(),nowValue.getUTCMonth(),nowValue.getUTCDate()];}return[nowValue.getFullYear(),nowValue.getMonth(),nowValue.getDate()];}// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function configFromArray(config){var i,date,input=[],currentDate,yearToUse;if(config._d){return;}currentDate=currentDateArray(config);//compute day of the year from weeks and weekdays
if(config._w&&config._a[DATE]==null&&config._a[MONTH]==null){dayOfYearFromWeekInfo(config);}//if the day of the year is set, figure out what it is
if(config._dayOfYear){yearToUse=defaults(config._a[YEAR],currentDate[YEAR]);if(config._dayOfYear>daysInYear(yearToUse)){getParsingFlags(config)._overflowDayOfYear=true;}date=createUTCDate(yearToUse,0,config._dayOfYear);config._a[MONTH]=date.getUTCMonth();config._a[DATE]=date.getUTCDate();}// Default to current date.
// * if no year, month, day of month are given, default to today
// * if day of month is given, default month and year
// * if month is given, default only year
// * if year is given, don't default anything
for(i=0;i<3&&config._a[i]==null;++i){config._a[i]=input[i]=currentDate[i];}// Zero out whatever was not defaulted, including time
for(;i<7;i++){config._a[i]=input[i]=config._a[i]==null?i===2?1:0:config._a[i];}// Check for 24:00:00.000
if(config._a[HOUR]===24&&config._a[MINUTE]===0&&config._a[SECOND]===0&&config._a[MILLISECOND]===0){config._nextDay=true;config._a[HOUR]=0;}config._d=(config._useUTC?createUTCDate:createDate).apply(null,input);// Apply timezone offset from input. The actual utcOffset can be changed
// with parseZone.
if(config._tzm!=null){config._d.setUTCMinutes(config._d.getUTCMinutes()-config._tzm);}if(config._nextDay){config._a[HOUR]=24;}}function dayOfYearFromWeekInfo(config){var w,weekYear,week,weekday,dow,doy,temp,weekdayOverflow;w=config._w;if(w.GG!=null||w.W!=null||w.E!=null){dow=1;doy=4;// TODO: We need to take the current isoWeekYear, but that depends on
// how we interpret now (local, utc, fixed offset). So create
// a now version of current config (take local/utc/offset flags, and
// create now).
weekYear=defaults(w.GG,config._a[YEAR],weekOfYear(createLocal(),1,4).year);week=defaults(w.W,1);weekday=defaults(w.E,1);if(weekday<1||weekday>7){weekdayOverflow=true;}}else{dow=config._locale._week.dow;doy=config._locale._week.doy;var curWeek=weekOfYear(createLocal(),dow,doy);weekYear=defaults(w.gg,config._a[YEAR],curWeek.year);// Default to current week.
week=defaults(w.w,curWeek.week);if(w.d!=null){// weekday -- low day numbers are considered next week
weekday=w.d;if(weekday<0||weekday>6){weekdayOverflow=true;}}else if(w.e!=null){// local weekday -- counting starts from begining of week
weekday=w.e+dow;if(w.e<0||w.e>6){weekdayOverflow=true;}}else{// default to begining of week
weekday=dow;}}if(week<1||week>weeksInYear(weekYear,dow,doy)){getParsingFlags(config)._overflowWeeks=true;}else if(weekdayOverflow!=null){getParsingFlags(config)._overflowWeekday=true;}else{temp=dayOfYearFromWeeks(weekYear,week,weekday,dow,doy);config._a[YEAR]=temp.year;config._dayOfYear=temp.dayOfYear;}}// constant that refers to the ISO standard
hooks.ISO_8601=function(){};// date from string and format string
function configFromStringAndFormat(config){// TODO: Move this to another part of the creation flow to prevent circular deps
if(config._f===hooks.ISO_8601){configFromISO(config);return;}config._a=[];getParsingFlags(config).empty=true;// This array is used to make a Date, either with `new Date` or `Date.UTC`
var string=''+config._i,i,parsedInput,tokens,token,skipped,stringLength=string.length,totalParsedInputLength=0;tokens=expandFormat(config._f,config._locale).match(formattingTokens)||[];for(i=0;i<tokens.length;i++){token=tokens[i];parsedInput=(string.match(getParseRegexForToken(token,config))||[])[0];// console.log('token', token, 'parsedInput', parsedInput,
//         'regex', getParseRegexForToken(token, config));
if(parsedInput){skipped=string.substr(0,string.indexOf(parsedInput));if(skipped.length>0){getParsingFlags(config).unusedInput.push(skipped);}string=string.slice(string.indexOf(parsedInput)+parsedInput.length);totalParsedInputLength+=parsedInput.length;}// don't parse if it's not a known token
if(formatTokenFunctions[token]){if(parsedInput){getParsingFlags(config).empty=false;}else{getParsingFlags(config).unusedTokens.push(token);}addTimeToArrayFromToken(token,parsedInput,config);}else if(config._strict&&!parsedInput){getParsingFlags(config).unusedTokens.push(token);}}// add remaining unparsed input length to the string
getParsingFlags(config).charsLeftOver=stringLength-totalParsedInputLength;if(string.length>0){getParsingFlags(config).unusedInput.push(string);}// clear _12h flag if hour is <= 12
if(config._a[HOUR]<=12&&getParsingFlags(config).bigHour===true&&config._a[HOUR]>0){getParsingFlags(config).bigHour=undefined;}getParsingFlags(config).parsedDateParts=config._a.slice(0);getParsingFlags(config).meridiem=config._meridiem;// handle meridiem
config._a[HOUR]=meridiemFixWrap(config._locale,config._a[HOUR],config._meridiem);configFromArray(config);checkOverflow(config);}function meridiemFixWrap(locale,hour,meridiem){var isPm;if(meridiem==null){// nothing to do
return hour;}if(locale.meridiemHour!=null){return locale.meridiemHour(hour,meridiem);}else if(locale.isPM!=null){// Fallback
isPm=locale.isPM(meridiem);if(isPm&&hour<12){hour+=12;}if(!isPm&&hour===12){hour=0;}return hour;}else{// this is not supposed to happen
return hour;}}// date from string and array of format strings
function configFromStringAndArray(config){var tempConfig,bestMoment,scoreToBeat,i,currentScore;if(config._f.length===0){getParsingFlags(config).invalidFormat=true;config._d=new Date(NaN);return;}for(i=0;i<config._f.length;i++){currentScore=0;tempConfig=copyConfig({},config);if(config._useUTC!=null){tempConfig._useUTC=config._useUTC;}tempConfig._f=config._f[i];configFromStringAndFormat(tempConfig);if(!isValid(tempConfig)){continue;}// if there is any input that was not parsed add a penalty for that format
currentScore+=getParsingFlags(tempConfig).charsLeftOver;//or tokens
currentScore+=getParsingFlags(tempConfig).unusedTokens.length*10;getParsingFlags(tempConfig).score=currentScore;if(scoreToBeat==null||currentScore<scoreToBeat){scoreToBeat=currentScore;bestMoment=tempConfig;}}extend(config,bestMoment||tempConfig);}function configFromObject(config){if(config._d){return;}var i=normalizeObjectUnits(config._i);config._a=map([i.year,i.month,i.day||i.date,i.hour,i.minute,i.second,i.millisecond],function(obj){return obj&&parseInt(obj,10);});configFromArray(config);}function createFromConfig(config){var res=new Moment(checkOverflow(prepareConfig(config)));if(res._nextDay){// Adding is smart enough around DST
res.add(1,'d');res._nextDay=undefined;}return res;}function prepareConfig(config){var input=config._i,format=config._f;config._locale=config._locale||getLocale(config._l);if(input===null||format===undefined&&input===''){return createInvalid({nullInput:true});}if(typeof input==='string'){config._i=input=config._locale.preparse(input);}if(isMoment(input)){return new Moment(checkOverflow(input));}else if(isDate(input)){config._d=input;}else if(isArray(format)){configFromStringAndArray(config);}else if(format){configFromStringAndFormat(config);}else{configFromInput(config);}if(!isValid(config)){config._d=null;}return config;}function configFromInput(config){var input=config._i;if(input===undefined){config._d=new Date(hooks.now());}else if(isDate(input)){config._d=new Date(input.valueOf());}else if(typeof input==='string'){configFromString(config);}else if(isArray(input)){config._a=map(input.slice(0),function(obj){return parseInt(obj,10);});configFromArray(config);}else if(typeof input==='object'){configFromObject(config);}else if(isNumber(input)){// from milliseconds
config._d=new Date(input);}else{hooks.createFromInputFallback(config);}}function createLocalOrUTC(input,format,locale,strict,isUTC){var c={};if(locale===true||locale===false){strict=locale;locale=undefined;}if(isObject(input)&&isObjectEmpty(input)||isArray(input)&&input.length===0){input=undefined;}// object construction must be done this way.
// https://github.com/moment/moment/issues/1423
c._isAMomentObject=true;c._useUTC=c._isUTC=isUTC;c._l=locale;c._i=input;c._f=format;c._strict=strict;return createFromConfig(c);}function createLocal(input,format,locale,strict){return createLocalOrUTC(input,format,locale,strict,false);}var prototypeMin=deprecate('moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',function(){var other=createLocal.apply(null,arguments);if(this.isValid()&&other.isValid()){return other<this?this:other;}else{return createInvalid();}});var prototypeMax=deprecate('moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',function(){var other=createLocal.apply(null,arguments);if(this.isValid()&&other.isValid()){return other>this?this:other;}else{return createInvalid();}});// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function pickBy(fn,moments){var res,i;if(moments.length===1&&isArray(moments[0])){moments=moments[0];}if(!moments.length){return createLocal();}res=moments[0];for(i=1;i<moments.length;++i){if(!moments[i].isValid()||moments[i][fn](res)){res=moments[i];}}return res;}// TODO: Use [].sort instead?
function min(){var args=[].slice.call(arguments,0);return pickBy('isBefore',args);}function max(){var args=[].slice.call(arguments,0);return pickBy('isAfter',args);}var now=function(){return Date.now?Date.now():+new Date();};function Duration(duration){var normalizedInput=normalizeObjectUnits(duration),years=normalizedInput.year||0,quarters=normalizedInput.quarter||0,months=normalizedInput.month||0,weeks=normalizedInput.week||0,days=normalizedInput.day||0,hours=normalizedInput.hour||0,minutes=normalizedInput.minute||0,seconds=normalizedInput.second||0,milliseconds=normalizedInput.millisecond||0;// representation for dateAddRemove
this._milliseconds=+milliseconds+seconds*1e3+// 1000
minutes*6e4+// 1000 * 60
hours*1000*60*60;//using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
// Because of dateAddRemove treats 24 hours as different from a
// day when working around DST, we need to store them separately
this._days=+days+weeks*7;// It is impossible translate months into days without knowing
// which months you are are talking about, so we have to store
// it separately.
this._months=+months+quarters*3+years*12;this._data={};this._locale=getLocale();this._bubble();}function isDuration(obj){return obj instanceof Duration;}function absRound(number){if(number<0){return Math.round(-1*number)*-1;}else{return Math.round(number);}}// FORMATTING
function offset(token,separator){addFormatToken(token,0,0,function(){var offset=this.utcOffset();var sign='+';if(offset<0){offset=-offset;sign='-';}return sign+zeroFill(~~(offset/60),2)+separator+zeroFill(~~offset%60,2);});}offset('Z',':');offset('ZZ','');// PARSING
addRegexToken('Z',matchShortOffset);addRegexToken('ZZ',matchShortOffset);addParseToken(['Z','ZZ'],function(input,array,config){config._useUTC=true;config._tzm=offsetFromString(matchShortOffset,input);});// HELPERS
// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var chunkOffset=/([\+\-]|\d\d)/gi;function offsetFromString(matcher,string){var matches=(string||'').match(matcher);if(matches===null){return null;}var chunk=matches[matches.length-1]||[];var parts=(chunk+'').match(chunkOffset)||['-',0,0];var minutes=+(parts[1]*60)+toInt(parts[2]);return minutes===0?0:parts[0]==='+'?minutes:-minutes;}// Return a moment from input, that is local/utc/zone equivalent to model.
function cloneWithOffset(input,model){var res,diff;if(model._isUTC){res=model.clone();diff=(isMoment(input)||isDate(input)?input.valueOf():createLocal(input).valueOf())-res.valueOf();// Use low-level api, because this fn is low-level api.
res._d.setTime(res._d.valueOf()+diff);hooks.updateOffset(res,false);return res;}else{return createLocal(input).local();}}function getDateOffset(m){// On Firefox.24 Date#getTimezoneOffset returns a floating point.
// https://github.com/moment/moment/pull/1871
return-Math.round(m._d.getTimezoneOffset()/15)*15;}// HOOKS
// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
hooks.updateOffset=function(){};// MOMENTS
// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function getSetOffset(input,keepLocalTime){var offset=this._offset||0,localAdjust;if(!this.isValid()){return input!=null?this:NaN;}if(input!=null){if(typeof input==='string'){input=offsetFromString(matchShortOffset,input);if(input===null){return this;}}else if(Math.abs(input)<16){input=input*60;}if(!this._isUTC&&keepLocalTime){localAdjust=getDateOffset(this);}this._offset=input;this._isUTC=true;if(localAdjust!=null){this.add(localAdjust,'m');}if(offset!==input){if(!keepLocalTime||this._changeInProgress){addSubtract(this,createDuration(input-offset,'m'),1,false);}else if(!this._changeInProgress){this._changeInProgress=true;hooks.updateOffset(this,true);this._changeInProgress=null;}}return this;}else{return this._isUTC?offset:getDateOffset(this);}}function getSetZone(input,keepLocalTime){if(input!=null){if(typeof input!=='string'){input=-input;}this.utcOffset(input,keepLocalTime);return this;}else{return-this.utcOffset();}}function setOffsetToUTC(keepLocalTime){return this.utcOffset(0,keepLocalTime);}function setOffsetToLocal(keepLocalTime){if(this._isUTC){this.utcOffset(0,keepLocalTime);this._isUTC=false;if(keepLocalTime){this.subtract(getDateOffset(this),'m');}}return this;}function setOffsetToParsedOffset(){if(this._tzm!=null){this.utcOffset(this._tzm);}else if(typeof this._i==='string'){var tZone=offsetFromString(matchOffset,this._i);if(tZone!=null){this.utcOffset(tZone);}else{this.utcOffset(0,true);}}return this;}function hasAlignedHourOffset(input){if(!this.isValid()){return false;}input=input?createLocal(input).utcOffset():0;return(this.utcOffset()-input)%60===0;}function isDaylightSavingTime(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset();}function isDaylightSavingTimeShifted(){if(!isUndefined(this._isDSTShifted)){return this._isDSTShifted;}var c={};copyConfig(c,this);c=prepareConfig(c);if(c._a){var other=c._isUTC?createUTC(c._a):createLocal(c._a);this._isDSTShifted=this.isValid()&&compareArrays(c._a,other.toArray())>0;}else{this._isDSTShifted=false;}return this._isDSTShifted;}function isLocal(){return this.isValid()?!this._isUTC:false;}function isUtcOffset(){return this.isValid()?this._isUTC:false;}function isUtc(){return this.isValid()?this._isUTC&&this._offset===0:false;}// ASP.NET json date format regex
var aspNetRegex=/^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and day
var isoRegex=/^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;function createDuration(input,key){var duration=input,// matching against regexp is expensive, do it on demand
match=null,sign,ret,diffRes;if(isDuration(input)){duration={ms:input._milliseconds,d:input._days,M:input._months};}else if(isNumber(input)){duration={};if(key){duration[key]=input;}else{duration.milliseconds=input;}}else if(!!(match=aspNetRegex.exec(input))){sign=match[1]==='-'?-1:1;duration={y:0,d:toInt(match[DATE])*sign,h:toInt(match[HOUR])*sign,m:toInt(match[MINUTE])*sign,s:toInt(match[SECOND])*sign,ms:toInt(absRound(match[MILLISECOND]*1000))*sign// the millisecond decimal point is included in the match
};}else if(!!(match=isoRegex.exec(input))){sign=match[1]==='-'?-1:1;duration={y:parseIso(match[2],sign),M:parseIso(match[3],sign),w:parseIso(match[4],sign),d:parseIso(match[5],sign),h:parseIso(match[6],sign),m:parseIso(match[7],sign),s:parseIso(match[8],sign)};}else if(duration==null){// checks for null or undefined
duration={};}else if(typeof duration==='object'&&('from'in duration||'to'in duration)){diffRes=momentsDifference(createLocal(duration.from),createLocal(duration.to));duration={};duration.ms=diffRes.milliseconds;duration.M=diffRes.months;}ret=new Duration(duration);if(isDuration(input)&&hasOwnProp(input,'_locale')){ret._locale=input._locale;}return ret;}createDuration.fn=Duration.prototype;function parseIso(inp,sign){// We'd normally use ~~inp for this, but unfortunately it also
// converts floats to ints.
// inp may be undefined, so careful calling replace on it.
var res=inp&&parseFloat(inp.replace(',','.'));// apply sign while we're at it
return(isNaN(res)?0:res)*sign;}function positiveMomentsDifference(base,other){var res={milliseconds:0,months:0};res.months=other.month()-base.month()+(other.year()-base.year())*12;if(base.clone().add(res.months,'M').isAfter(other)){--res.months;}res.milliseconds=+other-+base.clone().add(res.months,'M');return res;}function momentsDifference(base,other){var res;if(!(base.isValid()&&other.isValid())){return{milliseconds:0,months:0};}other=cloneWithOffset(other,base);if(base.isBefore(other)){res=positiveMomentsDifference(base,other);}else{res=positiveMomentsDifference(other,base);res.milliseconds=-res.milliseconds;res.months=-res.months;}return res;}// TODO: remove 'name' arg after deprecation is removed
function createAdder(direction,name){return function(val,period){var dur,tmp;//invert the arguments, but complain about it
if(period!==null&&!isNaN(+period)){deprecateSimple(name,'moment().'+name+'(period, number) is deprecated. Please use moment().'+name+'(number, period). '+'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');tmp=val;val=period;period=tmp;}val=typeof val==='string'?+val:val;dur=createDuration(val,period);addSubtract(this,dur,direction);return this;};}function addSubtract(mom,duration,isAdding,updateOffset){var milliseconds=duration._milliseconds,days=absRound(duration._days),months=absRound(duration._months);if(!mom.isValid()){// No op
return;}updateOffset=updateOffset==null?true:updateOffset;if(milliseconds){mom._d.setTime(mom._d.valueOf()+milliseconds*isAdding);}if(days){set$1(mom,'Date',get(mom,'Date')+days*isAdding);}if(months){setMonth(mom,get(mom,'Month')+months*isAdding);}if(updateOffset){hooks.updateOffset(mom,days||months);}}var add=createAdder(1,'add');var subtract=createAdder(-1,'subtract');function getCalendarFormat(myMoment,now){var diff=myMoment.diff(now,'days',true);return diff<-6?'sameElse':diff<-1?'lastWeek':diff<0?'lastDay':diff<1?'sameDay':diff<2?'nextDay':diff<7?'nextWeek':'sameElse';}function calendar$1(time,formats){// We want to compare the start of today, vs this.
// Getting start-of-today depends on whether we're local/utc/offset or not.
var now=time||createLocal(),sod=cloneWithOffset(now,this).startOf('day'),format=hooks.calendarFormat(this,sod)||'sameElse';var output=formats&&(isFunction(formats[format])?formats[format].call(this,now):formats[format]);return this.format(output||this.localeData().calendar(format,this,createLocal(now)));}function clone(){return new Moment(this);}function isAfter(input,units){var localInput=isMoment(input)?input:createLocal(input);if(!(this.isValid()&&localInput.isValid())){return false;}units=normalizeUnits(!isUndefined(units)?units:'millisecond');if(units==='millisecond'){return this.valueOf()>localInput.valueOf();}else{return localInput.valueOf()<this.clone().startOf(units).valueOf();}}function isBefore(input,units){var localInput=isMoment(input)?input:createLocal(input);if(!(this.isValid()&&localInput.isValid())){return false;}units=normalizeUnits(!isUndefined(units)?units:'millisecond');if(units==='millisecond'){return this.valueOf()<localInput.valueOf();}else{return this.clone().endOf(units).valueOf()<localInput.valueOf();}}function isBetween(from,to,units,inclusivity){inclusivity=inclusivity||'()';return(inclusivity[0]==='('?this.isAfter(from,units):!this.isBefore(from,units))&&(inclusivity[1]===')'?this.isBefore(to,units):!this.isAfter(to,units));}function isSame(input,units){var localInput=isMoment(input)?input:createLocal(input),inputMs;if(!(this.isValid()&&localInput.isValid())){return false;}units=normalizeUnits(units||'millisecond');if(units==='millisecond'){return this.valueOf()===localInput.valueOf();}else{inputMs=localInput.valueOf();return this.clone().startOf(units).valueOf()<=inputMs&&inputMs<=this.clone().endOf(units).valueOf();}}function isSameOrAfter(input,units){return this.isSame(input,units)||this.isAfter(input,units);}function isSameOrBefore(input,units){return this.isSame(input,units)||this.isBefore(input,units);}function diff(input,units,asFloat){var that,zoneDelta,delta,output;if(!this.isValid()){return NaN;}that=cloneWithOffset(input,this);if(!that.isValid()){return NaN;}zoneDelta=(that.utcOffset()-this.utcOffset())*6e4;units=normalizeUnits(units);if(units==='year'||units==='month'||units==='quarter'){output=monthDiff(this,that);if(units==='quarter'){output=output/3;}else if(units==='year'){output=output/12;}}else{delta=this-that;output=units==='second'?delta/1e3:// 1000
units==='minute'?delta/6e4:// 1000 * 60
units==='hour'?delta/36e5:// 1000 * 60 * 60
units==='day'?(delta-zoneDelta)/864e5:// 1000 * 60 * 60 * 24, negate dst
units==='week'?(delta-zoneDelta)/6048e5:// 1000 * 60 * 60 * 24 * 7, negate dst
delta;}return asFloat?output:absFloor(output);}function monthDiff(a,b){// difference in months
var wholeMonthDiff=(b.year()-a.year())*12+(b.month()-a.month()),// b is in (anchor - 1 month, anchor + 1 month)
anchor=a.clone().add(wholeMonthDiff,'months'),anchor2,adjust;if(b-anchor<0){anchor2=a.clone().add(wholeMonthDiff-1,'months');// linear across the month
adjust=(b-anchor)/(anchor-anchor2);}else{anchor2=a.clone().add(wholeMonthDiff+1,'months');// linear across the month
adjust=(b-anchor)/(anchor2-anchor);}//check for negative zero, return zero if negative zero
return-(wholeMonthDiff+adjust)||0;}hooks.defaultFormat='YYYY-MM-DDTHH:mm:ssZ';hooks.defaultFormatUtc='YYYY-MM-DDTHH:mm:ss[Z]';function toString(){return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');}function toISOString(){var m=this.clone().utc();if(0<m.year()&&m.year()<=9999){if(isFunction(Date.prototype.toISOString)){// native implementation is ~50x faster, use it when we can
return this.toDate().toISOString();}else{return formatMoment(m,'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');}}else{return formatMoment(m,'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');}}/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */function inspect(){if(!this.isValid()){return'moment.invalid(/* '+this._i+' */)';}var func='moment';var zone='';if(!this.isLocal()){func=this.utcOffset()===0?'moment.utc':'moment.parseZone';zone='Z';}var prefix='['+func+'("]';var year=0<this.year()&&this.year()<=9999?'YYYY':'YYYYYY';var datetime='-MM-DD[T]HH:mm:ss.SSS';var suffix=zone+'[")]';return this.format(prefix+year+datetime+suffix);}function format(inputString){if(!inputString){inputString=this.isUtc()?hooks.defaultFormatUtc:hooks.defaultFormat;}var output=formatMoment(this,inputString);return this.localeData().postformat(output);}function from(time,withoutSuffix){if(this.isValid()&&(isMoment(time)&&time.isValid()||createLocal(time).isValid())){return createDuration({to:this,from:time}).locale(this.locale()).humanize(!withoutSuffix);}else{return this.localeData().invalidDate();}}function fromNow(withoutSuffix){return this.from(createLocal(),withoutSuffix);}function to(time,withoutSuffix){if(this.isValid()&&(isMoment(time)&&time.isValid()||createLocal(time).isValid())){return createDuration({from:this,to:time}).locale(this.locale()).humanize(!withoutSuffix);}else{return this.localeData().invalidDate();}}function toNow(withoutSuffix){return this.to(createLocal(),withoutSuffix);}// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function locale(key){var newLocaleData;if(key===undefined){return this._locale._abbr;}else{newLocaleData=getLocale(key);if(newLocaleData!=null){this._locale=newLocaleData;}return this;}}var lang=deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',function(key){if(key===undefined){return this.localeData();}else{return this.locale(key);}});function localeData(){return this._locale;}function startOf(units){units=normalizeUnits(units);// the following switch intentionally omits break keywords
// to utilize falling through the cases.
switch(units){case'year':this.month(0);/* falls through */case'quarter':case'month':this.date(1);/* falls through */case'week':case'isoWeek':case'day':case'date':this.hours(0);/* falls through */case'hour':this.minutes(0);/* falls through */case'minute':this.seconds(0);/* falls through */case'second':this.milliseconds(0);}// weeks are a special case
if(units==='week'){this.weekday(0);}if(units==='isoWeek'){this.isoWeekday(1);}// quarters are also special
if(units==='quarter'){this.month(Math.floor(this.month()/3)*3);}return this;}function endOf(units){units=normalizeUnits(units);if(units===undefined||units==='millisecond'){return this;}// 'date' is an alias for 'day', so it should be considered as such.
if(units==='date'){units='day';}return this.startOf(units).add(1,units==='isoWeek'?'week':units).subtract(1,'ms');}function valueOf(){return this._d.valueOf()-(this._offset||0)*60000;}function unix(){return Math.floor(this.valueOf()/1000);}function toDate(){return new Date(this.valueOf());}function toArray(){var m=this;return[m.year(),m.month(),m.date(),m.hour(),m.minute(),m.second(),m.millisecond()];}function toObject(){var m=this;return{years:m.year(),months:m.month(),date:m.date(),hours:m.hours(),minutes:m.minutes(),seconds:m.seconds(),milliseconds:m.milliseconds()};}function toJSON(){// new Date(NaN).toJSON() === null
return this.isValid()?this.toISOString():null;}function isValid$1(){return isValid(this);}function parsingFlags(){return extend({},getParsingFlags(this));}function invalidAt(){return getParsingFlags(this).overflow;}function creationData(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict};}// FORMATTING
addFormatToken(0,['gg',2],0,function(){return this.weekYear()%100;});addFormatToken(0,['GG',2],0,function(){return this.isoWeekYear()%100;});function addWeekYearFormatToken(token,getter){addFormatToken(0,[token,token.length],0,getter);}addWeekYearFormatToken('gggg','weekYear');addWeekYearFormatToken('ggggg','weekYear');addWeekYearFormatToken('GGGG','isoWeekYear');addWeekYearFormatToken('GGGGG','isoWeekYear');// ALIASES
addUnitAlias('weekYear','gg');addUnitAlias('isoWeekYear','GG');// PRIORITY
addUnitPriority('weekYear',1);addUnitPriority('isoWeekYear',1);// PARSING
addRegexToken('G',matchSigned);addRegexToken('g',matchSigned);addRegexToken('GG',match1to2,match2);addRegexToken('gg',match1to2,match2);addRegexToken('GGGG',match1to4,match4);addRegexToken('gggg',match1to4,match4);addRegexToken('GGGGG',match1to6,match6);addRegexToken('ggggg',match1to6,match6);addWeekParseToken(['gggg','ggggg','GGGG','GGGGG'],function(input,week,config,token){week[token.substr(0,2)]=toInt(input);});addWeekParseToken(['gg','GG'],function(input,week,config,token){week[token]=hooks.parseTwoDigitYear(input);});// MOMENTS
function getSetWeekYear(input){return getSetWeekYearHelper.call(this,input,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy);}function getSetISOWeekYear(input){return getSetWeekYearHelper.call(this,input,this.isoWeek(),this.isoWeekday(),1,4);}function getISOWeeksInYear(){return weeksInYear(this.year(),1,4);}function getWeeksInYear(){var weekInfo=this.localeData()._week;return weeksInYear(this.year(),weekInfo.dow,weekInfo.doy);}function getSetWeekYearHelper(input,week,weekday,dow,doy){var weeksTarget;if(input==null){return weekOfYear(this,dow,doy).year;}else{weeksTarget=weeksInYear(input,dow,doy);if(week>weeksTarget){week=weeksTarget;}return setWeekAll.call(this,input,week,weekday,dow,doy);}}function setWeekAll(weekYear,week,weekday,dow,doy){var dayOfYearData=dayOfYearFromWeeks(weekYear,week,weekday,dow,doy),date=createUTCDate(dayOfYearData.year,0,dayOfYearData.dayOfYear);this.year(date.getUTCFullYear());this.month(date.getUTCMonth());this.date(date.getUTCDate());return this;}// FORMATTING
addFormatToken('Q',0,'Qo','quarter');// ALIASES
addUnitAlias('quarter','Q');// PRIORITY
addUnitPriority('quarter',7);// PARSING
addRegexToken('Q',match1);addParseToken('Q',function(input,array){array[MONTH]=(toInt(input)-1)*3;});// MOMENTS
function getSetQuarter(input){return input==null?Math.ceil((this.month()+1)/3):this.month((input-1)*3+this.month()%3);}// FORMATTING
addFormatToken('D',['DD',2],'Do','date');// ALIASES
addUnitAlias('date','D');// PRIOROITY
addUnitPriority('date',9);// PARSING
addRegexToken('D',match1to2);addRegexToken('DD',match1to2,match2);addRegexToken('Do',function(isStrict,locale){return isStrict?locale._ordinalParse:locale._ordinalParseLenient;});addParseToken(['D','DD'],DATE);addParseToken('Do',function(input,array){array[DATE]=toInt(input.match(match1to2)[0],10);});// MOMENTS
var getSetDayOfMonth=makeGetSet('Date',true);// FORMATTING
addFormatToken('DDD',['DDDD',3],'DDDo','dayOfYear');// ALIASES
addUnitAlias('dayOfYear','DDD');// PRIORITY
addUnitPriority('dayOfYear',4);// PARSING
addRegexToken('DDD',match1to3);addRegexToken('DDDD',match3);addParseToken(['DDD','DDDD'],function(input,array,config){config._dayOfYear=toInt(input);});// HELPERS
// MOMENTS
function getSetDayOfYear(input){var dayOfYear=Math.round((this.clone().startOf('day')-this.clone().startOf('year'))/864e5)+1;return input==null?dayOfYear:this.add(input-dayOfYear,'d');}// FORMATTING
addFormatToken('m',['mm',2],0,'minute');// ALIASES
addUnitAlias('minute','m');// PRIORITY
addUnitPriority('minute',14);// PARSING
addRegexToken('m',match1to2);addRegexToken('mm',match1to2,match2);addParseToken(['m','mm'],MINUTE);// MOMENTS
var getSetMinute=makeGetSet('Minutes',false);// FORMATTING
addFormatToken('s',['ss',2],0,'second');// ALIASES
addUnitAlias('second','s');// PRIORITY
addUnitPriority('second',15);// PARSING
addRegexToken('s',match1to2);addRegexToken('ss',match1to2,match2);addParseToken(['s','ss'],SECOND);// MOMENTS
var getSetSecond=makeGetSet('Seconds',false);// FORMATTING
addFormatToken('S',0,0,function(){return~~(this.millisecond()/100);});addFormatToken(0,['SS',2],0,function(){return~~(this.millisecond()/10);});addFormatToken(0,['SSS',3],0,'millisecond');addFormatToken(0,['SSSS',4],0,function(){return this.millisecond()*10;});addFormatToken(0,['SSSSS',5],0,function(){return this.millisecond()*100;});addFormatToken(0,['SSSSSS',6],0,function(){return this.millisecond()*1000;});addFormatToken(0,['SSSSSSS',7],0,function(){return this.millisecond()*10000;});addFormatToken(0,['SSSSSSSS',8],0,function(){return this.millisecond()*100000;});addFormatToken(0,['SSSSSSSSS',9],0,function(){return this.millisecond()*1000000;});// ALIASES
addUnitAlias('millisecond','ms');// PRIORITY
addUnitPriority('millisecond',16);// PARSING
addRegexToken('S',match1to3,match1);addRegexToken('SS',match1to3,match2);addRegexToken('SSS',match1to3,match3);var token;for(token='SSSS';token.length<=9;token+='S'){addRegexToken(token,matchUnsigned);}function parseMs(input,array){array[MILLISECOND]=toInt(('0.'+input)*1000);}for(token='S';token.length<=9;token+='S'){addParseToken(token,parseMs);}// MOMENTS
var getSetMillisecond=makeGetSet('Milliseconds',false);// FORMATTING
addFormatToken('z',0,0,'zoneAbbr');addFormatToken('zz',0,0,'zoneName');// MOMENTS
function getZoneAbbr(){return this._isUTC?'UTC':'';}function getZoneName(){return this._isUTC?'Coordinated Universal Time':'';}var proto=Moment.prototype;proto.add=add;proto.calendar=calendar$1;proto.clone=clone;proto.diff=diff;proto.endOf=endOf;proto.format=format;proto.from=from;proto.fromNow=fromNow;proto.to=to;proto.toNow=toNow;proto.get=stringGet;proto.invalidAt=invalidAt;proto.isAfter=isAfter;proto.isBefore=isBefore;proto.isBetween=isBetween;proto.isSame=isSame;proto.isSameOrAfter=isSameOrAfter;proto.isSameOrBefore=isSameOrBefore;proto.isValid=isValid$1;proto.lang=lang;proto.locale=locale;proto.localeData=localeData;proto.max=prototypeMax;proto.min=prototypeMin;proto.parsingFlags=parsingFlags;proto.set=stringSet;proto.startOf=startOf;proto.subtract=subtract;proto.toArray=toArray;proto.toObject=toObject;proto.toDate=toDate;proto.toISOString=toISOString;proto.inspect=inspect;proto.toJSON=toJSON;proto.toString=toString;proto.unix=unix;proto.valueOf=valueOf;proto.creationData=creationData;// Year
proto.year=getSetYear;proto.isLeapYear=getIsLeapYear;// Week Year
proto.weekYear=getSetWeekYear;proto.isoWeekYear=getSetISOWeekYear;// Quarter
proto.quarter=proto.quarters=getSetQuarter;// Month
proto.month=getSetMonth;proto.daysInMonth=getDaysInMonth;// Week
proto.week=proto.weeks=getSetWeek;proto.isoWeek=proto.isoWeeks=getSetISOWeek;proto.weeksInYear=getWeeksInYear;proto.isoWeeksInYear=getISOWeeksInYear;// Day
proto.date=getSetDayOfMonth;proto.day=proto.days=getSetDayOfWeek;proto.weekday=getSetLocaleDayOfWeek;proto.isoWeekday=getSetISODayOfWeek;proto.dayOfYear=getSetDayOfYear;// Hour
proto.hour=proto.hours=getSetHour;// Minute
proto.minute=proto.minutes=getSetMinute;// Second
proto.second=proto.seconds=getSetSecond;// Millisecond
proto.millisecond=proto.milliseconds=getSetMillisecond;// Offset
proto.utcOffset=getSetOffset;proto.utc=setOffsetToUTC;proto.local=setOffsetToLocal;proto.parseZone=setOffsetToParsedOffset;proto.hasAlignedHourOffset=hasAlignedHourOffset;proto.isDST=isDaylightSavingTime;proto.isLocal=isLocal;proto.isUtcOffset=isUtcOffset;proto.isUtc=isUtc;proto.isUTC=isUtc;// Timezone
proto.zoneAbbr=getZoneAbbr;proto.zoneName=getZoneName;// Deprecations
proto.dates=deprecate('dates accessor is deprecated. Use date instead.',getSetDayOfMonth);proto.months=deprecate('months accessor is deprecated. Use month instead',getSetMonth);proto.years=deprecate('years accessor is deprecated. Use year instead',getSetYear);proto.zone=deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',getSetZone);proto.isDSTShifted=deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',isDaylightSavingTimeShifted);function createUnix(input){return createLocal(input*1000);}function createInZone(){return createLocal.apply(null,arguments).parseZone();}function preParsePostFormat(string){return string;}var proto$1=Locale.prototype;proto$1.calendar=calendar;proto$1.longDateFormat=longDateFormat;proto$1.invalidDate=invalidDate;proto$1.ordinal=ordinal;proto$1.preparse=preParsePostFormat;proto$1.postformat=preParsePostFormat;proto$1.relativeTime=relativeTime;proto$1.pastFuture=pastFuture;proto$1.set=set;// Month
proto$1.months=localeMonths;proto$1.monthsShort=localeMonthsShort;proto$1.monthsParse=localeMonthsParse;proto$1.monthsRegex=monthsRegex;proto$1.monthsShortRegex=monthsShortRegex;// Week
proto$1.week=localeWeek;proto$1.firstDayOfYear=localeFirstDayOfYear;proto$1.firstDayOfWeek=localeFirstDayOfWeek;// Day of Week
proto$1.weekdays=localeWeekdays;proto$1.weekdaysMin=localeWeekdaysMin;proto$1.weekdaysShort=localeWeekdaysShort;proto$1.weekdaysParse=localeWeekdaysParse;proto$1.weekdaysRegex=weekdaysRegex;proto$1.weekdaysShortRegex=weekdaysShortRegex;proto$1.weekdaysMinRegex=weekdaysMinRegex;// Hours
proto$1.isPM=localeIsPM;proto$1.meridiem=localeMeridiem;function get$1(format,index,field,setter){var locale=getLocale();var utc=createUTC().set(setter,index);return locale[field](utc,format);}function listMonthsImpl(format,index,field){if(isNumber(format)){index=format;format=undefined;}format=format||'';if(index!=null){return get$1(format,index,field,'month');}var i;var out=[];for(i=0;i<12;i++){out[i]=get$1(format,i,field,'month');}return out;}// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function listWeekdaysImpl(localeSorted,format,index,field){if(typeof localeSorted==='boolean'){if(isNumber(format)){index=format;format=undefined;}format=format||'';}else{format=localeSorted;index=format;localeSorted=false;if(isNumber(format)){index=format;format=undefined;}format=format||'';}var locale=getLocale(),shift=localeSorted?locale._week.dow:0;if(index!=null){return get$1(format,(index+shift)%7,field,'day');}var i;var out=[];for(i=0;i<7;i++){out[i]=get$1(format,(i+shift)%7,field,'day');}return out;}function listMonths(format,index){return listMonthsImpl(format,index,'months');}function listMonthsShort(format,index){return listMonthsImpl(format,index,'monthsShort');}function listWeekdays(localeSorted,format,index){return listWeekdaysImpl(localeSorted,format,index,'weekdays');}function listWeekdaysShort(localeSorted,format,index){return listWeekdaysImpl(localeSorted,format,index,'weekdaysShort');}function listWeekdaysMin(localeSorted,format,index){return listWeekdaysImpl(localeSorted,format,index,'weekdaysMin');}getSetGlobalLocale('en',{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(number){var b=number%10,output=toInt(number%100/10)===1?'th':b===1?'st':b===2?'nd':b===3?'rd':'th';return number+output;}});// Side effect imports
hooks.lang=deprecate('moment.lang is deprecated. Use moment.locale instead.',getSetGlobalLocale);hooks.langData=deprecate('moment.langData is deprecated. Use moment.localeData instead.',getLocale);var mathAbs=Math.abs;function abs(){var data=this._data;this._milliseconds=mathAbs(this._milliseconds);this._days=mathAbs(this._days);this._months=mathAbs(this._months);data.milliseconds=mathAbs(data.milliseconds);data.seconds=mathAbs(data.seconds);data.minutes=mathAbs(data.minutes);data.hours=mathAbs(data.hours);data.months=mathAbs(data.months);data.years=mathAbs(data.years);return this;}function addSubtract$1(duration,input,value,direction){var other=createDuration(input,value);duration._milliseconds+=direction*other._milliseconds;duration._days+=direction*other._days;duration._months+=direction*other._months;return duration._bubble();}// supports only 2.0-style add(1, 's') or add(duration)
function add$1(input,value){return addSubtract$1(this,input,value,1);}// supports only 2.0-style subtract(1, 's') or subtract(duration)
function subtract$1(input,value){return addSubtract$1(this,input,value,-1);}function absCeil(number){if(number<0){return Math.floor(number);}else{return Math.ceil(number);}}function bubble(){var milliseconds=this._milliseconds;var days=this._days;var months=this._months;var data=this._data;var seconds,minutes,hours,years,monthsFromDays;// if we have a mix of positive and negative values, bubble down first
// check: https://github.com/moment/moment/issues/2166
if(!(milliseconds>=0&&days>=0&&months>=0||milliseconds<=0&&days<=0&&months<=0)){milliseconds+=absCeil(monthsToDays(months)+days)*864e5;days=0;months=0;}// The following code bubbles up values, see the tests for
// examples of what that means.
data.milliseconds=milliseconds%1000;seconds=absFloor(milliseconds/1000);data.seconds=seconds%60;minutes=absFloor(seconds/60);data.minutes=minutes%60;hours=absFloor(minutes/60);data.hours=hours%24;days+=absFloor(hours/24);// convert days to months
monthsFromDays=absFloor(daysToMonths(days));months+=monthsFromDays;days-=absCeil(monthsToDays(monthsFromDays));// 12 months -> 1 year
years=absFloor(months/12);months%=12;data.days=days;data.months=months;data.years=years;return this;}function daysToMonths(days){// 400 years have 146097 days (taking into account leap year rules)
// 400 years have 12 months === 4800
return days*4800/146097;}function monthsToDays(months){// the reverse of daysToMonths
return months*146097/4800;}function as(units){var days;var months;var milliseconds=this._milliseconds;units=normalizeUnits(units);if(units==='month'||units==='year'){days=this._days+milliseconds/864e5;months=this._months+daysToMonths(days);return units==='month'?months:months/12;}else{// handle milliseconds separately because of floating point math errors (issue #1867)
days=this._days+Math.round(monthsToDays(this._months));switch(units){case'week':return days/7+milliseconds/6048e5;case'day':return days+milliseconds/864e5;case'hour':return days*24+milliseconds/36e5;case'minute':return days*1440+milliseconds/6e4;case'second':return days*86400+milliseconds/1000;// Math.floor prevents floating point math errors here
case'millisecond':return Math.floor(days*864e5)+milliseconds;default:throw new Error('Unknown unit '+units);}}}// TODO: Use this.as('ms')?
function valueOf$1(){return this._milliseconds+this._days*864e5+this._months%12*2592e6+toInt(this._months/12)*31536e6;}function makeAs(alias){return function(){return this.as(alias);};}var asMilliseconds=makeAs('ms');var asSeconds=makeAs('s');var asMinutes=makeAs('m');var asHours=makeAs('h');var asDays=makeAs('d');var asWeeks=makeAs('w');var asMonths=makeAs('M');var asYears=makeAs('y');function get$2(units){units=normalizeUnits(units);return this[units+'s']();}function makeGetter(name){return function(){return this._data[name];};}var milliseconds=makeGetter('milliseconds');var seconds=makeGetter('seconds');var minutes=makeGetter('minutes');var hours=makeGetter('hours');var days=makeGetter('days');var months=makeGetter('months');var years=makeGetter('years');function weeks(){return absFloor(this.days()/7);}var round=Math.round;var thresholds={s:45,// seconds to minute
m:45,// minutes to hour
h:22,// hours to day
d:26,// days to month
M:11// months to year
};// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function substituteTimeAgo(string,number,withoutSuffix,isFuture,locale){return locale.relativeTime(number||1,!!withoutSuffix,string,isFuture);}function relativeTime$1(posNegDuration,withoutSuffix,locale){var duration=createDuration(posNegDuration).abs();var seconds=round(duration.as('s'));var minutes=round(duration.as('m'));var hours=round(duration.as('h'));var days=round(duration.as('d'));var months=round(duration.as('M'));var years=round(duration.as('y'));var a=seconds<thresholds.s&&['s',seconds]||minutes<=1&&['m']||minutes<thresholds.m&&['mm',minutes]||hours<=1&&['h']||hours<thresholds.h&&['hh',hours]||days<=1&&['d']||days<thresholds.d&&['dd',days]||months<=1&&['M']||months<thresholds.M&&['MM',months]||years<=1&&['y']||['yy',years];a[2]=withoutSuffix;a[3]=+posNegDuration>0;a[4]=locale;return substituteTimeAgo.apply(null,a);}// This function allows you to set the rounding function for relative time strings
function getSetRelativeTimeRounding(roundingFunction){if(roundingFunction===undefined){return round;}if(typeof roundingFunction==='function'){round=roundingFunction;return true;}return false;}// This function allows you to set a threshold for relative time strings
function getSetRelativeTimeThreshold(threshold,limit){if(thresholds[threshold]===undefined){return false;}if(limit===undefined){return thresholds[threshold];}thresholds[threshold]=limit;return true;}function humanize(withSuffix){var locale=this.localeData();var output=relativeTime$1(this,!withSuffix,locale);if(withSuffix){output=locale.pastFuture(+this,output);}return locale.postformat(output);}var abs$1=Math.abs;function toISOString$1(){// for ISO strings we do not use the normal bubbling rules:
//  * milliseconds bubble up until they become hours
//  * days do not bubble at all
//  * months bubble up until they become years
// This is because there is no context-free conversion between hours and days
// (think of clock changes)
// and also not between days and months (28-31 days per month)
var seconds=abs$1(this._milliseconds)/1000;var days=abs$1(this._days);var months=abs$1(this._months);var minutes,hours,years;// 3600 seconds -> 60 minutes -> 1 hour
minutes=absFloor(seconds/60);hours=absFloor(minutes/60);seconds%=60;minutes%=60;// 12 months -> 1 year
years=absFloor(months/12);months%=12;// inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
var Y=years;var M=months;var D=days;var h=hours;var m=minutes;var s=seconds;var total=this.asSeconds();if(!total){// this is the same as C#'s (Noda) and python (isodate)...
// but not other JS (goog.date)
return'P0D';}return(total<0?'-':'')+'P'+(Y?Y+'Y':'')+(M?M+'M':'')+(D?D+'D':'')+(h||m||s?'T':'')+(h?h+'H':'')+(m?m+'M':'')+(s?s+'S':'');}var proto$2=Duration.prototype;proto$2.abs=abs;proto$2.add=add$1;proto$2.subtract=subtract$1;proto$2.as=as;proto$2.asMilliseconds=asMilliseconds;proto$2.asSeconds=asSeconds;proto$2.asMinutes=asMinutes;proto$2.asHours=asHours;proto$2.asDays=asDays;proto$2.asWeeks=asWeeks;proto$2.asMonths=asMonths;proto$2.asYears=asYears;proto$2.valueOf=valueOf$1;proto$2._bubble=bubble;proto$2.get=get$2;proto$2.milliseconds=milliseconds;proto$2.seconds=seconds;proto$2.minutes=minutes;proto$2.hours=hours;proto$2.days=days;proto$2.weeks=weeks;proto$2.months=months;proto$2.years=years;proto$2.humanize=humanize;proto$2.toISOString=toISOString$1;proto$2.toString=toISOString$1;proto$2.toJSON=toISOString$1;proto$2.locale=locale;proto$2.localeData=localeData;// Deprecations
proto$2.toIsoString=deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',toISOString$1);proto$2.lang=lang;// Side effect imports
// FORMATTING
addFormatToken('X',0,0,'unix');addFormatToken('x',0,0,'valueOf');// PARSING
addRegexToken('x',matchSigned);addRegexToken('X',matchTimestamp);addParseToken('X',function(input,array,config){config._d=new Date(parseFloat(input,10)*1000);});addParseToken('x',function(input,array,config){config._d=new Date(toInt(input));});// Side effect imports
hooks.version='2.16.0';setHookCallback(createLocal);hooks.fn=proto;hooks.min=min;hooks.max=max;hooks.now=now;hooks.utc=createUTC;hooks.unix=createUnix;hooks.months=listMonths;hooks.isDate=isDate;hooks.locale=getSetGlobalLocale;hooks.invalid=createInvalid;hooks.duration=createDuration;hooks.isMoment=isMoment;hooks.weekdays=listWeekdays;hooks.parseZone=createInZone;hooks.localeData=getLocale;hooks.isDuration=isDuration;hooks.monthsShort=listMonthsShort;hooks.weekdaysMin=listWeekdaysMin;hooks.defineLocale=defineLocale;hooks.updateLocale=updateLocale;hooks.locales=listLocales;hooks.weekdaysShort=listWeekdaysShort;hooks.normalizeUnits=normalizeUnits;hooks.relativeTimeRounding=getSetRelativeTimeRounding;hooks.relativeTimeThreshold=getSetRelativeTimeThreshold;hooks.calendarFormat=getCalendarFormat;hooks.prototype=proto;return hooks;});
});

var app = createCommonjsModule(function (module) {
/*! @license Firebase v3.6.1
    Build: 3.6.1-rc.3
    Terms: https://firebase.google.com/terms/ */
var firebase = null;(function () {
    var aa = "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, b, c) {
        if (c.get || c.set) throw new TypeError("ES3 does not support getters and setters.");a != Array.prototype && a != Object.prototype && (a[b] = c.value);
    },
        h = "undefined" != typeof window && window === this ? this : "undefined" != typeof commonjsGlobal && null != commonjsGlobal ? commonjsGlobal : this,
        l = function () {
        l = function () {};h.Symbol || (h.Symbol = ba);
    },
        ca = 0,
        ba = function (a) {
        return "jscomp_symbol_" + (a || "") + ca++;
    },
        n = function () {
        l();var a = h.Symbol.iterator;a || (a = h.Symbol.iterator = h.Symbol("iterator"));"function" != typeof Array.prototype[a] && aa(Array.prototype, a, { configurable: !0, writable: !0, value: function () {
                return m(this);
            } });n = function () {};
    },
        m = function (a) {
        var b = 0;return da(function () {
            return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
        });
    },
        da = function (a) {
        n();a = { next: a };a[h.Symbol.iterator] = function () {
            return this;
        };return a;
    },
        q = this,
        r = function () {},
        t = function (a) {
        var b = typeof a;if ("object" == b) {
            if (a) {
                if (a instanceof Array) return "array";if (a instanceof Object) return b;var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c) return "object";if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function";
            } else return "null";
        } else if ("function" == b && "undefined" == typeof a.call) return "object";return b;
    },
        v = function (a) {
        return "function" == t(a);
    },
        ea = function (a, b, c) {
        return a.call.apply(a.bind, arguments);
    },
        fa = function (a, b, c) {
        if (!a) throw Error();if (2 < arguments.length) {
            var d = Array.prototype.slice.call(arguments, 2);return function () {
                var c = Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c, d);return a.apply(b, c);
            };
        }return function () {
            return a.apply(b, arguments);
        };
    },
        w = function (a, b, c) {
        w = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ea : fa;return w.apply(null, arguments);
    },
        x = function (a, b) {
        var c = Array.prototype.slice.call(arguments, 1);return function () {
            var b = c.slice();b.push.apply(b, arguments);return a.apply(this, b);
        };
    },
        y = function (a, b) {
        function c() {}c.prototype = b.prototype;a.ba = b.prototype;a.prototype = new c();a.prototype.constructor = a;a.aa = function (a, c, f) {
            for (var d = Array(arguments.length - 2), e = 2; e < arguments.length; e++) d[e - 2] = arguments[e];return b.prototype[c].apply(a, d);
        };
    };var z;z = "undefined" !== typeof window ? window : "undefined" !== typeof self ? self : commonjsGlobal;function __extends(a, b) {
        function c() {
            this.constructor = a;
        }for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);a.prototype = null === b ? Object.create(b) : (c.prototype = b.prototype, new c());
    }
    function __decorate(a, b, c, d) {
        var e = arguments.length,
            f = 3 > e ? b : null === d ? d = Object.getOwnPropertyDescriptor(b, c) : d,
            g;g = z.Reflect;if ("object" === typeof g && "function" === typeof g.decorate) f = g.decorate(a, b, c, d);else for (var k = a.length - 1; 0 <= k; k--) if (g = a[k]) f = (3 > e ? g(f) : 3 < e ? g(b, c, f) : g(b, c)) || f;return 3 < e && f && Object.defineProperty(b, c, f), f;
    }function __metadata(a, b) {
        var c = z.Reflect;if ("object" === typeof c && "function" === typeof c.metadata) return c.metadata(a, b);
    }
    var __param = function (a, b) {
        return function (c, d) {
            b(c, d, a);
        };
    },
        __awaiter = function (a, b, c, d) {
        return new (c || (c = Promise))(function (e, f) {
            function g(a) {
                try {
                    p(d.next(a));
                } catch (u) {
                    f(u);
                }
            }function k(a) {
                try {
                    p(d.throw(a));
                } catch (u) {
                    f(u);
                }
            }function p(a) {
                a.done ? e(a.value) : new c(function (b) {
                    b(a.value);
                }).then(g, k);
            }p((d = d.apply(a, b)).next());
        });
    };"undefined" !== typeof z.M && z.M || (z.__extends = __extends, z.__decorate = __decorate, z.__metadata = __metadata, z.__param = __param, z.__awaiter = __awaiter);var A = function (a) {
        if (Error.captureStackTrace) Error.captureStackTrace(this, A);else {
            var b = Error().stack;b && (this.stack = b);
        }a && (this.message = String(a));
    };y(A, Error);A.prototype.name = "CustomError";var ga = function (a, b) {
        for (var c = a.split("%s"), d = "", e = Array.prototype.slice.call(arguments, 1); e.length && 1 < c.length;) d += c.shift() + e.shift();return d + c.join("%s");
    };var B = function (a, b) {
        b.unshift(a);A.call(this, ga.apply(null, b));b.shift();
    };y(B, A);B.prototype.name = "AssertionError";var ha = function (a, b, c, d) {
        var e = "Assertion failed";if (c) var e = e + (": " + c),
            f = d;else a && (e += ": " + a, f = b);throw new B("" + e, f || []);
    },
        C = function (a, b, c) {
        a || ha("", null, b, Array.prototype.slice.call(arguments, 2));
    },
        D = function (a, b, c) {
        v(a) || ha("Expected function but got %s: %s.", [t(a), a], b, Array.prototype.slice.call(arguments, 2));
    };var E = function (a, b, c) {
        this.T = c;this.N = a;this.U = b;this.s = 0;this.o = null;
    };E.prototype.get = function () {
        var a;0 < this.s ? (this.s--, a = this.o, this.o = a.next, a.next = null) : a = this.N();return a;
    };E.prototype.put = function (a) {
        this.U(a);this.s < this.T && (this.s++, a.next = this.o, this.o = a);
    };var F;a: {
        var ia = q.navigator;if (ia) {
            var ja = ia.userAgent;if (ja) {
                F = ja;break a;
            }
        }F = "";
    }var ka = function (a) {
        q.setTimeout(function () {
            throw a;
        }, 0);
    },
        G,
        la = function () {
        var a = q.MessageChannel;"undefined" === typeof a && "undefined" !== typeof window && window.postMessage && window.addEventListener && -1 == F.indexOf("Presto") && (a = function () {
            var a = document.createElement("IFRAME");a.style.display = "none";a.src = "";document.documentElement.appendChild(a);var b = a.contentWindow,
                a = b.document;a.open();a.write("");a.close();var c = "callImmediate" + Math.random(),
                d = "file:" == b.location.protocol ? "*" : b.location.protocol + "//" + b.location.host,
                a = w(function (a) {
                if (("*" == d || a.origin == d) && a.data == c) this.port1.onmessage();
            }, this);b.addEventListener("message", a, !1);this.port1 = {};this.port2 = { postMessage: function () {
                    b.postMessage(c, d);
                } };
        });if ("undefined" !== typeof a && -1 == F.indexOf("Trident") && -1 == F.indexOf("MSIE")) {
            var b = new a(),
                c = {},
                d = c;b.port1.onmessage = function () {
                if (void 0 !== c.next) {
                    c = c.next;var a = c.G;c.G = null;a();
                }
            };return function (a) {
                d.next = { G: a };d = d.next;b.port2.postMessage(0);
            };
        }return "undefined" !== typeof document && "onreadystatechange" in document.createElement("SCRIPT") ? function (a) {
            var b = document.createElement("SCRIPT");b.onreadystatechange = function () {
                b.onreadystatechange = null;b.parentNode.removeChild(b);b = null;a();a = null;
            };document.documentElement.appendChild(b);
        } : function (a) {
            q.setTimeout(a, 0);
        };
    };var H = function () {
        this.v = this.f = null;
    },
        ma = new E(function () {
        return new I();
    }, function (a) {
        a.reset();
    }, 100);H.prototype.add = function (a, b) {
        var c = ma.get();c.set(a, b);this.v ? this.v.next = c : (C(!this.f), this.f = c);this.v = c;
    };H.prototype.remove = function () {
        var a = null;this.f && (a = this.f, this.f = this.f.next, this.f || (this.v = null), a.next = null);return a;
    };var I = function () {
        this.next = this.scope = this.B = null;
    };I.prototype.set = function (a, b) {
        this.B = a;this.scope = b;this.next = null;
    };
    I.prototype.reset = function () {
        this.next = this.scope = this.B = null;
    };var M = function (a, b) {
        J || na();L || (J(), L = !0);oa.add(a, b);
    },
        J,
        na = function () {
        var a = q.Promise;if (-1 != String(a).indexOf("[native code]")) {
            var b = a.resolve(void 0);J = function () {
                b.then(pa);
            };
        } else J = function () {
            var a = pa;!v(q.setImmediate) || q.Window && q.Window.prototype && -1 == F.indexOf("Edge") && q.Window.prototype.setImmediate == q.setImmediate ? (G || (G = la()), G(a)) : q.setImmediate(a);
        };
    },
        L = !1,
        oa = new H(),
        pa = function () {
        for (var a; a = oa.remove();) {
            try {
                a.B.call(a.scope);
            } catch (b) {
                ka(b);
            }ma.put(a);
        }L = !1;
    };var O = function (a, b) {
        this.b = 0;this.L = void 0;this.j = this.g = this.u = null;this.m = this.A = !1;if (a != r) try {
            var c = this;a.call(b, function (a) {
                N(c, 2, a);
            }, function (a) {
                try {
                    if (a instanceof Error) throw a;throw Error("Promise rejected.");
                } catch (e) {}N(c, 3, a);
            });
        } catch (d) {
            N(this, 3, d);
        }
    },
        qa = function () {
        this.next = this.context = this.h = this.c = this.child = null;this.w = !1;
    };qa.prototype.reset = function () {
        this.context = this.h = this.c = this.child = null;this.w = !1;
    };
    var ra = new E(function () {
        return new qa();
    }, function (a) {
        a.reset();
    }, 100),
        sa = function (a, b, c) {
        var d = ra.get();d.c = a;d.h = b;d.context = c;return d;
    },
        ua = function (a, b, c) {
        ta(a, b, c, null) || M(x(b, a));
    };O.prototype.then = function (a, b, c) {
        null != a && D(a, "opt_onFulfilled should be a function.");null != b && D(b, "opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?");return va(this, v(a) ? a : null, v(b) ? b : null, c);
    };O.prototype.then = O.prototype.then;O.prototype.$goog_Thenable = !0;
    O.prototype.X = function (a, b) {
        return va(this, null, a, b);
    };var xa = function (a, b) {
        a.g || 2 != a.b && 3 != a.b || wa(a);C(null != b.c);a.j ? a.j.next = b : a.g = b;a.j = b;
    },
        va = function (a, b, c, d) {
        var e = sa(null, null, null);e.child = new O(function (a, g) {
            e.c = b ? function (c) {
                try {
                    var e = b.call(d, c);a(e);
                } catch (K) {
                    g(K);
                }
            } : a;e.h = c ? function (b) {
                try {
                    var e = c.call(d, b);a(e);
                } catch (K) {
                    g(K);
                }
            } : g;
        });e.child.u = a;xa(a, e);return e.child;
    };O.prototype.Y = function (a) {
        C(1 == this.b);this.b = 0;N(this, 2, a);
    };O.prototype.Z = function (a) {
        C(1 == this.b);this.b = 0;N(this, 3, a);
    };
    var N = function (a, b, c) {
        0 == a.b && (a === c && (b = 3, c = new TypeError("Promise cannot resolve to itself")), a.b = 1, ta(c, a.Y, a.Z, a) || (a.L = c, a.b = b, a.u = null, wa(a), 3 != b || ya(a, c)));
    },
        ta = function (a, b, c, d) {
        if (a instanceof O) return null != b && D(b, "opt_onFulfilled should be a function."), null != c && D(c, "opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?"), xa(a, sa(b || r, c || null, d)), !0;var e;if (a) try {
            e = !!a.$goog_Thenable;
        } catch (g) {
            e = !1;
        } else e = !1;if (e) return a.then(b, c, d), !0;e = typeof a;if ("object" == e && null != a || "function" == e) try {
            var f = a.then;if (v(f)) return za(a, f, b, c, d), !0;
        } catch (g) {
            return c.call(d, g), !0;
        }return !1;
    },
        za = function (a, b, c, d, e) {
        var f = !1,
            g = function (a) {
            f || (f = !0, c.call(e, a));
        },
            k = function (a) {
            f || (f = !0, d.call(e, a));
        };try {
            b.call(a, g, k);
        } catch (p) {
            k(p);
        }
    },
        wa = function (a) {
        a.A || (a.A = !0, M(a.P, a));
    },
        Aa = function (a) {
        var b = null;a.g && (b = a.g, a.g = b.next, b.next = null);a.g || (a.j = null);null != b && C(null != b.c);return b;
    };
    O.prototype.P = function () {
        for (var a; a = Aa(this);) {
            var b = this.b,
                c = this.L;if (3 == b && a.h && !a.w) {
                var d;for (d = this; d && d.m; d = d.u) d.m = !1;
            }if (a.child) a.child.u = null, Ba(a, b, c);else try {
                a.w ? a.c.call(a.context) : Ba(a, b, c);
            } catch (e) {
                Ca.call(null, e);
            }ra.put(a);
        }this.A = !1;
    };var Ba = function (a, b, c) {
        2 == b ? a.c.call(a.context, c) : a.h && a.h.call(a.context, c);
    },
        ya = function (a, b) {
        a.m = !0;M(function () {
            a.m && Ca.call(null, b);
        });
    },
        Ca = ka;function P(a, b) {
        if (!(b instanceof Object)) return b;switch (b.constructor) {case Date:
                return new Date(b.getTime());case Object:
                void 0 === a && (a = {});break;case Array:
                a = [];break;default:
                return b;}for (var c in b) b.hasOwnProperty(c) && (a[c] = P(a[c], b[c]));return a;
    }O.all = function (a) {
        return new O(function (b, c) {
            var d = a.length,
                e = [];if (d) for (var f = function (a, c) {
                d--;e[a] = c;0 == d && b(e);
            }, g = function (a) {
                c(a);
            }, k = 0, p; k < a.length; k++) p = a[k], ua(p, x(f, k), g);else b(e);
        });
    };O.resolve = function (a) {
        if (a instanceof O) return a;var b = new O(r);N(b, 2, a);return b;
    };O.reject = function (a) {
        return new O(function (b, c) {
            c(a);
        });
    };O.prototype["catch"] = O.prototype.X;var Q = O;"undefined" !== typeof Promise && (Q = Promise);var Da = Q;function Ea(a, b) {
        a = new R(a, b);return a.subscribe.bind(a);
    }var R = function (a, b) {
        var c = this;this.a = [];this.K = 0;this.task = Da.resolve();this.l = !1;this.D = b;this.task.then(function () {
            a(c);
        }).catch(function (a) {
            c.error(a);
        });
    };R.prototype.next = function (a) {
        S(this, function (b) {
            b.next(a);
        });
    };R.prototype.error = function (a) {
        S(this, function (b) {
            b.error(a);
        });this.close(a);
    };R.prototype.complete = function () {
        S(this, function (a) {
            a.complete();
        });this.close();
    };
    R.prototype.subscribe = function (a, b, c) {
        var d = this,
            e;if (void 0 === a && void 0 === b && void 0 === c) throw Error("Missing Observer.");e = Fa(a) ? a : { next: a, error: b, complete: c };void 0 === e.next && (e.next = T);void 0 === e.error && (e.error = T);void 0 === e.complete && (e.complete = T);a = this.$.bind(this, this.a.length);this.l && this.task.then(function () {
            try {
                d.H ? e.error(d.H) : e.complete();
            } catch (f) {}
        });this.a.push(e);return a;
    };
    R.prototype.$ = function (a) {
        void 0 !== this.a && void 0 !== this.a[a] && (delete this.a[a], --this.K, 0 === this.K && void 0 !== this.D && this.D(this));
    };var S = function (a, b) {
        if (!a.l) for (var c = 0; c < a.a.length; c++) Ga(a, c, b);
    },
        Ga = function (a, b, c) {
        a.task.then(function () {
            if (void 0 !== a.a && void 0 !== a.a[b]) try {
                c(a.a[b]);
            } catch (d) {
                "undefined" !== typeof console && console.error && console.error(d);
            }
        });
    };R.prototype.close = function (a) {
        var b = this;this.l || (this.l = !0, void 0 !== a && (this.H = a), this.task.then(function () {
            b.a = void 0;b.D = void 0;
        }));
    };
    function Fa(a) {
        if ("object" !== typeof a || null === a) return !1;var b;b = ["next", "error", "complete"];n();var c = b[Symbol.iterator];b = c ? c.call(b) : m(b);for (c = b.next(); !c.done; c = b.next()) if (c = c.value, c in a && "function" === typeof a[c]) return !0;return !1;
    }function T() {}var Ha = Error.captureStackTrace,
        V = function (a, b) {
        this.code = a;this.message = b;if (Ha) Ha(this, U.prototype.create);else {
            var c = Error.apply(this, arguments);this.name = "FirebaseError";Object.defineProperty(this, "stack", { get: function () {
                    return c.stack;
                } });
        }
    };V.prototype = Object.create(Error.prototype);V.prototype.constructor = V;V.prototype.name = "FirebaseError";var U = function (a, b, c) {
        this.V = a;this.W = b;this.O = c;this.pattern = /\{\$([^}]+)}/g;
    };
    U.prototype.create = function (a, b) {
        void 0 === b && (b = {});var c = this.O[a];a = this.V + "/" + a;var c = void 0 === c ? "Error" : c.replace(this.pattern, function (a, c) {
            a = b[c];return void 0 !== a ? a.toString() : "<" + c + "?>";
        }),
            c = this.W + ": " + c + " (" + a + ").",
            c = new V(a, c),
            d;for (d in b) b.hasOwnProperty(d) && "_" !== d.slice(-1) && (c[d] = b[d]);return c;
    };var W = Q,
        X = function (a, b, c) {
        var d = this;this.I = c;this.J = !1;this.i = {};this.C = b;this.F = P(void 0, a);a = "serviceAccount" in this.F;("credential" in this.F || a) && "undefined" !== typeof console && console.log("The '" + (a ? "serviceAccount" : "credential") + "' property specified in the first argument to initializeApp() is deprecated and will be removed in the next major version. You should instead use the 'firebase-admin' package. See https://firebase.google.com/docs/admin/setup for details on how to get started.");Object.keys(c.INTERNAL.factories).forEach(function (a) {
            var b = c.INTERNAL.useAsService(d, a);null !== b && (b = d.S.bind(d, b), d[a] = b);
        });
    };X.prototype.delete = function () {
        var a = this;return new W(function (b) {
            Y(a);b();
        }).then(function () {
            a.I.INTERNAL.removeApp(a.C);return W.all(Object.keys(a.i).map(function (b) {
                return a.i[b].INTERNAL.delete();
            }));
        }).then(function () {
            a.J = !0;a.i = {};
        });
    };X.prototype.S = function (a) {
        Y(this);void 0 === this.i[a] && (this.i[a] = this.I.INTERNAL.factories[a](this, this.R.bind(this)));return this.i[a];
    };X.prototype.R = function (a) {
        P(this, a);
    };
    var Y = function (a) {
        a.J && Z(Ia("deleted", { name: a.C }));
    };h.Object.defineProperties(X.prototype, { name: { configurable: !0, enumerable: !0, get: function () {
                Y(this);return this.C;
            } }, options: { configurable: !0, enumerable: !0, get: function () {
                Y(this);return this.F;
            } } });X.prototype.name && X.prototype.options || X.prototype.delete || console.log("dc");
    function Ja() {
        function a(a) {
            a = a || "[DEFAULT]";var b = d[a];void 0 === b && Z("noApp", { name: a });return b;
        }function b(a, b) {
            Object.keys(e).forEach(function (d) {
                d = c(a, d);if (null !== d && f[d]) f[d](b, a);
            });
        }function c(a, b) {
            if ("serverAuth" === b) return null;var c = b;a = a.options;"auth" === b && (a.serviceAccount || a.credential) && (c = "serverAuth", "serverAuth" in e || Z("serverAuthMissing"));return c;
        }var d = {},
            e = {},
            f = {},
            g = { __esModule: !0, initializeApp: function (a, c) {
                void 0 === c ? c = "[DEFAULT]" : "string" === typeof c && "" !== c || Z("bad-app-name", { name: c + "" });void 0 !== d[c] && Z("dupApp", { name: c });a = new X(a, c, g);d[c] = a;b(a, "create");void 0 != a.INTERNAL && void 0 != a.INTERNAL.getToken || P(a, { INTERNAL: { getToken: function () {
                            return W.resolve(null);
                        }, addAuthTokenListener: function () {}, removeAuthTokenListener: function () {} } });return a;
            }, app: a, apps: null, Promise: W, SDK_VERSION: "0.0.0", INTERNAL: { registerService: function (b, c, d, u) {
                    e[b] && Z("dupService", { name: b });e[b] = c;u && (f[b] = u);c = function (c) {
                        void 0 === c && (c = a());return c[b]();
                    };void 0 !== d && P(c, d);return g[b] = c;
                }, createFirebaseNamespace: Ja,
                extendNamespace: function (a) {
                    P(g, a);
                }, createSubscribe: Ea, ErrorFactory: U, removeApp: function (a) {
                    b(d[a], "delete");delete d[a];
                }, factories: e, useAsService: c, Promise: O, deepExtend: P } };g["default"] = g;Object.defineProperty(g, "apps", { get: function () {
                return Object.keys(d).map(function (a) {
                    return d[a];
                });
            } });a.App = X;return g;
    }function Z(a, b) {
        throw Error(Ia(a, b));
    }
    function Ia(a, b) {
        b = b || {};b = { noApp: "No Firebase App '" + b.name + "' has been created - call Firebase App.initializeApp().", "bad-app-name": "Illegal App name: '" + b.name + "'.", dupApp: "Firebase App named '" + b.name + "' already exists.", deleted: "Firebase App named '" + b.name + "' already deleted.", dupService: "Firebase Service named '" + b.name + "' already registered.", serverAuthMissing: "Initializing the Firebase SDK with a service account is only allowed in a Node.js environment. On client devices, you should instead initialize the SDK with an api key and auth domain." }[a];
        return void 0 === b ? "Application Error: (" + a + ")" : b;
    }"undefined" !== typeof firebase && (firebase = Ja());
})();
firebase.SDK_VERSION = "3.6.1";
module.exports = firebase;
});

var firebase$2=app;/*! @license Firebase v3.6.1
    Build: 3.6.1-rc.3
    Terms: https://firebase.google.com/terms/ */(function(){var h,aa=aa||{},l=this,ba=function(){},ca=function(){throw Error("unimplemented abstract method");},m=function(a){var b=typeof a;if("object"==b){if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function";}else return"null";}else if("function"==b&&"undefined"==typeof a.call)return"object";return b;},da=function(a){return null===a;},ea=function(a){return"array"==m(a);},fa=function(a){var b=m(a);return"array"==b||"object"==b&&"number"==typeof a.length;},n=function(a){return"string"==typeof a;},ga=function(a){return"number"==typeof a;},p=function(a){return"function"==m(a);},ha=function(a){var b=typeof a;return"object"==b&&null!=a||"function"==b;},ia=function(a,b,c){return a.call.apply(a.bind,arguments);},ja=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c);};}return function(){return a.apply(b,arguments);};},q=function(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ia:ja;return q.apply(null,arguments);},ka=function(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b);};},la=Date.now||function(){return+new Date();},r=function(a,b){function c(){}c.prototype=b.prototype;a.Rc=b.prototype;a.prototype=new c();a.prototype.constructor=a;a.$e=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d);};};var t=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,t);else{var b=Error().stack;b&&(this.stack=b);}a&&(this.message=String(a));};r(t,Error);t.prototype.name="CustomError";var ma=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s");},na=String.prototype.trim?function(a){return a.trim();}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"");},pa=/&/g,qa=/</g,ra=/>/g,sa=/"/g,ta=/'/g,ua=/\x00/g,va=/[\x00&<>"']/,u=function(a,b){return-1!=a.indexOf(b);},wa=function(a,b){return a<b?-1:a>b?1:0;};var xa=function(a,b){b.unshift(a);t.call(this,ma.apply(null,b));b.shift();};r(xa,t);xa.prototype.name="AssertionError";var ya=function(a,b,c,d){var e="Assertion failed";if(c)var e=e+(": "+c),f=d;else a&&(e+=": "+a,f=b);throw new xa(""+e,f||[]);},w=function(a,b,c){a||ya("",null,b,Array.prototype.slice.call(arguments,2));},za=function(a,b){throw new xa("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));},Aa=function(a,b,c){ga(a)||ya("Expected number but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,2));return a;},Ba=function(a,b,c){n(a)||ya("Expected string but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,2));},Ca=function(a,b,c){p(a)||ya("Expected function but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,2));};var Da=Array.prototype.indexOf?function(a,b,c){w(null!=a.length);return Array.prototype.indexOf.call(a,b,c);}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(n(a))return n(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1;},x=Array.prototype.forEach?function(a,b,c){w(null!=a.length);Array.prototype.forEach.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a);},Ea=function(a,b){for(var c=n(a)?a.split(""):a,d=a.length-1;0<=d;--d)d in c&&b.call(void 0,c[d],d,a);},Fa=Array.prototype.map?function(a,b,c){w(null!=a.length);return Array.prototype.map.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=Array(d),f=n(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));return e;},Ga=Array.prototype.some?function(a,b,c){w(null!=a.length);return Array.prototype.some.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;return!1;},Ia=function(a){var b;a:{b=Ha;for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a;}b=-1;}return 0>b?null:n(a)?a.charAt(b):a[b];},Ja=function(a,b){return 0<=Da(a,b);},La=function(a,b){b=Da(a,b);var c;(c=0<=b)&&Ka(a,b);return c;},Ka=function(a,b){w(null!=a.length);return 1==Array.prototype.splice.call(a,b,1).length;},Ma=function(a,b){var c=0;Ea(a,function(d,e){b.call(void 0,d,e,a)&&Ka(a,e)&&c++;});},Na=function(a){return Array.prototype.concat.apply(Array.prototype,arguments);},Oa=function(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c;}return[];};var Pa=function(a,b){for(var c in a)b.call(void 0,a[c],c,a);},Qa=function(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b;},Ra=function(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b;},Sa=function(a){for(var b in a)return!1;return!0;},Ta=function(a,b){for(var c in a)if(!(c in b)||a[c]!==b[c])return!1;for(c in b)if(!(c in a))return!1;return!0;},Ua=function(a){var b={},c;for(c in a)b[c]=a[c];return b;},Va="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),Wa=function(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<Va.length;f++)c=Va[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c]);}};var Xa;a:{var Ya=l.navigator;if(Ya){var Za=Ya.userAgent;if(Za){Xa=Za;break a;}}Xa="";}var y=function(a){return u(Xa,a);};var $a=function(a){$a[" "](a);return a;};$a[" "]=ba;var bb=function(a,b){var c=ab;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a);};var cb=y("Opera"),z=y("Trident")||y("MSIE"),db=y("Edge"),eb=db||z,fb=y("Gecko")&&!(u(Xa.toLowerCase(),"webkit")&&!y("Edge"))&&!(y("Trident")||y("MSIE"))&&!y("Edge"),gb=u(Xa.toLowerCase(),"webkit")&&!y("Edge"),hb=function(){var a=l.document;return a?a.documentMode:void 0;},ib;a:{var jb="",kb=function(){var a=Xa;if(fb)return /rv\:([^\);]+)(\)|;)/.exec(a);if(db)return /Edge\/([\d\.]+)/.exec(a);if(z)return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(gb)return /WebKit\/(\S+)/.exec(a);if(cb)return /(?:Version)[ \/]?(\S+)/.exec(a);}();kb&&(jb=kb?kb[1]:"");if(z){var lb=hb();if(null!=lb&&lb>parseFloat(jb)){ib=String(lb);break a;}}ib=jb;}var mb=ib,ab={},A=function(a){return bb(a,function(){for(var b=0,c=na(String(mb)).split("."),d=na(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",k=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];k=/(\d*)(\D*)(.*)/.exec(k)||["","","",""];if(0==g[0].length&&0==k[0].length)break;b=wa(0==g[1].length?0:parseInt(g[1],10),0==k[1].length?0:parseInt(k[1],10))||wa(0==g[2].length,0==k[2].length)||wa(g[2],k[2]);g=g[3];k=k[3];}while(0==b);}return 0<=b;});},nb;var ob=l.document;nb=ob&&z?hb()||("CSS1Compat"==ob.compatMode?parseInt(mb,10):5):void 0;var pb=null,qb=null,sb=function(a){var b="";rb(a,function(a){b+=String.fromCharCode(a);});return b;},rb=function(a,b){function c(b){for(;d<a.length;){var c=a.charAt(d++),e=qb[c];if(null!=e)return e;if(!/^[\s\xa0]*$/.test(c))throw Error("Unknown base64 encoding at char: "+c);}return b;}tb();for(var d=0;;){var e=c(-1),f=c(0),g=c(64),k=c(64);if(64===k&&-1===e)break;b(e<<2|f>>4);64!=g&&(b(f<<4&240|g>>2),64!=k&&b(g<<6&192|k));}},tb=function(){if(!pb){pb={};qb={};for(var a=0;65>a;a++)pb[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),qb[pb[a]]=a,62<=a&&(qb["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a)]=a);}};var ub=!z||9<=Number(nb),vb=z&&!A("9");!gb||A("528");fb&&A("1.9b")||z&&A("8")||cb&&A("9.5")||gb&&A("528");fb&&!A("8")||z&&A("9");var wb=function(){this.za=this.za;this.Rb=this.Rb;};wb.prototype.za=!1;wb.prototype.isDisposed=function(){return this.za;};wb.prototype.Na=function(){if(this.Rb)for(;this.Rb.length;)this.Rb.shift()();};var xb=function(a,b){this.type=a;this.currentTarget=this.target=b;this.defaultPrevented=this.Ua=!1;this.ud=!0;};xb.prototype.preventDefault=function(){this.defaultPrevented=!0;this.ud=!1;};var yb=function(a,b){xb.call(this,a?a.type:"");this.relatedTarget=this.currentTarget=this.target=null;this.charCode=this.keyCode=this.button=this.screenY=this.screenX=this.clientY=this.clientX=this.offsetY=this.offsetX=0;this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.lb=this.state=null;a&&this.init(a,b);};r(yb,xb);yb.prototype.init=function(a,b){var c=this.type=a.type,d=a.changedTouches?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.currentTarget=b;if(b=a.relatedTarget){if(fb){var e;a:{try{$a(b.nodeName);e=!0;break a;}catch(f){}e=!1;}e||(b=null);}}else"mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;null===d?(this.offsetX=gb||void 0!==a.offsetX?a.offsetX:a.layerX,this.offsetY=gb||void 0!==a.offsetY?a.offsetY:a.layerY,this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0):(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0);this.button=a.button;this.keyCode=a.keyCode||0;this.charCode=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.state=a.state;this.lb=a;a.defaultPrevented&&this.preventDefault();};yb.prototype.preventDefault=function(){yb.Rc.preventDefault.call(this);var a=this.lb;if(a.preventDefault)a.preventDefault();else if(a.returnValue=!1,vb)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1;}catch(b){}};yb.prototype.ee=function(){return this.lb;};var zb="closure_listenable_"+(1E6*Math.random()|0),Ab=0;var Bb=function(a,b,c,d,e){this.listener=a;this.Wb=null;this.src=b;this.type=c;this.capture=!!d;this.Ib=e;this.key=++Ab;this.Za=this.Cb=!1;},Cb=function(a){a.Za=!0;a.listener=null;a.Wb=null;a.src=null;a.Ib=null;};var Db=function(a){this.src=a;this.v={};this.zb=0;};Db.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.v[f];a||(a=this.v[f]=[],this.zb++);var g=Eb(a,b,d,e);-1<g?(b=a[g],c||(b.Cb=!1)):(b=new Bb(b,this.src,f,!!d,e),b.Cb=c,a.push(b));return b;};Db.prototype.remove=function(a,b,c,d){a=a.toString();if(!(a in this.v))return!1;var e=this.v[a];b=Eb(e,b,c,d);return-1<b?(Cb(e[b]),Ka(e,b),0==e.length&&(delete this.v[a],this.zb--),!0):!1;};var Fb=function(a,b){var c=b.type;c in a.v&&La(a.v[c],b)&&(Cb(b),0==a.v[c].length&&(delete a.v[c],a.zb--));};Db.prototype.vc=function(a,b,c,d){a=this.v[a.toString()];var e=-1;a&&(e=Eb(a,b,c,d));return-1<e?a[e]:null;};var Eb=function(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.Za&&f.listener==b&&f.capture==!!c&&f.Ib==d)return e;}return-1;};var Gb="closure_lm_"+(1E6*Math.random()|0),Hb={},Ib=0,Jb=function(a,b,c,d,e){if(ea(b))for(var f=0;f<b.length;f++)Jb(a,b[f],c,d,e);else c=Kb(c),a&&a[zb]?a.listen(b,c,d,e):Lb(a,b,c,!1,d,e);},Lb=function(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=!!e,k=Mb(a);k||(a[Gb]=k=new Db(a));c=k.add(b,c,d,e,f);if(!c.Wb){d=Nb();c.Wb=d;d.src=a;d.listener=c;if(a.addEventListener)a.addEventListener(b.toString(),d,g);else if(a.attachEvent)a.attachEvent(Ob(b.toString()),d);else throw Error("addEventListener and attachEvent are unavailable.");Ib++;}},Nb=function(){var a=Pb,b=ub?function(c){return a.call(b.src,b.listener,c);}:function(c){c=a.call(b.src,b.listener,c);if(!c)return c;};return b;},Qb=function(a,b,c,d,e){if(ea(b))for(var f=0;f<b.length;f++)Qb(a,b[f],c,d,e);else c=Kb(c),a&&a[zb]?Rb(a,b,c,d,e):Lb(a,b,c,!0,d,e);},Sb=function(a,b,c,d,e){if(ea(b))for(var f=0;f<b.length;f++)Sb(a,b[f],c,d,e);else c=Kb(c),a&&a[zb]?a.$.remove(String(b),c,d,e):a&&(a=Mb(a))&&(b=a.vc(b,c,!!d,e))&&Tb(b);},Tb=function(a){if(!ga(a)&&a&&!a.Za){var b=a.src;if(b&&b[zb])Fb(b.$,a);else{var c=a.type,d=a.Wb;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent&&b.detachEvent(Ob(c),d);Ib--;(c=Mb(b))?(Fb(c,a),0==c.zb&&(c.src=null,b[Gb]=null)):Cb(a);}}},Ob=function(a){return a in Hb?Hb[a]:Hb[a]="on"+a;},Vb=function(a,b,c,d){var e=!0;if(a=Mb(a))if(b=a.v[b.toString()])for(b=b.concat(),a=0;a<b.length;a++){var f=b[a];f&&f.capture==c&&!f.Za&&(f=Ub(f,d),e=e&&!1!==f);}return e;},Ub=function(a,b){var c=a.listener,d=a.Ib||a.src;a.Cb&&Tb(a);return c.call(d,b);},Pb=function(a,b){if(a.Za)return!0;if(!ub){if(!b)a:{b=["window","event"];for(var c=l,d;d=b.shift();)if(null!=c[d])c=c[d];else{b=null;break a;}b=c;}d=b;b=new yb(d,this);c=!0;if(!(0>d.keyCode||void 0!=d.returnValue)){a:{var e=!1;if(0==d.keyCode)try{d.keyCode=-1;break a;}catch(g){e=!0;}if(e||void 0==d.returnValue)d.returnValue=!0;}d=[];for(e=b.currentTarget;e;e=e.parentNode)d.push(e);a=a.type;for(e=d.length-1;!b.Ua&&0<=e;e--){b.currentTarget=d[e];var f=Vb(d[e],a,!0,b),c=c&&f;}for(e=0;!b.Ua&&e<d.length;e++)b.currentTarget=d[e],f=Vb(d[e],a,!1,b),c=c&&f;}return c;}return Ub(a,new yb(b,this));},Mb=function(a){a=a[Gb];return a instanceof Db?a:null;},Wb="__closure_events_fn_"+(1E9*Math.random()>>>0),Kb=function(a){w(a,"Listener can not be null.");if(p(a))return a;w(a.handleEvent,"An object listener must have handleEvent method.");a[Wb]||(a[Wb]=function(b){return a.handleEvent(b);});return a[Wb];};var Xb=/^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/;var Zb=function(){this.fc="";this.Md=Yb;};Zb.prototype.Lb=!0;Zb.prototype.Gb=function(){return this.fc;};Zb.prototype.toString=function(){return"Const{"+this.fc+"}";};var $b=function(a){if(a instanceof Zb&&a.constructor===Zb&&a.Md===Yb)return a.fc;za("expected object of type Const, got '"+a+"'");return"type_error:Const";},Yb={},ac=function(a){var b=new Zb();b.fc=a;return b;};ac("");var B=function(){this.ka="";this.Ld=bc;};B.prototype.Lb=!0;B.prototype.Gb=function(){return this.ka;};B.prototype.toString=function(){return"SafeUrl{"+this.ka+"}";};var cc=function(a){if(a instanceof B&&a.constructor===B&&a.Ld===bc)return a.ka;za("expected object of type SafeUrl, got '"+a+"' of type "+m(a));return"type_error:SafeUrl";},dc=/^(?:(?:https?|mailto|ftp):|[^&:/?#]*(?:[/?#]|$))/i,fc=function(a){if(a instanceof B)return a;a=a.Lb?a.Gb():String(a);dc.test(a)||(a="about:invalid#zClosurez");return ec(a);},bc={},ec=function(a){var b=new B();b.ka=a;return b;};ec("about:blank");var gc=function(a){return /^\s*$/.test(a)?!1:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,""));},hc=function(a){a=String(a);if(gc(a))try{return eval("("+a+")");}catch(b){}throw Error("Invalid JSON string: "+a);},kc=function(a){var b=[];ic(new jc(),a,b);return b.join("");},jc=function(){this.$b=void 0;},ic=function(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(ea(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),e=d[f],ic(a,a.$b?a.$b.call(d,String(f),e):e,c),e=",";c.push("]");return;}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");f="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(e=b[d],"function"!=typeof e&&(c.push(f),lc(d,c),c.push(":"),ic(a,a.$b?a.$b.call(b,d,e):e,c),f=","));c.push("}");return;}}switch(typeof b){case"string":lc(b,c);break;case"number":c.push(isFinite(b)&&!isNaN(b)?String(b):"null");break;case"boolean":c.push(String(b));break;case"function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}},mc={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},nc=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g,lc=function(a,b){b.push('"',a.replace(nc,function(a){var b=mc[a];b||(b="\\u"+(a.charCodeAt(0)|65536).toString(16).substr(1),mc[a]=b);return b;}),'"');};var oc=function(){};oc.prototype.Vc=null;oc.prototype.kb=ca;var pc=function(a){return a.Vc||(a.Vc=a.Ob());};oc.prototype.Ob=ca;var qc,rc=function(){};r(rc,oc);rc.prototype.kb=function(){var a=sc(this);return a?new ActiveXObject(a):new XMLHttpRequest();};rc.prototype.Ob=function(){var a={};sc(this)&&(a[0]=!0,a[1]=!0);return a;};var sc=function(a){if(!a.jd&&"undefined"==typeof XMLHttpRequest&&"undefined"!=typeof ActiveXObject){for(var b=["MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++){var d=b[c];try{return new ActiveXObject(d),a.jd=d;}catch(e){}}throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");}return a.jd;};qc=new rc();var tc=function(){};r(tc,oc);tc.prototype.kb=function(){var a=new XMLHttpRequest();if("withCredentials"in a)return a;if("undefined"!=typeof XDomainRequest)return new uc();throw Error("Unsupported browser");};tc.prototype.Ob=function(){return{};};var uc=function(){this.na=new XDomainRequest();this.readyState=0;this.onreadystatechange=null;this.responseText="";this.status=-1;this.statusText=this.responseXML=null;this.na.onload=q(this.ie,this);this.na.onerror=q(this.gd,this);this.na.onprogress=q(this.je,this);this.na.ontimeout=q(this.ke,this);};h=uc.prototype;h.open=function(a,b,c){if(null!=c&&!c)throw Error("Only async requests are supported.");this.na.open(a,b);};h.send=function(a){if(a){if("string"==typeof a)this.na.send(a);else throw Error("Only string data is supported");}else this.na.send();};h.abort=function(){this.na.abort();};h.setRequestHeader=function(){};h.ie=function(){this.status=200;this.responseText=this.na.responseText;vc(this,4);};h.gd=function(){this.status=500;this.responseText="";vc(this,4);};h.ke=function(){this.gd();};h.je=function(){this.status=200;vc(this,1);};var vc=function(a,b){a.readyState=b;if(a.onreadystatechange)a.onreadystatechange();};var xc=function(){this.Ub="";this.Nd=wc;};xc.prototype.Lb=!0;xc.prototype.Gb=function(){return this.Ub;};xc.prototype.toString=function(){return"TrustedResourceUrl{"+this.Ub+"}";};var wc={};var zc=function(){this.ka="";this.Kd=yc;};zc.prototype.Lb=!0;zc.prototype.Gb=function(){return this.ka;};zc.prototype.toString=function(){return"SafeHtml{"+this.ka+"}";};var Ac=function(a){if(a instanceof zc&&a.constructor===zc&&a.Kd===yc)return a.ka;za("expected object of type SafeHtml, got '"+a+"' of type "+m(a));return"type_error:SafeHtml";},yc={};zc.prototype.re=function(a){this.ka=a;return this;};!fb&&!z||z&&9<=Number(nb)||fb&&A("1.9.1");z&&A("9");var Cc=function(a,b){Pa(b,function(b,d){"style"==d?a.style.cssText=b:"class"==d?a.className=b:"for"==d?a.htmlFor=b:Bc.hasOwnProperty(d)?a.setAttribute(Bc[d],b):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,b):a[d]=b;});},Bc={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};var Dc=function(a,b,c){this.ue=c;this.Ud=a;this.Ge=b;this.Qb=0;this.Jb=null;};Dc.prototype.get=function(){var a;0<this.Qb?(this.Qb--,a=this.Jb,this.Jb=a.next,a.next=null):a=this.Ud();return a;};Dc.prototype.put=function(a){this.Ge(a);this.Qb<this.ue&&(this.Qb++,a.next=this.Jb,this.Jb=a);};var Ec=function(a){l.setTimeout(function(){throw a;},0);},Fc,Gc=function(){var a=l.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!y("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host,a=q(function(a){if(("*"==d||a.origin==d)&&a.data==c)this.port1.onmessage();},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d);}};});if("undefined"!==typeof a&&!y("Trident")&&!y("MSIE")){var b=new a(),c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.Zc;c.Zc=null;a();}};return function(a){d.next={Zc:a};d=d.next;b.port2.postMessage(0);};}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(a){var b=document.createElement("SCRIPT");b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null;};document.documentElement.appendChild(b);}:function(a){l.setTimeout(a,0);};};var Hc=function(){this.kc=this.Ia=null;},Jc=new Dc(function(){return new Ic();},function(a){a.reset();},100);Hc.prototype.add=function(a,b){var c=Jc.get();c.set(a,b);this.kc?this.kc.next=c:(w(!this.Ia),this.Ia=c);this.kc=c;};Hc.prototype.remove=function(){var a=null;this.Ia&&(a=this.Ia,this.Ia=this.Ia.next,this.Ia||(this.kc=null),a.next=null);return a;};var Ic=function(){this.next=this.scope=this.uc=null;};Ic.prototype.set=function(a,b){this.uc=a;this.scope=b;this.next=null;};Ic.prototype.reset=function(){this.next=this.scope=this.uc=null;};var Oc=function(a,b){Kc||Lc();Mc||(Kc(),Mc=!0);Nc.add(a,b);},Kc,Lc=function(){var a=l.Promise;if(-1!=String(a).indexOf("[native code]")){var b=a.resolve(void 0);Kc=function(){b.then(Pc);};}else Kc=function(){var a=Pc;!p(l.setImmediate)||l.Window&&l.Window.prototype&&!y("Edge")&&l.Window.prototype.setImmediate==l.setImmediate?(Fc||(Fc=Gc()),Fc(a)):l.setImmediate(a);};},Mc=!1,Nc=new Hc(),Pc=function(){for(var a;a=Nc.remove();){try{a.uc.call(a.scope);}catch(b){Ec(b);}Jc.put(a);}Mc=!1;};var Qc=function(a){a.prototype.then=a.prototype.then;a.prototype.$goog_Thenable=!0;},Rc=function(a){if(!a)return!1;try{return!!a.$goog_Thenable;}catch(b){return!1;}};var C=function(a,b){this.G=0;this.la=void 0;this.La=this.ga=this.m=null;this.Hb=this.tc=!1;if(a!=ba)try{var c=this;a.call(b,function(a){Sc(c,2,a);},function(a){if(!(a instanceof Tc))try{if(a instanceof Error)throw a;throw Error("Promise rejected.");}catch(e){}Sc(c,3,a);});}catch(d){Sc(this,3,d);}},Uc=function(){this.next=this.context=this.Ra=this.Da=this.child=null;this.ib=!1;};Uc.prototype.reset=function(){this.context=this.Ra=this.Da=this.child=null;this.ib=!1;};var Vc=new Dc(function(){return new Uc();},function(a){a.reset();},100),Wc=function(a,b,c){var d=Vc.get();d.Da=a;d.Ra=b;d.context=c;return d;},D=function(a){if(a instanceof C)return a;var b=new C(ba);Sc(b,2,a);return b;},E=function(a){return new C(function(b,c){c(a);});},Yc=function(a,b,c){Xc(a,b,c,null)||Oc(ka(b,a));},Zc=function(a){return new C(function(b){var c=a.length,d=[];if(c)for(var e=function(a,e,f){c--;d[a]=e?{de:!0,value:f}:{de:!1,reason:f};0==c&&b(d);},f=0,g;f<a.length;f++)g=a[f],Yc(g,ka(e,f,!0),ka(e,f,!1));else b(d);});};C.prototype.then=function(a,b,c){null!=a&&Ca(a,"opt_onFulfilled should be a function.");null!=b&&Ca(b,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?");return $c(this,p(a)?a:null,p(b)?b:null,c);};Qc(C);var bd=function(a,b){b=Wc(b,b,void 0);b.ib=!0;ad(a,b);return a;};C.prototype.h=function(a,b){return $c(this,null,a,b);};C.prototype.cancel=function(a){0==this.G&&Oc(function(){var b=new Tc(a);cd(this,b);},this);};var cd=function(a,b){if(0==a.G)if(a.m){var c=a.m;if(c.ga){for(var d=0,e=null,f=null,g=c.ga;g&&(g.ib||(d++,g.child==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(0==c.G&&1==d?cd(c,b):(f?(d=f,w(c.ga),w(null!=d),d.next==c.La&&(c.La=d),d.next=d.next.next):dd(c),ed(c,e,3,b)));}a.m=null;}else Sc(a,3,b);},ad=function(a,b){a.ga||2!=a.G&&3!=a.G||fd(a);w(null!=b.Da);a.La?a.La.next=b:a.ga=b;a.La=b;},$c=function(a,b,c,d){var e=Wc(null,null,null);e.child=new C(function(a,g){e.Da=b?function(c){try{var e=b.call(d,c);a(e);}catch(oa){g(oa);}}:a;e.Ra=c?function(b){try{var e=c.call(d,b);void 0===e&&b instanceof Tc?g(b):a(e);}catch(oa){g(oa);}}:g;});e.child.m=a;ad(a,e);return e.child;};C.prototype.Qe=function(a){w(1==this.G);this.G=0;Sc(this,2,a);};C.prototype.Re=function(a){w(1==this.G);this.G=0;Sc(this,3,a);};var Sc=function(a,b,c){0==a.G&&(a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself")),a.G=1,Xc(c,a.Qe,a.Re,a)||(a.la=c,a.G=b,a.m=null,fd(a),3!=b||c instanceof Tc||gd(a,c)));},Xc=function(a,b,c,d){if(a instanceof C)return null!=b&&Ca(b,"opt_onFulfilled should be a function."),null!=c&&Ca(c,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?"),ad(a,Wc(b||ba,c||null,d)),!0;if(Rc(a))return a.then(b,c,d),!0;if(ha(a))try{var e=a.then;if(p(e))return hd(a,e,b,c,d),!0;}catch(f){return c.call(d,f),!0;}return!1;},hd=function(a,b,c,d,e){var f=!1,g=function(a){f||(f=!0,c.call(e,a));},k=function(a){f||(f=!0,d.call(e,a));};try{b.call(a,g,k);}catch(v){k(v);}},fd=function(a){a.tc||(a.tc=!0,Oc(a.Zd,a));},dd=function(a){var b=null;a.ga&&(b=a.ga,a.ga=b.next,b.next=null);a.ga||(a.La=null);null!=b&&w(null!=b.Da);return b;};C.prototype.Zd=function(){for(var a;a=dd(this);)ed(this,a,this.G,this.la);this.tc=!1;};var ed=function(a,b,c,d){if(3==c&&b.Ra&&!b.ib)for(;a&&a.Hb;a=a.m)a.Hb=!1;if(b.child)b.child.m=null,id(b,c,d);else try{b.ib?b.Da.call(b.context):id(b,c,d);}catch(e){jd.call(null,e);}Vc.put(b);},id=function(a,b,c){2==b?a.Da.call(a.context,c):a.Ra&&a.Ra.call(a.context,c);},gd=function(a,b){a.Hb=!0;Oc(function(){a.Hb&&jd.call(null,b);});},jd=Ec,Tc=function(a){t.call(this,a);};r(Tc,t);Tc.prototype.name="cancel";/*
 Portions of this code are from MochiKit, received by
 The Closure Authors under the MIT license. All other code is Copyright
 2005-2009 The Closure Authors. All Rights Reserved.
*/var F=function(a,b){this.bc=[];this.od=a;this.bd=b||null;this.nb=this.Pa=!1;this.la=void 0;this.Pc=this.Uc=this.oc=!1;this.ic=0;this.m=null;this.pc=0;};F.prototype.cancel=function(a){if(this.Pa)this.la instanceof F&&this.la.cancel();else{if(this.m){var b=this.m;delete this.m;a?b.cancel(a):(b.pc--,0>=b.pc&&b.cancel());}this.od?this.od.call(this.bd,this):this.Pc=!0;this.Pa||kd(this,new ld());}};F.prototype.$c=function(a,b){this.oc=!1;md(this,a,b);};var md=function(a,b,c){a.Pa=!0;a.la=c;a.nb=!b;nd(a);},pd=function(a){if(a.Pa){if(!a.Pc)throw new od();a.Pc=!1;}};F.prototype.callback=function(a){pd(this);qd(a);md(this,!0,a);};var kd=function(a,b){pd(a);qd(b);md(a,!1,b);},qd=function(a){w(!(a instanceof F),"An execution sequence may not be initiated with a blocking Deferred.");},ud=function(a){var b=rd("https://apis.google.com/js/client.js?onload="+sd);td(b,null,a,void 0);},td=function(a,b,c,d){w(!a.Uc,"Blocking Deferreds can not be re-used");a.bc.push([b,c,d]);a.Pa&&nd(a);};F.prototype.then=function(a,b,c){var d,e,f=new C(function(a,b){d=a;e=b;});td(this,d,function(a){a instanceof ld?f.cancel():e(a);});return f.then(a,b,c);};Qc(F);var vd=function(a){return Ga(a.bc,function(a){return p(a[1]);});},nd=function(a){if(a.ic&&a.Pa&&vd(a)){var b=a.ic,c=wd[b];c&&(l.clearTimeout(c.ob),delete wd[b]);a.ic=0;}a.m&&(a.m.pc--,delete a.m);for(var b=a.la,d=c=!1;a.bc.length&&!a.oc;){var e=a.bc.shift(),f=e[0],g=e[1],e=e[2];if(f=a.nb?g:f)try{var k=f.call(e||a.bd,b);void 0!==k&&(a.nb=a.nb&&(k==b||k instanceof Error),a.la=b=k);if(Rc(b)||"function"===typeof l.Promise&&b instanceof l.Promise)d=!0,a.oc=!0;}catch(v){b=v,a.nb=!0,vd(a)||(c=!0);}}a.la=b;d&&(k=q(a.$c,a,!0),d=q(a.$c,a,!1),b instanceof F?(td(b,k,d),b.Uc=!0):b.then(k,d));c&&(b=new xd(b),wd[b.ob]=b,a.ic=b.ob);},od=function(){t.call(this);};r(od,t);od.prototype.message="Deferred has already fired";od.prototype.name="AlreadyCalledError";var ld=function(){t.call(this);};r(ld,t);ld.prototype.message="Deferred was canceled";ld.prototype.name="CanceledError";var xd=function(a){this.ob=l.setTimeout(q(this.Pe,this),0);this.K=a;};xd.prototype.Pe=function(){w(wd[this.ob],"Cannot throw an error that is not scheduled.");delete wd[this.ob];throw this.K;};var wd={};var rd=function(a){var b=new xc();b.Ub=a;return yd(b);},yd=function(a){var b={},c=b.document||document,d;a instanceof xc&&a.constructor===xc&&a.Nd===wc?d=a.Ub:(za("expected object of type TrustedResourceUrl, got '"+a+"' of type "+m(a)),d="type_error:TrustedResourceUrl");var e=document.createElement("SCRIPT");a={vd:e,yb:void 0};var f=new F(zd,a),g=null,k=null!=b.timeout?b.timeout:5E3;0<k&&(g=window.setTimeout(function(){Ad(e,!0);kd(f,new Bd(1,"Timeout reached for loading script "+d));},k),a.yb=g);e.onload=e.onreadystatechange=function(){e.readyState&&"loaded"!=e.readyState&&"complete"!=e.readyState||(Ad(e,b.af||!1,g),f.callback(null));};e.onerror=function(){Ad(e,!0,g);kd(f,new Bd(0,"Error while loading script "+d));};a=b.attributes||{};Wa(a,{type:"text/javascript",charset:"UTF-8",src:d});Cc(e,a);Cd(c).appendChild(e);return f;},Cd=function(a){var b;return(b=(a||document).getElementsByTagName("HEAD"))&&0!=b.length?b[0]:a.documentElement;},zd=function(){if(this&&this.vd){var a=this.vd;a&&"SCRIPT"==a.tagName&&Ad(a,!0,this.yb);}},Ad=function(a,b,c){null!=c&&l.clearTimeout(c);a.onload=ba;a.onerror=ba;a.onreadystatechange=ba;b&&window.setTimeout(function(){a&&a.parentNode&&a.parentNode.removeChild(a);},0);},Bd=function(a,b){var c="Jsloader error (code #"+a+")";b&&(c+=": "+b);t.call(this,c);this.code=a;};r(Bd,t);var G=function(){wb.call(this);this.$=new Db(this);this.Qd=this;this.Ec=null;};r(G,wb);G.prototype[zb]=!0;h=G.prototype;h.addEventListener=function(a,b,c,d){Jb(this,a,b,c,d);};h.removeEventListener=function(a,b,c,d){Sb(this,a,b,c,d);};h.dispatchEvent=function(a){Dd(this);var b,c=this.Ec;if(c){b=[];for(var d=1;c;c=c.Ec)b.push(c),w(1E3>++d,"infinite loop");}c=this.Qd;d=a.type||a;if(n(a))a=new xb(a,c);else if(a instanceof xb)a.target=a.target||c;else{var e=a;a=new xb(d,c);Wa(a,e);}var e=!0,f;if(b)for(var g=b.length-1;!a.Ua&&0<=g;g--)f=a.currentTarget=b[g],e=Ed(f,d,!0,a)&&e;a.Ua||(f=a.currentTarget=c,e=Ed(f,d,!0,a)&&e,a.Ua||(e=Ed(f,d,!1,a)&&e));if(b)for(g=0;!a.Ua&&g<b.length;g++)f=a.currentTarget=b[g],e=Ed(f,d,!1,a)&&e;return e;};h.Na=function(){G.Rc.Na.call(this);if(this.$){var a=this.$,b=0,c;for(c in a.v){for(var d=a.v[c],e=0;e<d.length;e++)++b,Cb(d[e]);delete a.v[c];a.zb--;}}this.Ec=null;};h.listen=function(a,b,c,d){Dd(this);return this.$.add(String(a),b,!1,c,d);};var Rb=function(a,b,c,d,e){a.$.add(String(b),c,!0,d,e);},Ed=function(a,b,c,d){b=a.$.v[String(b)];if(!b)return!0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.Za&&g.capture==c){var k=g.listener,v=g.Ib||g.src;g.Cb&&Fb(a.$,g);e=!1!==k.call(v,d)&&e;}}return e&&0!=d.ud;};G.prototype.vc=function(a,b,c,d){return this.$.vc(String(a),b,c,d);};var Dd=function(a){w(a.$,"Event target is not initialized. Did you call the superclass (goog.events.EventTarget) constructor?");};var Fd="StopIteration"in l?l.StopIteration:{message:"StopIteration",stack:""},Gd=function(){};Gd.prototype.next=function(){throw Fd;};Gd.prototype.Pd=function(){return this;};var H=function(a,b){this.aa={};this.s=[];this.hb=this.l=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1]);}else a&&this.addAll(a);};H.prototype.V=function(){Hd(this);for(var a=[],b=0;b<this.s.length;b++)a.push(this.aa[this.s[b]]);return a;};H.prototype.ia=function(){Hd(this);return this.s.concat();};H.prototype.jb=function(a){return Id(this.aa,a);};H.prototype.remove=function(a){return Id(this.aa,a)?(delete this.aa[a],this.l--,this.hb++,this.s.length>2*this.l&&Hd(this),!0):!1;};var Hd=function(a){if(a.l!=a.s.length){for(var b=0,c=0;b<a.s.length;){var d=a.s[b];Id(a.aa,d)&&(a.s[c++]=d);b++;}a.s.length=c;}if(a.l!=a.s.length){for(var e={},c=b=0;b<a.s.length;)d=a.s[b],Id(e,d)||(a.s[c++]=d,e[d]=1),b++;a.s.length=c;}};h=H.prototype;h.get=function(a,b){return Id(this.aa,a)?this.aa[a]:b;};h.set=function(a,b){Id(this.aa,a)||(this.l++,this.s.push(a),this.hb++);this.aa[a]=b;};h.addAll=function(a){var b;a instanceof H?(b=a.ia(),a=a.V()):(b=Ra(a),a=Qa(a));for(var c=0;c<b.length;c++)this.set(b[c],a[c]);};h.forEach=function(a,b){for(var c=this.ia(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this);}};h.clone=function(){return new H(this);};h.Pd=function(a){Hd(this);var b=0,c=this.hb,d=this,e=new Gd();e.next=function(){if(c!=d.hb)throw Error("The map has changed since the iterator was created");if(b>=d.s.length)throw Fd;var e=d.s[b++];return a?e:d.aa[e];};return e;};var Id=function(a,b){return Object.prototype.hasOwnProperty.call(a,b);};var Jd=function(a){if(a.V&&"function"==typeof a.V)return a.V();if(n(a))return a.split("");if(fa(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b;}return Qa(a);},Kd=function(a){if(a.ia&&"function"==typeof a.ia)return a.ia();if(!a.V||"function"!=typeof a.V){if(fa(a)||n(a)){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b;}return Ra(a);}},Ld=function(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(fa(a)||n(a))x(a,b,void 0);else for(var c=Kd(a),d=Jd(a),e=d.length,f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a);};var Md=function(a,b,c,d,e){this.reset(a,b,c,d,e);};Md.prototype.dd=null;var Nd=0;Md.prototype.reset=function(a,b,c,d,e){"number"==typeof e||Nd++;d||la();this.rb=a;this.ze=b;delete this.dd;};Md.prototype.yd=function(a){this.rb=a;};var Od=function(a){this.Ae=a;this.hd=this.qc=this.rb=this.m=null;},Pd=function(a,b){this.name=a;this.value=b;};Pd.prototype.toString=function(){return this.name;};var Qd=new Pd("SEVERE",1E3),Rd=new Pd("CONFIG",700),Sd=new Pd("FINE",500);Od.prototype.getParent=function(){return this.m;};Od.prototype.yd=function(a){this.rb=a;};var Td=function(a){if(a.rb)return a.rb;if(a.m)return Td(a.m);za("Root logger has no level set.");return null;};Od.prototype.log=function(a,b,c){if(a.value>=Td(this).value)for(p(b)&&(b=b()),a=new Md(a,String(b),this.Ae),c&&(a.dd=c),c="log:"+a.ze,l.console&&(l.console.timeStamp?l.console.timeStamp(c):l.console.markTimeline&&l.console.markTimeline(c)),l.msWriteProfilerMark&&l.msWriteProfilerMark(c),c=this;c;){b=c;var d=a;if(b.hd)for(var e=0,f;f=b.hd[e];e++)f(d);c=c.getParent();}};var Ud={},Vd=null,Wd=function(a){Vd||(Vd=new Od(""),Ud[""]=Vd,Vd.yd(Rd));var b;if(!(b=Ud[a])){b=new Od(a);var c=a.lastIndexOf("."),d=a.substr(c+1),c=Wd(a.substr(0,c));c.qc||(c.qc={});c.qc[d]=b;b.m=c;Ud[a]=b;}return b;};var I=function(a,b){a&&a.log(Sd,b,void 0);};var Xd=function(a,b,c){if(p(a))c&&(a=q(a,c));else if(a&&"function"==typeof a.handleEvent)a=q(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:l.setTimeout(a,b||0);},Yd=function(a){var b=null;return new C(function(c,d){b=Xd(function(){c(void 0);},a);-1==b&&d(Error("Failed to schedule timer."));}).h(function(a){l.clearTimeout(b);throw a;});};var Zd=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/,$d=function(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e,f=null;0<=d?(e=a[c].substring(0,d),f=a[c].substring(d+1)):e=a[c];b(e,f?decodeURIComponent(f.replace(/\+/g," ")):"");}}};var J=function(a){G.call(this);this.headers=new H();this.mc=a||null;this.oa=!1;this.lc=this.b=null;this.qb=this.md=this.Pb="";this.Ba=this.yc=this.Mb=this.sc=!1;this.eb=0;this.hc=null;this.td="";this.jc=this.Fe=this.Gd=!1;};r(J,G);var ae=J.prototype,be=Wd("goog.net.XhrIo");ae.R=be;var ce=/^https?$/i,de=["POST","PUT"];J.prototype.send=function(a,b,c,d){if(this.b)throw Error("[goog.net.XhrIo] Object is active with another request="+this.Pb+"; newUri="+a);b=b?b.toUpperCase():"GET";this.Pb=a;this.qb="";this.md=b;this.sc=!1;this.oa=!0;this.b=this.mc?this.mc.kb():qc.kb();this.lc=this.mc?pc(this.mc):pc(qc);this.b.onreadystatechange=q(this.qd,this);this.Fe&&"onprogress"in this.b&&(this.b.onprogress=q(function(a){this.pd(a,!0);},this),this.b.upload&&(this.b.upload.onprogress=q(this.pd,this)));try{I(this.R,ee(this,"Opening Xhr")),this.yc=!0,this.b.open(b,String(a),!0),this.yc=!1;}catch(f){I(this.R,ee(this,"Error opening Xhr: "+f.message));this.K(5,f);return;}a=c||"";var e=this.headers.clone();d&&Ld(d,function(a,b){e.set(b,a);});d=Ia(e.ia());c=l.FormData&&a instanceof l.FormData;!Ja(de,b)||d||c||e.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");e.forEach(function(a,b){this.b.setRequestHeader(b,a);},this);this.td&&(this.b.responseType=this.td);"withCredentials"in this.b&&this.b.withCredentials!==this.Gd&&(this.b.withCredentials=this.Gd);try{fe(this),0<this.eb&&(this.jc=ge(this.b),I(this.R,ee(this,"Will abort after "+this.eb+"ms if incomplete, xhr2 "+this.jc)),this.jc?(this.b.timeout=this.eb,this.b.ontimeout=q(this.yb,this)):this.hc=Xd(this.yb,this.eb,this)),I(this.R,ee(this,"Sending request")),this.Mb=!0,this.b.send(a),this.Mb=!1;}catch(f){I(this.R,ee(this,"Send error: "+f.message)),this.K(5,f);}};var ge=function(a){return z&&A(9)&&ga(a.timeout)&&void 0!==a.ontimeout;},Ha=function(a){return"content-type"==a.toLowerCase();};J.prototype.yb=function(){"undefined"!=typeof aa&&this.b&&(this.qb="Timed out after "+this.eb+"ms, aborting",I(this.R,ee(this,this.qb)),this.dispatchEvent("timeout"),this.abort(8));};J.prototype.K=function(a,b){this.oa=!1;this.b&&(this.Ba=!0,this.b.abort(),this.Ba=!1);this.qb=b;he(this);ie(this);};var he=function(a){a.sc||(a.sc=!0,a.dispatchEvent("complete"),a.dispatchEvent("error"));};J.prototype.abort=function(){this.b&&this.oa&&(I(this.R,ee(this,"Aborting")),this.oa=!1,this.Ba=!0,this.b.abort(),this.Ba=!1,this.dispatchEvent("complete"),this.dispatchEvent("abort"),ie(this));};J.prototype.Na=function(){this.b&&(this.oa&&(this.oa=!1,this.Ba=!0,this.b.abort(),this.Ba=!1),ie(this,!0));J.Rc.Na.call(this);};J.prototype.qd=function(){this.isDisposed()||(this.yc||this.Mb||this.Ba?je(this):this.De());};J.prototype.De=function(){je(this);};var je=function(a){if(a.oa&&"undefined"!=typeof aa)if(a.lc[1]&&4==ke(a)&&2==le(a))I(a.R,ee(a,"Local request error detected and ignored"));else if(a.Mb&&4==ke(a))Xd(a.qd,0,a);else if(a.dispatchEvent("readystatechange"),4==ke(a)){I(a.R,ee(a,"Request complete"));a.oa=!1;try{var b=le(a),c;a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:c=!0;break a;default:c=!1;}var d;if(!(d=c)){var e;if(e=0===b){var f=String(a.Pb).match(Zd)[1]||null;if(!f&&l.self&&l.self.location)var g=l.self.location.protocol,f=g.substr(0,g.length-1);e=!ce.test(f?f.toLowerCase():"");}d=e;}if(d)a.dispatchEvent("complete"),a.dispatchEvent("success");else{var k;try{k=2<ke(a)?a.b.statusText:"";}catch(v){I(a.R,"Can not get status: "+v.message),k="";}a.qb=k+" ["+le(a)+"]";he(a);}}finally{ie(a);}}};J.prototype.pd=function(a,b){w("progress"===a.type,"goog.net.EventType.PROGRESS is of the same type as raw XHR progress.");this.dispatchEvent(me(a,"progress"));this.dispatchEvent(me(a,b?"downloadprogress":"uploadprogress"));};var me=function(a,b){return{type:b,lengthComputable:a.lengthComputable,loaded:a.loaded,total:a.total};},ie=function(a,b){if(a.b){fe(a);var c=a.b,d=a.lc[0]?ba:null;a.b=null;a.lc=null;b||a.dispatchEvent("ready");try{c.onreadystatechange=d;}catch(e){(a=a.R)&&a.log(Qd,"Problem encountered resetting onreadystatechange: "+e.message,void 0);}}},fe=function(a){a.b&&a.jc&&(a.b.ontimeout=null);ga(a.hc)&&(l.clearTimeout(a.hc),a.hc=null);},ke=function(a){return a.b?a.b.readyState:0;},le=function(a){try{return 2<ke(a)?a.b.status:-1;}catch(b){return-1;}},ne=function(a){try{return a.b?a.b.responseText:"";}catch(b){return I(a.R,"Can not get responseText: "+b.message),"";}},ee=function(a,b){return b+" ["+a.md+" "+a.Pb+" "+le(a)+"]";};var oe=function(a,b){this.ha=this.Ga=this.ca="";this.Ta=null;this.Aa=this.qa="";this.N=this.te=!1;var c;a instanceof oe?(this.N=void 0!==b?b:a.N,pe(this,a.ca),c=a.Ga,K(this),this.Ga=c,qe(this,a.ha),re(this,a.Ta),se(this,a.qa),te(this,a.Y.clone()),a=a.Aa,K(this),this.Aa=a):a&&(c=String(a).match(Zd))?(this.N=!!b,pe(this,c[1]||"",!0),a=c[2]||"",K(this),this.Ga=ue(a),qe(this,c[3]||"",!0),re(this,c[4]),se(this,c[5]||"",!0),te(this,c[6]||"",!0),a=c[7]||"",K(this),this.Aa=ue(a)):(this.N=!!b,this.Y=new L(null,0,this.N));};oe.prototype.toString=function(){var a=[],b=this.ca;b&&a.push(ve(b,we,!0),":");var c=this.ha;if(c||"file"==b)a.push("//"),(b=this.Ga)&&a.push(ve(b,we,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.Ta,null!=c&&a.push(":",String(c));if(c=this.qa)this.ha&&"/"!=c.charAt(0)&&a.push("/"),a.push(ve(c,"/"==c.charAt(0)?xe:ye,!0));(c=this.Y.toString())&&a.push("?",c);(c=this.Aa)&&a.push("#",ve(c,ze));return a.join("");};oe.prototype.resolve=function(a){var b=this.clone(),c=!!a.ca;c?pe(b,a.ca):c=!!a.Ga;if(c){var d=a.Ga;K(b);b.Ga=d;}else c=!!a.ha;c?qe(b,a.ha):c=null!=a.Ta;d=a.qa;if(c)re(b,a.Ta);else if(c=!!a.qa){if("/"!=d.charAt(0))if(this.ha&&!this.qa)d="/"+d;else{var e=b.qa.lastIndexOf("/");-1!=e&&(d=b.qa.substr(0,e+1)+d);}e=d;if(".."==e||"."==e)d="";else if(u(e,"./")||u(e,"/.")){for(var d=0==e.lastIndexOf("/",0),e=e.split("/"),f=[],g=0;g<e.length;){var k=e[g++];"."==k?d&&g==e.length&&f.push(""):".."==k?((1<f.length||1==f.length&&""!=f[0])&&f.pop(),d&&g==e.length&&f.push("")):(f.push(k),d=!0);}d=f.join("/");}else d=e;}c?se(b,d):c=""!==a.Y.toString();c?te(b,a.Y.clone()):c=!!a.Aa;c&&(a=a.Aa,K(b),b.Aa=a);return b;};oe.prototype.clone=function(){return new oe(this);};var pe=function(a,b,c){K(a);a.ca=c?ue(b,!0):b;a.ca&&(a.ca=a.ca.replace(/:$/,""));},qe=function(a,b,c){K(a);a.ha=c?ue(b,!0):b;},re=function(a,b){K(a);if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.Ta=b;}else a.Ta=null;},se=function(a,b,c){K(a);a.qa=c?ue(b,!0):b;},te=function(a,b,c){K(a);b instanceof L?(a.Y=b,a.Y.Oc(a.N)):(c||(b=ve(b,Ae)),a.Y=new L(b,0,a.N));},M=function(a,b,c){K(a);a.Y.set(b,c);},Be=function(a,b){K(a);a.Y.remove(b);},K=function(a){if(a.te)throw Error("Tried to modify a read-only Uri");};oe.prototype.Oc=function(a){this.N=a;this.Y&&this.Y.Oc(a);return this;};var Ce=function(a){return a instanceof oe?a.clone():new oe(a,void 0);},De=function(a,b){var c=new oe(null,void 0);pe(c,"https");a&&qe(c,a);b&&se(c,b);return c;},ue=function(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):"";},ve=function(a,b,c){return n(a)?(a=encodeURI(a).replace(b,Ee),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null;},Ee=function(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16);},we=/[#\/\?@]/g,ye=/[\#\?:]/g,xe=/[\#\?]/g,Ae=/[\#\?@]/g,ze=/#/g,L=function(a,b,c){this.l=this.g=null;this.J=a||null;this.N=!!c;},Fe=function(a){a.g||(a.g=new H(),a.l=0,a.J&&$d(a.J,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c);}));},He=function(a){var b=Kd(a);if("undefined"==typeof b)throw Error("Keys are undefined");var c=new L(null,0,void 0);a=Jd(a);for(var d=0;d<b.length;d++){var e=b[d],f=a[d];ea(f)?Ge(c,e,f):c.add(e,f);}return c;};h=L.prototype;h.add=function(a,b){Fe(this);this.J=null;a=this.M(a);var c=this.g.get(a);c||this.g.set(a,c=[]);c.push(b);this.l=Aa(this.l)+1;return this;};h.remove=function(a){Fe(this);a=this.M(a);return this.g.jb(a)?(this.J=null,this.l=Aa(this.l)-this.g.get(a).length,this.g.remove(a)):!1;};h.jb=function(a){Fe(this);a=this.M(a);return this.g.jb(a);};h.ia=function(){Fe(this);for(var a=this.g.V(),b=this.g.ia(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c;};h.V=function(a){Fe(this);var b=[];if(n(a))this.jb(a)&&(b=Na(b,this.g.get(this.M(a))));else{a=this.g.V();for(var c=0;c<a.length;c++)b=Na(b,a[c]);}return b;};h.set=function(a,b){Fe(this);this.J=null;a=this.M(a);this.jb(a)&&(this.l=Aa(this.l)-this.g.get(a).length);this.g.set(a,[b]);this.l=Aa(this.l)+1;return this;};h.get=function(a,b){a=a?this.V(a):[];return 0<a.length?String(a[0]):b;};var Ge=function(a,b,c){a.remove(b);0<c.length&&(a.J=null,a.g.set(a.M(b),Oa(c)),a.l=Aa(a.l)+c.length);};L.prototype.toString=function(){if(this.J)return this.J;if(!this.g)return"";for(var a=[],b=this.g.ia(),c=0;c<b.length;c++)for(var d=b[c],e=encodeURIComponent(String(d)),d=this.V(d),f=0;f<d.length;f++){var g=e;""!==d[f]&&(g+="="+encodeURIComponent(String(d[f])));a.push(g);}return this.J=a.join("&");};L.prototype.clone=function(){var a=new L();a.J=this.J;this.g&&(a.g=this.g.clone(),a.l=this.l);return a;};L.prototype.M=function(a){a=String(a);this.N&&(a=a.toLowerCase());return a;};L.prototype.Oc=function(a){a&&!this.N&&(Fe(this),this.J=null,this.g.forEach(function(a,c){var b=c.toLowerCase();c!=b&&(this.remove(c),Ge(this,b,a));},this));this.N=a;};var Ie=function(){var a=N();return z&&!!nb&&11==nb||/Edge\/\d+/.test(a);},Je=function(){return l.window&&l.window.location.href||"";},Ke=function(a,b){var c=[],d;for(d in a)d in b?typeof a[d]!=typeof b[d]?c.push(d):ea(a[d])?Ta(a[d],b[d])||c.push(d):"object"==typeof a[d]&&null!=a[d]&&null!=b[d]?0<Ke(a[d],b[d]).length&&c.push(d):a[d]!==b[d]&&c.push(d):c.push(d);for(d in b)d in a||c.push(d);return c;},Me=function(){var a;a=N();a="Chrome"!=Le(a)?null:(a=a.match(/\sChrome\/(\d+)/i))&&2==a.length?parseInt(a[1],10):null;return a&&30>a?!1:!z||!nb||9<nb;},Ne=function(a){a=(a||N()).toLowerCase();return a.match(/android/)||a.match(/webos/)||a.match(/iphone|ipad|ipod/)||a.match(/blackberry/)||a.match(/windows phone/)||a.match(/iemobile/)?!0:!1;},Oe=function(a){a=a||l.window;try{a.close();}catch(b){}},Pe=function(a,b,c){var d=Math.floor(1E9*Math.random()).toString();b=b||500;c=c||600;var e=(window.screen.availHeight-c)/2,f=(window.screen.availWidth-b)/2;b={width:b,height:c,top:0<e?e:0,left:0<f?f:0,location:!0,resizable:!0,statusbar:!0,toolbar:!1};c=N().toLowerCase();d&&(b.target=d,u(c,"crios/")&&(b.target="_blank"));"Firefox"==Le(N())&&(a=a||"http://localhost",b.scrollbars=!0);var g;c=a||"about:blank";(d=b)||(d={});a=window;b=c instanceof B?c:fc("undefined"!=typeof c.href?c.href:String(c));c=d.target||c.target;e=[];for(g in d)switch(g){case"width":case"height":case"top":case"left":e.push(g+"="+d[g]);break;case"target":case"noreferrer":break;default:e.push(g+"="+(d[g]?1:0));}g=e.join(",");(y("iPhone")&&!y("iPod")&&!y("iPad")||y("iPad")||y("iPod"))&&a.navigator&&a.navigator.standalone&&c&&"_self"!=c?(g=a.document.createElement("A"),"undefined"!=typeof HTMLAnchorElement&&"undefined"!=typeof Location&&"undefined"!=typeof Element&&(e=g&&(g instanceof HTMLAnchorElement||!(g instanceof Location||g instanceof Element)),f=ha(g)?g.constructor.displayName||g.constructor.name||Object.prototype.toString.call(g):void 0===g?"undefined":null===g?"null":typeof g,w(e,"Argument is not a HTMLAnchorElement (or a non-Element mock); got: %s",f)),b=b instanceof B?b:fc(b),g.href=cc(b),g.setAttribute("target",c),d.noreferrer&&g.setAttribute("rel","noreferrer"),d=document.createEvent("MouseEvent"),d.initMouseEvent("click",!0,!0,a,1),g.dispatchEvent(d),g={}):d.noreferrer?(g=a.open("",c,g),d=cc(b),g&&(eb&&u(d,";")&&(d="'"+d.replace(/'/g,"%27")+"'"),g.opener=null,a=ac("b/12014412, meta tag with sanitized URL"),va.test(d)&&(-1!=d.indexOf("&")&&(d=d.replace(pa,"&amp;")),-1!=d.indexOf("<")&&(d=d.replace(qa,"&lt;")),-1!=d.indexOf(">")&&(d=d.replace(ra,"&gt;")),-1!=d.indexOf('"')&&(d=d.replace(sa,"&quot;")),-1!=d.indexOf("'")&&(d=d.replace(ta,"&#39;")),-1!=d.indexOf("\x00")&&(d=d.replace(ua,"&#0;"))),d='<META HTTP-EQUIV="refresh" content="0; url='+d+'">',Ba($b(a),"must provide justification"),w(!/^[\s\xa0]*$/.test($b(a)),"must provide non-empty justification"),g.document.write(Ac(new zc().re(d))),g.document.close())):g=a.open(cc(b),c,g);if(g)try{g.focus();}catch(k){}return g;},Qe=function(a){return new C(function(b){var c=function(){Yd(2E3).then(function(){if(!a||a.closed)b();else return c();});};return c();});},Re=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Se=function(){var a=null;return new C(function(b){"complete"==l.document.readyState?b():(a=function(){b();},Qb(window,"load",a));}).h(function(b){Sb(window,"load",a);throw b;});},O=function(a){switch(a||l.navigator&&l.navigator.product||""){case"ReactNative":return"ReactNative";default:return"undefined"!==typeof l.process?"Node":"Browser";}},Te=function(){var a=O();return"ReactNative"===a||"Node"===a;},Le=function(a){var b=a.toLowerCase();if(u(b,"opera/")||u(b,"opr/")||u(b,"opios/"))return"Opera";if(u(b,"iemobile"))return"IEMobile";if(u(b,"msie")||u(b,"trident/"))return"IE";if(u(b,"edge/"))return"Edge";if(u(b,"firefox/"))return"Firefox";if(u(b,"silk/"))return"Silk";if(u(b,"blackberry"))return"Blackberry";if(u(b,"webos"))return"Webos";if(!u(b,"safari/")||u(b,"chrome/")||u(b,"crios/")||u(b,"android")){if(!u(b,"chrome/")&&!u(b,"crios/")||u(b,"edge/")){if(u(b,"android"))return"Android";if((a=a.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/))&&2==a.length)return a[1];}else return"Chrome";}else return"Safari";return"Other";},Ue=function(a){var b=O(void 0);return("Browser"===b?Le(N()):b)+"/JsCore/"+a;},N=function(){return l.navigator&&l.navigator.userAgent||"";},Ve=function(a){a=a.split(".");for(var b=l,c=0;c<a.length&&"object"==typeof b&&null!=b;c++)b=b[a[c]];c!=a.length&&(b=void 0);return b;},Xe=function(){var a;if(!(a=!l.location||!l.location.protocol||"http:"!=l.location.protocol&&"https:"!=l.location.protocol||Te())){var b;a:{try{var c=l.localStorage,d=We();if(c){c.setItem(d,"1");c.removeItem(d);b=Ie()?!!l.indexedDB:!0;break a;}}catch(e){}b=!1;}a=!b;}return!a;},Ye=function(a){a=a||N();return Ne(a)||"Firefox"==Le(a)?!1:!0;},Ze=function(a){return"undefined"===typeof a?null:kc(a);},$e=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&null!==a[c]&&void 0!==a[c]&&(b[c]=a[c]);return b;},af=function(a){if(null!==a){var b;try{b=hc(a);}catch(c){try{b=JSON.parse(a);}catch(d){throw c;}}return b;}},We=function(a){return a?a:""+Math.floor(1E9*Math.random()).toString();},bf=function(a){a=a||N();return"Safari"==Le(a)||a.toLowerCase().match(/iphone|ipad|ipod/)?!1:!0;},cf=function(){var a=l.___jsl;if(a&&a.H)for(var b in a.H)if(a.H[b].r=a.H[b].r||[],a.H[b].L=a.H[b].L||[],a.H[b].r=a.H[b].L.concat(),a.CP)for(var c=0;c<a.CP.length;c++)a.CP[c]=null;},df=function(a,b,c,d){if(a>b)throw Error("Short delay should be less than long delay!");this.Me=a;this.ye=b;a=d||O();this.se=Ne(c||N())||"ReactNative"===a;};df.prototype.get=function(){return this.se?this.ye:this.Me;};var ef;try{var ff={};Object.defineProperty(ff,"abcd",{configurable:!0,enumerable:!0,value:1});Object.defineProperty(ff,"abcd",{configurable:!0,enumerable:!0,value:2});ef=2==ff.abcd;}catch(a){ef=!1;}var P=function(a,b,c){ef?Object.defineProperty(a,b,{configurable:!0,enumerable:!0,value:c}):a[b]=c;},gf=function(a,b){if(b)for(var c in b)b.hasOwnProperty(c)&&P(a,c,b[c]);},hf=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b;},jf=function(a,b){if(!b||!b.length)return!0;if(!a)return!1;for(var c=0;c<b.length;c++){var d=a[b[c]];if(void 0===d||null===d||""===d)return!1;}return!0;},kf=function(a){var b=a;if("object"==typeof a&&null!=a){var b="length"in a?[]:{},c;for(c in a)P(b,c,kf(a[c]));}return b;};var lf=["client_id","response_type","scope","redirect_uri","state"],mf={Hd:{ub:500,tb:600,providerId:"facebook.com",ac:lf},Id:{ub:500,tb:620,providerId:"github.com",ac:lf},Jd:{ub:515,tb:680,providerId:"google.com",ac:lf},Od:{ub:485,tb:705,providerId:"twitter.com",ac:"oauth_consumer_key oauth_nonce oauth_signature oauth_signature_method oauth_timestamp oauth_token oauth_version".split(" ")}},nf=function(a){for(var b in mf)if(mf[b].providerId==a)return mf[b];return null;},of=function(a){return(a=nf(a))&&a.ac||[];};var Q=function(a,b){this.code="auth/"+a;this.message=b||pf[a]||"";};r(Q,Error);Q.prototype.I=function(){return{name:this.code,code:this.code,message:this.message};};var pf={"argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","email-already-in-use":"The email address is already in use by another account.","expired-action-code":"The action code has expired. ","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal error has occurred.","invalid-user-token":"The user's credential is no longer valid. The user must sign in again.","invalid-auth-event":"An internal error has occurred.","invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-email":"The email address is badly formatted.","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-credential":"The supplied auth credential is malformed or has expired.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","missing-iframe-start":"An internal error has occurred.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","app-deleted":"This instance of FirebaseApp has been deleted.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network error (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal error has occurred.","no-such-provider":"User was not linked to an account with the given provider.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http or https and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","user-cancelled":"User did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled."};var qf=function(a,b,c,d,e){this.wa=a;this.U=b||null;this.gb=c||null;this.cc=d||null;this.K=e||null;if(this.gb||this.K){if(this.gb&&this.K)throw new Q("invalid-auth-event");if(this.gb&&!this.cc)throw new Q("invalid-auth-event");}else throw new Q("invalid-auth-event");};qf.prototype.getError=function(){return this.K;};qf.prototype.I=function(){return{type:this.wa,eventId:this.U,urlResponse:this.gb,sessionId:this.cc,error:this.K&&this.K.I()};};var rf=function(a){var b="unauthorized-domain",c=void 0,d=Ce(a);a=d.ha;d=d.ca;"http"!=d&&"https"!=d?b="operation-not-supported-in-this-environment":c=ma("This domain (%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a);Q.call(this,b,c);};r(rf,Q);var sf=function(a){this.xe=a.sub;la();this.Db=a.email||null;};var tf=function(a,b,c,d){var e={};ha(c)?e=c:b&&n(c)&&n(d)?e={oauthToken:c,oauthTokenSecret:d}:!b&&n(c)&&(e={accessToken:c});if(b||!e.idToken&&!e.accessToken){if(b&&e.oauthToken&&e.oauthTokenSecret)P(this,"accessToken",e.oauthToken),P(this,"secret",e.oauthTokenSecret);else{if(b)throw new Q("argument-error","credential failed: expected 2 arguments (the OAuth access token and secret).");throw new Q("argument-error","credential failed: expected 1 argument (the OAuth access token).");}}else e.idToken&&P(this,"idToken",e.idToken),e.accessToken&&P(this,"accessToken",e.accessToken);P(this,"provider",a);};tf.prototype.Fb=function(a){return uf(a,vf(this));};tf.prototype.nd=function(a,b){var c=vf(this);c.idToken=b;return wf(a,c);};var vf=function(a){var b={};a.idToken&&(b.id_token=a.idToken);a.accessToken&&(b.access_token=a.accessToken);a.secret&&(b.oauth_token_secret=a.secret);b.providerId=a.provider;return{postBody:He(b).toString(),requestUri:Xe()?Je():"http://localhost"};};tf.prototype.I=function(){var a={provider:this.provider};this.idToken&&(a.oauthIdToken=this.idToken);this.accessToken&&(a.oauthAccessToken=this.accessToken);this.secret&&(a.oauthTokenSecret=this.secret);return a;};var xf=function(a,b,c){var d=!!b,e=c||[];b=function(){gf(this,{providerId:a,isOAuthProvider:!0});this.Nc=[];this.ad={};"google.com"==a&&this.addScope("profile");};d||(b.prototype.addScope=function(a){Ja(this.Nc,a)||this.Nc.push(a);});b.prototype.setCustomParameters=function(a){this.ad=Ua(a);};b.prototype.fe=function(){var a=$e(this.ad),b;for(b in a)a[b]=a[b].toString();a=Ua(a);for(b=0;b<e.length;b++){var c=e[b];c in a&&delete a[c];}return a;};b.prototype.ge=function(){return Oa(this.Nc);};b.credential=function(b,c){return new tf(a,d,b,c);};gf(b,{PROVIDER_ID:a});return b;},yf=xf("facebook.com",!1,of("facebook.com"));yf.prototype.addScope=yf.prototype.addScope||void 0;var zf=xf("github.com",!1,of("github.com"));zf.prototype.addScope=zf.prototype.addScope||void 0;var Af=xf("google.com",!1,of("google.com"));Af.prototype.addScope=Af.prototype.addScope||void 0;Af.credential=function(a,b){if(!a&&!b)throw new Q("argument-error","credential failed: must provide the ID token and/or the access token.");return new tf("google.com",!1,ha(a)?a:{idToken:a||null,accessToken:b||null});};var Bf=xf("twitter.com",!0,of("twitter.com")),Cf=function(a,b){this.Db=a;this.Fc=b;P(this,"provider","password");};Cf.prototype.Fb=function(a){return R(a,Df,{email:this.Db,password:this.Fc});};Cf.prototype.nd=function(a,b){return R(a,Ef,{idToken:b,email:this.Db,password:this.Fc});};Cf.prototype.I=function(){return{email:this.Db,password:this.Fc};};var Ff=function(){gf(this,{providerId:"password",isOAuthProvider:!1});};gf(Ff,{PROVIDER_ID:"password"});var Gf={Ze:Ff,Hd:yf,Jd:Af,Id:zf,Od:Bf},Hf=function(a){var b=a&&a.providerId;if(!b)return null;var c=a&&a.oauthAccessToken,d=a&&a.oauthTokenSecret;a=a&&a.oauthIdToken;for(var e in Gf)if(Gf[e].PROVIDER_ID==b)try{return Gf[e].credential({accessToken:c,idToken:a,oauthToken:c,oauthTokenSecret:d});}catch(f){break;}return null;};var If=function(a,b,c,d){Q.call(this,a,d);P(this,"email",b);P(this,"credential",c);};r(If,Q);If.prototype.I=function(){var a={code:this.code,message:this.message,email:this.email},b=this.credential&&this.credential.I();b&&(Wa(a,b),a.providerId=b.provider,delete a.provider);return a;};var Jf=function(a){if(a.code){var b=a.code||"";0==b.indexOf("auth/")&&(b=b.substring(5));return a.email?new If(b,a.email,Hf(a),a.message):new Q(b,a.message||void 0);}return null;};var Kf=function(a){this.Ye=a;};r(Kf,oc);Kf.prototype.kb=function(){return new this.Ye();};Kf.prototype.Ob=function(){return{};};var S=function(a,b,c){var d;d="Node"==O();d=l.XMLHttpRequest||d&&firebase$2.INTERNAL.node&&firebase$2.INTERNAL.node.XMLHttpRequest;if(!d)throw new Q("internal-error","The XMLHttpRequest compatibility library was not found.");this.i=a;a=b||{};this.Ie=a.secureTokenEndpoint||"https://securetoken.googleapis.com/v1/token";this.Je=a.secureTokenTimeout||Lf;this.wd=Ua(a.secureTokenHeaders||Mf);this.be=a.firebaseEndpoint||"https://www.googleapis.com/identitytoolkit/v3/relyingparty/";this.ce=a.firebaseTimeout||Nf;this.fd=Ua(a.firebaseHeaders||Of);c&&(this.fd["X-Client-Version"]=c,this.wd["X-Client-Version"]=c);this.Td=new tc();this.Xe=new Kf(d);},Pf,Lf=new df(1E4,3E4),Mf={"Content-Type":"application/x-www-form-urlencoded"},Nf=new df(1E4,3E4),Of={"Content-Type":"application/json"},Rf=function(a,b,c,d,e,f,g){Me()?a=q(a.Le,a):(Pf||(Pf=new C(function(a,b){Qf(a,b);})),a=q(a.Ke,a));a(b,c,d,e,f,g);};S.prototype.Le=function(a,b,c,d,e,f){var g="Node"==O(),k=Te()?g?new J(this.Xe):new J():new J(this.Td),v;f&&(k.eb=Math.max(0,f),v=setTimeout(function(){k.dispatchEvent("timeout");},f));k.listen("complete",function(){v&&clearTimeout(v);var a=null;try{var c;c=this.b?hc(this.b.responseText):void 0;a=c||null;}catch(Ei){try{a=JSON.parse(ne(this))||null;}catch(Fi){a=null;}}b&&b(a);});Rb(k,"ready",function(){v&&clearTimeout(v);this.za||(this.za=!0,this.Na());});Rb(k,"timeout",function(){v&&clearTimeout(v);this.za||(this.za=!0,this.Na());b&&b(null);});k.send(a,c,d,e);};var sd="__fcb"+Math.floor(1E6*Math.random()).toString(),Qf=function(a,b){((window.gapi||{}).client||{}).request?a():(l[sd]=function(){((window.gapi||{}).client||{}).request?a():b(Error("CORS_UNSUPPORTED"));},ud(function(){b(Error("CORS_UNSUPPORTED"));}));};S.prototype.Ke=function(a,b,c,d,e){var f=this;Pf.then(function(){window.gapi.client.setApiKey(f.i);var g=window.gapi.auth.getToken();window.gapi.auth.setToken(null);window.gapi.client.request({path:a,method:c,body:d,headers:e,authType:"none",callback:function(a){window.gapi.auth.setToken(g);b&&b(a);}});}).h(function(a){b&&b({error:{message:a&&a.message||"CORS_UNSUPPORTED"}});});};var Tf=function(a,b){return new C(function(c,d){"refresh_token"==b.grant_type&&b.refresh_token||"authorization_code"==b.grant_type&&b.code?Rf(a,a.Ie+"?key="+encodeURIComponent(a.i),function(a){a?a.error?d(Sf(a)):a.access_token&&a.refresh_token?c(a):d(new Q("internal-error")):d(new Q("network-request-failed"));},"POST",He(b).toString(),a.wd,a.Je.get()):d(new Q("internal-error"));});},Uf=function(a,b,c,d,e){var f=a.be+b+"?key="+encodeURIComponent(a.i);e&&(f+="&cb="+la().toString());return new C(function(b,e){Rf(a,f,function(a){a?a.error?e(Sf(a)):b(a):e(new Q("network-request-failed"));},c,kc($e(d)),a.fd,a.ce.get());});},Vf=function(a){if(!Xb.test(a.email))throw new Q("invalid-email");},Wf=function(a){"email"in a&&Vf(a);},Yf=function(a,b){var c=Xe()?Je():"http://localhost";return R(a,Xf,{identifier:b,continueUri:c}).then(function(a){return a.allProviders||[];});},$f=function(a){return R(a,Zf,{}).then(function(a){return a.authorizedDomains||[];});},ag=function(a){if(!a.idToken)throw new Q("internal-error");};S.prototype.signInAnonymously=function(){return R(this,bg,{});};S.prototype.updateEmail=function(a,b){return R(this,cg,{idToken:a,email:b});};S.prototype.updatePassword=function(a,b){return R(this,Ef,{idToken:a,password:b});};var dg={displayName:"DISPLAY_NAME",photoUrl:"PHOTO_URL"};S.prototype.updateProfile=function(a,b){var c={idToken:a},d=[];Pa(dg,function(a,f){var e=b[f];null===e?d.push(a):f in b&&(c[f]=e);});d.length&&(c.deleteAttribute=d);return R(this,cg,c);};S.prototype.sendPasswordResetEmail=function(a){return R(this,eg,{requestType:"PASSWORD_RESET",email:a});};S.prototype.sendEmailVerification=function(a){return R(this,fg,{requestType:"VERIFY_EMAIL",idToken:a});};var hg=function(a,b,c){return R(a,gg,{idToken:b,deleteProvider:c});},ig=function(a){if(!a.requestUri||!a.sessionId&&!a.postBody)throw new Q("internal-error");},jg=function(a){var b=null;a.needConfirmation?(a.code="account-exists-with-different-credential",b=Jf(a)):"FEDERATED_USER_ID_ALREADY_LINKED"==a.errorMessage?(a.code="credential-already-in-use",b=Jf(a)):"EMAIL_EXISTS"==a.errorMessage&&(a.code="email-already-in-use",b=Jf(a));if(b)throw b;if(!a.idToken)throw new Q("internal-error");},uf=function(a,b){b.returnIdpCredential=!0;return R(a,kg,b);},wf=function(a,b){b.returnIdpCredential=!0;return R(a,lg,b);},mg=function(a){if(!a.oobCode)throw new Q("invalid-action-code");};S.prototype.confirmPasswordReset=function(a,b){return R(this,ng,{oobCode:a,newPassword:b});};S.prototype.checkActionCode=function(a){return R(this,og,{oobCode:a});};S.prototype.applyActionCode=function(a){return R(this,pg,{oobCode:a});};var pg={endpoint:"setAccountInfo",F:mg,bb:"email"},og={endpoint:"resetPassword",F:mg,ua:function(a){if(!a.email||!a.requestType)throw new Q("internal-error");}},qg={endpoint:"signupNewUser",F:function(a){Vf(a);if(!a.password)throw new Q("weak-password");},ua:ag,va:!0},Xf={endpoint:"createAuthUri"},rg={endpoint:"deleteAccount",$a:["idToken"]},gg={endpoint:"setAccountInfo",$a:["idToken","deleteProvider"],F:function(a){if(!ea(a.deleteProvider))throw new Q("internal-error");}},sg={endpoint:"getAccountInfo"},fg={endpoint:"getOobConfirmationCode",$a:["idToken","requestType"],F:function(a){if("VERIFY_EMAIL"!=a.requestType)throw new Q("internal-error");},bb:"email"},eg={endpoint:"getOobConfirmationCode",$a:["requestType"],F:function(a){if("PASSWORD_RESET"!=a.requestType)throw new Q("internal-error");Vf(a);},bb:"email"},Zf={Sd:!0,endpoint:"getProjectConfig",ne:"GET"},ng={endpoint:"resetPassword",F:mg,bb:"email"},cg={endpoint:"setAccountInfo",$a:["idToken"],F:Wf,va:!0},Ef={endpoint:"setAccountInfo",$a:["idToken"],F:function(a){Wf(a);if(!a.password)throw new Q("weak-password");},ua:ag,va:!0},bg={endpoint:"signupNewUser",ua:ag,va:!0},kg={endpoint:"verifyAssertion",F:ig,ua:jg,va:!0},lg={endpoint:"verifyAssertion",F:function(a){ig(a);if(!a.idToken)throw new Q("internal-error");},ua:jg,va:!0},tg={endpoint:"verifyCustomToken",F:function(a){if(!a.token)throw new Q("invalid-custom-token");},ua:ag,va:!0},Df={endpoint:"verifyPassword",F:function(a){Vf(a);if(!a.password)throw new Q("wrong-password");},ua:ag,va:!0},R=function(a,b,c){if(!jf(c,b.$a))return E(new Q("internal-error"));var d=b.ne||"POST",e;return D(c).then(b.F).then(function(){b.va&&(c.returnSecureToken=!0);return Uf(a,b.endpoint,d,c,b.Sd||!1);}).then(function(a){return e=a;}).then(b.ua).then(function(){if(!b.bb)return e;if(!(b.bb in e))throw new Q("internal-error");return e[b.bb];});},Sf=function(a){var b,c;c=(a.error&&a.error.errors&&a.error.errors[0]||{}).reason||"";var d={keyInvalid:"invalid-api-key",ipRefererBlocked:"app-not-authorized"};if(c=d[c]?new Q(d[c]):null)return c;c=a.error&&a.error.message||"";d={INVALID_CUSTOM_TOKEN:"invalid-custom-token",CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_EMAIL:"invalid-email",INVALID_PASSWORD:"wrong-password",USER_DISABLED:"user-disabled",MISSING_PASSWORD:"internal-error",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",EMAIL_NOT_FOUND:"user-not-found",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",CORS_UNSUPPORTED:"cors-unsupported",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",WEAK_PASSWORD:"weak-password",OPERATION_NOT_ALLOWED:"operation-not-allowed",USER_CANCELLED:"user-cancelled"};b=(b=c.match(/^[^\s]+\s*:\s*(.*)$/))&&1<b.length?b[1]:void 0;for(var e in d)if(0===c.indexOf(e))return new Q(d[e],b);!b&&a&&(b=Ze(a));return new Q("internal-error",b);};var ug=function(a){this.S=a;};ug.prototype.value=function(){return this.S;};ug.prototype.zd=function(a){this.S.style=a;return this;};var vg=function(a){this.S=a||{};};vg.prototype.value=function(){return this.S;};vg.prototype.zd=function(a){this.S.style=a;return this;};var xg=function(a){this.We=a;this.Kb=null;this.Cc=wg(this);};xg.prototype.Dc=function(){return this.Cc;};var yg=function(a){var b=new vg();b.S.where=document.body;b.S.url=a.We;b.S.messageHandlersFilter=Ve("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER");b.S.attributes=b.S.attributes||{};new ug(b.S.attributes).zd({position:"absolute",top:"-100px",width:"1px",height:"1px"});b.S.dontclear=!0;return b;},wg=function(a){return zg().then(function(){return new C(function(b,c){Ve("gapi.iframes.getContext")().open(yg(a).value(),function(d){a.Kb=d;a.Kb.restyle({setHideOnLeave:!1});var e=setTimeout(function(){c(Error("Network Error"));},Ag.get()),f=function(){clearTimeout(e);b();};d.ping(f).then(f,function(){c(Error("Network Error"));});});});});};xg.prototype.sendMessage=function(a){var b=this;return this.Cc.then(function(){return new C(function(c){b.Kb.send(a.type,a,c,Ve("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"));});});};var Bg=function(a,b){a.Cc.then(function(){a.Kb.register("authEvent",b,Ve("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"));});},Cg=new df(3E3,15E3),Ag=new df(5E3,15E3),zg=function(){return new C(function(a,b){var c=function(){cf();Ve("gapi.load")("gapi.iframes",{callback:a,ontimeout:function(){cf();b(Error("Network Error"));},timeout:Cg.get()});};if(Ve("gapi.iframes.Iframe"))a();else if(Ve("gapi.load"))c();else{var d="__iframefcb"+Math.floor(1E6*Math.random()).toString();l[d]=function(){Ve("gapi.load")?c():b(Error("Network Error"));};D(rd("https://apis.google.com/js/api.js?onload="+d)).h(function(){b(Error("Network Error"));});}});};var Dg=function(a,b,c){this.A=a;this.i=b;this.C=c;this.Ha=null;this.o=De(this.A,"/__/auth/iframe");M(this.o,"apiKey",this.i);M(this.o,"appName",this.C);};Dg.prototype.setVersion=function(a){this.Ha=a;return this;};Dg.prototype.toString=function(){this.Ha?M(this.o,"v",this.Ha):Be(this.o,"v");return this.o.toString();};var Eg=function(a,b,c,d,e){this.A=a;this.i=b;this.C=c;this.Rd=d;this.Ha=this.U=this.Lc=null;this.Vb=e;this.o=De(this.A,"/__/auth/handler");M(this.o,"apiKey",this.i);M(this.o,"appName",this.C);M(this.o,"authType",this.Rd);};Eg.prototype.setVersion=function(a){this.Ha=a;return this;};Eg.prototype.toString=function(){if(this.Vb.isOAuthProvider){M(this.o,"providerId",this.Vb.providerId);var a=this.Vb.ge();a&&a.length&&M(this.o,"scopes",a.join(","));a=this.Vb.fe();Sa(a)||M(this.o,"customParameters",Ze(a));}this.Lc?M(this.o,"redirectUrl",this.Lc):Be(this.o,"redirectUrl");this.U?M(this.o,"eventId",this.U):Be(this.o,"eventId");this.Ha?M(this.o,"v",this.Ha):Be(this.o,"v");return this.o.toString();};var Gg=function(a,b,c,d){this.A=a;this.i=b;this.C=c;d=this.ya=d||null;this.oe=new Dg(a,b,c).setVersion(d).toString();this.xc=new xg(this.oe);this.Ab=[];Fg(this);};Gg.prototype.Dc=function(){return this.xc.Dc();};var Hg=function(a,b,c,d,e,f,g,k){a=new Eg(a,b,c,d,e);a.Lc=f;a.U=g;return a.setVersion(k).toString();},Fg=function(a){Bg(a.xc,function(b){var c={};if(b&&b.authEvent){var d=!1;b=b.authEvent||{};if(b.type){if(c=b.error)var e=(c=b.error)&&(c.name||c.code),c=e?new Q(e.substring(5),c.message):null;b=new qf(b.type,b.eventId,b.urlResponse,b.sessionId,c);}else b=null;for(c=0;c<a.Ab.length;c++)d=a.Ab[c](b)||d;c={};c.status=d?"ACK":"ERROR";return D(c);}c.status="ERROR";return D(c);});},Ig=function(a){return a.xc.sendMessage({type:"webStorageSupport"}).then(function(a){if(a&&a.length&&"undefined"!==typeof a[0].webStorageSupport)return a[0].webStorageSupport;throw Error();});},Jg=function(a,b){Ma(a.Ab,function(a){return a==b;});};var Kg=function(a){this.u=a||firebase$2.INTERNAL.reactNative&&firebase$2.INTERNAL.reactNative.AsyncStorage;if(!this.u)throw new Q("internal-error","The React Native compatibility library was not found.");};h=Kg.prototype;h.get=function(a){return D(this.u.getItem(a)).then(function(a){return a&&af(a);});};h.set=function(a,b){return D(this.u.setItem(a,Ze(b)));};h.remove=function(a){return D(this.u.removeItem(a));};h.Ja=function(){};h.Ya=function(){};var Lg=function(){this.u={};};h=Lg.prototype;h.get=function(a){return D(this.u[a]);};h.set=function(a,b){this.u[a]=b;return D();};h.remove=function(a){delete this.u[a];return D();};h.Ja=function(){};h.Ya=function(){};var Ng=function(){if(!Mg()){if("Node"==O())throw new Q("internal-error","The LocalStorage compatibility library was not found.");throw new Q("web-storage-unsupported");}this.u=l.localStorage||firebase$2.INTERNAL.node.localStorage;},Mg=function(){var a="Node"==O(),a=l.localStorage||a&&firebase$2.INTERNAL.node&&firebase$2.INTERNAL.node.localStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0;}catch(b){return!1;}};h=Ng.prototype;h.get=function(a){var b=this;return D().then(function(){var c=b.u.getItem(a);return af(c);});};h.set=function(a,b){var c=this;return D().then(function(){var d=Ze(b);null===d?c.remove(a):c.u.setItem(a,d);});};h.remove=function(a){var b=this;return D().then(function(){b.u.removeItem(a);});};h.Ja=function(a){l.window&&Jb(l.window,"storage",a);};h.Ya=function(a){l.window&&Sb(l.window,"storage",a);};var Og=function(){this.u={};};h=Og.prototype;h.get=function(){return D(null);};h.set=function(){return D();};h.remove=function(){return D();};h.Ja=function(){};h.Ya=function(){};var Qg=function(){if(!Pg()){if("Node"==O())throw new Q("internal-error","The SessionStorage compatibility library was not found.");throw new Q("web-storage-unsupported");}this.u=l.sessionStorage||firebase$2.INTERNAL.node.sessionStorage;},Pg=function(){var a="Node"==O(),a=l.sessionStorage||a&&firebase$2.INTERNAL.node&&firebase$2.INTERNAL.node.sessionStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0;}catch(b){return!1;}};h=Qg.prototype;h.get=function(a){var b=this;return D().then(function(){var c=b.u.getItem(a);return af(c);});};h.set=function(a,b){var c=this;return D().then(function(){var d=Ze(b);null===d?c.remove(a):c.u.setItem(a,d);});};h.remove=function(a){var b=this;return D().then(function(){b.u.removeItem(a);});};h.Ja=function(){};h.Ya=function(){};var Rg=function(a,b,c,d,e,f){if(!window.indexedDB)throw new Q("web-storage-unsupported");this.Vd=a;this.Bc=b;this.rc=c;this.Fd=d;this.hb=e;this.P={};this.wb=[];this.sb=0;this.pe=f||l.indexedDB;},Sg,Tg=function(a){return new C(function(b,c){var d=a.pe.open(a.Vd,a.hb);d.onerror=function(a){c(Error(a.target.errorCode));};d.onupgradeneeded=function(b){b=b.target.result;try{b.createObjectStore(a.Bc,{keyPath:a.rc});}catch(f){c(f);}};d.onsuccess=function(a){b(a.target.result);};});},Ug=function(a){a.kd||(a.kd=Tg(a));return a.kd;},Vg=function(a,b){return b.objectStore(a.Bc);},Wg=function(a,b,c){return b.transaction([a.Bc],c?"readwrite":"readonly");},Xg=function(a){return new C(function(b,c){a.onsuccess=function(a){a&&a.target?b(a.target.result):b();};a.onerror=function(a){c(Error(a.target.errorCode));};});};h=Rg.prototype;h.set=function(a,b){var c=!1,d,e=this;return bd(Ug(this).then(function(b){d=b;b=Vg(e,Wg(e,d,!0));return Xg(b.get(a));}).then(function(f){var g=Vg(e,Wg(e,d,!0));if(f)return f.value=b,Xg(g.put(f));e.sb++;c=!0;f={};f[e.rc]=a;f[e.Fd]=b;return Xg(g.add(f));}).then(function(){e.P[a]=b;}),function(){c&&e.sb--;});};h.get=function(a){var b=this;return Ug(this).then(function(c){return Xg(Vg(b,Wg(b,c,!1)).get(a));}).then(function(a){return a&&a.value;});};h.remove=function(a){var b=!1,c=this;return bd(Ug(this).then(function(d){b=!0;c.sb++;return Xg(Vg(c,Wg(c,d,!0))["delete"](a));}).then(function(){delete c.P[a];}),function(){b&&c.sb--;});};h.Oe=function(){var a=this;return Ug(this).then(function(b){var c=Vg(a,Wg(a,b,!1));return c.getAll?Xg(c.getAll()):new C(function(a,b){var d=[],e=c.openCursor();e.onsuccess=function(b){(b=b.target.result)?(d.push(b.value),b["continue"]()):a(d);};e.onerror=function(a){b(Error(a.target.errorCode));};});}).then(function(b){var c={},d=[];if(0==a.sb){for(d=0;d<b.length;d++)c[b[d][a.rc]]=b[d][a.Fd];d=Ke(a.P,c);a.P=c;}return d;});};h.Ja=function(a){0==this.wb.length&&this.Qc();this.wb.push(a);};h.Ya=function(a){Ma(this.wb,function(b){return b==a;});0==this.wb.length&&this.ec();};h.Qc=function(){var a=this;this.ec();var b=function(){a.Hc=Yd(800).then(q(a.Oe,a)).then(function(b){0<b.length&&x(a.wb,function(a){a(b);});}).then(b).h(function(a){"STOP_EVENT"!=a.message&&b();});return a.Hc;};b();};h.ec=function(){this.Hc&&this.Hc.cancel("STOP_EVENT");};var ah=function(){this.cd={Browser:Yg,Node:Zg,ReactNative:$g}[O()];},bh,Yg={X:Ng,Sc:Qg},Zg={X:Ng,Sc:Qg},$g={X:Kg,Sc:Og};var ch=function(a){var b={},c=a.email,d=a.newEmail;a=a.requestType;if(!c||!a)throw Error("Invalid provider user info!");b.fromEmail=d||null;b.email=c;P(this,"operation",a);P(this,"data",kf(b));};var dh="First Second Third Fourth Fifth Sixth Seventh Eighth Ninth".split(" "),T=function(a,b){return{name:a||"",ea:"a valid string",optional:!!b,fa:n};},U=function(a){return{name:a||"",ea:"a valid object",optional:!1,fa:ha};},eh=function(a,b){return{name:a||"",ea:"a function",optional:!!b,fa:p};},fh=function(){return{name:"",ea:"null",optional:!1,fa:da};},gh=function(){return{name:"credential",ea:"a valid credential",optional:!1,fa:function(a){return!(!a||!a.Fb);}};},hh=function(){return{name:"authProvider",ea:"a valid Auth provider",optional:!1,fa:function(a){return!!(a&&a.providerId&&a.hasOwnProperty&&a.hasOwnProperty("isOAuthProvider"));}};},ih=function(a,b,c,d){return{name:c||"",ea:a.ea+" or "+b.ea,optional:!!d,fa:function(c){return a.fa(c)||b.fa(c);}};};var kh=function(a,b){for(var c in b){var d=b[c].name;a[d]=jh(d,a[c],b[c].a);}},V=function(a,b,c,d){a[b]=jh(b,c,d);},jh=function(a,b,c){if(!c)return b;var d=lh(a);a=function(){var a=Array.prototype.slice.call(arguments),e;a:{e=Array.prototype.slice.call(a);var k;k=0;for(var v=!1,oa=0;oa<c.length;oa++)if(c[oa].optional)v=!0;else{if(v)throw new Q("internal-error","Argument validator encountered a required argument after an optional argument.");k++;}v=c.length;if(e.length<k||v<e.length)e="Expected "+(k==v?1==k?"1 argument":k+" arguments":k+"-"+v+" arguments")+" but got "+e.length+".";else{for(k=0;k<e.length;k++)if(v=c[k].optional&&void 0===e[k],!c[k].fa(e[k])&&!v){e=c[k];if(0>k||k>=dh.length)throw new Q("internal-error","Argument validator received an unsupported number of arguments.");e=dh[k]+" argument "+(e.name?'"'+e.name+'" ':"")+"must be "+e.ea+".";break a;}e=null;}}if(e)throw new Q("argument-error",d+" failed: "+e);return b.apply(this,a);};for(var e in b)a[e]=b[e];for(e in b.prototype)a.prototype[e]=b.prototype[e];return a;},lh=function(a){a=a.split(".");return a[a.length-1];};var mh=function(a,b,c,d){this.Be=a;this.xd=b;this.He=c;this.cb=d;this.O={};bh||(bh=new ah());a=bh;try{var e;Ie()?(Sg||(Sg=new Rg("firebaseLocalStorageDb","firebaseLocalStorage","fbase_key","value",1)),e=Sg):e=new a.cd.X();this.Sa=e;}catch(f){this.Sa=new Lg(),this.cb=!0;}try{this.gc=new a.cd.Sc();}catch(f){this.gc=new Lg();}this.Ad=q(this.Bd,this);this.P={};},nh,oh=function(){nh||(nh=new mh("firebase",":",!bf(N())&&l.window&&l.window!=l.window.top?!0:!1,Ye()));return nh;};h=mh.prototype;h.M=function(a,b){return this.Be+this.xd+a.name+(b?this.xd+b:"");};h.get=function(a,b){return(a.X?this.Sa:this.gc).get(this.M(a,b));};h.remove=function(a,b){b=this.M(a,b);a.X&&!this.cb&&(this.P[b]=null);return(a.X?this.Sa:this.gc).remove(b);};h.set=function(a,b,c){var d=this.M(a,c),e=this,f=a.X?this.Sa:this.gc;return f.set(d,b).then(function(){return f.get(d);}).then(function(b){a.X&&!this.cb&&(e.P[d]=b);});};h.addListener=function(a,b,c){a=this.M(a,b);this.cb||(this.P[a]=l.localStorage.getItem(a));Sa(this.O)&&this.Qc();this.O[a]||(this.O[a]=[]);this.O[a].push(c);};h.removeListener=function(a,b,c){a=this.M(a,b);this.O[a]&&(Ma(this.O[a],function(a){return a==c;}),0==this.O[a].length&&delete this.O[a]);Sa(this.O)&&this.ec();};h.Qc=function(){this.Sa.Ja(this.Ad);this.cb||ph(this);};var ph=function(a){qh(a);a.Ac=setInterval(function(){for(var b in a.O){var c=l.localStorage.getItem(b);c!=a.P[b]&&(a.P[b]=c,c=new yb({type:"storage",key:b,target:window,oldValue:a.P[b],newValue:c}),a.Bd(c));}},1E3);},qh=function(a){a.Ac&&(clearInterval(a.Ac),a.Ac=null);};mh.prototype.ec=function(){this.Sa.Ya(this.Ad);this.cb||qh(this);};mh.prototype.Bd=function(a){if(a&&a.ee){var b=a.lb.key;if(this.He){var c=l.localStorage.getItem(b);a=a.lb.newValue;a!=c&&(a?l.localStorage.setItem(b,a):a||l.localStorage.removeItem(b));}this.P[b]=l.localStorage.getItem(b);this.Xc(b);}else x(a,q(this.Xc,this));};mh.prototype.Xc=function(a){this.O[a]&&x(this.O[a],function(a){a();});};var rh=function(a){this.B=a;this.w=oh();},sh={name:"pendingRedirect",X:!1},th=function(a){return a.w.set(sh,"pending",a.B);},uh=function(a){return a.w.remove(sh,a.B);},vh=function(a){return a.w.get(sh,a.B).then(function(a){return"pending"==a;});};var yh=function(a,b,c){var d=this,e=(this.ya=firebase$2.SDK_VERSION||null)?Ue(this.ya):null;this.f=new S(b,null,e);this.pa=null;this.A=a;this.i=b;this.C=c;this.xb=[];this.Nb=!1;this.Tc=q(this.he,this);this.Va=new wh(this);this.rd=new xh(this);this.Gc=new rh(this.i+":"+this.C);this.fb={};this.fb.unknown=this.Va;this.fb.signInViaRedirect=this.Va;this.fb.linkViaRedirect=this.Va;this.fb.signInViaPopup=this.rd;this.fb.linkViaPopup=this.rd;this.Zb=this.ab=null;this.Sb=new C(function(a,b){d.ab=a;d.Zb=b;});};yh.prototype.reset=function(){var a=this;this.pa=null;this.Sb.cancel();this.Nb=!1;this.Zb=this.ab=null;this.pb&&Jg(this.pb,this.Tc);this.Sb=new C(function(b,c){a.ab=b;a.Zb=c;});};var zh=function(a){var b=Je();return $f(a).then(function(a){a:{var c=Ce(b),e=c.ca;if("http"==e||"https"==e)for(c=c.ha,e=0;e<a.length;e++){var f;var g=a[e];f=c;Re.test(g)?f=f==g:(g=g.split(".").join("\\."),f=new RegExp("^(.+\\."+g+"|"+g+")$","i").test(f));if(f){a=!0;break a;}}a=!1;}if(!a)throw new rf(Je());});},Ah=function(a){a.Nb||(a.Nb=!0,Se().then(function(){a.pb=new Gg(a.A,a.i,a.C,a.ya);a.pb.Dc().h(function(){a.Zb(new Q("network-request-failed"));a.reset();});a.pb.Ab.push(a.Tc);}));return a.Sb;};yh.prototype.subscribe=function(a){Ja(this.xb,a)||this.xb.push(a);if(!this.Nb){var b=this,c=function(){var a=N();Ye(a)||bf(a)||Ah(b);Bh(b.Va);};vh(this.Gc).then(function(a){a?uh(b.Gc).then(function(){Ah(b);}):c();}).h(function(){c();});}};yh.prototype.unsubscribe=function(a){Ma(this.xb,function(b){return b==a;});};yh.prototype.he=function(a){if(!a)throw new Q("invalid-auth-event");this.ab&&(this.ab(),this.ab=null);for(var b=!1,c=0;c<this.xb.length;c++){var d=this.xb[c];if(d.Yc(a.wa,a.U)){(b=this.fb[a.wa])&&b.sd(a,d);b=!0;break;}}Bh(this.Va);return b;};var Ch=new df(2E3,1E4),Dh=new df(1E4,3E4);yh.prototype.getRedirectResult=function(){return this.Va.getRedirectResult();};var Fh=function(a,b,c,d,e,f){if(!b)return E(new Q("popup-blocked"));if(f)return Ah(a),D();a.pa||(a.pa=zh(a.f));return a.pa.then(function(){return Ah(a);}).then(function(){Eh(d);var f=Hg(a.A,a.i,a.C,c,d,null,e,a.ya);(b||l.window).location.href=cc(fc(f));}).h(function(b){"auth/network-request-failed"==b.code&&(a.pa=null);throw b;});},Gh=function(a,b,c,d){a.pa||(a.pa=zh(a.f));return a.pa.then(function(){Eh(c);var e=Hg(a.A,a.i,a.C,b,c,Je(),d,a.ya);th(a.Gc).then(function(){l.window.location.href=cc(fc(e));});});},Hh=function(a,b,c,d,e){var f=new Q("popup-closed-by-user"),g=new Q("web-storage-unsupported"),k=!1;return a.Sb.then(function(){Ig(a.pb).then(function(a){a||(d&&Oe(d),b.ta(c,null,g,e),k=!0);});}).h(function(){}).then(function(){if(!k)return Qe(d);}).then(function(){if(!k)return Yd(Ch.get()).then(function(){b.ta(c,null,f,e);});});},Eh=function(a){if(!a.isOAuthProvider)throw new Q("invalid-oauth-provider");},Ih={},Jh=function(a,b,c){var d=b+":"+c;Ih[d]||(Ih[d]=new yh(a,b,c));return Ih[d];},wh=function(a){this.w=a;this.vb=this.Yb=this.Wa=this.Z=null;this.Kc=!1;};wh.prototype.sd=function(a,b){if(!a)return E(new Q("invalid-auth-event"));this.Kc=!0;var c=a.wa,d=a.U,e=a.getError()&&"auth/web-storage-unsupported"==a.getError().code;"unknown"!=c||e?a=a.K?this.Ic(a,b):b.mb(c,d)?this.Jc(a,b):E(new Q("invalid-auth-event")):(this.Z||Kh(this,!1,null,null),a=D());return a;};var Bh=function(a){a.Kc||(a.Kc=!0,Kh(a,!1,null,null));};wh.prototype.Ic=function(a){this.Z||Kh(this,!0,null,a.getError());return D();};wh.prototype.Jc=function(a,b){var c=this,d=a.wa;b=b.mb(d,a.U);var e=a.gb;a=a.cc;var f="signInViaRedirect"==d||"linkViaRedirect"==d;if(this.Z)return D();this.vb&&this.vb.cancel();return b(e,a).then(function(a){c.Z||Kh(c,f,a,null);}).h(function(a){c.Z||Kh(c,f,null,a);});};var Kh=function(a,b,c,d){b?d?(a.Z=function(){return E(d);},a.Yb&&a.Yb(d)):(a.Z=function(){return D(c);},a.Wa&&a.Wa(c)):(a.Z=function(){return D({user:null});},a.Wa&&a.Wa({user:null}));a.Wa=null;a.Yb=null;};wh.prototype.getRedirectResult=function(){var a=this;this.Wc||(this.Wc=new C(function(b,c){a.Z?a.Z().then(b,c):(a.Wa=b,a.Yb=c,Lh(a));}));return this.Wc;};var Lh=function(a){var b=new Q("timeout");a.vb&&a.vb.cancel();a.vb=Yd(Dh.get()).then(function(){a.Z||Kh(a,!0,null,b);});},xh=function(a){this.w=a;};xh.prototype.sd=function(a,b){if(!a)return E(new Q("invalid-auth-event"));var c=a.wa,d=a.U;return a.K?this.Ic(a,b):b.mb(c,d)?this.Jc(a,b):E(new Q("invalid-auth-event"));};xh.prototype.Ic=function(a,b){b.ta(a.wa,null,a.getError(),a.U);return D();};xh.prototype.Jc=function(a,b){var c=a.U,d=a.wa;return b.mb(d,c)(a.gb,a.cc).then(function(a){b.ta(d,a,null,c);}).h(function(a){b.ta(d,null,a,c);});};var Mh=function(a){this.f=a;this.xa=this.T=null;this.Oa=0;};Mh.prototype.I=function(){return{apiKey:this.f.i,refreshToken:this.T,accessToken:this.xa,expirationTime:this.Oa};};var Oh=function(a,b){var c=b.idToken,d=b.refreshToken;b=Nh(b.expiresIn);a.xa=c;a.Oa=b;a.T=d;},Nh=function(a){return la()+1E3*parseInt(a,10);},Ph=function(a,b){return Tf(a.f,b).then(function(b){a.xa=b.access_token;a.Oa=Nh(b.expires_in);a.T=b.refresh_token;return{accessToken:a.xa,expirationTime:a.Oa,refreshToken:a.T};}).h(function(b){"auth/user-token-expired"==b.code&&(a.T=null);throw b;});},Qh=function(a){return!(!a.xa||a.T);};Mh.prototype.getToken=function(a){a=!!a;return Qh(this)?E(new Q("user-token-expired")):a||!this.xa||la()>this.Oa-3E4?this.T?Ph(this,{grant_type:"refresh_token",refresh_token:this.T}):D(null):D({accessToken:this.xa,expirationTime:this.Oa,refreshToken:this.T});};var Rh=function(a,b,c,d,e){gf(this,{uid:a,displayName:d||null,photoURL:e||null,email:c||null,providerId:b});},Sh=function(a,b){xb.call(this,a);for(var c in b)this[c]=b[c];};r(Sh,xb);var W=function(a,b,c){this.W=[];this.i=a.apiKey;this.C=a.appName;this.A=a.authDomain||null;a=firebase$2.SDK_VERSION?Ue(firebase$2.SDK_VERSION):null;this.f=new S(this.i,null,a);this.da=new Mh(this.f);Th(this,b.idToken);Oh(this.da,b);P(this,"refreshToken",this.da.T);Uh(this,c||{});G.call(this);this.Tb=!1;this.A&&Xe()&&(this.j=Jh(this.A,this.i,this.C));this.dc=[];this.nc=D();};r(W,G);W.prototype.ra=function(a,b){var c=Array.prototype.slice.call(arguments,1),d=this;return this.nc=this.nc.then(function(){return a.apply(d,c);},function(){return a.apply(d,c);});};var Th=function(a,b){a.ld=b;P(a,"_lat",b);},Vh=function(a,b){Ma(a.dc,function(a){return a==b;});},Wh=function(a){for(var b=[],c=0;c<a.dc.length;c++)b.push(a.dc[c](a));return Zc(b).then(function(){return a;});},Xh=function(a){a.j&&!a.Tb&&(a.Tb=!0,a.j.subscribe(a));},Uh=function(a,b){gf(a,{uid:b.uid,displayName:b.displayName||null,photoURL:b.photoURL||null,email:b.email||null,emailVerified:b.emailVerified||!1,isAnonymous:b.isAnonymous||!1,providerData:[]});};P(W.prototype,"providerId","firebase");var Yh=function(){},Zh=function(a){return D().then(function(){if(a.Xd)throw new Q("app-deleted");});},$h=function(a){return Fa(a.providerData,function(a){return a.providerId;});},bi=function(a,b){b&&(ai(a,b.providerId),a.providerData.push(b));},ai=function(a,b){Ma(a.providerData,function(a){return a.providerId==b;});},ci=function(a,b,c){("uid"!=b||c)&&a.hasOwnProperty(b)&&P(a,b,c);};W.prototype.copy=function(a){var b=this;b!=a&&(gf(this,{uid:a.uid,displayName:a.displayName,photoURL:a.photoURL,email:a.email,emailVerified:a.emailVerified,isAnonymous:a.isAnonymous,providerData:[]}),x(a.providerData,function(a){bi(b,a);}),this.da=a.da,P(this,"refreshToken",this.da.T));};W.prototype.reload=function(){var a=this;return Zh(this).then(function(){return di(a).then(function(){return Wh(a);}).then(Yh);});};var di=function(a){return a.getToken().then(function(b){var c=a.isAnonymous;return ei(a,b).then(function(){c||ci(a,"isAnonymous",!1);return b;}).h(function(b){"auth/user-token-expired"==b.code&&(a.dispatchEvent(new Sh("userDeleted")),fi(a));throw b;});});};W.prototype.getToken=function(a){var b=this,c=Qh(this.da);return Zh(this).then(function(){return b.da.getToken(a);}).then(function(a){if(!a)throw new Q("internal-error");a.accessToken!=b.ld&&(Th(b,a.accessToken),b.Ca());ci(b,"refreshToken",a.refreshToken);return a.accessToken;}).h(function(a){if("auth/user-token-expired"==a.code&&!c)return Wh(b).then(function(){ci(b,"refreshToken",null);throw a;});throw a;});};var gi=function(a,b){b.idToken&&a.ld!=b.idToken&&(Oh(a.da,b),a.Ca(),Th(a,b.idToken),ci(a,"refreshToken",a.da.T));};W.prototype.Ca=function(){this.dispatchEvent(new Sh("tokenChanged"));};var ei=function(a,b){return R(a.f,sg,{idToken:b}).then(q(a.Ee,a));};W.prototype.Ee=function(a){a=a.users;if(!a||!a.length)throw new Q("internal-error");a=a[0];Uh(this,{uid:a.localId,displayName:a.displayName,photoURL:a.photoUrl,email:a.email,emailVerified:!!a.emailVerified});for(var b=hi(a),c=0;c<b.length;c++)bi(this,b[c]);ci(this,"isAnonymous",!(this.email&&a.passwordHash)&&!(this.providerData&&this.providerData.length));};var hi=function(a){return(a=a.providerUserInfo)&&a.length?Fa(a,function(a){return new Rh(a.rawId,a.providerId,a.email,a.displayName,a.photoUrl);}):[];};W.prototype.reauthenticate=function(a){var b=this;return this.c(a.Fb(this.f).then(function(a){var c;a:{var e=a.idToken.split(".");if(3==e.length){for(var e=e[1],f=(4-e.length%4)%4,g=0;g<f;g++)e+=".";try{var k=hc(sb(e));if(k.sub&&k.iss&&k.aud&&k.exp){c=new sf(k);break a;}}catch(v){}}c=null;}if(!c||b.uid!=c.xe)throw new Q("user-mismatch");gi(b,a);return b.reload();}));};var ii=function(a,b){return di(a).then(function(){if(Ja($h(a),b))return Wh(a).then(function(){throw new Q("provider-already-linked");});});};h=W.prototype;h.ve=function(a){var b=this;return this.c(ii(this,a.provider).then(function(){return b.getToken();}).then(function(c){return a.nd(b.f,c);}).then(q(this.ed,this)));};h.link=function(a){return this.ra(this.ve,a);};h.ed=function(a){gi(this,a);var b=this;return this.reload().then(function(){return b;});};h.Te=function(a){var b=this;return this.c(this.getToken().then(function(c){return b.f.updateEmail(c,a);}).then(function(a){gi(b,a);return b.reload();}));};h.updateEmail=function(a){return this.ra(this.Te,a);};h.Ue=function(a){var b=this;return this.c(this.getToken().then(function(c){return b.f.updatePassword(c,a);}).then(function(a){gi(b,a);return b.reload();}));};h.updatePassword=function(a){return this.ra(this.Ue,a);};h.Ve=function(a){if(void 0===a.displayName&&void 0===a.photoURL)return Zh(this);var b=this;return this.c(this.getToken().then(function(c){return b.f.updateProfile(c,{displayName:a.displayName,photoUrl:a.photoURL});}).then(function(a){gi(b,a);ci(b,"displayName",a.displayName||null);ci(b,"photoURL",a.photoUrl||null);return Wh(b);}).then(Yh));};h.updateProfile=function(a){return this.ra(this.Ve,a);};h.Se=function(a){var b=this;return this.c(di(this).then(function(c){return Ja($h(b),a)?hg(b.f,c,[a]).then(function(a){var c={};x(a.providerUserInfo||[],function(a){c[a.providerId]=!0;});x($h(b),function(a){c[a]||ai(b,a);});return Wh(b);}):Wh(b).then(function(){throw new Q("no-such-provider");});}));};h.unlink=function(a){return this.ra(this.Se,a);};h.Wd=function(){var a=this;return this.c(this.getToken().then(function(b){return R(a.f,rg,{idToken:b});}).then(function(){a.dispatchEvent(new Sh("userDeleted"));})).then(function(){fi(a);});};h["delete"]=function(){return this.ra(this.Wd);};h.Yc=function(a,b){return"linkViaPopup"==a&&(this.ja||null)==b&&this.ba||"linkViaRedirect"==a&&(this.Xb||null)==b?!0:!1;};h.ta=function(a,b,c,d){"linkViaPopup"==a&&d==(this.ja||null)&&(c&&this.Ea?this.Ea(c):b&&!c&&this.ba&&this.ba(b),this.D&&(this.D.cancel(),this.D=null),delete this.ba,delete this.Ea);};h.mb=function(a,b){return"linkViaPopup"==a&&b==(this.ja||null)||"linkViaRedirect"==a&&(this.Xb||null)==b?q(this.$d,this):null;};h.Eb=function(){return We(this.uid+":::");};var ki=function(a,b){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var c=nf(b.providerId),d=a.Eb(),e=null;!Ye()&&a.A&&b.isOAuthProvider&&(e=Hg(a.A,a.i,a.C,"linkViaPopup",b,null,d,firebase$2.SDK_VERSION||null));var f=Pe(e,c&&c.ub,c&&c.tb),c=ii(a,b.providerId).then(function(){return Wh(a);}).then(function(){ji(a);return a.getToken();}).then(function(){return Fh(a.j,f,"linkViaPopup",b,d,!!e);}).then(function(){return new C(function(b,c){a.ta("linkViaPopup",null,new Q("cancelled-popup-request"),a.ja||null);a.ba=b;a.Ea=c;a.ja=d;a.D=Hh(a.j,a,"linkViaPopup",f,d);});}).then(function(a){f&&Oe(f);return a;}).h(function(a){f&&Oe(f);throw a;});return a.c(c);};W.prototype.linkWithPopup=function(a){var b=ki(this,a);return this.ra(function(){return b;});};W.prototype.we=function(a){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var b=this,c=null,d=this.Eb(),e=ii(this,a.providerId).then(function(){ji(b);return b.getToken();}).then(function(){b.Xb=d;return Wh(b);}).then(function(a){b.Fa&&(a=b.Fa,a=a.w.set(li,b.I(),a.B));return a;}).then(function(){return Gh(b.j,"linkViaRedirect",a,d);}).h(function(a){c=a;if(b.Fa)return mi(b.Fa);throw c;}).then(function(){if(c)throw c;});return this.c(e);};W.prototype.linkWithRedirect=function(a){return this.ra(this.we,a);};var ji=function(a){if(!a.j||!a.Tb){if(a.j&&!a.Tb)throw new Q("internal-error");throw new Q("auth-domain-config-required");}};W.prototype.$d=function(a,b){var c=this;this.D&&(this.D.cancel(),this.D=null);var d=null,e=this.getToken().then(function(d){return wf(c.f,{requestUri:a,sessionId:b,idToken:d});}).then(function(a){d=Hf(a);return c.ed(a);}).then(function(a){return{user:a,credential:d};});return this.c(e);};W.prototype.sendEmailVerification=function(){var a=this;return this.c(this.getToken().then(function(b){return a.f.sendEmailVerification(b);}).then(function(b){if(a.email!=b)return a.reload();}).then(function(){}));};var fi=function(a){for(var b=0;b<a.W.length;b++)a.W[b].cancel("app-deleted");a.W=[];a.Xd=!0;P(a,"refreshToken",null);a.j&&a.j.unsubscribe(a);};W.prototype.c=function(a){var b=this;this.W.push(a);bd(a,function(){La(b.W,a);});return a;};W.prototype.toJSON=function(){return this.I();};W.prototype.I=function(){var a={uid:this.uid,displayName:this.displayName,photoURL:this.photoURL,email:this.email,emailVerified:this.emailVerified,isAnonymous:this.isAnonymous,providerData:[],apiKey:this.i,appName:this.C,authDomain:this.A,stsTokenManager:this.da.I(),redirectEventId:this.Xb||null};x(this.providerData,function(b){a.providerData.push(hf(b));});return a;};var ni=function(a){if(!a.apiKey)return null;var b={apiKey:a.apiKey,authDomain:a.authDomain,appName:a.appName},c={};if(a.stsTokenManager&&a.stsTokenManager.accessToken&&a.stsTokenManager.expirationTime)c.idToken=a.stsTokenManager.accessToken,c.refreshToken=a.stsTokenManager.refreshToken||null,c.expiresIn=(a.stsTokenManager.expirationTime-la())/1E3;else return null;var d=new W(b,c,a);a.providerData&&x(a.providerData,function(a){if(a){var b={};gf(b,a);bi(d,b);}});a.redirectEventId&&(d.Xb=a.redirectEventId);return d;},oi=function(a,b,c){var d=new W(a,b);c&&(d.Fa=c);return d.reload().then(function(){return d;});};var pi=function(a){this.B=a;this.w=oh();},li={name:"redirectUser",X:!1},mi=function(a){return a.w.remove(li,a.B);},qi=function(a,b){return a.w.get(li,a.B).then(function(a){a&&b&&(a.authDomain=b);return ni(a||{});});};var ri=function(a){this.B=a;this.w=oh();},si={name:"authUser",X:!0},ti=function(a,b){return a.w.set(si,b.I(),a.B);},ui=function(a){return a.w.remove(si,a.B);},vi=function(a,b){return a.w.get(si,a.B).then(function(a){a&&b&&(a.authDomain=b);return ni(a||{});});};var Y=function(a){this.Ma=!1;P(this,"app",a);if(X(this).options&&X(this).options.apiKey)a=firebase$2.SDK_VERSION?Ue(firebase$2.SDK_VERSION):null,this.f=new S(X(this).options&&X(this).options.apiKey,null,a);else throw new Q("invalid-api-key");this.W=[];this.Ka=[];this.Ce=firebase$2.INTERNAL.createSubscribe(q(this.qe,this));wi(this,null);this.ma=new ri(X(this).options.apiKey+":"+X(this).name);this.Xa=new pi(X(this).options.apiKey+":"+X(this).name);this.Bb=this.c(xi(this));this.sa=this.c(yi(this));this.zc=!1;this.wc=q(this.Ne,this);this.Dd=q(this.Qa,this);this.Ed=q(this.me,this);this.Cd=q(this.le,this);zi(this);this.INTERNAL={};this.INTERNAL["delete"]=q(this["delete"],this);};Y.prototype.toJSON=function(){return{apiKey:X(this).options.apiKey,authDomain:X(this).options.authDomain,appName:X(this).name,currentUser:Z(this)&&Z(this).I()};};var Ai=function(a){return a.Yd||E(new Q("auth-domain-config-required"));},zi=function(a){var b=X(a).options.authDomain,c=X(a).options.apiKey;b&&Xe()&&(a.Yd=a.Bb.then(function(){if(!a.Ma)return a.j=Jh(b,c,X(a).name),a.j.subscribe(a),Z(a)&&Xh(Z(a)),a.Mc&&(Xh(a.Mc),a.Mc=null),a.j;}));};h=Y.prototype;h.Yc=function(a,b){switch(a){case"unknown":case"signInViaRedirect":return!0;case"signInViaPopup":return this.ja==b&&!!this.ba;default:return!1;}};h.ta=function(a,b,c,d){"signInViaPopup"==a&&this.ja==d&&(c&&this.Ea?this.Ea(c):b&&!c&&this.ba&&this.ba(b),this.D&&(this.D.cancel(),this.D=null),delete this.ba,delete this.Ea);};h.mb=function(a,b){return"signInViaRedirect"==a||"signInViaPopup"==a&&this.ja==b&&this.ba?q(this.ae,this):null;};h.ae=function(a,b){var c=this;a={requestUri:a,sessionId:b};this.D&&(this.D.cancel(),this.D=null);var d=null,e=uf(c.f,a).then(function(a){d=Hf(a);return a;});a=c.Bb.then(function(){return e;}).then(function(a){return Bi(c,a);}).then(function(){return{user:Z(c),credential:d};});return this.c(a);};h.Eb=function(){return We();};h.signInWithPopup=function(a){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var b=this,c=nf(a.providerId),d=this.Eb(),e=null;!Ye()&&X(this).options.authDomain&&a.isOAuthProvider&&(e=Hg(X(this).options.authDomain,X(this).options.apiKey,X(this).name,"signInViaPopup",a,null,d,firebase$2.SDK_VERSION||null));var f=Pe(e,c&&c.ub,c&&c.tb),c=Ai(this).then(function(b){return Fh(b,f,"signInViaPopup",a,d,!!e);}).then(function(){return new C(function(a,c){b.ta("signInViaPopup",null,new Q("cancelled-popup-request"),b.ja);b.ba=a;b.Ea=c;b.ja=d;b.D=Hh(b.j,b,"signInViaPopup",f,d);});}).then(function(a){f&&Oe(f);return a;}).h(function(a){f&&Oe(f);throw a;});return this.c(c);};h.signInWithRedirect=function(a){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var b=this,c=Ai(this).then(function(){return Gh(b.j,"signInViaRedirect",a);});return this.c(c);};h.getRedirectResult=function(){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var a=this,b=Ai(this).then(function(){return a.j.getRedirectResult();});return this.c(b);};var Bi=function(a,b){var c={};c.apiKey=X(a).options.apiKey;c.authDomain=X(a).options.authDomain;c.appName=X(a).name;return a.Bb.then(function(){return oi(c,b,a.Xa);}).then(function(b){if(Z(a)&&b.uid==Z(a).uid)return Z(a).copy(b),a.Qa(b);wi(a,b);Xh(b);return a.Qa(b);}).then(function(){a.Ca();});},wi=function(a,b){Z(a)&&(Vh(Z(a),a.Dd),Sb(Z(a),"tokenChanged",a.Ed),Sb(Z(a),"userDeleted",a.Cd));b&&(b.dc.push(a.Dd),Jb(b,"tokenChanged",a.Ed),Jb(b,"userDeleted",a.Cd));P(a,"currentUser",b);};Y.prototype.signOut=function(){var a=this,b=this.sa.then(function(){if(!Z(a))return D();wi(a,null);return ui(a.ma).then(function(){a.Ca();});});return this.c(b);};var Ci=function(a){var b=qi(a.Xa,X(a).options.authDomain).then(function(b){if(a.Mc=b)b.Fa=a.Xa;return mi(a.Xa);});return a.c(b);},xi=function(a){var b=X(a).options.authDomain,c=Ci(a).then(function(){return vi(a.ma,b);}).then(function(b){return b?(b.Fa=a.Xa,b.reload().then(function(){return ti(a.ma,b).then(function(){return b;});}).h(function(c){return"auth/network-request-failed"==c.code?b:ui(a.ma);})):null;}).then(function(b){wi(a,b||null);});return a.c(c);},yi=function(a){return a.Bb.then(function(){return a.getRedirectResult();}).h(function(){}).then(function(){if(!a.Ma)return a.wc();}).h(function(){}).then(function(){if(!a.Ma){a.zc=!0;var b=a.ma;b.w.addListener(si,b.B,a.wc);}});};Y.prototype.Ne=function(){var a=this;return vi(this.ma,X(this).options.authDomain).then(function(b){if(!a.Ma){var c;if(c=Z(a)&&b){c=Z(a).uid;var d=b.uid;c=void 0===c||null===c||""===c||void 0===d||null===d||""===d?!1:c==d;}if(c)return Z(a).copy(b),Z(a).getToken();if(Z(a)||b)wi(a,b),b&&(Xh(b),b.Fa=a.Xa),a.j&&a.j.subscribe(a),a.Ca();}});};Y.prototype.Qa=function(a){return ti(this.ma,a);};Y.prototype.me=function(){this.Ca();this.Qa(Z(this));};Y.prototype.le=function(){this.signOut();};var Di=function(a,b){return a.c(b.then(function(b){return Bi(a,b);}).then(function(){return Z(a);}));};h=Y.prototype;h.qe=function(a){var b=this;this.addAuthTokenListener(function(){a.next(Z(b));});};h.onAuthStateChanged=function(a,b,c){var d=this;this.zc&&firebase$2.Promise.resolve().then(function(){p(a)?a(Z(d)):p(a.next)&&a.next(Z(d));});return this.Ce(a,b,c);};h.getToken=function(a){var b=this,c=this.sa.then(function(){return Z(b)?Z(b).getToken(a).then(function(a){return{accessToken:a};}):null;});return this.c(c);};h.signInWithCustomToken=function(a){var b=this;return this.sa.then(function(){return Di(b,R(b.f,tg,{token:a}));}).then(function(a){ci(a,"isAnonymous",!1);return b.Qa(a);}).then(function(){return Z(b);});};h.signInWithEmailAndPassword=function(a,b){var c=this;return this.sa.then(function(){return Di(c,R(c.f,Df,{email:a,password:b}));});};h.createUserWithEmailAndPassword=function(a,b){var c=this;return this.sa.then(function(){return Di(c,R(c.f,qg,{email:a,password:b}));});};h.signInWithCredential=function(a){var b=this;return this.sa.then(function(){return Di(b,a.Fb(b.f));});};h.signInAnonymously=function(){var a=Z(this),b=this;return a&&a.isAnonymous?D(a):this.sa.then(function(){return Di(b,b.f.signInAnonymously());}).then(function(a){ci(a,"isAnonymous",!0);return b.Qa(a);}).then(function(){return Z(b);});};var X=function(a){return a.app;},Z=function(a){return a.currentUser;};h=Y.prototype;h.Ca=function(){if(this.zc)for(var a=0;a<this.Ka.length;a++)if(this.Ka[a])this.Ka[a](Z(this)&&Z(this)._lat||null);};h.addAuthTokenListener=function(a){var b=this;this.Ka.push(a);this.c(this.sa.then(function(){b.Ma||Ja(b.Ka,a)&&a(Z(b)&&Z(b)._lat||null);}));};h.removeAuthTokenListener=function(a){Ma(this.Ka,function(b){return b==a;});};h["delete"]=function(){this.Ma=!0;for(var a=0;a<this.W.length;a++)this.W[a].cancel("app-deleted");this.W=[];this.ma&&(a=this.ma,a.w.removeListener(si,a.B,this.wc));this.j&&this.j.unsubscribe(this);return firebase$2.Promise.resolve();};h.c=function(a){var b=this;this.W.push(a);bd(a,function(){La(b.W,a);});return a;};h.fetchProvidersForEmail=function(a){return this.c(Yf(this.f,a));};h.verifyPasswordResetCode=function(a){return this.checkActionCode(a).then(function(a){return a.data.email;});};h.confirmPasswordReset=function(a,b){return this.c(this.f.confirmPasswordReset(a,b).then(function(){}));};h.checkActionCode=function(a){return this.c(this.f.checkActionCode(a).then(function(a){return new ch(a);}));};h.applyActionCode=function(a){return this.c(this.f.applyActionCode(a).then(function(){}));};h.sendPasswordResetEmail=function(a){return this.c(this.f.sendPasswordResetEmail(a).then(function(){}));};kh(Y.prototype,{applyActionCode:{name:"applyActionCode",a:[T("code")]},checkActionCode:{name:"checkActionCode",a:[T("code")]},confirmPasswordReset:{name:"confirmPasswordReset",a:[T("code"),T("newPassword")]},createUserWithEmailAndPassword:{name:"createUserWithEmailAndPassword",a:[T("email"),T("password")]},fetchProvidersForEmail:{name:"fetchProvidersForEmail",a:[T("email")]},getRedirectResult:{name:"getRedirectResult",a:[]},onAuthStateChanged:{name:"onAuthStateChanged",a:[ih(U(),eh(),"nextOrObserver"),eh("opt_error",!0),eh("opt_completed",!0)]},sendPasswordResetEmail:{name:"sendPasswordResetEmail",a:[T("email")]},signInAnonymously:{name:"signInAnonymously",a:[]},signInWithCredential:{name:"signInWithCredential",a:[gh()]},signInWithCustomToken:{name:"signInWithCustomToken",a:[T("token")]},signInWithEmailAndPassword:{name:"signInWithEmailAndPassword",a:[T("email"),T("password")]},signInWithPopup:{name:"signInWithPopup",a:[hh()]},signInWithRedirect:{name:"signInWithRedirect",a:[hh()]},signOut:{name:"signOut",a:[]},toJSON:{name:"toJSON",a:[T(null,!0)]},verifyPasswordResetCode:{name:"verifyPasswordResetCode",a:[T("code")]}});kh(W.prototype,{"delete":{name:"delete",a:[]},getToken:{name:"getToken",a:[{name:"opt_forceRefresh",ea:"a boolean",optional:!0,fa:function(a){return"boolean"==typeof a;}}]},link:{name:"link",a:[gh()]},linkWithPopup:{name:"linkWithPopup",a:[hh()]},linkWithRedirect:{name:"linkWithRedirect",a:[hh()]},reauthenticate:{name:"reauthenticate",a:[gh()]},reload:{name:"reload",a:[]},sendEmailVerification:{name:"sendEmailVerification",a:[]},toJSON:{name:"toJSON",a:[T(null,!0)]},unlink:{name:"unlink",a:[T("provider")]},updateEmail:{name:"updateEmail",a:[T("email")]},updatePassword:{name:"updatePassword",a:[T("password")]},updateProfile:{name:"updateProfile",a:[U("profile")]}});kh(C.prototype,{h:{name:"catch"},then:{name:"then"}});V(Ff,"credential",function(a,b){return new Cf(a,b);},[T("email"),T("password")]);kh(yf.prototype,{addScope:{name:"addScope",a:[T("scope")]},setCustomParameters:{name:"setCustomParameters",a:[U("customOAuthParameters")]}});V(yf,"credential",yf.credential,[ih(T(),U(),"token")]);kh(zf.prototype,{addScope:{name:"addScope",a:[T("scope")]},setCustomParameters:{name:"setCustomParameters",a:[U("customOAuthParameters")]}});V(zf,"credential",zf.credential,[ih(T(),U(),"token")]);kh(Af.prototype,{addScope:{name:"addScope",a:[T("scope")]},setCustomParameters:{name:"setCustomParameters",a:[U("customOAuthParameters")]}});V(Af,"credential",Af.credential,[ih(T(),ih(U(),fh()),"idToken"),ih(T(),fh(),"accessToken",!0)]);kh(Bf.prototype,{setCustomParameters:{name:"setCustomParameters",a:[U("customOAuthParameters")]}});V(Bf,"credential",Bf.credential,[ih(T(),U(),"token"),T("secret",!0)]);(function(){if("undefined"!==typeof firebase$2&&firebase$2.INTERNAL&&firebase$2.INTERNAL.registerService){var a={Auth:Y,Error:Q};V(a,"EmailAuthProvider",Ff,[]);V(a,"FacebookAuthProvider",yf,[]);V(a,"GithubAuthProvider",zf,[]);V(a,"GoogleAuthProvider",Af,[]);V(a,"TwitterAuthProvider",Bf,[]);firebase$2.INTERNAL.registerService("auth",function(a,c){a=new Y(a);c({INTERNAL:{getToken:q(a.getToken,a),addAuthTokenListener:q(a.addAuthTokenListener,a),removeAuthTokenListener:q(a.removeAuthTokenListener,a)}});return a;},a,function(a,c){if("create"===a)try{c.auth();}catch(d){}});firebase$2.INTERNAL.extendNamespace({User:W});}else throw Error("Cannot find the firebase namespace; be sure to include firebase-app.js before this library.");})();})();

var firebase$3=app;/*! @license Firebase v3.6.1
    Build: 3.6.1-rc.3
    Terms: https://firebase.google.com/terms/

    ---

    typedarray.js
    Copyright (c) 2010, Linden Research, Inc.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */(function(){var g,aa=this;function n(a){return void 0!==a;}function ba(){}function ca(a){a.Vb=function(){return a.Ye?a.Ye:a.Ye=new a();};}function da(a){var b=typeof a;if("object"==b){if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function";}else return"null";}else if("function"==b&&"undefined"==typeof a.call)return"object";return b;}function ea(a){return"array"==da(a);}function fa(a){var b=da(a);return"array"==b||"object"==b&&"number"==typeof a.length;}function p(a){return"string"==typeof a;}function ga(a){return"number"==typeof a;}function ha(a){return"function"==da(a);}function ia(a){var b=typeof a;return"object"==b&&null!=a||"function"==b;}function ja(a,b,c){return a.call.apply(a.bind,arguments);}function ka(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c);};}return function(){return a.apply(b,arguments);};}function q(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ja:ka;return q.apply(null,arguments);}function la(a,b){function c(){}c.prototype=b.prototype;a.wg=b.prototype;a.prototype=new c();a.prototype.constructor=a;a.sg=function(a,c,f){for(var h=Array(arguments.length-2),k=2;k<arguments.length;k++)h[k-2]=arguments[k];return b.prototype[c].apply(a,h);};}function ma(){this.Wa=-1;}function na(){this.Wa=-1;this.Wa=64;this.M=[];this.Ud=[];this.Af=[];this.xd=[];this.xd[0]=128;for(var a=1;a<this.Wa;++a)this.xd[a]=0;this.Nd=this.$b=0;this.reset();}la(na,ma);na.prototype.reset=function(){this.M[0]=1732584193;this.M[1]=4023233417;this.M[2]=2562383102;this.M[3]=271733878;this.M[4]=3285377520;this.Nd=this.$b=0;};function oa(a,b,c){c||(c=0);var d=a.Af;if(p(b))for(var e=0;16>e;e++)d[e]=b.charCodeAt(c)<<24|b.charCodeAt(c+1)<<16|b.charCodeAt(c+2)<<8|b.charCodeAt(c+3),c+=4;else for(e=0;16>e;e++)d[e]=b[c]<<24|b[c+1]<<16|b[c+2]<<8|b[c+3],c+=4;for(e=16;80>e;e++){var f=d[e-3]^d[e-8]^d[e-14]^d[e-16];d[e]=(f<<1|f>>>31)&4294967295;}b=a.M[0];c=a.M[1];for(var h=a.M[2],k=a.M[3],l=a.M[4],m,e=0;80>e;e++)40>e?20>e?(f=k^c&(h^k),m=1518500249):(f=c^h^k,m=1859775393):60>e?(f=c&h|k&(c|h),m=2400959708):(f=c^h^k,m=3395469782),f=(b<<5|b>>>27)+f+l+m+d[e]&4294967295,l=k,k=h,h=(c<<30|c>>>2)&4294967295,c=b,b=f;a.M[0]=a.M[0]+b&4294967295;a.M[1]=a.M[1]+c&4294967295;a.M[2]=a.M[2]+h&4294967295;a.M[3]=a.M[3]+k&4294967295;a.M[4]=a.M[4]+l&4294967295;}na.prototype.update=function(a,b){if(null!=a){n(b)||(b=a.length);for(var c=b-this.Wa,d=0,e=this.Ud,f=this.$b;d<b;){if(0==f)for(;d<=c;)oa(this,a,d),d+=this.Wa;if(p(a))for(;d<b;){if(e[f]=a.charCodeAt(d),++f,++d,f==this.Wa){oa(this,e);f=0;break;}}else for(;d<b;)if(e[f]=a[d],++f,++d,f==this.Wa){oa(this,e);f=0;break;}}this.$b=f;this.Nd+=b;}};function r(a,b){for(var c in a)b.call(void 0,a[c],c,a);}function pa(a,b){var c={},d;for(d in a)c[d]=b.call(void 0,a[d],d,a);return c;}function qa(a,b){for(var c in a)if(!b.call(void 0,a[c],c,a))return!1;return!0;}function ra(a){var b=0,c;for(c in a)b++;return b;}function sa(a){for(var b in a)return b;}function ta(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b;}function ua(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b;}function va(a,b){for(var c in a)if(a[c]==b)return!0;return!1;}function wa(a,b,c){for(var d in a)if(b.call(c,a[d],d,a))return d;}function xa(a,b){var c=wa(a,b,void 0);return c&&a[c];}function ya(a){for(var b in a)return!1;return!0;}function za(a){var b={},c;for(c in a)b[c]=a[c];return b;}function Aa(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")");}catch(b){}throw Error("Invalid JSON string: "+a);}function Ba(){this.Dd=void 0;}function Ca(a,b,c){switch(typeof b){case"string":Da(b,c);break;case"number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case"boolean":c.push(b);break;case"undefined":c.push("null");break;case"object":if(null==b){c.push("null");break;}if(ea(b)){var d=b.length;c.push("[");for(var e="",f=0;f<d;f++)c.push(e),e=b[f],Ca(a,a.Dd?a.Dd.call(b,String(f),e):e,c),e=",";c.push("]");break;}c.push("{");d="";for(f in b)Object.prototype.hasOwnProperty.call(b,f)&&(e=b[f],"function"!=typeof e&&(c.push(d),Da(f,c),c.push(":"),Ca(a,a.Dd?a.Dd.call(b,f,e):e,c),d=","));c.push("}");break;case"function":break;default:throw Error("Unknown type: "+typeof b);}}var Ea={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Fa=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;function Da(a,b){b.push('"',a.replace(Fa,function(a){if(a in Ea)return Ea[a];var b=a.charCodeAt(0),e="\\u";16>b?e+="000":256>b?e+="00":4096>b&&(e+="0");return Ea[a]=e+b.toString(16);}),'"');}var t;a:{var Ga=aa.navigator;if(Ga){var Ha=Ga.userAgent;if(Ha){t=Ha;break a;}}t="";}var v=Array.prototype,Ia=v.indexOf?function(a,b,c){return v.indexOf.call(a,b,c);}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(p(a))return p(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1;},Ja=v.forEach?function(a,b,c){v.forEach.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a);},Ka=v.filter?function(a,b,c){return v.filter.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=[],f=0,h=p(a)?a.split(""):a,k=0;k<d;k++)if(k in h){var l=h[k];b.call(c,l,k,a)&&(e[f++]=l);}return e;},La=v.map?function(a,b,c){return v.map.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=Array(d),f=p(a)?a.split(""):a,h=0;h<d;h++)h in f&&(e[h]=b.call(c,f[h],h,a));return e;},Ma=v.reduce?function(a,b,c,d){for(var e=[],f=1,h=arguments.length;f<h;f++)e.push(arguments[f]);d&&(e[0]=q(b,d));return v.reduce.apply(a,e);}:function(a,b,c,d){var e=c;Ja(a,function(c,h){e=b.call(d,e,c,h,a);});return e;},Na=v.every?function(a,b,c){return v.every.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&!b.call(c,e[f],f,a))return!1;return!0;};function Oa(a,b){var c=Pa(a,b,void 0);return 0>c?null:p(a)?a.charAt(c):a[c];}function Pa(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return f;return-1;}function Qa(a,b){var c=Ia(a,b);0<=c&&v.splice.call(a,c,1);}function Ra(a,b,c){return 2>=arguments.length?v.slice.call(a,b):v.slice.call(a,b,c);}function Sa(a,b){a.sort(b||Ta);}function Ta(a,b){return a>b?1:a<b?-1:0;}var Ua=-1!=t.indexOf("Opera")||-1!=t.indexOf("OPR"),Va=-1!=t.indexOf("Trident")||-1!=t.indexOf("MSIE"),Wa=-1!=t.indexOf("Gecko")&&-1==t.toLowerCase().indexOf("webkit")&&!(-1!=t.indexOf("Trident")||-1!=t.indexOf("MSIE")),Xa=-1!=t.toLowerCase().indexOf("webkit");(function(){var a="",b;if(Ua&&aa.opera)return a=aa.opera.version,ha(a)?a():a;Wa?b=/rv\:([^\);]+)(\)|;)/:Va?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:Xa&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(t))?a[1]:"");return Va&&(b=(b=aa.document)?b.documentMode:void 0,b>parseFloat(a))?String(b):a;})();var Ya=null,Za=null,$a=null;function ab(a,b){if(!fa(a))throw Error("encodeByteArray takes an array as a parameter");bb();for(var c=b?Za:Ya,d=[],e=0;e<a.length;e+=3){var f=a[e],h=e+1<a.length,k=h?a[e+1]:0,l=e+2<a.length,m=l?a[e+2]:0,u=f>>2,f=(f&3)<<4|k>>4,k=(k&15)<<2|m>>6,m=m&63;l||(m=64,h||(k=64));d.push(c[u],c[f],c[k],c[m]);}return d.join("");}function bb(){if(!Ya){Ya={};Za={};$a={};for(var a=0;65>a;a++)Ya[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),Za[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a),$a[Za[a]]=a,62<=a&&($a["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a)]=a);}}function cb(a,b){return Object.prototype.hasOwnProperty.call(a,b);}function w(a,b){if(Object.prototype.hasOwnProperty.call(a,b))return a[b];}function db(a,b){for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b(c,a[c]);}function x(a,b,c,d){var e;d<b?e="at least "+b:d>c&&(e=0===c?"none":"no more than "+c);if(e)throw Error(a+" failed: Was called with "+d+(1===d?" argument.":" arguments.")+" Expects "+e+".");}function y(a,b,c){var d="";switch(b){case 1:d=c?"first":"First";break;case 2:d=c?"second":"Second";break;case 3:d=c?"third":"Third";break;case 4:d=c?"fourth":"Fourth";break;default:throw Error("errorPrefix called with argumentNumber > 4.  Need to update it?");}return a=a+" failed: "+(d+" argument ");}function A(a,b,c,d){if((!d||n(c))&&!ha(c))throw Error(y(a,b,d)+"must be a valid function.");}function eb(a,b,c){if(n(c)&&(!ia(c)||null===c))throw Error(y(a,b,!0)+"must be a valid context object.");}function fb(a){var b=[];db(a,function(a,d){ea(d)?Ja(d,function(d){b.push(encodeURIComponent(a)+"="+encodeURIComponent(d));}):b.push(encodeURIComponent(a)+"="+encodeURIComponent(d));});return b.length?"&"+b.join("&"):"";}var gb=firebase$3.Promise;function hb(){var a=this;this.reject=this.resolve=null;this.ra=new gb(function(b,c){a.resolve=b;a.reject=c;});}function ib(a,b){return function(c,d){c?a.reject(c):a.resolve(d);ha(b)&&(jb(a.ra),1===b.length?b(c):b(c,d));};}function jb(a){a.then(void 0,ba);}function kb(a,b){if(!a)throw lb(b);}function lb(a){return Error("Firebase Database ("+firebase$3.SDK_VERSION+") INTERNAL ASSERT FAILED: "+a);}function mb(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);55296<=e&&56319>=e&&(e-=55296,d++,kb(d<a.length,"Surrogate pair missing trail surrogate."),e=65536+(e<<10)+(a.charCodeAt(d)-56320));128>e?b[c++]=e:(2048>e?b[c++]=e>>6|192:(65536>e?b[c++]=e>>12|224:(b[c++]=e>>18|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128);}return b;}function nb(a){for(var b=0,c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b++:2048>d?b+=2:55296<=d&&56319>=d?(b+=4,c++):b+=3;}return b;}function ob(a){return"undefined"!==typeof JSON&&n(JSON.parse)?JSON.parse(a):Aa(a);}function B(a){if("undefined"!==typeof JSON&&n(JSON.stringify))a=JSON.stringify(a);else{var b=[];Ca(new Ba(),a,b);a=b.join("");}return a;}function pb(a,b){this.committed=a;this.snapshot=b;}function qb(){return"undefined"!==typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test("undefined"!==typeof navigator&&"string"===typeof navigator.userAgent?navigator.userAgent:"");}function rb(a){this.qe=a;this.zd=[];this.Qb=0;this.Wd=-1;this.Fb=null;}function sb(a,b,c){a.Wd=b;a.Fb=c;a.Wd<a.Qb&&(a.Fb(),a.Fb=null);}function tb(a,b,c){for(a.zd[b]=c;a.zd[a.Qb];){var d=a.zd[a.Qb];delete a.zd[a.Qb];for(var e=0;e<d.length;++e)if(d[e]){var f=a;ub(function(){f.qe(d[e]);});}if(a.Qb===a.Wd){a.Fb&&(clearTimeout(a.Fb),a.Fb(),a.Fb=null);break;}a.Qb++;}}function vb(){this.oc={};}vb.prototype.set=function(a,b){null==b?delete this.oc[a]:this.oc[a]=b;};vb.prototype.get=function(a){return cb(this.oc,a)?this.oc[a]:null;};vb.prototype.remove=function(a){delete this.oc[a];};vb.prototype.Ze=!0;function wb(a){this.tc=a;this.Ad="firebase:";}g=wb.prototype;g.set=function(a,b){null==b?this.tc.removeItem(this.Ad+a):this.tc.setItem(this.Ad+a,B(b));};g.get=function(a){a=this.tc.getItem(this.Ad+a);return null==a?null:ob(a);};g.remove=function(a){this.tc.removeItem(this.Ad+a);};g.Ze=!1;g.toString=function(){return this.tc.toString();};function xb(a){try{if("undefined"!==typeof window&&"undefined"!==typeof window[a]){var b=window[a];b.setItem("firebase:sentinel","cache");b.removeItem("firebase:sentinel");return new wb(b);}}catch(c){}return new vb();}var yb=xb("localStorage"),zb=xb("sessionStorage");function Ab(a,b,c){this.type=Bb;this.source=a;this.path=b;this.Ga=c;}Ab.prototype.Lc=function(a){return this.path.e()?new Ab(this.source,C,this.Ga.Q(a)):new Ab(this.source,D(this.path),this.Ga);};Ab.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" overwrite: "+this.Ga.toString()+")";};function Cb(a,b){this.type=Db;this.source=a;this.path=b;}Cb.prototype.Lc=function(){return this.path.e()?new Cb(this.source,C):new Cb(this.source,D(this.path));};Cb.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" listen_complete)";};function Eb(a){this.Ee=a;}Eb.prototype.getToken=function(a){return this.Ee.INTERNAL.getToken(a).then(null,function(a){return a&&"auth/token-not-initialized"===a.code?(E("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(a);});};function Fb(a,b){a.Ee.INTERNAL.addAuthTokenListener(b);}function Gb(){this.Hd=G;}Gb.prototype.j=function(a){return this.Hd.P(a);};Gb.prototype.toString=function(){return this.Hd.toString();};function Hb(a,b,c,d,e){this.host=a.toLowerCase();this.domain=this.host.substr(this.host.indexOf(".")+1);this.Rc=b;this.me=c;this.qg=d;this.gf=e||"";this.$a=yb.get("host:"+a)||this.host;}function Ib(a,b){b!==a.$a&&(a.$a=b,"s-"===a.$a.substr(0,2)&&yb.set("host:"+a.host,a.$a));}function Jb(a,b,c){H("string"===typeof b,"typeof type must == string");H("object"===typeof c,"typeof params must == object");if("websocket"===b)b=(a.Rc?"wss://":"ws://")+a.$a+"/.ws?";else if("long_polling"===b)b=(a.Rc?"https://":"http://")+a.$a+"/.lp?";else throw Error("Unknown connection type: "+b);a.host!==a.$a&&(c.ns=a.me);var d=[];r(c,function(a,b){d.push(b+"="+a);});return b+d.join("&");}Hb.prototype.toString=function(){var a=(this.Rc?"https://":"http://")+this.host;this.gf&&(a+="<"+this.gf+">");return a;};function Kb(){this.sc={};}function Lb(a,b,c){n(c)||(c=1);cb(a.sc,b)||(a.sc[b]=0);a.sc[b]+=c;}Kb.prototype.get=function(){return za(this.sc);};function Mb(a){this.Ef=a;this.pd=null;}Mb.prototype.get=function(){var a=this.Ef.get(),b=za(a);if(this.pd)for(var c in this.pd)b[c]-=this.pd[c];this.pd=a;return b;};function Nb(){this.vb=[];}function Ob(a,b){for(var c=null,d=0;d<b.length;d++){var e=b[d],f=e.Yb();null===c||f.Z(c.Yb())||(a.vb.push(c),c=null);null===c&&(c=new Pb(f));c.add(e);}c&&a.vb.push(c);}function Qb(a,b,c){Ob(a,c);Rb(a,function(a){return a.Z(b);});}function Sb(a,b,c){Ob(a,c);Rb(a,function(a){return a.contains(b)||b.contains(a);});}function Rb(a,b){for(var c=!0,d=0;d<a.vb.length;d++){var e=a.vb[d];if(e)if(e=e.Yb(),b(e)){for(var e=a.vb[d],f=0;f<e.gd.length;f++){var h=e.gd[f];if(null!==h){e.gd[f]=null;var k=h.Tb();Tb&&E("event: "+h.toString());ub(k);}}a.vb[d]=null;}else c=!1;}c&&(a.vb=[]);}function Pb(a){this.qa=a;this.gd=[];}Pb.prototype.add=function(a){this.gd.push(a);};Pb.prototype.Yb=function(){return this.qa;};function Ub(a,b,c,d){this.Zd=b;this.Kd=c;this.Bd=d;this.fd=a;}Ub.prototype.Yb=function(){var a=this.Kd.wb();return"value"===this.fd?a.path:a.getParent().path;};Ub.prototype.de=function(){return this.fd;};Ub.prototype.Tb=function(){return this.Zd.Tb(this);};Ub.prototype.toString=function(){return this.Yb().toString()+":"+this.fd+":"+B(this.Kd.Qe());};function Vb(a,b,c){this.Zd=a;this.error=b;this.path=c;}Vb.prototype.Yb=function(){return this.path;};Vb.prototype.de=function(){return"cancel";};Vb.prototype.Tb=function(){return this.Zd.Tb(this);};Vb.prototype.toString=function(){return this.path.toString()+":cancel";};function Wb(){}Wb.prototype.Te=function(){return null;};Wb.prototype.ce=function(){return null;};var Xb=new Wb();function Yb(a,b,c){this.xf=a;this.Ka=b;this.wd=c;}Yb.prototype.Te=function(a){var b=this.Ka.N;if(Zb(b,a))return b.j().Q(a);b=null!=this.wd?new $b(this.wd,!0,!1):this.Ka.w();return this.xf.pc(a,b);};Yb.prototype.ce=function(a,b,c){var d=null!=this.wd?this.wd:ac(this.Ka);a=this.xf.Vd(d,b,1,c,a);return 0===a.length?null:a[0];};function I(a,b,c,d){this.type=a;this.Ja=b;this.Xa=c;this.ne=d;this.Bd=void 0;}function bc(a){return new I(cc,a);}var cc="value";function $b(a,b,c){this.A=a;this.da=b;this.Sb=c;}function dc(a){return a.da;}function ec(a){return a.Sb;}function fc(a,b){return b.e()?a.da&&!a.Sb:Zb(a,J(b));}function Zb(a,b){return a.da&&!a.Sb||a.A.Da(b);}$b.prototype.j=function(){return this.A;};function gc(a,b){return hc(a.name,b.name);}function ic(a,b){return hc(a,b);}function K(a,b){this.name=a;this.R=b;}function jc(a,b){return new K(a,b);}function kc(a,b){return a&&"object"===typeof a?(H(".sv"in a,"Unexpected leaf node or priority contents"),b[a[".sv"]]):a;}function lc(a,b){var c=new mc();nc(a,new L(""),function(a,e){oc(c,a,pc(e,b));});return c;}function pc(a,b){var c=a.C().H(),c=kc(c,b),d;if(a.J()){var e=kc(a.Ca(),b);return e!==a.Ca()||c!==a.C().H()?new qc(e,M(c)):a;}d=a;c!==a.C().H()&&(d=d.fa(new qc(c)));a.O(N,function(a,c){var e=pc(c,b);e!==c&&(d=d.T(a,e));});return d;}var rc=function(){var a=1;return function(){return a++;};}(),H=kb,sc=lb;function tc(a){try{var b;bb();for(var c=$a,d=[],e=0;e<a.length;){var f=c[a.charAt(e++)],h=e<a.length?c[a.charAt(e)]:0;++e;var k=e<a.length?c[a.charAt(e)]:64;++e;var l=e<a.length?c[a.charAt(e)]:64;++e;if(null==f||null==h||null==k||null==l)throw Error();d.push(f<<2|h>>4);64!=k&&(d.push(h<<4&240|k>>2),64!=l&&d.push(k<<6&192|l));}if(8192>d.length)b=String.fromCharCode.apply(null,d);else{a="";for(c=0;c<d.length;c+=8192)a+=String.fromCharCode.apply(null,Ra(d,c,c+8192));b=a;}return b;}catch(m){E("base64Decode failed: ",m);}return null;}function uc(a){var b=mb(a);a=new na();a.update(b);var b=[],c=8*a.Nd;56>a.$b?a.update(a.xd,56-a.$b):a.update(a.xd,a.Wa-(a.$b-56));for(var d=a.Wa-1;56<=d;d--)a.Ud[d]=c&255,c/=256;oa(a,a.Ud);for(d=c=0;5>d;d++)for(var e=24;0<=e;e-=8)b[c]=a.M[d]>>e&255,++c;return ab(b);}function vc(a){for(var b="",c=0;c<arguments.length;c++)b=fa(arguments[c])?b+vc.apply(null,arguments[c]):"object"===typeof arguments[c]?b+B(arguments[c]):b+arguments[c],b+=" ";return b;}var Tb=null,wc=!0;function xc(a,b){kb(!b||!0===a||!1===a,"Can't turn on custom loggers persistently.");!0===a?("undefined"!==typeof console&&("function"===typeof console.log?Tb=q(console.log,console):"object"===typeof console.log&&(Tb=function(a){console.log(a);})),b&&zb.set("logging_enabled",!0)):ha(a)?Tb=a:(Tb=null,zb.remove("logging_enabled"));}function E(a){!0===wc&&(wc=!1,null===Tb&&!0===zb.get("logging_enabled")&&xc(!0));if(Tb){var b=vc.apply(null,arguments);Tb(b);}}function yc(a){return function(){E(a,arguments);};}function zc(a){if("undefined"!==typeof console){var b="FIREBASE INTERNAL ERROR: "+vc.apply(null,arguments);"undefined"!==typeof console.error?console.error(b):console.log(b);}}function Ac(a){var b=vc.apply(null,arguments);throw Error("FIREBASE FATAL ERROR: "+b);}function O(a){if("undefined"!==typeof console){var b="FIREBASE WARNING: "+vc.apply(null,arguments);"undefined"!==typeof console.warn?console.warn(b):console.log(b);}}function Bc(a){var b,c,d,e,f,h=a;f=c=a=b="";d=!0;e="https";if(p(h)){var k=h.indexOf("//");0<=k&&(e=h.substring(0,k-1),h=h.substring(k+2));k=h.indexOf("/");-1===k&&(k=h.length);b=h.substring(0,k);f="";h=h.substring(k).split("/");for(k=0;k<h.length;k++)if(0<h[k].length){var l=h[k];try{l=decodeURIComponent(l.replace(/\+/g," "));}catch(m){}f+="/"+l;}h=b.split(".");3===h.length?(a=h[1],c=h[0].toLowerCase()):2===h.length&&(a=h[0]);k=b.indexOf(":");0<=k&&(d="https"===e||"wss"===e);}"firebase"===a&&Ac(b+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");c&&"undefined"!=c||Ac("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com");d||"undefined"!==typeof window&&window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:")&&O("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");return{jc:new Hb(b,d,c,"ws"===e||"wss"===e),path:new L(f)};}function Cc(a){return ga(a)&&(a!=a||a==Number.POSITIVE_INFINITY||a==Number.NEGATIVE_INFINITY);}function Dc(a){if("complete"===document.readyState)a();else{var b=!1,c=function(){document.body?b||(b=!0,a()):setTimeout(c,Math.floor(10));};document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!1),window.addEventListener("load",c,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&c();}),window.attachEvent("onload",c));}}function hc(a,b){if(a===b)return 0;if("[MIN_NAME]"===a||"[MAX_NAME]"===b)return-1;if("[MIN_NAME]"===b||"[MAX_NAME]"===a)return 1;var c=Ec(a),d=Ec(b);return null!==c?null!==d?0==c-d?a.length-b.length:c-d:-1:null!==d?1:a<b?-1:1;}function Fc(a,b){if(b&&a in b)return b[a];throw Error("Missing required key ("+a+") in object: "+B(b));}function Gc(a){if("object"!==typeof a||null===a)return B(a);var b=[],c;for(c in a)b.push(c);b.sort();c="{";for(var d=0;d<b.length;d++)0!==d&&(c+=","),c+=B(b[d]),c+=":",c+=Gc(a[b[d]]);return c+"}";}function Hc(a,b){if(a.length<=b)return[a];for(var c=[],d=0;d<a.length;d+=b)d+b>a?c.push(a.substring(d,a.length)):c.push(a.substring(d,d+b));return c;}function Ic(a,b){if(ea(a))for(var c=0;c<a.length;++c)b(c,a[c]);else r(a,b);}function Jc(a){H(!Cc(a),"Invalid JSON number");var b,c,d,e;0===a?(d=c=0,b=-Infinity===1/a?1:0):(b=0>a,a=Math.abs(a),a>=Math.pow(2,-1022)?(d=Math.min(Math.floor(Math.log(a)/Math.LN2),1023),c=d+1023,d=Math.round(a*Math.pow(2,52-d)-Math.pow(2,52))):(c=0,d=Math.round(a/Math.pow(2,-1074))));e=[];for(a=52;a;--a)e.push(d%2?1:0),d=Math.floor(d/2);for(a=11;a;--a)e.push(c%2?1:0),c=Math.floor(c/2);e.push(b?1:0);e.reverse();b=e.join("");c="";for(a=0;64>a;a+=8)d=parseInt(b.substr(a,8),2).toString(16),1===d.length&&(d="0"+d),c+=d;return c.toLowerCase();}var Kc=/^-?\d{1,10}$/;function Ec(a){return Kc.test(a)&&(a=Number(a),-2147483648<=a&&2147483647>=a)?a:null;}function ub(a){try{a();}catch(b){setTimeout(function(){O("Exception was thrown by user callback.",b.stack||"");throw b;},Math.floor(0));}}function Lc(a,b,c){Object.defineProperty(a,b,{get:c});}function Mc(a,b){var c=setTimeout(a,b);"object"===typeof c&&c.unref&&c.unref();return c;}function Nc(a){var b={},c={},d={},e="";try{var f=a.split("."),b=ob(tc(f[0])||""),c=ob(tc(f[1])||""),e=f[2],d=c.d||{};delete c.d;}catch(h){}return{tg:b,Ie:c,data:d,mg:e};}function Oc(a){a=Nc(a);var b=a.Ie;return!!a.mg&&!!b&&"object"===typeof b&&b.hasOwnProperty("iat");}function Pc(a){a=Nc(a).Ie;return"object"===typeof a&&!0===w(a,"admin");}function Qc(a,b,c){this.f=yc("p:rest:");this.L=a;this.Gb=b;this.Td=c;this.$={};}function Rc(a,b){if(n(b))return"tag$"+b;H(Sc(a.m),"should have a tag if it's not a default query.");return a.path.toString();}g=Qc.prototype;g.$e=function(a,b,c,d){var e=a.path.toString();this.f("Listen called for "+e+" "+a.ja());var f=Rc(a,c),h={};this.$[f]=h;a=Tc(a.m);var k=this;Uc(this,e+".json",a,function(a,b){var u=b;404===a&&(a=u=null);null===a&&k.Gb(e,u,!1,c);w(k.$,f)===h&&d(a?401==a?"permission_denied":"rest_error:"+a:"ok",null);});};g.uf=function(a,b){var c=Rc(a,b);delete this.$[c];};g.kf=function(){};g.oe=function(){};g.cf=function(){};g.vd=function(){};g.put=function(){};g.af=function(){};g.ve=function(){};function Uc(a,b,c,d){c=c||{};c.format="export";a.Td.getToken(!1).then(function(e){(e=e&&e.accessToken)&&(c.auth=e);var f=(a.L.Rc?"https://":"http://")+a.L.host+b+"?"+fb(c);a.f("Sending REST request for "+f);var h=new XMLHttpRequest();h.onreadystatechange=function(){if(d&&4===h.readyState){a.f("REST Response for "+f+" received. status:",h.status,"response:",h.responseText);var b=null;if(200<=h.status&&300>h.status){try{b=ob(h.responseText);}catch(c){O("Failed to parse JSON response for "+f+": "+h.responseText);}d(null,b);}else 401!==h.status&&404!==h.status&&O("Got unsuccessful REST response for "+f+" Status: "+h.status),d(h.status);d=null;}};h.open("GET",f,!0);h.send();});}function Vc(a,b,c){this.type=Wc;this.source=a;this.path=b;this.children=c;}Vc.prototype.Lc=function(a){if(this.path.e())return a=this.children.subtree(new L(a)),a.e()?null:a.value?new Ab(this.source,C,a.value):new Vc(this.source,C,a);H(J(this.path)===a,"Can't get a merge for a child not on the path of the operation");return new Vc(this.source,D(this.path),this.children);};Vc.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")";};function Xc(a,b){this.rf={};this.Uc=new Mb(a);this.va=b;var c=1E4+2E4*Math.random();Mc(q(this.lf,this),Math.floor(c));}Xc.prototype.lf=function(){var a=this.Uc.get(),b={},c=!1,d;for(d in a)0<a[d]&&cb(this.rf,d)&&(b[d]=a[d],c=!0);c&&this.va.ve(b);Mc(q(this.lf,this),Math.floor(6E5*Math.random()));};var Yc={},Zc={};function $c(a){a=a.toString();Yc[a]||(Yc[a]=new Kb());return Yc[a];}function ad(a,b){var c=a.toString();Zc[c]||(Zc[c]=b());return Zc[c];}var bd=null;"undefined"!==typeof MozWebSocket?bd=MozWebSocket:"undefined"!==typeof WebSocket&&(bd=WebSocket);function cd(a,b,c,d){this.Xd=a;this.f=yc(this.Xd);this.frames=this.yc=null;this.pb=this.qb=this.Ce=0;this.Va=$c(b);a={v:"5"};"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");c&&(a.s=c);d&&(a.ls=d);this.Je=Jb(b,"websocket",a);}var dd;cd.prototype.open=function(a,b){this.ib=b;this.Xf=a;this.f("Websocket connecting to "+this.Je);this.vc=!1;yb.set("previous_websocket_failure",!0);try{this.Ia=new bd(this.Je);}catch(c){this.f("Error instantiating WebSocket.");var d=c.message||c.data;d&&this.f(d);this.bb();return;}var e=this;this.Ia.onopen=function(){e.f("Websocket connected.");e.vc=!0;};this.Ia.onclose=function(){e.f("Websocket connection was disconnected.");e.Ia=null;e.bb();};this.Ia.onmessage=function(a){if(null!==e.Ia)if(a=a.data,e.pb+=a.length,Lb(e.Va,"bytes_received",a.length),ed(e),null!==e.frames)fd(e,a);else{a:{H(null===e.frames,"We already have a frame buffer");if(6>=a.length){var b=Number(a);if(!isNaN(b)){e.Ce=b;e.frames=[];a=null;break a;}}e.Ce=1;e.frames=[];}null!==a&&fd(e,a);}};this.Ia.onerror=function(a){e.f("WebSocket error.  Closing connection.");(a=a.message||a.data)&&e.f(a);e.bb();};};cd.prototype.start=function(){};cd.isAvailable=function(){var a=!1;if("undefined"!==typeof navigator&&navigator.userAgent){var b=navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);b&&1<b.length&&4.4>parseFloat(b[1])&&(a=!0);}return!a&&null!==bd&&!dd;};cd.responsesRequiredToBeHealthy=2;cd.healthyTimeout=3E4;g=cd.prototype;g.qd=function(){yb.remove("previous_websocket_failure");};function fd(a,b){a.frames.push(b);if(a.frames.length==a.Ce){var c=a.frames.join("");a.frames=null;c=ob(c);a.Xf(c);}}g.send=function(a){ed(this);a=B(a);this.qb+=a.length;Lb(this.Va,"bytes_sent",a.length);a=Hc(a,16384);1<a.length&&gd(this,String(a.length));for(var b=0;b<a.length;b++)gd(this,a[b]);};g.Sc=function(){this.Ab=!0;this.yc&&(clearInterval(this.yc),this.yc=null);this.Ia&&(this.Ia.close(),this.Ia=null);};g.bb=function(){this.Ab||(this.f("WebSocket is closing itself"),this.Sc(),this.ib&&(this.ib(this.vc),this.ib=null));};g.close=function(){this.Ab||(this.f("WebSocket is being closed"),this.Sc());};function ed(a){clearInterval(a.yc);a.yc=setInterval(function(){a.Ia&&gd(a,"0");ed(a);},Math.floor(45E3));}function gd(a,b){try{a.Ia.send(b);}catch(c){a.f("Exception thrown from WebSocket.send():",c.message||c.data,"Closing connection."),setTimeout(q(a.bb,a),0);}}function hd(){this.fb={};}function jd(a,b){var c=b.type,d=b.Xa;H("child_added"==c||"child_changed"==c||"child_removed"==c,"Only child changes supported for tracking");H(".priority"!==d,"Only non-priority child changes can be tracked.");var e=w(a.fb,d);if(e){var f=e.type;if("child_added"==c&&"child_removed"==f)a.fb[d]=new I("child_changed",b.Ja,d,e.Ja);else if("child_removed"==c&&"child_added"==f)delete a.fb[d];else if("child_removed"==c&&"child_changed"==f)a.fb[d]=new I("child_removed",e.ne,d);else if("child_changed"==c&&"child_added"==f)a.fb[d]=new I("child_added",b.Ja,d);else if("child_changed"==c&&"child_changed"==f)a.fb[d]=new I("child_changed",b.Ja,d,e.ne);else throw sc("Illegal combination of changes: "+b+" occurred after "+e);}else a.fb[d]=b;}function kd(a){this.V=a;this.g=a.m.g;}function ld(a,b,c,d){var e=[],f=[];Ja(b,function(b){"child_changed"===b.type&&a.g.ld(b.ne,b.Ja)&&f.push(new I("child_moved",b.Ja,b.Xa));});md(a,e,"child_removed",b,d,c);md(a,e,"child_added",b,d,c);md(a,e,"child_moved",f,d,c);md(a,e,"child_changed",b,d,c);md(a,e,cc,b,d,c);return e;}function md(a,b,c,d,e,f){d=Ka(d,function(a){return a.type===c;});Sa(d,q(a.Ff,a));Ja(d,function(c){var d=nd(a,c,f);Ja(e,function(e){e.nf(c.type)&&b.push(e.createEvent(d,a.V));});});}function nd(a,b,c){"value"!==b.type&&"child_removed"!==b.type&&(b.Bd=c.Ve(b.Xa,b.Ja,a.g));return b;}kd.prototype.Ff=function(a,b){if(null==a.Xa||null==b.Xa)throw sc("Should only compare child_ events.");return this.g.compare(new K(a.Xa,a.Ja),new K(b.Xa,b.Ja));};function od(a,b){this.Qd=a;this.Df=b;}function pd(a){this.U=a;}pd.prototype.eb=function(a,b,c,d){var e=new hd(),f;if(b.type===Bb)b.source.be?c=qd(this,a,b.path,b.Ga,c,d,e):(H(b.source.Se,"Unknown source."),f=b.source.Be||ec(a.w())&&!b.path.e(),c=rd(this,a,b.path,b.Ga,c,d,f,e));else if(b.type===Wc)b.source.be?c=sd(this,a,b.path,b.children,c,d,e):(H(b.source.Se,"Unknown source."),f=b.source.Be||ec(a.w()),c=td(this,a,b.path,b.children,c,d,f,e));else if(b.type===ud){if(b.Gd){if(b=b.path,null!=c.lc(b))c=a;else{f=new Yb(c,a,d);d=a.N.j();if(b.e()||".priority"===J(b))dc(a.w())?b=c.Aa(ac(a)):(b=a.w().j(),H(b instanceof P,"serverChildren would be complete if leaf node"),b=c.qc(b)),b=this.U.ya(d,b,e);else{var h=J(b),k=c.pc(h,a.w());null==k&&Zb(a.w(),h)&&(k=d.Q(h));b=null!=k?this.U.F(d,h,k,D(b),f,e):a.N.j().Da(h)?this.U.F(d,h,G,D(b),f,e):d;b.e()&&dc(a.w())&&(d=c.Aa(ac(a)),d.J()&&(b=this.U.ya(b,d,e)));}d=dc(a.w())||null!=c.lc(C);c=vd(a,b,d,this.U.Na());}}else c=wd(this,a,b.path,b.Ob,c,d,e);}else if(b.type===Db)d=b.path,b=a.w(),f=b.j(),h=b.da||d.e(),c=xd(this,new yd(a.N,new $b(f,h,b.Sb)),d,c,Xb,e);else throw sc("Unknown operation type: "+b.type);e=ta(e.fb);d=c;b=d.N;b.da&&(f=b.j().J()||b.j().e(),h=zd(a),(0<e.length||!a.N.da||f&&!b.j().Z(h)||!b.j().C().Z(h.C()))&&e.push(bc(zd(d))));return new od(c,e);};function xd(a,b,c,d,e,f){var h=b.N;if(null!=d.lc(c))return b;var k;if(c.e())H(dc(b.w()),"If change path is empty, we must have complete server data"),ec(b.w())?(e=ac(b),d=d.qc(e instanceof P?e:G)):d=d.Aa(ac(b)),f=a.U.ya(b.N.j(),d,f);else{var l=J(c);if(".priority"==l)H(1==Ad(c),"Can't have a priority with additional path components"),f=h.j(),k=b.w().j(),d=d.Zc(c,f,k),f=null!=d?a.U.fa(f,d):h.j();else{var m=D(c);Zb(h,l)?(k=b.w().j(),d=d.Zc(c,h.j(),k),d=null!=d?h.j().Q(l).F(m,d):h.j().Q(l)):d=d.pc(l,b.w());f=null!=d?a.U.F(h.j(),l,d,m,e,f):h.j();}}return vd(b,f,h.da||c.e(),a.U.Na());}function rd(a,b,c,d,e,f,h,k){var l=b.w();h=h?a.U:a.U.Ub();if(c.e())d=h.ya(l.j(),d,null);else if(h.Na()&&!l.Sb)d=l.j().F(c,d),d=h.ya(l.j(),d,null);else{var m=J(c);if(!fc(l,c)&&1<Ad(c))return b;var u=D(c);d=l.j().Q(m).F(u,d);d=".priority"==m?h.fa(l.j(),d):h.F(l.j(),m,d,u,Xb,null);}l=l.da||c.e();b=new yd(b.N,new $b(d,l,h.Na()));return xd(a,b,c,e,new Yb(e,b,f),k);}function qd(a,b,c,d,e,f,h){var k=b.N;e=new Yb(e,b,f);if(c.e())h=a.U.ya(b.N.j(),d,h),a=vd(b,h,!0,a.U.Na());else if(f=J(c),".priority"===f)h=a.U.fa(b.N.j(),d),a=vd(b,h,k.da,k.Sb);else{c=D(c);var l=k.j().Q(f);if(!c.e()){var m=e.Te(f);d=null!=m?".priority"===Bd(c)&&m.P(c.parent()).e()?m:m.F(c,d):G;}l.Z(d)?a=b:(h=a.U.F(k.j(),f,d,c,e,h),a=vd(b,h,k.da,a.U.Na()));}return a;}function sd(a,b,c,d,e,f,h){var k=b;Cd(d,function(d,m){var u=c.n(d);Zb(b.N,J(u))&&(k=qd(a,k,u,m,e,f,h));});Cd(d,function(d,m){var u=c.n(d);Zb(b.N,J(u))||(k=qd(a,k,u,m,e,f,h));});return k;}function Dd(a,b){Cd(b,function(b,d){a=a.F(b,d);});return a;}function td(a,b,c,d,e,f,h,k){if(b.w().j().e()&&!dc(b.w()))return b;var l=b;c=c.e()?d:Ed(Q,c,d);var m=b.w().j();c.children.ha(function(c,d){if(m.Da(c)){var F=b.w().j().Q(c),F=Dd(F,d);l=rd(a,l,new L(c),F,e,f,h,k);}});c.children.ha(function(c,d){var F=!Zb(b.w(),c)&&null==d.value;m.Da(c)||F||(F=b.w().j().Q(c),F=Dd(F,d),l=rd(a,l,new L(c),F,e,f,h,k));});return l;}function wd(a,b,c,d,e,f,h){if(null!=e.lc(c))return b;var k=ec(b.w()),l=b.w();if(null!=d.value){if(c.e()&&l.da||fc(l,c))return rd(a,b,c,l.j().P(c),e,f,k,h);if(c.e()){var m=Q;l.j().O(Fd,function(a,b){m=m.set(new L(a),b);});return td(a,b,c,m,e,f,k,h);}return b;}m=Q;Cd(d,function(a){var b=c.n(a);fc(l,b)&&(m=m.set(a,l.j().P(b)));});return td(a,b,c,m,e,f,k,h);}function Gd(a){this.g=a;}g=Gd.prototype;g.F=function(a,b,c,d,e,f){H(a.xc(this.g),"A node must be indexed if only a child is updated");e=a.Q(b);if(e.P(d).Z(c.P(d))&&e.e()==c.e())return a;null!=f&&(c.e()?a.Da(b)?jd(f,new I("child_removed",e,b)):H(a.J(),"A child remove without an old child only makes sense on a leaf node"):e.e()?jd(f,new I("child_added",c,b)):jd(f,new I("child_changed",c,b,e)));return a.J()&&c.e()?a:a.T(b,c).nb(this.g);};g.ya=function(a,b,c){null!=c&&(a.J()||a.O(N,function(a,e){b.Da(a)||jd(c,new I("child_removed",e,a));}),b.J()||b.O(N,function(b,e){if(a.Da(b)){var f=a.Q(b);f.Z(e)||jd(c,new I("child_changed",e,b,f));}else jd(c,new I("child_added",e,b));}));return b.nb(this.g);};g.fa=function(a,b){return a.e()?G:a.fa(b);};g.Na=function(){return!1;};g.Ub=function(){return this;};function Hd(a){this.ee=new Gd(a.g);this.g=a.g;var b;a.ka?(b=Id(a),b=a.g.Dc(Jd(a),b)):b=a.g.Gc();this.Tc=b;a.na?(b=Kd(a),a=a.g.Dc(Ld(a),b)):a=a.g.Ec();this.uc=a;}g=Hd.prototype;g.matches=function(a){return 0>=this.g.compare(this.Tc,a)&&0>=this.g.compare(a,this.uc);};g.F=function(a,b,c,d,e,f){this.matches(new K(b,c))||(c=G);return this.ee.F(a,b,c,d,e,f);};g.ya=function(a,b,c){b.J()&&(b=G);var d=b.nb(this.g),d=d.fa(G),e=this;b.O(N,function(a,b){e.matches(new K(a,b))||(d=d.T(a,G));});return this.ee.ya(a,d,c);};g.fa=function(a){return a;};g.Na=function(){return!0;};g.Ub=function(){return this.ee;};function Md(a){this.sa=new Hd(a);this.g=a.g;H(a.xa,"Only valid if limit has been set");this.oa=a.oa;this.Ib=!Nd(a);}g=Md.prototype;g.F=function(a,b,c,d,e,f){this.sa.matches(new K(b,c))||(c=G);return a.Q(b).Z(c)?a:a.Eb()<this.oa?this.sa.Ub().F(a,b,c,d,e,f):Od(this,a,b,c,e,f);};g.ya=function(a,b,c){var d;if(b.J()||b.e())d=G.nb(this.g);else if(2*this.oa<b.Eb()&&b.xc(this.g)){d=G.nb(this.g);b=this.Ib?b.Zb(this.sa.uc,this.g):b.Xb(this.sa.Tc,this.g);for(var e=0;0<b.Pa.length&&e<this.oa;){var f=R(b),h;if(h=this.Ib?0>=this.g.compare(this.sa.Tc,f):0>=this.g.compare(f,this.sa.uc))d=d.T(f.name,f.R),e++;else break;}}else{d=b.nb(this.g);d=d.fa(G);var k,l,m;if(this.Ib){b=d.We(this.g);k=this.sa.uc;l=this.sa.Tc;var u=Pd(this.g);m=function(a,b){return u(b,a);};}else b=d.Wb(this.g),k=this.sa.Tc,l=this.sa.uc,m=Pd(this.g);for(var e=0,z=!1;0<b.Pa.length;)f=R(b),!z&&0>=m(k,f)&&(z=!0),(h=z&&e<this.oa&&0>=m(f,l))?e++:d=d.T(f.name,G);}return this.sa.Ub().ya(a,d,c);};g.fa=function(a){return a;};g.Na=function(){return!0;};g.Ub=function(){return this.sa.Ub();};function Od(a,b,c,d,e,f){var h;if(a.Ib){var k=Pd(a.g);h=function(a,b){return k(b,a);};}else h=Pd(a.g);H(b.Eb()==a.oa,"");var l=new K(c,d),m=a.Ib?Qd(b,a.g):Rd(b,a.g),u=a.sa.matches(l);if(b.Da(c)){for(var z=b.Q(c),m=e.ce(a.g,m,a.Ib);null!=m&&(m.name==c||b.Da(m.name));)m=e.ce(a.g,m,a.Ib);e=null==m?1:h(m,l);if(u&&!d.e()&&0<=e)return null!=f&&jd(f,new I("child_changed",d,c,z)),b.T(c,d);null!=f&&jd(f,new I("child_removed",z,c));b=b.T(c,G);return null!=m&&a.sa.matches(m)?(null!=f&&jd(f,new I("child_added",m.R,m.name)),b.T(m.name,m.R)):b;}return d.e()?b:u&&0<=h(m,l)?(null!=f&&(jd(f,new I("child_removed",m.R,m.name)),jd(f,new I("child_added",d,c))),b.T(c,d).T(m.name,G)):b;}function qc(a,b){this.B=a;H(n(this.B)&&null!==this.B,"LeafNode shouldn't be created with null/undefined value.");this.aa=b||G;Sd(this.aa);this.Db=null;}var Td=["object","boolean","number","string"];g=qc.prototype;g.J=function(){return!0;};g.C=function(){return this.aa;};g.fa=function(a){return new qc(this.B,a);};g.Q=function(a){return".priority"===a?this.aa:G;};g.P=function(a){return a.e()?this:".priority"===J(a)?this.aa:G;};g.Da=function(){return!1;};g.Ve=function(){return null;};g.T=function(a,b){return".priority"===a?this.fa(b):b.e()&&".priority"!==a?this:G.T(a,b).fa(this.aa);};g.F=function(a,b){var c=J(a);if(null===c)return b;if(b.e()&&".priority"!==c)return this;H(".priority"!==c||1===Ad(a),".priority must be the last token in a path");return this.T(c,G.F(D(a),b));};g.e=function(){return!1;};g.Eb=function(){return 0;};g.O=function(){return!1;};g.H=function(a){return a&&!this.C().e()?{".value":this.Ca(),".priority":this.C().H()}:this.Ca();};g.hash=function(){if(null===this.Db){var a="";this.aa.e()||(a+="priority:"+Ud(this.aa.H())+":");var b=typeof this.B,a=a+(b+":"),a="number"===b?a+Jc(this.B):a+this.B;this.Db=uc(a);}return this.Db;};g.Ca=function(){return this.B;};g.rc=function(a){if(a===G)return 1;if(a instanceof P)return-1;H(a.J(),"Unknown node type");var b=typeof a.B,c=typeof this.B,d=Ia(Td,b),e=Ia(Td,c);H(0<=d,"Unknown leaf type: "+b);H(0<=e,"Unknown leaf type: "+c);return d===e?"object"===c?0:this.B<a.B?-1:this.B===a.B?0:1:e-d;};g.nb=function(){return this;};g.xc=function(){return!0;};g.Z=function(a){return a===this?!0:a.J()?this.B===a.B&&this.aa.Z(a.aa):!1;};g.toString=function(){return B(this.H(!0));};function Vd(){}var Wd={};function Pd(a){return q(a.compare,a);}Vd.prototype.ld=function(a,b){return 0!==this.compare(new K("[MIN_NAME]",a),new K("[MIN_NAME]",b));};Vd.prototype.Gc=function(){return Xd;};function Yd(a){H(!a.e()&&".priority"!==J(a),"Can't create PathIndex with empty path or .priority key");this.bc=a;}la(Yd,Vd);g=Yd.prototype;g.wc=function(a){return!a.P(this.bc).e();};g.compare=function(a,b){var c=a.R.P(this.bc),d=b.R.P(this.bc),c=c.rc(d);return 0===c?hc(a.name,b.name):c;};g.Dc=function(a,b){var c=M(a),c=G.F(this.bc,c);return new K(b,c);};g.Ec=function(){var a=G.F(this.bc,Zd);return new K("[MAX_NAME]",a);};g.toString=function(){return this.bc.slice().join("/");};function $d(){}la($d,Vd);g=$d.prototype;g.compare=function(a,b){var c=a.R.C(),d=b.R.C(),c=c.rc(d);return 0===c?hc(a.name,b.name):c;};g.wc=function(a){return!a.C().e();};g.ld=function(a,b){return!a.C().Z(b.C());};g.Gc=function(){return Xd;};g.Ec=function(){return new K("[MAX_NAME]",new qc("[PRIORITY-POST]",Zd));};g.Dc=function(a,b){var c=M(a);return new K(b,new qc("[PRIORITY-POST]",c));};g.toString=function(){return".priority";};var N=new $d();function ae(){}la(ae,Vd);g=ae.prototype;g.compare=function(a,b){return hc(a.name,b.name);};g.wc=function(){throw sc("KeyIndex.isDefinedOn not expected to be called.");};g.ld=function(){return!1;};g.Gc=function(){return Xd;};g.Ec=function(){return new K("[MAX_NAME]",G);};g.Dc=function(a){H(p(a),"KeyIndex indexValue must always be a string.");return new K(a,G);};g.toString=function(){return".key";};var Fd=new ae();function be(){}la(be,Vd);g=be.prototype;g.compare=function(a,b){var c=a.R.rc(b.R);return 0===c?hc(a.name,b.name):c;};g.wc=function(){return!0;};g.ld=function(a,b){return!a.Z(b);};g.Gc=function(){return Xd;};g.Ec=function(){return ce;};g.Dc=function(a,b){var c=M(a);return new K(b,c);};g.toString=function(){return".value";};var de=new be();function ee(){this.Rb=this.na=this.Kb=this.ka=this.xa=!1;this.oa=0;this.mb="";this.dc=null;this.zb="";this.ac=null;this.xb="";this.g=N;}var fe=new ee();function Nd(a){return""===a.mb?a.ka:"l"===a.mb;}function Jd(a){H(a.ka,"Only valid if start has been set");return a.dc;}function Id(a){H(a.ka,"Only valid if start has been set");return a.Kb?a.zb:"[MIN_NAME]";}function Ld(a){H(a.na,"Only valid if end has been set");return a.ac;}function Kd(a){H(a.na,"Only valid if end has been set");return a.Rb?a.xb:"[MAX_NAME]";}function ge(a){var b=new ee();b.xa=a.xa;b.oa=a.oa;b.ka=a.ka;b.dc=a.dc;b.Kb=a.Kb;b.zb=a.zb;b.na=a.na;b.ac=a.ac;b.Rb=a.Rb;b.xb=a.xb;b.g=a.g;b.mb=a.mb;return b;}g=ee.prototype;g.ke=function(a){var b=ge(this);b.xa=!0;b.oa=a;b.mb="l";return b;};g.le=function(a){var b=ge(this);b.xa=!0;b.oa=a;b.mb="r";return b;};g.Ld=function(a,b){var c=ge(this);c.ka=!0;n(a)||(a=null);c.dc=a;null!=b?(c.Kb=!0,c.zb=b):(c.Kb=!1,c.zb="");return c;};g.ed=function(a,b){var c=ge(this);c.na=!0;n(a)||(a=null);c.ac=a;n(b)?(c.Rb=!0,c.xb=b):(c.vg=!1,c.xb="");return c;};function he(a,b){var c=ge(a);c.g=b;return c;}function ie(a){var b={};a.ka&&(b.sp=a.dc,a.Kb&&(b.sn=a.zb));a.na&&(b.ep=a.ac,a.Rb&&(b.en=a.xb));if(a.xa){b.l=a.oa;var c=a.mb;""===c&&(c=Nd(a)?"l":"r");b.vf=c;}a.g!==N&&(b.i=a.g.toString());return b;}function S(a){return!(a.ka||a.na||a.xa);}function Sc(a){return S(a)&&a.g==N;}function Tc(a){var b={};if(Sc(a))return b;var c;a.g===N?c="$priority":a.g===de?c="$value":a.g===Fd?c="$key":(H(a.g instanceof Yd,"Unrecognized index type!"),c=a.g.toString());b.orderBy=B(c);a.ka&&(b.startAt=B(a.dc),a.Kb&&(b.startAt+=","+B(a.zb)));a.na&&(b.endAt=B(a.ac),a.Rb&&(b.endAt+=","+B(a.xb)));a.xa&&(Nd(a)?b.limitToFirst=a.oa:b.limitToLast=a.oa);return b;}g.toString=function(){return B(ie(this));};function je(a,b){this.md=a;this.cc=b;}je.prototype.get=function(a){var b=w(this.md,a);if(!b)throw Error("No index defined for "+a);return b===Wd?null:b;};function ke(a,b,c){var d=pa(a.md,function(d,f){var h=w(a.cc,f);H(h,"Missing index implementation for "+f);if(d===Wd){if(h.wc(b.R)){for(var k=[],l=c.Wb(jc),m=R(l);m;)m.name!=b.name&&k.push(m),m=R(l);k.push(b);return le(k,Pd(h));}return Wd;}h=c.get(b.name);k=d;h&&(k=k.remove(new K(b.name,h)));return k.Oa(b,b.R);});return new je(d,a.cc);}function me(a,b,c){var d=pa(a.md,function(a){if(a===Wd)return a;var d=c.get(b.name);return d?a.remove(new K(b.name,d)):a;});return new je(d,a.cc);}var ne=new je({".priority":Wd},{".priority":N});function oe(){this.set={};}g=oe.prototype;g.add=function(a,b){this.set[a]=null!==b?b:!0;};g.contains=function(a){return cb(this.set,a);};g.get=function(a){return this.contains(a)?this.set[a]:void 0;};g.remove=function(a){delete this.set[a];};g.clear=function(){this.set={};};g.e=function(){return ya(this.set);};g.count=function(){return ra(this.set);};function pe(a,b){r(a.set,function(a,d){b(d,a);});}g.keys=function(){var a=[];r(this.set,function(b,c){a.push(c);});return a;};function qe(a,b,c,d){this.Xd=a;this.f=yc(a);this.jc=b;this.pb=this.qb=0;this.Va=$c(b);this.tf=c;this.vc=!1;this.Cb=d;this.Xc=function(a){return Jb(b,"long_polling",a);};}var re,se;qe.prototype.open=function(a,b){this.Me=0;this.ia=b;this.bf=new rb(a);this.Ab=!1;var c=this;this.sb=setTimeout(function(){c.f("Timed out trying to connect.");c.bb();c.sb=null;},Math.floor(3E4));Dc(function(){if(!c.Ab){c.Ta=new te(function(a,b,d,k,l){ue(c,arguments);if(c.Ta)if(c.sb&&(clearTimeout(c.sb),c.sb=null),c.vc=!0,"start"==a)c.id=b,c.ff=d;else if("close"===a)b?(c.Ta.Id=!1,sb(c.bf,b,function(){c.bb();})):c.bb();else throw Error("Unrecognized command received: "+a);},function(a,b){ue(c,arguments);tb(c.bf,a,b);},function(){c.bb();},c.Xc);var a={start:"t"};a.ser=Math.floor(1E8*Math.random());c.Ta.Od&&(a.cb=c.Ta.Od);a.v="5";c.tf&&(a.s=c.tf);c.Cb&&(a.ls=c.Cb);"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");a=c.Xc(a);c.f("Connecting via long-poll to "+a);ve(c.Ta,a,function(){});}});};qe.prototype.start=function(){var a=this.Ta,b=this.ff;a.Vf=this.id;a.Wf=b;for(a.Sd=!0;we(a););a=this.id;b=this.ff;this.fc=document.createElement("iframe");var c={dframe:"t"};c.id=a;c.pw=b;this.fc.src=this.Xc(c);this.fc.style.display="none";document.body.appendChild(this.fc);};qe.isAvailable=function(){return re||!se&&"undefined"!==typeof document&&null!=document.createElement&&!("object"===typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))&&!("object"===typeof Windows&&"object"===typeof Windows.rg)&&!0;};g=qe.prototype;g.qd=function(){};g.Sc=function(){this.Ab=!0;this.Ta&&(this.Ta.close(),this.Ta=null);this.fc&&(document.body.removeChild(this.fc),this.fc=null);this.sb&&(clearTimeout(this.sb),this.sb=null);};g.bb=function(){this.Ab||(this.f("Longpoll is closing itself"),this.Sc(),this.ia&&(this.ia(this.vc),this.ia=null));};g.close=function(){this.Ab||(this.f("Longpoll is being closed."),this.Sc());};g.send=function(a){a=B(a);this.qb+=a.length;Lb(this.Va,"bytes_sent",a.length);a=mb(a);a=ab(a,!0);a=Hc(a,1840);for(var b=0;b<a.length;b++){var c=this.Ta;c.Pc.push({jg:this.Me,pg:a.length,Oe:a[b]});c.Sd&&we(c);this.Me++;}};function ue(a,b){var c=B(b).length;a.pb+=c;Lb(a.Va,"bytes_received",c);}function te(a,b,c,d){this.Xc=d;this.ib=c;this.se=new oe();this.Pc=[];this.Yd=Math.floor(1E8*Math.random());this.Id=!0;this.Od=rc();window["pLPCommand"+this.Od]=a;window["pRTLPCB"+this.Od]=b;a=document.createElement("iframe");a.style.display="none";if(document.body){document.body.appendChild(a);try{a.contentWindow.document||E("No IE domain setting required");}catch(e){a.src="javascript:void((function(){document.open();document.domain='"+document.domain+"';document.close();})())";}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";a.contentDocument?a.gb=a.contentDocument:a.contentWindow?a.gb=a.contentWindow.document:a.document&&(a.gb=a.document);this.Ea=a;a="";this.Ea.src&&"javascript:"===this.Ea.src.substr(0,11)&&(a='<script>document.domain="'+document.domain+'";\x3c/script>');a="<html><body>"+a+"</body></html>";try{this.Ea.gb.open(),this.Ea.gb.write(a),this.Ea.gb.close();}catch(f){E("frame writing exception"),f.stack&&E(f.stack),E(f);}}te.prototype.close=function(){this.Sd=!1;if(this.Ea){this.Ea.gb.body.innerHTML="";var a=this;setTimeout(function(){null!==a.Ea&&(document.body.removeChild(a.Ea),a.Ea=null);},Math.floor(0));}var b=this.ib;b&&(this.ib=null,b());};function we(a){if(a.Sd&&a.Id&&a.se.count()<(0<a.Pc.length?2:1)){a.Yd++;var b={};b.id=a.Vf;b.pw=a.Wf;b.ser=a.Yd;for(var b=a.Xc(b),c="",d=0;0<a.Pc.length;)if(1870>=a.Pc[0].Oe.length+30+c.length){var e=a.Pc.shift(),c=c+"&seg"+d+"="+e.jg+"&ts"+d+"="+e.pg+"&d"+d+"="+e.Oe;d++;}else break;xe(a,b+c,a.Yd);return!0;}return!1;}function xe(a,b,c){function d(){a.se.remove(c);we(a);}a.se.add(c,1);var e=setTimeout(d,Math.floor(25E3));ve(a,b,function(){clearTimeout(e);d();});}function ve(a,b,c){setTimeout(function(){try{if(a.Id){var d=a.Ea.gb.createElement("script");d.type="text/javascript";d.async=!0;d.src=b;d.onload=d.onreadystatechange=function(){var a=d.readyState;a&&"loaded"!==a&&"complete"!==a||(d.onload=d.onreadystatechange=null,d.parentNode&&d.parentNode.removeChild(d),c());};d.onerror=function(){E("Long-poll script failed to load: "+b);a.Id=!1;a.close();};a.Ea.gb.body.appendChild(d);}}catch(e){}},Math.floor(1));}function ye(a){ze(this,a);}var Ae=[qe,cd];function ze(a,b){var c=cd&&cd.isAvailable(),d=c&&!(yb.Ze||!0===yb.get("previous_websocket_failure"));b.qg&&(c||O("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),d=!0);if(d)a.Vc=[cd];else{var e=a.Vc=[];Ic(Ae,function(a,b){b&&b.isAvailable()&&e.push(b);});}}function Be(a){if(0<a.Vc.length)return a.Vc[0];throw Error("No transports available");}function Ce(a,b,c,d,e,f,h){this.id=a;this.f=yc("c:"+this.id+":");this.qe=c;this.Kc=d;this.ia=e;this.pe=f;this.L=b;this.yd=[];this.Ke=0;this.sf=new ye(b);this.Ua=0;this.Cb=h;this.f("Connection created");De(this);}function De(a){var b=Be(a.sf);a.I=new b("c:"+a.id+":"+a.Ke++,a.L,void 0,a.Cb);a.ue=b.responsesRequiredToBeHealthy||0;var c=Ee(a,a.I),d=Fe(a,a.I);a.Wc=a.I;a.Qc=a.I;a.D=null;a.Bb=!1;setTimeout(function(){a.I&&a.I.open(c,d);},Math.floor(0));b=b.healthyTimeout||0;0<b&&(a.kd=Mc(function(){a.kd=null;a.Bb||(a.I&&102400<a.I.pb?(a.f("Connection exceeded healthy timeout but has received "+a.I.pb+" bytes.  Marking connection healthy."),a.Bb=!0,a.I.qd()):a.I&&10240<a.I.qb?a.f("Connection exceeded healthy timeout but has sent "+a.I.qb+" bytes.  Leaving connection alive."):(a.f("Closing unhealthy connection after timeout."),a.close()));},Math.floor(b)));}function Fe(a,b){return function(c){b===a.I?(a.I=null,c||0!==a.Ua?1===a.Ua&&a.f("Realtime connection lost."):(a.f("Realtime connection failed."),"s-"===a.L.$a.substr(0,2)&&(yb.remove("host:"+a.L.host),a.L.$a=a.L.host)),a.close()):b===a.D?(a.f("Secondary connection lost."),c=a.D,a.D=null,a.Wc!==c&&a.Qc!==c||a.close()):a.f("closing an old connection");};}function Ee(a,b){return function(c){if(2!=a.Ua)if(b===a.Qc){var d=Fc("t",c);c=Fc("d",c);if("c"==d){if(d=Fc("t",c),"d"in c)if(c=c.d,"h"===d){var d=c.ts,e=c.v,f=c.h;a.qf=c.s;Ib(a.L,f);0==a.Ua&&(a.I.start(),Ge(a,a.I,d),"5"!==e&&O("Protocol version mismatch detected"),c=a.sf,(c=1<c.Vc.length?c.Vc[1]:null)&&He(a,c));}else if("n"===d){a.f("recvd end transmission on primary");a.Qc=a.D;for(c=0;c<a.yd.length;++c)a.ud(a.yd[c]);a.yd=[];Ie(a);}else"s"===d?(a.f("Connection shutdown command received. Shutting down..."),a.pe&&(a.pe(c),a.pe=null),a.ia=null,a.close()):"r"===d?(a.f("Reset packet received.  New host: "+c),Ib(a.L,c),1===a.Ua?a.close():(Je(a),De(a))):"e"===d?zc("Server Error: "+c):"o"===d?(a.f("got pong on primary."),Ke(a),Le(a)):zc("Unknown control packet command: "+d);}else"d"==d&&a.ud(c);}else if(b===a.D){if(d=Fc("t",c),c=Fc("d",c),"c"==d)"t"in c&&(c=c.t,"a"===c?Me(a):"r"===c?(a.f("Got a reset on secondary, closing it"),a.D.close(),a.Wc!==a.D&&a.Qc!==a.D||a.close()):"o"===c&&(a.f("got pong on secondary."),a.pf--,Me(a)));else if("d"==d)a.yd.push(c);else throw Error("Unknown protocol layer: "+d);}else a.f("message on old connection");};}Ce.prototype.ua=function(a){Ne(this,{t:"d",d:a});};function Ie(a){a.Wc===a.D&&a.Qc===a.D&&(a.f("cleaning up and promoting a connection: "+a.D.Xd),a.I=a.D,a.D=null);}function Me(a){0>=a.pf?(a.f("Secondary connection is healthy."),a.Bb=!0,a.D.qd(),a.D.start(),a.f("sending client ack on secondary"),a.D.send({t:"c",d:{t:"a",d:{}}}),a.f("Ending transmission on primary"),a.I.send({t:"c",d:{t:"n",d:{}}}),a.Wc=a.D,Ie(a)):(a.f("sending ping on secondary."),a.D.send({t:"c",d:{t:"p",d:{}}}));}Ce.prototype.ud=function(a){Ke(this);this.qe(a);};function Ke(a){a.Bb||(a.ue--,0>=a.ue&&(a.f("Primary connection is healthy."),a.Bb=!0,a.I.qd()));}function He(a,b){a.D=new b("c:"+a.id+":"+a.Ke++,a.L,a.qf);a.pf=b.responsesRequiredToBeHealthy||0;a.D.open(Ee(a,a.D),Fe(a,a.D));Mc(function(){a.D&&(a.f("Timed out trying to upgrade."),a.D.close());},Math.floor(6E4));}function Ge(a,b,c){a.f("Realtime connection established.");a.I=b;a.Ua=1;a.Kc&&(a.Kc(c,a.qf),a.Kc=null);0===a.ue?(a.f("Primary connection is healthy."),a.Bb=!0):Mc(function(){Le(a);},Math.floor(5E3));}function Le(a){a.Bb||1!==a.Ua||(a.f("sending ping on primary."),Ne(a,{t:"c",d:{t:"p",d:{}}}));}function Ne(a,b){if(1!==a.Ua)throw"Connection is not connected";a.Wc.send(b);}Ce.prototype.close=function(){2!==this.Ua&&(this.f("Closing realtime connection."),this.Ua=2,Je(this),this.ia&&(this.ia(),this.ia=null));};function Je(a){a.f("Shutting down all connections");a.I&&(a.I.close(),a.I=null);a.D&&(a.D.close(),a.D=null);a.kd&&(clearTimeout(a.kd),a.kd=null);}function L(a,b){if(1==arguments.length){this.o=a.split("/");for(var c=0,d=0;d<this.o.length;d++)0<this.o[d].length&&(this.o[c]=this.o[d],c++);this.o.length=c;this.Y=0;}else this.o=a,this.Y=b;}function T(a,b){var c=J(a);if(null===c)return b;if(c===J(b))return T(D(a),D(b));throw Error("INTERNAL ERROR: innerPath ("+b+") is not within outerPath ("+a+")");}function Oe(a,b){for(var c=a.slice(),d=b.slice(),e=0;e<c.length&&e<d.length;e++){var f=hc(c[e],d[e]);if(0!==f)return f;}return c.length===d.length?0:c.length<d.length?-1:1;}function J(a){return a.Y>=a.o.length?null:a.o[a.Y];}function Ad(a){return a.o.length-a.Y;}function D(a){var b=a.Y;b<a.o.length&&b++;return new L(a.o,b);}function Bd(a){return a.Y<a.o.length?a.o[a.o.length-1]:null;}g=L.prototype;g.toString=function(){for(var a="",b=this.Y;b<this.o.length;b++)""!==this.o[b]&&(a+="/"+this.o[b]);return a||"/";};g.slice=function(a){return this.o.slice(this.Y+(a||0));};g.parent=function(){if(this.Y>=this.o.length)return null;for(var a=[],b=this.Y;b<this.o.length-1;b++)a.push(this.o[b]);return new L(a,0);};g.n=function(a){for(var b=[],c=this.Y;c<this.o.length;c++)b.push(this.o[c]);if(a instanceof L)for(c=a.Y;c<a.o.length;c++)b.push(a.o[c]);else for(a=a.split("/"),c=0;c<a.length;c++)0<a[c].length&&b.push(a[c]);return new L(b,0);};g.e=function(){return this.Y>=this.o.length;};g.Z=function(a){if(Ad(this)!==Ad(a))return!1;for(var b=this.Y,c=a.Y;b<=this.o.length;b++,c++)if(this.o[b]!==a.o[c])return!1;return!0;};g.contains=function(a){var b=this.Y,c=a.Y;if(Ad(this)>Ad(a))return!1;for(;b<this.o.length;){if(this.o[b]!==a.o[c])return!1;++b;++c;}return!0;};var C=new L("");function Pe(a,b){this.Qa=a.slice();this.Ha=Math.max(1,this.Qa.length);this.Pe=b;for(var c=0;c<this.Qa.length;c++)this.Ha+=nb(this.Qa[c]);Qe(this);}Pe.prototype.push=function(a){0<this.Qa.length&&(this.Ha+=1);this.Qa.push(a);this.Ha+=nb(a);Qe(this);};Pe.prototype.pop=function(){var a=this.Qa.pop();this.Ha-=nb(a);0<this.Qa.length&&--this.Ha;};function Qe(a){if(768<a.Ha)throw Error(a.Pe+"has a key path longer than 768 bytes ("+a.Ha+").");if(32<a.Qa.length)throw Error(a.Pe+"path specified exceeds the maximum depth that can be written (32) or object contains a cycle "+Re(a));}function Re(a){return 0==a.Qa.length?"":"in property '"+a.Qa.join(".")+"'";}function Se(a){a instanceof Te||Ac("Don't call new Database() directly - please use firebase.database().");this.ta=a;this.ba=new U(a,C);this.INTERNAL=new Ue(this);}var Ve={TIMESTAMP:{".sv":"timestamp"}};g=Se.prototype;g.app=null;g.jf=function(a){We(this,"ref");x("database.ref",0,1,arguments.length);return n(a)?this.ba.n(a):this.ba;};g.gg=function(a){We(this,"database.refFromURL");x("database.refFromURL",1,1,arguments.length);var b=Bc(a);Xe("database.refFromURL",b);var c=b.jc;c.host!==this.ta.L.host&&Ac("database.refFromURL: Host name does not match the current database: (found "+c.host+" but expected "+this.ta.L.host+")");return this.jf(b.path.toString());};function We(a,b){null===a.ta&&Ac("Cannot call "+b+" on a deleted database.");}g.Pf=function(){x("database.goOffline",0,0,arguments.length);We(this,"goOffline");this.ta.ab();};g.Qf=function(){x("database.goOnline",0,0,arguments.length);We(this,"goOnline");this.ta.kc();};Object.defineProperty(Se.prototype,"app",{get:function(){return this.ta.app;}});function Ue(a){this.Ya=a;}Ue.prototype.delete=function(){We(this.Ya,"delete");var a=Ye.Vb(),b=this.Ya.ta;w(a.lb,b.app.name)!==b&&Ac("Database "+b.app.name+" has already been deleted.");b.ab();delete a.lb[b.app.name];this.Ya.ta=null;this.Ya.ba=null;this.Ya=this.Ya.INTERNAL=null;return firebase$3.Promise.resolve();};Se.prototype.ref=Se.prototype.jf;Se.prototype.refFromURL=Se.prototype.gg;Se.prototype.goOnline=Se.prototype.Qf;Se.prototype.goOffline=Se.prototype.Pf;Ue.prototype["delete"]=Ue.prototype.delete;function mc(){this.k=this.B=null;}mc.prototype.find=function(a){if(null!=this.B)return this.B.P(a);if(a.e()||null==this.k)return null;var b=J(a);a=D(a);return this.k.contains(b)?this.k.get(b).find(a):null;};function oc(a,b,c){if(b.e())a.B=c,a.k=null;else if(null!==a.B)a.B=a.B.F(b,c);else{null==a.k&&(a.k=new oe());var d=J(b);a.k.contains(d)||a.k.add(d,new mc());a=a.k.get(d);b=D(b);oc(a,b,c);}}function Ze(a,b){if(b.e())return a.B=null,a.k=null,!0;if(null!==a.B){if(a.B.J())return!1;var c=a.B;a.B=null;c.O(N,function(b,c){oc(a,new L(b),c);});return Ze(a,b);}return null!==a.k?(c=J(b),b=D(b),a.k.contains(c)&&Ze(a.k.get(c),b)&&a.k.remove(c),a.k.e()?(a.k=null,!0):!1):!0;}function nc(a,b,c){null!==a.B?c(b,a.B):a.O(function(a,e){var f=new L(b.toString()+"/"+a);nc(e,f,c);});}mc.prototype.O=function(a){null!==this.k&&pe(this.k,function(b,c){a(b,c);});};var $e=/[\[\].#$\/\u0000-\u001F\u007F]/,af=/[\[\].#$\u0000-\u001F\u007F]/;function bf(a){return p(a)&&0!==a.length&&!$e.test(a);}function cf(a){return null===a||p(a)||ga(a)&&!Cc(a)||ia(a)&&cb(a,".sv");}function df(a,b,c,d){d&&!n(b)||ef(y(a,1,d),b,c);}function ef(a,b,c){c instanceof L&&(c=new Pe(c,a));if(!n(b))throw Error(a+"contains undefined "+Re(c));if(ha(b))throw Error(a+"contains a function "+Re(c)+" with contents: "+b.toString());if(Cc(b))throw Error(a+"contains "+b.toString()+" "+Re(c));if(p(b)&&b.length>10485760/3&&10485760<nb(b))throw Error(a+"contains a string greater than 10485760 utf8 bytes "+Re(c)+" ('"+b.substring(0,50)+"...')");if(ia(b)){var d=!1,e=!1;db(b,function(b,h){if(".value"===b)d=!0;else if(".priority"!==b&&".sv"!==b&&(e=!0,!bf(b)))throw Error(a+" contains an invalid key ("+b+") "+Re(c)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');c.push(b);ef(a,h,c);c.pop();});if(d&&e)throw Error(a+' contains ".value" child '+Re(c)+" in addition to actual children.");}}function ff(a,b){var c,d;for(c=0;c<b.length;c++){d=b[c];for(var e=d.slice(),f=0;f<e.length;f++)if((".priority"!==e[f]||f!==e.length-1)&&!bf(e[f]))throw Error(a+"contains an invalid key ("+e[f]+") in path "+d.toString()+'. Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');}b.sort(Oe);e=null;for(c=0;c<b.length;c++){d=b[c];if(null!==e&&e.contains(d))throw Error(a+"contains a path "+e.toString()+" that is ancestor of another path "+d.toString());e=d;}}function gf(a,b,c){var d=y(a,1,!1);if(!ia(b)||ea(b))throw Error(d+" must be an object containing the children to replace.");var e=[];db(b,function(a,b){var k=new L(a);ef(d,b,c.n(k));if(".priority"===Bd(k)&&!cf(b))throw Error(d+"contains an invalid value for '"+k.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");e.push(k);});ff(d,e);}function hf(a,b,c){if(Cc(c))throw Error(y(a,b,!1)+"is "+c.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!cf(c))throw Error(y(a,b,!1)+"must be a valid Firebase priority (a string, finite number, server value, or null).");}function jf(a,b,c){if(!c||n(b))switch(b){case"value":case"child_added":case"child_removed":case"child_changed":case"child_moved":break;default:throw Error(y(a,1,c)+'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');}}function kf(a,b){if(n(b)&&!bf(b))throw Error(y(a,2,!0)+'was an invalid key: "'+b+'".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").');}function lf(a,b){if(!p(b)||0===b.length||af.test(b))throw Error(y(a,1,!1)+'was an invalid path: "'+b+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"');}function mf(a,b){if(".info"===J(b))throw Error(a+" failed: Can't modify data under /.info/");}function Xe(a,b){var c=b.path.toString(),d;!(d=!p(b.jc.host)||0===b.jc.host.length||!bf(b.jc.me))&&(d=0!==c.length)&&(c&&(c=c.replace(/^\/*\.info(\/|$)/,"/")),d=!(p(c)&&0!==c.length&&!af.test(c)));if(d)throw Error(y(a,1,!1)+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".');}function V(a,b){this.ta=a;this.qa=b;}V.prototype.cancel=function(a){x("Firebase.onDisconnect().cancel",0,1,arguments.length);A("Firebase.onDisconnect().cancel",1,a,!0);var b=new hb();this.ta.vd(this.qa,ib(b,a));return b.ra;};V.prototype.cancel=V.prototype.cancel;V.prototype.remove=function(a){x("Firebase.onDisconnect().remove",0,1,arguments.length);mf("Firebase.onDisconnect().remove",this.qa);A("Firebase.onDisconnect().remove",1,a,!0);var b=new hb();nf(this.ta,this.qa,null,ib(b,a));return b.ra;};V.prototype.remove=V.prototype.remove;V.prototype.set=function(a,b){x("Firebase.onDisconnect().set",1,2,arguments.length);mf("Firebase.onDisconnect().set",this.qa);df("Firebase.onDisconnect().set",a,this.qa,!1);A("Firebase.onDisconnect().set",2,b,!0);var c=new hb();nf(this.ta,this.qa,a,ib(c,b));return c.ra;};V.prototype.set=V.prototype.set;V.prototype.Jb=function(a,b,c){x("Firebase.onDisconnect().setWithPriority",2,3,arguments.length);mf("Firebase.onDisconnect().setWithPriority",this.qa);df("Firebase.onDisconnect().setWithPriority",a,this.qa,!1);hf("Firebase.onDisconnect().setWithPriority",2,b);A("Firebase.onDisconnect().setWithPriority",3,c,!0);var d=new hb();of(this.ta,this.qa,a,b,ib(d,c));return d.ra;};V.prototype.setWithPriority=V.prototype.Jb;V.prototype.update=function(a,b){x("Firebase.onDisconnect().update",1,2,arguments.length);mf("Firebase.onDisconnect().update",this.qa);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;O("Passing an Array to Firebase.onDisconnect().update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.");}gf("Firebase.onDisconnect().update",a,this.qa);A("Firebase.onDisconnect().update",2,b,!0);c=new hb();pf(this.ta,this.qa,a,ib(c,b));return c.ra;};V.prototype.update=V.prototype.update;function qf(a){H(ea(a)&&0<a.length,"Requires a non-empty array");this.Bf=a;this.Cc={};}qf.prototype.De=function(a,b){var c;c=this.Cc[a]||[];var d=c.length;if(0<d){for(var e=Array(d),f=0;f<d;f++)e[f]=c[f];c=e;}else c=[];for(d=0;d<c.length;d++)c[d].He.apply(c[d].Ma,Array.prototype.slice.call(arguments,1));};qf.prototype.gc=function(a,b,c){rf(this,a);this.Cc[a]=this.Cc[a]||[];this.Cc[a].push({He:b,Ma:c});(a=this.Ue(a))&&b.apply(c,a);};qf.prototype.Hc=function(a,b,c){rf(this,a);a=this.Cc[a]||[];for(var d=0;d<a.length;d++)if(a[d].He===b&&(!c||c===a[d].Ma)){a.splice(d,1);break;}};function rf(a,b){H(Oa(a.Bf,function(a){return a===b;}),"Unknown event: "+b);}function sf(){qf.call(this,["online"]);this.hc=!0;if("undefined"!==typeof window&&"undefined"!==typeof window.addEventListener&&!qb()){var a=this;window.addEventListener("online",function(){a.hc||(a.hc=!0,a.De("online",!0));},!1);window.addEventListener("offline",function(){a.hc&&(a.hc=!1,a.De("online",!1));},!1);}}la(sf,qf);sf.prototype.Ue=function(a){H("online"===a,"Unknown event type: "+a);return[this.hc];};ca(sf);function tf(){qf.call(this,["visible"]);var a,b;"undefined"!==typeof document&&"undefined"!==typeof document.addEventListener&&("undefined"!==typeof document.hidden?(b="visibilitychange",a="hidden"):"undefined"!==typeof document.mozHidden?(b="mozvisibilitychange",a="mozHidden"):"undefined"!==typeof document.msHidden?(b="msvisibilitychange",a="msHidden"):"undefined"!==typeof document.webkitHidden&&(b="webkitvisibilitychange",a="webkitHidden"));this.Mb=!0;if(b){var c=this;document.addEventListener(b,function(){var b=!document[a];b!==c.Mb&&(c.Mb=b,c.De("visible",b));},!1);}}la(tf,qf);tf.prototype.Ue=function(a){H("visible"===a,"Unknown event type: "+a);return[this.Mb];};ca(tf);var uf=function(){var a=0,b=[];return function(c){var d=c===a;a=c;for(var e=Array(8),f=7;0<=f;f--)e[f]="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c%64),c=Math.floor(c/64);H(0===c,"Cannot push at time == 0");c=e.join("");if(d){for(f=11;0<=f&&63===b[f];f--)b[f]=0;b[f]++;}else for(f=0;12>f;f++)b[f]=Math.floor(64*Math.random());for(f=0;12>f;f++)c+="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);H(20===c.length,"nextPushId: Length should be 20.");return c;};}();function vf(a,b){this.La=a;this.ba=b?b:wf;}g=vf.prototype;g.Oa=function(a,b){return new vf(this.La,this.ba.Oa(a,b,this.La).X(null,null,!1,null,null));};g.remove=function(a){return new vf(this.La,this.ba.remove(a,this.La).X(null,null,!1,null,null));};g.get=function(a){for(var b,c=this.ba;!c.e();){b=this.La(a,c.key);if(0===b)return c.value;0>b?c=c.left:0<b&&(c=c.right);}return null;};function xf(a,b){for(var c,d=a.ba,e=null;!d.e();){c=a.La(b,d.key);if(0===c){if(d.left.e())return e?e.key:null;for(d=d.left;!d.right.e();)d=d.right;return d.key;}0>c?d=d.left:0<c&&(e=d,d=d.right);}throw Error("Attempted to find predecessor key for a nonexistent key.  What gives?");}g.e=function(){return this.ba.e();};g.count=function(){return this.ba.count();};g.Fc=function(){return this.ba.Fc();};g.ec=function(){return this.ba.ec();};g.ha=function(a){return this.ba.ha(a);};g.Wb=function(a){return new yf(this.ba,null,this.La,!1,a);};g.Xb=function(a,b){return new yf(this.ba,a,this.La,!1,b);};g.Zb=function(a,b){return new yf(this.ba,a,this.La,!0,b);};g.We=function(a){return new yf(this.ba,null,this.La,!0,a);};function yf(a,b,c,d,e){this.Fd=e||null;this.ie=d;this.Pa=[];for(e=1;!a.e();)if(e=b?c(a.key,b):1,d&&(e*=-1),0>e)a=this.ie?a.left:a.right;else if(0===e){this.Pa.push(a);break;}else this.Pa.push(a),a=this.ie?a.right:a.left;}function R(a){if(0===a.Pa.length)return null;var b=a.Pa.pop(),c;c=a.Fd?a.Fd(b.key,b.value):{key:b.key,value:b.value};if(a.ie)for(b=b.left;!b.e();)a.Pa.push(b),b=b.right;else for(b=b.right;!b.e();)a.Pa.push(b),b=b.left;return c;}function zf(a){if(0===a.Pa.length)return null;var b;b=a.Pa;b=b[b.length-1];return a.Fd?a.Fd(b.key,b.value):{key:b.key,value:b.value};}function Af(a,b,c,d,e){this.key=a;this.value=b;this.color=null!=c?c:!0;this.left=null!=d?d:wf;this.right=null!=e?e:wf;}g=Af.prototype;g.X=function(a,b,c,d,e){return new Af(null!=a?a:this.key,null!=b?b:this.value,null!=c?c:this.color,null!=d?d:this.left,null!=e?e:this.right);};g.count=function(){return this.left.count()+1+this.right.count();};g.e=function(){return!1;};g.ha=function(a){return this.left.ha(a)||a(this.key,this.value)||this.right.ha(a);};function Bf(a){return a.left.e()?a:Bf(a.left);}g.Fc=function(){return Bf(this).key;};g.ec=function(){return this.right.e()?this.key:this.right.ec();};g.Oa=function(a,b,c){var d,e;e=this;d=c(a,e.key);e=0>d?e.X(null,null,null,e.left.Oa(a,b,c),null):0===d?e.X(null,b,null,null,null):e.X(null,null,null,null,e.right.Oa(a,b,c));return Cf(e);};function Df(a){if(a.left.e())return wf;a.left.ea()||a.left.left.ea()||(a=Ef(a));a=a.X(null,null,null,Df(a.left),null);return Cf(a);}g.remove=function(a,b){var c,d;c=this;if(0>b(a,c.key))c.left.e()||c.left.ea()||c.left.left.ea()||(c=Ef(c)),c=c.X(null,null,null,c.left.remove(a,b),null);else{c.left.ea()&&(c=Ff(c));c.right.e()||c.right.ea()||c.right.left.ea()||(c=Gf(c),c.left.left.ea()&&(c=Ff(c),c=Gf(c)));if(0===b(a,c.key)){if(c.right.e())return wf;d=Bf(c.right);c=c.X(d.key,d.value,null,null,Df(c.right));}c=c.X(null,null,null,null,c.right.remove(a,b));}return Cf(c);};g.ea=function(){return this.color;};function Cf(a){a.right.ea()&&!a.left.ea()&&(a=Hf(a));a.left.ea()&&a.left.left.ea()&&(a=Ff(a));a.left.ea()&&a.right.ea()&&(a=Gf(a));return a;}function Ef(a){a=Gf(a);a.right.left.ea()&&(a=a.X(null,null,null,null,Ff(a.right)),a=Hf(a),a=Gf(a));return a;}function Hf(a){return a.right.X(null,null,a.color,a.X(null,null,!0,null,a.right.left),null);}function Ff(a){return a.left.X(null,null,a.color,null,a.X(null,null,!0,a.left.right,null));}function Gf(a){return a.X(null,null,!a.color,a.left.X(null,null,!a.left.color,null,null),a.right.X(null,null,!a.right.color,null,null));}function If(){}g=If.prototype;g.X=function(){return this;};g.Oa=function(a,b){return new Af(a,b,null);};g.remove=function(){return this;};g.count=function(){return 0;};g.e=function(){return!0;};g.ha=function(){return!1;};g.Fc=function(){return null;};g.ec=function(){return null;};g.ea=function(){return!1;};var wf=new If();function P(a,b,c){this.k=a;(this.aa=b)&&Sd(this.aa);a.e()&&H(!this.aa||this.aa.e(),"An empty node cannot have a priority");this.yb=c;this.Db=null;}g=P.prototype;g.J=function(){return!1;};g.C=function(){return this.aa||G;};g.fa=function(a){return this.k.e()?this:new P(this.k,a,this.yb);};g.Q=function(a){if(".priority"===a)return this.C();a=this.k.get(a);return null===a?G:a;};g.P=function(a){var b=J(a);return null===b?this:this.Q(b).P(D(a));};g.Da=function(a){return null!==this.k.get(a);};g.T=function(a,b){H(b,"We should always be passing snapshot nodes");if(".priority"===a)return this.fa(b);var c=new K(a,b),d,e;b.e()?(d=this.k.remove(a),c=me(this.yb,c,this.k)):(d=this.k.Oa(a,b),c=ke(this.yb,c,this.k));e=d.e()?G:this.aa;return new P(d,e,c);};g.F=function(a,b){var c=J(a);if(null===c)return b;H(".priority"!==J(a)||1===Ad(a),".priority must be the last token in a path");var d=this.Q(c).F(D(a),b);return this.T(c,d);};g.e=function(){return this.k.e();};g.Eb=function(){return this.k.count();};var Jf=/^(0|[1-9]\d*)$/;g=P.prototype;g.H=function(a){if(this.e())return null;var b={},c=0,d=0,e=!0;this.O(N,function(f,h){b[f]=h.H(a);c++;e&&Jf.test(f)?d=Math.max(d,Number(f)):e=!1;});if(!a&&e&&d<2*c){var f=[],h;for(h in b)f[h]=b[h];return f;}a&&!this.C().e()&&(b[".priority"]=this.C().H());return b;};g.hash=function(){if(null===this.Db){var a="";this.C().e()||(a+="priority:"+Ud(this.C().H())+":");this.O(N,function(b,c){var d=c.hash();""!==d&&(a+=":"+b+":"+d);});this.Db=""===a?"":uc(a);}return this.Db;};g.Ve=function(a,b,c){return(c=Kf(this,c))?(a=xf(c,new K(a,b)))?a.name:null:xf(this.k,a);};function Qd(a,b){var c;c=(c=Kf(a,b))?(c=c.Fc())&&c.name:a.k.Fc();return c?new K(c,a.k.get(c)):null;}function Rd(a,b){var c;c=(c=Kf(a,b))?(c=c.ec())&&c.name:a.k.ec();return c?new K(c,a.k.get(c)):null;}g.O=function(a,b){var c=Kf(this,a);return c?c.ha(function(a){return b(a.name,a.R);}):this.k.ha(b);};g.Wb=function(a){return this.Xb(a.Gc(),a);};g.Xb=function(a,b){var c=Kf(this,b);if(c)return c.Xb(a,function(a){return a;});for(var c=this.k.Xb(a.name,jc),d=zf(c);null!=d&&0>b.compare(d,a);)R(c),d=zf(c);return c;};g.We=function(a){return this.Zb(a.Ec(),a);};g.Zb=function(a,b){var c=Kf(this,b);if(c)return c.Zb(a,function(a){return a;});for(var c=this.k.Zb(a.name,jc),d=zf(c);null!=d&&0<b.compare(d,a);)R(c),d=zf(c);return c;};g.rc=function(a){return this.e()?a.e()?0:-1:a.J()||a.e()?1:a===Zd?-1:0;};g.nb=function(a){if(a===Fd||va(this.yb.cc,a.toString()))return this;var b=this.yb,c=this.k;H(a!==Fd,"KeyIndex always exists and isn't meant to be added to the IndexMap.");for(var d=[],e=!1,c=c.Wb(jc),f=R(c);f;)e=e||a.wc(f.R),d.push(f),f=R(c);d=e?le(d,Pd(a)):Wd;e=a.toString();c=za(b.cc);c[e]=a;a=za(b.md);a[e]=d;return new P(this.k,this.aa,new je(a,c));};g.xc=function(a){return a===Fd||va(this.yb.cc,a.toString());};g.Z=function(a){if(a===this)return!0;if(a.J())return!1;if(this.C().Z(a.C())&&this.k.count()===a.k.count()){var b=this.Wb(N);a=a.Wb(N);for(var c=R(b),d=R(a);c&&d;){if(c.name!==d.name||!c.R.Z(d.R))return!1;c=R(b);d=R(a);}return null===c&&null===d;}return!1;};function Kf(a,b){return b===Fd?null:a.yb.get(b.toString());}g.toString=function(){return B(this.H(!0));};function M(a,b){if(null===a)return G;var c=null;"object"===typeof a&&".priority"in a?c=a[".priority"]:"undefined"!==typeof b&&(c=b);H(null===c||"string"===typeof c||"number"===typeof c||"object"===typeof c&&".sv"in c,"Invalid priority type found: "+typeof c);"object"===typeof a&&".value"in a&&null!==a[".value"]&&(a=a[".value"]);if("object"!==typeof a||".sv"in a)return new qc(a,M(c));if(a instanceof Array){var d=G,e=a;r(e,function(a,b){if(cb(e,b)&&"."!==b.substring(0,1)){var c=M(a);if(c.J()||!c.e())d=d.T(b,c);}});return d.fa(M(c));}var f=[],h=!1,k=a;db(k,function(a){if("string"!==typeof a||"."!==a.substring(0,1)){var b=M(k[a]);b.e()||(h=h||!b.C().e(),f.push(new K(a,b)));}});if(0==f.length)return G;var l=le(f,gc,function(a){return a.name;},ic);if(h){var m=le(f,Pd(N));return new P(l,M(c),new je({".priority":m},{".priority":N}));}return new P(l,M(c),ne);}var Lf=Math.log(2);function Mf(a){this.count=parseInt(Math.log(a+1)/Lf,10);this.Ne=this.count-1;this.Cf=a+1&parseInt(Array(this.count+1).join("1"),2);}function Nf(a){var b=!(a.Cf&1<<a.Ne);a.Ne--;return b;}function le(a,b,c,d){function e(b,d){var f=d-b;if(0==f)return null;if(1==f){var m=a[b],u=c?c(m):m;return new Af(u,m.R,!1,null,null);}var m=parseInt(f/2,10)+b,f=e(b,m),z=e(m+1,d),m=a[m],u=c?c(m):m;return new Af(u,m.R,!1,f,z);}a.sort(b);var f=function(b){function d(b,h){var k=u-b,z=u;u-=b;var z=e(k+1,z),k=a[k],F=c?c(k):k,z=new Af(F,k.R,h,null,z);f?f.left=z:m=z;f=z;}for(var f=null,m=null,u=a.length,z=0;z<b.count;++z){var F=Nf(b),id=Math.pow(2,b.count-(z+1));F?d(id,!1):(d(id,!1),d(id,!0));}return m;}(new Mf(a.length));return null!==f?new vf(d||b,f):new vf(d||b);}function Ud(a){return"number"===typeof a?"number:"+Jc(a):"string:"+a;}function Sd(a){if(a.J()){var b=a.H();H("string"===typeof b||"number"===typeof b||"object"===typeof b&&cb(b,".sv"),"Priority must be a string or number.");}else H(a===Zd||a.e(),"priority of unexpected type.");H(a===Zd||a.C().e(),"Priority nodes can't have a priority of their own.");}var G=new P(new vf(ic),null,ne);function Of(){P.call(this,new vf(ic),G,ne);}la(Of,P);g=Of.prototype;g.rc=function(a){return a===this?0:1;};g.Z=function(a){return a===this;};g.C=function(){return this;};g.Q=function(){return G;};g.e=function(){return!1;};var Zd=new Of(),Xd=new K("[MIN_NAME]",G),ce=new K("[MAX_NAME]",Zd);function W(a,b,c){this.A=a;this.V=b;this.g=c;}W.prototype.H=function(){x("Firebase.DataSnapshot.val",0,0,arguments.length);return this.A.H();};W.prototype.val=W.prototype.H;W.prototype.Qe=function(){x("Firebase.DataSnapshot.exportVal",0,0,arguments.length);return this.A.H(!0);};W.prototype.exportVal=W.prototype.Qe;W.prototype.Lf=function(){x("Firebase.DataSnapshot.exists",0,0,arguments.length);return!this.A.e();};W.prototype.exists=W.prototype.Lf;W.prototype.n=function(a){x("Firebase.DataSnapshot.child",0,1,arguments.length);ga(a)&&(a=String(a));lf("Firebase.DataSnapshot.child",a);var b=new L(a),c=this.V.n(b);return new W(this.A.P(b),c,N);};W.prototype.child=W.prototype.n;W.prototype.Da=function(a){x("Firebase.DataSnapshot.hasChild",1,1,arguments.length);lf("Firebase.DataSnapshot.hasChild",a);var b=new L(a);return!this.A.P(b).e();};W.prototype.hasChild=W.prototype.Da;W.prototype.C=function(){x("Firebase.DataSnapshot.getPriority",0,0,arguments.length);return this.A.C().H();};W.prototype.getPriority=W.prototype.C;W.prototype.forEach=function(a){x("Firebase.DataSnapshot.forEach",1,1,arguments.length);A("Firebase.DataSnapshot.forEach",1,a,!1);if(this.A.J())return!1;var b=this;return!!this.A.O(this.g,function(c,d){return a(new W(d,b.V.n(c),N));});};W.prototype.forEach=W.prototype.forEach;W.prototype.hd=function(){x("Firebase.DataSnapshot.hasChildren",0,0,arguments.length);return this.A.J()?!1:!this.A.e();};W.prototype.hasChildren=W.prototype.hd;W.prototype.getKey=function(){x("Firebase.DataSnapshot.key",0,0,arguments.length);return this.V.getKey();};Lc(W.prototype,"key",W.prototype.getKey);W.prototype.Eb=function(){x("Firebase.DataSnapshot.numChildren",0,0,arguments.length);return this.A.Eb();};W.prototype.numChildren=W.prototype.Eb;W.prototype.wb=function(){x("Firebase.DataSnapshot.ref",0,0,arguments.length);return this.V;};Lc(W.prototype,"ref",W.prototype.wb);function yd(a,b){this.N=a;this.Jd=b;}function vd(a,b,c,d){return new yd(new $b(b,c,d),a.Jd);}function zd(a){return a.N.da?a.N.j():null;}yd.prototype.w=function(){return this.Jd;};function ac(a){return a.Jd.da?a.Jd.j():null;}function Pf(a,b){this.V=a;var c=a.m,d=new Gd(c.g),c=S(c)?new Gd(c.g):c.xa?new Md(c):new Hd(c);this.hf=new pd(c);var e=b.w(),f=b.N,h=d.ya(G,e.j(),null),k=c.ya(G,f.j(),null);this.Ka=new yd(new $b(k,f.da,c.Na()),new $b(h,e.da,d.Na()));this.Za=[];this.Jf=new kd(a);}function Qf(a){return a.V;}g=Pf.prototype;g.w=function(){return this.Ka.w().j();};g.hb=function(a){var b=ac(this.Ka);return b&&(S(this.V.m)||!a.e()&&!b.Q(J(a)).e())?b.P(a):null;};g.e=function(){return 0===this.Za.length;};g.Nb=function(a){this.Za.push(a);};g.kb=function(a,b){var c=[];if(b){H(null==a,"A cancel should cancel all event registrations.");var d=this.V.path;Ja(this.Za,function(a){(a=a.Le(b,d))&&c.push(a);});}if(a){for(var e=[],f=0;f<this.Za.length;++f){var h=this.Za[f];if(!h.matches(a))e.push(h);else if(a.Xe()){e=e.concat(this.Za.slice(f+1));break;}}this.Za=e;}else this.Za=[];return c;};g.eb=function(a,b,c){a.type===Wc&&null!==a.source.Hb&&(H(ac(this.Ka),"We should always have a full cache before handling merges"),H(zd(this.Ka),"Missing event cache, even though we have a server cache"));var d=this.Ka;a=this.hf.eb(d,a,b,c);b=this.hf;c=a.Qd;H(c.N.j().xc(b.U.g),"Event snap not indexed");H(c.w().j().xc(b.U.g),"Server snap not indexed");H(dc(a.Qd.w())||!dc(d.w()),"Once a server snap is complete, it should never go back");this.Ka=a.Qd;return Rf(this,a.Df,a.Qd.N.j(),null);};function Sf(a,b){var c=a.Ka.N,d=[];c.j().J()||c.j().O(N,function(a,b){d.push(new I("child_added",b,a));});c.da&&d.push(bc(c.j()));return Rf(a,d,c.j(),b);}function Rf(a,b,c,d){return ld(a.Jf,b,c,d?[d]:a.Za);}function Tf(a,b,c){this.Pb=a;this.rb=b;this.tb=c||null;}g=Tf.prototype;g.nf=function(a){return"value"===a;};g.createEvent=function(a,b){var c=b.m.g;return new Ub("value",this,new W(a.Ja,b.wb(),c));};g.Tb=function(a){var b=this.tb;if("cancel"===a.de()){H(this.rb,"Raising a cancel event on a listener with no cancel callback");var c=this.rb;return function(){c.call(b,a.error);};}var d=this.Pb;return function(){d.call(b,a.Kd);};};g.Le=function(a,b){return this.rb?new Vb(this,a,b):null;};g.matches=function(a){return a instanceof Tf?a.Pb&&this.Pb?a.Pb===this.Pb&&a.tb===this.tb:!0:!1;};g.Xe=function(){return null!==this.Pb;};function Uf(a,b,c){this.ga=a;this.rb=b;this.tb=c;}g=Uf.prototype;g.nf=function(a){a="children_added"===a?"child_added":a;return("children_removed"===a?"child_removed":a)in this.ga;};g.Le=function(a,b){return this.rb?new Vb(this,a,b):null;};g.createEvent=function(a,b){H(null!=a.Xa,"Child events should have a childName.");var c=b.wb().n(a.Xa);return new Ub(a.type,this,new W(a.Ja,c,b.m.g),a.Bd);};g.Tb=function(a){var b=this.tb;if("cancel"===a.de()){H(this.rb,"Raising a cancel event on a listener with no cancel callback");var c=this.rb;return function(){c.call(b,a.error);};}var d=this.ga[a.fd];return function(){d.call(b,a.Kd,a.Bd);};};g.matches=function(a){if(a instanceof Uf){if(!this.ga||!a.ga)return!0;if(this.tb===a.tb){var b=ra(a.ga);if(b===ra(this.ga)){if(1===b){var b=sa(a.ga),c=sa(this.ga);return c===b&&(!a.ga[b]||!this.ga[c]||a.ga[b]===this.ga[c]);}return qa(this.ga,function(b,c){return a.ga[c]===b;});}}}return!1;};g.Xe=function(){return null!==this.ga;};function X(a,b,c,d){this.u=a;this.path=b;this.m=c;this.Mc=d;}function Vf(a){var b=null,c=null;a.ka&&(b=Jd(a));a.na&&(c=Ld(a));if(a.g===Fd){if(a.ka){if("[MIN_NAME]"!=Id(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==typeof b)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}if(a.na){if("[MAX_NAME]"!=Kd(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==typeof c)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}}else if(a.g===N){if(null!=b&&!cf(b)||null!=c&&!cf(c))throw Error("Query: When ordering by priority, the first argument passed to startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string).");}else if(H(a.g instanceof Yd||a.g===de,"unknown index type."),null!=b&&"object"===typeof b||null!=c&&"object"===typeof c)throw Error("Query: First argument passed to startAt(), endAt(), or equalTo() cannot be an object.");}function Wf(a){if(a.ka&&a.na&&a.xa&&(!a.xa||""===a.mb))throw Error("Query: Can't combine startAt(), endAt(), and limit(). Use limitToFirst() or limitToLast() instead.");}function Xf(a,b){if(!0===a.Mc)throw Error(b+": You can't combine multiple orderBy calls.");}g=X.prototype;g.wb=function(){x("Query.ref",0,0,arguments.length);return new U(this.u,this.path);};g.gc=function(a,b,c,d){x("Query.on",2,4,arguments.length);jf("Query.on",a,!1);A("Query.on",2,b,!1);var e=Yf("Query.on",c,d);if("value"===a)Zf(this.u,this,new Tf(b,e.cancel||null,e.Ma||null));else{var f={};f[a]=b;Zf(this.u,this,new Uf(f,e.cancel,e.Ma));}return b;};g.Hc=function(a,b,c){x("Query.off",0,3,arguments.length);jf("Query.off",a,!0);A("Query.off",2,b,!0);eb("Query.off",3,c);var d=null,e=null;"value"===a?d=new Tf(b||null,null,c||null):a&&(b&&(e={},e[a]=b),d=new Uf(e,null,c||null));e=this.u;d=".info"===J(this.path)?e.nd.kb(this,d):e.K.kb(this,d);Qb(e.ca,this.path,d);};g.$f=function(a,b){function c(k){f&&(f=!1,e.Hc(a,c),b&&b.call(d.Ma,k),h.resolve(k));}x("Query.once",1,4,arguments.length);jf("Query.once",a,!1);A("Query.once",2,b,!0);var d=Yf("Query.once",arguments[2],arguments[3]),e=this,f=!0,h=new hb();jb(h.ra);this.gc(a,c,function(b){e.Hc(a,c);d.cancel&&d.cancel.call(d.Ma,b);h.reject(b);});return h.ra;};g.ke=function(a){x("Query.limitToFirst",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToFirst: First argument must be a positive integer.");if(this.m.xa)throw Error("Query.limitToFirst: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new X(this.u,this.path,this.m.ke(a),this.Mc);};g.le=function(a){x("Query.limitToLast",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToLast: First argument must be a positive integer.");if(this.m.xa)throw Error("Query.limitToLast: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new X(this.u,this.path,this.m.le(a),this.Mc);};g.ag=function(a){x("Query.orderByChild",1,1,arguments.length);if("$key"===a)throw Error('Query.orderByChild: "$key" is invalid.  Use Query.orderByKey() instead.');if("$priority"===a)throw Error('Query.orderByChild: "$priority" is invalid.  Use Query.orderByPriority() instead.');if("$value"===a)throw Error('Query.orderByChild: "$value" is invalid.  Use Query.orderByValue() instead.');lf("Query.orderByChild",a);Xf(this,"Query.orderByChild");var b=new L(a);if(b.e())throw Error("Query.orderByChild: cannot pass in empty path.  Use Query.orderByValue() instead.");b=new Yd(b);b=he(this.m,b);Vf(b);return new X(this.u,this.path,b,!0);};g.bg=function(){x("Query.orderByKey",0,0,arguments.length);Xf(this,"Query.orderByKey");var a=he(this.m,Fd);Vf(a);return new X(this.u,this.path,a,!0);};g.cg=function(){x("Query.orderByPriority",0,0,arguments.length);Xf(this,"Query.orderByPriority");var a=he(this.m,N);Vf(a);return new X(this.u,this.path,a,!0);};g.dg=function(){x("Query.orderByValue",0,0,arguments.length);Xf(this,"Query.orderByValue");var a=he(this.m,de);Vf(a);return new X(this.u,this.path,a,!0);};g.Ld=function(a,b){x("Query.startAt",0,2,arguments.length);df("Query.startAt",a,this.path,!0);kf("Query.startAt",b);var c=this.m.Ld(a,b);Wf(c);Vf(c);if(this.m.ka)throw Error("Query.startAt: Starting point was already set (by another call to startAt or equalTo).");n(a)||(b=a=null);return new X(this.u,this.path,c,this.Mc);};g.ed=function(a,b){x("Query.endAt",0,2,arguments.length);df("Query.endAt",a,this.path,!0);kf("Query.endAt",b);var c=this.m.ed(a,b);Wf(c);Vf(c);if(this.m.na)throw Error("Query.endAt: Ending point was already set (by another call to endAt or equalTo).");return new X(this.u,this.path,c,this.Mc);};g.If=function(a,b){x("Query.equalTo",1,2,arguments.length);df("Query.equalTo",a,this.path,!1);kf("Query.equalTo",b);if(this.m.ka)throw Error("Query.equalTo: Starting point was already set (by another call to endAt or equalTo).");if(this.m.na)throw Error("Query.equalTo: Ending point was already set (by another call to endAt or equalTo).");return this.Ld(a,b).ed(a,b);};g.toString=function(){x("Query.toString",0,0,arguments.length);for(var a=this.path,b="",c=a.Y;c<a.o.length;c++)""!==a.o[c]&&(b+="/"+encodeURIComponent(String(a.o[c])));return this.u.toString()+(b||"/");};g.ja=function(){var a=Gc(ie(this.m));return"{}"===a?"default":a;};g.isEqual=function(a){x("Query.isEqual",1,1,arguments.length);if(!(a instanceof X))throw Error("Query.isEqual failed: First argument must be an instance of firebase.database.Query.");var b=this.u===a.u,c=this.path.Z(a.path),d=this.ja()===a.ja();return b&&c&&d;};function Yf(a,b,c){var d={cancel:null,Ma:null};if(b&&c)d.cancel=b,A(a,3,d.cancel,!0),d.Ma=c,eb(a,4,d.Ma);else if(b)if("object"===typeof b&&null!==b)d.Ma=b;else if("function"===typeof b)d.cancel=b;else throw Error(y(a,3,!0)+" must either be a cancel callback or a context object.");return d;}X.prototype.on=X.prototype.gc;X.prototype.off=X.prototype.Hc;X.prototype.once=X.prototype.$f;X.prototype.limitToFirst=X.prototype.ke;X.prototype.limitToLast=X.prototype.le;X.prototype.orderByChild=X.prototype.ag;X.prototype.orderByKey=X.prototype.bg;X.prototype.orderByPriority=X.prototype.cg;X.prototype.orderByValue=X.prototype.dg;X.prototype.startAt=X.prototype.Ld;X.prototype.endAt=X.prototype.ed;X.prototype.equalTo=X.prototype.If;X.prototype.toString=X.prototype.toString;X.prototype.isEqual=X.prototype.isEqual;Lc(X.prototype,"ref",X.prototype.wb);function $f(a,b){this.value=a;this.children=b||ag;}var ag=new vf(function(a,b){return a===b?0:a<b?-1:1;});function bg(a){var b=Q;r(a,function(a,d){b=b.set(new L(d),a);});return b;}g=$f.prototype;g.e=function(){return null===this.value&&this.children.e();};function cg(a,b,c){if(null!=a.value&&c(a.value))return{path:C,value:a.value};if(b.e())return null;var d=J(b);a=a.children.get(d);return null!==a?(b=cg(a,D(b),c),null!=b?{path:new L(d).n(b.path),value:b.value}:null):null;}function dg(a,b){return cg(a,b,function(){return!0;});}g.subtree=function(a){if(a.e())return this;var b=this.children.get(J(a));return null!==b?b.subtree(D(a)):Q;};g.set=function(a,b){if(a.e())return new $f(b,this.children);var c=J(a),d=(this.children.get(c)||Q).set(D(a),b),c=this.children.Oa(c,d);return new $f(this.value,c);};g.remove=function(a){if(a.e())return this.children.e()?Q:new $f(null,this.children);var b=J(a),c=this.children.get(b);return c?(a=c.remove(D(a)),b=a.e()?this.children.remove(b):this.children.Oa(b,a),null===this.value&&b.e()?Q:new $f(this.value,b)):this;};g.get=function(a){if(a.e())return this.value;var b=this.children.get(J(a));return b?b.get(D(a)):null;};function Ed(a,b,c){if(b.e())return c;var d=J(b);b=Ed(a.children.get(d)||Q,D(b),c);d=b.e()?a.children.remove(d):a.children.Oa(d,b);return new $f(a.value,d);}function eg(a,b){return fg(a,C,b);}function fg(a,b,c){var d={};a.children.ha(function(a,f){d[a]=fg(f,b.n(a),c);});return c(b,a.value,d);}function gg(a,b,c){return hg(a,b,C,c);}function hg(a,b,c,d){var e=a.value?d(c,a.value):!1;if(e)return e;if(b.e())return null;e=J(b);return(a=a.children.get(e))?hg(a,D(b),c.n(e),d):null;}function ig(a,b,c){jg(a,b,C,c);}function jg(a,b,c,d){if(b.e())return a;a.value&&d(c,a.value);var e=J(b);return(a=a.children.get(e))?jg(a,D(b),c.n(e),d):Q;}function Cd(a,b){kg(a,C,b);}function kg(a,b,c){a.children.ha(function(a,e){kg(e,b.n(a),c);});a.value&&c(b,a.value);}function lg(a,b){a.children.ha(function(a,d){d.value&&b(a,d.value);});}var Q=new $f(null);$f.prototype.toString=function(){var a={};Cd(this,function(b,c){a[b.toString()]=c.toString();});return B(a);};function mg(a,b,c){this.type=ud;this.source=ng;this.path=a;this.Ob=b;this.Gd=c;}mg.prototype.Lc=function(a){if(this.path.e()){if(null!=this.Ob.value)return H(this.Ob.children.e(),"affectedTree should not have overlapping affected paths."),this;a=this.Ob.subtree(new L(a));return new mg(C,a,this.Gd);}H(J(this.path)===a,"operationForChild called for unrelated child.");return new mg(D(this.path),this.Ob,this.Gd);};mg.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" ack write revert="+this.Gd+" affectedTree="+this.Ob+")";};var Bb=0,Wc=1,ud=2,Db=3;function og(a,b,c,d){this.be=a;this.Se=b;this.Hb=c;this.Be=d;H(!d||b,"Tagged queries must be from server.");}var ng=new og(!0,!1,null,!1),pg=new og(!1,!0,null,!1);og.prototype.toString=function(){return this.be?"user":this.Be?"server(queryID="+this.Hb+")":"server";};function qg(a){this.W=a;}var rg=new qg(new $f(null));function sg(a,b,c){if(b.e())return new qg(new $f(c));var d=dg(a.W,b);if(null!=d){var e=d.path,d=d.value;b=T(e,b);d=d.F(b,c);return new qg(a.W.set(e,d));}a=Ed(a.W,b,new $f(c));return new qg(a);}function tg(a,b,c){var d=a;db(c,function(a,c){d=sg(d,b.n(a),c);});return d;}qg.prototype.Cd=function(a){if(a.e())return rg;a=Ed(this.W,a,Q);return new qg(a);};function ug(a,b){var c=dg(a.W,b);return null!=c?a.W.get(c.path).P(T(c.path,b)):null;}function vg(a){var b=[],c=a.W.value;null!=c?c.J()||c.O(N,function(a,c){b.push(new K(a,c));}):a.W.children.ha(function(a,c){null!=c.value&&b.push(new K(a,c.value));});return b;}function wg(a,b){if(b.e())return a;var c=ug(a,b);return null!=c?new qg(new $f(c)):new qg(a.W.subtree(b));}qg.prototype.e=function(){return this.W.e();};qg.prototype.apply=function(a){return xg(C,this.W,a);};function xg(a,b,c){if(null!=b.value)return c.F(a,b.value);var d=null;b.children.ha(function(b,f){".priority"===b?(H(null!==f.value,"Priority writes must always be leaf nodes"),d=f.value):c=xg(a.n(b),f,c);});c.P(a).e()||null===d||(c=c.F(a.n(".priority"),d));return c;}function yg(){this.za={};}g=yg.prototype;g.e=function(){return ya(this.za);};g.eb=function(a,b,c){var d=a.source.Hb;if(null!==d)return d=w(this.za,d),H(null!=d,"SyncTree gave us an op for an invalid query."),d.eb(a,b,c);var e=[];r(this.za,function(d){e=e.concat(d.eb(a,b,c));});return e;};g.Nb=function(a,b,c,d,e){var f=a.ja(),h=w(this.za,f);if(!h){var h=c.Aa(e?d:null),k=!1;h?k=!0:(h=d instanceof P?c.qc(d):G,k=!1);h=new Pf(a,new yd(new $b(h,k,!1),new $b(d,e,!1)));this.za[f]=h;}h.Nb(b);return Sf(h,b);};g.kb=function(a,b,c){var d=a.ja(),e=[],f=[],h=null!=zg(this);if("default"===d){var k=this;r(this.za,function(a,d){f=f.concat(a.kb(b,c));a.e()&&(delete k.za[d],S(a.V.m)||e.push(a.V));});}else{var l=w(this.za,d);l&&(f=f.concat(l.kb(b,c)),l.e()&&(delete this.za[d],S(l.V.m)||e.push(l.V)));}h&&null==zg(this)&&e.push(new U(a.u,a.path));return{hg:e,Kf:f};};function Ag(a){return Ka(ta(a.za),function(a){return!S(a.V.m);});}g.hb=function(a){var b=null;r(this.za,function(c){b=b||c.hb(a);});return b;};function Bg(a,b){if(S(b.m))return zg(a);var c=b.ja();return w(a.za,c);}function zg(a){return xa(a.za,function(a){return S(a.V.m);})||null;}function Cg(){this.S=rg;this.la=[];this.Ac=-1;}function Dg(a,b){for(var c=0;c<a.la.length;c++){var d=a.la[c];if(d.Yc===b)return d;}return null;}g=Cg.prototype;g.Cd=function(a){var b=Pa(this.la,function(b){return b.Yc===a;});H(0<=b,"removeWrite called with nonexistent writeId.");var c=this.la[b];this.la.splice(b,1);for(var d=c.visible,e=!1,f=this.la.length-1;d&&0<=f;){var h=this.la[f];h.visible&&(f>=b&&Eg(h,c.path)?d=!1:c.path.contains(h.path)&&(e=!0));f--;}if(d){if(e)this.S=Fg(this.la,Gg,C),this.Ac=0<this.la.length?this.la[this.la.length-1].Yc:-1;else if(c.Ga)this.S=this.S.Cd(c.path);else{var k=this;r(c.children,function(a,b){k.S=k.S.Cd(c.path.n(b));});}return!0;}return!1;};g.Aa=function(a,b,c,d){if(c||d){var e=wg(this.S,a);return!d&&e.e()?b:d||null!=b||null!=ug(e,C)?(e=Fg(this.la,function(b){return(b.visible||d)&&(!c||!(0<=Ia(c,b.Yc)))&&(b.path.contains(a)||a.contains(b.path));},a),b=b||G,e.apply(b)):null;}e=ug(this.S,a);if(null!=e)return e;e=wg(this.S,a);return e.e()?b:null!=b||null!=ug(e,C)?(b=b||G,e.apply(b)):null;};g.qc=function(a,b){var c=G,d=ug(this.S,a);if(d)d.J()||d.O(N,function(a,b){c=c.T(a,b);});else if(b){var e=wg(this.S,a);b.O(N,function(a,b){var d=wg(e,new L(a)).apply(b);c=c.T(a,d);});Ja(vg(e),function(a){c=c.T(a.name,a.R);});}else e=wg(this.S,a),Ja(vg(e),function(a){c=c.T(a.name,a.R);});return c;};g.Zc=function(a,b,c,d){H(c||d,"Either existingEventSnap or existingServerSnap must exist");a=a.n(b);if(null!=ug(this.S,a))return null;a=wg(this.S,a);return a.e()?d.P(b):a.apply(d.P(b));};g.pc=function(a,b,c){a=a.n(b);var d=ug(this.S,a);return null!=d?d:Zb(c,b)?wg(this.S,a).apply(c.j().Q(b)):null;};g.lc=function(a){return ug(this.S,a);};g.Vd=function(a,b,c,d,e,f){var h;a=wg(this.S,a);h=ug(a,C);if(null==h)if(null!=b)h=a.apply(b);else return[];h=h.nb(f);if(h.e()||h.J())return[];b=[];a=Pd(f);e=e?h.Zb(c,f):h.Xb(c,f);for(f=R(e);f&&b.length<d;)0!==a(f,c)&&b.push(f),f=R(e);return b;};function Eg(a,b){return a.Ga?a.path.contains(b):!!wa(a.children,function(c,d){return a.path.n(d).contains(b);});}function Gg(a){return a.visible;}function Fg(a,b,c){for(var d=rg,e=0;e<a.length;++e){var f=a[e];if(b(f)){var h=f.path;if(f.Ga)c.contains(h)?(h=T(c,h),d=sg(d,h,f.Ga)):h.contains(c)&&(h=T(h,c),d=sg(d,C,f.Ga.P(h)));else if(f.children){if(c.contains(h))h=T(c,h),d=tg(d,h,f.children);else{if(h.contains(c))if(h=T(h,c),h.e())d=tg(d,C,f.children);else if(f=w(f.children,J(h)))f=f.P(D(h)),d=sg(d,C,f);}}else throw sc("WriteRecord should have .snap or .children");}}return d;}function Hg(a,b){this.Lb=a;this.W=b;}g=Hg.prototype;g.Aa=function(a,b,c){return this.W.Aa(this.Lb,a,b,c);};g.qc=function(a){return this.W.qc(this.Lb,a);};g.Zc=function(a,b,c){return this.W.Zc(this.Lb,a,b,c);};g.lc=function(a){return this.W.lc(this.Lb.n(a));};g.Vd=function(a,b,c,d,e){return this.W.Vd(this.Lb,a,b,c,d,e);};g.pc=function(a,b){return this.W.pc(this.Lb,a,b);};g.n=function(a){return new Hg(this.Lb.n(a),this.W);};function Ig(){this.children={};this.$c=0;this.value=null;}function Jg(a,b,c){this.sd=a?a:"";this.Oc=b?b:null;this.A=c?c:new Ig();}function Kg(a,b){for(var c=b instanceof L?b:new L(b),d=a,e;null!==(e=J(c));)d=new Jg(e,d,w(d.A.children,e)||new Ig()),c=D(c);return d;}g=Jg.prototype;g.Ca=function(){return this.A.value;};function Lg(a,b){H("undefined"!==typeof b,"Cannot set value to undefined");a.A.value=b;Mg(a);}g.clear=function(){this.A.value=null;this.A.children={};this.A.$c=0;Mg(this);};g.hd=function(){return 0<this.A.$c;};g.e=function(){return null===this.Ca()&&!this.hd();};g.O=function(a){var b=this;r(this.A.children,function(c,d){a(new Jg(d,b,c));});};function Ng(a,b,c,d){c&&!d&&b(a);a.O(function(a){Ng(a,b,!0,d);});c&&d&&b(a);}function Og(a,b){for(var c=a.parent();null!==c&&!b(c);)c=c.parent();}g.path=function(){return new L(null===this.Oc?this.sd:this.Oc.path()+"/"+this.sd);};g.name=function(){return this.sd;};g.parent=function(){return this.Oc;};function Mg(a){if(null!==a.Oc){var b=a.Oc,c=a.sd,d=a.e(),e=cb(b.A.children,c);d&&e?(delete b.A.children[c],b.A.$c--,Mg(b)):d||e||(b.A.children[c]=a.A,b.A.$c++,Mg(b));}}function Pg(a,b,c,d,e,f){this.id=Qg++;this.f=yc("p:"+this.id+":");this.od={};this.$={};this.pa=[];this.Nc=0;this.Jc=[];this.ma=!1;this.Sa=1E3;this.rd=3E5;this.Gb=b;this.Ic=c;this.re=d;this.L=a;this.ob=this.Fa=this.Cb=this.we=null;this.Td=e;this.ae=!1;this.he=0;if(f)throw Error("Auth override specified in options, but not supported on non Node.js platforms");this.Ge=f||null;this.ub=null;this.Mb=!1;this.Ed={};this.ig=0;this.Re=!0;this.zc=this.je=null;Rg(this,0);tf.Vb().gc("visible",this.Zf,this);-1===a.host.indexOf("fblocal")&&sf.Vb().gc("online",this.Yf,this);}var Qg=0,Sg=0;g=Pg.prototype;g.ua=function(a,b,c){var d=++this.ig;a={r:d,a:a,b:b};this.f(B(a));H(this.ma,"sendRequest call when we're not connected not allowed.");this.Fa.ua(a);c&&(this.Ed[d]=c);};g.$e=function(a,b,c,d){var e=a.ja(),f=a.path.toString();this.f("Listen called for "+f+" "+e);this.$[f]=this.$[f]||{};H(Sc(a.m)||!S(a.m),"listen() called for non-default but complete query");H(!this.$[f][e],"listen() called twice for same path/queryId.");a={G:d,jd:b,eg:a,tag:c};this.$[f][e]=a;this.ma&&Tg(this,a);};function Tg(a,b){var c=b.eg,d=c.path.toString(),e=c.ja();a.f("Listen on "+d+" for "+e);var f={p:d};b.tag&&(f.q=ie(c.m),f.t=b.tag);f.h=b.jd();a.ua("q",f,function(f){var k=f.d,l=f.s;if(k&&"object"===typeof k&&cb(k,"w")){var m=w(k,"w");ea(m)&&0<=Ia(m,"no_index")&&O("Using an unspecified index. Consider adding "+('".indexOn": "'+c.m.g.toString()+'"')+" at "+c.path.toString()+" to your security rules for better performance");}(a.$[d]&&a.$[d][e])===b&&(a.f("listen response",f),"ok"!==l&&Ug(a,d,e),b.G&&b.G(l,k));});}g.kf=function(a){this.ob=a;this.f("Auth token refreshed");this.ob?Vg(this):this.ma&&this.ua("unauth",{},function(){});if(a&&40===a.length||Pc(a))this.f("Admin auth credential detected.  Reducing max reconnect time."),this.rd=3E4;};function Vg(a){if(a.ma&&a.ob){var b=a.ob,c=Oc(b)?"auth":"gauth",d={cred:b};a.Ge&&(d.authvar=a.Ge);a.ua(c,d,function(c){var d=c.s;c=c.d||"error";a.ob===b&&("ok"===d?a.he=0:Wg(a,d,c));});}}g.uf=function(a,b){var c=a.path.toString(),d=a.ja();this.f("Unlisten called for "+c+" "+d);H(Sc(a.m)||!S(a.m),"unlisten() called for non-default but complete query");if(Ug(this,c,d)&&this.ma){var e=ie(a.m);this.f("Unlisten on "+c+" for "+d);c={p:c};b&&(c.q=e,c.t=b);this.ua("n",c);}};g.oe=function(a,b,c){this.ma?Xg(this,"o",a,b,c):this.Jc.push({te:a,action:"o",data:b,G:c});};g.cf=function(a,b,c){this.ma?Xg(this,"om",a,b,c):this.Jc.push({te:a,action:"om",data:b,G:c});};g.vd=function(a,b){this.ma?Xg(this,"oc",a,null,b):this.Jc.push({te:a,action:"oc",data:null,G:b});};function Xg(a,b,c,d,e){c={p:c,d:d};a.f("onDisconnect "+b,c);a.ua(b,c,function(a){e&&setTimeout(function(){e(a.s,a.d);},Math.floor(0));});}g.put=function(a,b,c,d){Yg(this,"p",a,b,c,d);};g.af=function(a,b,c,d){Yg(this,"m",a,b,c,d);};function Yg(a,b,c,d,e,f){d={p:c,d:d};n(f)&&(d.h=f);a.pa.push({action:b,mf:d,G:e});a.Nc++;b=a.pa.length-1;a.ma?Zg(a,b):a.f("Buffering put: "+c);}function Zg(a,b){var c=a.pa[b].action,d=a.pa[b].mf,e=a.pa[b].G;a.pa[b].fg=a.ma;a.ua(c,d,function(d){a.f(c+" response",d);delete a.pa[b];a.Nc--;0===a.Nc&&(a.pa=[]);e&&e(d.s,d.d);});}g.ve=function(a){this.ma&&(a={c:a},this.f("reportStats",a),this.ua("s",a,function(a){"ok"!==a.s&&this.f("reportStats","Error sending stats: "+a.d);}));};g.ud=function(a){if("r"in a){this.f("from server: "+B(a));var b=a.r,c=this.Ed[b];c&&(delete this.Ed[b],c(a.b));}else{if("error"in a)throw"A server-side error has occurred: "+a.error;"a"in a&&(b=a.a,a=a.b,this.f("handleServerMessage",b,a),"d"===b?this.Gb(a.p,a.d,!1,a.t):"m"===b?this.Gb(a.p,a.d,!0,a.t):"c"===b?$g(this,a.p,a.q):"ac"===b?Wg(this,a.s,a.d):"sd"===b?this.we?this.we(a):"msg"in a&&"undefined"!==typeof console&&console.log("FIREBASE: "+a.msg.replace("\n","\nFIREBASE: ")):zc("Unrecognized action received from server: "+B(b)+"\nAre you using the latest client?"));}};g.Kc=function(a,b){this.f("connection ready");this.ma=!0;this.zc=new Date().getTime();this.re({serverTimeOffset:a-new Date().getTime()});this.Cb=b;if(this.Re){var c={};c["sdk.js."+firebase$3.SDK_VERSION.replace(/\./g,"-")]=1;qb()?c["framework.cordova"]=1:"object"===typeof navigator&&"ReactNative"===navigator.product&&(c["framework.reactnative"]=1);this.ve(c);}ah(this);this.Re=!1;this.Ic(!0);};function Rg(a,b){H(!a.Fa,"Scheduling a connect when we're already connected/ing?");a.ub&&clearTimeout(a.ub);a.ub=setTimeout(function(){a.ub=null;bh(a);},Math.floor(b));}g.Zf=function(a){a&&!this.Mb&&this.Sa===this.rd&&(this.f("Window became visible.  Reducing delay."),this.Sa=1E3,this.Fa||Rg(this,0));this.Mb=a;};g.Yf=function(a){a?(this.f("Browser went online."),this.Sa=1E3,this.Fa||Rg(this,0)):(this.f("Browser went offline.  Killing connection."),this.Fa&&this.Fa.close());};g.df=function(){this.f("data client disconnected");this.ma=!1;this.Fa=null;for(var a=0;a<this.pa.length;a++){var b=this.pa[a];b&&"h"in b.mf&&b.fg&&(b.G&&b.G("disconnect"),delete this.pa[a],this.Nc--);}0===this.Nc&&(this.pa=[]);this.Ed={};ch(this)&&(this.Mb?this.zc&&(3E4<new Date().getTime()-this.zc&&(this.Sa=1E3),this.zc=null):(this.f("Window isn't visible.  Delaying reconnect."),this.Sa=this.rd,this.je=new Date().getTime()),a=Math.max(0,this.Sa-(new Date().getTime()-this.je)),a*=Math.random(),this.f("Trying to reconnect in "+a+"ms"),Rg(this,a),this.Sa=Math.min(this.rd,1.3*this.Sa));this.Ic(!1);};function bh(a){if(ch(a)){a.f("Making a connection attempt");a.je=new Date().getTime();a.zc=null;var b=q(a.ud,a),c=q(a.Kc,a),d=q(a.df,a),e=a.id+":"+Sg++,f=a.Cb,h=!1,k=null,l=function(){k?k.close():(h=!0,d());};a.Fa={close:l,ua:function(a){H(k,"sendRequest call when we're not connected not allowed.");k.ua(a);}};var m=a.ae;a.ae=!1;a.Td.getToken(m).then(function(l){h?E("getToken() completed but was canceled"):(E("getToken() completed. Creating connection."),a.ob=l&&l.accessToken,k=new Ce(e,a.L,b,c,d,function(b){O(b+" ("+a.L.toString()+")");a.ab("server_kill");},f));}).then(null,function(b){a.f("Failed to get token: "+b);h||l();});}}g.ab=function(a){E("Interrupting connection for reason: "+a);this.od[a]=!0;this.Fa?this.Fa.close():(this.ub&&(clearTimeout(this.ub),this.ub=null),this.ma&&this.df());};g.kc=function(a){E("Resuming connection for reason: "+a);delete this.od[a];ya(this.od)&&(this.Sa=1E3,this.Fa||Rg(this,0));};function $g(a,b,c){c=c?La(c,function(a){return Gc(a);}).join("$"):"default";(a=Ug(a,b,c))&&a.G&&a.G("permission_denied");}function Ug(a,b,c){b=new L(b).toString();var d;n(a.$[b])?(d=a.$[b][c],delete a.$[b][c],0===ra(a.$[b])&&delete a.$[b]):d=void 0;return d;}function Wg(a,b,c){E("Auth token revoked: "+b+"/"+c);a.ob=null;a.ae=!0;a.Fa.close();"invalid_token"===b&&(a.he++,3<=a.he&&(a.Sa=3E4,O("Provided authentication credentials are invalid. This usually indicates your FirebaseApp instance was not initialized correctly. Make sure your apiKey and databaseURL match the values provided for your app at https://console.firebase.google.com/, or if you're using a service account, make sure it's authorized to access the specified databaseURL and is from the correct project.")));}function ah(a){Vg(a);r(a.$,function(b){r(b,function(b){Tg(a,b);});});for(var b=0;b<a.pa.length;b++)a.pa[b]&&Zg(a,b);for(;a.Jc.length;)b=a.Jc.shift(),Xg(a,b.action,b.te,b.data,b.G);}function ch(a){var b;b=sf.Vb().hc;return ya(a.od)&&b;}var Y={Mf:function(){re=dd=!0;}};Y.forceLongPolling=Y.Mf;Y.Nf=function(){se=!0;};Y.forceWebSockets=Y.Nf;Y.Tf=function(){return cd.isAvailable();};Y.isWebSocketsAvailable=Y.Tf;Y.lg=function(a,b){a.u.Ra.we=b;};Y.setSecurityDebugCallback=Y.lg;Y.ye=function(a,b){a.u.ye(b);};Y.stats=Y.ye;Y.ze=function(a,b){a.u.ze(b);};Y.statsIncrementCounter=Y.ze;Y.dd=function(a){return a.u.dd;};Y.dataUpdateCount=Y.dd;Y.Sf=function(a,b){a.u.ge=b;};Y.interceptServerData=Y.Sf;function dh(a){this.wa=Q;this.jb=new Cg();this.Ae={};this.ic={};this.Bc=a;}function eh(a,b,c,d,e){var f=a.jb,h=e;H(d>f.Ac,"Stacking an older write on top of newer ones");n(h)||(h=!0);f.la.push({path:b,Ga:c,Yc:d,visible:h});h&&(f.S=sg(f.S,b,c));f.Ac=d;return e?fh(a,new Ab(ng,b,c)):[];}function gh(a,b,c,d){var e=a.jb;H(d>e.Ac,"Stacking an older merge on top of newer ones");e.la.push({path:b,children:c,Yc:d,visible:!0});e.S=tg(e.S,b,c);e.Ac=d;c=bg(c);return fh(a,new Vc(ng,b,c));}function hh(a,b,c){c=c||!1;var d=Dg(a.jb,b);if(a.jb.Cd(b)){var e=Q;null!=d.Ga?e=e.set(C,!0):db(d.children,function(a,b){e=e.set(new L(a),b);});return fh(a,new mg(d.path,e,c));}return[];}function ih(a,b,c){c=bg(c);return fh(a,new Vc(pg,b,c));}function jh(a,b,c,d){d=kh(a,d);if(null!=d){var e=lh(d);d=e.path;e=e.Hb;b=T(d,b);c=new Ab(new og(!1,!0,e,!0),b,c);return mh(a,d,c);}return[];}function nh(a,b,c,d){if(d=kh(a,d)){var e=lh(d);d=e.path;e=e.Hb;b=T(d,b);c=bg(c);c=new Vc(new og(!1,!0,e,!0),b,c);return mh(a,d,c);}return[];}dh.prototype.Nb=function(a,b){var c=a.path,d=null,e=!1;ig(this.wa,c,function(a,b){var f=T(a,c);d=d||b.hb(f);e=e||null!=zg(b);});var f=this.wa.get(c);f?(e=e||null!=zg(f),d=d||f.hb(C)):(f=new yg(),this.wa=this.wa.set(c,f));var h;null!=d?h=!0:(h=!1,d=G,lg(this.wa.subtree(c),function(a,b){var c=b.hb(C);c&&(d=d.T(a,c));}));var k=null!=Bg(f,a);if(!k&&!S(a.m)){var l=oh(a);H(!(l in this.ic),"View does not exist, but we have a tag");var m=ph++;this.ic[l]=m;this.Ae["_"+m]=l;}h=f.Nb(a,b,new Hg(c,this.jb),d,h);k||e||(f=Bg(f,a),h=h.concat(qh(this,a,f)));return h;};dh.prototype.kb=function(a,b,c){var d=a.path,e=this.wa.get(d),f=[];if(e&&("default"===a.ja()||null!=Bg(e,a))){f=e.kb(a,b,c);e.e()&&(this.wa=this.wa.remove(d));e=f.hg;f=f.Kf;b=-1!==Pa(e,function(a){return S(a.m);});var h=gg(this.wa,d,function(a,b){return null!=zg(b);});if(b&&!h&&(d=this.wa.subtree(d),!d.e()))for(var d=rh(d),k=0;k<d.length;++k){var l=d[k],m=l.V,l=sh(this,l);this.Bc.xe(th(m),uh(this,m),l.jd,l.G);}if(!h&&0<e.length&&!c)if(b)this.Bc.Md(th(a),null);else{var u=this;Ja(e,function(a){a.ja();var b=u.ic[oh(a)];u.Bc.Md(th(a),b);});}vh(this,e);}return f;};dh.prototype.Aa=function(a,b){var c=this.jb,d=gg(this.wa,a,function(b,c){var d=T(b,a);if(d=c.hb(d))return d;});return c.Aa(a,d,b,!0);};function rh(a){return eg(a,function(a,c,d){if(c&&null!=zg(c))return[zg(c)];var e=[];c&&(e=Ag(c));r(d,function(a){e=e.concat(a);});return e;});}function vh(a,b){for(var c=0;c<b.length;++c){var d=b[c];if(!S(d.m)){var d=oh(d),e=a.ic[d];delete a.ic[d];delete a.Ae["_"+e];}}}function th(a){return S(a.m)&&!Sc(a.m)?a.wb():a;}function qh(a,b,c){var d=b.path,e=uh(a,b);c=sh(a,c);b=a.Bc.xe(th(b),e,c.jd,c.G);d=a.wa.subtree(d);if(e)H(null==zg(d.value),"If we're adding a query, it shouldn't be shadowed");else for(e=eg(d,function(a,b,c){if(!a.e()&&b&&null!=zg(b))return[Qf(zg(b))];var d=[];b&&(d=d.concat(La(Ag(b),function(a){return a.V;})));r(c,function(a){d=d.concat(a);});return d;}),d=0;d<e.length;++d)c=e[d],a.Bc.Md(th(c),uh(a,c));return b;}function sh(a,b){var c=b.V,d=uh(a,c);return{jd:function(){return(b.w()||G).hash();},G:function(b){if("ok"===b){if(d){var f=c.path;if(b=kh(a,d)){var h=lh(b);b=h.path;h=h.Hb;f=T(b,f);f=new Cb(new og(!1,!0,h,!0),f);b=mh(a,b,f);}else b=[];}else b=fh(a,new Cb(pg,c.path));return b;}f="Unknown Error";"too_big"===b?f="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"==b?f="Client doesn't have permission to access the desired data.":"unavailable"==b&&(f="The service is unavailable");f=Error(b+" at "+c.path.toString()+": "+f);f.code=b.toUpperCase();return a.kb(c,null,f);}};}function oh(a){return a.path.toString()+"$"+a.ja();}function lh(a){var b=a.indexOf("$");H(-1!==b&&b<a.length-1,"Bad queryKey.");return{Hb:a.substr(b+1),path:new L(a.substr(0,b))};}function kh(a,b){var c=a.Ae,d="_"+b;return d in c?c[d]:void 0;}function uh(a,b){var c=oh(b);return w(a.ic,c);}var ph=1;function mh(a,b,c){var d=a.wa.get(b);H(d,"Missing sync point for query tag that we're tracking");return d.eb(c,new Hg(b,a.jb),null);}function fh(a,b){return wh(a,b,a.wa,null,new Hg(C,a.jb));}function wh(a,b,c,d,e){if(b.path.e())return xh(a,b,c,d,e);var f=c.get(C);null==d&&null!=f&&(d=f.hb(C));var h=[],k=J(b.path),l=b.Lc(k);if((c=c.children.get(k))&&l)var m=d?d.Q(k):null,k=e.n(k),h=h.concat(wh(a,l,c,m,k));f&&(h=h.concat(f.eb(b,e,d)));return h;}function xh(a,b,c,d,e){var f=c.get(C);null==d&&null!=f&&(d=f.hb(C));var h=[];c.children.ha(function(c,f){var m=d?d.Q(c):null,u=e.n(c),z=b.Lc(c);z&&(h=h.concat(xh(a,z,f,m,u)));});f&&(h=h.concat(f.eb(b,e,d)));return h;}function Te(a,b,c){this.app=c;var d=new Eb(c);this.L=a;this.Va=$c(a);this.Uc=null;this.ca=new Nb();this.td=1;this.Ra=null;if(b||0<=("object"===typeof window&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i))this.va=new Qc(this.L,q(this.Gb,this),d),setTimeout(q(this.Ic,this,!0),0);else{b=c.options.databaseAuthVariableOverride||null;if(null!==b){if("object"!==da(b))throw Error("Only objects are supported for option databaseAuthVariableOverride");try{B(b);}catch(e){throw Error("Invalid authOverride provided: "+e);}}this.va=this.Ra=new Pg(this.L,q(this.Gb,this),q(this.Ic,this),q(this.re,this),d,b);}var f=this;Fb(d,function(a){f.va.kf(a);});this.og=ad(a,q(function(){return new Xc(this.Va,this.va);},this));this.mc=new Jg();this.fe=new Gb();this.nd=new dh({xe:function(a,b,c,d){b=[];c=f.fe.j(a.path);c.e()||(b=fh(f.nd,new Ab(pg,a.path,c)),setTimeout(function(){d("ok");},0));return b;},Md:ba});yh(this,"connected",!1);this.ia=new mc();this.Ya=new Se(this);this.dd=0;this.ge=null;this.K=new dh({xe:function(a,b,c,d){f.va.$e(a,c,b,function(b,c){var e=d(b,c);Sb(f.ca,a.path,e);});return[];},Md:function(a,b){f.va.uf(a,b);}});}g=Te.prototype;g.toString=function(){return(this.L.Rc?"https://":"http://")+this.L.host;};g.name=function(){return this.L.me;};function zh(a){a=a.fe.j(new L(".info/serverTimeOffset")).H()||0;return new Date().getTime()+a;}function Ah(a){a=a={timestamp:zh(a)};a.timestamp=a.timestamp||new Date().getTime();return a;}g.Gb=function(a,b,c,d){this.dd++;var e=new L(a);b=this.ge?this.ge(a,b):b;a=[];d?c?(b=pa(b,function(a){return M(a);}),a=nh(this.K,e,b,d)):(b=M(b),a=jh(this.K,e,b,d)):c?(d=pa(b,function(a){return M(a);}),a=ih(this.K,e,d)):(d=M(b),a=fh(this.K,new Ab(pg,e,d)));d=e;0<a.length&&(d=Bh(this,e));Sb(this.ca,d,a);};g.Ic=function(a){yh(this,"connected",a);!1===a&&Ch(this);};g.re=function(a){var b=this;Ic(a,function(a,d){yh(b,d,a);});};function yh(a,b,c){b=new L("/.info/"+b);c=M(c);var d=a.fe;d.Hd=d.Hd.F(b,c);c=fh(a.nd,new Ab(pg,b,c));Sb(a.ca,b,c);}g.Jb=function(a,b,c,d){this.f("set",{path:a.toString(),value:b,ug:c});var e=Ah(this);b=M(b,c);var e=pc(b,e),f=this.td++,e=eh(this.K,a,e,f,!0);Ob(this.ca,e);var h=this;this.va.put(a.toString(),b.H(!0),function(b,c){var e="ok"===b;e||O("set at "+a+" failed: "+b);e=hh(h.K,f,!e);Sb(h.ca,a,e);Dh(d,b,c);});e=Eh(this,a);Bh(this,e);Sb(this.ca,e,[]);};g.update=function(a,b,c){this.f("update",{path:a.toString(),value:b});var d=!0,e=Ah(this),f={};r(b,function(a,b){d=!1;var c=M(a);f[b]=pc(c,e);});if(d)E("update() called with empty data.  Don't do anything."),Dh(c,"ok");else{var h=this.td++,k=gh(this.K,a,f,h);Ob(this.ca,k);var l=this;this.va.af(a.toString(),b,function(b,d){var e="ok"===b;e||O("update at "+a+" failed: "+b);var e=hh(l.K,h,!e),f=a;0<e.length&&(f=Bh(l,a));Sb(l.ca,f,e);Dh(c,b,d);});r(b,function(b,c){var d=Eh(l,a.n(c));Bh(l,d);});Sb(this.ca,a,[]);}};function Ch(a){a.f("onDisconnectEvents");var b=Ah(a),c=[];nc(lc(a.ia,b),C,function(b,e){c=c.concat(fh(a.K,new Ab(pg,b,e)));var f=Eh(a,b);Bh(a,f);});a.ia=new mc();Sb(a.ca,C,c);}g.vd=function(a,b){var c=this;this.va.vd(a.toString(),function(d,e){"ok"===d&&Ze(c.ia,a);Dh(b,d,e);});};function nf(a,b,c,d){var e=M(c);a.va.oe(b.toString(),e.H(!0),function(c,h){"ok"===c&&oc(a.ia,b,e);Dh(d,c,h);});}function of(a,b,c,d,e){var f=M(c,d);a.va.oe(b.toString(),f.H(!0),function(c,d){"ok"===c&&oc(a.ia,b,f);Dh(e,c,d);});}function pf(a,b,c,d){var e=!0,f;for(f in c)e=!1;e?(E("onDisconnect().update() called with empty data.  Don't do anything."),Dh(d,"ok")):a.va.cf(b.toString(),c,function(e,f){if("ok"===e)for(var l in c){var m=M(c[l]);oc(a.ia,b.n(l),m);}Dh(d,e,f);});}function Zf(a,b,c){c=".info"===J(b.path)?a.nd.Nb(b,c):a.K.Nb(b,c);Qb(a.ca,b.path,c);}g.ab=function(){this.Ra&&this.Ra.ab("repo_interrupt");};g.kc=function(){this.Ra&&this.Ra.kc("repo_interrupt");};g.ye=function(a){if("undefined"!==typeof console){a?(this.Uc||(this.Uc=new Mb(this.Va)),a=this.Uc.get()):a=this.Va.get();var b=Ma(ua(a),function(a,b){return Math.max(b.length,a);},0),c;for(c in a){for(var d=a[c],e=c.length;e<b+2;e++)c+=" ";console.log(c+d);}}};g.ze=function(a){Lb(this.Va,a);this.og.rf[a]=!0;};g.f=function(a){var b="";this.Ra&&(b=this.Ra.id+":");E(b,arguments);};function Dh(a,b,c){a&&ub(function(){if("ok"==b)a(null);else{var d=(b||"error").toUpperCase(),e=d;c&&(e+=": "+c);e=Error(e);e.code=d;a(e);}});}function Fh(a,b,c,d,e){function f(){}a.f("transaction on "+b);var h=new U(a,b);h.gc("value",f);c={path:b,update:c,G:d,status:null,ef:rc(),Fe:e,of:0,Pd:function(){h.Hc("value",f);},Rd:null,Ba:null,ad:null,bd:null,cd:null};d=a.K.Aa(b,void 0)||G;c.ad=d;d=c.update(d.H());if(n(d)){ef("transaction failed: Data returned ",d,c.path);c.status=1;e=Kg(a.mc,b);var k=e.Ca()||[];k.push(c);Lg(e,k);"object"===typeof d&&null!==d&&cb(d,".priority")?(k=w(d,".priority"),H(cf(k),"Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")):k=(a.K.Aa(b)||G).C().H();e=Ah(a);d=M(d,k);e=pc(d,e);c.bd=d;c.cd=e;c.Ba=a.td++;c=eh(a.K,b,e,c.Ba,c.Fe);Sb(a.ca,b,c);Gh(a);}else c.Pd(),c.bd=null,c.cd=null,c.G&&(a=new W(c.ad,new U(a,c.path),N),c.G(null,!1,a));}function Gh(a,b){var c=b||a.mc;b||Hh(a,c);if(null!==c.Ca()){var d=Ih(a,c);H(0<d.length,"Sending zero length transaction queue");Na(d,function(a){return 1===a.status;})&&Jh(a,c.path(),d);}else c.hd()&&c.O(function(b){Gh(a,b);});}function Jh(a,b,c){for(var d=La(c,function(a){return a.Ba;}),e=a.K.Aa(b,d)||G,d=e,e=e.hash(),f=0;f<c.length;f++){var h=c[f];H(1===h.status,"tryToSendTransactionQueue_: items in queue should all be run.");h.status=2;h.of++;var k=T(b,h.path),d=d.F(k,h.bd);}d=d.H(!0);a.va.put(b.toString(),d,function(d){a.f("transaction put response",{path:b.toString(),status:d});var e=[];if("ok"===d){d=[];for(f=0;f<c.length;f++){c[f].status=3;e=e.concat(hh(a.K,c[f].Ba));if(c[f].G){var h=c[f].cd,k=new U(a,c[f].path);d.push(q(c[f].G,null,null,!0,new W(h,k,N)));}c[f].Pd();}Hh(a,Kg(a.mc,b));Gh(a);Sb(a.ca,b,e);for(f=0;f<d.length;f++)ub(d[f]);}else{if("datastale"===d)for(f=0;f<c.length;f++)c[f].status=4===c[f].status?5:1;else for(O("transaction at "+b.toString()+" failed: "+d),f=0;f<c.length;f++)c[f].status=5,c[f].Rd=d;Bh(a,b);}},e);}function Bh(a,b){var c=Kh(a,b),d=c.path(),c=Ih(a,c);Lh(a,c,d);return d;}function Lh(a,b,c){if(0!==b.length){for(var d=[],e=[],f=Ka(b,function(a){return 1===a.status;}),f=La(f,function(a){return a.Ba;}),h=0;h<b.length;h++){var k=b[h],l=T(c,k.path),m=!1,u;H(null!==l,"rerunTransactionsUnderNode_: relativePath should not be null.");if(5===k.status)m=!0,u=k.Rd,e=e.concat(hh(a.K,k.Ba,!0));else if(1===k.status)if(25<=k.of)m=!0,u="maxretry",e=e.concat(hh(a.K,k.Ba,!0));else{var z=a.K.Aa(k.path,f)||G;k.ad=z;var F=b[h].update(z.H());n(F)?(ef("transaction failed: Data returned ",F,k.path),l=M(F),"object"===typeof F&&null!=F&&cb(F,".priority")||(l=l.fa(z.C())),z=k.Ba,F=Ah(a),F=pc(l,F),k.bd=l,k.cd=F,k.Ba=a.td++,Qa(f,z),e=e.concat(eh(a.K,k.path,F,k.Ba,k.Fe)),e=e.concat(hh(a.K,z,!0))):(m=!0,u="nodata",e=e.concat(hh(a.K,k.Ba,!0)));}Sb(a.ca,c,e);e=[];m&&(b[h].status=3,setTimeout(b[h].Pd,Math.floor(0)),b[h].G&&("nodata"===u?(k=new U(a,b[h].path),d.push(q(b[h].G,null,null,!1,new W(b[h].ad,k,N)))):d.push(q(b[h].G,null,Error(u),!1,null))));}Hh(a,a.mc);for(h=0;h<d.length;h++)ub(d[h]);Gh(a);}}function Kh(a,b){for(var c,d=a.mc;null!==(c=J(b))&&null===d.Ca();)d=Kg(d,c),b=D(b);return d;}function Ih(a,b){var c=[];Mh(a,b,c);c.sort(function(a,b){return a.ef-b.ef;});return c;}function Mh(a,b,c){var d=b.Ca();if(null!==d)for(var e=0;e<d.length;e++)c.push(d[e]);b.O(function(b){Mh(a,b,c);});}function Hh(a,b){var c=b.Ca();if(c){for(var d=0,e=0;e<c.length;e++)3!==c[e].status&&(c[d]=c[e],d++);c.length=d;Lg(b,0<c.length?c:null);}b.O(function(b){Hh(a,b);});}function Eh(a,b){var c=Kh(a,b).path(),d=Kg(a.mc,b);Og(d,function(b){Nh(a,b);});Nh(a,d);Ng(d,function(b){Nh(a,b);});return c;}function Nh(a,b){var c=b.Ca();if(null!==c){for(var d=[],e=[],f=-1,h=0;h<c.length;h++)4!==c[h].status&&(2===c[h].status?(H(f===h-1,"All SENT items should be at beginning of queue."),f=h,c[h].status=4,c[h].Rd="set"):(H(1===c[h].status,"Unexpected transaction status in abort"),c[h].Pd(),e=e.concat(hh(a.K,c[h].Ba,!0)),c[h].G&&d.push(q(c[h].G,null,Error("set"),!1,null))));-1===f?Lg(b,null):c.length=f+1;Sb(a.ca,b.path(),e);for(h=0;h<d.length;h++)ub(d[h]);}}function Ye(){this.lb={};this.wf=!1;}Ye.prototype.ab=function(){for(var a in this.lb)this.lb[a].ab();};Ye.prototype.kc=function(){for(var a in this.lb)this.lb[a].kc();};Ye.prototype.$d=function(a){this.wf=a;};ca(Ye);Ye.prototype.interrupt=Ye.prototype.ab;Ye.prototype.resume=Ye.prototype.kc;var Z={};Z.nc=Pg;Z.DataConnection=Z.nc;Pg.prototype.ng=function(a,b){this.ua("q",{p:a},b);};Z.nc.prototype.simpleListen=Z.nc.prototype.ng;Pg.prototype.Hf=function(a,b){this.ua("echo",{d:a},b);};Z.nc.prototype.echo=Z.nc.prototype.Hf;Pg.prototype.interrupt=Pg.prototype.ab;Z.zf=Ce;Z.RealTimeConnection=Z.zf;Ce.prototype.sendRequest=Ce.prototype.ua;Ce.prototype.close=Ce.prototype.close;Z.Rf=function(a){var b=Pg.prototype.put;Pg.prototype.put=function(c,d,e,f){n(f)&&(f=a());b.call(this,c,d,e,f);};return function(){Pg.prototype.put=b;};};Z.hijackHash=Z.Rf;Z.yf=Hb;Z.ConnectionTarget=Z.yf;Z.ja=function(a){return a.ja();};Z.queryIdentifier=Z.ja;Z.Uf=function(a){return a.u.Ra.$;};Z.listens=Z.Uf;Z.$d=function(a){Ye.Vb().$d(a);};Z.forceRestClient=Z.$d;Z.Context=Ye;function U(a,b){if(!(a instanceof Te))throw Error("new Firebase() no longer supported - use app.database().");X.call(this,a,b,fe,!1);this.then=void 0;this["catch"]=void 0;}la(U,X);g=U.prototype;g.getKey=function(){x("Firebase.key",0,0,arguments.length);return this.path.e()?null:Bd(this.path);};g.n=function(a){x("Firebase.child",1,1,arguments.length);if(ga(a))a=String(a);else if(!(a instanceof L))if(null===J(this.path)){var b=a;b&&(b=b.replace(/^\/*\.info(\/|$)/,"/"));lf("Firebase.child",b);}else lf("Firebase.child",a);return new U(this.u,this.path.n(a));};g.getParent=function(){x("Firebase.parent",0,0,arguments.length);var a=this.path.parent();return null===a?null:new U(this.u,a);};g.Of=function(){x("Firebase.ref",0,0,arguments.length);for(var a=this;null!==a.getParent();)a=a.getParent();return a;};g.Gf=function(){return this.u.Ya;};g.set=function(a,b){x("Firebase.set",1,2,arguments.length);mf("Firebase.set",this.path);df("Firebase.set",a,this.path,!1);A("Firebase.set",2,b,!0);var c=new hb();this.u.Jb(this.path,a,null,ib(c,b));return c.ra;};g.update=function(a,b){x("Firebase.update",1,2,arguments.length);mf("Firebase.update",this.path);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;O("Passing an Array to Firebase.update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.");}gf("Firebase.update",a,this.path);A("Firebase.update",2,b,!0);c=new hb();this.u.update(this.path,a,ib(c,b));return c.ra;};g.Jb=function(a,b,c){x("Firebase.setWithPriority",2,3,arguments.length);mf("Firebase.setWithPriority",this.path);df("Firebase.setWithPriority",a,this.path,!1);hf("Firebase.setWithPriority",2,b);A("Firebase.setWithPriority",3,c,!0);if(".length"===this.getKey()||".keys"===this.getKey())throw"Firebase.setWithPriority failed: "+this.getKey()+" is a read-only object.";var d=new hb();this.u.Jb(this.path,a,b,ib(d,c));return d.ra;};g.remove=function(a){x("Firebase.remove",0,1,arguments.length);mf("Firebase.remove",this.path);A("Firebase.remove",1,a,!0);return this.set(null,a);};g.transaction=function(a,b,c){x("Firebase.transaction",1,3,arguments.length);mf("Firebase.transaction",this.path);A("Firebase.transaction",1,a,!1);A("Firebase.transaction",2,b,!0);if(n(c)&&"boolean"!=typeof c)throw Error(y("Firebase.transaction",3,!0)+"must be a boolean.");if(".length"===this.getKey()||".keys"===this.getKey())throw"Firebase.transaction failed: "+this.getKey()+" is a read-only object.";"undefined"===typeof c&&(c=!0);var d=new hb();ha(b)&&jb(d.ra);Fh(this.u,this.path,a,function(a,c,h){a?d.reject(a):d.resolve(new pb(c,h));ha(b)&&b(a,c,h);},c);return d.ra;};g.kg=function(a,b){x("Firebase.setPriority",1,2,arguments.length);mf("Firebase.setPriority",this.path);hf("Firebase.setPriority",1,a);A("Firebase.setPriority",2,b,!0);var c=new hb();this.u.Jb(this.path.n(".priority"),a,null,ib(c,b));return c.ra;};g.push=function(a,b){x("Firebase.push",0,2,arguments.length);mf("Firebase.push",this.path);df("Firebase.push",a,this.path,!0);A("Firebase.push",2,b,!0);var c=zh(this.u),d=uf(c),c=this.n(d);if(null!=a){var e=this,f=c.set(a,b).then(function(){return e.n(d);});c.then=q(f.then,f);c["catch"]=q(f.then,f,void 0);ha(b)&&jb(f);}return c;};g.ib=function(){mf("Firebase.onDisconnect",this.path);return new V(this.u,this.path);};U.prototype.child=U.prototype.n;U.prototype.set=U.prototype.set;U.prototype.update=U.prototype.update;U.prototype.setWithPriority=U.prototype.Jb;U.prototype.remove=U.prototype.remove;U.prototype.transaction=U.prototype.transaction;U.prototype.setPriority=U.prototype.kg;U.prototype.push=U.prototype.push;U.prototype.onDisconnect=U.prototype.ib;Lc(U.prototype,"database",U.prototype.Gf);Lc(U.prototype,"key",U.prototype.getKey);Lc(U.prototype,"parent",U.prototype.getParent);Lc(U.prototype,"root",U.prototype.Of);if("undefined"===typeof firebase$3)throw Error("Cannot install Firebase Database - be sure to load firebase-app.js first.");try{firebase$3.INTERNAL.registerService("database",function(a){var b=Ye.Vb(),c=a.options.databaseURL;n(c)||Ac("Can't determine Firebase Database URL.  Be sure to include databaseURL option when calling firebase.intializeApp().");var d=Bc(c),c=d.jc;Xe("Invalid Firebase Database URL",d);d.path.e()||Ac("Database URL must point to the root of a Firebase Database (not including a child path).");(d=w(b.lb,a.name))&&Ac("FIREBASE INTERNAL ERROR: Database initialized multiple times.");d=new Te(c,b.wf,a);b.lb[a.name]=d;return d.Ya;},{Reference:U,Query:X,Database:Se,enableLogging:xc,INTERNAL:Y,TEST_ACCESS:Z,ServerValue:Ve});}catch(Oh){Ac("Failed to register the Firebase Database Service ("+Oh+")");}})();

var firebase$4 = app;
/*! @license Firebase v3.6.1
    Build: 3.6.1-rc.3
    Terms: https://firebase.google.com/terms/ */
(function () {
    var k,
        l = this,
        n = function (a) {
        return void 0 !== a;
    },
        aa = function (a) {
        var b = typeof a;if ("object" == b) {
            if (a) {
                if (a instanceof Array) return "array";if (a instanceof Object) return b;var c = Object.prototype.toString.call(a);if ("[object Window]" == c) return "object";if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function";
            } else return "null";
        } else if ("function" == b && "undefined" == typeof a.call) return "object";return b;
    },
        p = function (a) {
        return "string" == typeof a;
    },
        ba = function (a, b) {
        function c() {}c.prototype = b.prototype;a.sa = b.prototype;a.prototype = new c();a.ra = function (a, c, f) {
            for (var d = Array(arguments.length - 2), e = 2; e < arguments.length; e++) d[e - 2] = arguments[e];return b.prototype[c].apply(a, d);
        };
    };var ca = function (a, b, c) {
        function d() {
            z || (z = !0, b.apply(null, arguments));
        }function e(b) {
            m = setTimeout(function () {
                m = null;a(f, 2 === C);
            }, b);
        }function f(a, b) {
            if (!z) if (a) d.apply(null, arguments);else if (2 === C || B) d.apply(null, arguments);else {
                64 > h && (h *= 2);var c;1 === C ? (C = 2, c = 0) : c = 1E3 * (h + Math.random());e(c);
            }
        }function g(a) {
            Na || (Na = !0, z || (null !== m ? (a || (C = 2), clearTimeout(m), e(0)) : a || (C = 1)));
        }var h = 1,
            m = null,
            B = !1,
            C = 0,
            z = !1,
            Na = !1;e(0);setTimeout(function () {
            B = !0;g(!0);
        }, c);return g;
    };var q = "https://firebasestorage.googleapis.com";var r = function (a, b) {
        this.code = "storage/" + a;this.message = "Firebase Storage: " + b;this.serverResponse = null;this.name = "FirebaseError";
    };ba(r, Error);
    var da = function () {
        return new r("unknown", "An unknown error occurred, please check the error payload for server response.");
    },
        ea = function () {
        return new r("canceled", "User canceled the upload/download.");
    },
        fa = function () {
        return new r("cannot-slice-blob", "Cannot slice blob for upload. Please retry the upload.");
    },
        ga = function (a, b, c) {
        return new r("invalid-argument", "Invalid argument in `" + b + "` at index " + a + ": " + c);
    },
        ha = function () {
        return new r("app-deleted", "The Firebase app was deleted.");
    },
        t = function (a, b) {
        return new r("invalid-format", "String does not match format '" + a + "': " + b);
    },
        ia = function (a) {
        throw new r("internal-error", "Internal error: " + a);
    };var ja = function (a, b) {
        for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && b(c, a[c]);
    },
        ka = function (a) {
        var b = {};ja(a, function (a, d) {
            b[a] = d;
        });return b;
    };var la = function (a) {
        if ("undefined" !== typeof firebase$4) return new firebase$4.Promise(a);throw Error("Error in Firebase Storage - be sure to load firebase-app.js first.");
    };var u = function (a, b, c, d) {
        this.h = a;this.b = {};this.method = b;this.headers = {};this.body = null;this.j = c;this.l = this.a = null;this.c = [200];this.g = [];this.timeout = d;this.f = !0;
    };var ma = { STATE_CHANGED: "state_changed" },
        v = { RUNNING: "running", PAUSED: "paused", SUCCESS: "success", CANCELED: "canceled", ERROR: "error" },
        na = function (a) {
        switch (a) {case "running":case "pausing":case "canceling":
                return "running";case "paused":
                return "paused";case "success":
                return "success";case "canceled":
                return "canceled";case "error":
                return "error";default:
                return "error";}
    };var w = function (a) {
        return n(a) && null !== a;
    },
        oa = function (a) {
        return "string" === typeof a || a instanceof String;
    },
        pa = function () {
        return "undefined" !== typeof Blob;
    };var qa = function (a) {
        if (Error.captureStackTrace) Error.captureStackTrace(this, qa);else {
            var b = Error().stack;b && (this.stack = b);
        }a && (this.message = String(a));
    };ba(qa, Error);var sa = function (a, b) {
        var c = ra;return Object.prototype.hasOwnProperty.call(c, a) ? c[a] : c[a] = b(a);
    };var ta = function (a, b) {
        for (var c = a.split("%s"), d = "", e = Array.prototype.slice.call(arguments, 1); e.length && 1 < c.length;) d += c.shift() + e.shift();return d + c.join("%s");
    },
        ua = String.prototype.trim ? function (a) {
        return a.trim();
    } : function (a) {
        return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
    },
        va = function (a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    };var x = function (a) {
        return function () {
            var b = [];Array.prototype.push.apply(b, arguments);firebase$4.Promise.resolve(!0).then(function () {
                a.apply(null, b);
            });
        };
    };var y = function (a, b) {
        this.bucket = a;this.path = b;
    },
        wa = function (a) {
        var b = encodeURIComponent;return "/b/" + b(a.bucket) + "/o/" + b(a.path);
    },
        xa = function (a) {
        for (var b = null, c = [{ K: /^gs:\/\/([A-Za-z0-9.\-]+)(\/(.*))?$/i, G: { bucket: 1, path: 3 }, J: function (a) {
                "/" === a.path.charAt(a.path.length - 1) && (a.path = a.path.slice(0, -1));
            } }, { K: /^https?:\/\/firebasestorage\.googleapis\.com\/v[A-Za-z0-9_]+\/b\/([A-Za-z0-9.\-]+)\/o(\/([^?#]*).*)?$/i, G: { bucket: 1, path: 3 }, J: function (a) {
                a.path = decodeURIComponent(a.path);
            } }], d = 0; d < c.length; d++) {
            var e = c[d],
                f = e.K.exec(a);if (f) {
                b = f[e.G.bucket];(f = f[e.G.path]) || (f = "");b = new y(b, f);e.J(b);break;
            }
        }if (null == b) throw new r("invalid-url", "Invalid URL '" + a + "'.");return b;
    };var ya = function (a, b, c) {
        "function" == aa(a) || w(b) || w(c) ? (this.c = a, this.a = b || null, this.b = c || null) : (this.c = a.next || null, this.a = a.error || null, this.b = a.complete || null);
    };var A = { RAW: "raw", BASE64: "base64", BASE64URL: "base64url", DATA_URL: "data_url" },
        za = function (a) {
        switch (a) {case "raw":case "base64":case "base64url":case "data_url":
                break;default:
                throw "Expected one of the event types: [raw, base64, base64url, data_url].";}
    },
        Aa = function (a, b) {
        this.b = a;this.a = b || null;
    },
        Ea = function (a, b) {
        switch (a) {case "raw":
                return new Aa(Ba(b));case "base64":case "base64url":
                return new Aa(Ca(a, b));case "data_url":
                return a = new Da(b), a = a.a ? Ca("base64", a.c) : Ba(a.c), new Aa(a, new Da(b).b);}throw da();
    },
        Ba = function (a) {
        for (var b = [], c = 0; c < a.length; c++) {
            var d = a.charCodeAt(c);if (127 >= d) b.push(d);else if (2047 >= d) b.push(192 | d >> 6, 128 | d & 63);else if (55296 == (d & 64512)) {
                if (c < a.length - 1 && 56320 == (a.charCodeAt(c + 1) & 64512)) {
                    var e = a.charCodeAt(++c),
                        d = 65536 | (d & 1023) << 10 | e & 1023;b.push(240 | d >> 18, 128 | d >> 12 & 63, 128 | d >> 6 & 63, 128 | d & 63);
                } else b.push(239, 191, 189);
            } else 56320 == (d & 64512) ? b.push(239, 191, 189) : b.push(224 | d >> 12, 128 | d >> 6 & 63, 128 | d & 63);
        }return new Uint8Array(b);
    },
        Ca = function (a, b) {
        switch (a) {case "base64":
                var c = -1 !== b.indexOf("-"),
                    d = -1 !== b.indexOf("_");if (c || d) throw t(a, "Invalid character '" + (c ? "-" : "_") + "' found: is it base64url encoded?");break;case "base64url":
                c = -1 !== b.indexOf("+");d = -1 !== b.indexOf("/");if (c || d) throw t(a, "Invalid character '" + (c ? "+" : "/") + "' found: is it base64 encoded?");b = b.replace(/-/g, "+").replace(/_/g, "/");}var e;try {
            e = atob(b);
        } catch (f) {
            throw t(a, "Invalid character found");
        }a = new Uint8Array(e.length);for (b = 0; b < e.length; b++) a[b] = e.charCodeAt(b);return a;
    },
        Da = function (a) {
        var b = a.match(/^data:([^,]+)?,/);if (null === b) throw t("data_url", "Must be formatted 'data:[<mediatype>][;base64],<data>");b = b[1] || null;this.a = !1;this.b = null;if (null != b) {
            var c = b.length - 7;this.b = (this.a = 0 <= c && b.indexOf(";base64", c) == c) ? b.substring(0, b.length - 7) : b;
        }this.c = a.substring(a.indexOf(",") + 1);
    };var Fa = function (a) {
        var b = encodeURIComponent,
            c = "?";ja(a, function (a, e) {
            a = b(a) + "=" + b(e);c = c + a + "&";
        });return c = c.slice(0, -1);
    };var Ga = function () {
        var a = this;this.a = new XMLHttpRequest();this.c = 0;this.f = la(function (b) {
            a.a.addEventListener("abort", function () {
                a.c = 2;b(a);
            });a.a.addEventListener("error", function () {
                a.c = 1;b(a);
            });a.a.addEventListener("load", function () {
                b(a);
            });
        });this.b = !1;
    },
        Ha = function (a, b, c, d, e) {
        if (a.b) throw ia("cannot .send() more than once");a.b = !0;a.a.open(c, b, !0);w(e) && ja(e, function (b, c) {
            a.a.setRequestHeader(b, c.toString());
        });w(d) ? a.a.send(d) : a.a.send();return a.f;
    },
        Ia = function (a) {
        if (!a.b) throw ia("cannot .getErrorCode() before sending");
        return a.c;
    },
        D = function (a) {
        if (!a.b) throw ia("cannot .getStatus() before sending");try {
            return a.a.status;
        } catch (b) {
            return -1;
        }
    },
        Ja = function (a) {
        if (!a.b) throw ia("cannot .getResponseText() before sending");return a.a.responseText;
    };Ga.prototype.abort = function () {
        this.a.abort();
    };var E = function (a, b, c, d, e, f) {
        this.b = a;this.h = b;this.f = c;this.a = d;this.g = e;this.c = f;
    };k = E.prototype;k.V = function () {
        return this.b;
    };k.qa = function () {
        return this.h;
    };k.na = function () {
        return this.f;
    };k.ia = function () {
        return this.a;
    };k.W = function () {
        if (w(this.a)) {
            var a = this.a.downloadURLs;return w(a) && w(a[0]) ? a[0] : null;
        }return null;
    };k.pa = function () {
        return this.g;
    };k.la = function () {
        return this.c;
    };var Ka = function (a, b) {
        b.unshift(a);qa.call(this, ta.apply(null, b));b.shift();
    };ba(Ka, qa);var F = function (a, b, c) {
        if (!a) {
            var d = Array.prototype.slice.call(arguments, 2),
                e = "Assertion failed";if (b) var e = e + (": " + b),
                f = d;throw new Ka("" + e, f || []);
        }
    };var G;a: {
        var La = l.navigator;if (La) {
            var Ma = La.userAgent;if (Ma) {
                G = Ma;break a;
            }
        }G = "";
    }var Oa = function () {};var H = Array.prototype.indexOf ? function (a, b, c) {
        F(null != a.length);return Array.prototype.indexOf.call(a, b, c);
    } : function (a, b, c) {
        c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;if (p(a)) return p(b) && 1 == b.length ? a.indexOf(b, c) : -1;for (; c < a.length; c++) if (c in a && a[c] === b) return c;return -1;
    },
        Pa = Array.prototype.forEach ? function (a, b, c) {
        F(null != a.length);Array.prototype.forEach.call(a, b, c);
    } : function (a, b, c) {
        for (var d = a.length, e = p(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a);
    },
        Qa = Array.prototype.filter ? function (a, b, c) {
        F(null != a.length);return Array.prototype.filter.call(a, b, c);
    } : function (a, b, c) {
        for (var d = a.length, e = [], f = 0, g = p(a) ? a.split("") : a, h = 0; h < d; h++) if (h in g) {
            var m = g[h];b.call(c, m, h, a) && (e[f++] = m);
        }return e;
    },
        Ra = Array.prototype.map ? function (a, b, c) {
        F(null != a.length);return Array.prototype.map.call(a, b, c);
    } : function (a, b, c) {
        for (var d = a.length, e = Array(d), f = p(a) ? a.split("") : a, g = 0; g < d; g++) g in f && (e[g] = b.call(c, f[g], g, a));return e;
    },
        Sa = function (a) {
        var b = a.length;if (0 < b) {
            for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
            return c;
        }return [];
    };var Ta = function (a, b) {
        b = Qa(b.split("/"), function (a) {
            return 0 < a.length;
        }).join("/");return 0 === a.length ? b : a + "/" + b;
    },
        Ua = function (a) {
        var b = a.lastIndexOf("/", a.length - 2);return -1 === b ? a : a.slice(b + 1);
    };var Wa = function (a, b, c, d, e, f, g, h, m, B, C) {
        this.C = a;this.A = b;this.v = c;this.o = d;this.B = e.slice();this.m = f.slice();this.j = this.l = this.c = this.b = null;this.f = this.g = !1;this.s = g;this.h = h;this.D = C;this.w = m;var z = this;this.u = la(function (a, b) {
            z.l = a;z.j = b;Va(z);
        });
    },
        Xa = function (a, b, c) {
        this.b = a;this.c = b;this.a = !!c;
    },
        Va = function (a) {
        function b(a, b) {
            b ? a(!1, new Xa(!1, null, !0)) : (b = new Ga(), b.a.withCredentials = d.D, d.b = b, Ha(b, d.C, d.A, d.o, d.v).then(function (b) {
                d.b = null;var c = 0 === Ia(b),
                    e = D(b);if (!(c = !c)) {
                    var f = d,
                        c = 500 <= e && 600 > e,
                        g;g = 0 <= H([408, 429], e);f = 0 <= H(f.m, e);c = c || g || f;
                }c ? (b = 2 === Ia(b), a(!1, new Xa(!1, null, b))) : (e = 0 <= H(d.B, e), a(!0, new Xa(e, b)));
            }));
        }function c(a, b) {
            var c = d.l;a = d.j;var e = b.c;if (b.b) try {
                var f = d.s(e, Ja(e));n(f) ? c(f) : c();
            } catch (B) {
                a(B);
            } else null !== e ? (b = da(), f = Ja(e), b.serverResponse = f, d.h ? a(d.h(e, b)) : a(b)) : (b = b.a ? d.f ? ha() : ea() : new r("retry-limit-exceeded", "Max retry time for operation exceeded, please try again."), a(b));
        }var d = a;a.g ? c(0, new Xa(!1, null, !0)) : a.c = ca(b, c, a.w);
    };Wa.prototype.a = function () {
        return this.u;
    };
    Wa.prototype.cancel = function (a) {
        this.g = !0;this.f = a || !1;null !== this.c && (0, this.c)(!1);null !== this.b && this.b.abort();
    };var Ya = function (a, b, c) {
        var d = Fa(a.b),
            d = a.h + d,
            e = a.headers ? ka(a.headers) : {};null !== b && 0 < b.length && (e.Authorization = "Firebase " + b);e["X-Firebase-Storage-Version"] = "webjs/" + ("undefined" !== typeof firebase$4 ? firebase$4.SDK_VERSION : "AppManager");return new Wa(d, a.method, e, a.body, a.c, a.g, a.j, a.a, a.timeout, 0, c);
    };var Za = function (a) {
        this.b = firebase$4.Promise.reject(a);
    };Za.prototype.a = function () {
        return this.b;
    };Za.prototype.cancel = function () {};var $a = function () {
        this.a = {};this.b = Number.MIN_SAFE_INTEGER;
    },
        ab = function (a, b) {
        function c() {
            delete e.a[d];
        }var d = a.b;a.b++;a.a[d] = b;var e = a;b.a().then(c, c);
    },
        bb = function (a) {
        ja(a.a, function (a, c) {
            c && c.cancel(!0);
        });a.a = {};
    };var cb = -1 != G.indexOf("Opera"),
        db = -1 != G.indexOf("Trident") || -1 != G.indexOf("MSIE"),
        eb = -1 != G.indexOf("Edge"),
        fb = -1 != G.indexOf("Gecko") && !(-1 != G.toLowerCase().indexOf("webkit") && -1 == G.indexOf("Edge")) && !(-1 != G.indexOf("Trident") || -1 != G.indexOf("MSIE")) && -1 == G.indexOf("Edge"),
        gb = -1 != G.toLowerCase().indexOf("webkit") && -1 == G.indexOf("Edge"),
        hb;
    a: {
        var ib = "",
            jb = function () {
            var a = G;if (fb) return (/rv\:([^\);]+)(\)|;)/.exec(a)
            );if (eb) return (/Edge\/([\d\.]+)/.exec(a)
            );if (db) return (/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a)
            );if (gb) return (/WebKit\/(\S+)/.exec(a)
            );if (cb) return (/(?:Version)[ \/]?(\S+)/.exec(a)
            );
        }();jb && (ib = jb ? jb[1] : "");if (db) {
            var kb,
                lb = l.document;kb = lb ? lb.documentMode : void 0;if (null != kb && kb > parseFloat(ib)) {
                hb = String(kb);break a;
            }
        }hb = ib;
    }
    var mb = hb,
        ra = {},
        nb = function (a) {
        return sa(a, function () {
            for (var b = 0, c = ua(String(mb)).split("."), d = ua(String(a)).split("."), e = Math.max(c.length, d.length), f = 0; 0 == b && f < e; f++) {
                var g = c[f] || "",
                    h = d[f] || "";do {
                    g = /(\d*)(\D*)(.*)/.exec(g) || ["", "", "", ""];h = /(\d*)(\D*)(.*)/.exec(h) || ["", "", "", ""];if (0 == g[0].length && 0 == h[0].length) break;b = va(0 == g[1].length ? 0 : parseInt(g[1], 10), 0 == h[1].length ? 0 : parseInt(h[1], 10)) || va(0 == g[2].length, 0 == h[2].length) || va(g[2], h[2]);g = g[3];h = h[3];
                } while (0 == b);
            }return 0 <= b;
        });
    };var ob = function (a, b, c, d, e) {
        this.a = a;this.g = null;if (null !== this.a && (a = this.a.options, w(a))) {
            a = a.storageBucket || null;if (null == a) a = null;else {
                var f = null;try {
                    f = xa(a);
                } catch (g) {}if (null !== f) {
                    if ("" !== f.path) throw new r("invalid-default-bucket", "Invalid default bucket '" + a + "'.");a = f.bucket;
                }
            }this.g = a;
        }this.o = b;this.m = c;this.j = e;this.l = d;this.c = 12E4;this.b = 6E4;this.h = new $a();this.f = !1;
    },
        pb = function (a) {
        return null !== a.a && w(a.a.INTERNAL) && w(a.a.INTERNAL.getToken) ? a.a.INTERNAL.getToken().then(function (a) {
            return w(a) ? a.accessToken : null;
        }, function () {
            return null;
        }) : firebase$4.Promise.resolve(null);
    };ob.prototype.bucket = function () {
        if (this.f) throw ha();return this.g;
    };var I = function (a, b, c) {
        if (a.f) return new Za(ha());b = a.m(b, c, null === a.a, a.j);ab(a.h, b);return b;
    };var qb = function (a) {
        var b = l.BlobBuilder || l.WebKitBlobBuilder;if (n(b)) {
            for (var b = new b(), c = 0; c < arguments.length; c++) b.append(arguments[c]);return b.getBlob();
        }b = Sa(arguments);c = l.BlobBuilder || l.WebKitBlobBuilder;if (n(c)) {
            for (var c = new c(), d = 0; d < b.length; d++) c.append(b[d], void 0);b = c.getBlob(void 0);
        } else if (n(l.Blob)) b = new Blob(b, {});else throw Error("This browser doesn't seem to support creating Blobs");return b;
    },
        rb = function (a, b, c) {
        n(c) || (c = a.size);return a.webkitSlice ? a.webkitSlice(b, c) : a.mozSlice ? a.mozSlice(b, c) : a.slice ? fb && !nb("13.0") || gb && !nb("537.1") ? (0 > b && (b += a.size), 0 > b && (b = 0), 0 > c && (c += a.size), c < b && (c = b), a.slice(b, c - b)) : a.slice(b, c) : null;
    };var J = function (a, b) {
        pa() && a instanceof Blob ? (this.i = a, b = a.size, a = a.type) : (a instanceof ArrayBuffer ? (b ? this.i = new Uint8Array(a) : (this.i = new Uint8Array(a.byteLength), this.i.set(new Uint8Array(a))), b = this.i.length) : (b ? this.i = a : (this.i = new Uint8Array(a.length), this.i.set(a)), b = a.length), a = "");this.a = b;this.b = a;
    };J.prototype.type = function () {
        return this.b;
    };
    J.prototype.slice = function (a, b) {
        if (pa() && this.i instanceof Blob) return a = rb(this.i, a, b), null === a ? null : new J(a);a = new Uint8Array(this.i.buffer, a, b - a);return new J(a, !0);
    };
    var sb = function (a) {
        var b = [];Array.prototype.push.apply(b, arguments);if (pa()) return b = Ra(b, function (a) {
            return a instanceof J ? a.i : a;
        }), new J(qb.apply(null, b));var b = Ra(b, function (a) {
            return oa(a) ? Ea("raw", a).b.buffer : a.i.buffer;
        }),
            c = 0;Pa(b, function (a) {
            c += a.byteLength;
        });var d = new Uint8Array(c),
            e = 0;Pa(b, function (a) {
            a = new Uint8Array(a);for (var b = 0; b < a.length; b++) d[e++] = a[b];
        });return new J(d, !0);
    };var tb = function (a, b) {
        return b;
    },
        K = function (a, b, c, d) {
        this.c = a;this.b = b || a;this.writable = !!c;this.a = d || tb;
    },
        ub = null,
        vb = function () {
        if (ub) return ub;var a = [];a.push(new K("bucket"));a.push(new K("generation"));a.push(new K("metageneration"));a.push(new K("name", "fullPath", !0));var b = new K("name");b.a = function (a, b) {
            return !oa(b) || 2 > b.length ? b : Ua(b);
        };a.push(b);b = new K("size");b.a = function (a, b) {
            return w(b) ? +b : b;
        };a.push(b);a.push(new K("timeCreated"));a.push(new K("updated"));a.push(new K("md5Hash", null, !0));
        a.push(new K("cacheControl", null, !0));a.push(new K("contentDisposition", null, !0));a.push(new K("contentEncoding", null, !0));a.push(new K("contentLanguage", null, !0));a.push(new K("contentType", null, !0));a.push(new K("metadata", "customMetadata", !0));a.push(new K("downloadTokens", "downloadURLs", !1, function (a, b) {
            if (!(oa(b) && 0 < b.length)) return [];var c = encodeURIComponent;return Ra(b.split(","), function (b) {
                var d = a.fullPath,
                    d = "https://firebasestorage.googleapis.com/v0" + ("/b/" + c(a.bucket) + "/o/" + c(d));b = Fa({ alt: "media",
                    token: b });return d + b;
            });
        }));return ub = a;
    },
        wb = function (a, b) {
        Object.defineProperty(a, "ref", { get: function () {
                return b.o(b, new y(a.bucket, a.fullPath));
            } });
    },
        xb = function (a, b) {
        for (var c = {}, d = b.length, e = 0; e < d; e++) {
            var f = b[e];f.writable && (c[f.c] = a[f.b]);
        }return JSON.stringify(c);
    },
        yb = function (a) {
        if (!a || "object" !== typeof a) throw "Expected Metadata object.";for (var b in a) {
            var c = a[b];if ("customMetadata" === b && "object" !== typeof c) throw "Expected object for 'customMetadata' mapping.";
        }
    };var L = function (a, b, c) {
        for (var d = b.length, e = b.length, f = 0; f < b.length; f++) if (b[f].b) {
            d = f;break;
        }if (!(d <= c.length && c.length <= e)) throw d === e ? (b = d, d = 1 === d ? "argument" : "arguments") : (b = "between " + d + " and " + e, d = "arguments"), new r("invalid-argument-count", "Invalid argument count in `" + a + "`: Expected " + b + " " + d + ", received " + c.length + ".");for (f = 0; f < c.length; f++) try {
            b[f].a(c[f]);
        } catch (g) {
            if (g instanceof Error) throw ga(f, a, g.message);throw ga(f, a, g);
        }
    },
        M = function (a, b) {
        var c = this;this.a = function (b) {
            c.b && !n(b) || a(b);
        };
        this.b = !!b;
    },
        zb = function (a, b) {
        return function (c) {
            a(c);b(c);
        };
    },
        N = function (a, b) {
        function c(a) {
            if (!("string" === typeof a || a instanceof String)) throw "Expected string.";
        }var d;a ? d = zb(c, a) : d = c;return new M(d, b);
    },
        Ab = function () {
        return new M(function (a) {
            if (!(a instanceof Uint8Array || a instanceof ArrayBuffer || pa() && a instanceof Blob)) throw "Expected Blob or File.";
        });
    },
        Bb = function () {
        return new M(function (a) {
            if (!(("number" === typeof a || a instanceof Number) && 0 <= a)) throw "Expected a number 0 or greater.";
        });
    },
        Cb = function (a, b) {
        return new M(function (b) {
            if (!(null === b || w(b) && b instanceof Object)) throw "Expected an Object.";w(a) && a(b);
        }, b);
    },
        O = function () {
        return new M(function (a) {
            if (null !== a && "function" != aa(a)) throw "Expected a Function.";
        }, !0);
    };var P = function (a) {
        if (!a) throw da();
    },
        Db = function (a, b) {
        return function (c, d) {
            var e;a: {
                try {
                    e = JSON.parse(d);
                } catch (h) {
                    e = null;break a;
                }c = typeof e;e = "object" == c && null != e || "function" == c ? e : null;
            }if (null === e) e = null;else {
                c = { type: "file" };d = b.length;for (var f = 0; f < d; f++) {
                    var g = b[f];c[g.b] = g.a(c, e[g.c]);
                }wb(c, a);e = c;
            }P(null !== e);return e;
        };
    },
        Q = function (a) {
        return function (b, c) {
            b = 401 === D(b) ? new r("unauthenticated", "User is not authenticated, please authenticate using Firebase Authentication and try again.") : 402 === D(b) ? new r("quota-exceeded", "Quota for bucket '" + a.bucket + "' exceeded, please view quota on https://firebase.google.com/pricing/.") : 403 === D(b) ? new r("unauthorized", "User does not have permission to access '" + a.path + "'.") : c;b.serverResponse = c.serverResponse;return b;
        };
    },
        Eb = function (a) {
        var b = Q(a);return function (c, d) {
            var e = b(c, d);404 === D(c) && (e = new r("object-not-found", "Object '" + a.path + "' does not exist."));e.serverResponse = d.serverResponse;return e;
        };
    },
        Fb = function (a, b, c) {
        var d = wa(b);a = new u(q + "/v0" + d, "GET", Db(a, c), a.c);a.a = Eb(b);return a;
    },
        Gb = function (a, b) {
        var c = wa(b);a = new u(q + "/v0" + c, "DELETE", function () {}, a.c);a.c = [200, 204];a.a = Eb(b);return a;
    },
        Hb = function (a, b, c) {
        c = c ? ka(c) : {};c.fullPath = a.path;c.size = b.a;c.contentType || (a = b && b.type() || "application/octet-stream", c.contentType = a);return c;
    },
        Ib = function (a, b, c, d, e) {
        var f = "/b/" + encodeURIComponent(b.bucket) + "/o",
            g = { "X-Goog-Upload-Protocol": "multipart" },
            h;h = "";for (var m = 0; 2 > m; m++) h += Math.random().toString().slice(2);g["Content-Type"] = "multipart/related; boundary=" + h;e = Hb(b, d, e);m = xb(e, c);d = sb("--" + h + "\r\nContent-Type: application/json; charset=utf-8\r\n\r\n" + m + "\r\n--" + h + "\r\nContent-Type: " + e.contentType + "\r\n\r\n", d, "\r\n--" + h + "--");if (null === d) throw fa();a = new u(q + "/v0" + f, "POST", Db(a, c), a.b);a.b = { name: e.fullPath };a.headers = g;a.body = d.i;a.a = Q(b);return a;
    },
        Jb = function (a, b, c, d) {
        this.a = a;this.b = b;this.c = !!c;this.f = d || null;
    },
        Kb = function (a, b) {
        var c;try {
            c = a.a.getResponseHeader("X-Goog-Upload-Status");
        } catch (d) {
            P(!1);
        }a = 0 <= H(b || ["active"], c);P(a);return c;
    },
        Lb = function (a, b, c, d, e) {
        var f = "/b/" + encodeURIComponent(b.bucket) + "/o",
            g = Hb(b, d, e);e = { name: g.fullPath };f = q + "/v0" + f;d = { "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start", "X-Goog-Upload-Header-Content-Length": d.a, "X-Goog-Upload-Header-Content-Type": g.contentType, "Content-Type": "application/json; charset=utf-8" };c = xb(g, c);a = new u(f, "POST", function (a) {
            Kb(a);var b;try {
                b = a.a.getResponseHeader("X-Goog-Upload-URL");
            } catch (B) {
                P(!1);
            }P(oa(b));return b;
        }, a.b);a.b = e;a.headers = d;a.body = c;a.a = Q(b);return a;
    },
        Mb = function (a, b, c, d) {
        a = new u(c, "POST", function (a) {
            var b = Kb(a, ["active", "final"]),
                c;try {
                c = a.a.getResponseHeader("X-Goog-Upload-Size-Received");
            } catch (h) {
                P(!1);
            }a = c;isFinite(a) && (a = String(a));a = p(a) ? /^\s*-?0x/i.test(a) ? parseInt(a, 16) : parseInt(a, 10) : NaN;P(!isNaN(a));return new Jb(a, d.a, "final" === b);
        }, a.b);a.headers = { "X-Goog-Upload-Command": "query" };a.a = Q(b);a.f = !1;return a;
    },
        Nb = function (a, b, c, d, e, f, g) {
        var h = new Jb(0, 0);g ? (h.a = g.a, h.b = g.b) : (h.a = 0, h.b = d.a);if (d.a !== h.b) throw new r("server-file-wrong-size", "Server recorded incorrect upload file size, please retry the upload.");
        var m = g = h.b - h.a;0 < e && (m = Math.min(m, e));var B = h.a;e = { "X-Goog-Upload-Command": m === g ? "upload, finalize" : "upload", "X-Goog-Upload-Offset": h.a };g = d.slice(B, B + m);if (null === g) throw fa();c = new u(c, "POST", function (a, c) {
            var e = Kb(a, ["active", "final"]),
                g = h.a + m,
                C = d.a,
                z;"final" === e ? z = Db(b, f)(a, c) : z = null;return new Jb(g, C, "final" === e, z);
        }, b.b);c.headers = e;c.body = g.i;c.l = null;c.a = Q(a);c.f = !1;return c;
    };var T = function (a, b, c, d, e, f) {
        this.L = a;this.c = b;this.l = c;this.f = e;this.h = f || null;this.s = d;this.m = 0;this.D = this.u = !1;this.B = [];this.S = 262144 < this.f.a;this.b = "running";this.a = this.v = this.g = null;this.j = 1;var g = this;this.F = function (a) {
            g.a = null;g.j = 1;"storage/canceled" === a.code ? (g.u = !0, R(g)) : (g.g = a, S(g, "error"));
        };this.P = function (a) {
            g.a = null;"storage/canceled" === a.code ? R(g) : (g.g = a, S(g, "error"));
        };this.A = this.o = null;this.C = la(function (a, b) {
            g.o = a;g.A = b;Ob(g);
        });this.C.then(null, function () {});
    },
        Ob = function (a) {
        "running" === a.b && null === a.a && (a.S ? null === a.v ? Pb(a) : a.u ? Qb(a) : a.D ? Rb(a) : Sb(a) : Tb(a));
    },
        U = function (a, b) {
        pb(a.c).then(function (c) {
            switch (a.b) {case "running":
                    b(c);break;case "canceling":
                    S(a, "canceled");break;case "pausing":
                    S(a, "paused");}
        });
    },
        Pb = function (a) {
        U(a, function (b) {
            var c = Lb(a.c, a.l, a.s, a.f, a.h);a.a = I(a.c, c, b);a.a.a().then(function (b) {
                a.a = null;a.v = b;a.u = !1;R(a);
            }, this.F);
        });
    },
        Qb = function (a) {
        var b = a.v;U(a, function (c) {
            var d = Mb(a.c, a.l, b, a.f);a.a = I(a.c, d, c);a.a.a().then(function (b) {
                a.a = null;Ub(a, b.a);a.u = !1;b.c && (a.D = !0);R(a);
            }, a.F);
        });
    },
        Sb = function (a) {
        var b = 262144 * a.j,
            c = new Jb(a.m, a.f.a),
            d = a.v;U(a, function (e) {
            var f;try {
                f = Nb(a.l, a.c, d, a.f, b, a.s, c);
            } catch (g) {
                a.g = g;S(a, "error");return;
            }a.a = I(a.c, f, e);a.a.a().then(function (b) {
                33554432 > 262144 * a.j && (a.j *= 2);a.a = null;Ub(a, b.a);b.c ? (a.h = b.f, S(a, "success")) : R(a);
            }, a.F);
        });
    },
        Rb = function (a) {
        U(a, function (b) {
            var c = Fb(a.c, a.l, a.s);a.a = I(a.c, c, b);a.a.a().then(function (b) {
                a.a = null;a.h = b;S(a, "success");
            }, a.P);
        });
    },
        Tb = function (a) {
        U(a, function (b) {
            var c = Ib(a.c, a.l, a.s, a.f, a.h);a.a = I(a.c, c, b);a.a.a().then(function (b) {
                a.a = null;a.h = b;Ub(a, a.f.a);S(a, "success");
            }, a.F);
        });
    },
        Ub = function (a, b) {
        var c = a.m;a.m = b;a.m > c && V(a);
    },
        S = function (a, b) {
        if (a.b !== b) switch (b) {case "canceling":
                a.b = b;null !== a.a && a.a.cancel();break;case "pausing":
                a.b = b;null !== a.a && a.a.cancel();break;case "running":
                var c = "paused" === a.b;a.b = b;c && (V(a), Ob(a));break;case "paused":
                a.b = b;V(a);break;case "canceled":
                a.g = ea();a.b = b;V(a);break;case "error":
                a.b = b;V(a);break;case "success":
                a.b = b, V(a);}
    },
        R = function (a) {
        switch (a.b) {case "pausing":
                S(a, "paused");break;case "canceling":
                S(a, "canceled");break;case "running":
                Ob(a);}
    };T.prototype.w = function () {
        return new E(this.m, this.f.a, na(this.b), this.h, this, this.L);
    };
    T.prototype.M = function (a, b, c, d) {
        function e(a) {
            try {
                g(a);return;
            } catch (z) {}try {
                if (h(a), !(n(a.next) || n(a.error) || n(a.complete))) throw "";
            } catch (z) {
                throw "Expected a function or an Object with one of `next`, `error`, `complete` properties.";
            }
        }function f(a) {
            return function (b, c, d) {
                null !== a && L("on", a, arguments);var e = new ya(b, c, d);Vb(m, e);return function () {
                    var a = m.B,
                        b = H(a, e);0 <= b && (F(null != a.length), Array.prototype.splice.call(a, b, 1));
                };
            };
        }var g = O().a,
            h = Cb(null, !0).a;L("on", [N(function () {
            if ("state_changed" !== a) throw "Expected one of the event types: [state_changed].";
        }), Cb(e, !0), O(), O()], arguments);var m = this,
            B = [Cb(function (a) {
            if (null === a) throw "Expected a function or an Object with one of `next`, `error`, `complete` properties.";e(a);
        }), O(), O()];return n(b) || n(c) || n(d) ? f(null)(b, c, d) : f(B);
    };T.prototype.then = function (a, b) {
        return this.C.then(a, b);
    };
    var Vb = function (a, b) {
        a.B.push(b);Wb(a, b);
    },
        V = function (a) {
        Xb(a);var b = Sa(a.B);Pa(b, function (b) {
            Wb(a, b);
        });
    },
        Xb = function (a) {
        if (null !== a.o) {
            var b = !0;switch (na(a.b)) {case "success":
                    x(a.o.bind(null, a.w()))();break;case "canceled":case "error":
                    x(a.A.bind(null, a.g))();break;default:
                    b = !1;}b && (a.o = null, a.A = null);
        }
    },
        Wb = function (a, b) {
        switch (na(a.b)) {case "running":case "paused":
                null !== b.c && x(b.c.bind(b, a.w()))();break;case "success":
                null !== b.b && x(b.b.bind(b))();break;case "canceled":case "error":
                null !== b.a && x(b.a.bind(b, a.g))();break;default:
                null !== b.a && x(b.a.bind(b, a.g))();}
    };T.prototype.O = function () {
        L("resume", [], arguments);var a = "paused" === this.b || "pausing" === this.b;a && S(this, "running");return a;
    };T.prototype.N = function () {
        L("pause", [], arguments);var a = "running" === this.b;a && S(this, "pausing");return a;
    };T.prototype.cancel = function () {
        L("cancel", [], arguments);var a = "running" === this.b || "pausing" === this.b;a && S(this, "canceling");return a;
    };var W = function (a, b) {
        this.b = a;if (b) this.a = b instanceof y ? b : xa(b);else if (a = a.bucket(), null !== a) this.a = new y(a, "");else throw new r("no-default-bucket", "No default bucket found. Did you set the 'storageBucket' property when initializing the app?");
    };W.prototype.toString = function () {
        L("toString", [], arguments);return "gs://" + this.a.bucket + "/" + this.a.path;
    };var Yb = function (a, b) {
        return new W(a, b);
    };k = W.prototype;
    k.H = function (a) {
        L("child", [N()], arguments);var b = Ta(this.a.path, a);return Yb(this.b, new y(this.a.bucket, b));
    };k.ka = function () {
        var a;a = this.a.path;if (0 == a.length) a = null;else {
            var b = a.lastIndexOf("/");a = -1 === b ? "" : a.slice(0, b);
        }return null === a ? null : Yb(this.b, new y(this.a.bucket, a));
    };k.ma = function () {
        return Yb(this.b, new y(this.a.bucket, ""));
    };k.U = function () {
        return this.a.bucket;
    };k.fa = function () {
        return this.a.path;
    };k.ja = function () {
        return Ua(this.a.path);
    };k.oa = function () {
        return this.b.l;
    };
    k.Z = function (a, b) {
        L("put", [Ab(), new M(yb, !0)], arguments);X(this, "put");return new T(this, this.b, this.a, vb(), new J(a), b);
    };k.$ = function (a, b, c) {
        L("putString", [N(), N(za, !0), new M(yb, !0)], arguments);X(this, "putString");var d = Ea(w(b) ? b : "raw", a),
            e = c ? ka(c) : {};!w(e.contentType) && w(d.a) && (e.contentType = d.a);return new T(this, this.b, this.a, vb(), new J(d.b, !0), e);
    };k.X = function () {
        L("delete", [], arguments);X(this, "delete");var a = this;return pb(this.b).then(function (b) {
            var c = Gb(a.b, a.a);return I(a.b, c, b).a();
        });
    };
    k.I = function () {
        L("getMetadata", [], arguments);X(this, "getMetadata");var a = this;return pb(this.b).then(function (b) {
            var c = Fb(a.b, a.a, vb());return I(a.b, c, b).a();
        });
    };k.aa = function (a) {
        L("updateMetadata", [new M(yb, void 0)], arguments);X(this, "updateMetadata");var b = this;return pb(this.b).then(function (c) {
            var d = b.b,
                e = b.a,
                f = a,
                g = vb(),
                h = wa(e),
                h = q + "/v0" + h,
                f = xb(f, g),
                d = new u(h, "PATCH", Db(d, g), d.c);d.headers = { "Content-Type": "application/json; charset=utf-8" };d.body = f;d.a = Eb(e);return I(b.b, d, c).a();
        });
    };
    k.Y = function () {
        L("getDownloadURL", [], arguments);X(this, "getDownloadURL");return this.I().then(function (a) {
            a = a.downloadURLs[0];if (w(a)) return a;throw new r("no-download-url", "The given file does not have any download URLs.");
        });
    };var X = function (a, b) {
        if ("" === a.a.path) throw new r("invalid-root-operation", "The operation '" + b + "' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').");
    };var Y = function (a, b) {
        this.a = new ob(a, function (a, b) {
            return new W(a, b);
        }, Ya, this, w(b) ? b : new Oa());this.b = a;this.c = new Zb(this);
    };k = Y.prototype;k.ba = function (a) {
        L("ref", [N(function (a) {
            if (/^[A-Za-z]+:\/\//.test(a)) throw "Expected child path but got a URL, use refFromURL instead.";
        }, !0)], arguments);var b = new W(this.a);return n(a) ? b.H(a) : b;
    };
    k.ca = function (a) {
        L("refFromURL", [N(function (a) {
            if (!/^[A-Za-z]+:\/\//.test(a)) throw "Expected full URL but got a child path, use ref instead.";try {
                xa(a);
            } catch (c) {
                throw "Expected valid full URL but got an invalid one.";
            }
        }, !1)], arguments);return new W(this.a, a);
    };k.ha = function () {
        return this.a.b;
    };k.ea = function (a) {
        L("setMaxUploadRetryTime", [Bb()], arguments);this.a.b = a;
    };k.ga = function () {
        return this.a.c;
    };k.da = function (a) {
        L("setMaxOperationRetryTime", [Bb()], arguments);this.a.c = a;
    };k.T = function () {
        return this.b;
    };
    k.R = function () {
        return this.c;
    };var Zb = function (a) {
        this.a = a;
    };Zb.prototype.b = function () {
        var a = this.a.a;a.f = !0;a.a = null;bb(a.h);
    };var Z = function (a, b, c) {
        Object.defineProperty(a, b, { get: c });
    };W.prototype.toString = W.prototype.toString;W.prototype.child = W.prototype.H;W.prototype.put = W.prototype.Z;W.prototype.putString = W.prototype.$;W.prototype["delete"] = W.prototype.X;W.prototype.getMetadata = W.prototype.I;W.prototype.updateMetadata = W.prototype.aa;W.prototype.getDownloadURL = W.prototype.Y;Z(W.prototype, "parent", W.prototype.ka);Z(W.prototype, "root", W.prototype.ma);Z(W.prototype, "bucket", W.prototype.U);Z(W.prototype, "fullPath", W.prototype.fa);
    Z(W.prototype, "name", W.prototype.ja);Z(W.prototype, "storage", W.prototype.oa);Y.prototype.ref = Y.prototype.ba;Y.prototype.refFromURL = Y.prototype.ca;Z(Y.prototype, "maxOperationRetryTime", Y.prototype.ga);Y.prototype.setMaxOperationRetryTime = Y.prototype.da;Z(Y.prototype, "maxUploadRetryTime", Y.prototype.ha);Y.prototype.setMaxUploadRetryTime = Y.prototype.ea;Z(Y.prototype, "app", Y.prototype.T);Z(Y.prototype, "INTERNAL", Y.prototype.R);Zb.prototype["delete"] = Zb.prototype.b;Y.prototype.capi_ = function (a) {
        q = a;
    };
    T.prototype.on = T.prototype.M;T.prototype.resume = T.prototype.O;T.prototype.pause = T.prototype.N;T.prototype.cancel = T.prototype.cancel;Z(T.prototype, "snapshot", T.prototype.w);Z(E.prototype, "bytesTransferred", E.prototype.V);Z(E.prototype, "totalBytes", E.prototype.qa);Z(E.prototype, "state", E.prototype.na);Z(E.prototype, "metadata", E.prototype.ia);Z(E.prototype, "downloadURL", E.prototype.W);Z(E.prototype, "task", E.prototype.pa);Z(E.prototype, "ref", E.prototype.la);ma.STATE_CHANGED = "state_changed";
    v.RUNNING = "running";v.PAUSED = "paused";v.SUCCESS = "success";v.CANCELED = "canceled";v.ERROR = "error";A.RAW = "raw";A.BASE64 = "base64";A.BASE64URL = "base64url";A.DATA_URL = "data_url";(function () {
        function a(a) {
            return new Y(a);
        }var b = { TaskState: v, TaskEvent: ma, StringFormat: A, Storage: Y, Reference: W };if ("undefined" !== typeof firebase$4) firebase$4.INTERNAL.registerService("storage", a, b);else throw Error("Cannot install Firebase Storage - be sure to load firebase-app.js first.");
    })();
})();

var firebase$5 = app;
/*! @license Firebase v3.6.1
    Build: 3.6.1-rc.3
    Terms: https://firebase.google.com/terms/ */
(function () {
    var e = function (a, b) {
        function c() {}c.prototype = b.prototype;a.prototype = new c();for (var d in b) if (Object.defineProperties) {
            var f = Object.getOwnPropertyDescriptor(b, d);f && Object.defineProperty(a, d, f);
        } else a[d] = b[d];
    },
        g = this,
        h = function (a) {
        var b = typeof a;if ("object" == b) {
            if (a) {
                if (a instanceof Array) return "array";if (a instanceof Object) return b;var c = Object.prototype.toString.call(a);if ("[object Window]" == c) return "object";if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function";
            } else return "null";
        } else if ("function" == b && "undefined" == typeof a.call) return "object";return b;
    },
        k = function (a, b) {
        function c() {}c.prototype = b.prototype;a.ga = b.prototype;a.prototype = new c();a.ca = function (a, c, p) {
            for (var d = Array(arguments.length - 2), f = 2; f < arguments.length; f++) d[f - 2] = arguments[f];
            return b.prototype[c].apply(a, d);
        };
    };var l = { c: "only-available-in-window", o: "only-available-in-sw", O: "should-be-overriden", g: "bad-sender-id", C: "incorrect-gcm-sender-id", M: "permission-default", L: "permission-blocked", U: "unsupported-browser", G: "notifications-blocked", w: "failed-serviceworker-registration", h: "sw-registration-expected", B: "get-subscription-failed", F: "invalid-saved-token", l: "sw-reg-redundant", P: "token-subscribe-failed", S: "token-subscribe-no-token", R: "token-subscribe-no-push-set", V: "use-sw-before-get-token", D: "invalid-delete-token",
        v: "delete-token-not-found", s: "bg-handler-function-expected", K: "no-window-client-to-msg", T: "unable-to-resubscribe", I: "no-fcm-token-for-resubscribe", A: "failed-to-delete-token", J: "no-sw-in-reg" },
        n = {},
        q = (n[l.c] = "This method is available in a Window context.", n[l.o] = "This method is available in a service worker context.", n[l.O] = "This method should be overriden by extended classes.", n[l.g] = "Please ensure that 'messagingSenderId' is set correctly in the options passed into firebase.initializeApp().", n[l.M] = "The required permissions were not granted and dismissed instead.", n[l.L] = "The required permissions were not granted and blocked instead.", n[l.U] = "This browser doesn't support the API's required to use the firebase SDK.", n[l.G] = "Notifications have been blocked.", n[l.w] = "We are unable to register the default service worker. {$browserErrorMessage}", n[l.h] = "A service worker registration was the expected input.", n[l.B] = "There was an error when trying to get any existing Push Subscriptions.", n[l.F] = "Unable to access details of the saved token.", n[l.l] = "The service worker being used for push was made redundant.", n[l.P] = "A problem occured while subscribing the user to FCM: {$message}", n[l.S] = "FCM returned no token when subscribing the user to push.", n[l.R] = "FCM returned an invalid response when getting an FCM token.", n[l.V] = "You must call useServiceWorker() before calling getToken() to ensure your service worker is used.", n[l.D] = "You must pass a valid token into deleteToken(), i.e. the token from getToken().", n[l.v] = "The deletion attempt for token could not be performed as the token was not found.", n[l.s] = "The input to setBackgroundMessageHandler() must be a function.", n[l.K] = "An attempt was made to message a non-existant window client.", n[l.T] = "There was an error while re-subscribing the FCM token for push messaging. Will have to resubscribe the user on next visit. {$message}", n[l.I] = "Could not find an FCM token and as a result, unable to resubscribe. Will have to resubscribe the user on next visit.", n[l.A] = "Unable to delete the currently saved token.", n[l.J] = "Even though the service worker registration was successful, there was a problem accessing the service worker itself.", n[l.C] = "Please change your web app manifest's 'gcm_sender_id' value to '103953800507' to use Firebase messaging.", n);var r = { userVisibleOnly: !0, applicationServerKey: new Uint8Array([4, 51, 148, 247, 223, 161, 235, 177, 220, 3, 162, 94, 21, 113, 219, 72, 211, 46, 237, 237, 178, 52, 219, 183, 71, 58, 12, 143, 196, 204, 225, 111, 60, 140, 132, 223, 171, 182, 102, 62, 242, 12, 212, 139, 254, 227, 249, 118, 47, 20, 28, 99, 8, 106, 111, 45, 177, 26, 149, 176, 206, 55, 192, 156, 110]) };var t = { m: "firebase-messaging-msg-type", u: "firebase-messaging-msg-data" },
        u = { N: "push-msg-received", H: "notification-clicked" },
        w = function (a, b) {
        var c = {};return c[t.m] = a, c[t.u] = b, c;
    };var x = function (a) {
        if (Error.captureStackTrace) Error.captureStackTrace(this, x);else {
            var b = Error().stack;b && (this.stack = b);
        }a && (this.message = String(a));
    };k(x, Error);var y = function (a, b) {
        for (var c = a.split("%s"), d = "", f = Array.prototype.slice.call(arguments, 1); f.length && 1 < c.length;) d += c.shift() + f.shift();return d + c.join("%s");
    };var z = function (a, b) {
        b.unshift(a);x.call(this, y.apply(null, b));b.shift();
    };k(z, x);var A = function (a, b, c) {
        if (!a) {
            var d = "Assertion failed";if (b) var d = d + (": " + b),
                f = Array.prototype.slice.call(arguments, 2);throw new z("" + d, f || []);
        }
    };var B = null;var D = function (a) {
        a = new Uint8Array(a);var b = h(a);A("array" == b || "object" == b && "number" == typeof a.length, "encodeByteArray takes an array as a parameter");if (!B) for (B = {}, b = 0; 65 > b; b++) B[b] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(b);for (var b = B, c = [], d = 0; d < a.length; d += 3) {
            var f = a[d],
                p = d + 1 < a.length,
                m = p ? a[d + 1] : 0,
                C = d + 2 < a.length,
                v = C ? a[d + 2] : 0,
                P = f >> 2,
                f = (f & 3) << 4 | m >> 4,
                m = (m & 15) << 2 | v >> 6,
                v = v & 63;C || (v = 64, p || (m = 64));c.push(b[P], b[f], b[m], b[v]);
        }return c.join("").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };var E = new firebase$5.INTERNAL.ErrorFactory("messaging", "Messaging", q),
        F = function () {
        this.a = null;
    },
        G = function (a) {
        if (a.a) return a.a;a.a = new Promise(function (a, c) {
            var b = g.indexedDB.open("fcm_token_details_db", 1);b.onerror = function (a) {
                c(a.target.error);
            };b.onsuccess = function (b) {
                a(b.target.result);
            };b.onupgradeneeded = function (a) {
                a = a.target.result.createObjectStore("fcm_token_object_Store", { keyPath: "swScope" });a.createIndex("fcmSenderId", "fcmSenderId", { unique: !1 });a.createIndex("fcmToken", "fcmToken", { unique: !0 });
            };
        });
        return a.a;
    },
        H = function (a) {
        a.a ? a.a.then(function (b) {
            b.close();a.a = null;
        }) : Promise.resolve();
    },
        I = function (a, b) {
        return G(a).then(function (a) {
            return new Promise(function (c, f) {
                var d = a.transaction(["fcm_token_object_Store"]).objectStore("fcm_token_object_Store").index("fcmToken").get(b);d.onerror = function (a) {
                    f(a.target.error);
                };d.onsuccess = function (a) {
                    c(a.target.result);
                };
            });
        });
    },
        J = function (a, b) {
        return G(a).then(function (a) {
            return new Promise(function (c, f) {
                var d = [],
                    m = a.transaction(["fcm_token_object_Store"]).objectStore("fcm_token_object_Store").openCursor();
                m.onerror = function (a) {
                    f(a.target.error);
                };m.onsuccess = function (a) {
                    (a = a.target.result) ? (a.value.fcmSenderId === b && d.push(a.value), a.continue()) : c(d);
                };
            });
        });
    },
        K = function (a, b, c) {
        var d = D(b.getKey("p256dh")),
            f = D(b.getKey("auth"));a = "authorized_entity=" + a + "&" + ("endpoint=" + b.endpoint + "&") + ("encryption_key=" + d + "&") + ("encryption_auth=" + f);c && (a += "&pushSet=" + c);c = new Headers();c.append("Content-Type", "application/x-www-form-urlencoded");return fetch("https://fcm.googleapis.com/fcm/connect/subscribe", { method: "POST",
            headers: c, body: a }).then(function (a) {
            return a.json();
        }).then(function (a) {
            if (a.error) throw E.create(l.P, { message: a.error.message });if (!a.token) throw E.create(l.S);if (!a.pushSet) throw E.create(l.R);return { token: a.token, pushSet: a.pushSet };
        });
    },
        L = function (a, b, c, d, f, p) {
        var m = { swScope: c.scope, endpoint: d.endpoint, auth: D(d.getKey("auth")), p256dh: D(d.getKey("p256dh")), fcmToken: f, fcmPushSet: p, fcmSenderId: b };return G(a).then(function (a) {
            return new Promise(function (b, c) {
                var d = a.transaction(["fcm_token_object_Store"], "readwrite").objectStore("fcm_token_object_Store").put(m);d.onerror = function (a) {
                    c(a.target.error);
                };d.onsuccess = function () {
                    b();
                };
            });
        });
    };
    F.prototype.X = function (a, b) {
        return b instanceof ServiceWorkerRegistration ? "string" !== typeof a || 0 === a.length ? Promise.reject(E.create(l.g)) : J(this, a).then(function (c) {
            if (0 !== c.length) {
                var d = c.findIndex(function (c) {
                    return b.scope === c.swScope && a === c.fcmSenderId;
                });if (-1 !== d) return c[d];
            }
        }).then(function (a) {
            if (a) return b.pushManager.getSubscription().catch(function () {
                throw E.create(l.B);
            }).then(function (b) {
                var c;if (c = b) c = b.endpoint === a.endpoint && D(b.getKey("auth")) === a.auth && D(b.getKey("p256dh")) === a.p256dh;
                if (c) return a.fcmToken;
            });
        }) : Promise.reject(E.create(l.h));
    };F.prototype.getSavedToken = F.prototype.X;F.prototype.W = function (a, b) {
        var c = this;return "string" !== typeof a || 0 === a.length ? Promise.reject(E.create(l.g)) : b instanceof ServiceWorkerRegistration ? b.pushManager.getSubscription().then(function (a) {
            return a ? a : b.pushManager.subscribe(r);
        }).then(function (d) {
            return K(a, d).then(function (f) {
                return L(c, a, b, d, f.token, f.pushSet).then(function () {
                    return f.token;
                });
            });
        }) : Promise.reject(E.create(l.h));
    };
    F.prototype.createToken = F.prototype.W;F.prototype.deleteToken = function (a) {
        var b = this;return "string" !== typeof a || 0 === a.length ? Promise.reject(E.create(l.D)) : I(this, a).then(function (a) {
            if (!a) throw E.create(l.v);return G(b).then(function (b) {
                return new Promise(function (c, d) {
                    var f = b.transaction(["fcm_token_object_Store"], "readwrite").objectStore("fcm_token_object_Store").delete(a.swScope);f.onerror = function (a) {
                        d(a.target.error);
                    };f.onsuccess = function (b) {
                        0 === b.target.result ? d(E.create(l.A)) : c(a);
                    };
                });
            });
        });
    };var M = function (a) {
        var b = this;this.a = new firebase$5.INTERNAL.ErrorFactory("messaging", "Messaging", q);if (!a.options.messagingSenderId || "string" !== typeof a.options.messagingSenderId) throw this.a.create(l.g);this.Z = a.options.messagingSenderId;this.f = new F();this.app = a;this.INTERNAL = {};this.INTERNAL.delete = function () {
            return b.delete;
        };
    };
    M.prototype.getToken = function () {
        var a = this,
            b = Notification.permission;return "granted" !== b ? "denied" === b ? Promise.reject(this.a.create(l.G)) : Promise.resolve(null) : this.i().then(function (b) {
            return a.f.X(a.Z, b).then(function (c) {
                return c ? c : a.f.W(a.Z, b);
            });
        });
    };M.prototype.getToken = M.prototype.getToken;M.prototype.deleteToken = function (a) {
        var b = this;return this.f.deleteToken(a).then(function () {
            return b.i();
        }).then(function (a) {
            return a ? a.pushManager.getSubscription() : null;
        }).then(function (a) {
            if (a) return a.unsubscribe();
        });
    };
    M.prototype.deleteToken = M.prototype.deleteToken;M.prototype.i = function () {
        throw this.a.create(l.O);
    };M.prototype.requestPermission = function () {
        throw this.a.create(l.c);
    };M.prototype.useServiceWorker = function () {
        throw this.a.create(l.c);
    };M.prototype.useServiceWorker = M.prototype.useServiceWorker;M.prototype.onMessage = function () {
        throw this.a.create(l.c);
    };M.prototype.onMessage = M.prototype.onMessage;M.prototype.onTokenRefresh = function () {
        throw this.a.create(l.c);
    };M.prototype.onTokenRefresh = M.prototype.onTokenRefresh;
    M.prototype.setBackgroundMessageHandler = function () {
        throw this.a.create(l.o);
    };M.prototype.setBackgroundMessageHandler = M.prototype.setBackgroundMessageHandler;M.prototype.delete = function () {
        H(this.f);
    };var N = self,
        S = function (a) {
        var b = this;M.call(this, a);this.a = new firebase$5.INTERNAL.ErrorFactory("messaging", "Messaging", q);N.addEventListener("push", function (a) {
            return O(b, a);
        }, !1);N.addEventListener("pushsubscriptionchange", function (a) {
            return Q(b, a);
        }, !1);N.addEventListener("notificationclick", function (a) {
            return R(b, a);
        }, !1);this.b = null;
    };e(S, M);
    var O = function (a, b) {
        var c;try {
            c = b.data.json();
        } catch (f) {
            return;
        }var d = T().then(function (b) {
            if (b) {
                if (c.notification || a.b) return U(a, c);
            } else {
                if ((b = c) && "object" === typeof b.notification) {
                    var d = Object.assign({}, b.notification),
                        f = {};d.data = (f.FCM_MSG = b, f);b = d;
                } else b = void 0;if (b) return N.registration.showNotification(b.title || "", b);if (a.b) return a.b(c);
            }
        });b.waitUntil(d);
    },
        Q = function (a, b) {
        var c = a.getToken().then(function (b) {
            if (!b) throw a.a.create(l.I);var c = a.f;return I(c, b).then(function (b) {
                if (!b) throw a.a.create(l.F);
                return N.registration.pushManager.subscribe(r).then(function (a) {
                    return K(b.ea, a, b.da);
                }).catch(function (d) {
                    return c.deleteToken(b.fa).then(function () {
                        throw a.a.create(l.T, { message: d });
                    });
                });
            });
        });b.waitUntil(c);
    },
        R = function (a, b) {
        if (b.notification && b.notification.data && b.notification.data.FCM_MSG) {
            b.stopImmediatePropagation();b.notification.close();var c = b.notification.data.FCM_MSG,
                d = c.notification.click_action;if (d) {
                var f = V(d).then(function (a) {
                    return a ? a : N.clients.openWindow(d);
                }).then(function (b) {
                    if (b) return delete c.notification, W(a, b, w(u.H, c));
                });b.waitUntil(f);
            }
        }
    };S.prototype.setBackgroundMessageHandler = function (a) {
        if (a && "function" !== typeof a) throw this.a.create(l.s);this.b = a;
    };S.prototype.setBackgroundMessageHandler = S.prototype.setBackgroundMessageHandler;
    var V = function (a) {
        var b = new URL(a).href;return N.clients.matchAll({ type: "window", includeUncontrolled: !0 }).then(function (a) {
            for (var c = null, f = 0; f < a.length; f++) if (new URL(a[f].url).href === b) {
                c = a[f];break;
            }if (c) return c.focus(), c;
        });
    },
        W = function (a, b, c) {
        return new Promise(function (d, f) {
            if (!b) return f(a.a.create(l.K));b.postMessage(c);d();
        });
    },
        T = function () {
        return N.clients.matchAll({ type: "window", includeUncontrolled: !0 }).then(function (a) {
            return a.some(function (a) {
                return "visible" === a.visibilityState;
            });
        });
    },
        U = function (a, b) {
        return N.clients.matchAll({ type: "window", includeUncontrolled: !0 }).then(function (c) {
            var d = w(u.N, b);return Promise.all(c.map(function (b) {
                return W(a, b, d);
            }));
        });
    };S.prototype.i = function () {
        return Promise.resolve(N.registration);
    };var Y = function (a) {
        var b = this;M.call(this, a);this.Y = null;this.$ = firebase$5.INTERNAL.createSubscribe(function (a) {
            b.Y = a;
        });this.ba = null;this.aa = firebase$5.INTERNAL.createSubscribe(function (a) {
            b.ba = a;
        });X(this);
    };e(Y, M);
    Y.prototype.getToken = function () {
        var a = this;return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification") && PushSubscription.prototype.hasOwnProperty("getKey") ? aa(this).then(function () {
            return M.prototype.getToken.call(a);
        }) : Promise.reject(this.a.create(l.U));
    };Y.prototype.getToken = Y.prototype.getToken;
    var aa = function (a) {
        if (a.j) return a.j;var b = document.querySelector('link[rel="manifest"]');b ? a.j = fetch(b.href).then(function (a) {
            return a.json();
        }).catch(function () {
            return Promise.resolve();
        }).then(function (b) {
            if (b && b.gcm_sender_id && "103953800507" !== b.gcm_sender_id) throw a.a.create(l.C);
        }) : a.j = Promise.resolve();return a.j;
    };
    Y.prototype.requestPermission = function () {
        var a = this;return "granted" === Notification.permission ? Promise.resolve() : new Promise(function (b, c) {
            var d = function (d) {
                return "granted" === d ? b() : "denied" === d ? c(a.a.create(l.L)) : c(a.a.create(l.M));
            },
                f = Notification.requestPermission(function (a) {
                f || d(a);
            });f && f.then(d);
        });
    };Y.prototype.requestPermission = Y.prototype.requestPermission;
    Y.prototype.useServiceWorker = function (a) {
        if (!(a instanceof ServiceWorkerRegistration)) throw this.a.create(l.h);if ("undefined" !== typeof this.b) throw this.a.create(l.V);this.b = a;
    };Y.prototype.useServiceWorker = Y.prototype.useServiceWorker;Y.prototype.onMessage = function (a, b, c) {
        return this.$(a, b, c);
    };Y.prototype.onMessage = Y.prototype.onMessage;Y.prototype.onTokenRefresh = function (a, b, c) {
        return this.aa(a, b, c);
    };Y.prototype.onTokenRefresh = Y.prototype.onTokenRefresh;
    var Z = function (a, b) {
        var c = b.installing || b.waiting || b.active;return new Promise(function (d, f) {
            if (c) {
                if ("activated" === c.state) d(b);else if ("redundant" === c.state) f(a.a.create(l.l));else {
                    var p = function () {
                        if ("activated" === c.state) d(b);else if ("redundant" === c.state) f(a.a.create(l.l));else return;c.removeEventListener("statechange", p);
                    };c.addEventListener("statechange", p);
                }
            } else f(a.a.create(l.J));
        });
    };
    Y.prototype.i = function () {
        var a = this;if (this.b) return Z(this, this.b);this.b = null;return navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/firebase-cloud-messaging-push-scope" }).catch(function (b) {
            throw a.a.create(l.w, { browserErrorMessage: b.message });
        }).then(function (b) {
            return Z(a, b).then(function () {
                a.b = b;b.update();return b;
            });
        });
    };
    var X = function (a) {
        "serviceWorker" in navigator && navigator.serviceWorker.addEventListener("message", function (b) {
            if (b.data && b.data[t.m]) switch (b = b.data, b[t.m]) {case u.N:case u.H:
                    a.Y.next(b[t.u]);}
        }, !1);
    };if (!(firebase$5 && firebase$5.INTERNAL && firebase$5.INTERNAL.registerService)) throw Error("Cannot install Firebase Messaging - be sure to load firebase-app.js first.");firebase$5.INTERNAL.registerService("messaging", function (a) {
        return self && "ServiceWorkerGlobalScope" in self ? new S(a) : new Y(a);
    }, { Messaging: Y });
})();

/**
 *  Firebase libraries for browser - npm package.
 *
 * Usage:
 *
 *   firebase = require('firebase');
 */
var firebase = app;




var firebaseBrowser = firebase;

var jquery$1 = createCommonjsModule(function (module) {
/*!
 * jQuery JavaScript Library v3.1.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2016-09-22T22:30Z
 */(function(global,factory){"use strict";if(typeof module==="object"&&typeof module.exports==="object"){// For CommonJS and CommonJS-like environments where a proper `window`
// is present, execute the factory and get jQuery.
// For environments that do not have a `window` with a `document`
// (such as Node.js), expose a factory as module.exports.
// This accentuates the need for the creation of a real `window`.
// e.g. var jQuery = require("jquery")(window);
// See ticket #14549 for more info.
module.exports=global.document?factory(global,true):function(w){if(!w.document){throw new Error("jQuery requires a window with a document");}return factory(w);};}else{factory(global);}// Pass this if window is not defined yet
})(typeof window!=="undefined"?window:commonjsGlobal,function(window,noGlobal){// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";var arr=[];var document=window.document;var getProto=Object.getPrototypeOf;var slice=arr.slice;var concat=arr.concat;var push=arr.push;var indexOf=arr.indexOf;var class2type={};var toString=class2type.toString;var hasOwn=class2type.hasOwnProperty;var fnToString=hasOwn.toString;var ObjectFunctionString=fnToString.call(Object);var support={};function DOMEval(code,doc){doc=doc||document;var script=doc.createElement("script");script.text=code;doc.head.appendChild(script).parentNode.removeChild(script);}/* global Symbol */// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module
var version="3.1.1",// Define a local copy of jQuery
jQuery=function(selector,context){// The jQuery object is actually just the init constructor 'enhanced'
// Need init if jQuery is called (just allow error to be thrown if not included)
return new jQuery.fn.init(selector,context);},// Support: Android <=4.0 only
// Make sure we trim BOM and NBSP
rtrim=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,// Matches dashed string for camelizing
rmsPrefix=/^-ms-/,rdashAlpha=/-([a-z])/g,// Used by jQuery.camelCase as callback to replace()
fcamelCase=function(all,letter){return letter.toUpperCase();};jQuery.fn=jQuery.prototype={// The current version of jQuery being used
jquery:version,constructor:jQuery,// The default length of a jQuery object is 0
length:0,toArray:function(){return slice.call(this);},// Get the Nth element in the matched element set OR
// Get the whole matched element set as a clean array
get:function(num){// Return all the elements in a clean array
if(num==null){return slice.call(this);}// Return just the one element from the set
return num<0?this[num+this.length]:this[num];},// Take an array of elements and push it onto the stack
// (returning the new matched element set)
pushStack:function(elems){// Build a new jQuery matched element set
var ret=jQuery.merge(this.constructor(),elems);// Add the old object onto the stack (as a reference)
ret.prevObject=this;// Return the newly-formed element set
return ret;},// Execute a callback for every element in the matched set.
each:function(callback){return jQuery.each(this,callback);},map:function(callback){return this.pushStack(jQuery.map(this,function(elem,i){return callback.call(elem,i,elem);}));},slice:function(){return this.pushStack(slice.apply(this,arguments));},first:function(){return this.eq(0);},last:function(){return this.eq(-1);},eq:function(i){var len=this.length,j=+i+(i<0?len:0);return this.pushStack(j>=0&&j<len?[this[j]]:[]);},end:function(){return this.prevObject||this.constructor();},// For internal use only.
// Behaves like an Array's method, not like a jQuery method.
push:push,sort:arr.sort,splice:arr.splice};jQuery.extend=jQuery.fn.extend=function(){var options,name,src,copy,copyIsArray,clone,target=arguments[0]||{},i=1,length=arguments.length,deep=false;// Handle a deep copy situation
if(typeof target==="boolean"){deep=target;// Skip the boolean and the target
target=arguments[i]||{};i++;}// Handle case when target is a string or something (possible in deep copy)
if(typeof target!=="object"&&!jQuery.isFunction(target)){target={};}// Extend jQuery itself if only one argument is passed
if(i===length){target=this;i--;}for(;i<length;i++){// Only deal with non-null/undefined values
if((options=arguments[i])!=null){// Extend the base object
for(name in options){src=target[name];copy=options[name];// Prevent never-ending loop
if(target===copy){continue;}// Recurse if we're merging plain objects or arrays
if(deep&&copy&&(jQuery.isPlainObject(copy)||(copyIsArray=jQuery.isArray(copy)))){if(copyIsArray){copyIsArray=false;clone=src&&jQuery.isArray(src)?src:[];}else{clone=src&&jQuery.isPlainObject(src)?src:{};}// Never move original objects, clone them
target[name]=jQuery.extend(deep,clone,copy);// Don't bring in undefined values
}else if(copy!==undefined){target[name]=copy;}}}}// Return the modified object
return target;};jQuery.extend({// Unique for each copy of jQuery on the page
expando:"jQuery"+(version+Math.random()).replace(/\D/g,""),// Assume jQuery is ready without the ready module
isReady:true,error:function(msg){throw new Error(msg);},noop:function(){},isFunction:function(obj){return jQuery.type(obj)==="function";},isArray:Array.isArray,isWindow:function(obj){return obj!=null&&obj===obj.window;},isNumeric:function(obj){// As of jQuery 3.0, isNumeric is limited to
// strings and numbers (primitives or objects)
// that can be coerced to finite numbers (gh-2662)
var type=jQuery.type(obj);return(type==="number"||type==="string")&&// parseFloat NaNs numeric-cast false positives ("")
// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
// subtraction forces infinities to NaN
!isNaN(obj-parseFloat(obj));},isPlainObject:function(obj){var proto,Ctor;// Detect obvious negatives
// Use toString instead of jQuery.type to catch host objects
if(!obj||toString.call(obj)!=="[object Object]"){return false;}proto=getProto(obj);// Objects with no prototype (e.g., `Object.create( null )`) are plain
if(!proto){return true;}// Objects with prototype are plain iff they were constructed by a global Object function
Ctor=hasOwn.call(proto,"constructor")&&proto.constructor;return typeof Ctor==="function"&&fnToString.call(Ctor)===ObjectFunctionString;},isEmptyObject:function(obj){/* eslint-disable no-unused-vars */// See https://github.com/eslint/eslint/issues/6125
var name;for(name in obj){return false;}return true;},type:function(obj){if(obj==null){return obj+"";}// Support: Android <=2.3 only (functionish RegExp)
return typeof obj==="object"||typeof obj==="function"?class2type[toString.call(obj)]||"object":typeof obj;},// Evaluates a script in a global context
globalEval:function(code){DOMEval(code);},// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 13
// Microsoft forgot to hump their vendor prefix (#9572)
camelCase:function(string){return string.replace(rmsPrefix,"ms-").replace(rdashAlpha,fcamelCase);},nodeName:function(elem,name){return elem.nodeName&&elem.nodeName.toLowerCase()===name.toLowerCase();},each:function(obj,callback){var length,i=0;if(isArrayLike(obj)){length=obj.length;for(;i<length;i++){if(callback.call(obj[i],i,obj[i])===false){break;}}}else{for(i in obj){if(callback.call(obj[i],i,obj[i])===false){break;}}}return obj;},// Support: Android <=4.0 only
trim:function(text){return text==null?"":(text+"").replace(rtrim,"");},// results is for internal usage only
makeArray:function(arr,results){var ret=results||[];if(arr!=null){if(isArrayLike(Object(arr))){jQuery.merge(ret,typeof arr==="string"?[arr]:arr);}else{push.call(ret,arr);}}return ret;},inArray:function(elem,arr,i){return arr==null?-1:indexOf.call(arr,elem,i);},// Support: Android <=4.0 only, PhantomJS 1 only
// push.apply(_, arraylike) throws on ancient WebKit
merge:function(first,second){var len=+second.length,j=0,i=first.length;for(;j<len;j++){first[i++]=second[j];}first.length=i;return first;},grep:function(elems,callback,invert){var callbackInverse,matches=[],i=0,length=elems.length,callbackExpect=!invert;// Go through the array, only saving the items
// that pass the validator function
for(;i<length;i++){callbackInverse=!callback(elems[i],i);if(callbackInverse!==callbackExpect){matches.push(elems[i]);}}return matches;},// arg is for internal usage only
map:function(elems,callback,arg){var length,value,i=0,ret=[];// Go through the array, translating each of the items to their new values
if(isArrayLike(elems)){length=elems.length;for(;i<length;i++){value=callback(elems[i],i,arg);if(value!=null){ret.push(value);}}// Go through every key on the object,
}else{for(i in elems){value=callback(elems[i],i,arg);if(value!=null){ret.push(value);}}}// Flatten any nested arrays
return concat.apply([],ret);},// A global GUID counter for objects
guid:1,// Bind a function to a context, optionally partially applying any
// arguments.
proxy:function(fn,context){var tmp,args,proxy;if(typeof context==="string"){tmp=fn[context];context=fn;fn=tmp;}// Quick check to determine if target is callable, in the spec
// this throws a TypeError, but we will just return undefined.
if(!jQuery.isFunction(fn)){return undefined;}// Simulated bind
args=slice.call(arguments,2);proxy=function(){return fn.apply(context||this,args.concat(slice.call(arguments)));};// Set the guid of unique handler to the same of original handler, so it can be removed
proxy.guid=fn.guid=fn.guid||jQuery.guid++;return proxy;},now:Date.now,// jQuery.support is not used in Core but other projects attach their
// properties to it so it needs to exist.
support:support});if(typeof Symbol==="function"){jQuery.fn[Symbol.iterator]=arr[Symbol.iterator];}// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(i,name){class2type["[object "+name+"]"]=name.toLowerCase();});function isArrayLike(obj){// Support: real iOS 8.2 only (not reproducible in simulator)
// `in` check used to prevent JIT error (gh-2145)
// hasOwn isn't used here due to false negatives
// regarding Nodelist length in IE
var length=!!obj&&"length"in obj&&obj.length,type=jQuery.type(obj);if(type==="function"||jQuery.isWindow(obj)){return false;}return type==="array"||length===0||typeof length==="number"&&length>0&&length-1 in obj;}var Sizzle=/*!
 * Sizzle CSS Selector Engine v2.3.3
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-08
 */function(window){var i,support,Expr,getText,isXML,tokenize,compile,select,outermostContext,sortInput,hasDuplicate,// Local document vars
setDocument,document,docElem,documentIsHTML,rbuggyQSA,rbuggyMatches,matches,contains,// Instance-specific data
expando="sizzle"+1*new Date(),preferredDoc=window.document,dirruns=0,done=0,classCache=createCache(),tokenCache=createCache(),compilerCache=createCache(),sortOrder=function(a,b){if(a===b){hasDuplicate=true;}return 0;},// Instance methods
hasOwn={}.hasOwnProperty,arr=[],pop=arr.pop,push_native=arr.push,push=arr.push,slice=arr.slice,// Use a stripped-down indexOf as it's faster than native
// https://jsperf.com/thor-indexof-vs-for/5
indexOf=function(list,elem){var i=0,len=list.length;for(;i<len;i++){if(list[i]===elem){return i;}}return-1;},booleans="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",// Regular expressions
// http://www.w3.org/TR/css3-selectors/#whitespace
whitespace="[\\x20\\t\\r\\n\\f]",// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
identifier="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
attributes="\\["+whitespace+"*("+identifier+")(?:"+whitespace+// Operator (capture 2)
"*([*^$|!~]?=)"+whitespace+// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+identifier+"))|)"+whitespace+"*\\]",pseudos=":("+identifier+")(?:\\(("+// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
// 1. quoted (capture 3; capture 4 or capture 5)
"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|"+// 2. simple (capture 6)
"((?:\\\\.|[^\\\\()[\\]]|"+attributes+")*)|"+// 3. anything else (capture 2)
".*"+")\\)|)",// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
rwhitespace=new RegExp(whitespace+"+","g"),rtrim=new RegExp("^"+whitespace+"+|((?:^|[^\\\\])(?:\\\\.)*)"+whitespace+"+$","g"),rcomma=new RegExp("^"+whitespace+"*,"+whitespace+"*"),rcombinators=new RegExp("^"+whitespace+"*([>+~]|"+whitespace+")"+whitespace+"*"),rattributeQuotes=new RegExp("="+whitespace+"*([^\\]'\"]*?)"+whitespace+"*\\]","g"),rpseudo=new RegExp(pseudos),ridentifier=new RegExp("^"+identifier+"$"),matchExpr={"ID":new RegExp("^#("+identifier+")"),"CLASS":new RegExp("^\\.("+identifier+")"),"TAG":new RegExp("^("+identifier+"|[*])"),"ATTR":new RegExp("^"+attributes),"PSEUDO":new RegExp("^"+pseudos),"CHILD":new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+whitespace+"*(even|odd|(([+-]|)(\\d*)n|)"+whitespace+"*(?:([+-]|)"+whitespace+"*(\\d+)|))"+whitespace+"*\\)|)","i"),"bool":new RegExp("^(?:"+booleans+")$","i"),// For use in libraries implementing .is()
// We use this for POS matching in `select`
"needsContext":new RegExp("^"+whitespace+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+whitespace+"*((?:-\\d)?\\d*)"+whitespace+"*\\)|)(?=[^-]|$)","i")},rinputs=/^(?:input|select|textarea|button)$/i,rheader=/^h\d$/i,rnative=/^[^{]+\{\s*\[native \w/,// Easily-parseable/retrievable ID or TAG or CLASS selectors
rquickExpr=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,rsibling=/[+~]/,// CSS escapes
// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
runescape=new RegExp("\\\\([\\da-f]{1,6}"+whitespace+"?|("+whitespace+")|.)","ig"),funescape=function(_,escaped,escapedWhitespace){var high="0x"+escaped-0x10000;// NaN means non-codepoint
// Support: Firefox<24
// Workaround erroneous numeric interpretation of +"0x"
return high!==high||escapedWhitespace?escaped:high<0?// BMP codepoint
String.fromCharCode(high+0x10000):// Supplemental Plane codepoint (surrogate pair)
String.fromCharCode(high>>10|0xD800,high&0x3FF|0xDC00);},// CSS string/identifier serialization
// https://drafts.csswg.org/cssom/#common-serializing-idioms
rcssescape=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,fcssescape=function(ch,asCodePoint){if(asCodePoint){// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
if(ch==="\0"){return"\uFFFD";}// Control characters and (dependent upon position) numbers get escaped as code points
return ch.slice(0,-1)+"\\"+ch.charCodeAt(ch.length-1).toString(16)+" ";}// Other potentially-special ASCII characters get backslash-escaped
return"\\"+ch;},// Used for iframes
// See setDocument()
// Removing the function wrapper causes a "Permission Denied"
// error in IE
unloadHandler=function(){setDocument();},disabledAncestor=addCombinator(function(elem){return elem.disabled===true&&("form"in elem||"label"in elem);},{dir:"parentNode",next:"legend"});// Optimize for push.apply( _, NodeList )
try{push.apply(arr=slice.call(preferredDoc.childNodes),preferredDoc.childNodes);// Support: Android<4.0
// Detect silently failing push.apply
arr[preferredDoc.childNodes.length].nodeType;}catch(e){push={apply:arr.length?// Leverage slice if possible
function(target,els){push_native.apply(target,slice.call(els));}:// Support: IE<9
// Otherwise append directly
function(target,els){var j=target.length,i=0;// Can't trust NodeList.length
while(target[j++]=els[i++]){}target.length=j-1;}};}function Sizzle(selector,context,results,seed){var m,i,elem,nid,match,groups,newSelector,newContext=context&&context.ownerDocument,// nodeType defaults to 9, since context defaults to document
nodeType=context?context.nodeType:9;results=results||[];// Return early from calls with invalid selector or context
if(typeof selector!=="string"||!selector||nodeType!==1&&nodeType!==9&&nodeType!==11){return results;}// Try to shortcut find operations (as opposed to filters) in HTML documents
if(!seed){if((context?context.ownerDocument||context:preferredDoc)!==document){setDocument(context);}context=context||document;if(documentIsHTML){// If the selector is sufficiently simple, try using a "get*By*" DOM method
// (excepting DocumentFragment context, where the methods don't exist)
if(nodeType!==11&&(match=rquickExpr.exec(selector))){// ID selector
if(m=match[1]){// Document context
if(nodeType===9){if(elem=context.getElementById(m)){// Support: IE, Opera, Webkit
// TODO: identify versions
// getElementById can match elements by name instead of ID
if(elem.id===m){results.push(elem);return results;}}else{return results;}// Element context
}else{// Support: IE, Opera, Webkit
// TODO: identify versions
// getElementById can match elements by name instead of ID
if(newContext&&(elem=newContext.getElementById(m))&&contains(context,elem)&&elem.id===m){results.push(elem);return results;}}// Type selector
}else if(match[2]){push.apply(results,context.getElementsByTagName(selector));return results;// Class selector
}else if((m=match[3])&&support.getElementsByClassName&&context.getElementsByClassName){push.apply(results,context.getElementsByClassName(m));return results;}}// Take advantage of querySelectorAll
if(support.qsa&&!compilerCache[selector+" "]&&(!rbuggyQSA||!rbuggyQSA.test(selector))){if(nodeType!==1){newContext=context;newSelector=selector;// qSA looks outside Element context, which is not what we want
// Thanks to Andrew Dupont for this workaround technique
// Support: IE <=8
// Exclude object elements
}else if(context.nodeName.toLowerCase()!=="object"){// Capture the context ID, setting it first if necessary
if(nid=context.getAttribute("id")){nid=nid.replace(rcssescape,fcssescape);}else{context.setAttribute("id",nid=expando);}// Prefix every selector in the list
groups=tokenize(selector);i=groups.length;while(i--){groups[i]="#"+nid+" "+toSelector(groups[i]);}newSelector=groups.join(",");// Expand context for sibling selectors
newContext=rsibling.test(selector)&&testContext(context.parentNode)||context;}if(newSelector){try{push.apply(results,newContext.querySelectorAll(newSelector));return results;}catch(qsaError){}finally{if(nid===expando){context.removeAttribute("id");}}}}}}// All others
return select(selector.replace(rtrim,"$1"),context,results,seed);}/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */function createCache(){var keys=[];function cache(key,value){// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
if(keys.push(key+" ")>Expr.cacheLength){// Only keep the most recent entries
delete cache[keys.shift()];}return cache[key+" "]=value;}return cache;}/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */function markFunction(fn){fn[expando]=true;return fn;}/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */function assert(fn){var el=document.createElement("fieldset");try{return!!fn(el);}catch(e){return false;}finally{// Remove from its parent by default
if(el.parentNode){el.parentNode.removeChild(el);}// release memory in IE
el=null;}}/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */function addHandle(attrs,handler){var arr=attrs.split("|"),i=arr.length;while(i--){Expr.attrHandle[arr[i]]=handler;}}/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */function siblingCheck(a,b){var cur=b&&a,diff=cur&&a.nodeType===1&&b.nodeType===1&&a.sourceIndex-b.sourceIndex;// Use IE sourceIndex if available on both nodes
if(diff){return diff;}// Check if b follows a
if(cur){while(cur=cur.nextSibling){if(cur===b){return-1;}}}return a?1:-1;}/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */function createInputPseudo(type){return function(elem){var name=elem.nodeName.toLowerCase();return name==="input"&&elem.type===type;};}/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */function createButtonPseudo(type){return function(elem){var name=elem.nodeName.toLowerCase();return(name==="input"||name==="button")&&elem.type===type;};}/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */function createDisabledPseudo(disabled){// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
return function(elem){// Only certain elements can match :enabled or :disabled
// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
if("form"in elem){// Check for inherited disabledness on relevant non-disabled elements:
// * listed form-associated elements in a disabled fieldset
//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
// * option elements in a disabled optgroup
//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
// All such elements have a "form" property.
if(elem.parentNode&&elem.disabled===false){// Option elements defer to a parent optgroup if present
if("label"in elem){if("label"in elem.parentNode){return elem.parentNode.disabled===disabled;}else{return elem.disabled===disabled;}}// Support: IE 6 - 11
// Use the isDisabled shortcut property to check for disabled fieldset ancestors
return elem.isDisabled===disabled||// Where there is no isDisabled, check manually
/* jshint -W018 */elem.isDisabled!==!disabled&&disabledAncestor(elem)===disabled;}return elem.disabled===disabled;// Try to winnow out elements that can't be disabled before trusting the disabled property.
// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
// even exist on them, let alone have a boolean value.
}else if("label"in elem){return elem.disabled===disabled;}// Remaining elements are neither :enabled nor :disabled
return false;};}/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */function createPositionalPseudo(fn){return markFunction(function(argument){argument=+argument;return markFunction(function(seed,matches){var j,matchIndexes=fn([],seed.length,argument),i=matchIndexes.length;// Match elements found at the specified indexes
while(i--){if(seed[j=matchIndexes[i]]){seed[j]=!(matches[j]=seed[j]);}}});});}/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */function testContext(context){return context&&typeof context.getElementsByTagName!=="undefined"&&context;}// Expose support vars for convenience
support=Sizzle.support={};/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */isXML=Sizzle.isXML=function(elem){// documentElement is verified for cases where it doesn't yet exist
// (such as loading iframes in IE - #4833)
var documentElement=elem&&(elem.ownerDocument||elem).documentElement;return documentElement?documentElement.nodeName!=="HTML":false;};/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */setDocument=Sizzle.setDocument=function(node){var hasCompare,subWindow,doc=node?node.ownerDocument||node:preferredDoc;// Return early if doc is invalid or already selected
if(doc===document||doc.nodeType!==9||!doc.documentElement){return document;}// Update global variables
document=doc;docElem=document.documentElement;documentIsHTML=!isXML(document);// Support: IE 9-11, Edge
// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
if(preferredDoc!==document&&(subWindow=document.defaultView)&&subWindow.top!==subWindow){// Support: IE 11, Edge
if(subWindow.addEventListener){subWindow.addEventListener("unload",unloadHandler,false);// Support: IE 9 - 10 only
}else if(subWindow.attachEvent){subWindow.attachEvent("onunload",unloadHandler);}}/* Attributes
	---------------------------------------------------------------------- */// Support: IE<8
// Verify that getAttribute really returns attributes and not properties
// (excepting IE8 booleans)
support.attributes=assert(function(el){el.className="i";return!el.getAttribute("className");});/* getElement(s)By*
	---------------------------------------------------------------------- */// Check if getElementsByTagName("*") returns only elements
support.getElementsByTagName=assert(function(el){el.appendChild(document.createComment(""));return!el.getElementsByTagName("*").length;});// Support: IE<9
support.getElementsByClassName=rnative.test(document.getElementsByClassName);// Support: IE<10
// Check if getElementById returns elements by name
// The broken getElementById methods don't pick up programmatically-set names,
// so use a roundabout getElementsByName test
support.getById=assert(function(el){docElem.appendChild(el).id=expando;return!document.getElementsByName||!document.getElementsByName(expando).length;});// ID filter and find
if(support.getById){Expr.filter["ID"]=function(id){var attrId=id.replace(runescape,funescape);return function(elem){return elem.getAttribute("id")===attrId;};};Expr.find["ID"]=function(id,context){if(typeof context.getElementById!=="undefined"&&documentIsHTML){var elem=context.getElementById(id);return elem?[elem]:[];}};}else{Expr.filter["ID"]=function(id){var attrId=id.replace(runescape,funescape);return function(elem){var node=typeof elem.getAttributeNode!=="undefined"&&elem.getAttributeNode("id");return node&&node.value===attrId;};};// Support: IE 6 - 7 only
// getElementById is not reliable as a find shortcut
Expr.find["ID"]=function(id,context){if(typeof context.getElementById!=="undefined"&&documentIsHTML){var node,i,elems,elem=context.getElementById(id);if(elem){// Verify the id attribute
node=elem.getAttributeNode("id");if(node&&node.value===id){return[elem];}// Fall back on getElementsByName
elems=context.getElementsByName(id);i=0;while(elem=elems[i++]){node=elem.getAttributeNode("id");if(node&&node.value===id){return[elem];}}}return[];}};}// Tag
Expr.find["TAG"]=support.getElementsByTagName?function(tag,context){if(typeof context.getElementsByTagName!=="undefined"){return context.getElementsByTagName(tag);// DocumentFragment nodes don't have gEBTN
}else if(support.qsa){return context.querySelectorAll(tag);}}:function(tag,context){var elem,tmp=[],i=0,// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
results=context.getElementsByTagName(tag);// Filter out possible comments
if(tag==="*"){while(elem=results[i++]){if(elem.nodeType===1){tmp.push(elem);}}return tmp;}return results;};// Class
Expr.find["CLASS"]=support.getElementsByClassName&&function(className,context){if(typeof context.getElementsByClassName!=="undefined"&&documentIsHTML){return context.getElementsByClassName(className);}};/* QSA/matchesSelector
	---------------------------------------------------------------------- */// QSA and matchesSelector support
// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
rbuggyMatches=[];// qSa(:focus) reports false when true (Chrome 21)
// We allow this because of a bug in IE8/9 that throws an error
// whenever `document.activeElement` is accessed on an iframe
// So, we allow :focus to pass through QSA all the time to avoid the IE error
// See https://bugs.jquery.com/ticket/13378
rbuggyQSA=[];if(support.qsa=rnative.test(document.querySelectorAll)){// Build QSA regex
// Regex strategy adopted from Diego Perini
assert(function(el){// Select is set to empty string on purpose
// This is to test IE's treatment of not explicitly
// setting a boolean content attribute,
// since its presence should be enough
// https://bugs.jquery.com/ticket/12359
docElem.appendChild(el).innerHTML="<a id='"+expando+"'></a>"+"<select id='"+expando+"-\r\\' msallowcapture=''>"+"<option selected=''></option></select>";// Support: IE8, Opera 11-12.16
// Nothing should be selected when empty strings follow ^= or $= or *=
// The test attribute must be unknown in Opera but "safe" for WinRT
// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
if(el.querySelectorAll("[msallowcapture^='']").length){rbuggyQSA.push("[*^$]="+whitespace+"*(?:''|\"\")");}// Support: IE8
// Boolean attributes and "value" are not treated correctly
if(!el.querySelectorAll("[selected]").length){rbuggyQSA.push("\\["+whitespace+"*(?:value|"+booleans+")");}// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
if(!el.querySelectorAll("[id~="+expando+"-]").length){rbuggyQSA.push("~=");}// Webkit/Opera - :checked should return selected option elements
// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
// IE8 throws error here and will not see later tests
if(!el.querySelectorAll(":checked").length){rbuggyQSA.push(":checked");}// Support: Safari 8+, iOS 8+
// https://bugs.webkit.org/show_bug.cgi?id=136851
// In-page `selector#id sibling-combinator selector` fails
if(!el.querySelectorAll("a#"+expando+"+*").length){rbuggyQSA.push(".#.+[+~]");}});assert(function(el){el.innerHTML="<a href='' disabled='disabled'></a>"+"<select disabled='disabled'><option/></select>";// Support: Windows 8 Native Apps
// The type and name attributes are restricted during .innerHTML assignment
var input=document.createElement("input");input.setAttribute("type","hidden");el.appendChild(input).setAttribute("name","D");// Support: IE8
// Enforce case-sensitivity of name attribute
if(el.querySelectorAll("[name=d]").length){rbuggyQSA.push("name"+whitespace+"*[*^$|!~]?=");}// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
// IE8 throws error here and will not see later tests
if(el.querySelectorAll(":enabled").length!==2){rbuggyQSA.push(":enabled",":disabled");}// Support: IE9-11+
// IE's :disabled selector does not pick up the children of disabled fieldsets
docElem.appendChild(el).disabled=true;if(el.querySelectorAll(":disabled").length!==2){rbuggyQSA.push(":enabled",":disabled");}// Opera 10-11 does not throw on post-comma invalid pseudos
el.querySelectorAll("*,:x");rbuggyQSA.push(",.*:");});}if(support.matchesSelector=rnative.test(matches=docElem.matches||docElem.webkitMatchesSelector||docElem.mozMatchesSelector||docElem.oMatchesSelector||docElem.msMatchesSelector)){assert(function(el){// Check to see if it's possible to do matchesSelector
// on a disconnected node (IE 9)
support.disconnectedMatch=matches.call(el,"*");// This should fail with an exception
// Gecko does not error, returns false instead
matches.call(el,"[s!='']:x");rbuggyMatches.push("!=",pseudos);});}rbuggyQSA=rbuggyQSA.length&&new RegExp(rbuggyQSA.join("|"));rbuggyMatches=rbuggyMatches.length&&new RegExp(rbuggyMatches.join("|"));/* Contains
	---------------------------------------------------------------------- */hasCompare=rnative.test(docElem.compareDocumentPosition);// Element contains another
// Purposefully self-exclusive
// As in, an element does not contain itself
contains=hasCompare||rnative.test(docElem.contains)?function(a,b){var adown=a.nodeType===9?a.documentElement:a,bup=b&&b.parentNode;return a===bup||!!(bup&&bup.nodeType===1&&(adown.contains?adown.contains(bup):a.compareDocumentPosition&&a.compareDocumentPosition(bup)&16));}:function(a,b){if(b){while(b=b.parentNode){if(b===a){return true;}}}return false;};/* Sorting
	---------------------------------------------------------------------- */// Document order sorting
sortOrder=hasCompare?function(a,b){// Flag for duplicate removal
if(a===b){hasDuplicate=true;return 0;}// Sort on method existence if only one input has compareDocumentPosition
var compare=!a.compareDocumentPosition-!b.compareDocumentPosition;if(compare){return compare;}// Calculate position if both inputs belong to the same document
compare=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):// Otherwise we know they are disconnected
1;// Disconnected nodes
if(compare&1||!support.sortDetached&&b.compareDocumentPosition(a)===compare){// Choose the first element that is related to our preferred document
if(a===document||a.ownerDocument===preferredDoc&&contains(preferredDoc,a)){return-1;}if(b===document||b.ownerDocument===preferredDoc&&contains(preferredDoc,b)){return 1;}// Maintain original order
return sortInput?indexOf(sortInput,a)-indexOf(sortInput,b):0;}return compare&4?-1:1;}:function(a,b){// Exit early if the nodes are identical
if(a===b){hasDuplicate=true;return 0;}var cur,i=0,aup=a.parentNode,bup=b.parentNode,ap=[a],bp=[b];// Parentless nodes are either documents or disconnected
if(!aup||!bup){return a===document?-1:b===document?1:aup?-1:bup?1:sortInput?indexOf(sortInput,a)-indexOf(sortInput,b):0;// If the nodes are siblings, we can do a quick check
}else if(aup===bup){return siblingCheck(a,b);}// Otherwise we need full lists of their ancestors for comparison
cur=a;while(cur=cur.parentNode){ap.unshift(cur);}cur=b;while(cur=cur.parentNode){bp.unshift(cur);}// Walk down the tree looking for a discrepancy
while(ap[i]===bp[i]){i++;}return i?// Do a sibling check if the nodes have a common ancestor
siblingCheck(ap[i],bp[i]):// Otherwise nodes in our document sort first
ap[i]===preferredDoc?-1:bp[i]===preferredDoc?1:0;};return document;};Sizzle.matches=function(expr,elements){return Sizzle(expr,null,null,elements);};Sizzle.matchesSelector=function(elem,expr){// Set document vars if needed
if((elem.ownerDocument||elem)!==document){setDocument(elem);}// Make sure that attribute selectors are quoted
expr=expr.replace(rattributeQuotes,"='$1']");if(support.matchesSelector&&documentIsHTML&&!compilerCache[expr+" "]&&(!rbuggyMatches||!rbuggyMatches.test(expr))&&(!rbuggyQSA||!rbuggyQSA.test(expr))){try{var ret=matches.call(elem,expr);// IE 9's matchesSelector returns false on disconnected nodes
if(ret||support.disconnectedMatch||// As well, disconnected nodes are said to be in a document
// fragment in IE 9
elem.document&&elem.document.nodeType!==11){return ret;}}catch(e){}}return Sizzle(expr,document,null,[elem]).length>0;};Sizzle.contains=function(context,elem){// Set document vars if needed
if((context.ownerDocument||context)!==document){setDocument(context);}return contains(context,elem);};Sizzle.attr=function(elem,name){// Set document vars if needed
if((elem.ownerDocument||elem)!==document){setDocument(elem);}var fn=Expr.attrHandle[name.toLowerCase()],// Don't get fooled by Object.prototype properties (jQuery #13807)
val=fn&&hasOwn.call(Expr.attrHandle,name.toLowerCase())?fn(elem,name,!documentIsHTML):undefined;return val!==undefined?val:support.attributes||!documentIsHTML?elem.getAttribute(name):(val=elem.getAttributeNode(name))&&val.specified?val.value:null;};Sizzle.escape=function(sel){return(sel+"").replace(rcssescape,fcssescape);};Sizzle.error=function(msg){throw new Error("Syntax error, unrecognized expression: "+msg);};/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */Sizzle.uniqueSort=function(results){var elem,duplicates=[],j=0,i=0;// Unless we *know* we can detect duplicates, assume their presence
hasDuplicate=!support.detectDuplicates;sortInput=!support.sortStable&&results.slice(0);results.sort(sortOrder);if(hasDuplicate){while(elem=results[i++]){if(elem===results[i]){j=duplicates.push(i);}}while(j--){results.splice(duplicates[j],1);}}// Clear input after sorting to release objects
// See https://github.com/jquery/sizzle/pull/225
sortInput=null;return results;};/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */getText=Sizzle.getText=function(elem){var node,ret="",i=0,nodeType=elem.nodeType;if(!nodeType){// If no nodeType, this is expected to be an array
while(node=elem[i++]){// Do not traverse comment nodes
ret+=getText(node);}}else if(nodeType===1||nodeType===9||nodeType===11){// Use textContent for elements
// innerText usage removed for consistency of new lines (jQuery #11153)
if(typeof elem.textContent==="string"){return elem.textContent;}else{// Traverse its children
for(elem=elem.firstChild;elem;elem=elem.nextSibling){ret+=getText(elem);}}}else if(nodeType===3||nodeType===4){return elem.nodeValue;}// Do not include comment or processing instruction nodes
return ret;};Expr=Sizzle.selectors={// Can be adjusted by the user
cacheLength:50,createPseudo:markFunction,match:matchExpr,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:true}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:true},"~":{dir:"previousSibling"}},preFilter:{"ATTR":function(match){match[1]=match[1].replace(runescape,funescape);// Move the given value to match[3] whether quoted or unquoted
match[3]=(match[3]||match[4]||match[5]||"").replace(runescape,funescape);if(match[2]==="~="){match[3]=" "+match[3]+" ";}return match.slice(0,4);},"CHILD":function(match){/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/match[1]=match[1].toLowerCase();if(match[1].slice(0,3)==="nth"){// nth-* requires argument
if(!match[3]){Sizzle.error(match[0]);}// numeric x and y parameters for Expr.filter.CHILD
// remember that false/true cast respectively to 0/1
match[4]=+(match[4]?match[5]+(match[6]||1):2*(match[3]==="even"||match[3]==="odd"));match[5]=+(match[7]+match[8]||match[3]==="odd");// other types prohibit arguments
}else if(match[3]){Sizzle.error(match[0]);}return match;},"PSEUDO":function(match){var excess,unquoted=!match[6]&&match[2];if(matchExpr["CHILD"].test(match[0])){return null;}// Accept quoted arguments as-is
if(match[3]){match[2]=match[4]||match[5]||"";// Strip excess characters from unquoted arguments
}else if(unquoted&&rpseudo.test(unquoted)&&(// Get excess from tokenize (recursively)
excess=tokenize(unquoted,true))&&(// advance to the next closing parenthesis
excess=unquoted.indexOf(")",unquoted.length-excess)-unquoted.length)){// excess is a negative index
match[0]=match[0].slice(0,excess);match[2]=unquoted.slice(0,excess);}// Return only captures needed by the pseudo filter method (type and argument)
return match.slice(0,3);}},filter:{"TAG":function(nodeNameSelector){var nodeName=nodeNameSelector.replace(runescape,funescape).toLowerCase();return nodeNameSelector==="*"?function(){return true;}:function(elem){return elem.nodeName&&elem.nodeName.toLowerCase()===nodeName;};},"CLASS":function(className){var pattern=classCache[className+" "];return pattern||(pattern=new RegExp("(^|"+whitespace+")"+className+"("+whitespace+"|$)"))&&classCache(className,function(elem){return pattern.test(typeof elem.className==="string"&&elem.className||typeof elem.getAttribute!=="undefined"&&elem.getAttribute("class")||"");});},"ATTR":function(name,operator,check){return function(elem){var result=Sizzle.attr(elem,name);if(result==null){return operator==="!=";}if(!operator){return true;}result+="";return operator==="="?result===check:operator==="!="?result!==check:operator==="^="?check&&result.indexOf(check)===0:operator==="*="?check&&result.indexOf(check)>-1:operator==="$="?check&&result.slice(-check.length)===check:operator==="~="?(" "+result.replace(rwhitespace," ")+" ").indexOf(check)>-1:operator==="|="?result===check||result.slice(0,check.length+1)===check+"-":false;};},"CHILD":function(type,what,argument,first,last){var simple=type.slice(0,3)!=="nth",forward=type.slice(-4)!=="last",ofType=what==="of-type";return first===1&&last===0?// Shortcut for :nth-*(n)
function(elem){return!!elem.parentNode;}:function(elem,context,xml){var cache,uniqueCache,outerCache,node,nodeIndex,start,dir=simple!==forward?"nextSibling":"previousSibling",parent=elem.parentNode,name=ofType&&elem.nodeName.toLowerCase(),useCache=!xml&&!ofType,diff=false;if(parent){// :(first|last|only)-(child|of-type)
if(simple){while(dir){node=elem;while(node=node[dir]){if(ofType?node.nodeName.toLowerCase()===name:node.nodeType===1){return false;}}// Reverse direction for :only-* (if we haven't yet done so)
start=dir=type==="only"&&!start&&"nextSibling";}return true;}start=[forward?parent.firstChild:parent.lastChild];// non-xml :nth-child(...) stores cache data on `parent`
if(forward&&useCache){// Seek `elem` from a previously-cached index
// ...in a gzip-friendly way
node=parent;outerCache=node[expando]||(node[expando]={});// Support: IE <9 only
// Defend against cloned attroperties (jQuery gh-1709)
uniqueCache=outerCache[node.uniqueID]||(outerCache[node.uniqueID]={});cache=uniqueCache[type]||[];nodeIndex=cache[0]===dirruns&&cache[1];diff=nodeIndex&&cache[2];node=nodeIndex&&parent.childNodes[nodeIndex];while(node=++nodeIndex&&node&&node[dir]||(// Fallback to seeking `elem` from the start
diff=nodeIndex=0)||start.pop()){// When found, cache indexes on `parent` and break
if(node.nodeType===1&&++diff&&node===elem){uniqueCache[type]=[dirruns,nodeIndex,diff];break;}}}else{// Use previously-cached element index if available
if(useCache){// ...in a gzip-friendly way
node=elem;outerCache=node[expando]||(node[expando]={});// Support: IE <9 only
// Defend against cloned attroperties (jQuery gh-1709)
uniqueCache=outerCache[node.uniqueID]||(outerCache[node.uniqueID]={});cache=uniqueCache[type]||[];nodeIndex=cache[0]===dirruns&&cache[1];diff=nodeIndex;}// xml :nth-child(...)
// or :nth-last-child(...) or :nth(-last)?-of-type(...)
if(diff===false){// Use the same loop as above to seek `elem` from the start
while(node=++nodeIndex&&node&&node[dir]||(diff=nodeIndex=0)||start.pop()){if((ofType?node.nodeName.toLowerCase()===name:node.nodeType===1)&&++diff){// Cache the index of each encountered element
if(useCache){outerCache=node[expando]||(node[expando]={});// Support: IE <9 only
// Defend against cloned attroperties (jQuery gh-1709)
uniqueCache=outerCache[node.uniqueID]||(outerCache[node.uniqueID]={});uniqueCache[type]=[dirruns,diff];}if(node===elem){break;}}}}}// Incorporate the offset, then check against cycle size
diff-=last;return diff===first||diff%first===0&&diff/first>=0;}};},"PSEUDO":function(pseudo,argument){// pseudo-class names are case-insensitive
// http://www.w3.org/TR/selectors/#pseudo-classes
// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
// Remember that setFilters inherits from pseudos
var args,fn=Expr.pseudos[pseudo]||Expr.setFilters[pseudo.toLowerCase()]||Sizzle.error("unsupported pseudo: "+pseudo);// The user may use createPseudo to indicate that
// arguments are needed to create the filter function
// just as Sizzle does
if(fn[expando]){return fn(argument);}// But maintain support for old signatures
if(fn.length>1){args=[pseudo,pseudo,"",argument];return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase())?markFunction(function(seed,matches){var idx,matched=fn(seed,argument),i=matched.length;while(i--){idx=indexOf(seed,matched[i]);seed[idx]=!(matches[idx]=matched[i]);}}):function(elem){return fn(elem,0,args);};}return fn;}},pseudos:{// Potentially complex pseudos
"not":markFunction(function(selector){// Trim the selector passed to compile
// to avoid treating leading and trailing
// spaces as combinators
var input=[],results=[],matcher=compile(selector.replace(rtrim,"$1"));return matcher[expando]?markFunction(function(seed,matches,context,xml){var elem,unmatched=matcher(seed,null,xml,[]),i=seed.length;// Match elements unmatched by `matcher`
while(i--){if(elem=unmatched[i]){seed[i]=!(matches[i]=elem);}}}):function(elem,context,xml){input[0]=elem;matcher(input,null,xml,results);// Don't keep the element (issue #299)
input[0]=null;return!results.pop();};}),"has":markFunction(function(selector){return function(elem){return Sizzle(selector,elem).length>0;};}),"contains":markFunction(function(text){text=text.replace(runescape,funescape);return function(elem){return(elem.textContent||elem.innerText||getText(elem)).indexOf(text)>-1;};}),// "Whether an element is represented by a :lang() selector
// is based solely on the element's language value
// being equal to the identifier C,
// or beginning with the identifier C immediately followed by "-".
// The matching of C against the element's language value is performed case-insensitively.
// The identifier C does not have to be a valid language name."
// http://www.w3.org/TR/selectors/#lang-pseudo
"lang":markFunction(function(lang){// lang value must be a valid identifier
if(!ridentifier.test(lang||"")){Sizzle.error("unsupported lang: "+lang);}lang=lang.replace(runescape,funescape).toLowerCase();return function(elem){var elemLang;do{if(elemLang=documentIsHTML?elem.lang:elem.getAttribute("xml:lang")||elem.getAttribute("lang")){elemLang=elemLang.toLowerCase();return elemLang===lang||elemLang.indexOf(lang+"-")===0;}}while((elem=elem.parentNode)&&elem.nodeType===1);return false;};}),// Miscellaneous
"target":function(elem){var hash=window.location&&window.location.hash;return hash&&hash.slice(1)===elem.id;},"root":function(elem){return elem===docElem;},"focus":function(elem){return elem===document.activeElement&&(!document.hasFocus||document.hasFocus())&&!!(elem.type||elem.href||~elem.tabIndex);},// Boolean properties
"enabled":createDisabledPseudo(false),"disabled":createDisabledPseudo(true),"checked":function(elem){// In CSS3, :checked should return both checked and selected elements
// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
var nodeName=elem.nodeName.toLowerCase();return nodeName==="input"&&!!elem.checked||nodeName==="option"&&!!elem.selected;},"selected":function(elem){// Accessing this property makes selected-by-default
// options in Safari work properly
if(elem.parentNode){elem.parentNode.selectedIndex;}return elem.selected===true;},// Contents
"empty":function(elem){// http://www.w3.org/TR/selectors/#empty-pseudo
// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
//   but not by others (comment: 8; processing instruction: 7; etc.)
// nodeType < 6 works because attributes (2) do not appear as children
for(elem=elem.firstChild;elem;elem=elem.nextSibling){if(elem.nodeType<6){return false;}}return true;},"parent":function(elem){return!Expr.pseudos["empty"](elem);},// Element/input types
"header":function(elem){return rheader.test(elem.nodeName);},"input":function(elem){return rinputs.test(elem.nodeName);},"button":function(elem){var name=elem.nodeName.toLowerCase();return name==="input"&&elem.type==="button"||name==="button";},"text":function(elem){var attr;return elem.nodeName.toLowerCase()==="input"&&elem.type==="text"&&(// Support: IE<8
// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
(attr=elem.getAttribute("type"))==null||attr.toLowerCase()==="text");},// Position-in-collection
"first":createPositionalPseudo(function(){return[0];}),"last":createPositionalPseudo(function(matchIndexes,length){return[length-1];}),"eq":createPositionalPseudo(function(matchIndexes,length,argument){return[argument<0?argument+length:argument];}),"even":createPositionalPseudo(function(matchIndexes,length){var i=0;for(;i<length;i+=2){matchIndexes.push(i);}return matchIndexes;}),"odd":createPositionalPseudo(function(matchIndexes,length){var i=1;for(;i<length;i+=2){matchIndexes.push(i);}return matchIndexes;}),"lt":createPositionalPseudo(function(matchIndexes,length,argument){var i=argument<0?argument+length:argument;for(;--i>=0;){matchIndexes.push(i);}return matchIndexes;}),"gt":createPositionalPseudo(function(matchIndexes,length,argument){var i=argument<0?argument+length:argument;for(;++i<length;){matchIndexes.push(i);}return matchIndexes;})}};Expr.pseudos["nth"]=Expr.pseudos["eq"];// Add button/input type pseudos
for(i in{radio:true,checkbox:true,file:true,password:true,image:true}){Expr.pseudos[i]=createInputPseudo(i);}for(i in{submit:true,reset:true}){Expr.pseudos[i]=createButtonPseudo(i);}// Easy API for creating new setFilters
function setFilters(){}setFilters.prototype=Expr.filters=Expr.pseudos;Expr.setFilters=new setFilters();tokenize=Sizzle.tokenize=function(selector,parseOnly){var matched,match,tokens,type,soFar,groups,preFilters,cached=tokenCache[selector+" "];if(cached){return parseOnly?0:cached.slice(0);}soFar=selector;groups=[];preFilters=Expr.preFilter;while(soFar){// Comma and first run
if(!matched||(match=rcomma.exec(soFar))){if(match){// Don't consume trailing commas as valid
soFar=soFar.slice(match[0].length)||soFar;}groups.push(tokens=[]);}matched=false;// Combinators
if(match=rcombinators.exec(soFar)){matched=match.shift();tokens.push({value:matched,// Cast descendant combinators to space
type:match[0].replace(rtrim," ")});soFar=soFar.slice(matched.length);}// Filters
for(type in Expr.filter){if((match=matchExpr[type].exec(soFar))&&(!preFilters[type]||(match=preFilters[type](match)))){matched=match.shift();tokens.push({value:matched,type:type,matches:match});soFar=soFar.slice(matched.length);}}if(!matched){break;}}// Return the length of the invalid excess
// if we're just parsing
// Otherwise, throw an error or return tokens
return parseOnly?soFar.length:soFar?Sizzle.error(selector):// Cache the tokens
tokenCache(selector,groups).slice(0);};function toSelector(tokens){var i=0,len=tokens.length,selector="";for(;i<len;i++){selector+=tokens[i].value;}return selector;}function addCombinator(matcher,combinator,base){var dir=combinator.dir,skip=combinator.next,key=skip||dir,checkNonElements=base&&key==="parentNode",doneName=done++;return combinator.first?// Check against closest ancestor/preceding element
function(elem,context,xml){while(elem=elem[dir]){if(elem.nodeType===1||checkNonElements){return matcher(elem,context,xml);}}return false;}:// Check against all ancestor/preceding elements
function(elem,context,xml){var oldCache,uniqueCache,outerCache,newCache=[dirruns,doneName];// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
if(xml){while(elem=elem[dir]){if(elem.nodeType===1||checkNonElements){if(matcher(elem,context,xml)){return true;}}}}else{while(elem=elem[dir]){if(elem.nodeType===1||checkNonElements){outerCache=elem[expando]||(elem[expando]={});// Support: IE <9 only
// Defend against cloned attroperties (jQuery gh-1709)
uniqueCache=outerCache[elem.uniqueID]||(outerCache[elem.uniqueID]={});if(skip&&skip===elem.nodeName.toLowerCase()){elem=elem[dir]||elem;}else if((oldCache=uniqueCache[key])&&oldCache[0]===dirruns&&oldCache[1]===doneName){// Assign to newCache so results back-propagate to previous elements
return newCache[2]=oldCache[2];}else{// Reuse newcache so results back-propagate to previous elements
uniqueCache[key]=newCache;// A match means we're done; a fail means we have to keep checking
if(newCache[2]=matcher(elem,context,xml)){return true;}}}}}return false;};}function elementMatcher(matchers){return matchers.length>1?function(elem,context,xml){var i=matchers.length;while(i--){if(!matchers[i](elem,context,xml)){return false;}}return true;}:matchers[0];}function multipleContexts(selector,contexts,results){var i=0,len=contexts.length;for(;i<len;i++){Sizzle(selector,contexts[i],results);}return results;}function condense(unmatched,map,filter,context,xml){var elem,newUnmatched=[],i=0,len=unmatched.length,mapped=map!=null;for(;i<len;i++){if(elem=unmatched[i]){if(!filter||filter(elem,context,xml)){newUnmatched.push(elem);if(mapped){map.push(i);}}}}return newUnmatched;}function setMatcher(preFilter,selector,matcher,postFilter,postFinder,postSelector){if(postFilter&&!postFilter[expando]){postFilter=setMatcher(postFilter);}if(postFinder&&!postFinder[expando]){postFinder=setMatcher(postFinder,postSelector);}return markFunction(function(seed,results,context,xml){var temp,i,elem,preMap=[],postMap=[],preexisting=results.length,// Get initial elements from seed or context
elems=seed||multipleContexts(selector||"*",context.nodeType?[context]:context,[]),// Prefilter to get matcher input, preserving a map for seed-results synchronization
matcherIn=preFilter&&(seed||!selector)?condense(elems,preMap,preFilter,context,xml):elems,matcherOut=matcher?// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
postFinder||(seed?preFilter:preexisting||postFilter)?// ...intermediate processing is necessary
[]:// ...otherwise use results directly
results:matcherIn;// Find primary matches
if(matcher){matcher(matcherIn,matcherOut,context,xml);}// Apply postFilter
if(postFilter){temp=condense(matcherOut,postMap);postFilter(temp,[],context,xml);// Un-match failing elements by moving them back to matcherIn
i=temp.length;while(i--){if(elem=temp[i]){matcherOut[postMap[i]]=!(matcherIn[postMap[i]]=elem);}}}if(seed){if(postFinder||preFilter){if(postFinder){// Get the final matcherOut by condensing this intermediate into postFinder contexts
temp=[];i=matcherOut.length;while(i--){if(elem=matcherOut[i]){// Restore matcherIn since elem is not yet a final match
temp.push(matcherIn[i]=elem);}}postFinder(null,matcherOut=[],temp,xml);}// Move matched elements from seed to results to keep them synchronized
i=matcherOut.length;while(i--){if((elem=matcherOut[i])&&(temp=postFinder?indexOf(seed,elem):preMap[i])>-1){seed[temp]=!(results[temp]=elem);}}}// Add elements to results, through postFinder if defined
}else{matcherOut=condense(matcherOut===results?matcherOut.splice(preexisting,matcherOut.length):matcherOut);if(postFinder){postFinder(null,results,matcherOut,xml);}else{push.apply(results,matcherOut);}}});}function matcherFromTokens(tokens){var checkContext,matcher,j,len=tokens.length,leadingRelative=Expr.relative[tokens[0].type],implicitRelative=leadingRelative||Expr.relative[" "],i=leadingRelative?1:0,// The foundational matcher ensures that elements are reachable from top-level context(s)
matchContext=addCombinator(function(elem){return elem===checkContext;},implicitRelative,true),matchAnyContext=addCombinator(function(elem){return indexOf(checkContext,elem)>-1;},implicitRelative,true),matchers=[function(elem,context,xml){var ret=!leadingRelative&&(xml||context!==outermostContext)||((checkContext=context).nodeType?matchContext(elem,context,xml):matchAnyContext(elem,context,xml));// Avoid hanging onto element (issue #299)
checkContext=null;return ret;}];for(;i<len;i++){if(matcher=Expr.relative[tokens[i].type]){matchers=[addCombinator(elementMatcher(matchers),matcher)];}else{matcher=Expr.filter[tokens[i].type].apply(null,tokens[i].matches);// Return special upon seeing a positional matcher
if(matcher[expando]){// Find the next relative operator (if any) for proper handling
j=++i;for(;j<len;j++){if(Expr.relative[tokens[j].type]){break;}}return setMatcher(i>1&&elementMatcher(matchers),i>1&&toSelector(// If the preceding token was a descendant combinator, insert an implicit any-element `*`
tokens.slice(0,i-1).concat({value:tokens[i-2].type===" "?"*":""})).replace(rtrim,"$1"),matcher,i<j&&matcherFromTokens(tokens.slice(i,j)),j<len&&matcherFromTokens(tokens=tokens.slice(j)),j<len&&toSelector(tokens));}matchers.push(matcher);}}return elementMatcher(matchers);}function matcherFromGroupMatchers(elementMatchers,setMatchers){var bySet=setMatchers.length>0,byElement=elementMatchers.length>0,superMatcher=function(seed,context,xml,results,outermost){var elem,j,matcher,matchedCount=0,i="0",unmatched=seed&&[],setMatched=[],contextBackup=outermostContext,// We must always have either seed elements or outermost context
elems=seed||byElement&&Expr.find["TAG"]("*",outermost),// Use integer dirruns iff this is the outermost matcher
dirrunsUnique=dirruns+=contextBackup==null?1:Math.random()||0.1,len=elems.length;if(outermost){outermostContext=context===document||context||outermost;}// Add elements passing elementMatchers directly to results
// Support: IE<9, Safari
// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
for(;i!==len&&(elem=elems[i])!=null;i++){if(byElement&&elem){j=0;if(!context&&elem.ownerDocument!==document){setDocument(elem);xml=!documentIsHTML;}while(matcher=elementMatchers[j++]){if(matcher(elem,context||document,xml)){results.push(elem);break;}}if(outermost){dirruns=dirrunsUnique;}}// Track unmatched elements for set filters
if(bySet){// They will have gone through all possible matchers
if(elem=!matcher&&elem){matchedCount--;}// Lengthen the array for every element, matched or not
if(seed){unmatched.push(elem);}}}// `i` is now the count of elements visited above, and adding it to `matchedCount`
// makes the latter nonnegative.
matchedCount+=i;// Apply set filters to unmatched elements
// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
// no element matchers and no seed.
// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
// case, which will result in a "00" `matchedCount` that differs from `i` but is also
// numerically zero.
if(bySet&&i!==matchedCount){j=0;while(matcher=setMatchers[j++]){matcher(unmatched,setMatched,context,xml);}if(seed){// Reintegrate element matches to eliminate the need for sorting
if(matchedCount>0){while(i--){if(!(unmatched[i]||setMatched[i])){setMatched[i]=pop.call(results);}}}// Discard index placeholder values to get only actual matches
setMatched=condense(setMatched);}// Add matches to results
push.apply(results,setMatched);// Seedless set matches succeeding multiple successful matchers stipulate sorting
if(outermost&&!seed&&setMatched.length>0&&matchedCount+setMatchers.length>1){Sizzle.uniqueSort(results);}}// Override manipulation of globals by nested matchers
if(outermost){dirruns=dirrunsUnique;outermostContext=contextBackup;}return unmatched;};return bySet?markFunction(superMatcher):superMatcher;}compile=Sizzle.compile=function(selector,match/* Internal Use Only */){var i,setMatchers=[],elementMatchers=[],cached=compilerCache[selector+" "];if(!cached){// Generate a function of recursive functions that can be used to check each element
if(!match){match=tokenize(selector);}i=match.length;while(i--){cached=matcherFromTokens(match[i]);if(cached[expando]){setMatchers.push(cached);}else{elementMatchers.push(cached);}}// Cache the compiled function
cached=compilerCache(selector,matcherFromGroupMatchers(elementMatchers,setMatchers));// Save selector and tokenization
cached.selector=selector;}return cached;};/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */select=Sizzle.select=function(selector,context,results,seed){var i,tokens,token,type,find,compiled=typeof selector==="function"&&selector,match=!seed&&tokenize(selector=compiled.selector||selector);results=results||[];// Try to minimize operations if there is only one selector in the list and no seed
// (the latter of which guarantees us context)
if(match.length===1){// Reduce context if the leading compound selector is an ID
tokens=match[0]=match[0].slice(0);if(tokens.length>2&&(token=tokens[0]).type==="ID"&&context.nodeType===9&&documentIsHTML&&Expr.relative[tokens[1].type]){context=(Expr.find["ID"](token.matches[0].replace(runescape,funescape),context)||[])[0];if(!context){return results;// Precompiled matchers will still verify ancestry, so step up a level
}else if(compiled){context=context.parentNode;}selector=selector.slice(tokens.shift().value.length);}// Fetch a seed set for right-to-left matching
i=matchExpr["needsContext"].test(selector)?0:tokens.length;while(i--){token=tokens[i];// Abort if we hit a combinator
if(Expr.relative[type=token.type]){break;}if(find=Expr.find[type]){// Search, expanding context for leading sibling combinators
if(seed=find(token.matches[0].replace(runescape,funescape),rsibling.test(tokens[0].type)&&testContext(context.parentNode)||context)){// If seed is empty or no tokens remain, we can return early
tokens.splice(i,1);selector=seed.length&&toSelector(tokens);if(!selector){push.apply(results,seed);return results;}break;}}}}// Compile and execute a filtering function if one is not provided
// Provide `match` to avoid retokenization if we modified the selector above
(compiled||compile(selector,match))(seed,context,!documentIsHTML,results,!context||rsibling.test(selector)&&testContext(context.parentNode)||context);return results;};// One-time assignments
// Sort stability
support.sortStable=expando.split("").sort(sortOrder).join("")===expando;// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates=!!hasDuplicate;// Initialize against the default document
setDocument();// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached=assert(function(el){// Should return 1, but returns 4 (following)
return el.compareDocumentPosition(document.createElement("fieldset"))&1;});// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if(!assert(function(el){el.innerHTML="<a href='#'></a>";return el.firstChild.getAttribute("href")==="#";})){addHandle("type|href|height|width",function(elem,name,isXML){if(!isXML){return elem.getAttribute(name,name.toLowerCase()==="type"?1:2);}});}// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if(!support.attributes||!assert(function(el){el.innerHTML="<input/>";el.firstChild.setAttribute("value","");return el.firstChild.getAttribute("value")==="";})){addHandle("value",function(elem,name,isXML){if(!isXML&&elem.nodeName.toLowerCase()==="input"){return elem.defaultValue;}});}// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if(!assert(function(el){return el.getAttribute("disabled")==null;})){addHandle(booleans,function(elem,name,isXML){var val;if(!isXML){return elem[name]===true?name.toLowerCase():(val=elem.getAttributeNode(name))&&val.specified?val.value:null;}});}return Sizzle;}(window);jQuery.find=Sizzle;jQuery.expr=Sizzle.selectors;// Deprecated
jQuery.expr[":"]=jQuery.expr.pseudos;jQuery.uniqueSort=jQuery.unique=Sizzle.uniqueSort;jQuery.text=Sizzle.getText;jQuery.isXMLDoc=Sizzle.isXML;jQuery.contains=Sizzle.contains;jQuery.escapeSelector=Sizzle.escape;var dir=function(elem,dir,until){var matched=[],truncate=until!==undefined;while((elem=elem[dir])&&elem.nodeType!==9){if(elem.nodeType===1){if(truncate&&jQuery(elem).is(until)){break;}matched.push(elem);}}return matched;};var siblings=function(n,elem){var matched=[];for(;n;n=n.nextSibling){if(n.nodeType===1&&n!==elem){matched.push(n);}}return matched;};var rneedsContext=jQuery.expr.match.needsContext;var rsingleTag=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;var risSimple=/^.[^:#\[\.,]*$/;// Implement the identical functionality for filter and not
function winnow(elements,qualifier,not){if(jQuery.isFunction(qualifier)){return jQuery.grep(elements,function(elem,i){return!!qualifier.call(elem,i,elem)!==not;});}// Single element
if(qualifier.nodeType){return jQuery.grep(elements,function(elem){return elem===qualifier!==not;});}// Arraylike of elements (jQuery, arguments, Array)
if(typeof qualifier!=="string"){return jQuery.grep(elements,function(elem){return indexOf.call(qualifier,elem)>-1!==not;});}// Simple selector that can be filtered directly, removing non-Elements
if(risSimple.test(qualifier)){return jQuery.filter(qualifier,elements,not);}// Complex selector, compare the two sets, removing non-Elements
qualifier=jQuery.filter(qualifier,elements);return jQuery.grep(elements,function(elem){return indexOf.call(qualifier,elem)>-1!==not&&elem.nodeType===1;});}jQuery.filter=function(expr,elems,not){var elem=elems[0];if(not){expr=":not("+expr+")";}if(elems.length===1&&elem.nodeType===1){return jQuery.find.matchesSelector(elem,expr)?[elem]:[];}return jQuery.find.matches(expr,jQuery.grep(elems,function(elem){return elem.nodeType===1;}));};jQuery.fn.extend({find:function(selector){var i,ret,len=this.length,self=this;if(typeof selector!=="string"){return this.pushStack(jQuery(selector).filter(function(){for(i=0;i<len;i++){if(jQuery.contains(self[i],this)){return true;}}}));}ret=this.pushStack([]);for(i=0;i<len;i++){jQuery.find(selector,self[i],ret);}return len>1?jQuery.uniqueSort(ret):ret;},filter:function(selector){return this.pushStack(winnow(this,selector||[],false));},not:function(selector){return this.pushStack(winnow(this,selector||[],true));},is:function(selector){return!!winnow(this,// If this is a positional/relative selector, check membership in the returned set
// so $("p:first").is("p:last") won't return true for a doc with two "p".
typeof selector==="string"&&rneedsContext.test(selector)?jQuery(selector):selector||[],false).length;}});// Initialize a jQuery object
// A central reference to the root jQuery(document)
var rootjQuery,// A simple way to check for HTML strings
// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
// Strict HTML recognition (#11290: must start with <)
// Shortcut simple #id case for speed
rquickExpr=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,init=jQuery.fn.init=function(selector,context,root){var match,elem;// HANDLE: $(""), $(null), $(undefined), $(false)
if(!selector){return this;}// Method init() accepts an alternate rootjQuery
// so migrate can support jQuery.sub (gh-2101)
root=root||rootjQuery;// Handle HTML strings
if(typeof selector==="string"){if(selector[0]==="<"&&selector[selector.length-1]===">"&&selector.length>=3){// Assume that strings that start and end with <> are HTML and skip the regex check
match=[null,selector,null];}else{match=rquickExpr.exec(selector);}// Match html or make sure no context is specified for #id
if(match&&(match[1]||!context)){// HANDLE: $(html) -> $(array)
if(match[1]){context=context instanceof jQuery?context[0]:context;// Option to run scripts is true for back-compat
// Intentionally let the error be thrown if parseHTML is not present
jQuery.merge(this,jQuery.parseHTML(match[1],context&&context.nodeType?context.ownerDocument||context:document,true));// HANDLE: $(html, props)
if(rsingleTag.test(match[1])&&jQuery.isPlainObject(context)){for(match in context){// Properties of context are called as methods if possible
if(jQuery.isFunction(this[match])){this[match](context[match]);// ...and otherwise set as attributes
}else{this.attr(match,context[match]);}}}return this;// HANDLE: $(#id)
}else{elem=document.getElementById(match[2]);if(elem){// Inject the element directly into the jQuery object
this[0]=elem;this.length=1;}return this;}// HANDLE: $(expr, $(...))
}else if(!context||context.jquery){return(context||root).find(selector);// HANDLE: $(expr, context)
// (which is just equivalent to: $(context).find(expr)
}else{return this.constructor(context).find(selector);}// HANDLE: $(DOMElement)
}else if(selector.nodeType){this[0]=selector;this.length=1;return this;// HANDLE: $(function)
// Shortcut for document ready
}else if(jQuery.isFunction(selector)){return root.ready!==undefined?root.ready(selector):// Execute immediately if ready is not present
selector(jQuery);}return jQuery.makeArray(selector,this);};// Give the init function the jQuery prototype for later instantiation
init.prototype=jQuery.fn;// Initialize central reference
rootjQuery=jQuery(document);var rparentsprev=/^(?:parents|prev(?:Until|All))/,// Methods guaranteed to produce a unique set when starting from a unique set
guaranteedUnique={children:true,contents:true,next:true,prev:true};jQuery.fn.extend({has:function(target){var targets=jQuery(target,this),l=targets.length;return this.filter(function(){var i=0;for(;i<l;i++){if(jQuery.contains(this,targets[i])){return true;}}});},closest:function(selectors,context){var cur,i=0,l=this.length,matched=[],targets=typeof selectors!=="string"&&jQuery(selectors);// Positional selectors never match, since there's no _selection_ context
if(!rneedsContext.test(selectors)){for(;i<l;i++){for(cur=this[i];cur&&cur!==context;cur=cur.parentNode){// Always skip document fragments
if(cur.nodeType<11&&(targets?targets.index(cur)>-1:// Don't pass non-elements to Sizzle
cur.nodeType===1&&jQuery.find.matchesSelector(cur,selectors))){matched.push(cur);break;}}}}return this.pushStack(matched.length>1?jQuery.uniqueSort(matched):matched);},// Determine the position of an element within the set
index:function(elem){// No argument, return index in parent
if(!elem){return this[0]&&this[0].parentNode?this.first().prevAll().length:-1;}// Index in selector
if(typeof elem==="string"){return indexOf.call(jQuery(elem),this[0]);}// Locate the position of the desired element
return indexOf.call(this,// If it receives a jQuery object, the first element is used
elem.jquery?elem[0]:elem);},add:function(selector,context){return this.pushStack(jQuery.uniqueSort(jQuery.merge(this.get(),jQuery(selector,context))));},addBack:function(selector){return this.add(selector==null?this.prevObject:this.prevObject.filter(selector));}});function sibling(cur,dir){while((cur=cur[dir])&&cur.nodeType!==1){}return cur;}jQuery.each({parent:function(elem){var parent=elem.parentNode;return parent&&parent.nodeType!==11?parent:null;},parents:function(elem){return dir(elem,"parentNode");},parentsUntil:function(elem,i,until){return dir(elem,"parentNode",until);},next:function(elem){return sibling(elem,"nextSibling");},prev:function(elem){return sibling(elem,"previousSibling");},nextAll:function(elem){return dir(elem,"nextSibling");},prevAll:function(elem){return dir(elem,"previousSibling");},nextUntil:function(elem,i,until){return dir(elem,"nextSibling",until);},prevUntil:function(elem,i,until){return dir(elem,"previousSibling",until);},siblings:function(elem){return siblings((elem.parentNode||{}).firstChild,elem);},children:function(elem){return siblings(elem.firstChild);},contents:function(elem){return elem.contentDocument||jQuery.merge([],elem.childNodes);}},function(name,fn){jQuery.fn[name]=function(until,selector){var matched=jQuery.map(this,fn,until);if(name.slice(-5)!=="Until"){selector=until;}if(selector&&typeof selector==="string"){matched=jQuery.filter(selector,matched);}if(this.length>1){// Remove duplicates
if(!guaranteedUnique[name]){jQuery.uniqueSort(matched);}// Reverse order for parents* and prev-derivatives
if(rparentsprev.test(name)){matched.reverse();}}return this.pushStack(matched);};});var rnothtmlwhite=/[^\x20\t\r\n\f]+/g;// Convert String-formatted options into Object-formatted ones
function createOptions(options){var object={};jQuery.each(options.match(rnothtmlwhite)||[],function(_,flag){object[flag]=true;});return object;}/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */jQuery.Callbacks=function(options){// Convert options from String-formatted to Object-formatted if needed
// (we check in cache first)
options=typeof options==="string"?createOptions(options):jQuery.extend({},options);var// Flag to know if list is currently firing
firing,// Last fire value for non-forgettable lists
memory,// Flag to know if list was already fired
fired,// Flag to prevent firing
locked,// Actual callback list
list=[],// Queue of execution data for repeatable lists
queue=[],// Index of currently firing callback (modified by add/remove as needed)
firingIndex=-1,// Fire callbacks
fire=function(){// Enforce single-firing
locked=options.once;// Execute callbacks for all pending executions,
// respecting firingIndex overrides and runtime changes
fired=firing=true;for(;queue.length;firingIndex=-1){memory=queue.shift();while(++firingIndex<list.length){// Run callback and check for early termination
if(list[firingIndex].apply(memory[0],memory[1])===false&&options.stopOnFalse){// Jump to end and forget the data so .add doesn't re-fire
firingIndex=list.length;memory=false;}}}// Forget the data if we're done with it
if(!options.memory){memory=false;}firing=false;// Clean up if we're done firing for good
if(locked){// Keep an empty list if we have data for future add calls
if(memory){list=[];// Otherwise, this object is spent
}else{list="";}}},// Actual Callbacks object
self={// Add a callback or a collection of callbacks to the list
add:function(){if(list){// If we have memory from a past run, we should fire after adding
if(memory&&!firing){firingIndex=list.length-1;queue.push(memory);}(function add(args){jQuery.each(args,function(_,arg){if(jQuery.isFunction(arg)){if(!options.unique||!self.has(arg)){list.push(arg);}}else if(arg&&arg.length&&jQuery.type(arg)!=="string"){// Inspect recursively
add(arg);}});})(arguments);if(memory&&!firing){fire();}}return this;},// Remove a callback from the list
remove:function(){jQuery.each(arguments,function(_,arg){var index;while((index=jQuery.inArray(arg,list,index))>-1){list.splice(index,1);// Handle firing indexes
if(index<=firingIndex){firingIndex--;}}});return this;},// Check if a given callback is in the list.
// If no argument is given, return whether or not list has callbacks attached.
has:function(fn){return fn?jQuery.inArray(fn,list)>-1:list.length>0;},// Remove all callbacks from the list
empty:function(){if(list){list=[];}return this;},// Disable .fire and .add
// Abort any current/pending executions
// Clear all callbacks and values
disable:function(){locked=queue=[];list=memory="";return this;},disabled:function(){return!list;},// Disable .fire
// Also disable .add unless we have memory (since it would have no effect)
// Abort any pending executions
lock:function(){locked=queue=[];if(!memory&&!firing){list=memory="";}return this;},locked:function(){return!!locked;},// Call all callbacks with the given context and arguments
fireWith:function(context,args){if(!locked){args=args||[];args=[context,args.slice?args.slice():args];queue.push(args);if(!firing){fire();}}return this;},// Call all the callbacks with the given arguments
fire:function(){self.fireWith(this,arguments);return this;},// To know if the callbacks have already been called at least once
fired:function(){return!!fired;}};return self;};function Identity(v){return v;}function Thrower(ex){throw ex;}function adoptValue(value,resolve,reject){var method;try{// Check for promise aspect first to privilege synchronous behavior
if(value&&jQuery.isFunction(method=value.promise)){method.call(value).done(resolve).fail(reject);// Other thenables
}else if(value&&jQuery.isFunction(method=value.then)){method.call(value,resolve,reject);// Other non-thenables
}else{// Support: Android 4.0 only
// Strict mode functions invoked without .call/.apply get global-object context
resolve.call(undefined,value);}// For Promises/A+, convert exceptions into rejections
// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
// Deferred#then to conditionally suppress rejection.
}catch(value){// Support: Android 4.0 only
// Strict mode functions invoked without .call/.apply get global-object context
reject.call(undefined,value);}}jQuery.extend({Deferred:function(func){var tuples=[// action, add listener, callbacks,
// ... .then handlers, argument index, [final state]
["notify","progress",jQuery.Callbacks("memory"),jQuery.Callbacks("memory"),2],["resolve","done",jQuery.Callbacks("once memory"),jQuery.Callbacks("once memory"),0,"resolved"],["reject","fail",jQuery.Callbacks("once memory"),jQuery.Callbacks("once memory"),1,"rejected"]],state="pending",promise={state:function(){return state;},always:function(){deferred.done(arguments).fail(arguments);return this;},"catch":function(fn){return promise.then(null,fn);},// Keep pipe for back-compat
pipe:function()/* fnDone, fnFail, fnProgress */{var fns=arguments;return jQuery.Deferred(function(newDefer){jQuery.each(tuples,function(i,tuple){// Map tuples (progress, done, fail) to arguments (done, fail, progress)
var fn=jQuery.isFunction(fns[tuple[4]])&&fns[tuple[4]];// deferred.progress(function() { bind to newDefer or newDefer.notify })
// deferred.done(function() { bind to newDefer or newDefer.resolve })
// deferred.fail(function() { bind to newDefer or newDefer.reject })
deferred[tuple[1]](function(){var returned=fn&&fn.apply(this,arguments);if(returned&&jQuery.isFunction(returned.promise)){returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);}else{newDefer[tuple[0]+"With"](this,fn?[returned]:arguments);}});});fns=null;}).promise();},then:function(onFulfilled,onRejected,onProgress){var maxDepth=0;function resolve(depth,deferred,handler,special){return function(){var that=this,args=arguments,mightThrow=function(){var returned,then;// Support: Promises/A+ section 2.3.3.3.3
// https://promisesaplus.com/#point-59
// Ignore double-resolution attempts
if(depth<maxDepth){return;}returned=handler.apply(that,args);// Support: Promises/A+ section 2.3.1
// https://promisesaplus.com/#point-48
if(returned===deferred.promise()){throw new TypeError("Thenable self-resolution");}// Support: Promises/A+ sections 2.3.3.1, 3.5
// https://promisesaplus.com/#point-54
// https://promisesaplus.com/#point-75
// Retrieve `then` only once
then=returned&&(// Support: Promises/A+ section 2.3.4
// https://promisesaplus.com/#point-64
// Only check objects and functions for thenability
typeof returned==="object"||typeof returned==="function")&&returned.then;// Handle a returned thenable
if(jQuery.isFunction(then)){// Special processors (notify) just wait for resolution
if(special){then.call(returned,resolve(maxDepth,deferred,Identity,special),resolve(maxDepth,deferred,Thrower,special));// Normal processors (resolve) also hook into progress
}else{// ...and disregard older resolution values
maxDepth++;then.call(returned,resolve(maxDepth,deferred,Identity,special),resolve(maxDepth,deferred,Thrower,special),resolve(maxDepth,deferred,Identity,deferred.notifyWith));}// Handle all other returned values
}else{// Only substitute handlers pass on context
// and multiple values (non-spec behavior)
if(handler!==Identity){that=undefined;args=[returned];}// Process the value(s)
// Default process is resolve
(special||deferred.resolveWith)(that,args);}},// Only normal processors (resolve) catch and reject exceptions
process=special?mightThrow:function(){try{mightThrow();}catch(e){if(jQuery.Deferred.exceptionHook){jQuery.Deferred.exceptionHook(e,process.stackTrace);}// Support: Promises/A+ section 2.3.3.3.4.1
// https://promisesaplus.com/#point-61
// Ignore post-resolution exceptions
if(depth+1>=maxDepth){// Only substitute handlers pass on context
// and multiple values (non-spec behavior)
if(handler!==Thrower){that=undefined;args=[e];}deferred.rejectWith(that,args);}}};// Support: Promises/A+ section 2.3.3.3.1
// https://promisesaplus.com/#point-57
// Re-resolve promises immediately to dodge false rejection from
// subsequent errors
if(depth){process();}else{// Call an optional hook to record the stack, in case of exception
// since it's otherwise lost when execution goes async
if(jQuery.Deferred.getStackHook){process.stackTrace=jQuery.Deferred.getStackHook();}window.setTimeout(process);}};}return jQuery.Deferred(function(newDefer){// progress_handlers.add( ... )
tuples[0][3].add(resolve(0,newDefer,jQuery.isFunction(onProgress)?onProgress:Identity,newDefer.notifyWith));// fulfilled_handlers.add( ... )
tuples[1][3].add(resolve(0,newDefer,jQuery.isFunction(onFulfilled)?onFulfilled:Identity));// rejected_handlers.add( ... )
tuples[2][3].add(resolve(0,newDefer,jQuery.isFunction(onRejected)?onRejected:Thrower));}).promise();},// Get a promise for this deferred
// If obj is provided, the promise aspect is added to the object
promise:function(obj){return obj!=null?jQuery.extend(obj,promise):promise;}},deferred={};// Add list-specific methods
jQuery.each(tuples,function(i,tuple){var list=tuple[2],stateString=tuple[5];// promise.progress = list.add
// promise.done = list.add
// promise.fail = list.add
promise[tuple[1]]=list.add;// Handle state
if(stateString){list.add(function(){// state = "resolved" (i.e., fulfilled)
// state = "rejected"
state=stateString;},// rejected_callbacks.disable
// fulfilled_callbacks.disable
tuples[3-i][2].disable,// progress_callbacks.lock
tuples[0][2].lock);}// progress_handlers.fire
// fulfilled_handlers.fire
// rejected_handlers.fire
list.add(tuple[3].fire);// deferred.notify = function() { deferred.notifyWith(...) }
// deferred.resolve = function() { deferred.resolveWith(...) }
// deferred.reject = function() { deferred.rejectWith(...) }
deferred[tuple[0]]=function(){deferred[tuple[0]+"With"](this===deferred?undefined:this,arguments);return this;};// deferred.notifyWith = list.fireWith
// deferred.resolveWith = list.fireWith
// deferred.rejectWith = list.fireWith
deferred[tuple[0]+"With"]=list.fireWith;});// Make the deferred a promise
promise.promise(deferred);// Call given func if any
if(func){func.call(deferred,deferred);}// All done!
return deferred;},// Deferred helper
when:function(singleValue){var// count of uncompleted subordinates
remaining=arguments.length,// count of unprocessed arguments
i=remaining,// subordinate fulfillment data
resolveContexts=Array(i),resolveValues=slice.call(arguments),// the master Deferred
master=jQuery.Deferred(),// subordinate callback factory
updateFunc=function(i){return function(value){resolveContexts[i]=this;resolveValues[i]=arguments.length>1?slice.call(arguments):value;if(! --remaining){master.resolveWith(resolveContexts,resolveValues);}};};// Single- and empty arguments are adopted like Promise.resolve
if(remaining<=1){adoptValue(singleValue,master.done(updateFunc(i)).resolve,master.reject);// Use .then() to unwrap secondary thenables (cf. gh-3000)
if(master.state()==="pending"||jQuery.isFunction(resolveValues[i]&&resolveValues[i].then)){return master.then();}}// Multiple arguments are aggregated like Promise.all array elements
while(i--){adoptValue(resolveValues[i],updateFunc(i),master.reject);}return master.promise();}});// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;jQuery.Deferred.exceptionHook=function(error,stack){// Support: IE 8 - 9 only
// Console exists when dev tools are open, which can happen at any time
if(window.console&&window.console.warn&&error&&rerrorNames.test(error.name)){window.console.warn("jQuery.Deferred exception: "+error.message,error.stack,stack);}};jQuery.readyException=function(error){window.setTimeout(function(){throw error;});};// The deferred used on DOM ready
var readyList=jQuery.Deferred();jQuery.fn.ready=function(fn){readyList.then(fn)// Wrap jQuery.readyException in a function so that the lookup
// happens at the time of error handling instead of callback
// registration.
.catch(function(error){jQuery.readyException(error);});return this;};jQuery.extend({// Is the DOM ready to be used? Set to true once it occurs.
isReady:false,// A counter to track how many items to wait for before
// the ready event fires. See #6781
readyWait:1,// Hold (or release) the ready event
holdReady:function(hold){if(hold){jQuery.readyWait++;}else{jQuery.ready(true);}},// Handle when the DOM is ready
ready:function(wait){// Abort if there are pending holds or we're already ready
if(wait===true?--jQuery.readyWait:jQuery.isReady){return;}// Remember that the DOM is ready
jQuery.isReady=true;// If a normal DOM Ready event fired, decrement, and wait if need be
if(wait!==true&&--jQuery.readyWait>0){return;}// If there are functions bound, to execute
readyList.resolveWith(document,[jQuery]);}});jQuery.ready.then=readyList.then;// The ready event handler and self cleanup method
function completed(){document.removeEventListener("DOMContentLoaded",completed);window.removeEventListener("load",completed);jQuery.ready();}// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if(document.readyState==="complete"||document.readyState!=="loading"&&!document.documentElement.doScroll){// Handle it asynchronously to allow scripts the opportunity to delay ready
window.setTimeout(jQuery.ready);}else{// Use the handy event callback
document.addEventListener("DOMContentLoaded",completed);// A fallback to window.onload, that will always work
window.addEventListener("load",completed);}// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access=function(elems,fn,key,value,chainable,emptyGet,raw){var i=0,len=elems.length,bulk=key==null;// Sets many values
if(jQuery.type(key)==="object"){chainable=true;for(i in key){access(elems,fn,i,key[i],true,emptyGet,raw);}// Sets one value
}else if(value!==undefined){chainable=true;if(!jQuery.isFunction(value)){raw=true;}if(bulk){// Bulk operations run against the entire set
if(raw){fn.call(elems,value);fn=null;// ...except when executing function values
}else{bulk=fn;fn=function(elem,key,value){return bulk.call(jQuery(elem),value);};}}if(fn){for(;i<len;i++){fn(elems[i],key,raw?value:value.call(elems[i],i,fn(elems[i],key)));}}}if(chainable){return elems;}// Gets
if(bulk){return fn.call(elems);}return len?fn(elems[0],key):emptyGet;};var acceptData=function(owner){// Accepts only:
//  - Node
//    - Node.ELEMENT_NODE
//    - Node.DOCUMENT_NODE
//  - Object
//    - Any
return owner.nodeType===1||owner.nodeType===9||!+owner.nodeType;};function Data(){this.expando=jQuery.expando+Data.uid++;}Data.uid=1;Data.prototype={cache:function(owner){// Check if the owner object already has a cache
var value=owner[this.expando];// If not, create one
if(!value){value={};// We can accept data for non-element nodes in modern browsers,
// but we should not, see #8335.
// Always return an empty object.
if(acceptData(owner)){// If it is a node unlikely to be stringify-ed or looped over
// use plain assignment
if(owner.nodeType){owner[this.expando]=value;// Otherwise secure it in a non-enumerable property
// configurable must be true to allow the property to be
// deleted when data is removed
}else{Object.defineProperty(owner,this.expando,{value:value,configurable:true});}}}return value;},set:function(owner,data,value){var prop,cache=this.cache(owner);// Handle: [ owner, key, value ] args
// Always use camelCase key (gh-2257)
if(typeof data==="string"){cache[jQuery.camelCase(data)]=value;// Handle: [ owner, { properties } ] args
}else{// Copy the properties one-by-one to the cache object
for(prop in data){cache[jQuery.camelCase(prop)]=data[prop];}}return cache;},get:function(owner,key){return key===undefined?this.cache(owner):// Always use camelCase key (gh-2257)
owner[this.expando]&&owner[this.expando][jQuery.camelCase(key)];},access:function(owner,key,value){// In cases where either:
//
//   1. No key was specified
//   2. A string key was specified, but no value provided
//
// Take the "read" path and allow the get method to determine
// which value to return, respectively either:
//
//   1. The entire cache object
//   2. The data stored at the key
//
if(key===undefined||key&&typeof key==="string"&&value===undefined){return this.get(owner,key);}// When the key is not a string, or both a key and value
// are specified, set or extend (existing objects) with either:
//
//   1. An object of properties
//   2. A key and value
//
this.set(owner,key,value);// Since the "set" path can have two possible entry points
// return the expected data based on which path was taken[*]
return value!==undefined?value:key;},remove:function(owner,key){var i,cache=owner[this.expando];if(cache===undefined){return;}if(key!==undefined){// Support array or space separated string of keys
if(jQuery.isArray(key)){// If key is an array of keys...
// We always set camelCase keys, so remove that.
key=key.map(jQuery.camelCase);}else{key=jQuery.camelCase(key);// If a key with the spaces exists, use it.
// Otherwise, create an array by matching non-whitespace
key=key in cache?[key]:key.match(rnothtmlwhite)||[];}i=key.length;while(i--){delete cache[key[i]];}}// Remove the expando if there's no more data
if(key===undefined||jQuery.isEmptyObject(cache)){// Support: Chrome <=35 - 45
// Webkit & Blink performance suffers when deleting properties
// from DOM nodes, so set to undefined instead
// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
if(owner.nodeType){owner[this.expando]=undefined;}else{delete owner[this.expando];}}},hasData:function(owner){var cache=owner[this.expando];return cache!==undefined&&!jQuery.isEmptyObject(cache);}};var dataPriv=new Data();var dataUser=new Data();//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014
var rbrace=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,rmultiDash=/[A-Z]/g;function getData(data){if(data==="true"){return true;}if(data==="false"){return false;}if(data==="null"){return null;}// Only convert to a number if it doesn't change the string
if(data===+data+""){return+data;}if(rbrace.test(data)){return JSON.parse(data);}return data;}function dataAttr(elem,key,data){var name;// If nothing was found internally, try to fetch any
// data from the HTML5 data-* attribute
if(data===undefined&&elem.nodeType===1){name="data-"+key.replace(rmultiDash,"-$&").toLowerCase();data=elem.getAttribute(name);if(typeof data==="string"){try{data=getData(data);}catch(e){}// Make sure we set the data so it isn't changed later
dataUser.set(elem,key,data);}else{data=undefined;}}return data;}jQuery.extend({hasData:function(elem){return dataUser.hasData(elem)||dataPriv.hasData(elem);},data:function(elem,name,data){return dataUser.access(elem,name,data);},removeData:function(elem,name){dataUser.remove(elem,name);},// TODO: Now that all calls to _data and _removeData have been replaced
// with direct calls to dataPriv methods, these can be deprecated.
_data:function(elem,name,data){return dataPriv.access(elem,name,data);},_removeData:function(elem,name){dataPriv.remove(elem,name);}});jQuery.fn.extend({data:function(key,value){var i,name,data,elem=this[0],attrs=elem&&elem.attributes;// Gets all values
if(key===undefined){if(this.length){data=dataUser.get(elem);if(elem.nodeType===1&&!dataPriv.get(elem,"hasDataAttrs")){i=attrs.length;while(i--){// Support: IE 11 only
// The attrs elements can be null (#14894)
if(attrs[i]){name=attrs[i].name;if(name.indexOf("data-")===0){name=jQuery.camelCase(name.slice(5));dataAttr(elem,name,data[name]);}}}dataPriv.set(elem,"hasDataAttrs",true);}}return data;}// Sets multiple values
if(typeof key==="object"){return this.each(function(){dataUser.set(this,key);});}return access(this,function(value){var data;// The calling jQuery object (element matches) is not empty
// (and therefore has an element appears at this[ 0 ]) and the
// `value` parameter was not undefined. An empty jQuery object
// will result in `undefined` for elem = this[ 0 ] which will
// throw an exception if an attempt to read a data cache is made.
if(elem&&value===undefined){// Attempt to get data from the cache
// The key will always be camelCased in Data
data=dataUser.get(elem,key);if(data!==undefined){return data;}// Attempt to "discover" the data in
// HTML5 custom data-* attrs
data=dataAttr(elem,key);if(data!==undefined){return data;}// We tried really hard, but the data doesn't exist.
return;}// Set the data...
this.each(function(){// We always store the camelCased key
dataUser.set(this,key,value);});},null,value,arguments.length>1,null,true);},removeData:function(key){return this.each(function(){dataUser.remove(this,key);});}});jQuery.extend({queue:function(elem,type,data){var queue;if(elem){type=(type||"fx")+"queue";queue=dataPriv.get(elem,type);// Speed up dequeue by getting out quickly if this is just a lookup
if(data){if(!queue||jQuery.isArray(data)){queue=dataPriv.access(elem,type,jQuery.makeArray(data));}else{queue.push(data);}}return queue||[];}},dequeue:function(elem,type){type=type||"fx";var queue=jQuery.queue(elem,type),startLength=queue.length,fn=queue.shift(),hooks=jQuery._queueHooks(elem,type),next=function(){jQuery.dequeue(elem,type);};// If the fx queue is dequeued, always remove the progress sentinel
if(fn==="inprogress"){fn=queue.shift();startLength--;}if(fn){// Add a progress sentinel to prevent the fx queue from being
// automatically dequeued
if(type==="fx"){queue.unshift("inprogress");}// Clear up the last queue stop function
delete hooks.stop;fn.call(elem,next,hooks);}if(!startLength&&hooks){hooks.empty.fire();}},// Not public - generate a queueHooks object, or return the current one
_queueHooks:function(elem,type){var key=type+"queueHooks";return dataPriv.get(elem,key)||dataPriv.access(elem,key,{empty:jQuery.Callbacks("once memory").add(function(){dataPriv.remove(elem,[type+"queue",key]);})});}});jQuery.fn.extend({queue:function(type,data){var setter=2;if(typeof type!=="string"){data=type;type="fx";setter--;}if(arguments.length<setter){return jQuery.queue(this[0],type);}return data===undefined?this:this.each(function(){var queue=jQuery.queue(this,type,data);// Ensure a hooks for this queue
jQuery._queueHooks(this,type);if(type==="fx"&&queue[0]!=="inprogress"){jQuery.dequeue(this,type);}});},dequeue:function(type){return this.each(function(){jQuery.dequeue(this,type);});},clearQueue:function(type){return this.queue(type||"fx",[]);},// Get a promise resolved when queues of a certain type
// are emptied (fx is the type by default)
promise:function(type,obj){var tmp,count=1,defer=jQuery.Deferred(),elements=this,i=this.length,resolve=function(){if(! --count){defer.resolveWith(elements,[elements]);}};if(typeof type!=="string"){obj=type;type=undefined;}type=type||"fx";while(i--){tmp=dataPriv.get(elements[i],type+"queueHooks");if(tmp&&tmp.empty){count++;tmp.empty.add(resolve);}}resolve();return defer.promise(obj);}});var pnum=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;var rcssNum=new RegExp("^(?:([+-])=|)("+pnum+")([a-z%]*)$","i");var cssExpand=["Top","Right","Bottom","Left"];var isHiddenWithinTree=function(elem,el){// isHiddenWithinTree might be called from jQuery#filter function;
// in that case, element will be second argument
elem=el||elem;// Inline style trumps all
return elem.style.display==="none"||elem.style.display===""&&// Otherwise, check computed style
// Support: Firefox <=43 - 45
// Disconnected elements can have computed display: none, so first confirm that elem is
// in the document.
jQuery.contains(elem.ownerDocument,elem)&&jQuery.css(elem,"display")==="none";};var swap=function(elem,options,callback,args){var ret,name,old={};// Remember the old values, and insert the new ones
for(name in options){old[name]=elem.style[name];elem.style[name]=options[name];}ret=callback.apply(elem,args||[]);// Revert the old values
for(name in options){elem.style[name]=old[name];}return ret;};function adjustCSS(elem,prop,valueParts,tween){var adjusted,scale=1,maxIterations=20,currentValue=tween?function(){return tween.cur();}:function(){return jQuery.css(elem,prop,"");},initial=currentValue(),unit=valueParts&&valueParts[3]||(jQuery.cssNumber[prop]?"":"px"),// Starting value computation is required for potential unit mismatches
initialInUnit=(jQuery.cssNumber[prop]||unit!=="px"&&+initial)&&rcssNum.exec(jQuery.css(elem,prop));if(initialInUnit&&initialInUnit[3]!==unit){// Trust units reported by jQuery.css
unit=unit||initialInUnit[3];// Make sure we update the tween properties later on
valueParts=valueParts||[];// Iteratively approximate from a nonzero starting point
initialInUnit=+initial||1;do{// If previous iteration zeroed out, double until we get *something*.
// Use string for doubling so we don't accidentally see scale as unchanged below
scale=scale||".5";// Adjust and apply
initialInUnit=initialInUnit/scale;jQuery.style(elem,prop,initialInUnit+unit);// Update scale, tolerating zero or NaN from tween.cur()
// Break the loop if scale is unchanged or perfect, or if we've just had enough.
}while(scale!==(scale=currentValue()/initial)&&scale!==1&&--maxIterations);}if(valueParts){initialInUnit=+initialInUnit||+initial||0;// Apply relative offset (+=/-=) if specified
adjusted=valueParts[1]?initialInUnit+(valueParts[1]+1)*valueParts[2]:+valueParts[2];if(tween){tween.unit=unit;tween.start=initialInUnit;tween.end=adjusted;}}return adjusted;}var defaultDisplayMap={};function getDefaultDisplay(elem){var temp,doc=elem.ownerDocument,nodeName=elem.nodeName,display=defaultDisplayMap[nodeName];if(display){return display;}temp=doc.body.appendChild(doc.createElement(nodeName));display=jQuery.css(temp,"display");temp.parentNode.removeChild(temp);if(display==="none"){display="block";}defaultDisplayMap[nodeName]=display;return display;}function showHide(elements,show){var display,elem,values=[],index=0,length=elements.length;// Determine new display value for elements that need to change
for(;index<length;index++){elem=elements[index];if(!elem.style){continue;}display=elem.style.display;if(show){// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
// check is required in this first loop unless we have a nonempty display value (either
// inline or about-to-be-restored)
if(display==="none"){values[index]=dataPriv.get(elem,"display")||null;if(!values[index]){elem.style.display="";}}if(elem.style.display===""&&isHiddenWithinTree(elem)){values[index]=getDefaultDisplay(elem);}}else{if(display!=="none"){values[index]="none";// Remember what we're overwriting
dataPriv.set(elem,"display",display);}}}// Set the display of the elements in a second loop to avoid constant reflow
for(index=0;index<length;index++){if(values[index]!=null){elements[index].style.display=values[index];}}return elements;}jQuery.fn.extend({show:function(){return showHide(this,true);},hide:function(){return showHide(this);},toggle:function(state){if(typeof state==="boolean"){return state?this.show():this.hide();}return this.each(function(){if(isHiddenWithinTree(this)){jQuery(this).show();}else{jQuery(this).hide();}});}});var rcheckableType=/^(?:checkbox|radio)$/i;var rtagName=/<([a-z][^\/\0>\x20\t\r\n\f]+)/i;var rscriptType=/^$|\/(?:java|ecma)script/i;// We have to close these tags to support XHTML (#13200)
var wrapMap={// Support: IE <=9 only
option:[1,"<select multiple='multiple'>","</select>"],// XHTML parsers do not magically insert elements in the
// same way that tag soup parsers do. So we cannot shorten
// this by omitting <tbody> or other required elements.
thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};// Support: IE <=9 only
wrapMap.optgroup=wrapMap.option;wrapMap.tbody=wrapMap.tfoot=wrapMap.colgroup=wrapMap.caption=wrapMap.thead;wrapMap.th=wrapMap.td;function getAll(context,tag){// Support: IE <=9 - 11 only
// Use typeof to avoid zero-argument method invocation on host objects (#15151)
var ret;if(typeof context.getElementsByTagName!=="undefined"){ret=context.getElementsByTagName(tag||"*");}else if(typeof context.querySelectorAll!=="undefined"){ret=context.querySelectorAll(tag||"*");}else{ret=[];}if(tag===undefined||tag&&jQuery.nodeName(context,tag)){return jQuery.merge([context],ret);}return ret;}// Mark scripts as having already been evaluated
function setGlobalEval(elems,refElements){var i=0,l=elems.length;for(;i<l;i++){dataPriv.set(elems[i],"globalEval",!refElements||dataPriv.get(refElements[i],"globalEval"));}}var rhtml=/<|&#?\w+;/;function buildFragment(elems,context,scripts,selection,ignored){var elem,tmp,tag,wrap,contains,j,fragment=context.createDocumentFragment(),nodes=[],i=0,l=elems.length;for(;i<l;i++){elem=elems[i];if(elem||elem===0){// Add nodes directly
if(jQuery.type(elem)==="object"){// Support: Android <=4.0 only, PhantomJS 1 only
// push.apply(_, arraylike) throws on ancient WebKit
jQuery.merge(nodes,elem.nodeType?[elem]:elem);// Convert non-html into a text node
}else if(!rhtml.test(elem)){nodes.push(context.createTextNode(elem));// Convert html into DOM nodes
}else{tmp=tmp||fragment.appendChild(context.createElement("div"));// Deserialize a standard representation
tag=(rtagName.exec(elem)||["",""])[1].toLowerCase();wrap=wrapMap[tag]||wrapMap._default;tmp.innerHTML=wrap[1]+jQuery.htmlPrefilter(elem)+wrap[2];// Descend through wrappers to the right content
j=wrap[0];while(j--){tmp=tmp.lastChild;}// Support: Android <=4.0 only, PhantomJS 1 only
// push.apply(_, arraylike) throws on ancient WebKit
jQuery.merge(nodes,tmp.childNodes);// Remember the top-level container
tmp=fragment.firstChild;// Ensure the created nodes are orphaned (#12392)
tmp.textContent="";}}}// Remove wrapper from fragment
fragment.textContent="";i=0;while(elem=nodes[i++]){// Skip elements already in the context collection (trac-4087)
if(selection&&jQuery.inArray(elem,selection)>-1){if(ignored){ignored.push(elem);}continue;}contains=jQuery.contains(elem.ownerDocument,elem);// Append to fragment
tmp=getAll(fragment.appendChild(elem),"script");// Preserve script evaluation history
if(contains){setGlobalEval(tmp);}// Capture executables
if(scripts){j=0;while(elem=tmp[j++]){if(rscriptType.test(elem.type||"")){scripts.push(elem);}}}}return fragment;}(function(){var fragment=document.createDocumentFragment(),div=fragment.appendChild(document.createElement("div")),input=document.createElement("input");// Support: Android 4.0 - 4.3 only
// Check state lost if the name is set (#11217)
// Support: Windows Web Apps (WWA)
// `name` and `type` must use .setAttribute for WWA (#14901)
input.setAttribute("type","radio");input.setAttribute("checked","checked");input.setAttribute("name","t");div.appendChild(input);// Support: Android <=4.1 only
// Older WebKit doesn't clone checked state correctly in fragments
support.checkClone=div.cloneNode(true).cloneNode(true).lastChild.checked;// Support: IE <=11 only
// Make sure textarea (and checkbox) defaultValue is properly cloned
div.innerHTML="<textarea>x</textarea>";support.noCloneChecked=!!div.cloneNode(true).lastChild.defaultValue;})();var documentElement=document.documentElement;var rkeyEvent=/^key/,rmouseEvent=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,rtypenamespace=/^([^.]*)(?:\.(.+)|)/;function returnTrue(){return true;}function returnFalse(){return false;}// Support: IE <=9 only
// See #13393 for more info
function safeActiveElement(){try{return document.activeElement;}catch(err){}}function on(elem,types,selector,data,fn,one){var origFn,type;// Types can be a map of types/handlers
if(typeof types==="object"){// ( types-Object, selector, data )
if(typeof selector!=="string"){// ( types-Object, data )
data=data||selector;selector=undefined;}for(type in types){on(elem,type,selector,data,types[type],one);}return elem;}if(data==null&&fn==null){// ( types, fn )
fn=selector;data=selector=undefined;}else if(fn==null){if(typeof selector==="string"){// ( types, selector, fn )
fn=data;data=undefined;}else{// ( types, data, fn )
fn=data;data=selector;selector=undefined;}}if(fn===false){fn=returnFalse;}else if(!fn){return elem;}if(one===1){origFn=fn;fn=function(event){// Can use an empty set, since event contains the info
jQuery().off(event);return origFn.apply(this,arguments);};// Use same guid so caller can remove using origFn
fn.guid=origFn.guid||(origFn.guid=jQuery.guid++);}return elem.each(function(){jQuery.event.add(this,types,fn,data,selector);});}/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */jQuery.event={global:{},add:function(elem,types,handler,data,selector){var handleObjIn,eventHandle,tmp,events,t,handleObj,special,handlers,type,namespaces,origType,elemData=dataPriv.get(elem);// Don't attach events to noData or text/comment nodes (but allow plain objects)
if(!elemData){return;}// Caller can pass in an object of custom data in lieu of the handler
if(handler.handler){handleObjIn=handler;handler=handleObjIn.handler;selector=handleObjIn.selector;}// Ensure that invalid selectors throw exceptions at attach time
// Evaluate against documentElement in case elem is a non-element node (e.g., document)
if(selector){jQuery.find.matchesSelector(documentElement,selector);}// Make sure that the handler has a unique ID, used to find/remove it later
if(!handler.guid){handler.guid=jQuery.guid++;}// Init the element's event structure and main handler, if this is the first
if(!(events=elemData.events)){events=elemData.events={};}if(!(eventHandle=elemData.handle)){eventHandle=elemData.handle=function(e){// Discard the second event of a jQuery.event.trigger() and
// when an event is called after a page has unloaded
return typeof jQuery!=="undefined"&&jQuery.event.triggered!==e.type?jQuery.event.dispatch.apply(elem,arguments):undefined;};}// Handle multiple events separated by a space
types=(types||"").match(rnothtmlwhite)||[""];t=types.length;while(t--){tmp=rtypenamespace.exec(types[t])||[];type=origType=tmp[1];namespaces=(tmp[2]||"").split(".").sort();// There *must* be a type, no attaching namespace-only handlers
if(!type){continue;}// If event changes its type, use the special event handlers for the changed type
special=jQuery.event.special[type]||{};// If selector defined, determine special event api type, otherwise given type
type=(selector?special.delegateType:special.bindType)||type;// Update special based on newly reset type
special=jQuery.event.special[type]||{};// handleObj is passed to all event handlers
handleObj=jQuery.extend({type:type,origType:origType,data:data,handler:handler,guid:handler.guid,selector:selector,needsContext:selector&&jQuery.expr.match.needsContext.test(selector),namespace:namespaces.join(".")},handleObjIn);// Init the event handler queue if we're the first
if(!(handlers=events[type])){handlers=events[type]=[];handlers.delegateCount=0;// Only use addEventListener if the special events handler returns false
if(!special.setup||special.setup.call(elem,data,namespaces,eventHandle)===false){if(elem.addEventListener){elem.addEventListener(type,eventHandle);}}}if(special.add){special.add.call(elem,handleObj);if(!handleObj.handler.guid){handleObj.handler.guid=handler.guid;}}// Add to the element's handler list, delegates in front
if(selector){handlers.splice(handlers.delegateCount++,0,handleObj);}else{handlers.push(handleObj);}// Keep track of which events have ever been used, for event optimization
jQuery.event.global[type]=true;}},// Detach an event or set of events from an element
remove:function(elem,types,handler,selector,mappedTypes){var j,origCount,tmp,events,t,handleObj,special,handlers,type,namespaces,origType,elemData=dataPriv.hasData(elem)&&dataPriv.get(elem);if(!elemData||!(events=elemData.events)){return;}// Once for each type.namespace in types; type may be omitted
types=(types||"").match(rnothtmlwhite)||[""];t=types.length;while(t--){tmp=rtypenamespace.exec(types[t])||[];type=origType=tmp[1];namespaces=(tmp[2]||"").split(".").sort();// Unbind all events (on this namespace, if provided) for the element
if(!type){for(type in events){jQuery.event.remove(elem,type+types[t],handler,selector,true);}continue;}special=jQuery.event.special[type]||{};type=(selector?special.delegateType:special.bindType)||type;handlers=events[type]||[];tmp=tmp[2]&&new RegExp("(^|\\.)"+namespaces.join("\\.(?:.*\\.|)")+"(\\.|$)");// Remove matching events
origCount=j=handlers.length;while(j--){handleObj=handlers[j];if((mappedTypes||origType===handleObj.origType)&&(!handler||handler.guid===handleObj.guid)&&(!tmp||tmp.test(handleObj.namespace))&&(!selector||selector===handleObj.selector||selector==="**"&&handleObj.selector)){handlers.splice(j,1);if(handleObj.selector){handlers.delegateCount--;}if(special.remove){special.remove.call(elem,handleObj);}}}// Remove generic event handler if we removed something and no more handlers exist
// (avoids potential for endless recursion during removal of special event handlers)
if(origCount&&!handlers.length){if(!special.teardown||special.teardown.call(elem,namespaces,elemData.handle)===false){jQuery.removeEvent(elem,type,elemData.handle);}delete events[type];}}// Remove data and the expando if it's no longer used
if(jQuery.isEmptyObject(events)){dataPriv.remove(elem,"handle events");}},dispatch:function(nativeEvent){// Make a writable jQuery.Event from the native event object
var event=jQuery.event.fix(nativeEvent);var i,j,ret,matched,handleObj,handlerQueue,args=new Array(arguments.length),handlers=(dataPriv.get(this,"events")||{})[event.type]||[],special=jQuery.event.special[event.type]||{};// Use the fix-ed jQuery.Event rather than the (read-only) native event
args[0]=event;for(i=1;i<arguments.length;i++){args[i]=arguments[i];}event.delegateTarget=this;// Call the preDispatch hook for the mapped type, and let it bail if desired
if(special.preDispatch&&special.preDispatch.call(this,event)===false){return;}// Determine handlers
handlerQueue=jQuery.event.handlers.call(this,event,handlers);// Run delegates first; they may want to stop propagation beneath us
i=0;while((matched=handlerQueue[i++])&&!event.isPropagationStopped()){event.currentTarget=matched.elem;j=0;while((handleObj=matched.handlers[j++])&&!event.isImmediatePropagationStopped()){// Triggered event must either 1) have no namespace, or 2) have namespace(s)
// a subset or equal to those in the bound event (both can have no namespace).
if(!event.rnamespace||event.rnamespace.test(handleObj.namespace)){event.handleObj=handleObj;event.data=handleObj.data;ret=((jQuery.event.special[handleObj.origType]||{}).handle||handleObj.handler).apply(matched.elem,args);if(ret!==undefined){if((event.result=ret)===false){event.preventDefault();event.stopPropagation();}}}}}// Call the postDispatch hook for the mapped type
if(special.postDispatch){special.postDispatch.call(this,event);}return event.result;},handlers:function(event,handlers){var i,handleObj,sel,matchedHandlers,matchedSelectors,handlerQueue=[],delegateCount=handlers.delegateCount,cur=event.target;// Find delegate handlers
if(delegateCount&&// Support: IE <=9
// Black-hole SVG <use> instance trees (trac-13180)
cur.nodeType&&// Support: Firefox <=42
// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
// Support: IE 11 only
// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
!(event.type==="click"&&event.button>=1)){for(;cur!==this;cur=cur.parentNode||this){// Don't check non-elements (#13208)
// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
if(cur.nodeType===1&&!(event.type==="click"&&cur.disabled===true)){matchedHandlers=[];matchedSelectors={};for(i=0;i<delegateCount;i++){handleObj=handlers[i];// Don't conflict with Object.prototype properties (#13203)
sel=handleObj.selector+" ";if(matchedSelectors[sel]===undefined){matchedSelectors[sel]=handleObj.needsContext?jQuery(sel,this).index(cur)>-1:jQuery.find(sel,this,null,[cur]).length;}if(matchedSelectors[sel]){matchedHandlers.push(handleObj);}}if(matchedHandlers.length){handlerQueue.push({elem:cur,handlers:matchedHandlers});}}}}// Add the remaining (directly-bound) handlers
cur=this;if(delegateCount<handlers.length){handlerQueue.push({elem:cur,handlers:handlers.slice(delegateCount)});}return handlerQueue;},addProp:function(name,hook){Object.defineProperty(jQuery.Event.prototype,name,{enumerable:true,configurable:true,get:jQuery.isFunction(hook)?function(){if(this.originalEvent){return hook(this.originalEvent);}}:function(){if(this.originalEvent){return this.originalEvent[name];}},set:function(value){Object.defineProperty(this,name,{enumerable:true,configurable:true,writable:true,value:value});}});},fix:function(originalEvent){return originalEvent[jQuery.expando]?originalEvent:new jQuery.Event(originalEvent);},special:{load:{// Prevent triggered image.load events from bubbling to window.load
noBubble:true},focus:{// Fire native event if possible so blur/focus sequence is correct
trigger:function(){if(this!==safeActiveElement()&&this.focus){this.focus();return false;}},delegateType:"focusin"},blur:{trigger:function(){if(this===safeActiveElement()&&this.blur){this.blur();return false;}},delegateType:"focusout"},click:{// For checkbox, fire native event so checked state will be right
trigger:function(){if(this.type==="checkbox"&&this.click&&jQuery.nodeName(this,"input")){this.click();return false;}},// For cross-browser consistency, don't fire native .click() on links
_default:function(event){return jQuery.nodeName(event.target,"a");}},beforeunload:{postDispatch:function(event){// Support: Firefox 20+
// Firefox doesn't alert if the returnValue field is not set.
if(event.result!==undefined&&event.originalEvent){event.originalEvent.returnValue=event.result;}}}}};jQuery.removeEvent=function(elem,type,handle){// This "if" is needed for plain objects
if(elem.removeEventListener){elem.removeEventListener(type,handle);}};jQuery.Event=function(src,props){// Allow instantiation without the 'new' keyword
if(!(this instanceof jQuery.Event)){return new jQuery.Event(src,props);}// Event object
if(src&&src.type){this.originalEvent=src;this.type=src.type;// Events bubbling up the document may have been marked as prevented
// by a handler lower down the tree; reflect the correct value.
this.isDefaultPrevented=src.defaultPrevented||src.defaultPrevented===undefined&&// Support: Android <=2.3 only
src.returnValue===false?returnTrue:returnFalse;// Create target properties
// Support: Safari <=6 - 7 only
// Target should not be a text node (#504, #13143)
this.target=src.target&&src.target.nodeType===3?src.target.parentNode:src.target;this.currentTarget=src.currentTarget;this.relatedTarget=src.relatedTarget;// Event type
}else{this.type=src;}// Put explicitly provided properties onto the event object
if(props){jQuery.extend(this,props);}// Create a timestamp if incoming event doesn't have one
this.timeStamp=src&&src.timeStamp||jQuery.now();// Mark it as fixed
this[jQuery.expando]=true;};// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype={constructor:jQuery.Event,isDefaultPrevented:returnFalse,isPropagationStopped:returnFalse,isImmediatePropagationStopped:returnFalse,isSimulated:false,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=returnTrue;if(e&&!this.isSimulated){e.preventDefault();}},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=returnTrue;if(e&&!this.isSimulated){e.stopPropagation();}},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=returnTrue;if(e&&!this.isSimulated){e.stopImmediatePropagation();}this.stopPropagation();}};// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each({altKey:true,bubbles:true,cancelable:true,changedTouches:true,ctrlKey:true,detail:true,eventPhase:true,metaKey:true,pageX:true,pageY:true,shiftKey:true,view:true,"char":true,charCode:true,key:true,keyCode:true,button:true,buttons:true,clientX:true,clientY:true,offsetX:true,offsetY:true,pointerId:true,pointerType:true,screenX:true,screenY:true,targetTouches:true,toElement:true,touches:true,which:function(event){var button=event.button;// Add which for key events
if(event.which==null&&rkeyEvent.test(event.type)){return event.charCode!=null?event.charCode:event.keyCode;}// Add which for click: 1 === left; 2 === middle; 3 === right
if(!event.which&&button!==undefined&&rmouseEvent.test(event.type)){if(button&1){return 1;}if(button&2){return 3;}if(button&4){return 2;}return 0;}return event.which;}},jQuery.event.addProp);// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(orig,fix){jQuery.event.special[orig]={delegateType:fix,bindType:fix,handle:function(event){var ret,target=this,related=event.relatedTarget,handleObj=event.handleObj;// For mouseenter/leave call the handler if related is outside the target.
// NB: No relatedTarget if the mouse left/entered the browser window
if(!related||related!==target&&!jQuery.contains(target,related)){event.type=handleObj.origType;ret=handleObj.handler.apply(this,arguments);event.type=fix;}return ret;}};});jQuery.fn.extend({on:function(types,selector,data,fn){return on(this,types,selector,data,fn);},one:function(types,selector,data,fn){return on(this,types,selector,data,fn,1);},off:function(types,selector,fn){var handleObj,type;if(types&&types.preventDefault&&types.handleObj){// ( event )  dispatched jQuery.Event
handleObj=types.handleObj;jQuery(types.delegateTarget).off(handleObj.namespace?handleObj.origType+"."+handleObj.namespace:handleObj.origType,handleObj.selector,handleObj.handler);return this;}if(typeof types==="object"){// ( types-object [, selector] )
for(type in types){this.off(type,selector,types[type]);}return this;}if(selector===false||typeof selector==="function"){// ( types [, fn] )
fn=selector;selector=undefined;}if(fn===false){fn=returnFalse;}return this.each(function(){jQuery.event.remove(this,types,fn,selector);});}});var/* eslint-disable max-len */// See https://github.com/eslint/eslint/issues/3229
rxhtmlTag=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,/* eslint-enable */// Support: IE <=10 - 11, Edge 12 - 13
// In IE/Edge using regex groups here causes severe slowdowns.
// See https://connect.microsoft.com/IE/feedback/details/1736512/
rnoInnerhtml=/<script|<style|<link/i,// checked="checked" or checked
rchecked=/checked\s*(?:[^=]|=\s*.checked.)/i,rscriptTypeMasked=/^true\/(.*)/,rcleanScript=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function manipulationTarget(elem,content){if(jQuery.nodeName(elem,"table")&&jQuery.nodeName(content.nodeType!==11?content:content.firstChild,"tr")){return elem.getElementsByTagName("tbody")[0]||elem;}return elem;}// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript(elem){elem.type=(elem.getAttribute("type")!==null)+"/"+elem.type;return elem;}function restoreScript(elem){var match=rscriptTypeMasked.exec(elem.type);if(match){elem.type=match[1];}else{elem.removeAttribute("type");}return elem;}function cloneCopyEvent(src,dest){var i,l,type,pdataOld,pdataCur,udataOld,udataCur,events;if(dest.nodeType!==1){return;}// 1. Copy private data: events, handlers, etc.
if(dataPriv.hasData(src)){pdataOld=dataPriv.access(src);pdataCur=dataPriv.set(dest,pdataOld);events=pdataOld.events;if(events){delete pdataCur.handle;pdataCur.events={};for(type in events){for(i=0,l=events[type].length;i<l;i++){jQuery.event.add(dest,type,events[type][i]);}}}}// 2. Copy user data
if(dataUser.hasData(src)){udataOld=dataUser.access(src);udataCur=jQuery.extend({},udataOld);dataUser.set(dest,udataCur);}}// Fix IE bugs, see support tests
function fixInput(src,dest){var nodeName=dest.nodeName.toLowerCase();// Fails to persist the checked state of a cloned checkbox or radio button.
if(nodeName==="input"&&rcheckableType.test(src.type)){dest.checked=src.checked;// Fails to return the selected option to the default selected state when cloning options
}else if(nodeName==="input"||nodeName==="textarea"){dest.defaultValue=src.defaultValue;}}function domManip(collection,args,callback,ignored){// Flatten any nested arrays
args=concat.apply([],args);var fragment,first,scripts,hasScripts,node,doc,i=0,l=collection.length,iNoClone=l-1,value=args[0],isFunction=jQuery.isFunction(value);// We can't cloneNode fragments that contain checked, in WebKit
if(isFunction||l>1&&typeof value==="string"&&!support.checkClone&&rchecked.test(value)){return collection.each(function(index){var self=collection.eq(index);if(isFunction){args[0]=value.call(this,index,self.html());}domManip(self,args,callback,ignored);});}if(l){fragment=buildFragment(args,collection[0].ownerDocument,false,collection,ignored);first=fragment.firstChild;if(fragment.childNodes.length===1){fragment=first;}// Require either new content or an interest in ignored elements to invoke the callback
if(first||ignored){scripts=jQuery.map(getAll(fragment,"script"),disableScript);hasScripts=scripts.length;// Use the original fragment for the last item
// instead of the first because it can end up
// being emptied incorrectly in certain situations (#8070).
for(;i<l;i++){node=fragment;if(i!==iNoClone){node=jQuery.clone(node,true,true);// Keep references to cloned scripts for later restoration
if(hasScripts){// Support: Android <=4.0 only, PhantomJS 1 only
// push.apply(_, arraylike) throws on ancient WebKit
jQuery.merge(scripts,getAll(node,"script"));}}callback.call(collection[i],node,i);}if(hasScripts){doc=scripts[scripts.length-1].ownerDocument;// Reenable scripts
jQuery.map(scripts,restoreScript);// Evaluate executable scripts on first document insertion
for(i=0;i<hasScripts;i++){node=scripts[i];if(rscriptType.test(node.type||"")&&!dataPriv.access(node,"globalEval")&&jQuery.contains(doc,node)){if(node.src){// Optional AJAX dependency, but won't run scripts if not present
if(jQuery._evalUrl){jQuery._evalUrl(node.src);}}else{DOMEval(node.textContent.replace(rcleanScript,""),doc);}}}}}}return collection;}function remove(elem,selector,keepData){var node,nodes=selector?jQuery.filter(selector,elem):elem,i=0;for(;(node=nodes[i])!=null;i++){if(!keepData&&node.nodeType===1){jQuery.cleanData(getAll(node));}if(node.parentNode){if(keepData&&jQuery.contains(node.ownerDocument,node)){setGlobalEval(getAll(node,"script"));}node.parentNode.removeChild(node);}}return elem;}jQuery.extend({htmlPrefilter:function(html){return html.replace(rxhtmlTag,"<$1></$2>");},clone:function(elem,dataAndEvents,deepDataAndEvents){var i,l,srcElements,destElements,clone=elem.cloneNode(true),inPage=jQuery.contains(elem.ownerDocument,elem);// Fix IE cloning issues
if(!support.noCloneChecked&&(elem.nodeType===1||elem.nodeType===11)&&!jQuery.isXMLDoc(elem)){// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
destElements=getAll(clone);srcElements=getAll(elem);for(i=0,l=srcElements.length;i<l;i++){fixInput(srcElements[i],destElements[i]);}}// Copy the events from the original to the clone
if(dataAndEvents){if(deepDataAndEvents){srcElements=srcElements||getAll(elem);destElements=destElements||getAll(clone);for(i=0,l=srcElements.length;i<l;i++){cloneCopyEvent(srcElements[i],destElements[i]);}}else{cloneCopyEvent(elem,clone);}}// Preserve script evaluation history
destElements=getAll(clone,"script");if(destElements.length>0){setGlobalEval(destElements,!inPage&&getAll(elem,"script"));}// Return the cloned set
return clone;},cleanData:function(elems){var data,elem,type,special=jQuery.event.special,i=0;for(;(elem=elems[i])!==undefined;i++){if(acceptData(elem)){if(data=elem[dataPriv.expando]){if(data.events){for(type in data.events){if(special[type]){jQuery.event.remove(elem,type);// This is a shortcut to avoid jQuery.event.remove's overhead
}else{jQuery.removeEvent(elem,type,data.handle);}}}// Support: Chrome <=35 - 45+
// Assign undefined instead of using delete, see Data#remove
elem[dataPriv.expando]=undefined;}if(elem[dataUser.expando]){// Support: Chrome <=35 - 45+
// Assign undefined instead of using delete, see Data#remove
elem[dataUser.expando]=undefined;}}}}});jQuery.fn.extend({detach:function(selector){return remove(this,selector,true);},remove:function(selector){return remove(this,selector);},text:function(value){return access(this,function(value){return value===undefined?jQuery.text(this):this.empty().each(function(){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){this.textContent=value;}});},null,value,arguments.length);},append:function(){return domManip(this,arguments,function(elem){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var target=manipulationTarget(this,elem);target.appendChild(elem);}});},prepend:function(){return domManip(this,arguments,function(elem){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var target=manipulationTarget(this,elem);target.insertBefore(elem,target.firstChild);}});},before:function(){return domManip(this,arguments,function(elem){if(this.parentNode){this.parentNode.insertBefore(elem,this);}});},after:function(){return domManip(this,arguments,function(elem){if(this.parentNode){this.parentNode.insertBefore(elem,this.nextSibling);}});},empty:function(){var elem,i=0;for(;(elem=this[i])!=null;i++){if(elem.nodeType===1){// Prevent memory leaks
jQuery.cleanData(getAll(elem,false));// Remove any remaining nodes
elem.textContent="";}}return this;},clone:function(dataAndEvents,deepDataAndEvents){dataAndEvents=dataAndEvents==null?false:dataAndEvents;deepDataAndEvents=deepDataAndEvents==null?dataAndEvents:deepDataAndEvents;return this.map(function(){return jQuery.clone(this,dataAndEvents,deepDataAndEvents);});},html:function(value){return access(this,function(value){var elem=this[0]||{},i=0,l=this.length;if(value===undefined&&elem.nodeType===1){return elem.innerHTML;}// See if we can take a shortcut and just use innerHTML
if(typeof value==="string"&&!rnoInnerhtml.test(value)&&!wrapMap[(rtagName.exec(value)||["",""])[1].toLowerCase()]){value=jQuery.htmlPrefilter(value);try{for(;i<l;i++){elem=this[i]||{};// Remove element nodes and prevent memory leaks
if(elem.nodeType===1){jQuery.cleanData(getAll(elem,false));elem.innerHTML=value;}}elem=0;// If using innerHTML throws an exception, use the fallback method
}catch(e){}}if(elem){this.empty().append(value);}},null,value,arguments.length);},replaceWith:function(){var ignored=[];// Make the changes, replacing each non-ignored context element with the new content
return domManip(this,arguments,function(elem){var parent=this.parentNode;if(jQuery.inArray(this,ignored)<0){jQuery.cleanData(getAll(this));if(parent){parent.replaceChild(elem,this);}}// Force callback invocation
},ignored);}});jQuery.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(name,original){jQuery.fn[name]=function(selector){var elems,ret=[],insert=jQuery(selector),last=insert.length-1,i=0;for(;i<=last;i++){elems=i===last?this:this.clone(true);jQuery(insert[i])[original](elems);// Support: Android <=4.0 only, PhantomJS 1 only
// .get() because push.apply(_, arraylike) throws on ancient WebKit
push.apply(ret,elems.get());}return this.pushStack(ret);};});var rmargin=/^margin/;var rnumnonpx=new RegExp("^("+pnum+")(?!px)[a-z%]+$","i");var getStyles=function(elem){// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
// IE throws on elements created in popups
// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
var view=elem.ownerDocument.defaultView;if(!view||!view.opener){view=window;}return view.getComputedStyle(elem);};(function(){// Executing both pixelPosition & boxSizingReliable tests require only one layout
// so they're executed at the same time to save the second computation.
function computeStyleTests(){// This is a singleton, we need to execute it only once
if(!div){return;}div.style.cssText="box-sizing:border-box;"+"position:relative;display:block;"+"margin:auto;border:1px;padding:1px;"+"top:1%;width:50%";div.innerHTML="";documentElement.appendChild(container);var divStyle=window.getComputedStyle(div);pixelPositionVal=divStyle.top!=="1%";// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
reliableMarginLeftVal=divStyle.marginLeft==="2px";boxSizingReliableVal=divStyle.width==="4px";// Support: Android 4.0 - 4.3 only
// Some styles come back with percentage values, even though they shouldn't
div.style.marginRight="50%";pixelMarginRightVal=divStyle.marginRight==="4px";documentElement.removeChild(container);// Nullify the div so it wouldn't be stored in the memory and
// it will also be a sign that checks already performed
div=null;}var pixelPositionVal,boxSizingReliableVal,pixelMarginRightVal,reliableMarginLeftVal,container=document.createElement("div"),div=document.createElement("div");// Finish early in limited (non-browser) environments
if(!div.style){return;}// Support: IE <=9 - 11 only
// Style of cloned element affects source element cloned (#8908)
div.style.backgroundClip="content-box";div.cloneNode(true).style.backgroundClip="";support.clearCloneStyle=div.style.backgroundClip==="content-box";container.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;"+"padding:0;margin-top:1px;position:absolute";container.appendChild(div);jQuery.extend(support,{pixelPosition:function(){computeStyleTests();return pixelPositionVal;},boxSizingReliable:function(){computeStyleTests();return boxSizingReliableVal;},pixelMarginRight:function(){computeStyleTests();return pixelMarginRightVal;},reliableMarginLeft:function(){computeStyleTests();return reliableMarginLeftVal;}});})();function curCSS(elem,name,computed){var width,minWidth,maxWidth,ret,style=elem.style;computed=computed||getStyles(elem);// Support: IE <=9 only
// getPropertyValue is only needed for .css('filter') (#12537)
if(computed){ret=computed.getPropertyValue(name)||computed[name];if(ret===""&&!jQuery.contains(elem.ownerDocument,elem)){ret=jQuery.style(elem,name);}// A tribute to the "awesome hack by Dean Edwards"
// Android Browser returns percentage for some values,
// but width seems to be reliably pixels.
// This is against the CSSOM draft spec:
// https://drafts.csswg.org/cssom/#resolved-values
if(!support.pixelMarginRight()&&rnumnonpx.test(ret)&&rmargin.test(name)){// Remember the original values
width=style.width;minWidth=style.minWidth;maxWidth=style.maxWidth;// Put in the new values to get a computed value out
style.minWidth=style.maxWidth=style.width=ret;ret=computed.width;// Revert the changed values
style.width=width;style.minWidth=minWidth;style.maxWidth=maxWidth;}}return ret!==undefined?// Support: IE <=9 - 11 only
// IE returns zIndex value as an integer.
ret+"":ret;}function addGetHookIf(conditionFn,hookFn){// Define the hook, we'll check on the first run if it's really needed.
return{get:function(){if(conditionFn()){// Hook not needed (or it's not possible to use it due
// to missing dependency), remove it.
delete this.get;return;}// Hook needed; redefine it so that the support test is not executed again.
return(this.get=hookFn).apply(this,arguments);}};}var// Swappable if display is none or starts with table
// except "table", "table-cell", or "table-caption"
// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
rdisplayswap=/^(none|table(?!-c[ea]).+)/,cssShow={position:"absolute",visibility:"hidden",display:"block"},cssNormalTransform={letterSpacing:"0",fontWeight:"400"},cssPrefixes=["Webkit","Moz","ms"],emptyStyle=document.createElement("div").style;// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName(name){// Shortcut for names that are not vendor prefixed
if(name in emptyStyle){return name;}// Check for vendor prefixed names
var capName=name[0].toUpperCase()+name.slice(1),i=cssPrefixes.length;while(i--){name=cssPrefixes[i]+capName;if(name in emptyStyle){return name;}}}function setPositiveNumber(elem,value,subtract){// Any relative (+/-) values have already been
// normalized at this point
var matches=rcssNum.exec(value);return matches?// Guard against undefined "subtract", e.g., when used as in cssHooks
Math.max(0,matches[2]-(subtract||0))+(matches[3]||"px"):value;}function augmentWidthOrHeight(elem,name,extra,isBorderBox,styles){var i,val=0;// If we already have the right measurement, avoid augmentation
if(extra===(isBorderBox?"border":"content")){i=4;// Otherwise initialize for horizontal or vertical properties
}else{i=name==="width"?1:0;}for(;i<4;i+=2){// Both box models exclude margin, so add it if we want it
if(extra==="margin"){val+=jQuery.css(elem,extra+cssExpand[i],true,styles);}if(isBorderBox){// border-box includes padding, so remove it if we want content
if(extra==="content"){val-=jQuery.css(elem,"padding"+cssExpand[i],true,styles);}// At this point, extra isn't border nor margin, so remove border
if(extra!=="margin"){val-=jQuery.css(elem,"border"+cssExpand[i]+"Width",true,styles);}}else{// At this point, extra isn't content, so add padding
val+=jQuery.css(elem,"padding"+cssExpand[i],true,styles);// At this point, extra isn't content nor padding, so add border
if(extra!=="padding"){val+=jQuery.css(elem,"border"+cssExpand[i]+"Width",true,styles);}}}return val;}function getWidthOrHeight(elem,name,extra){// Start with offset property, which is equivalent to the border-box value
var val,valueIsBorderBox=true,styles=getStyles(elem),isBorderBox=jQuery.css(elem,"boxSizing",false,styles)==="border-box";// Support: IE <=11 only
// Running getBoundingClientRect on a disconnected node
// in IE throws an error.
if(elem.getClientRects().length){val=elem.getBoundingClientRect()[name];}// Some non-html elements return undefined for offsetWidth, so check for null/undefined
// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
if(val<=0||val==null){// Fall back to computed then uncomputed css if necessary
val=curCSS(elem,name,styles);if(val<0||val==null){val=elem.style[name];}// Computed unit is not pixels. Stop here and return.
if(rnumnonpx.test(val)){return val;}// Check for style in case a browser which returns unreliable values
// for getComputedStyle silently falls back to the reliable elem.style
valueIsBorderBox=isBorderBox&&(support.boxSizingReliable()||val===elem.style[name]);// Normalize "", auto, and prepare for extra
val=parseFloat(val)||0;}// Use the active box-sizing model to add/subtract irrelevant styles
return val+augmentWidthOrHeight(elem,name,extra||(isBorderBox?"border":"content"),valueIsBorderBox,styles)+"px";}jQuery.extend({// Add in style property hooks for overriding the default
// behavior of getting and setting a style property
cssHooks:{opacity:{get:function(elem,computed){if(computed){// We should always get a number back from opacity
var ret=curCSS(elem,"opacity");return ret===""?"1":ret;}}}},// Don't automatically add "px" to these possibly-unitless properties
cssNumber:{"animationIterationCount":true,"columnCount":true,"fillOpacity":true,"flexGrow":true,"flexShrink":true,"fontWeight":true,"lineHeight":true,"opacity":true,"order":true,"orphans":true,"widows":true,"zIndex":true,"zoom":true},// Add in properties whose names you wish to fix before
// setting or getting the value
cssProps:{"float":"cssFloat"},// Get and set the style property on a DOM Node
style:function(elem,name,value,extra){// Don't set styles on text and comment nodes
if(!elem||elem.nodeType===3||elem.nodeType===8||!elem.style){return;}// Make sure that we're working with the right name
var ret,type,hooks,origName=jQuery.camelCase(name),style=elem.style;name=jQuery.cssProps[origName]||(jQuery.cssProps[origName]=vendorPropName(origName)||origName);// Gets hook for the prefixed version, then unprefixed version
hooks=jQuery.cssHooks[name]||jQuery.cssHooks[origName];// Check if we're setting a value
if(value!==undefined){type=typeof value;// Convert "+=" or "-=" to relative numbers (#7345)
if(type==="string"&&(ret=rcssNum.exec(value))&&ret[1]){value=adjustCSS(elem,name,ret);// Fixes bug #9237
type="number";}// Make sure that null and NaN values aren't set (#7116)
if(value==null||value!==value){return;}// If a number was passed in, add the unit (except for certain CSS properties)
if(type==="number"){value+=ret&&ret[3]||(jQuery.cssNumber[origName]?"":"px");}// background-* props affect original clone's values
if(!support.clearCloneStyle&&value===""&&name.indexOf("background")===0){style[name]="inherit";}// If a hook was provided, use that value, otherwise just set the specified value
if(!hooks||!("set"in hooks)||(value=hooks.set(elem,value,extra))!==undefined){style[name]=value;}}else{// If a hook was provided get the non-computed value from there
if(hooks&&"get"in hooks&&(ret=hooks.get(elem,false,extra))!==undefined){return ret;}// Otherwise just get the value from the style object
return style[name];}},css:function(elem,name,extra,styles){var val,num,hooks,origName=jQuery.camelCase(name);// Make sure that we're working with the right name
name=jQuery.cssProps[origName]||(jQuery.cssProps[origName]=vendorPropName(origName)||origName);// Try prefixed name followed by the unprefixed name
hooks=jQuery.cssHooks[name]||jQuery.cssHooks[origName];// If a hook was provided get the computed value from there
if(hooks&&"get"in hooks){val=hooks.get(elem,true,extra);}// Otherwise, if a way to get the computed value exists, use that
if(val===undefined){val=curCSS(elem,name,styles);}// Convert "normal" to computed value
if(val==="normal"&&name in cssNormalTransform){val=cssNormalTransform[name];}// Make numeric if forced or a qualifier was provided and val looks numeric
if(extra===""||extra){num=parseFloat(val);return extra===true||isFinite(num)?num||0:val;}return val;}});jQuery.each(["height","width"],function(i,name){jQuery.cssHooks[name]={get:function(elem,computed,extra){if(computed){// Certain elements can have dimension info if we invisibly show them
// but it must have a current display style that would benefit
return rdisplayswap.test(jQuery.css(elem,"display"))&&(// Support: Safari 8+
// Table columns in Safari have non-zero offsetWidth & zero
// getBoundingClientRect().width unless display is changed.
// Support: IE <=11 only
// Running getBoundingClientRect on a disconnected node
// in IE throws an error.
!elem.getClientRects().length||!elem.getBoundingClientRect().width)?swap(elem,cssShow,function(){return getWidthOrHeight(elem,name,extra);}):getWidthOrHeight(elem,name,extra);}},set:function(elem,value,extra){var matches,styles=extra&&getStyles(elem),subtract=extra&&augmentWidthOrHeight(elem,name,extra,jQuery.css(elem,"boxSizing",false,styles)==="border-box",styles);// Convert to pixels if value adjustment is needed
if(subtract&&(matches=rcssNum.exec(value))&&(matches[3]||"px")!=="px"){elem.style[name]=value;value=jQuery.css(elem,name);}return setPositiveNumber(elem,value,subtract);}};});jQuery.cssHooks.marginLeft=addGetHookIf(support.reliableMarginLeft,function(elem,computed){if(computed){return(parseFloat(curCSS(elem,"marginLeft"))||elem.getBoundingClientRect().left-swap(elem,{marginLeft:0},function(){return elem.getBoundingClientRect().left;}))+"px";}});// These hooks are used by animate to expand properties
jQuery.each({margin:"",padding:"",border:"Width"},function(prefix,suffix){jQuery.cssHooks[prefix+suffix]={expand:function(value){var i=0,expanded={},// Assumes a single number if not a string
parts=typeof value==="string"?value.split(" "):[value];for(;i<4;i++){expanded[prefix+cssExpand[i]+suffix]=parts[i]||parts[i-2]||parts[0];}return expanded;}};if(!rmargin.test(prefix)){jQuery.cssHooks[prefix+suffix].set=setPositiveNumber;}});jQuery.fn.extend({css:function(name,value){return access(this,function(elem,name,value){var styles,len,map={},i=0;if(jQuery.isArray(name)){styles=getStyles(elem);len=name.length;for(;i<len;i++){map[name[i]]=jQuery.css(elem,name[i],false,styles);}return map;}return value!==undefined?jQuery.style(elem,name,value):jQuery.css(elem,name);},name,value,arguments.length>1);}});function Tween(elem,options,prop,end,easing){return new Tween.prototype.init(elem,options,prop,end,easing);}jQuery.Tween=Tween;Tween.prototype={constructor:Tween,init:function(elem,options,prop,end,easing,unit){this.elem=elem;this.prop=prop;this.easing=easing||jQuery.easing._default;this.options=options;this.start=this.now=this.cur();this.end=end;this.unit=unit||(jQuery.cssNumber[prop]?"":"px");},cur:function(){var hooks=Tween.propHooks[this.prop];return hooks&&hooks.get?hooks.get(this):Tween.propHooks._default.get(this);},run:function(percent){var eased,hooks=Tween.propHooks[this.prop];if(this.options.duration){this.pos=eased=jQuery.easing[this.easing](percent,this.options.duration*percent,0,1,this.options.duration);}else{this.pos=eased=percent;}this.now=(this.end-this.start)*eased+this.start;if(this.options.step){this.options.step.call(this.elem,this.now,this);}if(hooks&&hooks.set){hooks.set(this);}else{Tween.propHooks._default.set(this);}return this;}};Tween.prototype.init.prototype=Tween.prototype;Tween.propHooks={_default:{get:function(tween){var result;// Use a property on the element directly when it is not a DOM element,
// or when there is no matching style property that exists.
if(tween.elem.nodeType!==1||tween.elem[tween.prop]!=null&&tween.elem.style[tween.prop]==null){return tween.elem[tween.prop];}// Passing an empty string as a 3rd parameter to .css will automatically
// attempt a parseFloat and fallback to a string if the parse fails.
// Simple values such as "10px" are parsed to Float;
// complex values such as "rotate(1rad)" are returned as-is.
result=jQuery.css(tween.elem,tween.prop,"");// Empty strings, null, undefined and "auto" are converted to 0.
return!result||result==="auto"?0:result;},set:function(tween){// Use step hook for back compat.
// Use cssHook if its there.
// Use .style if available and use plain properties where available.
if(jQuery.fx.step[tween.prop]){jQuery.fx.step[tween.prop](tween);}else if(tween.elem.nodeType===1&&(tween.elem.style[jQuery.cssProps[tween.prop]]!=null||jQuery.cssHooks[tween.prop])){jQuery.style(tween.elem,tween.prop,tween.now+tween.unit);}else{tween.elem[tween.prop]=tween.now;}}}};// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop=Tween.propHooks.scrollLeft={set:function(tween){if(tween.elem.nodeType&&tween.elem.parentNode){tween.elem[tween.prop]=tween.now;}}};jQuery.easing={linear:function(p){return p;},swing:function(p){return 0.5-Math.cos(p*Math.PI)/2;},_default:"swing"};jQuery.fx=Tween.prototype.init;// Back compat <1.8 extension point
jQuery.fx.step={};var fxNow,timerId,rfxtypes=/^(?:toggle|show|hide)$/,rrun=/queueHooks$/;function raf(){if(timerId){window.requestAnimationFrame(raf);jQuery.fx.tick();}}// Animations created synchronously will run synchronously
function createFxNow(){window.setTimeout(function(){fxNow=undefined;});return fxNow=jQuery.now();}// Generate parameters to create a standard animation
function genFx(type,includeWidth){var which,i=0,attrs={height:type};// If we include width, step value is 1 to do all cssExpand values,
// otherwise step value is 2 to skip over Left and Right
includeWidth=includeWidth?1:0;for(;i<4;i+=2-includeWidth){which=cssExpand[i];attrs["margin"+which]=attrs["padding"+which]=type;}if(includeWidth){attrs.opacity=attrs.width=type;}return attrs;}function createTween(value,prop,animation){var tween,collection=(Animation.tweeners[prop]||[]).concat(Animation.tweeners["*"]),index=0,length=collection.length;for(;index<length;index++){if(tween=collection[index].call(animation,prop,value)){// We're done with this property
return tween;}}}function defaultPrefilter(elem,props,opts){var prop,value,toggle,hooks,oldfire,propTween,restoreDisplay,display,isBox="width"in props||"height"in props,anim=this,orig={},style=elem.style,hidden=elem.nodeType&&isHiddenWithinTree(elem),dataShow=dataPriv.get(elem,"fxshow");// Queue-skipping animations hijack the fx hooks
if(!opts.queue){hooks=jQuery._queueHooks(elem,"fx");if(hooks.unqueued==null){hooks.unqueued=0;oldfire=hooks.empty.fire;hooks.empty.fire=function(){if(!hooks.unqueued){oldfire();}};}hooks.unqueued++;anim.always(function(){// Ensure the complete handler is called before this completes
anim.always(function(){hooks.unqueued--;if(!jQuery.queue(elem,"fx").length){hooks.empty.fire();}});});}// Detect show/hide animations
for(prop in props){value=props[prop];if(rfxtypes.test(value)){delete props[prop];toggle=toggle||value==="toggle";if(value===(hidden?"hide":"show")){// Pretend to be hidden if this is a "show" and
// there is still data from a stopped show/hide
if(value==="show"&&dataShow&&dataShow[prop]!==undefined){hidden=true;// Ignore all other no-op show/hide data
}else{continue;}}orig[prop]=dataShow&&dataShow[prop]||jQuery.style(elem,prop);}}// Bail out if this is a no-op like .hide().hide()
propTween=!jQuery.isEmptyObject(props);if(!propTween&&jQuery.isEmptyObject(orig)){return;}// Restrict "overflow" and "display" styles during box animations
if(isBox&&elem.nodeType===1){// Support: IE <=9 - 11, Edge 12 - 13
// Record all 3 overflow attributes because IE does not infer the shorthand
// from identically-valued overflowX and overflowY
opts.overflow=[style.overflow,style.overflowX,style.overflowY];// Identify a display type, preferring old show/hide data over the CSS cascade
restoreDisplay=dataShow&&dataShow.display;if(restoreDisplay==null){restoreDisplay=dataPriv.get(elem,"display");}display=jQuery.css(elem,"display");if(display==="none"){if(restoreDisplay){display=restoreDisplay;}else{// Get nonempty value(s) by temporarily forcing visibility
showHide([elem],true);restoreDisplay=elem.style.display||restoreDisplay;display=jQuery.css(elem,"display");showHide([elem]);}}// Animate inline elements as inline-block
if(display==="inline"||display==="inline-block"&&restoreDisplay!=null){if(jQuery.css(elem,"float")==="none"){// Restore the original display value at the end of pure show/hide animations
if(!propTween){anim.done(function(){style.display=restoreDisplay;});if(restoreDisplay==null){display=style.display;restoreDisplay=display==="none"?"":display;}}style.display="inline-block";}}}if(opts.overflow){style.overflow="hidden";anim.always(function(){style.overflow=opts.overflow[0];style.overflowX=opts.overflow[1];style.overflowY=opts.overflow[2];});}// Implement show/hide animations
propTween=false;for(prop in orig){// General show/hide setup for this element animation
if(!propTween){if(dataShow){if("hidden"in dataShow){hidden=dataShow.hidden;}}else{dataShow=dataPriv.access(elem,"fxshow",{display:restoreDisplay});}// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
if(toggle){dataShow.hidden=!hidden;}// Show elements before animating them
if(hidden){showHide([elem],true);}/* eslint-disable no-loop-func */anim.done(function(){/* eslint-enable no-loop-func */// The final step of a "hide" animation is actually hiding the element
if(!hidden){showHide([elem]);}dataPriv.remove(elem,"fxshow");for(prop in orig){jQuery.style(elem,prop,orig[prop]);}});}// Per-property setup
propTween=createTween(hidden?dataShow[prop]:0,prop,anim);if(!(prop in dataShow)){dataShow[prop]=propTween.start;if(hidden){propTween.end=propTween.start;propTween.start=0;}}}}function propFilter(props,specialEasing){var index,name,easing,value,hooks;// camelCase, specialEasing and expand cssHook pass
for(index in props){name=jQuery.camelCase(index);easing=specialEasing[name];value=props[index];if(jQuery.isArray(value)){easing=value[1];value=props[index]=value[0];}if(index!==name){props[name]=value;delete props[index];}hooks=jQuery.cssHooks[name];if(hooks&&"expand"in hooks){value=hooks.expand(value);delete props[name];// Not quite $.extend, this won't overwrite existing keys.
// Reusing 'index' because we have the correct "name"
for(index in value){if(!(index in props)){props[index]=value[index];specialEasing[index]=easing;}}}else{specialEasing[name]=easing;}}}function Animation(elem,properties,options){var result,stopped,index=0,length=Animation.prefilters.length,deferred=jQuery.Deferred().always(function(){// Don't match elem in the :animated selector
delete tick.elem;}),tick=function(){if(stopped){return false;}var currentTime=fxNow||createFxNow(),remaining=Math.max(0,animation.startTime+animation.duration-currentTime),// Support: Android 2.3 only
// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
temp=remaining/animation.duration||0,percent=1-temp,index=0,length=animation.tweens.length;for(;index<length;index++){animation.tweens[index].run(percent);}deferred.notifyWith(elem,[animation,percent,remaining]);if(percent<1&&length){return remaining;}else{deferred.resolveWith(elem,[animation]);return false;}},animation=deferred.promise({elem:elem,props:jQuery.extend({},properties),opts:jQuery.extend(true,{specialEasing:{},easing:jQuery.easing._default},options),originalProperties:properties,originalOptions:options,startTime:fxNow||createFxNow(),duration:options.duration,tweens:[],createTween:function(prop,end){var tween=jQuery.Tween(elem,animation.opts,prop,end,animation.opts.specialEasing[prop]||animation.opts.easing);animation.tweens.push(tween);return tween;},stop:function(gotoEnd){var index=0,// If we are going to the end, we want to run all the tweens
// otherwise we skip this part
length=gotoEnd?animation.tweens.length:0;if(stopped){return this;}stopped=true;for(;index<length;index++){animation.tweens[index].run(1);}// Resolve when we played the last frame; otherwise, reject
if(gotoEnd){deferred.notifyWith(elem,[animation,1,0]);deferred.resolveWith(elem,[animation,gotoEnd]);}else{deferred.rejectWith(elem,[animation,gotoEnd]);}return this;}}),props=animation.props;propFilter(props,animation.opts.specialEasing);for(;index<length;index++){result=Animation.prefilters[index].call(animation,elem,props,animation.opts);if(result){if(jQuery.isFunction(result.stop)){jQuery._queueHooks(animation.elem,animation.opts.queue).stop=jQuery.proxy(result.stop,result);}return result;}}jQuery.map(props,createTween,animation);if(jQuery.isFunction(animation.opts.start)){animation.opts.start.call(elem,animation);}jQuery.fx.timer(jQuery.extend(tick,{elem:elem,anim:animation,queue:animation.opts.queue}));// attach callbacks from options
return animation.progress(animation.opts.progress).done(animation.opts.done,animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);}jQuery.Animation=jQuery.extend(Animation,{tweeners:{"*":[function(prop,value){var tween=this.createTween(prop,value);adjustCSS(tween.elem,prop,rcssNum.exec(value),tween);return tween;}]},tweener:function(props,callback){if(jQuery.isFunction(props)){callback=props;props=["*"];}else{props=props.match(rnothtmlwhite);}var prop,index=0,length=props.length;for(;index<length;index++){prop=props[index];Animation.tweeners[prop]=Animation.tweeners[prop]||[];Animation.tweeners[prop].unshift(callback);}},prefilters:[defaultPrefilter],prefilter:function(callback,prepend){if(prepend){Animation.prefilters.unshift(callback);}else{Animation.prefilters.push(callback);}}});jQuery.speed=function(speed,easing,fn){var opt=speed&&typeof speed==="object"?jQuery.extend({},speed):{complete:fn||!fn&&easing||jQuery.isFunction(speed)&&speed,duration:speed,easing:fn&&easing||easing&&!jQuery.isFunction(easing)&&easing};// Go to the end state if fx are off or if document is hidden
if(jQuery.fx.off||document.hidden){opt.duration=0;}else{if(typeof opt.duration!=="number"){if(opt.duration in jQuery.fx.speeds){opt.duration=jQuery.fx.speeds[opt.duration];}else{opt.duration=jQuery.fx.speeds._default;}}}// Normalize opt.queue - true/undefined/null -> "fx"
if(opt.queue==null||opt.queue===true){opt.queue="fx";}// Queueing
opt.old=opt.complete;opt.complete=function(){if(jQuery.isFunction(opt.old)){opt.old.call(this);}if(opt.queue){jQuery.dequeue(this,opt.queue);}};return opt;};jQuery.fn.extend({fadeTo:function(speed,to,easing,callback){// Show any hidden elements after setting opacity to 0
return this.filter(isHiddenWithinTree).css("opacity",0).show()// Animate to the value specified
.end().animate({opacity:to},speed,easing,callback);},animate:function(prop,speed,easing,callback){var empty=jQuery.isEmptyObject(prop),optall=jQuery.speed(speed,easing,callback),doAnimation=function(){// Operate on a copy of prop so per-property easing won't be lost
var anim=Animation(this,jQuery.extend({},prop),optall);// Empty animations, or finishing resolves immediately
if(empty||dataPriv.get(this,"finish")){anim.stop(true);}};doAnimation.finish=doAnimation;return empty||optall.queue===false?this.each(doAnimation):this.queue(optall.queue,doAnimation);},stop:function(type,clearQueue,gotoEnd){var stopQueue=function(hooks){var stop=hooks.stop;delete hooks.stop;stop(gotoEnd);};if(typeof type!=="string"){gotoEnd=clearQueue;clearQueue=type;type=undefined;}if(clearQueue&&type!==false){this.queue(type||"fx",[]);}return this.each(function(){var dequeue=true,index=type!=null&&type+"queueHooks",timers=jQuery.timers,data=dataPriv.get(this);if(index){if(data[index]&&data[index].stop){stopQueue(data[index]);}}else{for(index in data){if(data[index]&&data[index].stop&&rrun.test(index)){stopQueue(data[index]);}}}for(index=timers.length;index--;){if(timers[index].elem===this&&(type==null||timers[index].queue===type)){timers[index].anim.stop(gotoEnd);dequeue=false;timers.splice(index,1);}}// Start the next in the queue if the last step wasn't forced.
// Timers currently will call their complete callbacks, which
// will dequeue but only if they were gotoEnd.
if(dequeue||!gotoEnd){jQuery.dequeue(this,type);}});},finish:function(type){if(type!==false){type=type||"fx";}return this.each(function(){var index,data=dataPriv.get(this),queue=data[type+"queue"],hooks=data[type+"queueHooks"],timers=jQuery.timers,length=queue?queue.length:0;// Enable finishing flag on private data
data.finish=true;// Empty the queue first
jQuery.queue(this,type,[]);if(hooks&&hooks.stop){hooks.stop.call(this,true);}// Look for any active animations, and finish them
for(index=timers.length;index--;){if(timers[index].elem===this&&timers[index].queue===type){timers[index].anim.stop(true);timers.splice(index,1);}}// Look for any animations in the old queue and finish them
for(index=0;index<length;index++){if(queue[index]&&queue[index].finish){queue[index].finish.call(this);}}// Turn off finishing flag
delete data.finish;});}});jQuery.each(["toggle","show","hide"],function(i,name){var cssFn=jQuery.fn[name];jQuery.fn[name]=function(speed,easing,callback){return speed==null||typeof speed==="boolean"?cssFn.apply(this,arguments):this.animate(genFx(name,true),speed,easing,callback);};});// Generate shortcuts for custom animations
jQuery.each({slideDown:genFx("show"),slideUp:genFx("hide"),slideToggle:genFx("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(name,props){jQuery.fn[name]=function(speed,easing,callback){return this.animate(props,speed,easing,callback);};});jQuery.timers=[];jQuery.fx.tick=function(){var timer,i=0,timers=jQuery.timers;fxNow=jQuery.now();for(;i<timers.length;i++){timer=timers[i];// Checks the timer has not already been removed
if(!timer()&&timers[i]===timer){timers.splice(i--,1);}}if(!timers.length){jQuery.fx.stop();}fxNow=undefined;};jQuery.fx.timer=function(timer){jQuery.timers.push(timer);if(timer()){jQuery.fx.start();}else{jQuery.timers.pop();}};jQuery.fx.interval=13;jQuery.fx.start=function(){if(!timerId){timerId=window.requestAnimationFrame?window.requestAnimationFrame(raf):window.setInterval(jQuery.fx.tick,jQuery.fx.interval);}};jQuery.fx.stop=function(){if(window.cancelAnimationFrame){window.cancelAnimationFrame(timerId);}else{window.clearInterval(timerId);}timerId=null;};jQuery.fx.speeds={slow:600,fast:200,// Default speed
_default:400};// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay=function(time,type){time=jQuery.fx?jQuery.fx.speeds[time]||time:time;type=type||"fx";return this.queue(type,function(next,hooks){var timeout=window.setTimeout(next,time);hooks.stop=function(){window.clearTimeout(timeout);};});};(function(){var input=document.createElement("input"),select=document.createElement("select"),opt=select.appendChild(document.createElement("option"));input.type="checkbox";// Support: Android <=4.3 only
// Default value for a checkbox should be "on"
support.checkOn=input.value!=="";// Support: IE <=11 only
// Must access selectedIndex to make default options select
support.optSelected=opt.selected;// Support: IE <=11 only
// An input loses its value after becoming a radio
input=document.createElement("input");input.value="t";input.type="radio";support.radioValue=input.value==="t";})();var boolHook,attrHandle=jQuery.expr.attrHandle;jQuery.fn.extend({attr:function(name,value){return access(this,jQuery.attr,name,value,arguments.length>1);},removeAttr:function(name){return this.each(function(){jQuery.removeAttr(this,name);});}});jQuery.extend({attr:function(elem,name,value){var ret,hooks,nType=elem.nodeType;// Don't get/set attributes on text, comment and attribute nodes
if(nType===3||nType===8||nType===2){return;}// Fallback to prop when attributes are not supported
if(typeof elem.getAttribute==="undefined"){return jQuery.prop(elem,name,value);}// Attribute hooks are determined by the lowercase version
// Grab necessary hook if one is defined
if(nType!==1||!jQuery.isXMLDoc(elem)){hooks=jQuery.attrHooks[name.toLowerCase()]||(jQuery.expr.match.bool.test(name)?boolHook:undefined);}if(value!==undefined){if(value===null){jQuery.removeAttr(elem,name);return;}if(hooks&&"set"in hooks&&(ret=hooks.set(elem,value,name))!==undefined){return ret;}elem.setAttribute(name,value+"");return value;}if(hooks&&"get"in hooks&&(ret=hooks.get(elem,name))!==null){return ret;}ret=jQuery.find.attr(elem,name);// Non-existent attributes return null, we normalize to undefined
return ret==null?undefined:ret;},attrHooks:{type:{set:function(elem,value){if(!support.radioValue&&value==="radio"&&jQuery.nodeName(elem,"input")){var val=elem.value;elem.setAttribute("type",value);if(val){elem.value=val;}return value;}}}},removeAttr:function(elem,value){var name,i=0,// Attribute names can contain non-HTML whitespace characters
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
attrNames=value&&value.match(rnothtmlwhite);if(attrNames&&elem.nodeType===1){while(name=attrNames[i++]){elem.removeAttribute(name);}}}});// Hooks for boolean attributes
boolHook={set:function(elem,value,name){if(value===false){// Remove boolean attributes when set to false
jQuery.removeAttr(elem,name);}else{elem.setAttribute(name,name);}return name;}};jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g),function(i,name){var getter=attrHandle[name]||jQuery.find.attr;attrHandle[name]=function(elem,name,isXML){var ret,handle,lowercaseName=name.toLowerCase();if(!isXML){// Avoid an infinite loop by temporarily removing this function from the getter
handle=attrHandle[lowercaseName];attrHandle[lowercaseName]=ret;ret=getter(elem,name,isXML)!=null?lowercaseName:null;attrHandle[lowercaseName]=handle;}return ret;};});var rfocusable=/^(?:input|select|textarea|button)$/i,rclickable=/^(?:a|area)$/i;jQuery.fn.extend({prop:function(name,value){return access(this,jQuery.prop,name,value,arguments.length>1);},removeProp:function(name){return this.each(function(){delete this[jQuery.propFix[name]||name];});}});jQuery.extend({prop:function(elem,name,value){var ret,hooks,nType=elem.nodeType;// Don't get/set properties on text, comment and attribute nodes
if(nType===3||nType===8||nType===2){return;}if(nType!==1||!jQuery.isXMLDoc(elem)){// Fix name and attach hooks
name=jQuery.propFix[name]||name;hooks=jQuery.propHooks[name];}if(value!==undefined){if(hooks&&"set"in hooks&&(ret=hooks.set(elem,value,name))!==undefined){return ret;}return elem[name]=value;}if(hooks&&"get"in hooks&&(ret=hooks.get(elem,name))!==null){return ret;}return elem[name];},propHooks:{tabIndex:{get:function(elem){// Support: IE <=9 - 11 only
// elem.tabIndex doesn't always return the
// correct value when it hasn't been explicitly set
// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
// Use proper attribute retrieval(#12072)
var tabindex=jQuery.find.attr(elem,"tabindex");if(tabindex){return parseInt(tabindex,10);}if(rfocusable.test(elem.nodeName)||rclickable.test(elem.nodeName)&&elem.href){return 0;}return-1;}}},propFix:{"for":"htmlFor","class":"className"}});// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if(!support.optSelected){jQuery.propHooks.selected={get:function(elem){/* eslint no-unused-expressions: "off" */var parent=elem.parentNode;if(parent&&parent.parentNode){parent.parentNode.selectedIndex;}return null;},set:function(elem){/* eslint no-unused-expressions: "off" */var parent=elem.parentNode;if(parent){parent.selectedIndex;if(parent.parentNode){parent.parentNode.selectedIndex;}}}};}jQuery.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){jQuery.propFix[this.toLowerCase()]=this;});// Strip and collapse whitespace according to HTML spec
// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
function stripAndCollapse(value){var tokens=value.match(rnothtmlwhite)||[];return tokens.join(" ");}function getClass(elem){return elem.getAttribute&&elem.getAttribute("class")||"";}jQuery.fn.extend({addClass:function(value){var classes,elem,cur,curValue,clazz,j,finalValue,i=0;if(jQuery.isFunction(value)){return this.each(function(j){jQuery(this).addClass(value.call(this,j,getClass(this)));});}if(typeof value==="string"&&value){classes=value.match(rnothtmlwhite)||[];while(elem=this[i++]){curValue=getClass(elem);cur=elem.nodeType===1&&" "+stripAndCollapse(curValue)+" ";if(cur){j=0;while(clazz=classes[j++]){if(cur.indexOf(" "+clazz+" ")<0){cur+=clazz+" ";}}// Only assign if different to avoid unneeded rendering.
finalValue=stripAndCollapse(cur);if(curValue!==finalValue){elem.setAttribute("class",finalValue);}}}}return this;},removeClass:function(value){var classes,elem,cur,curValue,clazz,j,finalValue,i=0;if(jQuery.isFunction(value)){return this.each(function(j){jQuery(this).removeClass(value.call(this,j,getClass(this)));});}if(!arguments.length){return this.attr("class","");}if(typeof value==="string"&&value){classes=value.match(rnothtmlwhite)||[];while(elem=this[i++]){curValue=getClass(elem);// This expression is here for better compressibility (see addClass)
cur=elem.nodeType===1&&" "+stripAndCollapse(curValue)+" ";if(cur){j=0;while(clazz=classes[j++]){// Remove *all* instances
while(cur.indexOf(" "+clazz+" ")>-1){cur=cur.replace(" "+clazz+" "," ");}}// Only assign if different to avoid unneeded rendering.
finalValue=stripAndCollapse(cur);if(curValue!==finalValue){elem.setAttribute("class",finalValue);}}}}return this;},toggleClass:function(value,stateVal){var type=typeof value;if(typeof stateVal==="boolean"&&type==="string"){return stateVal?this.addClass(value):this.removeClass(value);}if(jQuery.isFunction(value)){return this.each(function(i){jQuery(this).toggleClass(value.call(this,i,getClass(this),stateVal),stateVal);});}return this.each(function(){var className,i,self,classNames;if(type==="string"){// Toggle individual class names
i=0;self=jQuery(this);classNames=value.match(rnothtmlwhite)||[];while(className=classNames[i++]){// Check each className given, space separated list
if(self.hasClass(className)){self.removeClass(className);}else{self.addClass(className);}}// Toggle whole class name
}else if(value===undefined||type==="boolean"){className=getClass(this);if(className){// Store className if set
dataPriv.set(this,"__className__",className);}// If the element has a class name or if we're passed `false`,
// then remove the whole classname (if there was one, the above saved it).
// Otherwise bring back whatever was previously saved (if anything),
// falling back to the empty string if nothing was stored.
if(this.setAttribute){this.setAttribute("class",className||value===false?"":dataPriv.get(this,"__className__")||"");}}});},hasClass:function(selector){var className,elem,i=0;className=" "+selector+" ";while(elem=this[i++]){if(elem.nodeType===1&&(" "+stripAndCollapse(getClass(elem))+" ").indexOf(className)>-1){return true;}}return false;}});var rreturn=/\r/g;jQuery.fn.extend({val:function(value){var hooks,ret,isFunction,elem=this[0];if(!arguments.length){if(elem){hooks=jQuery.valHooks[elem.type]||jQuery.valHooks[elem.nodeName.toLowerCase()];if(hooks&&"get"in hooks&&(ret=hooks.get(elem,"value"))!==undefined){return ret;}ret=elem.value;// Handle most common string cases
if(typeof ret==="string"){return ret.replace(rreturn,"");}// Handle cases where value is null/undef or number
return ret==null?"":ret;}return;}isFunction=jQuery.isFunction(value);return this.each(function(i){var val;if(this.nodeType!==1){return;}if(isFunction){val=value.call(this,i,jQuery(this).val());}else{val=value;}// Treat null/undefined as ""; convert numbers to string
if(val==null){val="";}else if(typeof val==="number"){val+="";}else if(jQuery.isArray(val)){val=jQuery.map(val,function(value){return value==null?"":value+"";});}hooks=jQuery.valHooks[this.type]||jQuery.valHooks[this.nodeName.toLowerCase()];// If set returns undefined, fall back to normal setting
if(!hooks||!("set"in hooks)||hooks.set(this,val,"value")===undefined){this.value=val;}});}});jQuery.extend({valHooks:{option:{get:function(elem){var val=jQuery.find.attr(elem,"value");return val!=null?val:// Support: IE <=10 - 11 only
// option.text throws exceptions (#14686, #14858)
// Strip and collapse whitespace
// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
stripAndCollapse(jQuery.text(elem));}},select:{get:function(elem){var value,option,i,options=elem.options,index=elem.selectedIndex,one=elem.type==="select-one",values=one?null:[],max=one?index+1:options.length;if(index<0){i=max;}else{i=one?index:0;}// Loop through all the selected options
for(;i<max;i++){option=options[i];// Support: IE <=9 only
// IE8-9 doesn't update selected after form reset (#2551)
if((option.selected||i===index)&&// Don't return options that are disabled or in a disabled optgroup
!option.disabled&&(!option.parentNode.disabled||!jQuery.nodeName(option.parentNode,"optgroup"))){// Get the specific value for the option
value=jQuery(option).val();// We don't need an array for one selects
if(one){return value;}// Multi-Selects return an array
values.push(value);}}return values;},set:function(elem,value){var optionSet,option,options=elem.options,values=jQuery.makeArray(value),i=options.length;while(i--){option=options[i];/* eslint-disable no-cond-assign */if(option.selected=jQuery.inArray(jQuery.valHooks.option.get(option),values)>-1){optionSet=true;}/* eslint-enable no-cond-assign */}// Force browsers to behave consistently when non-matching value is set
if(!optionSet){elem.selectedIndex=-1;}return values;}}}});// Radios and checkboxes getter/setter
jQuery.each(["radio","checkbox"],function(){jQuery.valHooks[this]={set:function(elem,value){if(jQuery.isArray(value)){return elem.checked=jQuery.inArray(jQuery(elem).val(),value)>-1;}}};if(!support.checkOn){jQuery.valHooks[this].get=function(elem){return elem.getAttribute("value")===null?"on":elem.value;};}});// Return jQuery for attributes-only inclusion
var rfocusMorph=/^(?:focusinfocus|focusoutblur)$/;jQuery.extend(jQuery.event,{trigger:function(event,data,elem,onlyHandlers){var i,cur,tmp,bubbleType,ontype,handle,special,eventPath=[elem||document],type=hasOwn.call(event,"type")?event.type:event,namespaces=hasOwn.call(event,"namespace")?event.namespace.split("."):[];cur=tmp=elem=elem||document;// Don't do events on text and comment nodes
if(elem.nodeType===3||elem.nodeType===8){return;}// focus/blur morphs to focusin/out; ensure we're not firing them right now
if(rfocusMorph.test(type+jQuery.event.triggered)){return;}if(type.indexOf(".")>-1){// Namespaced trigger; create a regexp to match event type in handle()
namespaces=type.split(".");type=namespaces.shift();namespaces.sort();}ontype=type.indexOf(":")<0&&"on"+type;// Caller can pass in a jQuery.Event object, Object, or just an event type string
event=event[jQuery.expando]?event:new jQuery.Event(type,typeof event==="object"&&event);// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
event.isTrigger=onlyHandlers?2:3;event.namespace=namespaces.join(".");event.rnamespace=event.namespace?new RegExp("(^|\\.)"+namespaces.join("\\.(?:.*\\.|)")+"(\\.|$)"):null;// Clean up the event in case it is being reused
event.result=undefined;if(!event.target){event.target=elem;}// Clone any incoming data and prepend the event, creating the handler arg list
data=data==null?[event]:jQuery.makeArray(data,[event]);// Allow special events to draw outside the lines
special=jQuery.event.special[type]||{};if(!onlyHandlers&&special.trigger&&special.trigger.apply(elem,data)===false){return;}// Determine event propagation path in advance, per W3C events spec (#9951)
// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
if(!onlyHandlers&&!special.noBubble&&!jQuery.isWindow(elem)){bubbleType=special.delegateType||type;if(!rfocusMorph.test(bubbleType+type)){cur=cur.parentNode;}for(;cur;cur=cur.parentNode){eventPath.push(cur);tmp=cur;}// Only add window if we got to document (e.g., not plain obj or detached DOM)
if(tmp===(elem.ownerDocument||document)){eventPath.push(tmp.defaultView||tmp.parentWindow||window);}}// Fire handlers on the event path
i=0;while((cur=eventPath[i++])&&!event.isPropagationStopped()){event.type=i>1?bubbleType:special.bindType||type;// jQuery handler
handle=(dataPriv.get(cur,"events")||{})[event.type]&&dataPriv.get(cur,"handle");if(handle){handle.apply(cur,data);}// Native handler
handle=ontype&&cur[ontype];if(handle&&handle.apply&&acceptData(cur)){event.result=handle.apply(cur,data);if(event.result===false){event.preventDefault();}}}event.type=type;// If nobody prevented the default action, do it now
if(!onlyHandlers&&!event.isDefaultPrevented()){if((!special._default||special._default.apply(eventPath.pop(),data)===false)&&acceptData(elem)){// Call a native DOM method on the target with the same name as the event.
// Don't do default actions on window, that's where global variables be (#6170)
if(ontype&&jQuery.isFunction(elem[type])&&!jQuery.isWindow(elem)){// Don't re-trigger an onFOO event when we call its FOO() method
tmp=elem[ontype];if(tmp){elem[ontype]=null;}// Prevent re-triggering of the same event, since we already bubbled it above
jQuery.event.triggered=type;elem[type]();jQuery.event.triggered=undefined;if(tmp){elem[ontype]=tmp;}}}}return event.result;},// Piggyback on a donor event to simulate a different one
// Used only for `focus(in | out)` events
simulate:function(type,elem,event){var e=jQuery.extend(new jQuery.Event(),event,{type:type,isSimulated:true});jQuery.event.trigger(e,null,elem);}});jQuery.fn.extend({trigger:function(type,data){return this.each(function(){jQuery.event.trigger(type,data,this);});},triggerHandler:function(type,data){var elem=this[0];if(elem){return jQuery.event.trigger(type,data,elem,true);}}});jQuery.each(("blur focus focusin focusout resize scroll click dblclick "+"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave "+"change select submit keydown keypress keyup contextmenu").split(" "),function(i,name){// Handle event binding
jQuery.fn[name]=function(data,fn){return arguments.length>0?this.on(name,null,data,fn):this.trigger(name);};});jQuery.fn.extend({hover:function(fnOver,fnOut){return this.mouseenter(fnOver).mouseleave(fnOut||fnOver);}});support.focusin="onfocusin"in window;// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if(!support.focusin){jQuery.each({focus:"focusin",blur:"focusout"},function(orig,fix){// Attach a single capturing handler on the document while someone wants focusin/focusout
var handler=function(event){jQuery.event.simulate(fix,event.target,jQuery.event.fix(event));};jQuery.event.special[fix]={setup:function(){var doc=this.ownerDocument||this,attaches=dataPriv.access(doc,fix);if(!attaches){doc.addEventListener(orig,handler,true);}dataPriv.access(doc,fix,(attaches||0)+1);},teardown:function(){var doc=this.ownerDocument||this,attaches=dataPriv.access(doc,fix)-1;if(!attaches){doc.removeEventListener(orig,handler,true);dataPriv.remove(doc,fix);}else{dataPriv.access(doc,fix,attaches);}}};});}var location=window.location;var nonce=jQuery.now();var rquery=/\?/;// Cross-browser xml parsing
jQuery.parseXML=function(data){var xml;if(!data||typeof data!=="string"){return null;}// Support: IE 9 - 11 only
// IE throws on parseFromString with invalid input.
try{xml=new window.DOMParser().parseFromString(data,"text/xml");}catch(e){xml=undefined;}if(!xml||xml.getElementsByTagName("parsererror").length){jQuery.error("Invalid XML: "+data);}return xml;};var rbracket=/\[\]$/,rCRLF=/\r?\n/g,rsubmitterTypes=/^(?:submit|button|image|reset|file)$/i,rsubmittable=/^(?:input|select|textarea|keygen)/i;function buildParams(prefix,obj,traditional,add){var name;if(jQuery.isArray(obj)){// Serialize array item.
jQuery.each(obj,function(i,v){if(traditional||rbracket.test(prefix)){// Treat each array item as a scalar.
add(prefix,v);}else{// Item is non-scalar (array or object), encode its numeric index.
buildParams(prefix+"["+(typeof v==="object"&&v!=null?i:"")+"]",v,traditional,add);}});}else if(!traditional&&jQuery.type(obj)==="object"){// Serialize object item.
for(name in obj){buildParams(prefix+"["+name+"]",obj[name],traditional,add);}}else{// Serialize scalar item.
add(prefix,obj);}}// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param=function(a,traditional){var prefix,s=[],add=function(key,valueOrFunction){// If value is a function, invoke it and use its return value
var value=jQuery.isFunction(valueOrFunction)?valueOrFunction():valueOrFunction;s[s.length]=encodeURIComponent(key)+"="+encodeURIComponent(value==null?"":value);};// If an array was passed in, assume that it is an array of form elements.
if(jQuery.isArray(a)||a.jquery&&!jQuery.isPlainObject(a)){// Serialize the form elements
jQuery.each(a,function(){add(this.name,this.value);});}else{// If traditional, encode the "old" way (the way 1.3.2 or older
// did it), otherwise encode params recursively.
for(prefix in a){buildParams(prefix,a[prefix],traditional,add);}}// Return the resulting serialization
return s.join("&");};jQuery.fn.extend({serialize:function(){return jQuery.param(this.serializeArray());},serializeArray:function(){return this.map(function(){// Can add propHook for "elements" to filter or add form elements
var elements=jQuery.prop(this,"elements");return elements?jQuery.makeArray(elements):this;}).filter(function(){var type=this.type;// Use .is( ":disabled" ) so that fieldset[disabled] works
return this.name&&!jQuery(this).is(":disabled")&&rsubmittable.test(this.nodeName)&&!rsubmitterTypes.test(type)&&(this.checked||!rcheckableType.test(type));}).map(function(i,elem){var val=jQuery(this).val();if(val==null){return null;}if(jQuery.isArray(val)){return jQuery.map(val,function(val){return{name:elem.name,value:val.replace(rCRLF,"\r\n")};});}return{name:elem.name,value:val.replace(rCRLF,"\r\n")};}).get();}});var r20=/%20/g,rhash=/#.*$/,rantiCache=/([?&])_=[^&]*/,rheaders=/^(.*?):[ \t]*([^\r\n]*)$/mg,// #7653, #8125, #8152: local protocol detection
rlocalProtocol=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,rnoContent=/^(?:GET|HEAD)$/,rprotocol=/^\/\//,/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */prefilters={},/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */transports={},// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
allTypes="*/".concat("*"),// Anchor tag for parsing the document origin
originAnchor=document.createElement("a");originAnchor.href=location.href;// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports(structure){// dataTypeExpression is optional and defaults to "*"
return function(dataTypeExpression,func){if(typeof dataTypeExpression!=="string"){func=dataTypeExpression;dataTypeExpression="*";}var dataType,i=0,dataTypes=dataTypeExpression.toLowerCase().match(rnothtmlwhite)||[];if(jQuery.isFunction(func)){// For each dataType in the dataTypeExpression
while(dataType=dataTypes[i++]){// Prepend if requested
if(dataType[0]==="+"){dataType=dataType.slice(1)||"*";(structure[dataType]=structure[dataType]||[]).unshift(func);// Otherwise append
}else{(structure[dataType]=structure[dataType]||[]).push(func);}}}};}// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports(structure,options,originalOptions,jqXHR){var inspected={},seekingTransport=structure===transports;function inspect(dataType){var selected;inspected[dataType]=true;jQuery.each(structure[dataType]||[],function(_,prefilterOrFactory){var dataTypeOrTransport=prefilterOrFactory(options,originalOptions,jqXHR);if(typeof dataTypeOrTransport==="string"&&!seekingTransport&&!inspected[dataTypeOrTransport]){options.dataTypes.unshift(dataTypeOrTransport);inspect(dataTypeOrTransport);return false;}else if(seekingTransport){return!(selected=dataTypeOrTransport);}});return selected;}return inspect(options.dataTypes[0])||!inspected["*"]&&inspect("*");}// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend(target,src){var key,deep,flatOptions=jQuery.ajaxSettings.flatOptions||{};for(key in src){if(src[key]!==undefined){(flatOptions[key]?target:deep||(deep={}))[key]=src[key];}}if(deep){jQuery.extend(true,target,deep);}return target;}/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */function ajaxHandleResponses(s,jqXHR,responses){var ct,type,finalDataType,firstDataType,contents=s.contents,dataTypes=s.dataTypes;// Remove auto dataType and get content-type in the process
while(dataTypes[0]==="*"){dataTypes.shift();if(ct===undefined){ct=s.mimeType||jqXHR.getResponseHeader("Content-Type");}}// Check if we're dealing with a known content-type
if(ct){for(type in contents){if(contents[type]&&contents[type].test(ct)){dataTypes.unshift(type);break;}}}// Check to see if we have a response for the expected dataType
if(dataTypes[0]in responses){finalDataType=dataTypes[0];}else{// Try convertible dataTypes
for(type in responses){if(!dataTypes[0]||s.converters[type+" "+dataTypes[0]]){finalDataType=type;break;}if(!firstDataType){firstDataType=type;}}// Or just use first one
finalDataType=finalDataType||firstDataType;}// If we found a dataType
// We add the dataType to the list if needed
// and return the corresponding response
if(finalDataType){if(finalDataType!==dataTypes[0]){dataTypes.unshift(finalDataType);}return responses[finalDataType];}}/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */function ajaxConvert(s,response,jqXHR,isSuccess){var conv2,current,conv,tmp,prev,converters={},// Work with a copy of dataTypes in case we need to modify it for conversion
dataTypes=s.dataTypes.slice();// Create converters map with lowercased keys
if(dataTypes[1]){for(conv in s.converters){converters[conv.toLowerCase()]=s.converters[conv];}}current=dataTypes.shift();// Convert to each sequential dataType
while(current){if(s.responseFields[current]){jqXHR[s.responseFields[current]]=response;}// Apply the dataFilter if provided
if(!prev&&isSuccess&&s.dataFilter){response=s.dataFilter(response,s.dataType);}prev=current;current=dataTypes.shift();if(current){// There's only work to do if current dataType is non-auto
if(current==="*"){current=prev;// Convert response if prev dataType is non-auto and differs from current
}else if(prev!=="*"&&prev!==current){// Seek a direct converter
conv=converters[prev+" "+current]||converters["* "+current];// If none found, seek a pair
if(!conv){for(conv2 in converters){// If conv2 outputs current
tmp=conv2.split(" ");if(tmp[1]===current){// If prev can be converted to accepted input
conv=converters[prev+" "+tmp[0]]||converters["* "+tmp[0]];if(conv){// Condense equivalence converters
if(conv===true){conv=converters[conv2];// Otherwise, insert the intermediate dataType
}else if(converters[conv2]!==true){current=tmp[0];dataTypes.unshift(tmp[1]);}break;}}}}// Apply converter (if not an equivalence)
if(conv!==true){// Unless errors are allowed to bubble, catch and return them
if(conv&&s.throws){response=conv(response);}else{try{response=conv(response);}catch(e){return{state:"parsererror",error:conv?e:"No conversion from "+prev+" to "+current};}}}}}}return{state:"success",data:response};}jQuery.extend({// Counter for holding the number of active queries
active:0,// Last-Modified header cache for next request
lastModified:{},etag:{},ajaxSettings:{url:location.href,type:"GET",isLocal:rlocalProtocol.test(location.protocol),global:true,processData:true,async:true,contentType:"application/x-www-form-urlencoded; charset=UTF-8",/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/accepts:{"*":allTypes,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},// Data converters
// Keys separate source (or catchall "*") and destination types with a single space
converters:{// Convert anything to text
"* text":String,// Text to html (true = no transformation)
"text html":true,// Evaluate text as a json expression
"text json":JSON.parse,// Parse text as xml
"text xml":jQuery.parseXML},// For options that shouldn't be deep extended:
// you can add your own custom options here if
// and when you create one that shouldn't be
// deep extended (see ajaxExtend)
flatOptions:{url:true,context:true}},// Creates a full fledged settings object into target
// with both ajaxSettings and settings fields.
// If target is omitted, writes into ajaxSettings.
ajaxSetup:function(target,settings){return settings?// Building a settings object
ajaxExtend(ajaxExtend(target,jQuery.ajaxSettings),settings):// Extending ajaxSettings
ajaxExtend(jQuery.ajaxSettings,target);},ajaxPrefilter:addToPrefiltersOrTransports(prefilters),ajaxTransport:addToPrefiltersOrTransports(transports),// Main method
ajax:function(url,options){// If url is an object, simulate pre-1.5 signature
if(typeof url==="object"){options=url;url=undefined;}// Force options to be an object
options=options||{};var transport,// URL without anti-cache param
cacheURL,// Response headers
responseHeadersString,responseHeaders,// timeout handle
timeoutTimer,// Url cleanup var
urlAnchor,// Request state (becomes false upon send and true upon completion)
completed,// To know if global events are to be dispatched
fireGlobals,// Loop variable
i,// uncached part of the url
uncached,// Create the final options object
s=jQuery.ajaxSetup({},options),// Callbacks context
callbackContext=s.context||s,// Context for global events is callbackContext if it is a DOM node or jQuery collection
globalEventContext=s.context&&(callbackContext.nodeType||callbackContext.jquery)?jQuery(callbackContext):jQuery.event,// Deferreds
deferred=jQuery.Deferred(),completeDeferred=jQuery.Callbacks("once memory"),// Status-dependent callbacks
statusCode=s.statusCode||{},// Headers (they are sent all at once)
requestHeaders={},requestHeadersNames={},// Default abort message
strAbort="canceled",// Fake xhr
jqXHR={readyState:0,// Builds headers hashtable if needed
getResponseHeader:function(key){var match;if(completed){if(!responseHeaders){responseHeaders={};while(match=rheaders.exec(responseHeadersString)){responseHeaders[match[1].toLowerCase()]=match[2];}}match=responseHeaders[key.toLowerCase()];}return match==null?null:match;},// Raw string
getAllResponseHeaders:function(){return completed?responseHeadersString:null;},// Caches the header
setRequestHeader:function(name,value){if(completed==null){name=requestHeadersNames[name.toLowerCase()]=requestHeadersNames[name.toLowerCase()]||name;requestHeaders[name]=value;}return this;},// Overrides response content-type header
overrideMimeType:function(type){if(completed==null){s.mimeType=type;}return this;},// Status-dependent callbacks
statusCode:function(map){var code;if(map){if(completed){// Execute the appropriate callbacks
jqXHR.always(map[jqXHR.status]);}else{// Lazy-add the new callbacks in a way that preserves old ones
for(code in map){statusCode[code]=[statusCode[code],map[code]];}}}return this;},// Cancel the request
abort:function(statusText){var finalText=statusText||strAbort;if(transport){transport.abort(finalText);}done(0,finalText);return this;}};// Attach deferreds
deferred.promise(jqXHR);// Add protocol if not provided (prefilters might expect it)
// Handle falsy url in the settings object (#10093: consistency with old signature)
// We also use the url parameter if available
s.url=((url||s.url||location.href)+"").replace(rprotocol,location.protocol+"//");// Alias method option to type as per ticket #12004
s.type=options.method||options.type||s.method||s.type;// Extract dataTypes list
s.dataTypes=(s.dataType||"*").toLowerCase().match(rnothtmlwhite)||[""];// A cross-domain request is in order when the origin doesn't match the current origin.
if(s.crossDomain==null){urlAnchor=document.createElement("a");// Support: IE <=8 - 11, Edge 12 - 13
// IE throws exception on accessing the href property if url is malformed,
// e.g. http://example.com:80x/
try{urlAnchor.href=s.url;// Support: IE <=8 - 11 only
// Anchor's host property isn't correctly set when s.url is relative
urlAnchor.href=urlAnchor.href;s.crossDomain=originAnchor.protocol+"//"+originAnchor.host!==urlAnchor.protocol+"//"+urlAnchor.host;}catch(e){// If there is an error parsing the URL, assume it is crossDomain,
// it can be rejected by the transport if it is invalid
s.crossDomain=true;}}// Convert data if not already a string
if(s.data&&s.processData&&typeof s.data!=="string"){s.data=jQuery.param(s.data,s.traditional);}// Apply prefilters
inspectPrefiltersOrTransports(prefilters,s,options,jqXHR);// If request was aborted inside a prefilter, stop there
if(completed){return jqXHR;}// We can fire global events as of now if asked to
// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
fireGlobals=jQuery.event&&s.global;// Watch for a new set of requests
if(fireGlobals&&jQuery.active++===0){jQuery.event.trigger("ajaxStart");}// Uppercase the type
s.type=s.type.toUpperCase();// Determine if request has content
s.hasContent=!rnoContent.test(s.type);// Save the URL in case we're toying with the If-Modified-Since
// and/or If-None-Match header later on
// Remove hash to simplify url manipulation
cacheURL=s.url.replace(rhash,"");// More options handling for requests with no content
if(!s.hasContent){// Remember the hash so we can put it back
uncached=s.url.slice(cacheURL.length);// If data is available, append data to url
if(s.data){cacheURL+=(rquery.test(cacheURL)?"&":"?")+s.data;// #9682: remove data so that it's not used in an eventual retry
delete s.data;}// Add or update anti-cache param if needed
if(s.cache===false){cacheURL=cacheURL.replace(rantiCache,"$1");uncached=(rquery.test(cacheURL)?"&":"?")+"_="+nonce++ +uncached;}// Put hash and anti-cache on the URL that will be requested (gh-1732)
s.url=cacheURL+uncached;// Change '%20' to '+' if this is encoded form body content (gh-2658)
}else if(s.data&&s.processData&&(s.contentType||"").indexOf("application/x-www-form-urlencoded")===0){s.data=s.data.replace(r20,"+");}// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
if(s.ifModified){if(jQuery.lastModified[cacheURL]){jqXHR.setRequestHeader("If-Modified-Since",jQuery.lastModified[cacheURL]);}if(jQuery.etag[cacheURL]){jqXHR.setRequestHeader("If-None-Match",jQuery.etag[cacheURL]);}}// Set the correct header, if data is being sent
if(s.data&&s.hasContent&&s.contentType!==false||options.contentType){jqXHR.setRequestHeader("Content-Type",s.contentType);}// Set the Accepts header for the server, depending on the dataType
jqXHR.setRequestHeader("Accept",s.dataTypes[0]&&s.accepts[s.dataTypes[0]]?s.accepts[s.dataTypes[0]]+(s.dataTypes[0]!=="*"?", "+allTypes+"; q=0.01":""):s.accepts["*"]);// Check for headers option
for(i in s.headers){jqXHR.setRequestHeader(i,s.headers[i]);}// Allow custom headers/mimetypes and early abort
if(s.beforeSend&&(s.beforeSend.call(callbackContext,jqXHR,s)===false||completed)){// Abort if not done already and return
return jqXHR.abort();}// Aborting is no longer a cancellation
strAbort="abort";// Install callbacks on deferreds
completeDeferred.add(s.complete);jqXHR.done(s.success);jqXHR.fail(s.error);// Get transport
transport=inspectPrefiltersOrTransports(transports,s,options,jqXHR);// If no transport, we auto-abort
if(!transport){done(-1,"No Transport");}else{jqXHR.readyState=1;// Send global event
if(fireGlobals){globalEventContext.trigger("ajaxSend",[jqXHR,s]);}// If request was aborted inside ajaxSend, stop there
if(completed){return jqXHR;}// Timeout
if(s.async&&s.timeout>0){timeoutTimer=window.setTimeout(function(){jqXHR.abort("timeout");},s.timeout);}try{completed=false;transport.send(requestHeaders,done);}catch(e){// Rethrow post-completion exceptions
if(completed){throw e;}// Propagate others as results
done(-1,e);}}// Callback for when everything is done
function done(status,nativeStatusText,responses,headers){var isSuccess,success,error,response,modified,statusText=nativeStatusText;// Ignore repeat invocations
if(completed){return;}completed=true;// Clear timeout if it exists
if(timeoutTimer){window.clearTimeout(timeoutTimer);}// Dereference transport for early garbage collection
// (no matter how long the jqXHR object will be used)
transport=undefined;// Cache response headers
responseHeadersString=headers||"";// Set readyState
jqXHR.readyState=status>0?4:0;// Determine if successful
isSuccess=status>=200&&status<300||status===304;// Get response data
if(responses){response=ajaxHandleResponses(s,jqXHR,responses);}// Convert no matter what (that way responseXXX fields are always set)
response=ajaxConvert(s,response,jqXHR,isSuccess);// If successful, handle type chaining
if(isSuccess){// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
if(s.ifModified){modified=jqXHR.getResponseHeader("Last-Modified");if(modified){jQuery.lastModified[cacheURL]=modified;}modified=jqXHR.getResponseHeader("etag");if(modified){jQuery.etag[cacheURL]=modified;}}// if no content
if(status===204||s.type==="HEAD"){statusText="nocontent";// if not modified
}else if(status===304){statusText="notmodified";// If we have data, let's convert it
}else{statusText=response.state;success=response.data;error=response.error;isSuccess=!error;}}else{// Extract error from statusText and normalize for non-aborts
error=statusText;if(status||!statusText){statusText="error";if(status<0){status=0;}}}// Set data for the fake xhr object
jqXHR.status=status;jqXHR.statusText=(nativeStatusText||statusText)+"";// Success/Error
if(isSuccess){deferred.resolveWith(callbackContext,[success,statusText,jqXHR]);}else{deferred.rejectWith(callbackContext,[jqXHR,statusText,error]);}// Status-dependent callbacks
jqXHR.statusCode(statusCode);statusCode=undefined;if(fireGlobals){globalEventContext.trigger(isSuccess?"ajaxSuccess":"ajaxError",[jqXHR,s,isSuccess?success:error]);}// Complete
completeDeferred.fireWith(callbackContext,[jqXHR,statusText]);if(fireGlobals){globalEventContext.trigger("ajaxComplete",[jqXHR,s]);// Handle the global AJAX counter
if(! --jQuery.active){jQuery.event.trigger("ajaxStop");}}}return jqXHR;},getJSON:function(url,data,callback){return jQuery.get(url,data,callback,"json");},getScript:function(url,callback){return jQuery.get(url,undefined,callback,"script");}});jQuery.each(["get","post"],function(i,method){jQuery[method]=function(url,data,callback,type){// Shift arguments if data argument was omitted
if(jQuery.isFunction(data)){type=type||callback;callback=data;data=undefined;}// The url can be an options object (which then must have .url)
return jQuery.ajax(jQuery.extend({url:url,type:method,dataType:type,data:data,success:callback},jQuery.isPlainObject(url)&&url));};});jQuery._evalUrl=function(url){return jQuery.ajax({url:url,// Make this explicit, since user can override this through ajaxSetup (#11264)
type:"GET",dataType:"script",cache:true,async:false,global:false,"throws":true});};jQuery.fn.extend({wrapAll:function(html){var wrap;if(this[0]){if(jQuery.isFunction(html)){html=html.call(this[0]);}// The elements to wrap the target around
wrap=jQuery(html,this[0].ownerDocument).eq(0).clone(true);if(this[0].parentNode){wrap.insertBefore(this[0]);}wrap.map(function(){var elem=this;while(elem.firstElementChild){elem=elem.firstElementChild;}return elem;}).append(this);}return this;},wrapInner:function(html){if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapInner(html.call(this,i));});}return this.each(function(){var self=jQuery(this),contents=self.contents();if(contents.length){contents.wrapAll(html);}else{self.append(html);}});},wrap:function(html){var isFunction=jQuery.isFunction(html);return this.each(function(i){jQuery(this).wrapAll(isFunction?html.call(this,i):html);});},unwrap:function(selector){this.parent(selector).not("body").each(function(){jQuery(this).replaceWith(this.childNodes);});return this;}});jQuery.expr.pseudos.hidden=function(elem){return!jQuery.expr.pseudos.visible(elem);};jQuery.expr.pseudos.visible=function(elem){return!!(elem.offsetWidth||elem.offsetHeight||elem.getClientRects().length);};jQuery.ajaxSettings.xhr=function(){try{return new window.XMLHttpRequest();}catch(e){}};var xhrSuccessStatus={// File protocol always yields status code 0, assume 200
0:200,// Support: IE <=9 only
// #1450: sometimes IE returns 1223 when it should be 204
1223:204},xhrSupported=jQuery.ajaxSettings.xhr();support.cors=!!xhrSupported&&"withCredentials"in xhrSupported;support.ajax=xhrSupported=!!xhrSupported;jQuery.ajaxTransport(function(options){var callback,errorCallback;// Cross domain only allowed if supported through XMLHttpRequest
if(support.cors||xhrSupported&&!options.crossDomain){return{send:function(headers,complete){var i,xhr=options.xhr();xhr.open(options.type,options.url,options.async,options.username,options.password);// Apply custom fields if provided
if(options.xhrFields){for(i in options.xhrFields){xhr[i]=options.xhrFields[i];}}// Override mime type if needed
if(options.mimeType&&xhr.overrideMimeType){xhr.overrideMimeType(options.mimeType);}// X-Requested-With header
// For cross-domain requests, seeing as conditions for a preflight are
// akin to a jigsaw puzzle, we simply never set it to be sure.
// (it can always be set on a per-request basis or even using ajaxSetup)
// For same-domain requests, won't change header if already provided.
if(!options.crossDomain&&!headers["X-Requested-With"]){headers["X-Requested-With"]="XMLHttpRequest";}// Set headers
for(i in headers){xhr.setRequestHeader(i,headers[i]);}// Callback
callback=function(type){return function(){if(callback){callback=errorCallback=xhr.onload=xhr.onerror=xhr.onabort=xhr.onreadystatechange=null;if(type==="abort"){xhr.abort();}else if(type==="error"){// Support: IE <=9 only
// On a manual native abort, IE9 throws
// errors on any property access that is not readyState
if(typeof xhr.status!=="number"){complete(0,"error");}else{complete(// File: protocol always yields status 0; see #8605, #14207
xhr.status,xhr.statusText);}}else{complete(xhrSuccessStatus[xhr.status]||xhr.status,xhr.statusText,// Support: IE <=9 only
// IE9 has no XHR2 but throws on binary (trac-11426)
// For XHR2 non-text, let the caller handle it (gh-2498)
(xhr.responseType||"text")!=="text"||typeof xhr.responseText!=="string"?{binary:xhr.response}:{text:xhr.responseText},xhr.getAllResponseHeaders());}}};};// Listen to events
xhr.onload=callback();errorCallback=xhr.onerror=callback("error");// Support: IE 9 only
// Use onreadystatechange to replace onabort
// to handle uncaught aborts
if(xhr.onabort!==undefined){xhr.onabort=errorCallback;}else{xhr.onreadystatechange=function(){// Check readyState before timeout as it changes
if(xhr.readyState===4){// Allow onerror to be called first,
// but that will not handle a native abort
// Also, save errorCallback to a variable
// as xhr.onerror cannot be accessed
window.setTimeout(function(){if(callback){errorCallback();}});}};}// Create the abort callback
callback=callback("abort");try{// Do send the request (this may raise an exception)
xhr.send(options.hasContent&&options.data||null);}catch(e){// #14683: Only rethrow if this hasn't been notified as an error yet
if(callback){throw e;}}},abort:function(){if(callback){callback();}}};}});// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter(function(s){if(s.crossDomain){s.contents.script=false;}});// Install script dataType
jQuery.ajaxSetup({accepts:{script:"text/javascript, application/javascript, "+"application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(text){jQuery.globalEval(text);return text;}}});// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter("script",function(s){if(s.cache===undefined){s.cache=false;}if(s.crossDomain){s.type="GET";}});// Bind script tag hack transport
jQuery.ajaxTransport("script",function(s){// This transport only deals with cross domain requests
if(s.crossDomain){var script,callback;return{send:function(_,complete){script=jQuery("<script>").prop({charset:s.scriptCharset,src:s.url}).on("load error",callback=function(evt){script.remove();callback=null;if(evt){complete(evt.type==="error"?404:200,evt.type);}});// Use native DOM manipulation to avoid our domManip AJAX trickery
document.head.appendChild(script[0]);},abort:function(){if(callback){callback();}}};}});var oldCallbacks=[],rjsonp=/(=)\?(?=&|$)|\?\?/;// Default jsonp settings
jQuery.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var callback=oldCallbacks.pop()||jQuery.expando+"_"+nonce++;this[callback]=true;return callback;}});// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter("json jsonp",function(s,originalSettings,jqXHR){var callbackName,overwritten,responseContainer,jsonProp=s.jsonp!==false&&(rjsonp.test(s.url)?"url":typeof s.data==="string"&&(s.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&rjsonp.test(s.data)&&"data");// Handle iff the expected data type is "jsonp" or we have a parameter to set
if(jsonProp||s.dataTypes[0]==="jsonp"){// Get callback name, remembering preexisting value associated with it
callbackName=s.jsonpCallback=jQuery.isFunction(s.jsonpCallback)?s.jsonpCallback():s.jsonpCallback;// Insert callback into url or form data
if(jsonProp){s[jsonProp]=s[jsonProp].replace(rjsonp,"$1"+callbackName);}else if(s.jsonp!==false){s.url+=(rquery.test(s.url)?"&":"?")+s.jsonp+"="+callbackName;}// Use data converter to retrieve json after script execution
s.converters["script json"]=function(){if(!responseContainer){jQuery.error(callbackName+" was not called");}return responseContainer[0];};// Force json dataType
s.dataTypes[0]="json";// Install callback
overwritten=window[callbackName];window[callbackName]=function(){responseContainer=arguments;};// Clean-up function (fires after converters)
jqXHR.always(function(){// If previous value didn't exist - remove it
if(overwritten===undefined){jQuery(window).removeProp(callbackName);// Otherwise restore preexisting value
}else{window[callbackName]=overwritten;}// Save back as free
if(s[callbackName]){// Make sure that re-using the options doesn't screw things around
s.jsonpCallback=originalSettings.jsonpCallback;// Save the callback name for future use
oldCallbacks.push(callbackName);}// Call if it was a function and we have a response
if(responseContainer&&jQuery.isFunction(overwritten)){overwritten(responseContainer[0]);}responseContainer=overwritten=undefined;});// Delegate to script
return"script";}});// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument=function(){var body=document.implementation.createHTMLDocument("").body;body.innerHTML="<form></form><form></form>";return body.childNodes.length===2;}();// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML=function(data,context,keepScripts){if(typeof data!=="string"){return[];}if(typeof context==="boolean"){keepScripts=context;context=false;}var base,parsed,scripts;if(!context){// Stop scripts or inline event handlers from being executed immediately
// by using document.implementation
if(support.createHTMLDocument){context=document.implementation.createHTMLDocument("");// Set the base href for the created document
// so any parsed elements with URLs
// are based on the document's URL (gh-2965)
base=context.createElement("base");base.href=document.location.href;context.head.appendChild(base);}else{context=document;}}parsed=rsingleTag.exec(data);scripts=!keepScripts&&[];// Single tag
if(parsed){return[context.createElement(parsed[1])];}parsed=buildFragment([data],context,scripts);if(scripts&&scripts.length){jQuery(scripts).remove();}return jQuery.merge([],parsed.childNodes);};/**
 * Load a url into a page
 */jQuery.fn.load=function(url,params,callback){var selector,type,response,self=this,off=url.indexOf(" ");if(off>-1){selector=stripAndCollapse(url.slice(off));url=url.slice(0,off);}// If it's a function
if(jQuery.isFunction(params)){// We assume that it's the callback
callback=params;params=undefined;// Otherwise, build a param string
}else if(params&&typeof params==="object"){type="POST";}// If we have elements to modify, make the request
if(self.length>0){jQuery.ajax({url:url,// If "type" variable is undefined, then "GET" method will be used.
// Make value of this field explicit since
// user can override it through ajaxSetup method
type:type||"GET",dataType:"html",data:params}).done(function(responseText){// Save response for use in complete callback
response=arguments;self.html(selector?// If a selector was specified, locate the right elements in a dummy div
// Exclude scripts to avoid IE 'Permission Denied' errors
jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector):// Otherwise use the full result
responseText);// If the request succeeds, this function gets "data", "status", "jqXHR"
// but they are ignored because response was set above.
// If it fails, this function gets "jqXHR", "status", "error"
}).always(callback&&function(jqXHR,status){self.each(function(){callback.apply(this,response||[jqXHR.responseText,status,jqXHR]);});});}return this;};// Attach a bunch of functions for handling common AJAX events
jQuery.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(i,type){jQuery.fn[type]=function(fn){return this.on(type,fn);};});jQuery.expr.pseudos.animated=function(elem){return jQuery.grep(jQuery.timers,function(fn){return elem===fn.elem;}).length;};/**
 * Gets a window from an element
 */function getWindow(elem){return jQuery.isWindow(elem)?elem:elem.nodeType===9&&elem.defaultView;}jQuery.offset={setOffset:function(elem,options,i){var curPosition,curLeft,curCSSTop,curTop,curOffset,curCSSLeft,calculatePosition,position=jQuery.css(elem,"position"),curElem=jQuery(elem),props={};// Set position first, in-case top/left are set even on static elem
if(position==="static"){elem.style.position="relative";}curOffset=curElem.offset();curCSSTop=jQuery.css(elem,"top");curCSSLeft=jQuery.css(elem,"left");calculatePosition=(position==="absolute"||position==="fixed")&&(curCSSTop+curCSSLeft).indexOf("auto")>-1;// Need to be able to calculate position if either
// top or left is auto and position is either absolute or fixed
if(calculatePosition){curPosition=curElem.position();curTop=curPosition.top;curLeft=curPosition.left;}else{curTop=parseFloat(curCSSTop)||0;curLeft=parseFloat(curCSSLeft)||0;}if(jQuery.isFunction(options)){// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
options=options.call(elem,i,jQuery.extend({},curOffset));}if(options.top!=null){props.top=options.top-curOffset.top+curTop;}if(options.left!=null){props.left=options.left-curOffset.left+curLeft;}if("using"in options){options.using.call(elem,props);}else{curElem.css(props);}}};jQuery.fn.extend({offset:function(options){// Preserve chaining for setter
if(arguments.length){return options===undefined?this:this.each(function(i){jQuery.offset.setOffset(this,options,i);});}var docElem,win,rect,doc,elem=this[0];if(!elem){return;}// Support: IE <=11 only
// Running getBoundingClientRect on a
// disconnected node in IE throws an error
if(!elem.getClientRects().length){return{top:0,left:0};}rect=elem.getBoundingClientRect();// Make sure element is not hidden (display: none)
if(rect.width||rect.height){doc=elem.ownerDocument;win=getWindow(doc);docElem=doc.documentElement;return{top:rect.top+win.pageYOffset-docElem.clientTop,left:rect.left+win.pageXOffset-docElem.clientLeft};}// Return zeros for disconnected and hidden elements (gh-2310)
return rect;},position:function(){if(!this[0]){return;}var offsetParent,offset,elem=this[0],parentOffset={top:0,left:0};// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
// because it is its only offset parent
if(jQuery.css(elem,"position")==="fixed"){// Assume getBoundingClientRect is there when computed position is fixed
offset=elem.getBoundingClientRect();}else{// Get *real* offsetParent
offsetParent=this.offsetParent();// Get correct offsets
offset=this.offset();if(!jQuery.nodeName(offsetParent[0],"html")){parentOffset=offsetParent.offset();}// Add offsetParent borders
parentOffset={top:parentOffset.top+jQuery.css(offsetParent[0],"borderTopWidth",true),left:parentOffset.left+jQuery.css(offsetParent[0],"borderLeftWidth",true)};}// Subtract parent offsets and element margins
return{top:offset.top-parentOffset.top-jQuery.css(elem,"marginTop",true),left:offset.left-parentOffset.left-jQuery.css(elem,"marginLeft",true)};},// This method will return documentElement in the following cases:
// 1) For the element inside the iframe without offsetParent, this method will return
//    documentElement of the parent window
// 2) For the hidden or detached element
// 3) For body or html element, i.e. in case of the html node - it will return itself
//
// but those exceptions were never presented as a real life use-cases
// and might be considered as more preferable results.
//
// This logic, however, is not guaranteed and can change at any point in the future
offsetParent:function(){return this.map(function(){var offsetParent=this.offsetParent;while(offsetParent&&jQuery.css(offsetParent,"position")==="static"){offsetParent=offsetParent.offsetParent;}return offsetParent||documentElement;});}});// Create scrollLeft and scrollTop methods
jQuery.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(method,prop){var top="pageYOffset"===prop;jQuery.fn[method]=function(val){return access(this,function(elem,method,val){var win=getWindow(elem);if(val===undefined){return win?win[prop]:elem[method];}if(win){win.scrollTo(!top?val:win.pageXOffset,top?val:win.pageYOffset);}else{elem[method]=val;}},method,val,arguments.length);};});// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each(["top","left"],function(i,prop){jQuery.cssHooks[prop]=addGetHookIf(support.pixelPosition,function(elem,computed){if(computed){computed=curCSS(elem,prop);// If curCSS returns percentage, fallback to offset
return rnumnonpx.test(computed)?jQuery(elem).position()[prop]+"px":computed;}});});// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each({Height:"height",Width:"width"},function(name,type){jQuery.each({padding:"inner"+name,content:type,"":"outer"+name},function(defaultExtra,funcName){// Margin is only for outerHeight, outerWidth
jQuery.fn[funcName]=function(margin,value){var chainable=arguments.length&&(defaultExtra||typeof margin!=="boolean"),extra=defaultExtra||(margin===true||value===true?"margin":"border");return access(this,function(elem,type,value){var doc;if(jQuery.isWindow(elem)){// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
return funcName.indexOf("outer")===0?elem["inner"+name]:elem.document.documentElement["client"+name];}// Get document width or height
if(elem.nodeType===9){doc=elem.documentElement;// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
// whichever is greatest
return Math.max(elem.body["scroll"+name],doc["scroll"+name],elem.body["offset"+name],doc["offset"+name],doc["client"+name]);}return value===undefined?// Get width or height on the element, requesting but not forcing parseFloat
jQuery.css(elem,type,extra):// Set width or height on the element
jQuery.style(elem,type,value,extra);},type,chainable?margin:undefined,chainable);};});});jQuery.fn.extend({bind:function(types,data,fn){return this.on(types,null,data,fn);},unbind:function(types,fn){return this.off(types,null,fn);},delegate:function(selector,types,data,fn){return this.on(types,selector,data,fn);},undelegate:function(selector,types,fn){// ( namespace ) or ( selector, types [, fn] )
return arguments.length===1?this.off(selector,"**"):this.off(types,selector||"**",fn);}});jQuery.parseJSON=JSON.parse;// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.
// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
if(typeof define==="function"&&define.amd){define("jquery",[],function(){return jQuery;});}var// Map over jQuery in case of overwrite
_jQuery=window.jQuery,// Map over the $ in case of overwrite
_$=window.$;jQuery.noConflict=function(deep){if(window.$===jQuery){window.$=_$;}if(deep&&window.jQuery===jQuery){window.jQuery=_jQuery;}return jQuery;};// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if(!noGlobal){window.jQuery=window.$=jQuery;}return jQuery;});
});

//window.$ = $;

var apodData;
var apodStartDate = moment("1996-06-16");
var todayDate = moment();

// ajax query object for APOD API
var ajaxSettings = {
    url: "https://api.nasa.gov/planetary/apod?api_key=",
    success: function success(result) {
        apodData = result;
        //console.log(JSON.stringify(apodData));
        updateDOM(apodData);
    }
};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBcSUvpRjeWIpz3aOWegvo7ELchZRPRU7w",
    authDomain: "apod-app.firebaseapp.com",
    databaseURL: "https://apod-app.firebaseio.com",
    storageBucket: "apod-app.appspot.com",
    messagingSenderId: "235809363063"
};
firebaseBrowser.initializeApp(config);

// update ajaxSetting object's url to get previous day's data
jquery$1('#prev').click(prev);

// update ajaxSetting object's url to get previous day's data
jquery$1('#next').click(next);

// enable left and right arrow key use
// like buttons
jquery$1(document).keydown(function (e) {
    //console.log(e.keyCode);
    if (e.keyCode === 37) {
        prev(e);
    } else if (e.keyCode == 39) {
        next(e);
    }
});

// go to the next date
function next(e) {
    e.preventDefault();
    checkDateRange();
    if (!jquery$1("#next").prop("disabled")) {
        var nextDate = moment(apodData.date).add(1, 'd');
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + nextDate.format("YYYY-MM-DD");
        jquery$1.ajax(ajaxSettings).fail(function (xhr) {
            console.log("ERROR: " + xhr.status + ". Skipping bad date.");
            if (xhr.status === 500) {
                skipDate(nextDate, "forward");
            }
        });
    }
}

// go to the previous date
function prev(e) {
    e.preventDefault();
    checkDateRange();
    if (!jquery$1("#prev").prop("disabled")) {
        var prevDate = moment(apodData.date).subtract(1, 'd');
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + prevDate.format("YYYY-MM-DD");
        jquery$1.ajax(ajaxSettings).fail(function (xhr) {
            console.log("ERROR: " + xhr.status + ". Skipping bad date.");
            if (xhr.status === 500) {
                skipDate(prevDate, "backward");
            }
        });
    }
}

// skip bad dates that produce error 500 Internal Server Error
function skipDate(date, direction) {
    if (direction === 'backward') {
        var prevDate = date.subtract(1, 'd');
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + prevDate.format("YYYY-MM-DD");
        jquery$1.ajax(ajaxSettings);
    } else if (direction === "forward") {
        var nextDate = date.add(1, 'd');
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + nextDate.format("YYYY-MM-DD");
        jquery$1.ajax(ajaxSettings);
    }
}

// disable buttons if next or prev date is beyond the current
// date or before the APOD birthday.
function checkDateRange() {
    var nextDate = moment(apodData.date).add(1, 'd');
    var prevDate = moment(apodData.date).subtract(1, 'd');
    if (nextDate >= todayDate) {
        jquery$1("#next").prop("disabled", true);
    } else {
        jquery$1("#next").prop("disabled", false);
    }

    if (prevDate <= apodStartDate) {
        jquery$1("#prev").prop("disabled", true);
    } else {
        jquery$1("#prev").prop("disabled", false);
    }
}

// updateDOM inserts apodData into the DOM
function updateDOM(apodData) {
    jquery$1('#spinner').addClass('is-active');
    checkDateRange();
    var httpsStr = "https://" + apodData.url.match(/[^http:\/\/].+/);
    // if there is a HD image available use that as anchor
    if (apodData.hasOwnProperty('hdurl')) {
        var httpsStrHD = "https://" + apodData.hdurl.match(/[^http:\/\/].+/);
    } else {
        // otherwise use the standard one
        httpsStrHD = httpsStr;
    }

    jquery$1('#title').html(apodData.title);

    if (apodData.media_type === 'image') {
        jquery$1('#media').html('<a href=' + httpsStrHD + ' target="_blank"><img id="apod-image" src=' + httpsStr + '></a>');
        jquery$1('#apod-image').on('load', function () {
            jquery$1("#spinner").removeClass("is-active");
        });
    } else if (apodData.media_type === 'video' && apodData.url.match(/https:\/\//) == "https://") {
        jquery$1('#media').html('<iframe id="ytplayer" type="text/html" width="400" height="400"' + 'src = ' + apodData.url + ' frameborder = "0">< / iframe > ');
        jquery$1('#ytplayer').on('load', function () {
            jquery$1("#spinner").removeClass("is-active");
        });
    } else {
        jquery$1('#media').addClass('http-media');
        jquery$1('#media').html('<a href=' + apodData.url + ' target="_blank" class="http-link"><p>Click here to open media.</p></a>');
        jquery$1('#support').text("");
    }
    // credit author if not public domain
    if (apodData.hasOwnProperty('copyright')) {
        jquery$1('#support').html("Image credit and copyright: " + apodData.copyright);
    } else {
        jquery$1('#support').html(" ");
    }

    jquery$1('#apod-date').html(moment(apodData.date).format("L"));
    jquery$1('#explanation').html('<p>' + apodData.explanation + '</p>');
}

function initApp() {
    // Listening for auth state changes.
    // [START authstatelistener]
    firebaseBrowser.auth().onAuthStateChanged(function (user) {
        if (user) {
            // user is signed in
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var keyData = "not set";
            // api key from database
            var keyRef = firebaseBrowser.database().ref('/');
            keyRef.once('value').then(function (dataSnapshot) {
                keyData = dataSnapshot.val().api_key;
                ajaxSettings.url += keyData + "&date=" + moment().format("YYYY-MM-DD");
                // make ajax call to NASA APOD API
                jquery$1.ajax(ajaxSettings);
                //console.log(keyData);
                // [START signout]
                firebaseBrowser.auth().signOut();
                // [END signout]
            });
        } else {
                // Fires before signin and after signout
                //console.log("Waiting for auth!");
            }
    });
    // [END authstatelistener]
    // [START authanon]
    firebaseBrowser.auth().signInAnonymously().catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/operation-not-allowed') {
            alert('You must enable Anonymous auth in the Firebase Console.');
        } else {
            console.error(error);
        }
        // [END_EXCLUDE]
    });
    // [END authanon]
}

window.onload = function () {
    initApp();
};

}());
