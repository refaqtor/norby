norby
=====

Call your Ruby classes from node.js

## To install

Prerequisites:

    * node.js >= 0.10
    * ruby > = 1.9

Install using npm:

```sh
npm install norby
```

Compile from repository:

```sh
git clone REPO
npm install
```

Run unit tests:
```sh
npm test
```

## How to use

```js
var ruby = require('norby');

var Time = ruby.getClass('Time');
var t = new Time(2014, 7, 2);
console.log('Year: ' + t.year()); // => 'Year: 2014'
console.log(t); // => '2014-07-02 00:00:00 -0400'
```

## What's missing

norby is currently in an early beta state. Check back for updates as features
are implemented.

 - Windows support. node.js is built with Visual Studio while most Windows Ruby
   installers use [MinGW](http://www.mingw.org). It may work if you build Ruby
   with VS, but I haven't tried it yet.
 - Support for Ruby version 1.8.X
 - Support for Ruby hashes
 - Conversion of JS objects (that aren't wrapped Ruby objects)
 - Support for Ruby modules (as well as including/extending)
 - Support for Ruby structs
 - Support for Ruby class constants
 - Support for Ruby global variables

## API

### ruby

  Exposed by `require('norby')`.
  
### ruby#require(name:String)

  Calls Ruby's [require](http://www.ruby-doc.org/core/Kernel.html#method-i-require)
  function with the specified `name`.
  
### ruby#eval(code:String)
  
  Evaluates the Ruby expression(s) in `code`.

### ruby#getClass(name:String)

  Returns a wrapped Ruby class specified by `name`. The `new` class method will
  be called when the constructor is called.
  
```js
var Time = ruby.getClass('Time');
var t = new Time(2014, 7, 2);
```
  
  To get a class within a module, separate the module and class with `::`.
  
```js
var ZlibInflate = ruby.getClass('Zlip::Inflate');
```

  Class methods are exposed as properties of the constructor.

```js
var Time = ruby.getClass('Time');
var t = Time.utc(2014, 7, 2);
```

### ruby#newInstance(className:String[, …])

  Returns a new instance of a ruby object specified by `className`. Any
  additional arguments will be passed on to the class's   `new` method.

```js
var t = ruby.newInstance('Time', 2014, 7, 2);
```

### ruby#inherits(derived:Constructor, superName:String)
  
  Creates a new Ruby class (named `derived.name`) who's superclass is specified
  by `superName`. All public instance methods of `superName` will be added to
  the derived class's prototype. To add methods to the derived class, call its
  `defineMethod` function. This will add the method to the class's prototype and
  override the Ruby superclass's method. Adding the method to the prototype only
  will fail to override the superclass's method.

```ruby
# base.rb
class Base
  def call_me
  end
  def make_call
    call_me
  end
end
```
```js
ruby.require('./base');

function Derived() {
  Derived.super_.apply(this, arguments);
  this.val = 'Hello';
}
ruby.inherits(Derived, 'Base');

Derived.defineMethod('call_me', function() {
  console.log('In JS: ' + this.val);
});

var d = new Derived();
d.make_call(); // => 'In JS: Hello'
```

### ruby#getFunction(name:String)
**TODO:** Should we call them methods? Should they be global?
  
  Returns a JS function that wraps the ruby function specified by `name`.

```ruby
# hello.rb
def my_func (name)
  puts "Hello, #{name}!"
end
```
```js
ruby.require('./hello');
var my_func = ruby.getFunction('my_func');
my_func('Stan');
```

### ruby#getConstant(name:String)
  
  Returns the ruby constant specified by `name`
  (i.e. an [Object](http://www.ruby-doc.org/core/Object.html) constant).
  
```js
var RUBY_VERSION = ruby.getConstant('RUBY_VERSION');
```

## Ruby objects

### Methods

Wrapped Ruby objects expose their public instance methods through function
properties.

```js
var Time = ruby.getClass('Time');
var t = new Time(2014, 7, 2);
console.log(t.year()); // => '2014'
```

The Ruby `to_s` method is mapped to the JS `toString()` function.

```js
console.log(t.toString()); // => '2014-07-02 00:00:00 -0400'
```

Since node's `console.log()` function calls `inspect` with  a `depth` argument,
it is ignored when passed to the Ruby `inspect` method.

```js
console.log(t); // => '2014-07-02 00:00:00 -0400'
```

### Blocks

If the last argument in a method call is a function, it is passed to the method
as a Ruby block.

```js
var Regexp = ruby.getClass('Regexp');
var pat = new Regexp('.at');
pat.match('cat', function() {
  console.log('match!');
}); // => 'match!'
```

## Type conversion

### From node

#### `null` and `undefined`

Are converted to `nil`.

#### booleans

Are converted to Ruby booleans.

#### numbers

If the number can be determined to be an integer (`v8::Value::IsInt32()`), it's
converted to a Ruby `Fixnum`. Otherwise, it's converted to a `Float`.

#### arrays

Are converted to Ruby arrays. Their contents are recursively converted.

#### strings

Are converted to Ruby strings.

#### Ruby objects

Wrapped Ruby objects are unwrapped.

### From Ruby

#### `nil`

Is converted to `undefined`.

#### booleans

Are converted to JS booleans.

#### `Float`s

Are converted to JS numbers.

#### `Fixnum`s

Are converted to JS numbers. Keep in mind that JS stores numbers as double
precision floating point numbers, meaning that `FIxnum`s (and `Bignum`s) will
lose precision above 2<sup>53</sup>.

#### `Bignum`s

Are converted to JS numbers. See the above note about precision.

#### arrays

Are converted to JS arrays. Their contents are recursively converted.

#### strings

Are converted to JS strings.

#### `Symbol`s

Are converted to JS strings.

#### Ruby objects

Are wrapped as JS objects.

#### Ruby exceptions

Are caught within norby native code, converted to v8 exceptions and rethrown.
The thrown v8 exceptions have a `rubyStack` property that holds the result of
calling `Exception#backtrace` on the original Ruby exceptions.

## License

The MIT License (MIT)

Copyright (c) 2014 Rylan Collins

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
THE SOFTWARE.
