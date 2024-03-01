import jsdom from "jsdom";

/**
 * Splits the HTML Document's body into H1 Groups. An H1 group is defined
 * to be an H1 element plus all the sibling elements below it until the next H1 element
 * @param fullHTMLString The HTML string to parse into H1 Groups
 * @returns JSON data separated on the H1 Groups
 */
export const getH1GroupsFromHTML = (fullHTMLDocument: string) => {
  const dom = new jsdom.JSDOM(fullHTMLDocument);
  const body = dom.window.document.body;

  if (body == null) {
    return;
  }

  const children = body.childNodes;
  const groups = [];
  let currGroup: string[] = [];
  let previousH1Element: ChildNode | null = null;
  for (const child of children) {
    if (child.nodeName == "H1") {
      // group everything from the previous H1 element to the element before this H1 element
      if (previousH1Element != null) {
        groups.push({
          title: previousH1Element.textContent,
          content: currGroup.join(""),
        });
      }
      previousH1Element = child;
      currGroup = [] as string[];
    }
    // Create temporary parent element to get the string of the current child
    const tmp = dom.window.document.createElement("div");
    tmp.appendChild(child.cloneNode());
    const htmlString = tmp.innerHTML;

    currGroup.push(htmlString);
  }
  groups.push({
    title: previousH1Element?.textContent,
    content: currGroup.join(""),
  });

  // Filter out groups that is simply the table of contents or has an empty title
  const finalAnnouncements = groups.filter((group) => {
    return (
      group.title &&
      group.title.length > 0 &&
      !group.title.toLowerCase().includes("table of contents")
    );
  });

  return finalAnnouncements;
};
