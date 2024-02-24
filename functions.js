/* Get all curent active tabs of current active window and organize each of them in
an object of relevant informations.
*/
export const getTabs = (callback) => {
  chrome.tabs.query({ currentWindow: true }, (allTabs) => {
    const tabsData = allTabs.map((tab) => {
      return {
        id: tab.id,
        title: tab.title,
        url: tab.url,
      };
    });
    callback(tabsData);
  });
};

/* Search for the domain in the current active tab url and create a new url to
fetch the current tab favicon and display it.
*/
export const getFavicon = (url) => {
  const domain = url.match(/^https?:\/\/(?:www\.)?(.*?)\//);
  const size = 24;
  const faviconURL = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  document.getElementById("favicon").src = faviconURL;
};

// Save all the current tabs of active window under the name chosen by the user.
export const saveSession = (name, data) => {
  chrome.storage.local.set({ [name]: data }).then(() => {
    console.log(`Session saved: Name - ${name}, Data -`, data);
  });
};

// Delete a single session with a click on its delete symbole.
const removeSession = (id) => {
  const childSvg = document.getElementById(`${id}`);
  const parentBox = childSvg.parentNode;
  const parentString = parentBox.textContent;

  const key = parentString.replace(/.*tabs/, "");

  chrome.storage.local.remove([key], () => {
    console.log("storage deleted");
  });
  const box = document.getElementById(`${parentBox.id}`);
  box.remove();
};

// Get the current active tab of the current active window.
const getCurrentTab = (callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const tabInfo = {
      id: tab.id,
      title: tab.title,
      url: tab.url,
    };
    callback(tabInfo);
  });
};

// Retrieve the existing session in local storage.
const getSession = (key, callback) => {
  chrome.storage.local.get([key], (result) => {
    callback(result[key]);
  });
};

// Update a session abd saved it.
const updateSession = (key, data) => {
  const newSession = {};
  newSession[key] = data;
  chrome.storage.local.set(newSession, () => {
    console.log("session updated with new tab");
  });
};

// Modify the retrieved session by adding the new tab information.
const addTabToSession = (id) => {
  getCurrentTab((tabInfo) => {
    const childSvg = document.getElementById(`${id}`);
    const parentBox = childSvg.parentNode;
    const bugKey = parentBox.textContent;
    const spaceKey = bugKey.replace(/.*tabs/, "");
    const key = spaceKey.trim();
    console.log("key :", key);

    getSession(key, (oldData) => {
      console.log("key in getSession :", key);
      console.log("oldData :", oldData);
      const updatedData = [...oldData, tabInfo];
      updateSession(key, updatedData);
    });
  });
};

// Keep the number of tabs inside a saved session up to date and displayed.
const refreshNumOfTabs = (event) => {
  const svg = event.target;
  const svgId = svg.id;
  const svgIdNumber = svgId.replace(/\D/g, "");
  const numOfTabId = `numOfTab${svgIdNumber}`;
  const thisNumOfTab = document.getElementById(`${numOfTabId}`);
  const currentNumber = parseInt(thisNumOfTab.innerText.match(/\d+/)[0], 10);
  thisNumOfTab.innerHTML = ` | ${currentNumber + 1} tabs`;
};

// Create a svg button to update the clicked session with all the current tabs of the active window.
const createSVGUpdate = (element) => {
  // Create the SVG element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  // Set attributes for the SVG element
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("x", "0px");
  svg.setAttribute("y", "0px");
  svg.setAttribute("width", "30");
  svg.setAttribute("height", "30");
  svg.setAttribute("viewBox", "0 0 30 30");

  // Create the <path> element with its attributes
  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute(
    "d",
    "M15 3C8.9134751 3 3.87999 7.5533546 3.1132812 13.439453A1.0001 1.0001 0 1 0 5.0957031 13.697266C5.7349943 8.7893639 9.9085249 5 15 5C17.766872 5 20.250574 6.1285473 22.058594 7.9414062L20 10L26 11L25 5L23.470703 6.5292969C21.300701 4.3575454 18.309289 3 15 3zM25.912109 15.417969A1.0001 1.0001 0 0 0 24.904297 16.302734C24.265006 21.210636 20.091475 25 15 25C11.977904 25 9.2987537 23.65024 7.4648438 21.535156L9 20L3 19L4 25L6.0488281 22.951172C8.2452659 25.422716 11.436061 27 15 27C21.086525 27 26.12001 22.446646 26.886719 16.560547A1.0001 1.0001 0 0 0 25.912109 15.417969z"
  );

  // Append the <path> element to the SVG
  svg.appendChild(pathElement);

  svg.setAttribute("class", "svgUpdate");
  svg.setAttribute("id", `svgUpdate${idIncrement}`);

  svg.addEventListener("click", (event) => {
    event.stopPropagation();
    getTabs((tabsData) => {
      console.log("all current tabs : ", tabsData);
      // update the innerText | (x) tabs
      const svgId = svg.id;
      const index = svgId.replace("svgUpdate", "");
      const numOfTab = document.getElementById(`numOfTab${index}`);
      numOfTab.innerHTML = `  |  ${tabsData.length} tabs`;

      // get the session's key of svgUpdate click
      const childSvg = document.getElementById(svg.id);
      const parentBox = childSvg.parentNode;
      const bugKey = parentBox.textContent;
      const spaceKey = bugKey.replace(/.*tabs/, "");
      const key = spaceKey.trim();
      chrome.storage.local.set({ [key]: tabsData }).then(() => {
        console.log("session has been updated");
      });
      svg.classList.add("blink");
      setTimeout(() => {
        svg.classList.remove("blink");
      }, 700);
    });
  });

  element.insertBefore(svg, element.firstChild);
};

// Create a svg button for delete, append it to its box and display it.
const createSVGDelete = () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "48");
  svg.setAttribute("height", "48");
  svg.setAttribute("viewBox", "0 0 48 48");

  // Create path elements and set their attributes
  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("fill", "#f44336");
  path1.setAttribute(
    "d",
    "M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"
  );

  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute("fill", "#fff");
  path2.setAttribute(
    "d",
    "M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"
  );

  const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path3.setAttribute("fill", "#fff");
  path3.setAttribute(
    "d",
    "M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"
  );

  // Append path elements to the SVG element
  svg.appendChild(path1);
  svg.appendChild(path2);
  svg.appendChild(path3);

  svg.setAttribute("class", "svgDelete");
  svg.setAttribute("id", `svgDelete${idIncrement}`);

  return svg;
};

// Create a svg button for adding current tab, append it to its session's box and display it.
const createSVGAdd = (element) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("x", "0px");
  svg.setAttribute("y", "0px");
  svg.setAttribute("width", "48");
  svg.setAttribute("height", "48");
  svg.setAttribute("viewBox", "0 0 512 512");

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute("fill", "#32BEA6");
  pathElement.setAttribute(
    "d",
    "M7.9,256C7.9,119,119,7.9,256,7.9C393,7.9,504.1,119,504.1,256c0,137-111.1,248.1-248.1,248.1C119,504.1,7.9,393,7.9,256z"
  );

  svg.setAttribute("class", "svgAdd");
  svg.setAttribute("id", `svgAdd${idIncrement}`);

  svg.addEventListener("click", (event) => {
    event.stopPropagation();
    addTabToSession(svg.id);
    refreshNumOfTabs(event);
    svg.classList.add("blink");
    setTimeout(() => {
      svg.classList.remove("blink");
    }, 700);
  });

  element.insertBefore(svg, element.firstChild);
};

// Global variable used for both display functions.
let idIncrement = 1;

// Display the sessions already created when the popup is clicked on.
export const displaySession = (sessions) => {
  console.log("SESSIONS :", sessions);
  sessions.forEach((session) => {
    const box = document.createElement("div");
    box.id = `box${idIncrement}`;
    box.className = "box";
    const boxTabs = session[1];
    box.addEventListener("click", () => {
      chrome.windows.create({ focused: true }, (window) => {
        boxTabs.forEach((info) => {
          chrome.tabs.create({ url: `${info.url}`, windowId: window.id });
        });
      });
    });

    const scroll = document.getElementById("scroll");
    scroll.insertBefore(box, scroll.firstChild);

    const tabName = session[0];
    const thisSession = document.createElement("div");
    thisSession.id = `session${idIncrement}`;
    // modify innerHTML with tabs number
    thisSession.innerHTML = `${tabName}`;
    thisSession.className = "session";
    box.insertBefore(thisSession, box.firstChild);

    // calculate number of tabs for each session

    const numOfTabs = document.createElement("div");
    numOfTabs.id = `numOfTab${idIncrement}`;
    numOfTabs.innerHTML = `  |  ${boxTabs.length} tabs`;
    numOfTabs.className = "numTabs";
    box.insertBefore(numOfTabs, box.firstChild);

    createSVGAdd(box);

    // Create svg, add event listener on it and display it.
    const svgDelete = createSVGDelete();
    svgDelete.addEventListener("click", (event) => {
      event.stopPropagation();
      removeSession(svgDelete.id);
    });
    box.insertBefore(svgDelete, box.firstChild);

    createSVGUpdate(box);

    idIncrement += 1;
  });
};

/* Display the newly created session.
nb. : had to make a separate function because the parameters/type of data where different.
*/
export const displayNewSession = (name, tabs) => {
  const box = document.createElement("div");
  box.id = `box${idIncrement}`;
  box.className = "box";
  box.addEventListener("click", () => {
    chrome.windows.create({ focused: true }, (window) => {
      chrome.tabs.create({ url: `${tabs.url}`, windowId: window.id });
    });
  });

  const scroll = document.getElementById("scroll");
  scroll.insertBefore(box, scroll.firstChild);

  const thisSession = document.createElement("div");
  thisSession.id = `session${idIncrement}`;
  thisSession.innerHTML = `${name}`;
  thisSession.className = "session";
  box.insertBefore(thisSession, box.firstChild);

  const numOfTabs = document.createElement("div");
  numOfTabs.id = `numOfTab${idIncrement}`;
  numOfTabs.innerHTML = `  |  ${tabs.length} tabs`;
  numOfTabs.className = "numTabs";
  box.insertBefore(numOfTabs, box.firstChild);

  createSVGAdd(box);

  // Create svg, add event listener on it and display it.
  const svgDelete = createSVGDelete();
  svgDelete.addEventListener("click", (event) => {
    event.stopPropagation();
    removeSession(svgDelete.id);
  });
  box.insertBefore(svgDelete, box.firstChild);

  createSVGUpdate(box);

  idIncrement += 1;
};
