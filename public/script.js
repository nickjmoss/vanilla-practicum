// DONE: Wire up the app's behavior here.
// NOTE: The TODOs are listed in index.html
function createUUID() {
  return 'xxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM objects on DOMContent Load
  const courseList = document.getElementById('course');
  const addLogButton = document.getElementById('addLog');
  const logsList = document.getElementById('logsList');
  const idInput = document.getElementById('uvuId');
  const idDisplay = document.getElementById('uvuIdDisplay');
  const logForm = document.getElementById('logForm');
  const logText = document.getElementById('logText');

  const getLogs = async function () {
    // Regex to verify that the ID inputed is an 8-digit number
    const regex = new RegExp('^[0-9]{8}$');
    if (regex.test(idInput.value)) {
      logsList.innerHTML = '';
      // Fetch raw data
      const rawData = await fetch(
        `https://nickjmoss-vanilla-practicum-ggnfppka--3000.local.webcontainer.io/logs?courseId=${courseList.value}&uvuId=${idInput.value}`
      );

      if (rawData.status == 200 || rawData.status == 304) {
        // Get data as JSON
        const data = await rawData.json();

        idDisplay.innerHTML = `Logs for Student ${idInput.value}`;

        // Loop through all logs and add them to the DOM
        data.forEach((log) => {
          const item = document.createElement('li');

          // When a log message is clicked, display the date and time of the log
          item.addEventListener('click', (e) => {
            const child = item.children[1];
            if (child.classList.contains('hide')) {
              child.classList.remove('hide');
            } else {
              child.classList.add('hide');
            }
          });

          const html = `
            <div><small>${log.date}</small></div>
            <pre class="hide"><p>${log.text}</p></pre>
          `;

          item.innerHTML = html;
          logsList.append(item);
        });

        addLogButton.disabled = false;
      }
    } else {
      reset();
      idDisplay.innerHTML = 'Please input a valid UVU ID';
    }
  };

  // Reset all of the DOM objects that need to be set to blank
  const reset = function () {
    logsList.innerHTML = '';
    addLogButton.disabled = true;
    idDisplay.innerHTML = '';
  };

  // Function to run when an option is selected in the course dropdown
  courseList.addEventListener('change', (e) => {
    if (e.target.value != '') {
      reset();
      idInput.classList.remove('hide');
      idInput.value = '';
    } else {
      reset();
      idInput.classList.add('hide');
      idInput.value = '';
    }
  });

  // Function to run when the user types in the UVU ID input
  idInput.addEventListener('keyup', getLogs);

  logForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const reqBody = Object.values(form).reduce((obj, field) => {
      if (field.name) {
        obj[field.name] = field.value;
      }
      return obj;
    }, {});

    reqBody.date = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    reqBody.id = createUUID();

    const rawResponse = await fetch(
      'https://nickjmoss-vanilla-practicum-ggnfppka--3000.local.webcontainer.io/api/v1/logs',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
      }
    );

    const response = await rawResponse.json();

    getLogs();

    logText.value = '';
  });

  // Fetch the course options on startup
  const fetchOptions = async function () {
    const rawData = await fetch(
      'https://nickjmoss-vanilla-practicum-ggnfppka--3000.local.webcontainer.io/api/v1/courses'
    );

    const data = await rawData.json();

    // Loop through course options and add options to the select
    data.forEach((option) => {
      const input = document.createElement('option');
      input.value = option.id;
      input.innerHTML = option.display;

      courseList.append(input);
    });
  };

  fetchOptions();
});
