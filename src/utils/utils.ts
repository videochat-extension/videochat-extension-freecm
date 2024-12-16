export function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes: { [key: string]: any } = {},
    children: (HTMLElement | string)[] = []
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'string') {
            element.setAttribute('style', value);
        } else if (key === 'className') {
            element.className = value;
        } else if (key === 'innerText') {
            element.innerText = value;
        } else {
            element.setAttribute(key, value);
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
}
