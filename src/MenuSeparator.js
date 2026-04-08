const style =  new CSSStyleSheet();

style.replaceSync(/*css*/ `
  li {
    border-bottom:1px solid #ccc;
    width:100%;
  }
`);

const template = document.createElement("template");

template.innerHTML = `
  <li role="separator"></li>
`

export default class MenuSeparator extends HTMLElement {

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
    root.append(template.content.cloneNode(true));
  }
}

