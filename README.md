# aria-menus
Full accessible menus, context menus, menu bars and menu buttons, according to the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/).

**⚠️ WORK IN PROGRESS**

### Demo
[http://yannickbochatay.github.io/aria-menus/docs](http://yannickbochatay.github.io/aria-menus/docs)

### Example
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Desktop menu</title>
    <script src="https://cdn.jsdelivr.net/npm/aria-menus" type="module"></script>
  </head>
  <body>
    <menu-list>
      <menu-item>
        Simple menu item
      </menu-item>
      <menu-item>
        <a href="#">Link menu item</a>
      </menu-item>
      <menu-item disabled>
        Disabled menu item
      </menu-item>
      <menu-item info="Ctrl+F">
        Menu item with info
      </menu-item>
      <menu-item>
        <span slot="icon">☯</span>
        Menu item with symbol icon
      </menu-item>
      <menu-item>
        <img
          src="img/icon.svg"
          alt="tux icon"
          slot="icon"
        >
        Menu item with image icon
      </menu-item>
      <menu-item>
        Menu item with submenu
        <menu-list slot="menu">
          <menu-item>sub item 1</menu-item>
          <menu-item>sub item 2</menu-item>
        </menu-list>
      </menu-item>
    </menu-list>
  </body>
</html>
```