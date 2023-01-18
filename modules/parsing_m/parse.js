import fetch from "node-fetch";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

async function valueFromPage(address, tagName) {
  try {
    const response = await fetch(address);
    const text = await response.text();
    const dom = new JSDOM(text).window.document;
    return dom.querySelector(tagName).textContent.trim();    
  } catch (err) {
    //console.log(err.message)
    return undefined;
  }


}

export { valueFromPage };
