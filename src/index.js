import * as components from "./components.js";
export * from "./components.js";

customElements.define("menu-item", components.MenuItem);
customElements.define("menu-item-link", components.MenuLink);
customElements.define("menu-item-sub", components.MenuSub);
customElements.define("menu-item-checkbox", components.MenuCheckbox);
customElements.define("menu-item-radio", components.MenuRadio);
customElements.define("menu-button", components.MenuButton);
customElements.define("menu-separator", components.MenuSeparator);
customElements.define("menu-list", components.MenuList);
customElements.define("menu-bar", components.MenuBar);
customElements.define("menu-context", components.MenuContext);
