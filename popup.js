import { getTabs } from "./functions.js";
import { saveSession } from "./functions.js";
import { displaySession } from "./functions.js";
import { getFavicon } from "./functions.js";
import { displayNewSession } from "./functions.js";

// Display current active tab title and favicon.
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  document.getElementById("currentTab").innerText = tab.title;
  getFavicon(tab.url);
});

// Display all sessions at the opening of the popup.
chrome.storage.local.get(null, (result) => {
  const arraySessions = Object.entries(result);
  displaySession(arraySessions);
});

// A click on the bin symbol delete all the saved sessions and update the display accordingly.
document.getElementById("bin").addEventListener("click", () => {
  chrome.storage.local.clear(() => {
    console.log("All sessions have been deleted from local storage");
    const htmlSessions = document.getElementsByClassName("box");
    const htmlSessionsArray = Array.from(htmlSessions);
    htmlSessionsArray.forEach((element) => {
      element.remove();
    });
  });
});

/* A click on the "save session" button open a popup where user enter a session's name. 
This session is link to all tabs of current active window, click sensitive, saved to locale
and then display.
*/
document.getElementById("save").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "flex";
  const inputBar = document.getElementById("userInput");
  inputBar.focus();
  document.getElementById("saveLocal").addEventListener("click", () => {
    const sessionName = document.getElementById("userInput").value;
    if (sessionName.length > 0) {
      getTabs((tabsData) => {
        console.log(sessionName);
        saveSession(sessionName, tabsData);
        console.log("tabsData :", tabsData);
        displayNewSession(sessionName, tabsData);
        document.getElementById("overlay").style.display = "none";
        userInput.value = "";
      });
    } else {
      document.getElementById("overlay").style.display = "none";
    }
  });
});

// Make the "save session" button sensitive to 'Enter' key-press.
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const save = document.getElementById("saveLocal");
    save.click();
  }
});
