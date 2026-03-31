const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host([active]:not([disabled])) li {
    background-color:rgba(213, 220, 238, 1);
  }
  :host([disabled]) li {
    a, label {
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

      .icon {
        width:18px;
        margin-right:5px;
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
    
  }
`);

export default class MenuElement extends HTMLElement {

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
  }

}