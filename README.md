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
    <dkt-menu>
      <dkt-item label="Toto"></dkt-item>
      <dkt-item label="Tata"></dkt-item>
      <dkt-separator></dkt-separator>
      <dkt-item label="Titi">
        <dkt-menu>
          <dkt-item label="Tutu"></dkt-item>
          <dkt-item label="Tete">
            <dkt-menu>
              <dkt-item label="Tutu"></dkt-item>
              <dkt-item label="Tete"></dkt-item>
            </dkt-menu>
          </dkt-item>
        </dkt-menu>
      </dkt-item>
    </dkt-menu>
  </body>
</html>
```
```
