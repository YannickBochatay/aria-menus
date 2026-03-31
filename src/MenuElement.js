const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host([active]:not([disabled])) li {
    background-color:rgba(213, 220, 238, 1);
  }
  :host([disabled]) li {
    .label {
      opacity:0.7;
      font-style:italic;
      cursor:not-allowed;
    }
  }
  ::slotted([slot=icon]) {
    width:18px;
    vertical-align:middle;
  }
  li {
    margin:0;
    padding:2px 5px;
    position:relative;
    width:100%;
    box-sizing:border-box;
    display:flex;
    align-items:center;

    a {
      text-decoration:none;
      color:inherit;
      display:flex;
      align-items:baseline;
      cursor:default;
      flex:1;

      &:focus {
        outline:none;
      }
    }

    .icon {
      width:18px;
      margin:0 5px 0 0;
      display:inline-block;
    }
    
    .label {
      margin-right:15px;
      white-space:nowrap;
      flex:1;
    }

    .shortcut {
      opacity:0.7;
      font-size:0.9rem;
    }
  }
`);

export default class MenuElement extends HTMLElement {

  static observedAttributes = ["active", "label"];

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(bool) {
    if (bool) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }

  get label() {
    return this.getAttribute("label");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "active") {
      if (value != null) this.shadowRoot.querySelector(".focusedElmt").focus();
    } else if (prop === "label") {
      this.shadowRoot.querySelector(".label").textContent = this.label;
    }
  }
}