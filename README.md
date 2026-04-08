# desktop-menu
Web components for desktop app menus. This is a **WORK IN PROGRESS**.

### Demo
[http://yannickbochatay.github.io/desktop-menu/docs](http://yannickbochatay.github.io/desktop-menu/docs)

### Example
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Desktop menu</title>
    <script src="https://cdn.jsdelivr.net/npm/desktop-menu@1" type="module"></script>
  </head>
  <body>
    <menu-bar>
      <menu-bar-item>
        <span>File</span>
        <menu-list slot="menu">
          <menu-item shortcut="Ctrl+A" id="selectAll">
            <img src="img/icon.svg" alt="linux icon" slot="icon"/>
            aaaaa
          </menu-item>
          <menu-item disabled>bbbbb</menu-item>
          <menu-checkbox id="checkbox">hhhhh</menu-checkbox>
          <menu-checkbox disabled>jjjjjj</menu-checkbox>
          <menu-separator></menu-separator>
          <menu-item>
            ccccc
            <menu-list slot="menu">
              <menu-item>ddddd</menu-item>
              <menu-item>
                eeeee
                <menu-list slot="menu">
                  <menu-item>fffff</menu-item>
                  <menu-item>ggggg</menu-item>
                </menu-list>
              </menu-item>
            </menu-list>
          </menu-item>
        </menu-list>
      </menu-bar-item>
      <menu-bar-item>
        Edition
        <menu-list slot="menu">
          <menu-item shortcut="Ctrl+A">
            <img src="img/icon.svg" alt="linux icon" slot="icon"/>
            aaaaa
          </menu-item>
          <menu-item disabled>bbbbb</menu-item>
          <menu-checkbox>hhhhh</menu-checkbox>
          <menu-checkbox disabled>jjjjjj</menu-checkbox>
        </menu-list>
      </menu-bar-item>
    </menu-bar>
  </body>
</html>
```
```
