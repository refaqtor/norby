var bindings = require('bindings')('norby.node')(getCtor),
    util = require("util");

module.exports.newInstance = function() {
  var Cls = getClass(arguments[0]);
  return new (Cls.bind.apply(Cls, arguments))();
};

function getCtor(RubyClass) {
  function Cls() {
    this._rubyObj = new RubyClass(this, arguments);
  }
  
  // TODO: Is there a better/faster way to do this? Can we cache these protos?
  function proxyFunc(func) {
    return function() {
      return func.apply(this._rubyObj, arguments);
    };
  }
  
  Object.getOwnPropertyNames(RubyClass.prototype).forEach(function(key) {
    if (typeof RubyClass.prototype[key] === 'function')
      Cls.prototype[key] = proxyFunc(RubyClass.prototype[key]);
  });
  
  Object.getOwnPropertyNames(RubyClass).forEach(function(key) {
    if (typeof RubyClass[key] === 'function')
      Cls[key] = RubyClass[key].bind(RubyClass);
  });
  
  if (typeof Cls.prototype.to_s === 'function') {
    Cls.prototype.toString = Cls.prototype.to_s;
  }
  
  if (typeof Cls.prototype.inspect === 'function') {
    Cls.prototype.inspect = function(depth) {
      return this._rubyObj.inspect();
    };
  }
  
  return Cls;
}

var getClass = module.exports.getClass = function(name) {
  var RubyClass = bindings._getClass(name);
  
  return getCtor(RubyClass);
};

module.exports.inherits = function(ctor, superName) {
  var RubyClass = bindings._defineClass(ctor.name, superName);
  var SuperCtor = getCtor(RubyClass);
  
  // TODO: Do class methods work here? Should they even work?
  
  util.inherits(ctor, SuperCtor);
  
  ctor.defineMethod = function(name, fn) {
    RubyClass._defineMethod(name, fn);
    this.prototype[name] = fn;
  };
};

module.exports.require = bindings.getMethod('require');
//module.exports.eval = bindings.eval;
module.exports.eval = bindings.getMethod('eval');
module.exports.getMethod = bindings.getMethod;
module.exports.getConstant = bindings.getConstant;
