
# viewjs-custom-element

Allows defined views to be registered as custom elements.

```js
var MyView = view.define({
  name: 'my-view'
}).register();
```

After registration `MyView` can be treated as a normal CustomElement.

```js
var myView = document.createElement('my-view');
```

or

```js
var myView = new MyView();
```

or

```html
<my-view></my-view>
```

```js
var myView = document.querySelector('my-view');
```





