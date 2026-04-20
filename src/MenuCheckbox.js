import MenuInput from "./MenuInput.js";

export const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  [aria-checked=true] .icon::before {
    content:"✓";
  }
`);

export default class MenuCheckbox extends MenuInput {

  constructor() {
    super();
    this.shadowRoot.querySelector("[role^=menuitem]").setAttribute("role", "menuitemcheckbox");
    this.shadowRoot.adoptedStyleSheets.push(style);
  }
}
